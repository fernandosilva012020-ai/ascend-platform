import { cn } from "@/lib/utils";
import { promptCategories } from "@/data/promptStudio";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function PromptCategorySelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {promptCategories.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={selected}
            className={cn(
              "group flex flex-col gap-1.5 rounded-2xl border bg-card p-4 text-left transition-all",
              "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
              selected
                ? "border-primary/60 bg-primary/5 shadow-md ring-1 ring-primary/30"
                : "border-border",
            )}
          >
            <span className="text-2xl leading-none">{category.emoji}</span>
            <span className="text-sm font-semibold">{category.name}</span>
            <span className="text-xs leading-snug text-muted-foreground">
              {category.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
