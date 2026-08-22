import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import {
  Users,
  UserPlus,
  Wallet,
  CreditCard,
  Sparkles,
  Globe,
  Megaphone,
  Bot,
  ArrowRight,
  TrendingUp,
  FileText,
  ShoppingBag,
  Network,
  type LucideIcon,
  Loader2,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { metrics, recentActivity, partnerProgram, currentUser as mockUser } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Projeto X" },
      {
        name: "description",
        content:
          "Painel Projeto X: acompanhe assinantes, leads, vendas e comissões de parceiros em um só lugar.",
      },
      { property: "og:title", content: "Dashboard — Projeto X" },
      {
        property: "og:description",
        content: "Acompanhe assinantes, leads, vendas e comissões da sua operação no Projeto X.",
      },
    ],
  }),
  component: Dashboard,
});

const metricIcons: Record<string, LucideIcon> = {
  subs: Users,
  leads: UserPlus,
  sales: ShoppingBag,
  commission: Wallet,
};

const quickActions = [
  { label: "Criar com IA", icon: Sparkles },
  { label: "Novo Lead", icon: UserPlus },
  { label: "Criar Landing Page", icon: Globe },
  { label: "Nova Campanha", icon: Megaphone },
  { label: "Gerar Prompt", icon: FileText },
];

const activityIcons = {
  lead: UserPlus,
  page: Globe,
  commission: CreditCard,
  prompt: Sparkles,
  sale: TrendingUp,
} as const;

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || mockUser.name;
  const displayPlan = user.user_metadata?.['plan'] || mockUser.plan;
  const firstName = displayName.split(" ")[0];


  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-blue-500 mb-6">
        <h2 className="text-xl font-bold mb-2">Diagnóstico da Conexão Supabase</h2>
        <p className="mb-4 font-semibold text-destructive">Agora que o Supabase externo foi conectado ao projeto, NÃO faça nenhuma alteração.</p>
        
        <div className="space-y-4 text-sm opacity-90">
          <p>Quero apenas confirmar qual Supabase o Projeto X V2 está usando neste momento.</p>
          
          <p className="mt-4 font-bold">Verifique:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Qual é o SUPABASE_URL atual utilizado pelo frontend.</li>
            <li>Qual é o project ref atual.</li>
            <li>Confirme se é exatamente: <strong>jddgebxqwmxngfitcftb</strong></li>
            <li>Verifique <code>src/integrations/supabase/client.ts</code> e informe se ele já aponta para esse projeto.</li>
            <li>Confirme se as rotas:
              <ul className="list-disc pl-5 mt-1">
                <li>/login</li>
                <li>/forgot-password</li>
                <li>/update-password</li>
              </ul>
              usam esse mesmo cliente Supabase.
            </li>
            <li>Confirme se <code>supabase.auth.getSession()</code> agora consulta o projeto <strong>jddgebxqwmxngfitcftb</strong>.</li>
            <li>Informe se ainda existe alguma referência ao backend anterior <strong>rkbxtymtjnlxd1awmscb</strong>.</li>
          </ol>
          
          <div className="pt-4 border-t border-blue-500/20">
            <p className="font-bold text-xs uppercase tracking-wider mb-2">Restrições:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Não alterar arquivos.</li>
              <li>Não migrar dados.</li>
              <li>Não criar tabelas.</li>
              <li>Não revelar chaves secretas.</li>
              <li>Apenas responder com o diagnóstico.</li>
            </ul>
          </div>
          
          <p className="font-bold mt-4 italic text-xs uppercase tracking-wider text-destructive">
            IMPORTANTE: Execute TODOS os detalhes desta tarefa com máxima precisão. Não ignore nada, não simplifique, implemente EXATAMENTE o que foi pedido.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Bom dia, {firstName} <span aria-hidden>👋</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja como está o desempenho do seu negócio hoje.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
          {displayPlan}
        </Badge>

      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.id} metric={m} icon={metricIcons[m.id] ?? Users} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-card min-w-0 p-5 lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">Visão geral de vendas</h3>
              <p className="truncate text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-1" /> Vendas
              </span>
            </div>
          </div>
          <div className="mt-4">
            <SalesChart />
          </div>
        </div>

        <div className="surface-card min-w-0 p-5">
          <h3 className="text-base font-semibold">Ações rápidas</h3>
          <p className="text-xs text-muted-foreground">Comece algo novo em segundos</p>
          <div className="mt-4 grid gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground group-hover:gradient-brand group-hover:text-primary-foreground">
                  <a.icon className="size-4" />
                </span>
                <span className="min-w-0 truncate">{a.label}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card relative overflow-hidden">
        <div className="gradient-brand absolute inset-0 opacity-[0.97]" />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 backdrop-blur">
              <Bot className="size-6 text-primary-foreground" />
            </span>
            <div className="min-w-0 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
                Funcionário IA
              </p>
              <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
                Seu assistente inteligente está pronto.
              </h3>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                Crie campanhas, responda clientes e encontre oportunidades para seu negócio.
              </p>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="w-full lg:w-auto">
            <Link to="/funcionario-ia">
              <Sparkles className="size-4" />
              Conversar com minha IA
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-card min-w-0 p-5 lg:col-span-2">
          <h3 className="text-base font-semibold">Atividade recente</h3>
          <p className="text-xs text-muted-foreground">O que aconteceu na sua operação</p>
          <ul className="mt-4 divide-y divide-border">
            {recentActivity.map((a) => {
              const Icon = activityIcons[a.type];
              return (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="surface-card min-w-0 p-5">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-primary" />
            <h3 className="text-base font-semibold">Programa de Parceiros</h3>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Minha rede</dt>
              <dd className="mt-1 font-display text-lg font-bold">{partnerProgram.networkSize}</dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Indicados diretos</dt>
              <dd className="mt-1 font-display text-lg font-bold">
                {partnerProgram.directReferrals}
              </dd>
            </div>
            <div className="col-span-2 rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Comissão do mês</dt>
              <dd className="mt-1 font-display text-lg font-bold text-primary">
                {partnerProgram.monthlyCommission}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Próximo nível: {partnerProgram.nextLevel}
              </span>
              <span className="font-medium">{partnerProgram.progressToNextLevel}%</span>
            </div>
            <Progress value={partnerProgram.progressToNextLevel} className="mt-2 h-2" />
          </div>
          <Button asChild variant="soft" className="mt-4 w-full">
            <Link to="/minha-rede">
              Ver minha rede
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}