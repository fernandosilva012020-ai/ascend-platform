import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/minha-rede")({
  head: () => ({
    meta: [
      { title: "Minha Rede — Projeto X" },
      { name: "description", content: "Estrutura da sua rede de parceiros." },
      { property: "og:title", content: "Minha Rede — Projeto X" },
      { property: "og:description", content: "Estrutura da sua rede de parceiros." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Minha Rede"
      description="Estrutura da sua rede de parceiros."
      icon={Network}
    />
  );
}
