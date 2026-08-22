import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Calendar,
  Laptop,
  User,
  ShieldCheck,
  History,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface LicenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: any;
}

export function LicenseDetailsModal({ isOpen, onClose, license }: LicenseDetailsModalProps) {
  if (!license) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(license.code);
    toast.success("Código copiado!");
  };

  const DetailItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-background text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="size-5 text-primary" />
              Detalhes da Licença
            </span>
            <Badge
              variant="secondary"
              className={
                license.status === "Ativa"
                  ? "bg-success/10 text-success"
                  : license.status === "Bloqueada"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
              }
            >
              {license.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Informações do Cliente
            </h4>
            <div className="grid gap-3">
              <DetailItem label="Cliente" value={license.client} icon={User} />
              <div className="relative">
                <DetailItem label="Código da Licença" value={license.code} icon={Key} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                  onClick={copyCode}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <DetailItem label="Plano" value={license.plan} icon={ShieldCheck} />
              <DetailItem label="Tipo de Licença" value={license.validity === "Vitalícia" ? "Vitalícia" : "Por Período"} icon={Calendar} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Uso e Dispositivos
            </h4>
            <div className="grid gap-3">
              <DetailItem label="Limite de Dispositivos" value={license.devices} icon={Laptop} />
              <DetailItem label="Último Acesso" value={license.lastAccess} icon={History} />
              <DetailItem label="Data de Criação" value="22/08/2026 10:30" icon={Calendar} />
              <DetailItem label="Identificação do Dispositivo" value="Desktop-WINDOWS-10-X64-..." icon={Laptop} />
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {license.status === "Ativa" ? (
            <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
              <Lock className="size-4" /> Bloquear licença
            </Button>
          ) : (
            <Button variant="outline" className="gap-2 text-success hover:bg-success/10">
              <Unlock className="size-4" /> Reativar licença
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <RefreshCw className="size-4" /> Resetar dispositivos
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
