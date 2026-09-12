import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Lock, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function WhatsappAutomation() {
  const [status, setStatus] = useState("Desconectado");
  const [qrCode, setQrCode] = useState("");
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function initUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingPlan(false);
          return;
        }

        setUserId(user.id);

        const { data } = await supabase
          .from("profiles")
          .select("plano")
          .eq("id", user.id)
          .maybeSingle();

        const isPremiumPlan = data?.plano?.toLowerCase() === "premium";

        // Permite abrir se for plano Premium OU se o MASTER_USER_ID bater no .env
        if (isPremiumPlan || user.id === "jddgebxqwmxngfitcftb") {
          setIsPremium(true);

          // 1. Registra solicitação no Supabase com log claro
          const { error: upsertErr } = await supabase
            .from("user_whatsapp_sessions")
            .upsert({
              user_id: user.id,
              status: "Solicitado",
              updated_at: new Date().toISOString()
            });

          if (upsertErr) {
            console.error("Erro ao registrar solicitação no Supabase:", upsertErr.message);
          } else {
            console.log("✅ Solicitação de WhatsApp enviada para o banco com sucesso!");
          }

          // 2. Tenta acionar a API do servidor local
          fetch("http://localhost:3000/api/start-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }).catch(() => {
            fetch("/api/start-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.id }),
            }).catch(e => console.log("start-session fallback:", e));
          });
        }
      } catch (err) {
        console.error("Erro ao verificar conta:", err);
      } finally {
        setCheckingPlan(false);
      }
    }

    initUser();
  }, []);

  const fetchUserStatus = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("user_whatsapp_sessions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setStatus(data.status || "Desconectado");
        setQrCode(data.qr_code || "");
      }
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    }
  };

  useEffect(() => {
    if (isPremium && userId) {
      fetchUserStatus();
      const interval = setInterval(fetchUserStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isPremium, userId]);

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
            Sua própria automação do WhatsApp dedicada. Ative sua assinatura Premium para liberar a geração do seu QR Code individual.
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Automação WhatsApp Dedicada</h1>
        <p className="text-muted-foreground text-sm">Escaneie com seu número de atendimento para conectar seu agente exclusivo.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Status da Sua Conexão</h2>
              <p className="text-xs text-muted-foreground">Instância individual gerenciada em tempo real</p>
            </div>
          </div>
          <button 
            onClick={fetchUserStatus} 
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
              <strong className="text-foreground text-sm">Escaneie o seu QR Code individual:</strong>
              {qrCode && qrCode.startsWith("data:image") ? (
                <img
                  src={qrCode}
                  alt="Seu QR Code individual"
                  className="w-64 h-64 rounded-lg border border-border bg-white p-2"
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Gerando instância dedicada para seu número...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}