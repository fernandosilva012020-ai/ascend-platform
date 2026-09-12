import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Hexagon, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/update-password")({
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Senha muito curta", {
        description: "A senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Senhas não conferem", {
        description: "Certifique-se de que as duas senhas são iguais.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error("Erro ao atualizar senha", {
          description: error.message,
        });
      } else {
        setSuccess(true);
        toast.success("Senha alterada com sucesso!");
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 3000);
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
            Criar nova senha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {success 
              ? "Sua senha foi atualizada com sucesso" 
              : "Defina sua nova credencial de acesso"}
          </p>
        </div>

        <div className="surface-card p-8">
          {success ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                Sua senha foi alterada com sucesso! Redirecionando para o login em instantes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
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
                    minLength={8}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" variant="premium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
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
