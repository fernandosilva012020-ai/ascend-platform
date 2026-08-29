import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/genai';

const model = new GoogleGenerativeAI(process.env['GEMINI_API_KEY']);

const funcionarioAISchema = z.object({
  roleId: z.enum([
    'vendas',
    'marketing',
    'copywriter',
    'social-media',
    'suporte',
    'estrategia'
  ]),
  message: z.string(),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })
  )
});

export const talkToFuncionarioAI = createServerFn({
  schema: funcionarioAISchema,
  handler: async ({ roleId, message, history }) => {
    try {
      // Validate API key
      if (!process.env['GEMINI_API_KEY']) {
        throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
      }

      // Get last 12 messages
      const context = history.slice(Math.max(0, history.length - 12));

      // Role-specific instructions
      const roleInstructions = {
        vendas: 'Abordagem, scripts, objeções, follow-up e conversão',
        marketing: 'Campanhas, ofertas, público, funis e crescimento',
        copywriter: 'Anúncios, headlines, CTAs, WhatsApp, páginas e roteiros',
        'social-media': 'Posts, legendas, conteúdo e redes sociais',
        suporte: 'Atendimento, dúvidas, reclamações e FAQs',
        estrategia: 'Planejamento, preços, crescimento, riscos e decisões'
      };

      // Format prompt
      const prompt = `Contexto:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

Instruções:
${roleInstructions[roleId]}

Pergunta:
${message}`;

      // Create model
      const modelInstance = model.getGenerativeModel({ model: 'gemini-3.6-flash' });

      // Generate response
      const response = await modelInstance.generateContent(prompt);
      return response.response.text();
    } catch (error: any) {
      if (error.code === 'invalid_api_key') {
        return 'GEMINI_API_KEY_INVALID';
      } else if (error.code === 'quota_exceeded') {
        return 'GEMINI_QUOTA_EXCEEDED';
      } else if (error.code === 'model_unavailable') {
        return 'GEMINI_MODEL_UNAVAILABLE';
      } else {
        return 'FUNCIONARIO_AI_FAILED';
      }
    }
  }
});
