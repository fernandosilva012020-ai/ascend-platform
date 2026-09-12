import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Lock, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function WhatsappAutomation() {
  const [status, setStatus] = useState("Verificando...");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkPlan() {
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
        console.error("Erro ao verificar assinatura:", err);
      } finally {
        setCheckingPlan(false);
      }
    }

    checkPlan();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await supabase
        .from("bot_status")
        .select("*")
        .eq("id", 1)
        .single();

      if (data) {
        setStatus(data.status || "Desconectado");
        setQrCode(data.qr_code || "");
      }
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isPremium]);

  if (checkingPlan) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Recurso Exclusivo para Assinantes</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            A automação e integração com WhatsApp é um recurso do plano <strong>Premium</strong>. Ative sua assinatura para escanear o QR Code e liberar seu Agente de IA.
          </p>
          <button
            onClick={() => navigate({ to: "/assinatura" })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition cursor-pointer shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            Conhecer Plano Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Automação WhatsApp</h1>
        <p className="text-muted-foreground text-sm">Gerencie o agente de atendimento e o status de conexão via Supabase.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Status do Agente</h2>
              <p className="text-xs text-muted-foreground">Sincronizado com o servidor local (server.js)</p>
            </div>
          </div>
          <button 
            onClick={fetchStatus} 
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        <div className="p-5 rounded-xl bg-background border border-border flex flex-col gap-3">
          <div className="flex items-center gap-2 font-semibold text-base">
            {status === "Conectado" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            <span className={status === "Conectado" ? "text-emerald-500" : "text-amber-500"}>
              {status}
            </span>
          </div>

          {status !== "Conectado" && (
            <div className="mt-2 flex flex-col items-center gap-3 bg-muted/50 p-6 rounded-lg border border-border">
              <strong className="text-foreground text-sm">Escaneie com o WhatsApp:</strong>
              {qrCode && qrCode.startsWith("data:image") ? (
                <img
                  src={qrCode}
                  alt="QR Code para conectar o WhatsApp"
                  className="w-64 h-64 rounded-lg border border-border bg-white p-2"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Aguardando geração do QR Code pelo terminal...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}