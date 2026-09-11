import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  CircleDollarSign,
  Crown,
  Eye,
  Loader2,
  Network,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNetworkProgram } from "@/hooks/useNetworkProgram";
import {
  formatNetworkCurrency,
  getNetworkStatusLabel,
  type NetworkBranchPerson,
  type NetworkStatus,
} from "@/lib/network";

export const Route = createFileRoute("/minha-rede")({
  head: () => ({
    meta: [
      { title: "Minha Rede — Projeto X" },
      { name: "description", content: "Estrutura da sua rede de parceiros." },
      { property: "og:title", content: "Minha Rede — Projeto X" },
      { property: "og:description", content: "Estrutura da sua rede de parceiros." },
    ],
  }),
  component: Page,
});

type NetworkPosition = {
  id: string;
  name: string;
  initials: string;
  level: string;
  status: NetworkStatus;
  sponsor: string;
  team: number;
  joinedAt: string;
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function toPosition(person: NetworkBranchPerson, team = 0): NetworkPosition {
  return {
    id: person.userId,
    name: person.displayName,
    initials: initials(person.displayName),
    level: person.rank,
    status: person.status,
    sponsor: person.sponsorName,
    team,
    joinedAt: formatDate(person.joinedAt),
  };
}

function Page() {
  const { dashboard, branch, loading, branchLoading, error, refresh, openBranch } = useNetworkProgram();
  const [search, setSearch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<NetworkPosition | null>(null);
  const [branchHistory, setBranchHistory] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const members = dashboard?.members ?? [];
    if (!normalizedSearch) return members;
    return members.filter((member) =>
      `${member.displayName} ${member.rank} ${member.sponsorName}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedSearch),
    );
  }, [dashboard?.members, search]);

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }

  if (error || !dashboard || !branch) {
    return <Card className="mx-auto mt-12 max-w-xl"><CardContent className="p-8 text-center"><AlertCircle className="mx-auto size-10 text-destructive" /><h2 className="mt-4 font-display text-xl font-bold">Não foi possível carregar sua rede</h2><p className="mt-2 text-sm text-muted-foreground">{error ?? "Execute a migration da rede no Supabase."}</p><Button className="mt-5" onClick={() => void refresh()}>Tentar novamente</Button></CardContent></Card>;
  }

  const rootTeam = branch.root.userId === dashboard.member.userId
    ? dashboard.networkSize
    : dashboard.members.find((member) => member.userId === branch.root.userId)?.teamSize ?? 0;
  const rootPosition = toPosition(branch.root, rootTeam);
  const currentRootId = branch.root.userId;
  const childPositions: Array<NetworkPosition | null> = [
    branch.children[0] ? toPosition(branch.children[0], dashboard.members.find((member) => member.userId === branch.children[0]?.userId)?.teamSize ?? 0) : null,
    branch.children[1] ? toPosition(branch.children[1], dashboard.members.find((member) => member.userId === branch.children[1]?.userId)?.teamSize ?? 0) : null,
  ];
  const nextLevel = dashboard.levels.find((level) => level.depth > dashboard.member.currentDepth);
  const progress = nextLevel ? Math.min(100, Math.round((dashboard.networkSize / nextLevel.cumulativePositions) * 100)) : 100;

  async function viewBranch(position: NetworkPosition) {
    try {
      setBranchHistory((history) => [...history, currentRootId]);
      await openBranch(position.id);
      setSelectedPosition(null);
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : "Não foi possível abrir a ramificação.");
    }
  }

  async function goBack() {
    const previous = branchHistory.at(-1);
    if (!previous) return;
    try {
      await openBranch(previous);
      setBranchHistory((history) => history.slice(0, -1));
    } catch (caughtError) {
      toast.error(caughtError instanceof Error ? caughtError.message : "Não foi possível voltar.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><Badge variant="secondary" className="rounded-full px-3 py-1">Estrutura 1+2</Badge><h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Minha Rede</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Veja posições reais, abra ramificações e acompanhe o transbordamento da sua equipe.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><Button asChild variant="outline"><Link to="/parceiros"><UserPlus className="size-4" />Convidar parceiro</Link></Button><Button asChild><Link to="/tabuleiro">Ver carreira<ArrowRight className="size-4" /></Link></Button></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total na rede" value={dashboard.networkSize.toLocaleString("pt-BR")} detail="Assinantes ativos em até 10 níveis" icon={Users} />
        <SummaryCard label="Indicados diretos" value={dashboard.directReferrals.toLocaleString("pt-BR")} detail="Assinaturas ativas pelo seu link" icon={UserPlus} />
        <SummaryCard label="Aguardando pagamento" value={dashboard.pendingMembers.toLocaleString("pt-BR")} detail="Ainda não ocupam posição" icon={UserCheck} />
        <SummaryCard label="Comissão no mês" value={formatNetworkCurrency(dashboard.monthlyCommission)} detail="Direta, níveis e avanços" icon={CircleDollarSign} />
      </section>

      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="gap-4 border-b border-border bg-muted/20 lg:flex-row lg:items-center lg:justify-between">
          <div><CardTitle className="flex items-center gap-2 font-display text-xl"><Network className="size-5 text-primary" />Tabuleiro da Rede</CardTitle><p className="mt-1 text-sm text-muted-foreground">Clique em uma pessoa para abrir os detalhes ou navegar por sua ramificação.</p></div>
          <Badge variant="outline" className="w-fit">Dados reais</Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="board">
            <TabsList className="grid w-full grid-cols-2 sm:w-[360px]"><TabsTrigger value="board">Tabuleiro</TabsTrigger><TabsTrigger value="legend">Como funciona</TabsTrigger></TabsList>
            <TabsContent value="board" className="mt-5">
              <div className="rounded-3xl border border-border bg-gradient-to-b from-primary/5 via-background to-muted/30 p-4 sm:p-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Ramificação selecionada</p><p className="mt-1 font-display text-lg font-bold">{branch.root.displayName}</p></div>
                  <Button type="button" variant="outline" size="sm" disabled={!branchHistory.length || branchLoading} onClick={() => void goBack()}>{branchLoading ? <Loader2 className="size-4 animate-spin" /> : <ChevronLeft className="size-4" />}Voltar</Button>
                </div>
                <div className="mx-auto max-w-3xl overflow-x-auto pb-2">
                  <div className="min-w-[520px] space-y-8 px-2">
                    <div className="flex justify-center"><NetworkSeat position={rootPosition} onSelect={setSelectedPosition} emphasized /></div>
                    <div className="relative mx-auto h-px max-w-xs bg-border before:absolute before:left-1/2 before:-top-8 before:h-8 before:w-px before:bg-border" />
                    <div className="mx-auto grid max-w-md grid-cols-2 gap-16">{childPositions.map((position, index) => <NetworkSeat key={position?.id ?? `empty-${index}`} position={position} onSelect={setSelectedPosition} />)}</div>
                  </div>
                </div>
                <div className="mt-7 rounded-2xl border border-border bg-background/75 p-4">
                  <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Molduras por graduação</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-3">{careerFrameLegend.map((level) => <LevelLegend key={level} level={level} />)}</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="legend" className="mt-5"><div className="grid gap-4 md:grid-cols-3"><BoardHelp number="1" title="Duas posições" description="Cada líder possui somente duas posições diretas no tabuleiro." /><BoardHelp number="2" title="Transbordamento" description="Depois das duas vagas, novas assinaturas procuram a primeira posição livre da equipe." /><BoardHelp number="3" title="Pagamento confirmado" description="Cadastros só ocupam posição depois que a assinatura é confirmada." /></div></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card><CardHeader><CardTitle className="font-display text-xl">Progresso da rede</CardTitle></CardHeader><CardContentProgress progress={progress} current={dashboard.networkSize} target={nextLevel?.cumulativePositions} nextName={nextLevel?.name} /></Card>
        <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Crown className="size-5 text-primary" />Graduação atual</CardTitle></CardHeader><CardContent><p className="font-display text-3xl font-bold text-primary">{dashboard.member.currentRank}</p><p className="mt-2 text-sm text-muted-foreground">Disponível para saque: {formatNetworkCurrency(dashboard.availableBalance)}</p><Button asChild className="mt-5 w-full"><Link to="/tabuleiro">Acompanhar carreira<ArrowRight className="size-4" /></Link></Button></CardContent></Card>
      </section>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between"><div><CardTitle className="font-display text-xl">Parceiros da rede</CardTitle><p className="mt-1 text-sm text-muted-foreground">Dados essenciais da equipe, sem exposição de e-mail.</p></div><div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, graduação ou indicador..." className="pl-9" /></div></CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="hidden grid-cols-[minmax(180px,1.5fr)_1fr_110px_90px_110px] gap-4 bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Parceiro</span><span>Graduação</span><span>Status</span><span>Profundidade</span><span>Equipe</span></div>
            <div className="divide-y divide-border">{filteredMembers.map((member) => (
              <button type="button" key={member.userId} onClick={() => setSelectedPosition({ id: member.userId, name: member.displayName, initials: initials(member.displayName), level: member.rank, status: member.status, sponsor: member.sponsorName, team: member.teamSize, joinedAt: formatDate(member.joinedAt) })} className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-muted/30 md:grid-cols-[minmax(180px,1.5fr)_1fr_110px_90px_110px] md:items-center md:gap-4">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(member.displayName)}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{member.displayName}</p><p className="truncate text-xs text-muted-foreground">Indicado por {member.sponsorName}</p></div></div><p className="text-sm">{member.rank}</p><Badge variant={member.status === "active" ? "secondary" : "outline"} className="w-fit">{getNetworkStatusLabel(member.status)}</Badge><p className="text-sm">Nível {member.depth}</p><p className="text-sm font-medium">{member.teamSize}</p>
              </button>
            ))}</div>
            {!filteredMembers.length ? <div className="p-8 text-center text-sm text-muted-foreground">Nenhum parceiro encontrado.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedPosition !== null} onOpenChange={(open) => !open && setSelectedPosition(null)}>
        <DialogContent className="sm:max-w-md">{selectedPosition ? <><DialogHeader><div className="mb-2 flex items-center gap-3"><NetworkAvatar position={selectedPosition} large /><div className="min-w-0 text-left"><DialogTitle className="truncate">{selectedPosition.name}</DialogTitle><DialogDescription>{selectedPosition.level}</DialogDescription></div></div></DialogHeader><div className="grid grid-cols-2 gap-3"><PositionDetail label="Status" value={getNetworkStatusLabel(selectedPosition.status)} /><PositionDetail label="Equipe" value={`${selectedPosition.team} pessoas`} /><PositionDetail label="Indicador" value={selectedPosition.sponsor} /><PositionDetail label="Entrada" value={selectedPosition.joinedAt} /></div><DialogFooter className="sm:justify-between"><Button type="button" variant="outline" onClick={() => setSelectedPosition(null)}>Fechar</Button><Button type="button" onClick={() => void viewBranch(selectedPosition)}><Eye className="size-4" />Ver ramificação</Button></DialogFooter></> : null}</DialogContent>
      </Dialog>
    </div>
  );
}

function NetworkSeat({ position, onSelect, emphasized = false }: { position: NetworkPosition | null; onSelect: (position: NetworkPosition) => void; emphasized?: boolean }) {
  if (!position) return <div className="mx-auto flex w-28 flex-col items-center gap-2 text-center"><span className="grid size-16 place-items-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground"><Plus className="size-5" /></span><span className="text-[11px] font-medium text-muted-foreground">Vaga livre</span></div>;
  return <button type="button" className="group mx-auto flex w-28 flex-col items-center gap-2 text-center" onClick={() => onSelect(position)}><NetworkAvatar position={position} large={emphasized} /><span className="w-full truncate text-xs font-semibold group-hover:text-primary">{position.name}</span><span className="-mt-1 text-[10px] text-muted-foreground">{position.level}</span></button>;
}

function NetworkAvatar({ position, large = false }: { position: NetworkPosition; large?: boolean }) {
  const style = getLevelStyle(position.level);
  const dot = position.status === "active" ? "bg-emerald-500" : position.status === "pending_payment" || position.status === "past_due" ? "bg-amber-500" : "bg-slate-400";
  return <span className={["relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br p-[5px] shadow-lg ring-2 ring-offset-2 ring-offset-background transition group-hover:scale-105", large ? "size-20" : "size-16", style.frame].join(" ")}><span className={["grid size-full place-items-center rounded-full border-2 border-white/70 font-display font-bold shadow-inner dark:border-white/20", large ? "text-base" : "text-sm", style.center].join(" ")}>{position.initials}</span><span className={["absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-[3px] border-background shadow-sm", dot].join(" ")} /></span>;
}

const careerFrameLegend = ["Iniciante", "Bronze", "Prata", "Ouro", "Platina", "Safira", "Rubi", "Esmeralda", "Diamante", "Embaixador"];
const levelFrameStyles = {
  iniciante: { frame: "from-slate-300 via-slate-500 to-slate-700 ring-slate-400/35", center: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200" },
  bronze: { frame: "from-amber-800 via-orange-400 to-amber-950 ring-orange-500/35", center: "bg-amber-950 text-amber-100" },
  prata: { frame: "from-slate-300 via-white to-slate-500 ring-slate-300/50", center: "bg-slate-700 text-white" },
  ouro: { frame: "from-yellow-200 via-amber-500 to-yellow-800 ring-amber-400/45", center: "bg-amber-950 text-yellow-100" },
  platina: { frame: "from-slate-100 via-cyan-200 to-slate-500 ring-cyan-300/45", center: "bg-slate-800 text-cyan-100" },
  safira: { frame: "from-blue-300 via-blue-600 to-indigo-950 ring-blue-500/40", center: "bg-blue-950 text-blue-100" },
  rubi: { frame: "from-rose-300 via-red-600 to-rose-950 ring-rose-500/40", center: "bg-rose-950 text-rose-100" },
  esmeralda: { frame: "from-emerald-300 via-emerald-600 to-green-950 ring-emerald-500/40", center: "bg-emerald-950 text-emerald-100" },
  diamante: { frame: "from-cyan-100 via-sky-300 to-violet-500 ring-cyan-300/50", center: "bg-indigo-950 text-cyan-50" },
  embaixador: { frame: "from-violet-400 via-fuchsia-500 to-amber-400 ring-fuchsia-400/45", center: "bg-violet-950 text-white" },
};

function getLevelStyle(level: string) {
  const normalized = level.toLocaleLowerCase("pt-BR");
  const key = Object.keys(levelFrameStyles).find((name) => normalized.includes(name)) as keyof typeof levelFrameStyles | undefined;
  return levelFrameStyles[key ?? "iniciante"];
}

function LevelLegend({ level }: { level: string }) { const style = getLevelStyle(level); return <span className="flex items-center gap-2 text-xs text-muted-foreground"><span className={["grid size-5 place-items-center rounded-full bg-gradient-to-br p-[3px] ring-1", style.frame].join(" ")}><span className={["size-full rounded-full", style.center].join(" ")} /></span>{level}</span>; }
function BoardHelp({ number, title, description }: { number: string; title: string; description: string }) { return <div className="rounded-2xl border border-border bg-muted/20 p-5"><span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{number}</span><h3 className="mt-4 font-display font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>; }
function PositionDetail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-muted/25 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div>; }
function SummaryCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Users }) { return <Card><CardContent className="p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-display text-2xl font-bold">{value}</p><p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p></CardContent></Card>; }
function CardContentProgress({ progress, current, target, nextName }: { progress: number; current: number; target: number | undefined; nextName: string | undefined }) { return <CardContent><div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">Próximo: {nextName ?? "Concluído"}</span><span className="font-semibold text-primary">{progress}%</span></div><Progress value={progress} className="mt-3 h-2" />{target ? <p className="mt-2 text-xs text-muted-foreground">{current} de {target} pessoas ativas</p> : null}</div></CardContent>; }
