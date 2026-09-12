import {
  aiTargets,
  promptCategories,
  type PromptLevel,
} from "@/data/promptStudio";

export type BuildInput = {
  categoryId: string;
  idea: string;
  values: Record<string, string>;
  aiId: string;
  level: PromptLevel;
};

const LEVEL_NOTE: Record<PromptLevel, string> = {
  rapido: "Responda de forma curta, direta e objetiva.",
  profissional:
    "Entregue um resultado detalhado, estruturado e pronto para uso profissional, respeitando cada parâmetro descrito.",
  ultra:
    "Entregue o máximo de detalhamento possível: contexto completo, direção de arte, referências, restrições, variações alternativas e checklist final de qualidade.",
};

export function buildPrompt(input: BuildInput): string {
  const category = promptCategories.find((item) => item.id === input.categoryId);
  const ai = aiTargets.find((item) => item.id === input.aiId);
  if (!category) return "";

  const filled = category.fields
    .map((field) => ({ label: field.label, value: (input.values[field.key] ?? "").trim() }))
    .filter((entry) => entry.value.length > 0);

  const lines: string[] = [];
  lines.push(`# ${category.name} — Prompt gerado pelo Prompt X Studio`);
  lines.push("");
  lines.push(`## Objetivo`);
  lines.push(input.idea.trim() || `Criar um resultado de ${category.name.toLowerCase()}.`);
  lines.push("");

  if (filled.length > 0) {
    lines.push("## Parâmetros");
    for (const entry of filled) {
      lines.push(`- ${entry.label}: ${entry.value}`);
    }
    lines.push("");
  }

  lines.push("## Instruções");
  lines.push(LEVEL_NOTE[input.level]);
  if (ai) {
    lines.push(`Otimize a saída para uso em ${ai.name}.`);
  }
  if (input.level !== "rapido") {
    lines.push("Mantenha coerência entre estilo, formato e público definido acima.");
  }
  if (input.level === "ultra") {
    lines.push("Ao final, sugira 3 variações do resultado e explique brevemente cada escolha.");
  }

  return lines.join("\n");
}

export function scorePrompt(input: BuildInput): { score: number; label: string; checks: string[] } {
  const category = promptCategories.find((item) => item.id === input.categoryId);
  const fields = category?.fields ?? [];
  const filled = fields.filter((field) => (input.values[field.key] ?? "").trim().length > 0).length;
  const coverage = fields.length > 0 ? filled / fields.length : 0;

  let score = 40;
  if (input.idea.trim().length > 25) score += 20;
  score += Math.round(coverage * 25);
  if (input.aiId) score += 8;
  if (input.level === "profissional") score += 5;
  if (input.level === "ultra") score += 7;
  score = Math.max(35, Math.min(100, score));

  const label = score >= 90 ? "Excelente" : score >= 75 ? "Muito bom" : score >= 60 ? "Bom" : "Básico";

  const checks: string[] = [];
  if (input.idea.trim().length > 0) checks.push("Objetivo definido");
  if (coverage >= 0.4) checks.push("Contexto completo");
  if (fields.some((f) => /estilo|tom/i.test(f.label) && (input.values[f.key] ?? "").trim()))
    checks.push("Estilo definido");
  if (fields.some((f) => /formato|proporção/i.test(f.label) && (input.values[f.key] ?? "").trim()))
    checks.push("Formato definido");
  if (fields.some((f) => /cta|chamada/i.test(f.label) && (input.values[f.key] ?? "").trim()))
    checks.push("CTA definido");
  if (input.aiId) checks.push("IA de destino selecionada");

  return { score, label, checks };
}
