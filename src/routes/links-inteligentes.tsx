import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/links-inteligentes")({
  head: () => ({
    meta: [
      { title: "Links Inteligentes — Projeto X" },
      { name: "description", content: "Links rastreáveis com métricas de conversão." },
      { property: "og:title", content: "Links Inteligentes — Projeto X" },
      { property: "og:description", content: "Links rastreáveis com métricas de conversão." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Links Inteligentes"
      description="Links rastreáveis com métricas de conversão."
      icon={Link2}
    />
  );
}
