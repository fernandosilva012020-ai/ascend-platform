import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/tabuleiro")({
  head: () => ({
    meta: [
      { title: "Tabuleiro — Projeto X" },
      { name: "description", content: "Acompanhe sua evolução no plano de carreira." },
      { property: "og:title", content: "Tabuleiro — Projeto X" },
      { property: "og:description", content: "Acompanhe sua evolução no plano de carreira." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Tabuleiro"
      description="Acompanhe sua evolução no plano de carreira."
      icon={LayoutGrid}
    />
  );
}
