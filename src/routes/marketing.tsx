import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Central de Marketing — Projeto X" },
      { name: "description", content: "Campanhas, disparos e automações." },
      { property: "og:title", content: "Central de Marketing — Projeto X" },
      { property: "og:description", content: "Campanhas, disparos e automações." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Central de Marketing"
      description="Campanhas, disparos e automações."
      icon={Megaphone}
    />
  );
}
