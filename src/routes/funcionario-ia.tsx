import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  BriefcaseBusiness,
  Headphones,
  LoaderCircle,
  Megaphone,
  PenLine,
  Send,
  Share2,
  Sparkles,
  Target,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { talkToFuncionarioAI } from "@/lib/funcionario-ai";

export const Route = createFileRoute("/funcionario-ia")({
  head: () => ({
    meta: [
      { title: "Funcionário IA — Projeto X" },
      {
        name: "description",
        content:
          "Seu funcionário inteligente para vendas, marketing, conteúdo, suporte e estratégia.",
      },
      {
        property: "og:title",
        content: "Funcionário IA — Projeto X",
      },
      {
        property: "og:description",
        content:
          "Seu funcionário inteligente para vendas, marketing, conteúdo, suporte e estratégia.",
      },
    ],
  }),
  component: Page,
});

type RoleId =
  | "vendas"
  | "marketing"
  | "copywriter"
  | "social-media"
  | "suporte"
  | "estrategia";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type EmployeeRole = {
  id: RoleId;
  name: string;
  shortName: string;
  description: string;
  greeting: string;
  icon: LucideIcon;
};

const employees: EmployeeRole[] = [
  {
    id: "vendas",
    name: "Especialista em Vendas",
    shortName: "Vendas",
    description:
      "Scripts, objeções, follow-up, abordagem e estratégias para aumentar conversões.",
    greeting:
      "Olá! Sou seu especialista em vendas. Posso criar abordagens, scripts, respostas para objeções, follow-ups e estratégias comerciais. O que vamos vender hoje?",
    icon: BriefcaseBusiness,
  },
  {
    id: "marketing",
    name: "Especialista em Marketing",
    shortName: "Marketing",
    description:
      "Campanhas, posicionamento, ofertas, público-alvo e estratégias de crescimento.",
    greeting:
      "Olá! Sou seu especialista em marketing. Posso ajudar com campanhas, ofertas, público-alvo, posicionamento e estratégias de divulgação. Qual é o objetivo?",
    icon: Megaphone,
  },
  {
    id: "copywriter",
    name: "Copywriter IA",
    shortName: "Copywriter",
    description:
      "Anúncios, headlines, CTAs, páginas de vendas, WhatsApp e textos persuasivos.",
    greeting:
      "Olá! Sou seu Copywriter IA. Me diga o produto, serviço ou objetivo e eu posso transformar isso em uma comunicação mais persuasiva.",
    icon: PenLine,
  },
  {
    id: "social-media",
    name: "Social Media IA",
    shortName: "Social Media",
    description:
      "Posts, legendas, roteiros, ideias de conteúdo e estratégias para redes sociais.",
    greeting:
      "Olá! Sou seu Social Media IA. Posso criar posts, legendas, roteiros, calendários e ideias para suas redes sociais. O que deseja publicar?",
    icon: Share2,
  },
  {
    id: "suporte",
    name: "Atendimento e Suporte",
    shortName: "Suporte",
    description:
      "Respostas profissionais, dúvidas de clientes, reclamações e organização do atendimento.",
    greeting:
      "Olá! Sou seu funcionário de atendimento e suporte. Envie a dúvida ou mensagem do cliente e eu ajudo a montar a melhor resposta.",
    icon: Headphones,
  },
  {
    id: "estrategia",
    name: "Estrategista de Negócios",
    shortName: "Estratégia",
    description:
      "Planejamento, produtos, preços, crescimento, prioridades e tomada de decisão.",
    greeting:
      "Olá! Sou seu estrategista de negócios. Posso analisar ideias, oportunidades, riscos, produtos e decisões. O que deseja avaliar?",
    icon: Target,
  },
];

