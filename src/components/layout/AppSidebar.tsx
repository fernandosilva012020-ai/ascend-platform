import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, Hexagon, Loader2, MessageSquare } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navGroups } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<{ nome: string | null; plano: string | null } | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("nome, plano")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
    }

    loadUserProfile();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success("Sessão encerrada");
      navigate({ to: "/login", replace: true });
    } catch (error) {
      toast.error("Erro ao sair");
      console.error(error);
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName =
    profile?.nome ||
    user?.user_metadata?.["full_name"] ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const rawPlan = profile?.plano || "free";
  const displayPlan = rawPlan.toLowerCase() === "premium" ? "Plano Premium" : "Plano Gratuito";

  const initials = (displayName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link
          to="/"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-3 rounded-lg px-1 py-1"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-brand shadow-[0_6px_20px_-8px] shadow-sidebar-primary">
            <Hexagon className="size-5 text-sidebar-primary-foreground" strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight text-sidebar-accent-foreground">
                Projeto X
              </span>
              <span className="block truncate text-[11px] text-sidebar-foreground/60">
                Plataforma de crescimento
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group, i) => (
          <SidebarGroup key={group.label ?? `group-${i}`} className="py-1">
            {group.label && !collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-[inset_2px_0_0_0] shadow-sidebar-primary",
                        )}
                      >
                        <Link to={item.url} onClick={() => setOpenMobile(false)}>
                          <item.icon
                            className={cn("size-4 shrink-0", active && "text-sidebar-primary")}
                          />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        ))}

        {/* Atalho direto injetado para Automação WhatsApp */}
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
  <SidebarMenuButton
    asChild
    isActive={pathname === "/whatsapp-automation"}
    tooltip="Automação WhatsApp"
  >
    <Link to="/whatsapp-automation" onClick={() => setOpenMobile(false)}>
      <MessageSquare className="size-4 shrink-0" />
      <span className="truncate">Automação WhatsApp</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-2",
            collapsed && "justify-center px-0",
        )}
        >
          <Avatar className="size-9 shrink-0 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                {displayName}
              </p>
              <p
                className={cn(
                  "truncate text-[11px] font-medium",
                  rawPlan.toLowerCase() === "premium" ? "text-sidebar-primary" : "text-slate-400",
                )}
              >
                {displayPlan}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              aria-label="Sair"
              onClick={handleLogout}
              disabled={loggingOut}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}