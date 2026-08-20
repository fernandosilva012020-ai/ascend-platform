import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModulePlaceholder({ title, description, icon: Icon }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="surface-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl gradient-brand">
            <Icon className="size-6 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold sm:text-2xl">{title}</h2>
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Em breve
        </Badge>
      </div>

      <div className="surface-card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-accent">
          <Construction className="size-7 text-accent-foreground" />
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Módulo em desenvolvimento</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Estamos finalizando este módulo. Em breve ele estará disponível com todos os recursos
            do Projeto X.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
