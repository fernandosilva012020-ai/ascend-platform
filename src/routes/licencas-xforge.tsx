import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Key,
  Plus,
  Search,
  Filter,
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

type LicenseStatus = "Ativa" | "Bloqueada" | "Expirada";
type LicensePlan = "Básico" | "PRO" | "Premium" | "Teste";

interface License {
  id: string;
  client: string;
  code: string;
  plan: LicensePlan;
  status: LicenseStatus;
  validity: string;
  devices: string;
  lastAccess: string;
}

const mockLicenses: License[] = [
  {
    id: "1",
    client: "Fernando",
    code: "FNX-XXXX-XXXX-0001",
    plan: "PRO",
    status: "Ativa",
    validity: "Vitalícia",
    devices: "1 / 1",
    lastAccess: "Agora",
  },
  {
    id: "2",
    client: "Maria Silva",
    code: "XFG-4829-1928-0922",
    plan: "Premium",
    status: "Ativa",
    validity: "365 dias",
    devices: "2 / 3",
    lastAccess: "há 2 horas",
  },
  {
    id: "3",
    client: "João Rocha",
    code: "XFG-9921-0021-8812",
    plan: "Básico",
    status: "Expirada",
    validity: "30 dias",
    devices: "1 / 1",
    lastAccess: "há 5 dias",
  },
  {
    id: "4",
    client: "Lucas Oliveira",
    code: "XFG-7721-1123-5561",
    plan: "Teste",
    status: "Bloqueada",
    validity: "7 dias",
    devices: "0 / 1",
    lastAccess: "há 1 semana",
  },
];

function LicensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredLicenses = mockLicenses.filter((l) => {
    const matchesSearch =
      l.client.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
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
        <Button variant="premium" className="w-full sm:w-auto">
          <Plus className="size-4" />
          Criar licença
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Licenças Ativas", value: "128", icon: CheckCircle2, color: "text-success" },
          { label: "Licenças Expiradas", value: "14", icon: Clock, color: "text-warning" },
          { label: "Licenças Bloqueadas", value: "3", icon: AlertCircle, color: "text-destructive" },
          { label: "Dispositivos Ativos", value: "245", icon: Laptop, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
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
              {filteredLicenses.length > 0 ? (
                filteredLicenses.map((license) => (
                  <tr key={license.id} className="group hover:bg-accent/50">
                    <td className="px-6 py-4 font-medium">{license.client}</td>
                    <td className="px-6 py-4 font-mono text-xs opacity-70">{license.code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-semibold">
                        {license.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{license.validity}</td>
                    <td className="px-6 py-4 text-muted-foreground">{license.devices}</td>
                    <td className="px-6 py-4 text-muted-foreground">{license.lastAccess}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="size-4" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => copyCode(license.code)}>
                            <Copy className="size-4" /> Copiar código
                          </DropdownMenuItem>
                          
                          {license.status === "Ativa" ? (
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
                      <Button variant="outline" className="mt-4 gap-2">
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
    </div>
  );
}
