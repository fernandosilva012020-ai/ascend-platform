import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function WhatsappAutomation() {
  const [status, setStatus] = useState("Verificando...");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

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
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

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
            <div className="mt-2 text-xs font-mono bg-muted/50 p-4 rounded-lg border border-border text-muted-foreground break-all">
              <strong className="text-foreground block mb-1">QR Code / Dados de Conexão:</strong>
              {qrCode ? qrCode : "Aguardando geração do QR Code pelo terminal..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}