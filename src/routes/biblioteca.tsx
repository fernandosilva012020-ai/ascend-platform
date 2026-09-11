import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Grid2X2,
  Library,
  MoreHorizontal,
  Search,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Projeto X" },
      { name: "description", content: "Materiais, criativos e documentos." },
      { property: "og:title", content: "Biblioteca — Projeto X" },
      { property: "og:description", content: "Materiais, criativos e documentos." },
    ],
  }),
  component: Page,
});

function Page() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return materials.filter((material) => {
      const matchesCategory = category === "todos" || material.category === category;
      const matchesSearch = !term || `${material.name} ${material.description}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Central de materiais</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Biblioteca</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Organize criativos, documentos, vídeos e materiais da sua operação.</p>
          </div>
          <Button size="lg" onClick={() => toast.info("O envio de arquivos será ativado com o armazenamento no Supabase.")}><Upload className="size-4" />Enviar material</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Todos os materiais", value: "48", icon: Library },
          { label: "Documentos", value: "16", icon: FileText },
          { label: "Criativos", value: "22", icon: FileImage },
          { label: "Vídeos", value: "10", icon: Video },
        ].map((item) => (
          <Card key={item.label}><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></span><div><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 font-display text-2xl font-bold">{item.value}</p></div></CardContent></Card>
        ))}
      </section>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Materiais disponíveis</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Arquivos demonstrativos para visualizar a organização do módulo.</p>
          </div>
          <div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar material..." className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={setCategory} className="space-y-5">
            <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 sm:w-fit">
              <TabsTrigger value="todos">Todos</TabsTrigger><TabsTrigger value="documento">Documentos</TabsTrigger><TabsTrigger value="criativo">Criativos</TabsTrigger><TabsTrigger value="video">Vídeos</TabsTrigger>
            </TabsList>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => {
                const Icon = material.category === "video" ? Video : material.category === "criativo" ? FileImage : FileText;
                return (
                  <div key={material.name} className="group rounded-2xl border border-border p-4 transition-colors hover:border-primary/30 hover:bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></span>
                      <Button size="icon" variant="ghost" onClick={() => toast.info("As opções do arquivo serão ativadas com o armazenamento.")}><MoreHorizontal className="size-4" /></Button>
                    </div>
                    <h3 className="mt-4 truncate font-semibold">{material.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{material.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><FolderOpen className="size-3.5" />{material.folder}</div>
                      <Button size="sm" variant="ghost" onClick={() => toast.info("Download disponível após conectar os arquivos reais.")}><Download className="size-4" />Baixar</Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredMaterials.length === 0 ? <div className="py-12 text-center"><Grid2X2 className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Nenhum material encontrado.</p></div> : null}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const materials = [
  { name: "Manual da Marca Projeto X", description: "Guia de identidade visual, cores, tipografia e aplicação da marca.", category: "documento", folder: "Institucional" },
  { name: "Kit de Stories para Instagram", description: "Conjunto de artes editáveis para campanhas e novidades.", category: "criativo", folder: "Redes sociais" },
  { name: "Apresentação Comercial", description: "Material para apresentar os benefícios e planos da plataforma.", category: "documento", folder: "Vendas" },
  { name: "Treinamento de Boas-vindas", description: "Vídeo introdutório para novos parceiros e integrantes.", category: "video", folder: "Treinamentos" },
  { name: "Banners de Divulgação", description: "Criativos em diferentes formatos para campanhas digitais.", category: "criativo", folder: "Campanhas" },
  { name: "Roteiro de Atendimento", description: "Modelo de abordagem e acompanhamento de novos contatos.", category: "documento", folder: "Atendimento" },
];
