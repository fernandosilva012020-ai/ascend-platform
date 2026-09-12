import { Check, Copy, RefreshCw, Save, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type PromptQuality = {
  score: number;
  label: string;
  checks: string[];
};

type Props = {
  prompt: string;
  quality: PromptQuality;
  favorite: boolean;
  onRegenerate: () => void;
  onEnhance: () => void;
  onToggleFavorite: () => void;
};

export function PromptResult({
  prompt,
  quality,
  favorite,
  onRegenerate,
  onEnhance,
  onToggleFavorite,
}: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar o prompt.");
    }
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Seu Prompt</h2>
          <p className="text-sm text-muted-foreground">
            Pronto para colar na IA escolhida.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {quality.score}/100 — {quality.label}
        </Badge>
      </div>

      <div className="space-y-5 p-6">
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-muted p-5 font-mono text-xs leading-relaxed text-foreground sm:text-sm">
          {prompt}
        </pre>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={copy}>
            <Copy className="size-4" />
            Copiar
          </Button>
          <Button type="button" variant="outline" onClick={onEnhance}>
            <Sparkles className="size-4" />
            Melhorar
          </Button>
          <Button type="button" variant="outline" onClick={onRegenerate}>
            <RefreshCw className="size-4" />
            Gerar novamente
          </Button>
          <Button type="button" variant="outline" onClick={onToggleFavorite}>
            <Star className={favorite ? "size-4 fill-current" : "size-4"} />
            {favorite ? "Favoritado" : "Favoritar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success("Prompt salvo na sua biblioteca.")}
          >
            <Save className="size-4" />
            Salvar
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Qualidade do Prompt</span>
            <span className="text-muted-foreground">
              {quality.score}/100 — {quality.label}
            </span>
          </div>
          <Progress value={quality.score} />
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {quality.checks.map((check) => (
              <li key={check} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 text-primary" />
                {check}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
