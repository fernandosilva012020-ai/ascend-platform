import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Crown,
  Gift,
  ListChecks,
  Loader2,
  Lock,
  Network,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useNetworkProgram } from "@/hooks/useNetworkProgram";
import { formatNetworkCurrency, type NetworkLevel } from "@/lib/network";

export const Route = createFileRoute("/tabuleiro")({
  head: () => ({
    meta: [
      { title: "Tabuleiro — Projeto X" },
      { name: "description", content: "Acompanhe sua evolução no plano de carreira." },
      { property: "og:title", content: "Tabuleiro — Projeto X" },
      { property: "og:description", content: "Acompanhe sua evolução no plano de carreira." },
    ],
  }),
  component: Page,
});

type CareerLevel = {
  depth: number;
  name: string;
  description: string;
  icon: LucideIcon;
  requiredPeople: number;
  newPositions: number;
  commissionPerMember: number;
  monthlyPotential: number;
  advancementBonus: number;
};

const levelIcons: LucideIcon[] = [
  Sparkles,
  UserPlus,
  Users,
  Trophy,
  Target,
  Network,
  Trophy,
  Crown,
  Crown,
  Crown,
  Crown,
];

const descriptions = [
  "Primeiros passos",
  "Rede em formação",
  "Crescimento constante",
  "Liderança em evolução",
  "Equipe estruturada",
  "Liderança de equipe",
  "Alta performance",
  "Rede consolidada",
  "Referência da comunidade",
  "Liderança máxima",
  "Décima profundidade completa",
];

function calculateMonthlyPotential(levels: NetworkLevel[], depth: number) {
  return levels
    .filter((level) => level.depth <= depth)
    .reduce(
      (total, level) => total + level.newPositions * level.commissionPerMember,
      0,
    );
}

function buildCareerLevels(levels: NetworkLevel[]): CareerLevel[] {
  return [
    {
      depth: 0,
      name: "Iniciante",
      description: descriptions[0]!,
      icon: levelIcons[0]!,
      requiredPeople: 0,
      newPositions: 0,
      commissionPerMember: 0,
      monthlyPotential: 0,
      advancementBonus: 0,
    },
    ...levels.map((level, index) => ({
      depth: level.depth,
      name: level.name,
      description: descriptions[index + 1] ?? "Nova conquista",
      icon: levelIcons[index + 1] ?? Crown,
      requiredPeople: level.cumulativePositions,
      newPositions: level.newPositions,
      commissionPerMember: level.commissionPerMember,
      monthlyPotential: calculateMonthlyPotential(levels, level.depth),
      advancementBonus: level.advancementBonus,
    })),
  ];
}

