/**
 * PROJETO X — DRAFT of hardened Asaas webhook.
 * NOT DEPLOYED. Before deployment, implement idempotent event persistence,
 * validate subscription linkage + profiles schema, and test end-to-end.
 * This intentionally never grants or revokes subscriptions.
 */
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const utf8 = new TextEncoder();
async function sameToken(actual: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", utf8.encode(actual)),
    crypto.subtle.digest("SHA-256", utf8.encode(expected)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let mismatch = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) mismatch |= x[i]! ^ y[i]!;
  return mismatch === 0 && actual.length > 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const expectedToken = Deno.env.get("ASAAS_WEBHOOK_AUTH_TOKEN") ?? "";
  if (expectedToken.length < 32 || expectedToken.length > 255 || /\\s/.test(expectedToken)) {
    console.error("ASAAS_WEBHOOK_AUTH_TOKEN não configurado corretamente");
    return json({ error: "Webhook indisponível" }, 503);
  }

  const actualToken = request.headers.get("asaas-access-token") ?? "";
  if (!(await sameToken(actualToken, expectedToken))) {
    return json({ error: "Não autorizado" }, 401);
  }

  let event: Record<string, unknown>;
  try {
    event = await request.json();
    if (!event || typeof event !== "object" || typeof event.id !== "string" ||
        typeof event.event !== "string" || !event.payment || typeof event.payment !== "object") {
      return json({ error: "Evento inválido" }, 400);
    }
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  // HARD STOP: Do not activate subscriptions until DB schema, authenticated
  // payment retrieval from Asaas, event idempotency, and ordering are implemented.
  // Never trust payment.externalReference or payment status from the webhook alone.
  console.warn("Webhook autenticado, mas processamento ainda não habilitado", {
    id: event.id,
    type: event.event,
  });
  return json({ error: "Processamento de pagamentos ainda não habilitado" }, 503);
});
