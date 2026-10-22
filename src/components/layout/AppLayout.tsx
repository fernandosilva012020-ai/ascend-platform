import { type ReactNode, useEffect, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [checkingPlan, setCheckingPlan] = useState(true);

  useEffect(() => {
    async function enforceSubscription() {
      if (authLoading) return;

      if (!user) {
        setCheckingPlan(false);
        return;
      }

      // Se já estiver na tela de assinatura, não precisa redirecionar
      if (pathname === "/assinatura") {
        setCheckingPlan(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("plano")
          .eq("id", user.id)
          .maybeSingle();

        const plan = data?.plano?.toLowerCase();

        // Se não for premium, bloqueia a navegação e manda para /assinatura
        if (error || plan !== "premium") {
          toast.warning("Assine um plano para acessar as ferramentas.");
          void navigate({ to: "/assinatura", replace: true });
          return;
        }
      } catch (err) {
        console.error("Erro ao verificar restrição de plano:", err);
      } finally {
        setCheckingPlan(false);
      }
    }

    enforceSubscription();
  }, [user, authLoading, pathname, navigate]);

  if (authLoading || (checkingPlan && pathname !== "/assinatura")) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1 bg-background">
          <AppHeader />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}