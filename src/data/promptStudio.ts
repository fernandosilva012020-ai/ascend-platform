export type FieldType = "text" | "textarea" | "select";

export type PromptField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
};

export type PromptCategory = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  fields: PromptField[];
};

const t = (key: string, label: string, placeholder?: string): PromptField => ({
  key,
  label,
  type: "text",
  ...(placeholder ? { placeholder } : {}),
});

const ta = (key: string, label: string, placeholder?: string): PromptField => ({
  key,
  label,
  type: "textarea",
  ...(placeholder ? { placeholder } : {}),
});

const sel = (key: string, label: string, options: string[]): PromptField => ({
  key,
  label,
  type: "select",
  options,
});

const QUALITY = [
  "Realista",
  "Cinematográfico",
  "Publicidade",
  "Documental",
  "Anime",
  "3D",
  "Minimalista",
];

const FORMATS = ["9:16 Vertical", "16:9 Horizontal", "1:1 Quadrado"];

export const promptCategories: PromptCategory[] = [
  {
    id: "video",
    emoji: "🎬",
    name: "Vídeo",
    description: "Roteiros e cenas para IA de vídeo.",
    fields: [
      t("objetivo", "Objetivo do vídeo", "Ex: apresentar o produto"),
      t("persona", "Personagem / persona", "Ex: chef experiente"),
      t("cenario", "Cenário", "Ex: cozinha industrial moderna"),
      t("estilo", "Estilo visual", "Ex: comercial premium"),
      t("iluminacao", "Iluminação", "Ex: luz quente lateral"),
      t("camera", "Movimento de câmera", "Ex: dolly in lento"),
      t("enquadramento", "Enquadramento", "Ex: close-up"),
      t("duracao", "Duração", "Ex: 15 segundos"),
      sel("formato", "Formato", FORMATS),
      sel("qualidade", "Qualidade", QUALITY),
      ta("dialogo", "Diálogo ou narração", "Texto falado na cena"),
      ta("negativo", "O que NÃO deve aparecer", "Ex: texto, logos, deformações"),
    ],
  },
  {
    id: "imagem",
    emoji: "🎨",
    name: "Imagem",
    description: "Prompts visuais detalhados.",
    fields: [
      t("assunto", "Assunto principal", "Ex: hambúrguer artesanal"),
      t("cenario", "Cenário", "Ex: mesa de madeira rústica"),
      t("estilo", "Estilo", "Ex: food photography"),
      t("iluminacao", "Iluminação", "Ex: luz natural suave"),
      t("camera", "Câmera", "Ex: 50mm f/1.8"),
      t("enquadramento", "Enquadramento", "Ex: plano detalhe"),
      t("cores", "Cores", "Ex: tons quentes e âmbar"),
      sel("proporcao", "Proporção", FORMATS),
      sel("qualidade", "Qualidade", QUALITY),
      ta("negativo", "Negative prompt", "Ex: blur, marca d'água"),
    ],
  },
  {
    id: "anuncio",
    emoji: "📢",
    name: "Anúncio",
    description: "Campanhas que convertem.",
    fields: [
      t("produto", "Produto / serviço"),
      t("publico", "Público-alvo"),
      t("beneficio", "Principal benefício"),
      ta("problema", "Problema que resolve"),
      t("tom", "Tom da comunicação"),
      t("oferta", "Oferta"),
      t("preco", "Preço"),
      t("cta", "Chamada para ação"),
      sel("plataforma", "Plataforma", [
        "Meta Ads",
        "Google Ads",
        "TikTok Ads",
        "YouTube",
        "LinkedIn",
      ]),
    ],
  },
  {
    id: "social",
    emoji: "📱",
    name: "Redes Sociais",
    description: "Conteúdo pronto para postar.",
    fields: [
      sel("rede", "Rede social", ["Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook"]),
      t("objetivo", "Objetivo"),
      t("tema", "Tema"),
      t("publico", "Público"),
      sel("formato", "Formato", ["Reels", "Carrossel", "Post estático", "Stories", "Shorts"]),
      t("tom", "Tom"),
      t("cta", "CTA"),
      t("hashtags", "Hashtags"),
    ],
  },
  {
    id: "vendas",
    emoji: "💰",
    name: "Vendas",
    description: "Abordagens e copy comercial.",
    fields: [
      t("produto", "Produto"),
      t("cliente", "Cliente ideal"),
      t("objetivo", "Objetivo"),
      t("abordagem", "Abordagem"),
      ta("objecoes", "Objeções"),
      ta("beneficios", "Benefícios"),
      t("oferta", "Oferta"),
      t("cta", "CTA"),
      t("tom", "Tom de voz"),
    ],
  },
  {
    id: "produto",
    emoji: "🛍️",
    name: "Produto",
    description: "Descrições e fichas de produto.",
    fields: [
      t("produto", "Produto"),
      t("publico", "Público-alvo"),
      ta("beneficios", "Benefícios"),
      t("diferencial", "Diferencial"),
      t("tom", "Tom"),
      t("cta", "CTA"),
    ],
  },
  {
    id: "negocios",
    emoji: "🏢",
    name: "Negócios",
    description: "Estratégia, planos e análises.",
    fields: [
      t("empresa", "Empresa / segmento"),
      t("objetivo", "Objetivo"),
      t("publico", "Público"),
      ta("contexto", "Contexto atual"),
      t("entregavel", "Entregável esperado"),
      t("tom", "Tom"),
    ],
  },
  {
    id: "assistente",
    emoji: "🤖",
    name: "Assistente IA",
    description: "Instruções de sistema para agentes.",
    fields: [
      t("papel", "Papel do assistente"),
      t("objetivo", "Objetivo"),
      t("publico", "Público atendido"),
      ta("regras", "Regras e limites"),
      t("tom", "Tom de voz"),
      t("formato", "Formato da resposta"),
    ],
  },
  {
    id: "personagem",
    emoji: "🎭",
    name: "Personagem",
    description: "Criação consistente de personagens.",
    fields: [
      t("nome", "Nome / identidade"),
      t("aparencia", "Aparência"),
      t("roupa", "Vestuário"),
      t("personalidade", "Personalidade"),
      t("cenario", "Cenário"),
      sel("estilo", "Estilo", QUALITY),
      ta("negativo", "O que evitar"),
    ],
  },
  {
    id: "foto",
    emoji: "📸",
    name: "Foto Profissional",
    description: "Retratos e ensaios corporativos.",
    fields: [
      t("assunto", "Pessoa / assunto"),
      t("cenario", "Cenário"),
      t("iluminacao", "Iluminação"),
      t("camera", "Câmera e lente"),
      t("enquadramento", "Enquadramento"),
      t("vestuario", "Vestuário"),
      sel("proporcao", "Proporção", FORMATS),
      ta("negativo", "Negative prompt"),
    ],
  },
];

