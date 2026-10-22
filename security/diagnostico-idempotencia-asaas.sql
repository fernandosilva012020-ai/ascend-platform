-- PROJETO X — diagnóstico Asaas somente leitura.
-- NÃO modifica pagamentos, saldos, usuários ou assinaturas.
-- Execute pelo SQL Editor no projeto jddgebxqwmxngfitcftb.
-- 1. Tabelas candidatas a registrar eventos e pagamentos.
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    table_name ilike '%asaas%' or
    table_name ilike '%webhook%' or
    table_name ilike '%payment%' or
    table_name ilike '%subscription%'
  )
order by table_name, ordinal_position;

-- 2. Índices de unicidade para eventos.
select t.relname as table_name, i.relname as index_name, ix.indisunique,
       pg_get_indexdef(ix.indexrelid) as definition
from pg_index ix
join pg_class t on t.oid = ix.indrelid
join pg_class i on i.oid = ix.indexrelid
join pg_namespace ns on ns.oid = t.relnamespace
where ns.nspname = 'public'
  and (t.relname ilike '%webhook%' or t.relname ilike '%payment%' or t.relname ilike '%subscription%')
order by t.relname, i.relname;

-- 3. Funções de processamento já existentes (somente metadados).
select p.proname as function_name, pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace ns on ns.oid=p.pronamespace
where ns.nspname='public'
  and (p.proname ilike '%asaas%' or p.proname ilike '%payment%' or p.proname ilike '%subscription%')
order by p.proname;