function createMessage(
  role: "user" | "assistant",
  content: string,
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function Page() {
  const [roleId, setRoleId] = useState<RoleId>("vendas");
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", employees[0].greeting),
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const activeEmployee = useMemo(
    () => employees.find((employee) => employee.id === roleId) ?? employees[0],
    [roleId],
  );

  const ActiveIcon = activeEmployee.icon;

  function changeEmployee(employee: EmployeeRole) {
    if (sending) return;

    setRoleId(employee.id);
    setError("");
    setInput("");
    setMessages([createMessage("assistant", employee.greeting)]);
  }

  function clearConversation() {
    if (sending) return;

    setError("");
    setInput("");
    setMessages([createMessage("assistant", activeEmployee.greeting)]);
  }

  async function sendMessage() {
    const cleanMessage = input.trim();

    if (!cleanMessage || sending) {
      return;
    }

    const previousMessages = messages;

    const userMessage = createMessage("user", cleanMessage);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const response = await talkToFuncionarioAI({
        data: {
          roleId,
          message: cleanMessage,
          history: previousMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
      });

      if (!response?.message) {
        throw new Error("EMPTY_RESPONSE");
      }

      setMessages((current) => [
        ...current,
        createMessage("assistant", response.message),
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "FUNCIONARIO_AI_FAILED";

      if (message.includes("GEMINI_API_KEY_NOT_CONFIGURED")) {
        setError("A chave da Gemini ainda não está configurada.");
      } else if (message.includes("GEMINI_API_KEY_INVALID")) {
        setError("A chave da Gemini é inválida ou não possui permissão.");
      } else if (message.includes("GEMINI_QUOTA_EXCEEDED")) {
        setError(
          "O limite de uso da Gemini foi atingido. Tente novamente mais tarde.",
        );
      } else if (message.includes("GEMINI_MODEL_UNAVAILABLE")) {
        setError("O modelo da Gemini não está disponível no momento.");
      } else if (message.includes("INVALID_INPUT")) {
        setError("Não foi possível enviar essa mensagem.");
      } else {
        setError(
          "Não foi possível falar com o Funcionário IA. Tente novamente.",
        );
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>

            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini IA
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Funcionário IA
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Escolha um especialista e converse com um funcionário inteligente
            preparado para ajudar sua empresa.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={clearConversation}
          disabled={sending}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Limpar conversa
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit p-4">
          <div className="mb-4">
            <h2 className="font-semibold">Escolha seu funcionário</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada especialista possui uma função diferente dentro do Projeto X.
            </p>
          </div>

          <div className="space-y-2">
            {employees.map((employee) => {
              const Icon = employee.icon;
              const selected = employee.id === roleId;

              return (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => changeEmployee(employee)}
                  disabled={sending}
                  className={[
                    "w-full rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {employee.shortName}
                        </span>

                        {selected && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Ativo
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {employee.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex min-h-[680px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b p-4 md:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ActiveIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  {activeEmployee.name}
                </h2>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>

                  Online e pronto para trabalhar
                </div>
              </div>
            </div>

            <Badge variant="outline" className="hidden md:inline-flex">
              {activeEmployee.shortName}
            </Badge>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-5 p-4 md:p-6">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={[
                      "flex gap-3",
                      isUser ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {!isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ActiveIcon className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={[
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[75%]",
                        isUser
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border bg-muted/40 text-foreground",
                      ].join(" ")}
                    >
                      {message.content}
                    </div>

                    {isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ActiveIcon className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Pensando...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t bg-background p-4 md:p-5">
            {error && (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-xl border bg-muted/20 p-2 focus-within:border-primary/50">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                placeholder={`Converse com ${activeEmployee.name}...`}
                className="min-h-[90px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />

              <div className="flex items-center justify-between gap-3 px-1 pb-1">
                <span className="hidden text-xs text-muted-foreground sm:block">
                  Enter para enviar • Shift + Enter para nova linha
                </span>

                <Button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={sending || !input.trim()}
                  className="ml-auto gap-2"
                >
                  {sending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Pensando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              O Funcionário IA pode cometer erros. Revise informações importantes
              antes de utilizá-las.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}