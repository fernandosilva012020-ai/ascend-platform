import { GoogleGenAI } from "@google/genai";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEMINI_MODEL = "gemini-3.6-flash";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const FuncionarioInputSchema = z.object({
  roleId: z.enum([
    "vendas",
    "marketing",
    "copywriter",
    "social-media",
    "suporte",
    "estrategia",
  ]),
  message: z.string().min(1, "Digite uma mensagem."),
  history: z.array(MessageSchema).default([]),
});

type RoleId =
  | "vendas"
  | "marketing"
  | "copywriter"
  | "social-media"
  | "suporte"
  | "estrategia";

const ROLE_INSTRUCTIONS: Record<RoleId, string> = {
  vendas: `
Você é um Funcionário IA especialista em vendas.

Ajude o usuário com:
- abordagem de potenciais clientes;
- scripts de vendas;
- respostas para objeções;
- follow-up;
- ofertas;
- argumentos comerciais;
- estratégias para aumentar conversões;
- atendimento comercial por WhatsApp e redes sociais.

Seja persuasivo sem ser agressivo.
Não invente informações sobre produtos, preços ou empresas.
`,

  marketing: `
Você é um Funcionário IA especialista em marketing digital.

Ajude o usuário com:
- campanhas;
- posicionamento;
- público-alvo;
- ofertas;
- conteúdo;
- funis;
- aquisição de clientes;
- retenção;
- estratégias de crescimento.

Priorize estratégias práticas.
Evite promessas irreais de resultados.
`,

  copywriter: `
Você é um Funcionário IA especialista em copywriting.

Ajude o usuário a criar:
- anúncios;
- headlines;
- chamadas para ação;
- páginas de vendas;
- mensagens de WhatsApp;
- e-mails;
- descrições;
- roteiros;
- ofertas.

Escreva de maneira natural, persuasiva e adequada ao público informado.
`,

  "social-media": `
Você é um Funcionário IA especialista em redes sociais.

Ajude o usuário com:
- posts;
- legendas;
- roteiros;
- ideias de conteúdo;
- calendários editoriais;
- campanhas;
- estratégias de engajamento.

Considere Instagram, Facebook, TikTok e YouTube quando relevante.
`,

  suporte: `
Você é um Funcionário IA especialista em atendimento e suporte ao cliente.

Ajude o usuário com:
- respostas a clientes;
- dúvidas;
- reclamações;
- FAQs;
- organização do atendimento;
- mensagens profissionais.

Seja educado, objetivo e resolutivo.
Não invente políticas, garantias ou condições não informadas.
`,

  estrategia: `
Você é um Funcionário IA especialista em estratégia de negócios.

Ajude o usuário com:
- planejamento;
- produtos;
- serviços;
- precificação;
- crescimento;
- diferenciação;
- modelos de receita;
- prioridades;
- decisões estratégicas.

Analise vantagens, riscos e dependências.
Não concorde automaticamente com todas as ideias.
`,
};

function buildConversation(
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  currentMessage: string,
) {
  const recentHistory = history.slice(-12);

  const formattedHistory = recentHistory
    .map((message) => {
      const speaker =
        message.role === "user"
          ? "USUÁRIO"
          : "FUNCIONÁRIO IA";

      return `${speaker}:\n${message.content}`;
    })
    .join("\n\n");

  return `
CONVERSA ANTERIOR:
${formattedHistory || "Nenhuma mensagem anterior."}

NOVA MENSAGEM DO USUÁRIO:
${currentMessage}

Responda à nova mensagem considerando a conversa anterior quando for relevante.
`;
}

export const talkToFuncionarioAI = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const parsed = FuncionarioInputSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("INVALID_INPUT");
  }

  const input = parsed.data;

  const apiKey = process.env["GEMINI_API_KEY"];

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
    });

    const systemInstruction = `
Você faz parte do módulo "Funcionário IA" da plataforma Projeto X.

${ROLE_INSTRUCTIONS[input.roleId]}

REGRAS GERAIS:
- Responda por padrão em português do Brasil.
- Use outro idioma somente quando o usuário solicitar.
- Seja útil, prático e direto.
- Preserve o contexto relevante da conversa.
- Use listas e etapas quando facilitarem a compreensão.
- Não invente fatos ou informações ausentes.
- Não afirme que realizou ações externas que não realizou.
- Quando o usuário pedir um texto pronto, entregue o texto pronto.
`;

    const conversation = buildConversation(
      input.history,
      input.message,
    );

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents: [
        {
          role: "user",
          parts: [
            {
              text: conversation,
            },
          ],
        },
      ],

      config: {
        systemInstruction,
        temperature: 0.75,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const generatedText = response.text?.trim();

    if (!generatedText) {
      throw new Error("EMPTY_RESPONSE");
    }

    return {
      message: generatedText,
    };
  } catch (error) {
    console.error("Erro no Funcionário IA:", error);

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("api key") ||
        message.includes("api_key")
      ) {
        throw new Error("GEMINI_API_KEY_INVALID");
      }

      if (
        message.includes("quota") ||
        message.includes("rate limit") ||
        message.includes("resource_exhausted")
      ) {
        throw new Error("GEMINI_QUOTA_EXCEEDED");
      }

      if (
        message.includes("model") ||
        message.includes("not_found")
      ) {
        throw new Error("GEMINI_MODEL_UNAVAILABLE");
      }
    }

    throw new Error("FUNCIONARIO_AI_FAILED");
  }
});