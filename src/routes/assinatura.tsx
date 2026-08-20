import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/assinatura")({
  head: () => ({
    meta: [
      { title: "Assinatura — Projeto X" },
      { name: "description", content: "Plano atual, faturas e upgrades." },
      { property: "og:title", content: "Assinatura — Projeto X" },
      { property: "og:description", content: "Plano atual, faturas e upgrades." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Assinatura"
      description="Plano atual, faturas e upgrades."
      icon={CreditCard}
    />
  );
}
