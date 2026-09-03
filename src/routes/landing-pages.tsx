import { useLandingPages } from "@/hooks/useLandingPages";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Copy,
  Eye,
  FileText,
  Globe,
  LayoutTemplate,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import type {
  LandingPageData,
  TemplateCategory,
} from "@/types/landing-pages";

export const Route = createFileRoute("/landing-pages")({
  head: () => ({
    meta: [
      {
        title: "Landing Pages — Projeto X",
      },
      {
        name: "description",
        content:
          "Crie páginas profissionais de captura e vendas em minutos.",
      },
      {
        property: "og:title",
        content: "Landing Pages — Projeto X",
      },
      {
        property: "og:description",
        content:
          "Crie páginas profissionais de captura e vendas em minutos.",
      },
    ],
  }),
  component: Page,
});

type PreviewMode = "desktop" | "mobile";

type TemplateDefinition = {
  id: TemplateCategory;
  name: string;
  description: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  icon: LucideIcon;
};

const templates: TemplateDefinition[] = [
  {
    id: "produto",
    name: "Produto",
    description:
      "Apresente um produto com destaque para benefícios e conversão.",
    headline: "O produto que transforma sua rotina",
    subtitle:
      "Conheça uma solução pensada para entregar resultado, praticidade e uma experiência melhor.",
    ctaText: "Quero conhecer",
    icon: FileText,
  },
  {
    id: "servico",
    name: "Serviço",
    description:
      "Divulgue serviços profissionais e gere novos contatos.",
    headline: "Seu próximo resultado começa aqui",
    subtitle:
      "Atendimento profissional, estratégia personalizada e foco no que realmente importa para seu negócio.",
    ctaText: "Solicitar orçamento",
    icon: Globe,
  },
  {
    id: "leads",
    name: "Captura de Leads",
    description:
      "Página focada em cadastro de interessados.",
    headline: "Receba uma oportunidade exclusiva",
    subtitle:
      "Preencha seus dados para receber todos os detalhes diretamente no seu contato.",
    ctaText: "Quero receber",
    icon: Users,
  },
  {
    id: "evento",
    name: "Evento",
    description:
      "Divulgue eventos, aulas, encontros e apresentações.",
    headline: "Um encontro que pode mudar seus próximos passos",
    subtitle:
      "Garanta sua participação e receba as informações completas do evento.",
    ctaText: "Garantir minha vaga",
    icon: LayoutTemplate,
  },
  {
    id: "afiliado",
    name: "Afiliado",
    description:
      "Apresente ofertas com foco em direcionamento e conversão.",
    headline: "Conheça uma solução que está chamando atenção",
    subtitle:
      "Veja os principais benefícios e descubra se essa oportunidade faz sentido para você.",
    ctaText: "Ver oferta",
    icon: BarChart3,
  },
  {
    id: "negocio-local",
    name: "Negócio Local",
    description:
      "Ideal para restaurantes, lojas, prestadores e empresas locais.",
    headline: "Qualidade e atendimento perto de você",
    subtitle:
      "Conheça nosso trabalho e fale diretamente com nossa equipe.",
    ctaText: "Falar agora",
    icon: Globe,
  },
];

function nowIso() {
  return new Date().toISOString();
}

