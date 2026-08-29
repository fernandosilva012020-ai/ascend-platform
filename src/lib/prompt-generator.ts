import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { promptCategories, aiTargets, type PromptLevel } from "@/data/promptStudio";

// Modelo Gemini configurável server-side
const GEMINI_MODEL = "gemini-3.6-flash";

// Schema de validação dos dados de entrada
const GeneratePromptInputSchema = z.object({
  categoryId: z.string(),
  idea: z.string().min(1, "A ideia é obrigatória"),
  values: z.record(z.string()),
  aiId: z.string(),
  level: z.enum(["rapido", "profissional", "ultra"]),
});

type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;

// Função para construir o system prompt baseado na categoria, IA de destino e nível
function buildSystemPrompt(input: GeneratePromptInput): string {
  const category = promptCategories.find((c) => c.id === input.categoryId);
  const ai = aiTargets.find((a) => a.id === input.aiId);

  const categoryName = category?.name || "conteúdo";
  const aiName = ai?.name || "IA";

  const levelInstructions: Record<PromptLevel, string> = {
    rapido: "Gere um prompt curto, direto e objetivo. Vá direto ao ponto.",
    profissional:
      "Gere um prompt bem estruturado, detalhado e pronto para uso profissional. Inclua contexto, parâmetros técnicos, estilo, formato e restrições relevantes.",
    ultra:
      "Gere um prompt extremamente completo, técnico e otimizado. Inclua: contexto completo, direção de arte detalhada, referências visuais/estilísticas, parâmetros técnicos precisos, restrições, variações alternativas e checklist final de qualidade.",
  };

  const categorySpecificInstructions = getCategorySpecificInstructions(input.categoryId);

  return `Você é um especialista profissional em engenharia de prompts.

Sua tarefa: gerar APENAS o prompt final que o usuário deve copiar e colar na ${aiName}.

Categoria: ${categoryName}
IA de destino: ${aiName}
Nível de detalhamento: ${input.level}

${levelInstructions[input.level]}

${categorySpecificInstructions}

REGRAS OBRIGATÓRIAS:
- Retorne SOMENTE o prompt final, sem explicações, introduções ou comentários.
- Não responda como assistente. Não diga "Aqui está o prompt:" ou similar.
- O texto deve estar pronto para copiar e usar diretamente na ${aiName}.
- Adapte a estrutura e terminologia para a ${aiName} escolhida.
- Seja preciso, técnico e profissional.`;
}

function getCategorySpecificInstructions(categoryId: string): string {
  switch (categoryId) {
    case "video":
      return `Para prompts de VÍDEO, considere quando disponível:
- objetivo do vídeo
- personagem/persona
- cenário/ambientação
- ação principal
- estilo visual
- iluminação
- movimento de câmera
- enquadramento
- duração
- proporção/aspect ratio
- diálogo/narração
- elementos que NÃO devem aparecer (negative prompt)`;

    case "imagem":
    case "foto":
    case "personagem":
      return `Para prompts de IMAGEM, considere quando disponível:
- assunto principal
- cenário/ambientação
- estilo artístico/visual
- iluminação
- câmera/lente
- enquadramento
- paleta de cores
- proporção/aspect ratio
- qualidade/resolução
- negative prompt (o que evitar)`;

    case "anuncio":
    case "social":
    case "vendas":
    case "produto":
    case "negocios":
      return `Para prompts de MARKETING/VENDAS, considere quando disponível:
- produto ou serviço
- público-alvo
- objetivo da campanha
- benefício principal
- problema resolvido
- oferta
- preço
- tom de voz
- chamada para ação (CTA)
- plataforma de veiculação`;

    default:
      return "";
  }
}

// Função para construir o user prompt com os dados do usuário
function buildUserPrompt(input: GeneratePromptInput): string {
  const category = promptCategories.find((c) => c.id === input.categoryId);
  if (!category) return input.idea;

  const filledFields = category.fields
    .map((field) => ({
      label: field.label,
      value: (input.values[field.key] ?? "").trim(),
    }))
    .filter((entry) => entry.value.length > 0);

  let prompt = `Ideia base: ${input.idea.trim()}\n\n`;

  if (filledFields.length > 0) {
    prompt += "Parâmetros preenchidos:\n";
    for (const entry of filledFields) {
      prompt += `- ${entry.label}: ${entry.value}\n`;
    }
    prompt += "\n";
  }

  prompt += "Gere o prompt final agora.";

  return prompt;
}

// Server function para gerar prompt com Gemini
export const generatePromptWithGemini = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    // Parse e validação dos dados
    const parsed = GeneratePromptInputSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("INVALID_INPUT");
    }
    const input = parsed.data;

    // Verificar se a API key está configurada
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = buildSystemPrompt(input);
      const userPrompt = buildUserPrompt(input);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      const generatedText = (response.text as string | undefined)?.trim();

      if (!generatedText) {
        throw new Error("EMPTY_RESPONSE");
      }

      return { prompt: generatedText };
    } catch (error) {
      console.error("Erro ao gerar prompt com Gemini:", error);

      // Tratar erros específicos
      if (error instanceof Error) {
        if (error.message.includes("API_KEY") || error.message.includes("API key")) {
          throw new Error("GEMINI_API_KEY_INVALID");
        }
        if (error.message.includes("MODEL") || error.message.includes("model")) {
          throw new Error("GEMINI_MODEL_UNAVAILABLE");
        }
        if (error.message.includes("QUOTA") || error.message.includes("quota")) {
          throw new Error("GEMINI_QUOTA_EXCEEDED");
        }
      }

      throw new Error("GEMINI_GENERATION_FAILED");
    }
  });