import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";
import { toast } from "sonner";
import { Check, ShieldCheck, Zap, ArrowLeft, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/assinatura")({
  component: AssinaturaPage,
});

function AssinaturaPage() {
  const [loading, setLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [cpf, setCpf] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkCurrentPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingPlan(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("plano")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data?.plano?.toLowerCase() === "premium") {
          setIsPremium(true);
        }
      } catch (err) {
        console.error("Erro ao verificar plano:", err);
      } finally {
        setCheckingPlan(false);
      }
    }

    checkCurrentPlan();
  }, []);

  const handleSubscribe = async () => {
    try {
      const cleanedCpf = cpf.replace(/\D/g, "");

      if (!cleanedCpf || cleanedCpf.length !== 11) {
        toast.error("Por favor, digite um CPF válido com 11 dígitos.");
        return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar logado para assinar.");
        return;
      }

      toast.loading("Gerando fatura de assinatura...", { id: "asaas-sub" });

      const { data, error } = await supabase.functions.invoke("create-asaas-subscription", {
        body: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          cpfCnpj: cleanedCpf,
        },
      });

      if (error) {
        throw new Error(error.message || "Falha ao gerar cobrança.");
      }

      if (data?.invoiceUrl) {
        toast.success("Redirecionando para o pagamento...", { id: "asaas-sub" });
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error(data?.error || "Link de pagamento não retornado.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar assinatura.", { id: "asaas-sub" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingPlan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        {isPremium ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 ring-1 ring-emerald-500/20">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Você já é Premium!</h1>
            <p className="text-sm text-slate-400 mt-2">
              Sua assinatura está ativa e você tem acesso total a todos os recursos da plataforma.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status da assinatura:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                  Ativa
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Plano contratado:</span>
                <span className="text-slate-200 font-medium">Premium Mensal</span>
              </div>
            </div>

            <button
              onClick={() => navigate({ to: "/" })}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-lg text-white transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Acessar Painel
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-3">
                <Zap size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Plano Premium</h1>
              <p className="text-sm text-slate-400 mt-1">
                Desbloqueie acesso completo a todos os recursos
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 mb-6 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Assinatura Mensal
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-white">R$ 49,90</span>
                <span className="text-sm text-slate-400">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Acesso ilimitado às ferramentas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Atualizações e suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Cobrança recorrente via Pix ou Cartão</span>
              </li>
            </ul>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                CPF do titular (obrigatório para emissão da fatura)
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg text-white transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {loading ? "Processando..." : "Assinar por R$ 49,90"}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-4">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Pagamento processado com segurança pelo Asaas</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}