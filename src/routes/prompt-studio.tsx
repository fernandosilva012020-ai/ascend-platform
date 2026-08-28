import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  History as HistoryIcon,
  ImageUp,
  Loader2,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AISelector } from "@/components/prompt-studio/AISelector";
import { PromptCategorySelector } from "@/components/prompt-studio/PromptCategorySelector";
import { PromptConfiguration } from "@/components/prompt-studio/PromptConfiguration";
import { PromptHistory } from "@/components/prompt-studio/PromptHistory";
import { PromptIdeaInput } from "@/components/prompt-studio/PromptIdeaInput";
import { PromptLevelSelector } from "@/components/prompt-studio/PromptLevelSelector";
import { PromptResult } from "@/components/prompt-studio/PromptResult";
import { PromptTemplates } from "@/components/prompt-studio/PromptTemplates";
import { promptCategories, type PromptLevel } from "@/data/promptStudio";
import { buildPrompt, scorePrompt } from "@/lib/promptBuilder";
import { generatePromptWithGemini } from "@/lib/prompt-generator";

export const Route = createFileRoute("/prompt-studio")({
  head: () => ({
    meta: [
      { title: "Prompt X Studio — Projeto X" },
      {
        name: "description",
        content:
          "Transforme uma ideia simples em um prompt profissional para vídeo, imagem, anúncios e vendas.",
      },
      { property: "og:title", content: "Prompt X Studio — Projeto X" },
      {
        property: "og:description",
        content:
          "Transforme uma ideia simples em um prompt profissional para vídeo, imagem, anúncios e vendas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromptStudioPage,
});

function SectionCard({
  step,
  title,
  description,
  children,
}: {
  step?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card space-y-5 p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {step ? (
            <span className="grid size-6 shrink-0 place-items-center rounded-lg gradient-brand text-[11px] font-semibold text-primary-foreground">
              {step}
            </span>
          ) : null}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function PromptStudioPage() {
  const [categoryId, setCategoryId] = useState(promptCategories[0]!.id);
  const [idea, setIdea] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [aiId, setAiId] = useState("chatgpt");
  const [level, setLevel] = useState<PromptLevel>("profissional");
  const [result, setResult] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [rawPrompt, setRawPrompt] = useState("");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const category = useMemo(
    () => promptCategories.find((item) => item.id === categoryId) ?? promptCategories[0]!,
    [categoryId],
  );
  const categoryValues = values[categoryId] ?? {};

  const buildInput = { categoryId, idea, values: categoryValues, aiId, level };
  const quality = useMemo(() => scorePrompt(buildInput), [categoryId, idea, categoryValues, aiId, level]);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [categoryId]: { ...(prev[categoryId] ?? {}), [key]: value } }));
  };

  const handleEnhanceIdea = () => {
      setEnhancing(true);
      window.setTimeout(() => {
        setIdea((current) =>
          `${current.trim()} — com direção de arte profissional, foco em detalhes realistas, composição equilibrada e acabamento premium.`.trim(),
        );
        setEnhancing(false);
        toast.success("Ideia refinada com sugestões profissionais.");
      }, 700);
    };
  
    const generate = async () => {
      setGenerating(true);
      setFavorite(false);
  
      try {
            // Tenta gerar com Gemini primeiro
            const response = await generatePromptWithGemini({
              categoryId,
              idea,
              values: categoryValues,
              aiId,
              level,
            });
  
        if (response && response.prompt) {
          setResult(response.prompt);
          toast.success("Prompt gerado com IA!");
        } else {
          // Fallback para mock
          setResult(buildPrompt(buildInput));
          toast.success("Prompt gerado com sucesso.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
  
        if (errorMessage === "GEMINI_API_KEY_NOT_CONFIGURED") {
          // Fallback para mock quando Gemini não está configurada
          setResult(buildPrompt(buildInput));
          toast.success("Prompt gerado com sucesso.");
        } else if (errorMessage === "GEMINI_API_KEY_INVALID") {
          toast.error("Gemini ainda não está configurada no servidor.");
        } else if (errorMessage === "GEMINI_MODEL_UNAVAILABLE") {
          toast.error("Modelo Gemini não disponível. Tente novamente.");
        } else if (errorMessage === "GEMINI_QUOTA_EXCEEDED") {
          toast.error("Limite de gerações da Gemini excedido.");
        } else if (errorMessage === "EMPTY_RESPONSE") {
          toast.error("Não foi possível gerar o prompt. Tente novamente.");
        } else {
          toast.error("Não foi possível gerar o prompt. Tente novamente.");
        }
      } finally {
        setGenerating(false);
      }
    };

  const optimize = () => {
    if (!rawPrompt.trim()) {
      toast.error("Cole um prompt para otimizar.");
      return;
    }
    setOptimized(
      [
        "# Prompt otimizado",
        "",
        "## Contexto",
        rawPrompt.trim(),
        "",
        "## Direção",
        "- Estilo: profissional, coerente e consistente do início ao fim.",
        "- Estrutura: objetivo, contexto, parâmetros técnicos e restrições.",
        "- Formato de saída: organizado em blocos claros.",
        "",
        "## Restrições",
        "- Evite ambiguidade, texto genérico e elementos fora do escopo.",
      ].join("\n"),
    );
    toast.success("Prompt otimizado.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="surface-card flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl gradient-brand">
            <Sparkles className="size-6 text-primary-foreground" />
          </span>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold sm:text-2xl">Prompt X Studio ✨</h1>
              <Badge variant="secondary">Plano PRO</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforme uma ideia simples em um prompt profissional em segundos.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex lg:shrink-0">
          <Button variant="outline" size="sm">
            <Star className="size-4" />
            Favoritos
          </Button>
          <Button variant="outline" size="sm">
            <BookOpen className="size-4" />
            Biblioteca
          </Button>
          <Button variant="outline" size="sm">
            <HistoryIcon className="size-4" />
            Histórico
          </Button>
        </div>
      </header>

      <Tabs defaultValue="criar" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="criar">✨ Criar Prompt</TabsTrigger>
          <TabsTrigger value="melhorar">🪄 Melhorar Prompt</TabsTrigger>
          <TabsTrigger value="imagem">📷 Imagem → Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="criar" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <SectionCard
                step="1"
                title="O que você deseja criar?"
                description="Escolha a categoria para personalizar os campos do prompt."
              >
                <PromptCategorySelector value={categoryId} onChange={setCategoryId} />
              </SectionCard>

              <SectionCard step="2" title="Sua ideia">
                <PromptIdeaInput
                  value={idea}
                  onChange={setIdea}
                  onEnhance={handleEnhanceIdea}
                  enhancing={enhancing}
                />
              </SectionCard>

              <SectionCard
                step="3"
                title="Personalize seu prompt"
                description={`Campos inteligentes para a categoria ${category.name}.`}
              >
                <PromptConfiguration
                  category={category}
                  values={categoryValues}
                  onChange={setField}
                />
              </SectionCard>

              <SectionCard step="4" title="Onde você pretende usar este prompt?">
                <AISelector value={aiId} onChange={setAiId} />
              </SectionCard>

              <SectionCard step="5" title="Nível de detalhamento">
                <PromptLevelSelector value={level} onChange={setLevel} />
              </SectionCard>

              <Button
                size="lg"
                className="h-14 w-full text-base"
                onClick={generate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Gerar Prompt Profissional
                  </>
                )}
              </Button>

              {result ? (
                <PromptResult
                  prompt={result}
                  quality={quality}
                  favorite={favorite}
                  onRegenerate={generate}
                  onEnhance={() => {
                    setResult(
                      `${buildPrompt(buildInput)}\n\n## Refinamento\n- Aumente o nível de detalhe visual e a consistência entre os elementos.`,
                    );
                    toast.success("Prompt aprimorado.");
                  }}
                  onToggleFavorite={() => {
                    setFavorite((prev) => !prev);
                    toast.success(favorite ? "Removido dos favoritos." : "Adicionado aos favoritos.");
                  }}
                />
              ) : null}
            </div>

            <aside className="space-y-6">
              <PromptHistory />
            </aside>
          </div>

          <PromptTemplates
            onUse={(name) => {
              setIdea(name);
              toast.success(`Template "${name}" carregado.`);
            }}
          />
        </TabsContent>

        <TabsContent value="melhorar" className="space-y-6">
          <SectionCard
            title="🪄 Melhorar Prompt"
            description="Cole um prompt existente e receba uma versão estruturada."
          >
            <div className="space-y-3">
              <Label htmlFor="raw-prompt">Prompt original</Label>
              <Textarea
                id="raw-prompt"
                rows={8}
                value={rawPrompt}
                onChange={(event) => setRawPrompt(event.target.value)}
                placeholder="Cole seu prompt aqui..."
              />
              <Button onClick={optimize} className="w-full sm:w-auto">
                <Wand2 className="size-4" />
                Otimizar Prompt
              </Button>
            </div>
          </SectionCard>

          {optimized ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="surface-card space-y-3 p-6">
                <h3 className="text-base font-semibold">Prompt original</h3>
                <pre className="whitespace-pre-wrap break-words rounded-2xl bg-muted p-4 font-mono text-xs leading-relaxed">
                  {rawPrompt}
                </pre>
              </section>
              <section className="surface-card space-y-3 p-6">
                <h3 className="text-base font-semibold">Prompt otimizado</h3>
                <pre className="whitespace-pre-wrap break-words rounded-2xl bg-muted p-4 font-mono text-xs leading-relaxed">
                  {optimized}
                </pre>
              </section>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="imagem" className="space-y-6">
          <SectionCard title="📷 Imagem → Prompt">
            <label
              htmlFor="image-upload"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) setImageName(file.name);
              }}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-accent">
                <ImageUp className="size-7 text-accent-foreground" />
              </span>
              <span className="text-sm font-semibold">Arraste uma imagem aqui</span>
              <span className="text-xs text-muted-foreground">ou</span>
              <span className="rounded-xl border border-border px-4 py-2 text-sm font-medium">
                Selecionar imagem
              </span>
              {imageName ? (
                <span className="text-xs text-muted-foreground">Selecionado: {imageName}</span>
              ) : null}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setImageName(event.target.files?.[0]?.name ?? null)}
              />
            </label>

            <div className="flex flex-col gap-3 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Envie uma imagem e o Prompt X criará uma descrição profissional para reproduzir seu
                estilo.
              </p>
              <Badge variant="secondary" className="w-fit shrink-0">
                Em breve com IA
              </Badge>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
