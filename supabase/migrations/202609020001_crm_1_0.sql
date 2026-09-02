-- =========================================================
-- PROJETO X
-- CRM 1.0
-- =========================================================

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,
  phone text,
  email text,
  company text,

  status text not null default 'novo'
    check (
      status in (
        'novo',
        'contato',
        'negociacao',
        'ganho',
        'perdido'
      )
    ),

  source text,

  potential_value numeric(12,2)
    not null
    default 0,

  notes text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null
    references public.crm_leads(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  content text not null,

  created_at timestamptz
    not null
    default now()
);


-- =========================================================
-- ÍNDICES
-- =========================================================

create index if not exists crm_leads_user_id_idx
on public.crm_leads(user_id);

create index if not exists crm_leads_status_idx
on public.crm_leads(status);

create index if not exists crm_leads_created_at_idx
on public.crm_leads(created_at desc);

create index if not exists crm_notes_lead_id_idx
on public.crm_notes(lead_id);

create index if not exists crm_notes_user_id_idx
on public.crm_notes(user_id);


-- =========================================================
-- UPDATED_AT AUTOMÁTICO
-- =========================================================

create or replace function public.crm_update_updated_at()
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

drop trigger if exists crm_leads_updated_at
on public.crm_leads;

create trigger crm_leads_updated_at
before update on public.crm_leads
for each row
execute function public.crm_update_updated_at();


-- =========================================================
-- RLS
-- =========================================================

alter table public.crm_leads
enable row level security;

alter table public.crm_notes
enable row level security;


-- =========================================================
-- CRM LEADS
-- =========================================================

drop policy if exists "crm_leads_select_own"
on public.crm_leads;

create policy "crm_leads_select_own"
on public.crm_leads
for select
to authenticated
using (
  auth.uid() = user_id
);


drop policy if exists "crm_leads_insert_own"
on public.crm_leads;

create policy "crm_leads_insert_own"
on public.crm_leads
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists "crm_leads_update_own"
on public.crm_leads;

create policy "crm_leads_update_own"
on public.crm_leads
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


drop policy if exists "crm_leads_delete_own"
on public.crm_leads;

create policy "crm_leads_delete_own"
on public.crm_leads
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- =========================================================
-- CRM NOTES
-- =========================================================

drop policy if exists "crm_notes_select_own"
on public.crm_notes;

create policy "crm_notes_select_own"
on public.crm_notes
for select
to authenticated
using (
  auth.uid() = user_id
);


drop policy if exists "crm_notes_insert_own"
on public.crm_notes;

create policy "crm_notes_insert_own"
on public.crm_notes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.crm_leads
    where crm_leads.id = crm_notes.lead_id
      and crm_leads.user_id = auth.uid()
  )
);


drop policy if exists "crm_notes_update_own"
on public.crm_notes;

create policy "crm_notes_update_own"
on public.crm_notes
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.crm_leads
    where crm_leads.id = crm_notes.lead_id
      and crm_leads.user_id = auth.uid()
  )
);


drop policy if exists "crm_notes_delete_own"
on public.crm_notes;

create policy "crm_notes_delete_own"
on public.crm_notes
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- =========================================================
-- PERMISSÕES
-- =========================================================

grant select, insert, update, delete
on public.crm_leads
to authenticated;

grant select, insert, update, delete
on public.crm_notes
to authenticated;