Diagnóstico da conexão Supabase do Projeto X V2

NÃO altere nenhum arquivo ainda.

Quero apenas diagnosticar qual projeto Supabase este aplicativo está realmente usando.

Inspecione:

src/integrations/supabase/client.ts

variáveis de ambiente Supabase

qualquer outro arquivo que inicialize createClient()

Informe claramente:

Qual é o valor/configuração de SUPABASE_URL usada pelo frontend.

Qual é o project ref extraído dessa URL.

Confirme se o project ref é exatamente:

jddgebxqwmxngfitcftb

Informe se existe mais de um cliente Supabase no projeto.

Informe se /forgot-password importa exatamente esse mesmo cliente.

Confirme se o botão de recuperação realmente chama:

supabase.auth.resetPasswordForEmail(...)



Informe em qual arquivo e linha aproximada essa chamada está.

IMPORTANTE:

Não mostrar nem expor service_role.

Não mostrar chaves secretas.

Não modificar código.

Não criar novo Supabase.

Apenas analisar e responder com o diagnóstico.

IMPORTANTE: Execute TODOS os detalhes desta tarefa com máxima precisão. Não ignore nada, não simplifique, implemente EXATAMENTE o que foi pedido.