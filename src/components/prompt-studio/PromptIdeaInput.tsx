import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onEnhance: () => void;
  enhancing: boolean;
};

export function PromptIdeaInput({ value, onChange, onEnhance, enhancing }: Props) {
  return (
    <div className="space-y-3">
      <Label htmlFor="prompt-idea" className="text-base font-semibold">
        Conte sua ideia
      </Label>
      <Textarea
        id="prompt-idea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={1200}
        placeholder={
          'Exemplo: "Quero um vídeo mostrando um hambúrguer artesanal sendo preparado em uma cozinha moderna."'
        }
        className="min-h-32 resize-y text-sm leading-relaxed"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">{value.length}/1200 caracteres</span>
        <Button
          type="button"
          variant="outline"
          onClick={onEnhance}
          disabled={enhancing || value.trim().length === 0}
          className="w-full sm:w-auto"
        >
          <Sparkles className="size-4" />
          {enhancing ? "Melhorando..." : "Melhorar minha ideia com IA"}
        </Button>
      </div>
    </div>
  );
}
