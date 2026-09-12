import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Crown,
  Gift,
  Loader2,
  Share2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNetworkProgram } from "@/hooks/useNetworkProgram";
import { formatNetworkCurrency } from "@/lib/network";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — Projeto X" },
      { name: "description", content: "Programa de indicações e comissões." },
      { property: "og:title", content: "Parceiros — Projeto X" },
      { property: "og:description", content: "Programa de indicações e comissões." },
    ],
  }),
  component: Page,
});

function Page() {
  const { dashboard, loading, error, refresh } = useNetworkProgram();

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }

  if (error || !dashboard) {
    return <NetworkError message={error} onRetry={() => void refresh()} />;
  }

  const referralPath = `/convite/${dashboard.member.referralCode}`;
  const referralLink = typeof window === "undefined"
    ? `https://projeto-x-v2.lovable.app${referralPath}`
    : `${window.location.origin}${referralPath}`;
  const nextLevel = dashboard.levels.find((level) => level.depth > dashboard.member.currentDepth);
  const progress = nextLevel
    ? Math.min(100, Math.round((dashboard.networkSize / nextLevel.cumulativePositions) * 100))
    : 100;

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link de convite copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Programa de parceiros</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Cresça indicando o Projeto X</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Compartilhe seu convite sem limite. As duas primeiras posições ficam no seu tabuleiro e as próximas seguem o transbordamento automático.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-4 backdrop-blur">
            <div className="flex items-center gap-2"><Share2 className="size-4 text-primary" /><p className="text-sm font-semibold">Seu link de indicação</p></div>
            <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl border border-border bg-muted/40 p-2">
              <span className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{referralLink}</span>
              <Button type="button" size="sm" onClick={copyReferralLink}><Copy className="size-4" />Copiar</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Bônus direto de {formatNetworkCurrency(dashboard.settings.directBonus)} por assinatura inicial confirmada.</p>
          </div>
        </div>
      </section>

      {dashboard.subscriptionStatus !== "active" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div><p className="font-semibold">Assinatura aguardando ativação</p><p className="mt-1 text-muted-foreground">Seu link já existe, mas posições e comissões só serão liberadas após a confirmação do pagamento.</p></div>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Indicados diretos" value={dashboard.directReferrals.toLocaleString("pt-BR")} description="Assinaturas ativas pelo seu link" icon={UserPlus} />
        <MetricCard label="Pessoas na rede" value={dashboard.networkSize.toLocaleString("pt-BR")} description="Até dez níveis de profundidade" icon={Users} />
        <MetricCard label="Comissão no mês" value={formatNetworkCurrency(dashboard.monthlyCommission)} description={`Disponível: ${formatNetworkCurrency(dashboard.availableBalance)}`} icon={Wallet} />
        <MetricCard label="Tabuleiro atual" value={dashboard.member.currentRank} description={nextLevel ? `Próximo: ${nextLevel.name}` : "Nível máximo alcançado"} icon={Crown} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card>
          <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="font-display text-xl">Desempenho da parceria</CardTitle><p className="mt-1 text-sm text-muted-foreground">Dados registrados no Supabase.</p></div>
            <Badge variant="outline" className="w-fit">Dados reais</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border bg-muted/30 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-xs text-muted-foreground">Evolução para o próximo tabuleiro</p><p className="mt-1 font-display text-2xl font-bold">{nextLevel?.name ?? "Concluído"}</p></div>
                <span className="font-display text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-4 h-2.5" />
              {nextLevel ? <p className="mt-2 text-xs text-muted-foreground">{dashboard.networkSize} de {nextLevel.cumulativePositions} assinantes ativos</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PerformanceItem label="Ativos na rede" value={dashboard.networkSize.toLocaleString("pt-BR")} icon={Users} />
              <PerformanceItem label="Aguardando pagamento" value={dashboard.pendingMembers.toLocaleString("pt-BR")} icon={AlertCircle} />
              <PerformanceItem label="Diretos necessários" value={`${dashboard.directReferrals}/${dashboard.settings.requiredDirectReferrals}`} icon={UserPlus} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Gift className="size-5 text-primary" />Como avançar</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {["Compartilhe seu link pessoal.", "Mantenha dois indicados diretos ativos.", "Acompanhe o crescimento e o transbordamento."].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><span className="pt-1 text-muted-foreground">{step}</span></li>
              ))}
            </ol>
            <Button asChild className="mt-6 w-full"><Link to="/minha-rede">Ver minha rede<ArrowRight className="size-4" /></Link></Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle className="font-display text-xl">Comissões recentes</CardTitle><p className="text-sm text-muted-foreground">Somente pagamentos confirmados aparecem aqui.</p></CardHeader>
        <CardContent>
          {dashboard.recentCommissions.length ? (
            <div className="divide-y divide-border">
              {dashboard.recentCommissions.map((commission) => (
                <div key={commission.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CheckCircle2 className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{commission.description}</p><p className="truncate text-xs text-muted-foreground">{new Date(commission.createdAt).toLocaleDateString("pt-BR")} • {commission.status}</p></div>
                  <span className="shrink-0 text-sm font-semibold text-primary">{formatNetworkCurrency(commission.amount)}</span>
                </div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma comissão registrada ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return <Card className="mx-auto mt-12 max-w-xl"><CardContent className="p-8 text-center"><AlertCircle className="mx-auto size-10 text-destructive" /><h2 className="mt-4 font-display text-xl font-bold">Não foi possível carregar o programa</h2><p className="mt-2 text-sm text-muted-foreground">{message ?? "Confira se a migration foi executada no Supabase."}</p><Button className="mt-5" onClick={onRetry}>Tentar novamente</Button></CardContent></Card>;
}

function MetricCard({ label, value, description, icon: Icon }: { label: string; value: string; description: string; icon: typeof Wallet }) {
  return <Card><CardContent className="p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-2xl font-bold">{value}</p><p className="mt-1 truncate text-xs text-muted-foreground">{description}</p></CardContent></Card>;
}

function PerformanceItem({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return <div className="rounded-2xl border border-border p-4"><Icon className="size-4 text-primary" /><p className="mt-3 font-display text-xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
