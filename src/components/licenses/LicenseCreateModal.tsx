import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Check, Copy, Sparkles } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";

interface LicenseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseCreateModal({
  isOpen,
  onClose,
}: LicenseCreateModalProps) {
  const { session } = useAuth();

  const [step, setStep] = useState<"form" | "success">("form");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [customDeviceLimit, setCustomDeviceLimit] = useState("");
  const [customExpiryDate, setCustomExpiryDate] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    plan: "PRO",
    type: "period",
    period: "30",
    deviceLimit: "1",
  });

  const handleGenerate = async () => {
    if (!formData.clientName.trim()) {
      toast.error("Por favor, informe o nome do cliente.");
      return;
    }

    if (!session?.access_token) {
      toast.error("Sessão administrativa não encontrada.");
      return;
    }

    const planMap: Record<string, string> = {
      "Básico": "basico",
      "PRO": "pro",
      "Premium": "premium",
      "Teste": "teste",
    };

    const maxDevices =
      formData.deviceLimit === "custom"
        ? Number(customDeviceLimit)
        : Number(formData.deviceLimit);

    if (
      !Number.isInteger(maxDevices) ||
      maxDevices < 1 ||
      maxDevices > 20
    ) {
      toast.error("Informe um limite entre 1 e 20 dispositivos.");
      return;
    }

    if (
      formData.type === "period" &&
      formData.period === "custom" &&
      !customExpiryDate
    ) {
      toast.error("Informe a data de validade.");
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        action: "create",
        user_name: formData.clientName.trim(),
        plan: planMap[formData.plan] || "pro",
        lifetime: formData.type === "lifetime",
        max_devices: maxDevices,
      };

      if (formData.type === "period") {
        if (formData.period === "custom") {
          const customDate = new Date(
            `${customExpiryDate}T23:59:59`
          );

          if (Number.isNaN(customDate.getTime())) {
            toast.error("Data de validade inválida.");
            setLoading(false);
            return;
          }

          body.expires_at = customDate.toISOString();
        } else {
          body.duration_days = Number(formData.period);
        }
      }

      const { data, error } = await supabase.functions.invoke(
        "xforge-admin",
        {
          body,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Erro ao criar licença:", error);
        toast.error(
          error.message || "Não foi possível criar a licença."
        );
        return;
      }

      if (!data?.ok || !data?.license_key) {
        console.error("Resposta inválida:", data);
        toast.error(
          data?.message || "Não foi possível criar a licença."
        );
        return;
      }

      setGeneratedCode(data.license_key);
      setStep("success");

      toast.success("Licença criada no Supabase com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar licença:", error);
      toast.error("Não foi possível criar a licença.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    toast.success("Código copiado!");
  };

  const resetAndClose = () => {
    setStep("form");
    setGeneratedCode("");
    setCustomDeviceLimit("");
    setCustomExpiryDate("");

    setFormData({
      clientName: "",
      plan: "PRO",
      type: "period",
      period: "30",
      deviceLimit: "1",
    });

    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetAndClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Criar Nova Licença
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">
                  Nome do cliente
                </Label>

                <Input
                  id="clientName"
                  placeholder="Ex: Fernando Silva"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Plano</Label>

                  <Select
                    value={formData.plan}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        plan: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Básico">
                        Básico
                      </SelectItem>

                      <SelectItem value="PRO">
                        PRO
                      </SelectItem>

                      <SelectItem value="Premium">
                        Premium
                      </SelectItem>

                      <SelectItem value="Teste">
                        Teste
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Limite de dispositivos</Label>

                  <Select
                    value={formData.deviceLimit}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        deviceLimit: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">
                        1 dispositivo
                      </SelectItem>

                      <SelectItem value="2">
                        2 dispositivos
                      </SelectItem>

                      <SelectItem value="3">
                        3 dispositivos
                      </SelectItem>

                      <SelectItem value="5">
                        5 dispositivos
                      </SelectItem>

                      <SelectItem value="custom">
                        Personalizado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.deviceLimit === "custom" && (
                <div className="grid gap-2">
                  <Label>Quantidade de dispositivos</Label>

                  <Input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Ex: 10"
                    value={customDeviceLimit}
                    onChange={(e) =>
                      setCustomDeviceLimit(e.target.value)
                    }
                  />
                </div>
              )}

              <div className="grid gap-3">
                <Label>Tipo de licença</Label>

                <RadioGroup
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      type: v,
                    })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="period"
                      id="period"
                    />

                    <Label
                      htmlFor="period"
                      className="font-normal"
                    >
                      Por período
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="lifetime"
                      id="lifetime"
                    />

                    <Label
                      htmlFor="lifetime"
                      className="font-normal"
                    >
                      Vitalícia
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.type === "period" && (
                <div className="grid gap-2">
                  <Label>Duração</Label>

                  <Select
                    value={formData.period}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        period: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="7">
                        7 dias
                      </SelectItem>

                      <SelectItem value="15">
                        15 dias
                      </SelectItem>

                      <SelectItem value="30">
                        30 dias
                      </SelectItem>

                      <SelectItem value="90">
                        90 dias
                      </SelectItem>

                      <SelectItem value="180">
                        180 dias
                      </SelectItem>

                      <SelectItem value="365">
                        365 dias
                      </SelectItem>

                      <SelectItem value="custom">
                        Data personalizada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === "period" &&
                formData.period === "custom" && (
                  <div className="grid gap-2">
                    <Label>Data de validade</Label>

                    <Input
                      type="date"
                      value={customExpiryDate}
                      onChange={(e) =>
                        setCustomExpiryDate(e.target.value)
                      }
                    />
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetAndClose}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                variant="premium"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading
                  ? "Gerando..."
                  : "Gerar licença"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                Licença Gerada!
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 grid size-16 place-items-center rounded-full bg-success/10 text-success">
                <Check className="size-8" />
              </div>

              <p className="text-sm text-muted-foreground">
                A licença para{" "}
                <strong>{formData.clientName}</strong>{" "}
                foi criada no servidor com sucesso.
              </p>

              <div className="mt-6 w-full space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Código da Licença
                </Label>

                <div className="relative">
                  <Input
                    readOnly
                    value={generatedCode}
                    className="h-12 bg-muted/50 text-center font-mono text-lg font-bold tracking-wider"
                  />

                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 size-10"
                    onClick={copyCode}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                onClick={resetAndClose}
              >
                Fechar e Voltar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
