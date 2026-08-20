import { createFileRoute } from "@tanstack/react-router";
import { Library } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Projeto X" },
      { name: "description", content: "Materiais, criativos e documentos." },
      { property: "og:title", content: "Biblioteca — Projeto X" },
      { property: "og:description", content: "Materiais, criativos e documentos." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Biblioteca"
      description="Materiais, criativos e documentos."
      icon={Library}
    />
  );
}
