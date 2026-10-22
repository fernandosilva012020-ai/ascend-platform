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
