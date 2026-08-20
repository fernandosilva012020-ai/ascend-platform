import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Projeto X" },
      { name: "description", content: "Indicadores e desempenho detalhado." },
      { property: "og:title", content: "Relatórios — Projeto X" },
      { property: "og:description", content: "Indicadores e desempenho detalhado." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Relatórios"
      description="Indicadores e desempenho detalhado."
      icon={TrendingUp}
    />
  );
}