function Page() {
  const { dashboard, loading, error, refresh } = useNetworkProgram();
  const [selectedDepth, setSelectedDepth] = useState<number | null>(null);
  const [simulatedDepth, setSimulatedDepth] = useState<number | null>(null);

  const careerLevels = useMemo(
    () => buildCareerLevels(dashboard?.levels ?? []),
    [dashboard?.levels],
  );

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }

  if (error || !dashboard) {
    return <Card className="mx-auto mt-12 max-w-xl"><CardContent className="p-8 text-center"><AlertCircle className="mx-auto size-10 text-destructive" /><h2 className="mt-4 font-display text-xl font-bold">Não foi possível carregar o tabuleiro</h2><p className="mt-2 text-sm text-muted-foreground">{error ?? "Execute a migration da rede no Supabase."}</p><Button className="mt-5" onClick={() => void refresh()}>Tentar novamente</Button></CardContent></Card>;
  }

  const actualDepth = dashboard.member.currentDepth;
  const displayedDepth = simulatedDepth ?? actualDepth;
  const displayedLevel = careerLevels.find((level) => level.depth === displayedDepth) ?? careerLevels[0]!;
  const nextLevel = careerLevels.find((level) => level.depth === displayedDepth + 1);
  const actualNextLevel = careerLevels.find((level) => level.depth === actualDepth + 1);
  const selectedLevel = selectedDepth === null ? null : careerLevels.find((level) => level.depth === selectedDepth) ?? null;
  const DisplayedIcon = displayedLevel.icon;
  const SelectedIcon = selectedLevel?.icon ?? Trophy;
  const progress = actualNextLevel
    ? Math.min(100, Math.round((dashboard.networkSize / actualNextLevel.requiredPeople) * 100))
    : 100;
  const isSimulating = simulatedDepth !== null;

  function simulateLevel() {
    if (selectedDepth === null) return;
    setSimulatedDepth(selectedDepth);
    setSelectedDepth(null);
    toast.success("Simulação atualizada. Sua graduação real não foi alterada.");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary" className="rounded-full px-3 py-1">Plano 1+2 configurado</Badge>{isSimulating ? <Badge variant="outline">Simulação visual</Badge> : <Badge variant="outline">Dados reais</Badge>}</div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Seu caminho no tabuleiro</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Acompanhe pessoas necessárias, recorrência estimada e bônus único de cada avanço.</p>

            <div className="mt-6 max-w-2xl rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{isSimulating ? "Nível simulado" : "Nível atual"}</p><p className="mt-1 font-display text-2xl font-bold text-primary">{displayedLevel.name}</p></div><div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Próximo nível</p><p className="font-semibold">{nextLevel?.name ?? "Jornada completa"}</p></div></div>
              <div className="mt-4"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-muted-foreground">Progresso real</span><span className="font-semibold">{progress}%</span></div><Progress value={progress} className="h-2.5" />{actualNextLevel ? <p className="mt-2 text-xs text-muted-foreground">{dashboard.networkSize} de {actualNextLevel.requiredPeople} pessoas ativas para {actualNextLevel.name}</p> : null}{isSimulating ? <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setSimulatedDepth(null)}><RotateCcw className="size-4" />Voltar ao nível real</Button> : null}</div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl"><img src="/assets/tabuleiro-carreira.webp" alt="Personagens profissionais do plano de carreira" className="relative w-full drop-shadow-[0_22px_30px_rgba(79,70,229,0.22)]" /><div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-primary/25 bg-background/90 px-4 py-2 shadow-lg backdrop-blur"><DisplayedIcon className="size-4 text-primary" /><span className="text-xs font-semibold">Posição: {displayedLevel.name}</span></div></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Pessoas na rede" value={dashboard.networkSize.toLocaleString("pt-BR")} icon={Users} />
        <SummaryCard label="Indicados diretos" value={dashboard.directReferrals.toLocaleString("pt-BR")} icon={UserPlus} />
        <SummaryCard label="Comissão no mês" value={formatNetworkCurrency(dashboard.monthlyCommission)} icon={Wallet} />
      </section>

      <Card>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="font-display text-xl">Tabuleiro da carreira</CardTitle><p className="mt-1 text-sm text-muted-foreground">Clique em qualquer etapa para consultar os valores configurados.</p></div><Badge variant="outline" className="w-fit">R$25,00 para a rede por renovação</Badge></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {careerLevels.map((level) => {
              const completed = level.depth < actualDepth;
              const current = level.depth === actualDepth;
              const Icon = level.icon;
              return <button type="button" key={`${level.depth}-${level.name}`} onClick={() => setSelectedDepth(level.depth)} className={["relative min-h-52 overflow-hidden rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm", current ? "border-primary bg-primary/10 shadow-sm" : completed ? "border-primary/25 bg-primary/5" : "border-border bg-muted/30"].join(" ")}><div className="flex items-start justify-between gap-3"><span className={["grid size-10 place-items-center rounded-xl", current || completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"].join(" ")}><Icon className="size-5" /></span><span className="grid size-7 place-items-center rounded-full border border-border bg-background">{completed ? <Check className="size-4 text-primary" /> : current ? <Sparkles className="size-4 text-primary" /> : <Lock className="size-3.5 text-muted-foreground" />}</span></div><p className="mt-5 text-xs font-medium text-muted-foreground">{level.depth === 0 ? "Entrada" : `Tabuleiro ${String(level.depth).padStart(2, "0")}`}</p><h3 className="mt-1 font-display text-lg font-bold">{level.name}</h3><p className="mt-1 text-xs text-muted-foreground">{level.requiredPeople ? `${level.requiredPeople.toLocaleString("pt-BR")} pessoas` : "Cadastro criado"}</p><p className="mt-3 text-sm font-bold text-primary">{formatNetworkCurrency(level.monthlyPotential)}/mês</p></button>;
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Target className="size-5 text-primary" />{actualNextLevel ? `Próxima conquista: ${actualNextLevel.name}` : "Nível máximo alcançado"}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">Progresso da equipe</span><span className="font-semibold text-primary">{progress}%</span></div><Progress value={progress} className="mt-3 h-2" /></div><p className="text-sm leading-6 text-muted-foreground">Os valores são estimativas brutas. A recorrência depende das assinaturas continuarem ativas e pagas.</p></CardContent></Card>
        <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="font-display text-xl">Continue crescendo</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">Abra sua estrutura para acompanhar vagas e transbordamentos.</p><Button asChild className="mt-5 w-full"><Link to="/minha-rede">Ver minha rede<ArrowRight className="size-4" /></Link></Button></CardContent></Card>
      </section>

      <Dialog open={selectedLevel !== null} onOpenChange={(open) => !open && setSelectedDepth(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">{selectedLevel ? <><DialogHeader><div className="mb-2 flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><SelectedIcon className="size-6" /></span><div><Badge variant="secondary">{selectedLevel.depth === 0 ? "Entrada" : `Tabuleiro ${selectedLevel.depth}`}</Badge><DialogTitle className="mt-1 font-display text-2xl">{selectedLevel.name}</DialogTitle></div></div><DialogDescription>{selectedLevel.description}</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="size-4 text-primary" />Requisitos</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />Assinatura ativa e confirmada</li>{selectedLevel.depth > 0 ? <><li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />Dois indicados diretos ativos</li><li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{selectedLevel.requiredPeople.toLocaleString("pt-BR")} pessoas ativas abaixo</li></> : null}</ul></div><div className="rounded-2xl border border-border p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Wallet className="size-4 text-primary" />Valores</h3><dl className="mt-3 space-y-2 text-sm"><ValueRow label="Posições neste nível" value={selectedLevel.newPositions.toLocaleString("pt-BR")} /><ValueRow label="Por pessoa" value={formatNetworkCurrency(selectedLevel.commissionPerMember)} /><ValueRow label="Recorrência acumulada" value={formatNetworkCurrency(selectedLevel.monthlyPotential)} /></dl></div></div><div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Gift className="size-5" /></span><div><p className="text-xs text-muted-foreground">Bônus único deste avanço</p><p className="font-semibold">{formatNetworkCurrency(selectedLevel.advancementBonus)}</p></div></div></div><DialogFooter className="gap-2 sm:gap-0"><Button type="button" variant="outline" onClick={() => setSelectedDepth(null)}>Fechar</Button><Button type="button" onClick={simulateLevel}>Simular este nível</Button></DialogFooter></> : null}</DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) { return <Card><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-xl font-bold">{value}</p></div></CardContent></Card>; }
function ValueRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
