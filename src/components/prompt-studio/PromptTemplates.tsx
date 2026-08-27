import { Flame, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { promptTemplates } from "@/data/promptStudio";

type Props = {
  onUse: (name: string) => void;
};

export function PromptTemplates({ onUse }: Props) {
  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <Flame className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Templates populares</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {promptTemplates.map((template) => (
          <button
            key={template.name}
            type="button"
            onClick={() => onUse(template.name)}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold leading-snug">{template.name}</span>
              {template.pro ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  PRO
                </Badge>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">{template.category}</span>
          </button>
        ))}
      </div>

      <Button variant="outline" className="mt-5 w-full sm:w-auto" asChild>
        <Link to="/biblioteca">
          Ver biblioteca completa
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </section>
  );
}
