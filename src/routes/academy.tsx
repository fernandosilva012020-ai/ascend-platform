import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lock,
  Play,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Academy — Projeto X" },
      { name: "description", content: "Trilhas de treinamento para sua equipe." },
      { property: "og:title", content: "Academy — Projeto X" },
      { property: "og:description", content: "Trilhas de treinamento para sua equipe." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">Centro de aprendizagem</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Projeto X Academy</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Aprenda estratégias, domine as ferramentas e desenvolva sua equipe com trilhas práticas.</p>
            <Button className="mt-6" onClick={() => toast.info("As aulas serão ativadas quando o conteúdo real for cadastrado.")}><Play className="size-4" />Continuar aprendendo</Button>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Progresso geral</p><p className="mt-1 font-display text-2xl font-bold">42%</p></div><span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></span></div>
            <Progress value={42} className="mt-4 h-2.5" />
            <p className="mt-3 text-xs text-muted-foreground">8 de 19 aulas concluídas</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Cursos iniciados", value: "3", icon: BookOpen },
          { label: "Aulas concluídas", value: "8", icon: CheckCircle2 },
          { label: "Certificados", value: "1", icon: Award },
        ].map((metric) => <Card key={metric.label}><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><metric.icon className="size-5" /></span><div><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-1 font-display text-2xl font-bold">{metric.value}</p></div></CardContent></Card>)}
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="font-display text-2xl font-bold">Continue de onde parou</h2><p className="mt-1 text-sm text-muted-foreground">Sua trilha em andamento.</p></div>
          <div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar curso..." className="pl-9" /></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.title} className="overflow-hidden">
              <div className={`relative h-36 bg-gradient-to-br ${course.gradient} p-5 text-white`}>
                <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur"><course.icon className="size-6" /></span>
                <Badge className="absolute right-4 top-4 border-white/20 bg-black/20 text-white">{course.level}</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-display text-lg font-bold">{course.title}</h3>
                <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{course.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs"><span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="size-3.5" />{course.duration}</span><span className="font-semibold">{course.progress}%</span></div>
                <Progress value={course.progress} className="mt-2 h-2" />
                <Button className="mt-4 w-full" variant={course.locked ? "outline" : "default"} onClick={() => toast.info(course.locked ? "Curso bloqueado nesta demonstração." : "As aulas serão conectadas na próxima etapa.")}>
                  {course.locked ? <Lock className="size-4" /> : <Play className="size-4" />}{course.locked ? "Bloqueado" : course.progress > 0 ? "Continuar curso" : "Começar curso"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Trophy className="size-7" /></span>
          <div><h2 className="font-display text-xl font-bold">Complete sua primeira trilha</h2><p className="mt-1 text-sm text-muted-foreground">Finalize o curso Fundamentos do Projeto X para liberar seu certificado demonstrativo.</p></div>
          <Badge variant="outline" className="w-fit bg-background">68% concluído</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

const courses = [
  { title: "Fundamentos do Projeto X", description: "Conheça os módulos e organize sua operação desde o início.", duration: "1h 40min", progress: 68, level: "Essencial", icon: Sparkles, gradient: "from-violet-600 to-indigo-700", locked: false },
  { title: "Marketing e Conversão", description: "Crie campanhas e páginas com foco em resultados.", duration: "2h 15min", progress: 24, level: "Intermediário", icon: BookOpen, gradient: "from-blue-600 to-cyan-600", locked: false },
  { title: "Liderança de Equipes", description: "Desenvolva parceiros e construa uma rede sustentável.", duration: "2h 50min", progress: 0, level: "Avançado", icon: Award, gradient: "from-amber-500 to-orange-600", locked: true },
];
