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

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'GOOGLE_API_KEY', 'WHATSAPP_NUMERO_TESTE'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente ausente: ${key}. Configure o arquivo .env (veja .env.example).`);
    process.exit(1);
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
    auth: state,
    printQRInTerminal: true,
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
    if (!m.message) return;
    if (m.key.fromMe) return;

    const remoteJid = m.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) return;

    const whatsappNumero = remoteJid.split('@')[0].split(':')[0];
    const textoMensagem = m.message.conversation || m.message.extendedTextMessage?.text;

    if (!textoMensagem) return;

    console.log(`📩 Mensagem de ${whatsappNumero}: "${textoMensagem}"`);

    const autorizado = whatsappNumero === MEU_NUMERO_DE_TESTE ? true : await verificarAssinaturaPremium(whatsappNumero);

    if (!autorizado) {
      await sock.sendMessage(remoteJid, { text: '❌ Sua assinatura está expirada. Ative seu plano para usar o agente.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Você é um assistente comercial do Projeto X. Seja direto e prestativo.\n\nCliente: ${textoMensagem}`,
      });
      const responseText = response.text;

      await sock.sendMessage(remoteJid, { text: responseText });
      console.log('🤖 Resposta enviada via Gemini!');
    } catch (error) {
      console.error('❌ Erro na IA (Gemini):', error.message || error);
      // Não enviamos mensagem de erro para o WhatsApp se falhar para evitar poluição/loops
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

// Rota para testar o chat diretamente com Gemini
app.get('/api/test-chat', async (req, res) => {
  try {
    const message = req.query.message || 'Olá';
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é um assistente comercial do Projeto X. Seja direto e prestativo.\n\nCliente: ${message}`,
    });
    res.json({ response: response.text });
  } catch (error) {
    console.error('Erro no teste Gemini:', error.message);
    res.status(500).json({ error: 'Erro ao chamar Gemini. Verifique a GOOGLE_API_KEY.' });
  }
});

export default app;

const server = app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
  startWhatsAppBot();
});