function createPageFromTemplate(
  template: TemplateDefinition,
): LandingPageData {
  const id = crypto.randomUUID();

  return {
    id,
    name: `Nova página - ${template.name}`,
    slug: `pagina-${id.slice(0, 8)}`,
    category: template.id,
    status: "draft",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    views: 0,
    leadsCount: 0,

    theme: "dark",
    primaryColor: "#7c3aed",

    badgeText: "Projeto X",
    headline: template.headline,
    subtitle: template.subtitle,
    mainText:
      "Apresente aqui sua proposta de valor de maneira clara, objetiva e convincente. Mostre por que o visitante deve continuar interessado.",
    ctaText: template.ctaText,
    ctaLink: "#",
    heroImageUrl: "",

    form: {
      enabled: template.id === "leads",
      title: "Receba mais informações",
      subtitle:
        "Preencha seus dados e entraremos em contato.",
      buttonText: "Enviar dados",
      collectName: true,
      collectPhone: true,
      collectEmail: true,
      successMessage:
        "Cadastro realizado com sucesso!",
    },

    benefitsTitle: "Por que escolher esta solução?",
    benefitsSubtitle:
      "Destaque os principais motivos para o visitante avançar.",
    benefits: [
      {
        id: crypto.randomUUID(),
        title: "Benefício principal",
        description:
          "Explique de forma simples o maior benefício da sua oferta.",
      },
      {
        id: crypto.randomUUID(),
        title: "Mais praticidade",
        description:
          "Mostre como sua solução facilita a vida do cliente.",
      },
      {
        id: crypto.randomUUID(),
        title: "Resultado",
        description:
          "Apresente o resultado que o cliente pode buscar.",
      },
    ],

    testimonialsTitle: "Quem conhece recomenda",
    testimonialsSubtitle:
      "Use prova social para aumentar a confiança.",
    testimonials: [
      {
        id: crypto.randomUUID(),
        name: "Cliente exemplo",
        role: "Cliente",
        content:
          "Uma experiência excelente do início ao fim.",
        rating: 5,
      },
    ],

    finalCtaTitle: "Pronto para dar o próximo passo?",
    finalCtaSubtitle:
      "Clique no botão abaixo e continue.",
    finalCtaButtonText: template.ctaText,
    finalCtaButtonLink: "#",
  };
}

const initialPages: LandingPageData[] = [
  {
    ...createPageFromTemplate(templates[1]),
    id: "demo-servico",
    name: "Serviços Projeto X",
    slug: "servicos-projeto-x",
    status: "published",
    views: 1248,
    leadsCount: 87,
    createdAt: "2026-08-27T12:00:00.000Z",
  },
  {
    ...createPageFromTemplate(templates[2]),
    id: "demo-leads",
    name: "Captação Instagram",
    slug: "captacao-instagram",
    status: "draft",
    views: 336,
    leadsCount: 24,
    createdAt: "2026-08-30T12:00:00.000Z",
  },
];

function Page() {
  const {
  pages,
  loading,
  upsertPage,
  deletePage: deleteLandingPage,
} = useLandingPages();

  const [editorOpen, setEditorOpen] =
    useState(false);

  const [templateOpen, setTemplateOpen] =
    useState(false);

  const [editingPage, setEditingPage] =
    useState<LandingPageData | null>(null);

  const [previewMode, setPreviewMode] =
    useState<PreviewMode>("desktop");

  const metrics = useMemo(() => {
    return {
      total: pages.length,
      published: pages.filter(
        (page) => page.status === "published",
      ).length,
      drafts: pages.filter(
        (page) => page.status === "draft",
      ).length,
      views: pages.reduce(
        (total, page) => total + page.views,
        0,
      ),
      leads: pages.reduce(
        (total, page) => total + page.leadsCount,
        0,
      ),
    };
  }, [pages]);

  function openTemplateSelector() {
    setTemplateOpen(true);
  }

  function chooseTemplate(
    template: TemplateDefinition,
  ) {
    const newPage =
      createPageFromTemplate(template);

    setEditingPage(newPage);
    setTemplateOpen(false);
    setEditorOpen(true);
  }

  function editPage(page: LandingPageData) {
    setEditingPage({
      ...page,
      benefits: page.benefits.map((item) => ({
        ...item,
      })),
      testimonials: page.testimonials.map(
        (item) => ({
          ...item,
        }),
      ),
      form: {
        ...page.form,
      },
    });

    setEditorOpen(true);
  }

  async function savePage() {
  if (!editingPage) return;

  if (!editingPage.name.trim()) {
    toast.error("Informe o nome da landing page.");
    return;
  }

  const updated: LandingPageData = {
    ...editingPage,
    name: editingPage.name.trim(),
    updatedAt: nowIso(),
  };

  try {
    await upsertPage(updated);

    setEditorOpen(false);
    setEditingPage(null);

    toast.success("Landing page salva no Supabase.");
  } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível salvar a landing page.",
    );
  }
}

  async function duplicatePage(
  page: LandingPageData,
) {
  const copyPage: LandingPageData = {
    ...page,
    id: crypto.randomUUID(),
    name: `${page.name} - Cópia`,
    slug: `${page.slug}-copia-${Date.now()}`,
    status: "draft",
    views: 0,
    leadsCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    benefits: page.benefits.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    })),
    testimonials: page.testimonials.map(
      (item) => ({
        ...item,
        id: crypto.randomUUID(),
      }),
    ),
    form: {
      ...page.form,
    },
  };

  try {
    await upsertPage(copyPage);

    toast.success(
      "Página duplicada e salva no Supabase.",
    );
    } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível duplicar a página.",
    );
  }
}

