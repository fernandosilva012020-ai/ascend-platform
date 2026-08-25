import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {

  Key,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  MoreVertical,
  Copy,
  Lock,
  Unlock,
  RefreshCw,
  Edit,
  Trash,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LicenseCreateModal } from "@/components/licenses/LicenseCreateModal";
import { LicenseDetailsModal } from "@/components/licenses/LicenseDetailsModal";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";

export const Route = createFileRoute("/licencas-xforge")({
  head: () => ({
    meta: [
      { title: "Licenças XForge Pro — Projeto X" },
      {
        name: "description",
        content: "Gerencie ativações, clientes e dispositivos da extensão XForge Pro.",
      },
    ],
  }),
  component: LicensesPage,
});

type LicenseStatus = "active" | "expired" | "suspended" | "revoked";

interface License {
  id: string;
  user_name: string;
  key_preview: string;
  plan: string;
  display_status: LicenseStatus;
  lifetime: boolean;
  expires_at: string | null;
  device_count: number;
  max_devices: number;
  last_validated_at: string | null;
}

interface Metrics {
  active: number;
  expired: number;
  blocked: number;
  devices: number;
}

function LicensesPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);

  const [metrics, setMetrics] = useState<Metrics>({
    active: 0,
    expired: 0,
    blocked: 0,
    devices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session) {
        setError("Sessão administrativa não encontrada.");
        setLoading(false);
        return;
      }


      const { data, error: invokeError } = await supabase.functions.invoke(
        "xforge-admin",
        {
          body: { action: "list" },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (invokeError) {
        if (invokeError.status === 401) {
          setError("Sessão expirada. Entre novamente.");
        } else if (invokeError.status === 403) {
          setError("Esta conta não possui permissão para administrar as licenças XForge.");
        } else {
          setError("Não foi possível carregar as licenças. Tente novamente.");
        }
        return;
      }

      if (data?.ok) {
        setLicenses(data.licenses || []);
        setMetrics(data.metrics || { active: 0, expired: 0, blocked: 0, devices: 0 });
      } else {
        toast.error("Não foi possível carregar as licenças. Tente novamente.");
        setError("Não foi possível carregar as licenças. Tente novamente.");
      }
    } catch (err) {
      console.error("Error fetching licenses:", err);
      toast.error("Não foi possível carregar as licenças. Tente novamente.");
      setError("Não foi possível carregar as licenças. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchLicenses();
    }
  }, [authLoading]);


  const getStatusLabel = (status: LicenseStatus) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "expired":
        return "Expirada";
      case "suspended":
      case "revoked":
        return "Bloqueada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: LicenseStatus) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "expired":
        return "bg-warning/10 text-warning";
      case "suspended":
      case "revoked":
        return "bg-destructive/10 text-destructive";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch =
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.key_preview.toLowerCase().includes(search.toLowerCase());
    
    const mappedStatus = getStatusLabel(l.display_status);
    const matchesStatus = statusFilter === "all" || mappedStatus === statusFilter;
    const matchesPlan = planFilter === "all" || l.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código da licença copiado!");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Licenças XForge Pro
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie ativações, clientes e dispositivos da extensão XForge Pro.
          </p>
        </div>
        <Button variant="premium" className="w-full sm:w-auto" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="size-4" />
          Criar licença
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Licenças Ativas", value: metrics.active, icon: CheckCircle2, color: "text-success" },
          { label: "Licenças Expiradas", value: metrics.expired, icon: Clock, color: "text-warning" },
          { label: "Licenças Bloqueadas", value: metrics.blocked, icon: AlertCircle, color: "text-destructive" },
          { label: "Dispositivos Ativos", value: metrics.devices, icon: Laptop, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {loading ? (
                   <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
                )}
              </div>
              <span className={`grid size-10 place-items-center rounded-xl bg-accent ${stat.color}`}>
                <stat.icon className="size-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cliente ou código da licença..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Bloqueada">Bloqueada</SelectItem>
                    <SelectItem value="Expirada">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Plano:</span>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Teste">Teste</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Validade</th>
                <th className="px-6 py-4">Dispositivos</th>
                <th className="px-6 py-4">Último acesso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Carregando licenças...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-[400px] flex-col items-center">
                      <AlertCircle className="size-8 text-destructive" />
                      <p className="mt-4 text-base font-medium text-foreground text-center">
                        {error}
                      </p>
                      {error === "Sessão administrativa não encontrada." || error === "Sessão expirada. Entre novamente." ? (
                        <Button variant="premium" className="mt-4" asChild>
                          <Link to="/">Entrar novamente</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="mt-4" onClick={fetchLicenses}>
                          Tentar novamente
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filteredLicenses.length > 0 ? (
                filteredLicenses.map((license) => (
                  <tr key={license.id} className="group hover:bg-accent/50">
                    <td className="px-6 py-4 font-medium">{license.user_name}</td>
                    <td className="px-6 py-4 font-mono text-xs opacity-70">{license.key_preview}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-semibold">
                        {license.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(license.display_status)}
                      >
                        {getStatusLabel(license.display_status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {license.lifetime ? "Vitalícia" : formatDate(license.expires_at)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {license.device_count} / {license.max_devices}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {license.last_validated_at ? formatDate(license.last_validated_at) : "Nunca"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2" onClick={() => {
                            // Map back to expected format for modal if needed, or update modal
                            setSelectedLicense({
                              ...license,
                              client: license.user_name,
                              code: license.key_preview,
                              status: getStatusLabel(license.display_status),
                              validity: license.lifetime ? "Vitalícia" : formatDate(license.expires_at),
                              devices: `${license.device_count} / ${license.max_devices}`,
                              lastAccess: license.last_validated_at ? formatDate(license.last_validated_at) : "Nunca"
                            });
                            setIsDetailsModalOpen(true);
                          }}>
                            <Eye className="size-4" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => copyCode(license.key_preview)}>
                            <Copy className="size-4" /> Copiar código
                          </DropdownMenuItem>
                          
                          {license.display_status === "active" ? (
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                              <Lock className="size-4" /> Bloquear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2 text-success focus:text-success">
                              <Unlock className="size-4" /> Reativar
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem className="gap-2">
                            <RefreshCw className="size-4" /> Resetar dispositivo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Edit className="size-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash className="size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-[280px] flex-col items-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-muted">
                        <Key className="size-6 text-muted-foreground" />
                      </div>
                      <h4 className="mt-4 font-semibold text-foreground">
                        Nenhuma licença encontrada
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Crie sua primeira licença XForge Pro para começar.
                      </p>
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="size-4" /> Criar primeira licença
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <LicenseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <LicenseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedLicense(null);
        }}
        license={selectedLicense}
      />
    </div>
  );
}
