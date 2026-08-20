import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Projeto X" },
      { name: "description", content: "Gerencie leads, contatos e oportunidades." },
      { property: "og:title", content: "CRM — Projeto X" },
      { property: "og:description", content: "Gerencie leads, contatos e oportunidades." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="CRM"
      description="Gerencie leads, contatos e oportunidades."
      icon={Users}
    />
  );
}
