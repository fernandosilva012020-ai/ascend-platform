import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Metric } from "@/data/mock";

export function MetricCard({ metric, icon: Icon }: { metric: Metric; icon: LucideIcon }) {
  const positive = metric.change >= 0;
  const Trend = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="surface-card group relative overflow-hidden p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-accent/70 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight break-words">
            {metric.value}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="relative mt-4 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            positive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
          )}
        >
          <Trend className="size-3" />
          {positive ? "+" : ""}
          {metric.change.toFixed(1)}%
        </span>
        <span className="truncate text-xs text-muted-foreground">{metric.hint}</span>
      </div>
    </div>
  );
}
