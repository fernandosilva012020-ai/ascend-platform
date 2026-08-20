import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/landing-pages")({
  head: () => ({
    meta: [
      { title: "Landing Pages — Projeto X" },
      { name: "description", content: "Publique páginas de captura em minutos." },
      { property: "og:title", content: "Landing Pages — Projeto X" },
      { property: "og:description", content: "Publique páginas de captura em minutos." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Landing Pages"
      description="Publique páginas de captura em minutos."
      icon={Globe}
    />
  );
}
