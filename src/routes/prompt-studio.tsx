import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/prompt-studio")({
  head: () => ({
    meta: [
      { title: "Prompt X Studio — Projeto X" },
      { name: "description", content: "Crie, salve e reutilize prompts profissionais." },
      { property: "og:title", content: "Prompt X Studio — Projeto X" },
      { property: "og:description", content: "Crie, salve e reutilize prompts profissionais." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Prompt X Studio"
      description="Crie, salve e reutilize prompts profissionais."
      icon={Sparkles}
    />
  );
}
