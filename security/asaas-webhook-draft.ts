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
  if (expectedToken.length < 32 || expectedToken.length > 255 || /\s/.test(expectedToken)) {
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

  // Validate the payment with the provider, not only with webhook payload.
  const payment = event.payment as Record<string, unknown>;
  const paymentId = typeof payment.id === "string" ? payment.id : "";
  const asaasKey = Deno.env.get("ASAAS_API_KEY") ?? "";
  const apiBase = Deno.env.get("ASAAS_URL") ?? "https://api.asaas.com/v3";
  if (!paymentId || !/^pay_[A-Za-z0-9_-]+$/.test(paymentId) || !asaasKey) {
    return json({ error: "Pagamento inválido ou credenciais indisponíveis" }, 503);
  }
  const providerResponse = await fetch(
    `${apiBase}/payments/${encodeURIComponent(paymentId)}`,
    { headers: { "access_token": asaasKey, "Accept": "application/json" } },
  ).catch(() => null);
  if (!providerResponse?.ok) {
    return json({ error: "Falha na validação com o Asaas" }, 503);
  }
  const verified = await providerResponse.json() as Record<string, unknown>;
  if (verified.id !== paymentId) return json({ error: "Identificação divergente" }, 409);

  const providerStatus = String(verified.status ?? "");
  const externalReference = String(verified.externalReference ?? "");
  console.info("Evento Asaas validado em modo somente leitura", {
    eventId: event.id,
    eventType: event.event,
    paymentId,
    providerStatus,
    linkedUser: Boolean(externalReference),
  });

  // HARD STOP: the confirmed profiles schema has 'plano', NOT 'plan'.
  // Before enabling writes: persist event IDs idempotently, verify subscription,
  // amount and user mapping, handle ordering/refunds, and test RLS/authorization.
  // This draft never grants or revokes subscriptions.
  return json({ error: "Pagamento verificado; processamento ainda não habilitado" }, 503);
});
