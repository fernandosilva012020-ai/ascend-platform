import { cn } from "@/lib/utils";
import { aiTargets } from "@/data/promptStudio";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function AISelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {aiTargets.map((ai) => {
        const selected = ai.id === value;
        return (
          <button
            key={ai.id}
            type="button"
            onClick={() => onChange(ai.id)}
            aria-pressed={selected}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              selected
                ? "border-transparent gradient-brand text-primary-foreground shadow-md"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
            )}
          >
            <span aria-hidden>{ai.emoji}</span>
            {ai.name}
          </button>
        );
      })}
    </div>
  );
}
