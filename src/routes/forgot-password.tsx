import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hexagon, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }

    setLoading(true);
    console.log("Iniciando processo de recuperação de senha para:", email.trim());

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error("Erro completo do Supabase Auth:", error);
        toast.error("Não foi possível carregar as licenças. Tente novamente.", {
          description: error.message,
        });
      } else {
        console.log("Chamada resetPasswordForEmail executada com sucesso.");
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Erro inesperado durante a recuperação de senha:", err);
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-lg">
            <span className="grid size-12 place-items-center rounded-xl gradient-brand">
              <Hexagon className="size-7 text-white" strokeWidth={2.2} />
            </span>
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
            Recuperar senha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {submitted 
              ? "Instruções enviadas para o seu e-mail" 
              : "Informe seu e-mail para receber o link de recuperação"}
          </p>
        </div>

        <div className="surface-card p-8">
          {submitted ? (
            <div className="space-y-6">
              <div className="rounded-xl bg-primary/10 p-4 text-center text-sm text-primary">
                Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e também a pasta de spam.
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 size-4" />
                  Voltar para o login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" variant="premium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-primary hover:underline inline-flex items-center">
                  <ArrowLeft className="mr-2 size-3" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          © 2026 Projeto X. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
