import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Plus,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Central de Marketing — Projeto X" },
      { name: "description", content: "Campanhas, disparos e automações." },
      { property: "og:title", content: "Central de Marketing — Projeto X" },
      { property: "og:description", content: "Campanhas, disparos e automações." },
    ],
  }),
  component: Page,
});

function Page() {
  function showDemoMessage() {
    toast.info("A criação será ativada quando o módulo for conectado ao Supabase.");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Central de campanhas</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Central de Marketing</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Planeje campanhas, acompanhe disparos e mantenha sua comunicação organizada.
            </p>
          </div>
          <Button onClick={showDemoMessage} size="lg">
            <Plus className="size-4" />
            Nova campanha
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Campanhas ativas", value: "6", detail: "+2 neste mês", icon: Megaphone },
          { label: "Contatos alcançados", value: "8.420", detail: "Últimos 30 dias", icon: Users },
          { label: "Taxa de abertura", value: "64,8%", detail: "+7,2% no período", icon: Eye },
          { label: "Taxa de conversão", value: "12,4%", detail: "1.044 conversões", icon: MousePointerClick },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <metric.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 font-display text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display text-xl">Campanhas recentes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Desempenho das comunicações em andamento.</p>
            </div>
            <Badge variant="outline" className="w-fit">Dados demonstrativos</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.name} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <campaign.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{campaign.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{campaign.channel} • {campaign.audience}</p>
                    </div>
                  </div>
                  <Badge variant={campaign.status === "Ativa" ? "secondary" : "outline"}>{campaign.status}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={campaign.progress} className="h-2 flex-1" />
                  <span className="text-xs font-medium">{campaign.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <CalendarDays className="size-5 text-primary" />
                Próximos envios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { date: "04 SET", title: "Oferta da semana", time: "09:00" },
                { date: "06 SET", title: "Conteúdo para leads", time: "18:30" },
                { date: "09 SET", title: "Reativação de clientes", time: "10:00" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-[10px] font-bold text-muted-foreground">{item.date}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <Sparkles className="size-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-bold">Crie mais rápido com IA</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Use o Funcionário IA para gerar textos, assuntos e chamadas para suas campanhas.</p>
              <Button asChild variant="outline" className="mt-4 w-full bg-background">
                <Link to="/funcionario-ia">Abrir Funcionário IA<ArrowRight className="size-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

const campaigns = [
  { name: "Lançamento Projeto X", channel: "WhatsApp", audience: "2.450 contatos", status: "Ativa", progress: 78, icon: MessageCircle },
  { name: "Boas-vindas novos leads", channel: "E-mail", audience: "1.180 contatos", status: "Ativa", progress: 56, icon: Mail },
  { name: "Reativação de clientes", channel: "Multicanal", audience: "860 contatos", status: "Agendada", progress: 18, icon: Send },
  { name: "Pesquisa de satisfação", channel: "E-mail", audience: "740 contatos", status: "Concluída", progress: 100, icon: CheckCircle2 },
];
