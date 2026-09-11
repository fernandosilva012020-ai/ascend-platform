import express from 'express';
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient('https://jddgebxqwmxngfitcftb.supabase.co', 'sb_publishable_Cjh1IP0PWmozDUm8gH7jMQ_bpQ1u6tu');
const openai = new OpenAI({ apiKey: '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' });

const MEU_NUMERO_DE_TESTE = '5519999609789';

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
      await atualizarStatusNoSupabase('Aguardando leitura do QR Code', qr);
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

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
  startWhatsAppBot();
});