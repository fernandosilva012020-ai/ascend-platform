import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  LockKeyhole,
  Mail,
  Moon,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Projeto X" },
      { name: "description", content: "Preferências da conta e do workspace." },
      { property: "og:title", content: "Configurações — Projeto X" },
      { property: "og:description", content: "Preferências da conta e do workspace." },
    ],
  }),
  component: Page,
});

function Page() {
  function saveDemo() {
    toast.info("As configurações serão salvas quando o perfil for conectado ao Supabase.");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">Conta e workspace</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Configurações</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Gerencie seu perfil, notificações, aparência e segurança.</p>
        </div>
        <Badge variant="outline" className="w-fit">Modo demonstrativo</Badge>
      </section>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="perfil"><User className="size-4" />Perfil</TabsTrigger>
          <TabsTrigger value="workspace"><Building2 className="size-4" />Workspace</TabsTrigger>
          <TabsTrigger value="notificacoes"><Bell className="size-4" />Notificações</TabsTrigger>
          <TabsTrigger value="aparencia"><Palette className="size-4" />Aparência</TabsTrigger>
          <TabsTrigger value="seguranca"><ShieldCheck className="size-4" />Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <SettingsCard title="Informações pessoais" description="Dados utilizados para identificar sua conta.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" defaultValue="Fernando Silva" />
              <Field label="E-mail" defaultValue="fernando@projetox.com" type="email" />
              <Field label="Telefone" defaultValue="(19) 99960-9789" />
              <Field label="Cidade" defaultValue="Artur Nogueira - SP" />
            </div>
            <SaveButton onClick={saveDemo} />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="workspace">
          <SettingsCard title="Informações do workspace" description="Identidade utilizada pela sua operação no Projeto X.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome do workspace" defaultValue="Projeto X" />
              <Field label="Identificador" defaultValue="projeto-x" />
              <div className="sm:col-span-2"><Field label="Site" defaultValue="https://projetox.com" /></div>
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold">Fuso horário</p>
              <p className="mt-1 text-xs text-muted-foreground">Horário de Brasília (GMT-3)</p>
            </div>
            <SaveButton onClick={saveDemo} />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="notificacoes">
          <SettingsCard title="Preferências de notificação" description="Escolha como deseja acompanhar as novidades da plataforma.">
            <div className="space-y-3">
              <ToggleSetting icon={Mail} title="Resumo por e-mail" description="Receba um resumo semanal dos resultados." defaultChecked />
              <ToggleSetting icon={Bell} title="Novos leads" description="Avisar sempre que um novo lead for recebido." defaultChecked />
              <ToggleSetting icon={Smartphone} title="Notificações no navegador" description="Mostrar alertas enquanto o Projeto X estiver aberto." />
              <ToggleSetting icon={Bell} title="Atividade da equipe" description="Avisar sobre novos parceiros e metas concluídas." defaultChecked />
            </div>
            <SaveButton onClick={saveDemo} />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="aparencia">
          <SettingsCard title="Aparência" description="Personalize como a plataforma é exibida.">
            <div className="grid gap-4 sm:grid-cols-3">
              <ThemeOption name="Claro" description="Fundo claro" active />
              <ThemeOption name="Escuro" description="Fundo escuro" />
              <ThemeOption name="Sistema" description="Segue o dispositivo" />
            </div>
            <div className="mt-5"><ToggleSetting icon={Moon} title="Interface compacta" description="Reduzir espaços entre os elementos da tela." /></div>
            <SaveButton onClick={saveDemo} />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="seguranca">
          <div className="grid gap-4 lg:grid-cols-2">
            <SettingsCard title="Senha e acesso" description="Mantenha sua conta protegida.">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><LockKeyhole className="size-5" /></span><div><p className="text-sm font-semibold">Senha da conta</p><p className="text-xs text-muted-foreground">Alterada há 42 dias</p></div></div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => toast.info("Use a recuperação de senha na tela de login.")}>Alterar senha</Button>
              </div>
              <div className="mt-3"><ToggleSetting icon={ShieldCheck} title="Verificação em duas etapas" description="Adicionar uma camada extra de proteção." /></div>
            </SettingsCard>
            <SettingsCard title="Sessões ativas" description="Dispositivos conectados à sua conta.">
              <div className="space-y-3">
                <SessionItem device="Windows • Chrome" location="Artur Nogueira, SP" current />
                <SessionItem device="Android • Chrome" location="Artur Nogueira, SP" />
              </div>
              <Button variant="outline" className="mt-5 w-full" onClick={() => toast.info("O encerramento de sessões será conectado ao Supabase Auth.")}>Encerrar outras sessões</Button>
            </SettingsCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle className="font-display text-xl">{title}</CardTitle><p className="text-sm text-muted-foreground">{description}</p></CardHeader><CardContent>{children}</CardContent></Card>;
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} defaultValue={defaultValue} /></div>;
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return <Button className="mt-6" onClick={onClick}><Save className="size-4" />Salvar alterações</Button>;
}

function ToggleSetting({ icon: Icon, title, description, defaultChecked = false }: { icon: typeof Bell; title: string; description: string; defaultChecked?: boolean }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div><Switch defaultChecked={defaultChecked} /></div>;
}

function ThemeOption({ name, description, active = false }: { name: string; description: string; active?: boolean }) {
  return <button type="button" className={`rounded-2xl border p-4 text-left ${active ? "border-primary bg-primary/5" : "border-border"}`}><span className={`block h-20 rounded-xl ${name === "Escuro" ? "bg-slate-900" : name === "Sistema" ? "bg-gradient-to-r from-white to-slate-900" : "bg-white"} border border-border`} /><p className="mt-3 text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{description}</p></button>;
}

function SessionItem({ device, location, current = false }: { device: string; location: string; current?: boolean }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border p-4"><span className="grid size-10 place-items-center rounded-xl bg-muted"><Smartphone className="size-5 text-muted-foreground" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{device}</p><p className="text-xs text-muted-foreground">{location}</p></div>{current ? <Badge variant="secondary">Atual</Badge> : null}</div>;
}
