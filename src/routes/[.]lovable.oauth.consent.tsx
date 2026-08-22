import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hexagon, Check, X, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/login", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    // Using explicit types for beta oauth methods if needed
    const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="surface-card p-8 max-w-md w-full text-center space-y-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Erro de Autorização</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {String((error as Error)?.message ?? error)}
        </p>
        <Button asChild variant="outline" className="w-full">
          <a href="/">Voltar para o Início</a>
        </Button>
      </div>
    </div>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { data, error: authError } = approve
        ? await (supabase.auth as any).oauth.approveAuthorization(authorization_id)
        : await (supabase.auth as any).oauth.denyAuthorization(authorization_id);
      
      if (authError) {
        setBusy(false);
        setError(authError.message);
        return;
      }
      
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("Não foi possível processar o redirecionamento.");
        return;
      }
      
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e.message || "Ocorreu um erro inesperado.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="surface-card p-8 max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-lg border border-border/50">
            <span className="grid size-12 place-items-center rounded-xl gradient-brand">
              <Hexagon className="size-7 text-white" strokeWidth={2.2} />
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Conectar {details?.client?.name ?? "Aplicativo"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Este aplicativo solicita permissão para acessar sua conta Projeto X.
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Permissões Solicitadas:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Acesso à sua identidade (ID e E-mail)</li>
                <li>Gerenciamento de licenças XForge Pro</li>
                <li>Agir em seu nome dentro da plataforma</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg flex items-center gap-2 border border-destructive/20">
            <AlertCircle className="size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => decide(true)} 
            disabled={busy} 
            variant="premium" 
            className="w-full h-11"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Check className="size-4 mr-2" />
            )}
            Autorizar Acesso
          </Button>
          <Button 
            onClick={() => decide(false)} 
            disabled={busy} 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          >
            <X className="size-4 mr-2" />
            Negar
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
          Ao autorizar, você permite que este aplicativo acesse seus dados de acordo com os 
          <a href="#" className="hover:underline text-primary ml-1">Termos de Serviço</a>.
        </p>
      </div>
    </div>
  );
}
