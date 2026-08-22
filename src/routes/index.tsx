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
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-8 mb-8 text-foreground shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-primary">Status da Integração Supabase</h2>
        
        <div className="space-y-6 text-sm leading-relaxed whitespace-pre-wrap">
          <p className="text-base font-medium">Agora foi confirmado pelo painel Cloud que o Lovable Cloud atual está vazio:</p>
          
          <ul className="list-disc pl-5 space-y-2 opacity-90">
            <li>Database: nenhuma tabela</li>
            <li>Users: 0 usuários</li>
            <li>Storage: 0 buckets</li>
          </ul>

          <p className="mt-4">Portanto, execute a transição do backend do Projeto X V2 para o Supabase externo já conectado.</p>
          
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="font-bold mb-1">Supabase definitivo:</p>
            <p className="font-mono text-primary text-base">project ref: jddgebxqwmxngfitcftb</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <p className="font-bold text-destructive uppercase tracking-wider text-xs">IMPORTANTE:</p>
            <ul className="list-disc pl-5 space-y-2 opacity-90">
              <li>Não migrar nada do Lovable Cloud, pois ele está vazio.</li>
              <li>Não apagar o design ou páginas existentes.</li>
              <li>Não recriar as tabelas extension_licenses e extension_license_devices.</li>
              <li>Não alterar as Edge Functions validate-license e xforge-admin.</li>
              <li>Não usar o Lovable Cloud para autenticação após a mudança.</li>
              <li>Não expor service_role.</li>
            </ul>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <p className="font-bold text-primary">Faça:</p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Configure o cliente frontend do Supabase para apontar para: <strong>jddgebxqwmxngfitcftb</strong></li>
              <li>Utilize a URL e a publishable/anon key do Supabase externo conectado.</li>
              <li>Remova do fluxo de autenticação a dependência do Lovable Cloud.</li>
              <li>Login, forgot-password, update-password e getSession devem utilizar exclusivamente o Supabase externo.</li>
              <li>/licencas-xforge deve utilizar a mesma sessão do Supabase externo.</li>
              <li>xforge-admin deve continuar sendo chamada no projeto: <strong>jddgebxqwmxngfitcftb</strong></li>
              <li>
                Verifique e atualize:
                <ul className="list-disc pl-5 mt-2 space-y-1 opacity-80">
                  <li>src/integrations/supabase/client.ts</li>
                  <li>client.server.ts, se existir</li>
                  <li>AuthProvider / auth middleware</li>
                  <li>login.tsx</li>
                  <li>forgot-password.tsx</li>
                  <li>update-password.tsx</li>
                  <li>licencas-xforge.tsx</li>
                </ul>
              </li>
              <li>Não criar um segundo cliente Supabase desnecessário.</li>
              <li>Não hardcode chaves secretas.</li>
            </ol>
          </div>

          <div className="space-y-3 pt-4 border-t border-border bg-primary/5 p-4 rounded-lg">
            <p className="font-bold">Depois da alteração, valide e informe:</p>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li>project ref usado pelo frontend;</li>
              <li>project ref usado pelo login;</li>
              <li>project ref usado em resetPasswordForEmail;</li>
              <li>project ref usado por getSession;</li>
              <li>se ainda existe alguma dependência ativa do Lovable Cloud para banco ou autenticação.</li>
            </ul>
          </div>
          
          <p className="font-bold text-destructive text-center pt-4 border-t border-border italic">
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