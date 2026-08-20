import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Projeto X" },
      { name: "description", content: "Produtos, ofertas e checkout." },
      { property: "og:title", content: "Loja — Projeto X" },
      { property: "og:description", content: "Produtos, ofertas e checkout." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ModulePlaceholder
      title="Loja"
      description="Produtos, ofertas e checkout."
      icon={ShoppingCart}
    />
  );
}
