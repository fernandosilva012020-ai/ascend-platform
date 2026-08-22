import { useRouterState } from "@tanstack/react-router";
import { Bell, Search, Plus, Sparkles, UserPlus, Globe, Megaphone } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNavItem } from "@/config/navigation";
import { currentUser as mockUser, notifications } from "@/data/mock";
import { useAuth } from "@/hooks/useAuth";


const quickActions = [
  { label: "Criar com IA", icon: Sparkles },
  { label: "Novo Lead", icon: UserPlus },
  { label: "Criar Landing Page", icon: Globe },
  { label: "Nova Campanha", icon: Megaphone },
];

export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const item = getNavItem(pathname);
  const { user } = useAuth();

  const displayName = user?.user_metadata?.['full_name'] || user?.email?.split('@')[0] || mockUser.name;
  const initials = (displayName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);


  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="shrink-0 text-muted-foreground" />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {item?.title ?? "Projeto X"}
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {item?.description ?? "Plataforma de crescimento"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="h-9 w-56 rounded-xl bg-muted/60 pl-9 xl:w-72"
            />
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Pesquisar">
            <Search className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                  <span className="text-sm">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="premium" size="sm" className="hidden sm:inline-flex">
                <Plus className="size-4" />
                Ações rápidas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {quickActions.map((a) => (
                <DropdownMenuItem key={a.label}>
                  <a.icon className="size-4 text-primary" />
                  {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="size-9 border border-border">
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

        </div>
      </div>
    </header>
  );
}
