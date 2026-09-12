import 'dotenv/config';
import express from 'express';
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'OPENAI_API_KEY', 'WHATSAPP_NUMERO_TESTE'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente ausente: ${key}. Configure o arquivo .env (veja .env.example).`);
    process.exit(1);
  }
}

// Modo de teste: Se WHATSAPP_TEST_MODE=true, permite conexão sem QR Code inicial
const TEST_MODE = process.env.WHATSAPP_TEST_MODE === 'true';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MEU_NUMERO_DE_TESTE = process.env.WHATSAPP_NUMERO_TESTE;

let statusGlobal = 'Desconectado';
let qrGlobal = '';

async function atualizarStatusNoSupabase(status, qr) {
  statusGlobal = status;
  qrGlobal = qr || '';
  try {
    await supabase.from('bot_status').upsert({
      id: 1,
      status: status,
      qr_code: qr || '',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erro ao sincronizar status:', err.message);
  }
}

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    auth: TEST_MODE ? { client: state } : state,
    printQRInTerminal: !TEST_MODE,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📱 QR Code gerado!');
      try {
        const qrImageDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 });
        await atualizarStatusNoSupabase('Aguardando leitura do QR Code', qrImageDataUrl);
      } catch (err) {
        console.error('Erro ao gerar imagem do QR Code:', err.message);
        await atualizarStatusNoSupabase('Aguardando leitura do QR Code', '');
      }
    }

    if (connection === 'open') {
      console.log('🤖 Robô conectado com sucesso!');
      await atualizarStatusNoSupabase('Conectado', '');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Conexão fechada (Código: ${statusCode}). Reconectando...`);
      await atualizarStatusNoSupabase('Desconectado', '');
      setTimeout(startWhatsAppBot, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const remoteJid = m.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) return;

    const whatsappNumero = remoteJid.split('@')[0].split(':')[0];
    const textoMensagem = m.message.conversation || m.message.extendedTextMessage?.text;

    if (!textoMensagem) return;

    console.log(`📩 Mensagem de ${whatsappNumero}: "${textoMensagem}"`);

    const autorizado = whatsappNumero === MEU_NUMERO_DE_TESTE ? true : await verificarAssinaturaPremium(whatsappNumero);
    
    if (!autorizado) {
      await sock.sendMessage(remoteJid, { text: '❌ Sua assinatura está expirada.' });
      return;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente comercial do Projeto X. Seja direto e prestativo.' },
          { role: 'user', content: textoMensagem }
        ],
      });
      
      await sock.sendMessage(remoteJid, { text: completion.choices[0].message.content });
      console.log('🤖 Resposta enviada!');
    } catch (error) {
      console.error('Erro na IA:', error);
    }
  });
}

async function verificarAssinaturaPremium(whatsapp) {
  try {
    const { data: user } = await supabase.from('profiles').select('id').eq('whatsapp', whatsapp).single();
    if (!user) return false;

    const { data: sub } = await supabase.from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    return !!sub;
  } catch (e) {
    return false;
  }
}

// Rota para o painel web consultar o status do bot
app.get('/api/status', (req, res) => {
  res.json({ status: statusGlobal, qr: qrGlobal });
});

// Nova rota para testar a IA diretamente (sem WhatsApp)
app.get('/api/test-chat', async (req, res) => {
  try {
    const message = req.query.message || 'Olá, como posso ajudar?';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente comercial do Projeto X. Seja direto e prestativo.' },
        { role: 'user', content: message }
      ],
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Erro no teste de chat:', error);
    res.status(500).json({ error: 'Erro ao chamar IA' });
  }
});

export default app;

const server = app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
  startWhatsAppBot();
});