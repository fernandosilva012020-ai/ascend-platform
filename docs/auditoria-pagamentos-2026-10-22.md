# Projeto X — Auditoria de pagamentos (2026-10-22)

## Situação confirmada
- Projeto Supabase `jddgebxqwmxngfitcftb` ativo.
- Edge Functions publicadas: `create-asaas-subscription`, `asaas-webhook`, `mercadopago-create-pix`, `mercadopago-pix-status`, `mercadopago-webhook`.
- Tela `src/routes/assinatura.tsx` utiliza Asaas e mensalidade de R$49,90.
- Funções Mercado Pago têm validação de referência, tipo PIX e valor antes de confirmar na RPC `network_v2_confirm_payment`.

## Riscos prioritários (não resolvidos)
1. **Autenticidade Asaas**: `asaas-webhook` não valida o header `asaas-access-token` antes de atualizar o plano. Exigir token configurado no Asaas e Secret Supabase; rejeitar solicitações inválidas.
2. **JWT do webhook Asaas**: Edge Function está publicada com `verify_jwt=true`. Webhooks externos normalmente não enviam JWT Supabase, o que pode impedir a entrega. Só mudar essa opção junto da autenticação obrigatória por token e validação do evento.
3. **Coluna do perfil inconsistente**: webhook Asaas atualiza `profiles.plan` mas frontend consulta `profiles.plano`. Checar schema antes de alterar.
4. **Idempotência e vínculo**: conferir o ID único de evento Asaas, a assinatura/cobrança vinculada ao usuário e o pagamento confirmado na API Asaas antes de conceder acesso; não liberar com JSON não verificado.
5. **Falhas de escrita**: tratar o erro retornado pelo Supabase `.update()` e somente responder sucesso após persistência.
6. **Estado da assinatura**: evitar que um evento antigo marque um plano como inadimplente depois de uma renovação paga. Verificar sequência temporal e cobrança correspondente.
7. **Controle de acesso**: garantir que acesso Premium não depende apenas de verificações no frontend; validar no backend e nas políticas RLS.

## Antes de publicar alterações financeiras
- Validar colunas reais de `profiles` e tabelas de assinaturas. As tentativas de consulta ao banco em 2026-10-22 falharam por timeout.
- Configurar token de webhook Asaas (32–255 caracteres) em segredo do Supabase; nunca colocar no GitHub.
- Testar no sandbox: notificação inválida, duplicada, pagamento aprovado, vencido, evento fora de ordem e tentativa de acesso sem assinatura.
- Só ativar em produção após testes sem cobranças reais.
- Não criar ou transferir dinheiro durante testes de código.

Referências oficiais:
- https://docs.asaas.com/docs/receba-eventos-do-asaas-no-seu-endpoint-de-webhook
- https://docs.asaas.com/docs/sobre-os-webhooks

## Diagnóstico confirmado pelo SQL Editor (22/10/2026)
A consulta a information_schema.columns da tabela public.profiles retornou seis colunas: `id`, `nome`, `plano`, `status`, `created_at`, `inicio_teste`.
**Não existem** `plan`, `subscription_status` nem `updated_at`. O webhook Asaas atualmente publicado tenta atualizar esses três campos, de modo que a atualização de perfil falharia. O frontend usa `plano`, compatível com a tabela. Ainda não foi verificado o formato e as políticas da tabela, nem a autenticação do webhook; NÃO implantar uma mudança que libere premium sem validar a origem e persistência do pagamento e idempotência.
Próximo passo: verificar o estado de `profiles` e das tabelas de pagamentos por consultas somente leitura e implementar o webhook de forma autenticada, transacional e testada no ambiente de homologação.

## Confirmações adicionais por consultas SQL (22/10/2026)
- `network_v2_confirm_payment`: `anon` e `authenticated` sem permissão EXECUTE; `service_role` com EXECUTE; função SECURITY DEFINER. A função precisa continuar inacessível a usuários comuns.
- `network_payments`: índice único sobre `(provider, provider_payment_id)` confirmado; também há índice único de `provider_event_id`. A rotina contém advisory lock por pagamento, pesquisa prévia e bloqueio do membro `FOR UPDATE`.
- `provider_webhook_events`: índice único nomeado `provider_webhook_events_provider_provider_event_id_key`. O índice ajuda a proteger o registro, mas não comprova por si só processamento exatamente uma vez.
- O corpo da rotina V2 também atualiza `community_subscriptions`, credita carteiras e cria `board_positions`. Essas operações precisam ser avaliadas separadamente das cobranças legítimas de assinatura; esta auditoria não autoriza nem implementa redistribuição financeira entre participantes.
- As confirmações estruturais **não** substituem testes de concorrência, autenticação no endpoint, verificação de status do provedor e tratamento de estornos.

## Próxima ação segura
Preparar correção isolada para a assinatura SaaS, após identificar ligação entre ID Asaas da cobrança, assinatura e usuário no banco. O webhook atual não deve promover `profiles.plano` diretamente apenas com dados recebidos da notificação. Registrar de forma atômica evento autenticado/idempotente e confirmar o pagamento pela API do provedor antes de atualizar acesso. Não mudar a Edge Function de produção sem testes e plano de reversão.
