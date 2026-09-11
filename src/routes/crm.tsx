import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  DollarSign,
  LoaderCircle,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { externalSupabase as supabase } from "@/integrations/supabase/external-client";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Projeto X" },
      {
        name: "description",
        content: "Gerencie leads, contatos e oportunidades.",
      },
      {
        property: "og:title",
        content: "CRM — Projeto X",
      },
      {
        property: "og:description",
        content: "Gerencie leads, contatos e oportunidades.",
      },
    ],
  }),
  component: Page,
});

type LeadStatus =
  | "novo"
  | "contato"
  | "negociacao"
  | "ganho"
  | "perdido";

type Lead = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  source: string | null;
  potential_value: number | string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CRMNote = {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  company: string;
  status: LeadStatus;
  source: string;
  potentialValue: string;
  notes: string;
};

const emptyForm: LeadForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
  status: "novo",
  source: "",
  potentialValue: "",
  notes: "",
};

const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    className: string;
  }
> = {
  novo: {
    label: "Novo",
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  contato: {
    label: "Contato",
    className:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  negociacao: {
    label: "Negociação",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  ganho: {
    label: "Ganho",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  perdido: {
    label: "Perdido",
    className:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

function currency(value: number | string | null) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function normalizeMoney(value: string) {
  const clean = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const numeric = Number(clean);

  return Number.isFinite(numeric) ? numeric : 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function Page() {
  const { user, loading: authLoading } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [notesDialogOpen, setNotesDialogOpen] =
    useState(false);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [form, setForm] =
    useState<LeadForm>(emptyForm);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    LeadStatus | "todos"
  >("todos");

  const [crmNotes, setCrmNotes] = useState<CRMNote[]>(
    [],
  );

  const [noteInput, setNoteInput] = useState("");
  const [notesLoading, setNotesLoading] =
    useState(false);
  const [noteSaving, setNoteSaving] =
    useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    void loadLeads();
  }, [user?.id, authLoading]);

  async function loadLeads() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("crm_leads")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Erro ao carregar CRM:",
        error,
      );

      toast.error(
        "Não foi possível carregar os leads.",
      );

      setLoading(false);
      return;
    }

    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }

  async function createLead() {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const name = form.name.trim();

    if (!name) {
      toast.error("Informe o nome do lead.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("crm_leads")
      .insert({
        user_id: user.id,
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        status: form.status,
        source: form.source.trim() || null,
        potential_value: normalizeMoney(
          form.potentialValue,
        ),
        notes: form.notes.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Erro ao criar lead:",
        error,
      );

      toast.error(
        "Não foi possível cadastrar o lead.",
      );

      setSaving(false);
      return;
    }

    setLeads((current) => [
      data as Lead,
      ...current,
    ]);

    setForm(emptyForm);
    setCreateDialogOpen(false);
    setSaving(false);

    toast.success(
      "Lead cadastrado com sucesso.",
    );
  }

  function openEditLead(lead: Lead) {
    setSelectedLead(lead);

    setForm({
      name: lead.name,
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      company: lead.company ?? "",
      status: lead.status,
      source: lead.source ?? "",
      potentialValue: String(
        lead.potential_value ?? "",
      ),
      notes: lead.notes ?? "",
    });

    setEditDialogOpen(true);
  }

  async function updateLead() {
    if (!selectedLead) return;

    const name = form.name.trim();

    if (!name) {
      toast.error("Informe o nome do lead.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("crm_leads")
      .update({
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        status: form.status,
        source: form.source.trim() || null,
        potential_value: normalizeMoney(
          form.potentialValue,
        ),
        notes: form.notes.trim() || null,
      })
      .eq("id", selectedLead.id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Erro ao atualizar lead:",
        error,
      );

      toast.error(
        "Não foi possível atualizar o lead.",
      );

      setSaving(false);
      return;
    }

    setLeads((current) =>
      current.map((lead) =>
        lead.id === selectedLead.id
          ? (data as Lead)
          : lead,
      ),
    );

    setSelectedLead(null);
    setEditDialogOpen(false);
    setSaving(false);

    toast.success(
      "Lead atualizado com sucesso.",
    );
  }

  async function changeStatus(
    leadId: string,
    status: LeadStatus,
  ) {
    const previous = leads;

    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
            }
          : lead,
      ),
    );

    const { error } = await supabase
      .from("crm_leads")
      .update({
        status,
      })
      .eq("id", leadId);

    if (error) {
      console.error(
        "Erro ao alterar status:",
        error,
      );

      setLeads(previous);

      toast.error(
        "Não foi possível alterar a etapa.",
      );

      return;
    }

    toast.success("Etapa atualizada.");
  }

  async function deleteLead(lead: Lead) {
    const confirmed = window.confirm(
      `Excluir o lead "${lead.name}"?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("crm_leads")
      .delete()
      .eq("id", lead.id);

    if (error) {
      console.error(
        "Erro ao excluir lead:",
        error,
      );

      toast.error(
        "Não foi possível excluir o lead.",
      );

      return;
    }

    setLeads((current) =>
      current.filter(
        (item) => item.id !== lead.id,
      ),
    );

    toast.success("Lead excluído.");
  }

  async function openNotes(lead: Lead) {
    setSelectedLead(lead);
    setNotesDialogOpen(true);
    setNoteInput("");
    setCrmNotes([]);
    setNotesLoading(true);

    const { data, error } = await supabase
      .from("crm_notes")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Erro ao carregar notas:",
        error,
      );

      toast.error(
        "Não foi possível carregar o histórico.",
      );

      setNotesLoading(false);
      return;
    }

    setCrmNotes((data ?? []) as CRMNote[]);
    setNotesLoading(false);
  }

  async function addNote() {
    if (!user || !selectedLead) return;

    const content = noteInput.trim();

    if (!content) {
      toast.error("Digite uma anotação.");
      return;
    }

    setNoteSaving(true);

    const { data, error } = await supabase
      .from("crm_notes")
      .insert({
        lead_id: selectedLead.id,
        user_id: user.id,
        content,
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Erro ao adicionar nota:",
        error,
      );

      toast.error(
        "Não foi possível salvar a anotação.",
      );

      setNoteSaving(false);
      return;
    }

    setCrmNotes((current) => [
      data as CRMNote,
      ...current,
    ]);

    setNoteInput("");
    setNoteSaving(false);

    toast.success(
      "Anotação adicionada ao histórico.",
    );
  }

  async function deleteNote(note: CRMNote) {
    const confirmed = window.confirm(
      "Excluir esta anotação?",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("crm_notes")
      .delete()
      .eq("id", note.id);

    if (error) {
      console.error(
        "Erro ao excluir nota:",
        error,
      );

      toast.error(
        "Não foi possível excluir a anotação.",
      );

      return;
    }

    setCrmNotes((current) =>
      current.filter(
        (item) => item.id !== note.id,
      ),
    );

    toast.success("Anotação excluída.");
  }

  const filteredLeads = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "todos" ||
        lead.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        lead.name,
        lead.phone,
        lead.email,
        lead.company,
        lead.source,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term),
        );
    });
  }, [leads, search, statusFilter]);

  const metrics = useMemo(() => {
    const totalValue = leads
      .filter(
        (lead) =>
          lead.status !== "perdido",
      )
      .reduce(
        (sum, lead) =>
          sum +
          Number(
            lead.potential_value ?? 0,
          ),
        0,
      );

    return {
      total: leads.length,

      novos: leads.filter(
        (lead) =>
          lead.status === "novo",
      ).length,

      negociacao: leads.filter(
        (lead) =>
          lead.status ===
          "negociacao",
      ).length,

      ganhos: leads.filter(
        (lead) =>
          lead.status === "ganho",
      ).length,

      totalValue,
    };
  }, [leads]);

  if (authLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />

            <div>
              <h2 className="text-lg font-semibold">
                Faça login para acessar o CRM
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Os leads são vinculados à sua conta do Projeto X.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>

            <Badge variant="secondary">
              CRM 1.0
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            CRM
          </h1>

          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Gerencie leads, contatos e oportunidades em um só lugar.
          </p>
        </div>

        <Button
          type="button"
          className="gap-2"
          onClick={() => {
            setForm(emptyForm);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total de leads"
          value={String(metrics.total)}
          icon={Users}
        />

        <MetricCard
          title="Novos"
          value={String(metrics.novos)}
          icon={UserPlus}
        />

        <MetricCard
          title="Em negociação"
          value={String(
            metrics.negociacao,
          )}
          icon={Building2}
        />

        <MetricCard
          title="Ganhos"
          value={String(metrics.ganhos)}
          icon={Users}
        />

        <MetricCard
          title="Valor potencial"
          value={currency(
            metrics.totalValue,
          )}
          icon={DollarSign}
        />
      </div>

      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por nome, telefone, e-mail, empresa..."
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as
                    | LeadStatus
                    | "todos",
                )
              }
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Todas as etapas" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todos">
                  Todas as etapas
                </SelectItem>

                <SelectItem value="novo">
                  Novo
                </SelectItem>

                <SelectItem value="contato">
                  Contato
                </SelectItem>

                <SelectItem value="negociacao">
                  Negociação
                </SelectItem>

                <SelectItem value="ganho">
                  Ganho
                </SelectItem>

                <SelectItem value="perdido">
                  Perdido
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">
              Leads
            </CardTitle>

            <span className="text-sm text-muted-foreground">
              {filteredLeads.length} resultado
              {filteredLeads.length === 1
                ? ""
                : "s"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredLeads.length ===
            0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">
                Nenhum lead encontrado
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Cadastre seu primeiro lead para começar a acompanhar oportunidades no CRM.
              </p>

              {leads.length === 0 && (
                <Button
                  type="button"
                  className="mt-4 gap-2"
                  onClick={() =>
                    setCreateDialogOpen(
                      true,
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar primeiro lead
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredLeads.map(
                (lead) => (
                  <div
                    key={lead.id}
                    className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:p-5 xl:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_160px_180px_auto] xl:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">
                          {lead.name}
                        </h3>

                        <Badge
                          variant="outline"
                          className={
                            statusConfig[
                              lead.status
                            ].className
                          }
                        >
                          {
                            statusConfig[
                              lead.status
                            ].label
                          }
                        </Badge>
                      </div>

                      {lead.company && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />

                          <span className="truncate">
                            {
                              lead.company
                            }
                          </span>
                        </div>
                      )}

                      {lead.source && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Origem:{" "}
                          {lead.source}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      {lead.phone ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </div>
                      ) : null}

                      {lead.email ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />

                          <span className="truncate">
                            {
                              lead.email
                            }
                          </span>
                        </div>
                      ) : null}

                      {!lead.phone &&
                        !lead.email && (
                          <span className="text-muted-foreground">
                            Sem contato informado
                          </span>
                        )}
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        Valor potencial
                      </p>

                      <p className="font-semibold">
                        {currency(
                          lead.potential_value,
                        )}
                      </p>
                    </div>

                    <Select
                      value={lead.status}
                      onValueChange={(
                        value,
                      ) =>
                        void changeStatus(
                          lead.id,
                          value as LeadStatus,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="novo">
                          Novo
                        </SelectItem>

                        <SelectItem value="contato">
                          Contato
                        </SelectItem>

                        <SelectItem value="negociacao">
                          Negociação
                        </SelectItem>

                        <SelectItem value="ganho">
                          Ganho
                        </SelectItem>

                        <SelectItem value="perdido">
                          Perdido
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Histórico e notas"
                        onClick={() =>
                          void openNotes(
                            lead,
                          )
                        }
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Editar lead"
                        onClick={() =>
                          openEditLead(
                            lead,
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Excluir lead"
                        onClick={() =>
                          void deleteLead(
                            lead,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {lead.notes && (
                      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground xl:col-span-5">
                        <strong className="text-foreground">
                          Observação:
                        </strong>{" "}
                        {lead.notes}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDialog
        title="Cadastrar novo lead"
        description="Adicione um contato ou oportunidade ao CRM."
        open={createDialogOpen}
        onOpenChange={
          setCreateDialogOpen
        }
        form={form}
        setForm={setForm}
        saving={saving}
        actionLabel="Cadastrar lead"
        onSave={() =>
          void createLead()
        }
      />

      <LeadDialog
        title="Editar lead"
        description="Atualize as informações e a oportunidade deste contato."
        open={editDialogOpen}
        onOpenChange={
          setEditDialogOpen
        }
        form={form}
        setForm={setForm}
        saving={saving}
        actionLabel="Salvar alterações"
        onSave={() =>
          void updateLead()
        }
      />

      <Dialog
        open={notesDialogOpen}
        onOpenChange={(open) => {
          setNotesDialogOpen(open);

          if (!open) {
            setSelectedLead(null);
            setCrmNotes([]);
            setNoteInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Histórico do lead
            </DialogTitle>

            <DialogDescription>
              {selectedLead
                ? `Anotações e acompanhamentos de ${selectedLead.name}.`
                : "Histórico do CRM."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={noteInput}
              onChange={(event) =>
                setNoteInput(
                  event.target.value,
                )
              }
              placeholder="Ex.: Cliente pediu retorno na sexta-feira..."
              className="min-h-[90px]"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-2"
                disabled={
                  noteSaving ||
                  !noteInput.trim()
                }
                onClick={() =>
                  void addNote()
                }
              >
                {noteSaving ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Adicionar nota
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">
              Histórico
            </h3>

            {notesLoading ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : crmNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground" />

                <p className="mt-2 text-sm font-medium">
                  Nenhuma anotação ainda
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Registre contatos, retornos e informações importantes sobre este lead.
                </p>
              </div>
            ) : (
              <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
                {crmNotes.map(
                  (note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border bg-muted/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {
                              note.content
                            }
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatDate(
                              note.created_at,
                            )}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          title="Excluir anotação"
                          onClick={() =>
                            void deleteNote(
                              note,
                            )
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  actionLabel,
  onSave,
}: {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: LeadForm;
  setForm: React.Dispatch<
    React.SetStateAction<LeadForm>
  >;
  saving: boolean;
  actionLabel: string;
  onSave: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>
              Nome *
            </Label>

            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Nome do cliente ou lead"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Telefone / WhatsApp
            </Label>

            <Input
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone:
                    event.target.value,
                }))
              }
              placeholder="(19) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label>
              E-mail
            </Label>

            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email:
                    event.target.value,
                }))
              }
              placeholder="cliente@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Empresa
            </Label>

            <Input
              value={form.company}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  company:
                    event.target.value,
                }))
              }
              placeholder="Nome da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Origem
            </Label>

            <Input
              value={form.source}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  source:
                    event.target.value,
                }))
              }
              placeholder="Instagram, indicação, Facebook..."
            />
          </div>

          <div className="space-y-2">
            <Label>
              Etapa
            </Label>

            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status:
                    value as LeadStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="novo">
                  Novo
                </SelectItem>

                <SelectItem value="contato">
                  Contato
                </SelectItem>

                <SelectItem value="negociacao">
                  Negociação
                </SelectItem>

                <SelectItem value="ganho">
                  Ganho
                </SelectItem>

                <SelectItem value="perdido">
                  Perdido
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Valor potencial
            </Label>

            <Input
              value={
                form.potentialValue
              }
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  potentialValue:
                    event.target.value,
                }))
              }
              placeholder="Ex.: 1500,00"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Observação principal
            </Label>

            <Textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes:
                    event.target.value,
                }))
              }
              placeholder="Informações principais sobre esse lead..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                {actionLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}