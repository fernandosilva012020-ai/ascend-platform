import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  Eye,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Projeto X" },
      { name: "description", content: "Indicadores e desempenho detalhado." },
      { property: "og:title", content: "Relatórios — Projeto X" },
      { property: "og:description", content: "Indicadores e desempenho detalhado." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">Visão analítica</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Relatórios</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">Acompanhe resultados, compare períodos e descubra os canais com melhor desempenho.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select defaultValue="30">
            <SelectTrigger className="w-full sm:w-44"><CalendarDays className="size-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast.info("A exportação será ativada com os dados reais.")}><Download className="size-4" />Exportar</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><metric.icon className="size-5" /></span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${metric.positive ? "text-emerald-600" : "text-red-500"}`}>
                  {metric.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{metric.change}
                </span>
              </div>
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
              <CardTitle className="flex items-center gap-2 font-display text-xl"><BarChart3 className="size-5 text-primary" />Desempenho mensal</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Comparativo de vendas dos últimos seis meses.</p>
            </div>
            <Badge variant="outline" className="w-fit">Dados demonstrativos</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid min-h-72 grid-cols-6 items-end gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:gap-5 sm:p-6">
              {monthlyPerformance.map((month) => (
                <div key={month.label} className="flex h-full flex-col justify-end gap-2 text-center">
                  <p className="hidden text-xs font-semibold sm:block">R$ {month.value} mil</p>
                  <div className="mx-auto w-full max-w-14 rounded-t-xl bg-primary/20 p-1" style={{ height: `${month.height}%` }}>
                    <div className="h-full w-full rounded-t-lg bg-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">{month.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Funil de conversão</CardTitle>
            <p className="text-sm text-muted-foreground">Da visualização até a venda.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><item.icon className="size-4 text-primary" />{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <Progress value={item.progress} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Desempenho por canal</CardTitle>
            <p className="text-sm text-muted-foreground">Resultados demonstrativos das principais origens.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[minmax(120px,1fr)_80px_90px_90px] gap-2 bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground">
                <span>Canal</span><span>Leads</span><span>Vendas</span><span>Conversão</span>
              </div>
              {channels.map((channel) => (
                <div key={channel.name} className="grid grid-cols-[minmax(120px,1fr)_80px_90px_90px] gap-2 border-t border-border px-4 py-3 text-sm">
                  <span className="truncate font-medium">{channel.name}</span><span>{channel.leads}</span><span>{channel.sales}</span><span className="font-semibold text-primary">{channel.conversion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl"><TrendingUp className="size-5 text-primary" />Resumo inteligente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>O Instagram apresentou o maior volume de leads, enquanto as indicações tiveram a melhor taxa de conversão.</p>
            <p>As vendas cresceram 21,7% em comparação com o período anterior.</p>
            <p className="rounded-xl border border-primary/20 bg-background/70 p-3 text-foreground">Conectando o Supabase, este espaço mostrará análises calculadas com os dados reais da conta.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const reportMetrics = [
  { label: "Leads gerados", value: "3.972", detail: "Últimos 30 dias", change: "8,1%", positive: true, icon: Users },
  { label: "Visualizações", value: "28.640", detail: "Todas as páginas", change: "14,3%", positive: true, icon: Eye },
  { label: "Vendas", value: "R$ 184.320", detail: "Meta: R$ 200 mil", change: "21,7%", positive: true, icon: ShoppingBag },
  { label: "Comissões", value: "R$ 27.845", detail: "Programa de parceiros", change: "3,2%", positive: false, icon: Wallet },
];

const monthlyPerformance = [
  { label: "Abr", value: 98, height: 48 }, { label: "Mai", value: 116, height: 57 }, { label: "Jun", value: 134, height: 66 },
  { label: "Jul", value: 128, height: 63 }, { label: "Ago", value: 162, height: 80 }, { label: "Set", value: 184, height: 92 },
];

const funnel = [
  { label: "Visualizações", value: "28.640", progress: 100, icon: Eye },
  { label: "Cliques", value: "12.846", progress: 45, icon: MousePointerClick },
  { label: "Leads", value: "3.972", progress: 31, icon: Users },
  { label: "Vendas", value: "1.284", progress: 32, icon: ShoppingBag },
];

const channels = [
  { name: "Instagram", leads: "1.486", sales: "382", conversion: "25,7%" },
  { name: "WhatsApp", leads: "1.120", sales: "346", conversion: "30,9%" },
  { name: "Indicações", leads: "804", sales: "304", conversion: "37,8%" },
  { name: "E-mail", leads: "562", sales: "152", conversion: "27,0%" },
];
