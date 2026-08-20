import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — Projeto X" },
      { name: "description", content: "Programa de indicações e comissões." },
      { property: "og:title", content: "Parceiros — Projeto X" },
      { property: "og:description", content: "Programa de indicações e comissões." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Parceiros"
      description="Programa de indicações e comissões."
      icon={Wallet}
    />
  );
}
