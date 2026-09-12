import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { promptHistory } from "@/data/promptStudio";

export function PromptHistory() {
  return (
    <section className="surface-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <History className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Prompts recentes</h2>
      </div>

      <ul className="space-y-3">
        {promptHistory.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-border p-4 transition-colors hover:bg-accent/60"
          >
            <p className="text-sm font-medium leading-snug">{item.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[10px]">
                {item.type}
              </Badge>
              <span>{item.date}</span>
              <span aria-hidden>•</span>
              <span>{item.ai}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
