import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Academy — Projeto X" },
      { name: "description", content: "Trilhas de treinamento para sua equipe." },
      { property: "og:title", content: "Academy — Projeto X" },
      { property: "og:description", content: "Trilhas de treinamento para sua equipe." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Academy"
      description="Trilhas de treinamento para sua equipe."
      icon={GraduationCap}
    />
  );
}
