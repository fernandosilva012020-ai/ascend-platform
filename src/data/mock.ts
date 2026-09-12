/**
 * Dados fictícios usados apenas para a camada visual.
 * Substituir por chamadas reais quando o backend for conectado.
 */

export const currentUser = {
  name: "Fernando Silva",
  email: "fernando@projetox.com",
  initials: "FS",
  plan: "Plano Premium",
};

export type Metric = {
  id: string;
  label: string;
  value: string;
  change: number;
  hint: string;
};

export const metrics: Metric[] = [
  { id: "subs", label: "Assinantes Ativos", value: "1.284", change: 12.4, hint: "vs. mês anterior" },
  { id: "leads", label: "Leads", value: "3.972", change: 8.1, hint: "últimos 30 dias" },
  { id: "sales", label: "Vendas no Mês", value: "R$ 184.320", change: 21.7, hint: "meta: R$ 200 mil" },
  { id: "commission", label: "Comissão de Parceiros", value: "R$ 27.845", change: -3.2, hint: "ciclo atual" },
];

export const salesLast7Days = [
  { day: "Seg", vendas: 12400, leads: 210 },
  { day: "Ter", vendas: 15800, leads: 268 },
  { day: "Qua", vendas: 14200, leads: 240 },
  { day: "Qui", vendas: 19600, leads: 322 },
  { day: "Sex", vendas: 24800, leads: 398 },
  { day: "Sáb", vendas: 21300, leads: 341 },
  { day: "Dom", vendas: 26900, leads: 412 },
];

export type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "lead" | "page" | "commission" | "prompt" | "sale";
};

export const recentActivity: Activity[] = [
  { id: "1", title: "Novo lead recebido", description: "Mariana Costa — campanha Instagram Ads", time: "há 4 min", type: "lead" },
  { id: "2", title: "Landing page publicada", description: "Oferta Black — /oferta-black", time: "há 32 min", type: "page" },
  { id: "3", title: "Comissão registrada", description: "R$ 1.240,00 — indicação nível 2", time: "há 1 h", type: "commission" },
  { id: "4", title: "Prompt criado", description: "Copy para anúncios de reengajamento", time: "há 3 h", type: "prompt" },
  { id: "5", title: "Venda concluída", description: "Plano Premium anual — R$ 4.788,00", time: "há 5 h", type: "sale" },
];

export const partnerProgram = {
  networkSize: 342,
  directReferrals: 47,
  monthlyCommission: "R$ 27.845",
  currentLevel: "Nível Ouro",
  nextLevel: "Nível Platina",
  progressToNextLevel: 68,
};

export const notifications = [
  { id: "1", title: "3 novos leads aguardando contato", time: "há 6 min" },
  { id: "2", title: "Campanha “Reativação” finalizada", time: "há 2 h" },
  { id: "3", title: "Fatura do plano disponível", time: "ontem" },
];
