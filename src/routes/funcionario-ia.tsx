import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/funcionario-ia")({
  head: () => ({
    meta: [
      { title: "Funcionário IA — Projeto X" },
      { name: "description", content: "Seu assistente inteligente para vendas e marketing." },
      { property: "og:title", content: "Funcionário IA — Projeto X" },
      { property: "og:description", content: "Seu assistente inteligente para vendas e marketing." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Funcionário IA"
      description="Seu assistente inteligente para vendas e marketing."
      icon={Bot}
    />
  );
}