export type AiTarget = { id: string; name: string; emoji: string };

export const aiTargets: AiTarget[] = [
  { id: "chatgpt", name: "ChatGPT", emoji: "💬" },
  { id: "gemini", name: "Gemini", emoji: "✦" },
  { id: "claude", name: "Claude", emoji: "🧠" },
  { id: "midjourney", name: "Midjourney", emoji: "⛵" },
  { id: "dalle", name: "DALL·E", emoji: "🖌️" },
  { id: "sora", name: "Sora", emoji: "🎞️" },
  { id: "veo", name: "Veo", emoji: "🎥" },
  { id: "runway", name: "Runway", emoji: "🛫" },
  { id: "kling", name: "Kling", emoji: "🌀" },
  { id: "outra", name: "Outra IA", emoji: "✨" },
];

export type PromptLevel = "rapido" | "profissional" | "ultra";

export const promptLevels: { id: PromptLevel; emoji: string; name: string; description: string }[] =
  [
    { id: "rapido", emoji: "⚡", name: "Rápido", description: "Prompt curto e direto." },
    {
      id: "profissional",
      emoji: "✨",
      name: "Profissional",
      description: "Bem detalhado e estruturado.",
    },
    {
      id: "ultra",
      emoji: "🚀",
      name: "Ultra",
      description: "Prompt extremamente completo e otimizado.",
    },
  ];

export const promptTemplates = [
  { name: "Vídeo cinematográfico de produto", category: "Vídeo", pro: true },
  { name: "UGC para TikTok", category: "Redes Sociais", pro: false },
  { name: "Anúncio profissional", category: "Anúncio", pro: false },
  { name: "Foto de produto premium", category: "Imagem", pro: true },
  { name: "Avatar profissional", category: "Foto Profissional", pro: false },
  { name: "Landing Page", category: "Negócios", pro: true },
  { name: "Copy de vendas", category: "Vendas", pro: false },
  { name: "Roteiro para Reels", category: "Redes Sociais", pro: false },
];

export const promptHistory = [
  { title: "Vídeo promocional para hamburgueria", type: "Vídeo", date: "Hoje, 09:24", ai: "Veo" },
  { title: "Foto profissional de produto", type: "Imagem", date: "Ontem, 18:02", ai: "Midjourney" },
  { title: "Anúncio para Instagram", type: "Anúncio", date: "12 mai, 14:31", ai: "ChatGPT" },
  {
    title: "Abordagem comercial para WhatsApp",
    type: "Vendas",
    date: "10 mai, 08:15",
    ai: "Claude",
  },
];
