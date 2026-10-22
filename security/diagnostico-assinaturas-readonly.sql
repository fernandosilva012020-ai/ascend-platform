-- PROJETO X — diagnóstico somente leitura.
-- Execute no SQL Editor do projeto Supabase correto.
-- Não altera tabelas, assinaturas ou pagamentos.
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'network_members', 'network_settings', 'network_payments', 'pix_payment_intents', 'provider_webhook_events')
  AND column_name IN ('id', 'user_id', 'plan', 'plano', 'subscription_status', 'subscription_price', 'status', 'provider_payment_id')
ORDER BY table_name, ordinal_position;

-- Presença de funções de confirmação (sem executá-las).
SELECT routine_name, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('network_v2_confirm_payment', 'get_public_referrer', 'get_my_network_dashboard')
ORDER BY routine_name;

-- Verifique RLS nas tabelas relevantes.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'network_members', 'network_payments', 'pix_payment_intents', 'provider_webhook_events')
ORDER BY tablename;
