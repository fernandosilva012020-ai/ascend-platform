import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Hexagon,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { externalSupabase } from "@/integrations/supabase/external-client";
import { loadPublicReferrer, type PublicReferrer } from "@/lib/network";

export const Route = createFileRoute("/convite/$code")({
  head: () => ({
    meta: [
      { title: "Convite — Projeto X" },
      {
        name: "description",
        content: "Cadastre-se na comunidade Projeto X através de um parceiro.",
      },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [referrer, setReferrer] = useState<PublicReferrer | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;

    loadPublicReferrer(code)
      .then((data) => {
        if (active) setReferrer(data);
      })
      .catch(() => {
        if (active) setReferrer(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [code]);

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    if (!referrer) return;

    setSubmitting(true);
    try {
      const cleanEmail = email.trim();
      const { data, error } = await externalSupabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            referral_code: referrer.referralCode,
          },
        },
      });

      if (error) throw error;

      // A confirmação de e-mail pode impedir o login até a verificação.
      if (!data.session) {
        toast.success("Cadastro recebido! Confirme seu e-mail para entrar.");
        void navigate({ to: "/login" });
        return;
      }

      toast.success("Conta criada! Continue para a assinatura.");
      void navigate({ to: "/assinatura" });
    } catch (caughtError) {
      toast.error("Não foi possível criar o cadastro.", {
        description:
          caughtError instanceof Error ? caughtError.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!referrer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card w-full max-w-md p-8 text-center">
          <Hexagon className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-display text-2xl font-bold">Convite inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este convite não existe ou pertence a um parceiro que não está ativo.
          </p>
          <Button asChild className="mt-6">
            <Link to="/login">Ir para o login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl gradient-brand">
            <Hexagon className="size-7 text-white" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Entre para o Projeto X</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Convite enviado por <strong className="text-foreground">{referrer.displayName}</strong>
          </p>
        </div>

        <div className="surface-card p-7">
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-semibold">Comunidade completa por R$49,90/mês</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Participar do programa de parceiros é opcional. Comissões dependem de
              assinaturas efetivamente pagas e não representam promessa de ganho.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password">Crie uma senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" variant="premium" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar minha conta"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}