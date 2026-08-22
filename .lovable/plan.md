# Plano de Migração: Lovable Cloud para Supabase Externo (jddgebxqwmxngfitcftb)

Este plano detalha a transição completa do backend de execução do aplicativo para o projeto Supabase externo `jddgebxqwmxngfitcftb`. O objetivo é substituir todas as referências ao projeto interno vazio pela infraestrutura externa gerenciada, preservando o design e as funcionalidades atuais.

## Alterações de Configuração

### 1. Variáveis de Ambiente e Configuração CLI
*   **Arquivo `.env`**: Atualizar `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para o novo projeto.
    *   `VITE_SUPABASE_PROJECT_ID`: `jddgebxqwmxngfitcftb`
    *   `VITE_SUPABASE_URL`: `https://jddgebxqwmxngfitcftb.supabase.co`
    *   `VITE_SUPABASE_PUBLISHABLE_KEY`: (Chave anon do projeto externo)
*   **Arquivo `supabase/config.toml`**: Atualizar o `project_id` para `jddgebxqwmxngfitcftb`.

### 2. Cliente Supabase e Integração
*   **Arquivo `src/integrations/supabase/client.ts`**: Garantir que o cliente utilize exclusivamente as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` definidas no `.env`.
*   Verificar se existe `src/integrations/supabase/client.server.ts` e aplicar a mesma regra.

## Migração de Recursos e Autenticação

### 3. Fluxos de Autenticação e Gestão de Usuários
*   Remover dependências do Lovable Cloud nos seguintes fluxos:
    *   Login (`src/routes/login.tsx`)
    *   Recuperação de senha (`src/routes/forgot-password.tsx`, `src/routes/update-password.tsx`)
    *   Gestão de sessão (`src/hooks/useAuth.tsx`)
*   Garantir que todos os métodos (`signInWithPassword`, `resetPasswordForEmail`, `getSession`, `signOut`) operem através do cliente Supabase conectado ao projeto externo.

### 4. Gestão de Licenças XForge
*   **Página `/licencas-xforge`**: Garantir que a chamada à Edge Function `xforge-admin` utilize o `access_token` da sessão do novo projeto.
*   Confirmar que o endpoint da Edge Function aponta corretamente para o novo domínio (`jddgebxqwmxngfitcftb.supabase.co`).

## Verificação e Diagnóstico

### 5. Auditoria Pós-Migração
*   Validar que `VITE_SUPABASE_PROJECT_ID` está ativo.
*   Confirmar o Project Ref usado por cada funcionalidade (Login, Sessão, Licenças).
*   Certificar-se de que nenhuma referência ao project ref antigo (`rkbxtymtjnlxd1awmscb`) permaneça em arquivos de configuração ativos.

## Detalhes Técnicos
*   A migração foca apenas na configuração e conectividade. O design das interfaces e a lógica das Edge Functions não serão alterados.
*   Utilizaremos apenas a `anon/publishable key` no frontend para segurança.
*   A conexão MCP é mantida como uma interface de assistente, independente do backend de execução do app.
