import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'GOOGLE_API_KEY'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente ausente: ${key}. Configure o arquivo .env.`);
    process.exit(1);
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY ausente. O backend vai usar SUPABASE_KEY, mas a leitura de profiles e a gravação do QR podem ser bloqueadas pelo RLS.');
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseServiceKey);
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const MASTER_WHATSAPP = process.env.WHATSAPP_NUMERO_TESTE || '5519999609789';
const MASTER_USER_ID = process.env.MASTER_USER_ID || '';

function isPremiumProfile(profile) {
  return profile?.plano?.toLowerCase() === 'premium';
}

function isLiberado(profile, userId) {
  if (MASTER_USER_ID && userId === MASTER_USER_ID) return true;
  return isPremiumProfile(profile);
}

// Mapa para guardar todas as conexões ativas por usuário
const userSockets = new Map();

// Inicia um bot específico para um determinado usuário
async function startBotForUser(userId) {
  if (userSockets.has(userId)) {
    console.log(`ℹ️ Bot já está ativo para o usuário: ${userId}`);
    return;
  }

  console.log(`🚀 Iniciando WhatsApp para o usuário: ${userId}`);
  const authFolder = `auth_info_${userId}`;
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  userSockets.set(userId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`📱 QR Code gerado para o usuário ${userId}`);
      try {
        const qrImageDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 });
        const { error: upsertError } = await supabase
          .from('user_whatsapp_sessions')
          .upsert({
            user_id: userId,
            status: 'Aguardando leitura do QR Code',
            qr_code: qrImageDataUrl,
            updated_at: new Date().toISOString()
          });
        
        if (upsertError) {
          console.error(`❌ Erro ao salvar QR Code no Supabase para ${userId}:`, upsertError.message);
        } else {
          console.log(`✅ QR Code salvo no banco para o usuário ${userId}`);
        }
      } catch (err) {
        console.error('Erro ao processar imagem do QR Code:', err);
      }
    }

    if (connection === 'open') {
      console.log(`🤖 WhatsApp conectado para o usuário: ${userId}`);
      const { error: openError } = await supabase
        .from('user_whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'Conectado',
          qr_code: '',
          updated_at: new Date().toISOString()
        });
      
      if (openError) console.error(`❌ Erro ao atualizar status 'Conectado' para ${userId}:`, openError.message);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Conexão encerrada para ${userId} (Código: ${statusCode})`);
      
      // Se for código 408 (Timeout) ou qualquer desconexão inesperada, remove do mapa para permitir nova tentativa
      userSockets.delete(userId);
      
      // Reconecta automaticamente após 5 segundos
      setTimeout(() => startBotForUser(userId), 5000);
      
      await supabase
        .from('user_whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'Desconectado',
          updated_at: new Date().toISOString()
        });
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const remoteJid = m.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) return;

    const textoMensagem = m.message.conversation || m.message.extendedTextMessage?.text;
    if (!textoMensagem) return;

    console.log(`📩 Mensagem recebida no bot do usuário ${userId}: "${textoMensagem}"`);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Você é um assistente comercial inteligente. Seja direto e prestativo.\n\nCliente: ${textoMensagem}`,
      });

      await sock.sendMessage(remoteJid, { text: response.text });
      console.log(`🤖 Resposta enviada com sucesso pelo bot de ${userId}!`);
    } catch (error) {
      console.error(`❌ Erro IA (${userId}):`, error.message || error);
    }
  });
}

// Rota para o front-end solicitar o início da sessão do usuário
app.post('/api/start-session', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId obrigatório' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error(`❌ Erro ao ler profiles para ${userId}:`, profileError.message);
  }

  if (!isLiberado(profile, userId)) {
    return res.status(403).json({ error: 'Apenas assinantes Premium podem usar o WhatsApp Bot' });
  }

  // Garante linha de sessão para o polling do front não ficar preso
  await supabase.from('user_whatsapp_sessions').upsert({
    user_id: userId,
    status: 'Solicitado',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  startBotForUser(userId);
  res.json({ message: 'Sessão iniciada/verificada com sucesso' });
});

// Leitura via backend (bypassa RLS do front): front consulta aqui primeiro
app.get('/api/session/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('user_whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || { status: 'Desconectado', qr_code: '' });
});

// Inicialização: carrega bots de usuários Premium + MASTER_USER_ID + sessões pendentes
async function carregarSessoesExistentes() {
  console.log('🔍 Buscando usuários Premium para iniciar instâncias...');

  const autoStart = new Set();
  if (MASTER_USER_ID) autoStart.add(MASTER_USER_ID);

  const { data: premiumUsers, error } = await supabase
    .from('profiles')
    .select('id, plano')
    .ilike('plano', 'premium');

  if (error) {
    console.error('⚠️ Erro ao consultar usuários Premium:', error.message);
  } else if (premiumUsers) {
    for (const u of premiumUsers) autoStart.add(u.id);
  }

  const { data: pending } = await supabase
    .from('user_whatsapp_sessions')
    .select('user_id')
    .in('status', ['Solicitado', 'Aguardando leitura do QR Code', 'Conectado']);

  if (pending) for (const s of pending) autoStart.add(s.user_id);

  if (autoStart.size === 0) {
    console.log('ℹ️ Nenhum usuário para auto-iniciar no momento.');
    return;
  }

  console.log(`✨ Auto-iniciando ${autoStart.size} bot(s)...`);
  for (const uid of autoStart) startBotForUser(uid);
}

// Listener em tempo real: ativa o bot automaticamente assim que o usuário virar Premium ou atualizar
function monitorarNovasAssinaturas() {
  console.log('👀 Monitorando novas assinaturas e sessões em tempo real...');
  
  supabase
    .channel('realtime_profiles')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles' },
      async (payload) => {
        const updated = payload.new;
        if (updated?.plano?.toLowerCase() === 'premium') {
          console.log(`✨ Usuário ${updated.id} ativou/atualizou Premium! Iniciando bot automaticamente...`);
          startBotForUser(updated.id);
        }
      }
    )
    .subscribe();

  supabase
    .channel('realtime_sessions_req')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_whatsapp_sessions' },
      async (payload) => {
        const session = payload.new;
        if (session?.user_id && session?.status === 'Solicitado') {
          console.log(`🔔 Nova solicitação de bot para usuário ${session.user_id}`);
          startBotForUser(session.user_id);
        }
      }
    )
    .subscribe();
}

const server = app.listen(3000, () => {
  console.log('🚀 Servidor WhatsApp Multi-Usuário rodando em http://localhost:3000');
  carregarSessoesExistentes();
  monitorarNovasAssinaturas();
});
