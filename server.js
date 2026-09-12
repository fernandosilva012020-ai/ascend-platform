import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
import express from 'express';
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'GOOGLE_API_KEY'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente ausente: ${key}. Configure o arquivo .env.`);
    process.exit(1);
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
        await supabase
          .from('user_whatsapp_sessions')
          .upsert({
            user_id: userId,
            status: 'Aguardando leitura do QR Code',
            qr_code: qrImageDataUrl,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Erro ao salvar QR Code:', err);
      }
    }

    if (connection === 'open') {
      console.log(`🤖 WhatsApp conectado para o usuário: ${userId}`);
      await supabase
        .from('user_whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'Conectado',
          qr_code: '',
          updated_at: new Date().toISOString()
        });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Conexão encerrada para ${userId} (Código: ${statusCode})`);
      userSockets.delete(userId);
      await supabase
        .from('user_whatsapp_sessions')
        .upsert({
          user_id: userId,
          status: 'Desconectado',
          qr_code: '',
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

  // Verifica se o usuário tem assinatura Premium ativa
  const { data: profile } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.plano?.toLowerCase() !== 'premium') {
    return res.status(403).json({ error: 'Apenas assinantes Premium podem usar o WhatsApp Bot' });
  }

  startBotForUser(userId);
  res.json({ message: 'Sessão iniciada/verificada com sucesso' });
});

// Inicialização: carrega bots de usuários que já tinham sessão ativa
async function carregarSessoesExistentes() {
  const { data: sessoes } = await supabase
    .from('user_whatsapp_sessions')
    .select('user_id')
    .eq('status', 'Conectado');

  if (sessoes && sessoes.length > 0) {
    console.log(`🔄 Restaurando ${sessoes.length} sessões ativas...`);
    for (const s of sessoes) {
      startBotForUser(s.user_id);
    }
  }
}

export default app;

const server = app.listen(3000, () => {
  console.log('🚀 Servidor Multi-Usuário rodando em http://localhost:3000');
  carregarSessoesExistentes();
});
