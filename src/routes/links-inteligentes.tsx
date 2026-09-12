import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  MousePointerClick,
  Plus,
  QrCode,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/links-inteligentes")({
  head: () => ({
    meta: [
      { title: "Links Inteligentes — Projeto X" },
      { name: "description", content: "Links rastreáveis com métricas de conversão." },
      { property: "og:title", content: "Links Inteligentes — Projeto X" },
      { property: "og:description", content: "Links rastreáveis com métricas de conversão." },
    ],
  }),
  component: Page,
});

function Page() {
  const [search, setSearch] = useState("");
  const filteredLinks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return smartLinks;
    return smartLinks.filter((item) =>
      `${item.name} ${item.shortUrl} ${item.destination}`.toLocaleLowerCase("pt-BR").includes(term),
    );
  }, [search]);

  async function copyLink(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Rastreamento de links</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Links Inteligentes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Encurte endereços, organize campanhas e acompanhe cliques e conversões.
            </p>
          </div>
          <Button size="lg" onClick={() => toast.info("A criação será ativada com a conexão ao Supabase.")}>
            <Plus className="size-4" />Novo link
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Links ativos", value: "18", detail: "3 criados neste mês", icon: Link2 },
          { label: "Cliques totais", value: "12.846", detail: "+18,4% no período", icon: MousePointerClick },
          { label: "Visitantes únicos", value: "9.672", detail: "75,3% dos cliques", icon: Eye },
          { label: "Conversões", value: "1.594", detail: "Taxa de 12,4%", icon: TrendingUp },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><metric.icon className="size-5" /></span>
              <p className="mt-4 text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 font-display text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Seus links</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Endereços demonstrativos e suas métricas.</p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar link ou campanha..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLinks.map((item) => (
              <div key={item.shortUrl} className="rounded-2xl border border-border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Link2 className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <Badge variant={item.status === "Ativo" ? "secondary" : "outline"}>{item.status}</Badge>
                    </div>
                    <button type="button" className="mt-1 block max-w-full truncate text-left text-sm font-medium text-primary hover:underline" onClick={() => copyLink(item.shortUrl)}>
                      {item.shortUrl}
                    </button>
                    <p className="mt-1 truncate text-xs text-muted-foreground">Destino: {item.destination}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:min-w-72">
                    <LinkMetric label="Cliques" value={item.clicks} />
                    <LinkMetric label="Únicos" value={item.unique} />
                    <LinkMetric label="Conversões" value={item.conversions} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={() => copyLink(item.shortUrl)} aria-label="Copiar link"><Copy className="size-4" /></Button>
                    <Button type="button" size="icon" variant="outline" onClick={() => toast.info("QR Code será ativado com o backend.")} aria-label="Ver QR Code"><QrCode className="size-4" /></Button>
                    <Button type="button" size="icon" variant="outline" onClick={() => toast.info("Pré-visualização demonstrativa.")} aria-label="Abrir link"><ExternalLink className="size-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredLinks.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">Nenhum link encontrado.</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><BarChart3 className="size-6" /></span>
          <div>
            <h2 className="font-display text-lg font-bold">Métricas detalhadas por campanha</h2>
            <p className="mt-1 text-sm text-muted-foreground">Conecte os links às campanhas para comparar origens, dispositivos e conversões.</p>
          </div>
          <Badge variant="outline" className="w-fit bg-background">Disponível após integração</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

const smartLinks = [
  { name: "Oferta Projeto X", shortUrl: "projetox.link/oferta", destination: "https://projetox.com/oferta", status: "Ativo", clicks: "5.284", unique: "4.110", conversions: "682" },
  { name: "Cadastro de parceiros", shortUrl: "projetox.link/parceiros", destination: "https://projetox.com/cadastro", status: "Ativo", clicks: "3.412", unique: "2.706", conversions: "415" },
  { name: "Campanha Instagram", shortUrl: "projetox.link/instagram", destination: "https://instagram.com/projetox", status: "Ativo", clicks: "2.980", unique: "2.185", conversions: "362" },
  { name: "Black Friday 2026", shortUrl: "projetox.link/black", destination: "https://projetox.com/black-friday", status: "Pausado", clicks: "1.170", unique: "671", conversions: "135" },
];

function LinkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2 text-center">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
