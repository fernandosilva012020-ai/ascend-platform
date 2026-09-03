-- ============================================================
-- Projeto X
-- Landing Pages 1.0
-- Persistência das páginas criadas pelos usuários
-- ============================================================

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  slug text not null,

  category text not null
    check (
      category in (
        'produto',
        'servico',
        'leads',
        'evento',
        'afiliado',
        'negocio-local'
      )
    ),

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'published'
      )
    ),

  content jsonb not null default '{}'::jsonb,

  views bigint not null default 0
    check (views >= 0),

  leads_count bigint not null default 0
    check (leads_count >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint landing_pages_user_slug_unique
    unique (user_id, slug)
);


-- ============================================================
-- Índices
-- ============================================================

create index if not exists landing_pages_user_id_idx
  on public.landing_pages(user_id);

create index if not exists landing_pages_status_idx
  on public.landing_pages(status);

create index if not exists landing_pages_slug_idx
  on public.landing_pages(slug);

create index if not exists landing_pages_created_at_idx
  on public.landing_pages(created_at desc);


-- ============================================================
-- updated_at automático
-- ============================================================

create or replace function public.update_landing_pages_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists landing_pages_set_updated_at
  on public.landing_pages;

create trigger landing_pages_set_updated_at
before update on public.landing_pages
for each row
execute function public.update_landing_pages_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.landing_pages
enable row level security;


-- Usuário autenticado pode visualizar somente as próprias páginas
drop policy if exists "Users can view own landing pages"
  on public.landing_pages;

create policy "Users can view own landing pages"
on public.landing_pages
for select
to authenticated
using (
  auth.uid() = user_id
);


-- Usuário autenticado pode criar páginas somente para si
drop policy if exists "Users can create own landing pages"
  on public.landing_pages;

create policy "Users can create own landing pages"
on public.landing_pages
for insert
to authenticated
with check (
  auth.uid() = user_id
);


-- Usuário autenticado pode atualizar somente as próprias páginas
drop policy if exists "Users can update own landing pages"
  on public.landing_pages;

create policy "Users can update own landing pages"
on public.landing_pages
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


-- Usuário autenticado pode excluir somente as próprias páginas
drop policy if exists "Users can delete own landing pages"
  on public.landing_pages;

create policy "Users can delete own landing pages"
on public.landing_pages
for delete
to authenticated
using (
  auth.uid() = user_id
);