import { cn } from "@/lib/utils";
import { promptLevels, type PromptLevel } from "@/data/promptStudio";

type Props = {
  value: PromptLevel;
  onChange: (level: PromptLevel) => void;
};

export function PromptLevelSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {promptLevels.map((level) => {
        const selected = level.id === value;
        return (
          <button
            key={level.id}
            type="button"
            onClick={() => onChange(level.id)}
            aria-pressed={selected}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
              selected
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-card",
            )}
          >
            <p className="text-sm font-semibold">
              <span aria-hidden className="mr-1.5">
                {level.emoji}
              </span>
              {level.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{level.description}</p>
          </button>
        );
      })}
    </div>
  );
}