async function deletePage(
  page: LandingPageData,
) {
  const confirmed = window.confirm(
    `Excluir a landing page "${page.name}"?`,
  );

  if (!confirmed) return;

  try {
    await deleteLandingPage(page.id);

    toast.success(
      "Landing page excluída do Supabase.",
    );
  } catch (error) {
    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível excluir a landing page.",
    );
  }
}

  async function togglePublish(
    page: LandingPageData,
  ) {
    const updated: LandingPageData = {
      ...page,
      status:
        page.status === "published"
          ? "draft"
          : "published",
      updatedAt: nowIso(),
    };

    try {
      await upsertPage(updated);

      toast.success(
        page.status === "published"
          ? "Página movida para rascunho."
          : "Página publicada e salva no Supabase.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a publicação.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>

            <Badge variant="secondary">
              Landing Pages 1.0
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Landing Pages
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Crie páginas profissionais para
            vendas, captura de leads, eventos,
            serviços e campanhas.
          </p>
        </div>

        <Button
          type="button"
          className="gap-2"
          onClick={openTemplateSelector}
        >
          <Plus className="h-4 w-4" />
          Nova Landing Page
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total de páginas"
          value={String(metrics.total)}
          icon={Globe}
        />

        <MetricCard
          title="Publicadas"
          value={String(metrics.published)}
          icon={Eye}
        />

        <MetricCard
          title="Rascunhos"
          value={String(metrics.drafts)}
          icon={FileText}
        />

        <MetricCard
          title="Visualizações"
          value={metrics.views.toLocaleString(
            "pt-BR",
          )}
          icon={BarChart3}
        />

        <MetricCard
          title="Leads capturados"
          value={String(metrics.leads)}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Suas Landing Pages
            </CardTitle>

            <span className="text-sm text-muted-foreground">
              {pages.length} página
              {pages.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pages.length === 0 ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">
                Nenhuma landing page criada
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Escolha um template e crie sua
                primeira página profissional.
              </p>

              <Button
                type="button"
                className="mt-4 gap-2"
                onClick={openTemplateSelector}
              >
                <Plus className="h-4 w-4" />
                Criar página
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:p-5 xl:grid-cols-[minmax(240px,1.3fr)_150px_160px_130px_auto] xl:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">
                        {page.name}
                      </h3>

                      <Badge
                        variant="outline"
                        className={
                          page.status ===
                          "published"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }
                      >
                        {page.status ===
                        "published"
                          ? "Publicada"
                          : "Rascunho"}
                      </Badge>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      /{page.slug}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Criada em{" "}
                      {new Date(
                        page.createdAt,
                      ).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Visualizações
                    </p>

                    <p className="mt-1 font-semibold">
                      {page.views.toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Leads
                    </p>

                    <p className="mt-1 font-semibold">
                      {page.leadsCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Template
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize">
                      {page.category.replace(
                        "-",
                        " ",
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        togglePublish(page)
                      }
                    >
                      {page.status ===
                      "published"
                        ? "Despublicar"
                        : "Publicar"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() =>
                        editPage(page)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Visualizar"
                      onClick={() =>
                        editPage(page)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Duplicar"
                      onClick={() =>
                        duplicatePage(page)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Excluir"
                      onClick={() =>
                        deletePage(page)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              Escolha um template
            </DialogTitle>

            <DialogDescription>
              Comece com uma estrutura pronta e
              personalize todos os textos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => {
              const Icon = template.icon;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    chooseTemplate(template)
                  }
                  className="rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {template.name}
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);

          if (!open) {
            setEditingPage(null);
          }
        }}
      >
        <DialogContent className="max-h-[95vh] overflow-hidden p-0 sm:max-w-[1400px]">
          {editingPage && (
            <div className="flex max-h-[95vh] flex-col">
              <DialogHeader className="border-b p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <DialogTitle>
                      Editor de Landing Page
                    </DialogTitle>

                    <DialogDescription>
                      Personalize sua página e
                      acompanhe o preview.
                    </DialogDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={
                        previewMode === "desktop"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreviewMode(
                          "desktop",
                        )
                      }
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Desktop
                    </Button>

                    <Button
                      type="button"
                      variant={
                        previewMode === "mobile"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setPreviewMode(
                          "mobile",
                        )
                      }
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Mobile
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid min-h-0 flex-1 lg:grid-cols-[520px_minmax(0,1fr)]">
                <div className="overflow-y-auto border-r p-5">
                  <Tabs defaultValue="geral">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="geral">
                        Geral
                      </TabsTrigger>

                      <TabsTrigger value="hero">
                        Hero
                      </TabsTrigger>

                      <TabsTrigger value="formulario">
                        Form
                      </TabsTrigger>

                      <TabsTrigger value="conteudo">
                        Conteúdo
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="geral"
                      className="space-y-4 pt-4"
                    >
                      <Field
                        label="Nome da página"
                        value={
                          editingPage.name
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            name: value,
                          })
                        }
                      />

                      <Field
                        label="Slug"
                        value={
                          editingPage.slug
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            slug: value
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-",
                              ),
                          })
                        }
                      />

                      <div className="space-y-2">
                        <Label>
                          Status
                        </Label>

                        <Select
                          value={
                            editingPage.status
                          }
                          onValueChange={(
                            value,
                          ) =>
                            setEditingPage({
                              ...editingPage,
                              status:
                                value as
                                  | "published"
                                  | "draft",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="draft">
                              Rascunho
                            </SelectItem>

                            <SelectItem value="published">
                              Publicada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Tema
                        </Label>

                        <Select
                          value={
                            editingPage.theme
                          }
                          onValueChange={(
                            value,
                          ) =>
                            setEditingPage({
                              ...editingPage,
                              theme:
                                value as
                                  | "dark"
                                  | "light",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="dark">
                              Escuro
                            </SelectItem>

                            <SelectItem value="light">
                              Claro
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Cor principal
                        </Label>

                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={
                              editingPage.primaryColor
                            }
                            onChange={(
                              event,
                            ) =>
                              setEditingPage({
                                ...editingPage,
                                primaryColor:
                                  event.target
                                    .value,
                              })
                            }
                            className="h-10 w-16 p-1"
                          />

                          <Input
                            value={
                              editingPage.primaryColor
                            }
                            onChange={(
                              event,
                            ) =>
                              setEditingPage({
                                ...editingPage,
                                primaryColor:
                                  event.target
                                    .value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="hero"
                      className="space-y-4 pt-4"
                    >
                      <Field
                        label="Texto do badge"
                        value={
                          editingPage.badgeText ??
                          ""
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            badgeText: value,
                          })
                        }
                      />

                      <TextField
                        label="Headline"
                        value={
                          editingPage.headline
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            headline: value,
                          })
                        }
                      />

                      <TextField
                        label="Subtítulo"
                        value={
                          editingPage.subtitle
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            subtitle: value,
                          })
                        }
                      />

                      <TextField
                        label="Texto principal"
                        value={
                          editingPage.mainText
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            mainText: value,
                          })
                        }
                      />

                      <Field
                        label="Texto do CTA"
                        value={
                          editingPage.ctaText
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            ctaText: value,
                          })
                        }
                      />

                      <Field
                        label="Link do CTA"
                        value={
                          editingPage.ctaLink
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            ctaLink: value,
                          })
                        }
                      />

                      <Field
                        label="Imagem principal por URL"
                        value={
                          editingPage.heroImageUrl
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            heroImageUrl:
                              value,
                          })
                        }
                      />
                    </TabsContent>

                    <TabsContent
                      value="formulario"
                      className="space-y-4 pt-4"
                    >
                      <div className="flex items-center justify-between rounded-xl border p-4">
                        <div>
                          <p className="font-medium">
                            Formulário de
                            captura
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Exibir formulário
                            na página.
                          </p>
                        </div>

                        <Switch
                          checked={
                            editingPage.form
                              .enabled
                          }
                          onCheckedChange={(
                            checked,
                          ) =>
                            setEditingPage({
                              ...editingPage,
                              form: {
                                ...editingPage.form,
                                enabled:
                                  checked,
                              },
                            })
                          }
                        />
                      </div>

                      <Field
                        label="Título do formulário"
                        value={
                          editingPage.form
                            .title
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              title: value,
                            },
                          })
                        }
                      />

                      <Field
                        label="Subtítulo do formulário"
                        value={
                          editingPage.form
                            .subtitle
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              subtitle:
                                value,
                            },
                          })
                        }
                      />

                      <Field
                        label="Texto do botão"
                        value={
                          editingPage.form
                            .buttonText
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              buttonText:
                                value,
                            },
                          })
                        }
                      />

                      <CaptureToggle
                        label="Coletar nome"
                        checked={
                          editingPage.form
                            .collectName
                        }
                        onChange={(
                          checked,
                        ) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              collectName:
                                checked,
                            },
                          })
                        }
                      />

                      <CaptureToggle
                        label="Coletar telefone"
                        checked={
                          editingPage.form
                            .collectPhone
                        }
                        onChange={(
                          checked,
                        ) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              collectPhone:
                                checked,
                            },
                          })
                        }
                      />

                      <CaptureToggle
                        label="Coletar e-mail"
                        checked={
                          editingPage.form
                            .collectEmail
                        }
                        onChange={(
                          checked,
                        ) =>
                          setEditingPage({
                            ...editingPage,
                            form: {
                              ...editingPage.form,
                              collectEmail:
                                checked,
                            },
                          })
                        }
                      />
                    </TabsContent>

                    <TabsContent
                      value="conteudo"
                      className="space-y-4 pt-4"
                    >
                      <Field
                        label="Título dos benefícios"
                        value={
                          editingPage.benefitsTitle
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            benefitsTitle:
                              value,
                          })
                        }
                      />

                      {editingPage.benefits.map(
                        (benefit, index) => (
                          <Card
                            key={benefit.id}
                          >
                            <CardContent className="space-y-3 p-4">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Benefício{" "}
                                {index + 1}
                              </p>

                              <Input
                                value={
                                  benefit.title
                                }
                                onChange={(
                                  event,
                                ) => {
                                  const next =
                                    [
                                      ...editingPage.benefits,
                                    ];

                                  next[index] =
                                    {
                                      ...benefit,
                                      title:
                                        event
                                          .target
                                          .value,
                                    };

                                  setEditingPage(
                                    {
                                      ...editingPage,
                                      benefits:
                                        next,
                                    },
                                  );
                                }}
                              />

                              <Textarea
                                value={
                                  benefit.description
                                }
                                onChange={(
                                  event,
                                ) => {
                                  const next =
                                    [
                                      ...editingPage.benefits,
                                    ];

                                  next[index] =
                                    {
                                      ...benefit,
                                      description:
                                        event
                                          .target
                                          .value,
                                    };

                                  setEditingPage(
                                    {
                                      ...editingPage,
                                      benefits:
                                        next,
                                    },
                                  );
                                }}
                              />
                            </CardContent>
                          </Card>
                        ),
                      )}

                      <Field
                        label="Título final"
                        value={
                          editingPage.finalCtaTitle
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            finalCtaTitle:
                              value,
                          })
                        }
                      />

                      <Field
                        label="Subtítulo final"
                        value={
                          editingPage.finalCtaSubtitle
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            finalCtaSubtitle:
                              value,
                          })
                        }
                      />

                      <Field
                        label="Botão final"
                        value={
                          editingPage.finalCtaButtonText
                        }
                        onChange={(value) =>
                          setEditingPage({
                            ...editingPage,
                            finalCtaButtonText:
                              value,
                          })
                        }
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="min-h-0 overflow-y-auto bg-muted/30 p-4 md:p-6">
                  <LandingPreview
                    page={editingPage}
                    mode={previewMode}
                  />
                </div>
              </div>

              <DialogFooter className="border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditorOpen(false)
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={savePage}
                >
                  Salvar Landing Page
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-[90px]"
      />
    </div>
  );
}

function CaptureToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <Label>{label}</Label>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function LandingPreview({
  page,
  mode,
}: {
  page: LandingPageData;
  mode: PreviewMode;
}) {
  const dark = page.theme === "dark";

  const background = dark
    ? "#09090b"
    : "#ffffff";

  const foreground = dark
    ? "#fafafa"
    : "#18181b";

  const muted = dark
    ? "#a1a1aa"
    : "#52525b";

  return (
    <div
      className={[
        "mx-auto overflow-hidden rounded-2xl border shadow-xl transition-all",
        mode === "mobile"
          ? "max-w-[390px]"
          : "max-w-[1000px]",
      ].join(" ")}
      style={{
        background,
        color: foreground,
      }}
    >
      <section className="relative overflow-hidden px-6 py-14 text-center md:px-10 md:py-20">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background:
              page.primaryColor,
          }}
        />

        {page.badgeText && (
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `${page.primaryColor}20`,
              color:
                page.primaryColor,
            }}
          >
            {page.badgeText}
          </span>
        )}

        <h1
          className={[
            "mx-auto mt-5 font-bold tracking-tight",
            mode === "mobile"
              ? "text-3xl"
              : "max-w-3xl text-4xl md:text-6xl",
          ].join(" ")}
        >
          {page.headline}
        </h1>

        <p
          className="mx-auto mt-5 max-w-2xl leading-7"
          style={{
            color: muted,
          }}
        >
          {page.subtitle}
        </p>

        <p
          className="mx-auto mt-4 max-w-2xl text-sm leading-6"
          style={{
            color: muted,
          }}
        >
          {page.mainText}
        </p>

        <button
          type="button"
          className="mt-7 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{
            background:
              page.primaryColor,
          }}
        >
          {page.ctaText}
        </button>

        {page.heroImageUrl && (
          <img
            src={page.heroImageUrl}
            alt=""
            className="mx-auto mt-10 max-h-[420px] w-full rounded-2xl object-cover"
          />
        )}
      </section>

      <section className="border-y border-white/10 px-6 py-12 md:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {page.benefitsTitle}
          </h2>

          {page.benefitsSubtitle && (
            <p
              className="mt-2 text-sm"
              style={{
                color: muted,
              }}
            >
              {page.benefitsSubtitle}
            </p>
          )}
        </div>

        <div
          className={[
            "mt-7 grid gap-4",
            mode === "mobile"
              ? "grid-cols-1"
              : "md:grid-cols-3",
          ].join(" ")}
        >
          {page.benefits.map(
            (benefit) => (
              <div
                key={benefit.id}
                className="rounded-xl border border-white/10 p-5"
              >
                <h3 className="font-semibold">
                  {benefit.title}
                </h3>

                <p
                  className="mt-2 text-sm leading-6"
                  style={{
                    color: muted,
                  }}
                >
                  {
                    benefit.description
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {page.form.enabled && (
        <section className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold">
              {page.form.title}
            </h2>

            <p
              className="mt-2 text-sm"
              style={{
                color: muted,
              }}
            >
              {page.form.subtitle}
            </p>

            <div className="mt-5 space-y-3">
              {page.form.collectName && (
                <input
                  readOnly
                  placeholder="Seu nome"
                  className="w-full rounded-lg border bg-transparent px-4 py-3 text-sm"
                />
              )}

              {page.form.collectPhone && (
                <input
                  readOnly
                  placeholder="Seu telefone"
                  className="w-full rounded-lg border bg-transparent px-4 py-3 text-sm"
                />
              )}

              {page.form.collectEmail && (
                <input
                  readOnly
                  placeholder="Seu e-mail"
                  className="w-full rounded-lg border bg-transparent px-4 py-3 text-sm"
                />
              )}

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white"
                style={{
                  background:
                    page.primaryColor,
                }}
              >
                {page.form.buttonText}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-white/10 px-6 py-14 text-center md:px-10">
        <h2 className="text-2xl font-bold">
          {page.finalCtaTitle}
        </h2>

        <p
          className="mx-auto mt-2 max-w-xl text-sm"
          style={{
            color: muted,
          }}
        >
          {page.finalCtaSubtitle}
        </p>

        <button
          type="button"
          className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{
            background:
              page.primaryColor,
          }}
        >
          {page.finalCtaButtonText}
        </button>
      </section>
    </div>
  );
}
