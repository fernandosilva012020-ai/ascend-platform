import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hexagon, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao entrar", {
          description: error.message,
        });
      } else {
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error("Ocorreu um erro inesperado");
      console.error(err);
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
            Projeto X
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para gerenciar seu negócio
          </p>
        </div>

        <div className="surface-card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/forgot-password" disabled={loading} className="text-xs text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

            <Button type="submit" className="w-full" variant="premium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Fale com um consultor
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          © 2026 Projeto X. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
