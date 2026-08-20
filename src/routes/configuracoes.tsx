import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Projeto X" },
      { name: "description", content: "Preferências da conta e do workspace." },
      { property: "og:title", content: "Configurações — Projeto X" },
      { property: "og:description", content: "Preferências da conta e do workspace." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Configurações"
      description="Preferências da conta e do workspace."
      icon={Settings}
    />
  );
}
