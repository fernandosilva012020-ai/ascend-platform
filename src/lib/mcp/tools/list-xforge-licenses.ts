import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

type LicenseRow = Record<string, unknown>;

export default defineTool({
  name: "list_xforge_licenses",
  title: "Listar licenças XForge",
  description:
    "Lista as licenças da extensão XForge Pro (cliente, plano, status, validade e dispositivos) para o administrador conectado. Suporta busca por cliente ou código e filtro por status.",
  inputSchema: {
    search: z
      .string()
      .trim()
      .optional()
      .describe("Filtro opcional por nome do cliente ou código da licença."),
    status: z
      .enum(["all", "active", "expired", "suspended", "revoked"])
      .optional()
      .describe("Filtro opcional por status da licença. Padrão: all."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Número máximo de licenças retornadas. Padrão: 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.functions.invoke("xforge-admin", {
      body: { action: "list" },
    });

    if (error) {
      return {
        content: [
          {
            type: "text",
            text: `Não foi possível carregar as licenças XForge: ${error.message}`,
          },
        ],
        isError: true,
      };
    }

    const payload = (data ?? {}) as { licenses?: LicenseRow[]; metrics?: Record<string, unknown> };
    let licenses = Array.isArray(payload.licenses) ? payload.licenses : [];

    const wanted = status && status !== "all" ? status : null;
    if (wanted) {
      licenses = licenses.filter((l) => String(l.display_status ?? l.status ?? "") === wanted);
    }

    if (search) {
      const term = search.toLowerCase();
      licenses = licenses.filter((l) =>
        [l.user_name, l.key_preview, l.license_key]
          .filter((v): v is string => typeof v === "string")
          .some((v) => v.toLowerCase().includes(term)),
      );
    }

    licenses = licenses.slice(0, limit ?? 50);

    const result = { count: licenses.length, metrics: payload.metrics ?? null, licenses };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
