-- NÉMÉA — Mise à jour Supabase (sans toucher profils / recherches / biens existants)
-- Exécuter dans Supabase → SQL Editor → Run (ré-exécutable en grande partie).
--
-- Les changements app récents (PACA, import, photos, UI) utilisent déjà :
--   profiles, searches.criteria (jsonb), properties.photos (text[]), etc.
-- Ce script ajoute / répare surtout les **formulaires client** (liens publics /f/…).

-- ── Prérequis : fonction updated_at (déjà dans schema.sql) ──
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Formulaires client ──
create table if not exists intake_tokens (
  id uuid primary key default gen_random_uuid(),
  label text,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists client_intakes (
  id uuid primary key default gen_random_uuid(),
  intake_token_id uuid not null references intake_tokens(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'processed', 'dismissed')),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  message text,
  criteria jsonb not null default '{}',
  agent_notes text,
  processed_profile_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_intakes_status on client_intakes(status);
create index if not exists idx_client_intakes_created on client_intakes(created_at desc);

drop trigger if exists client_intakes_updated_at on client_intakes;
create trigger client_intakes_updated_at before update on client_intakes
for each row execute function set_updated_at();

alter table intake_tokens enable row level security;
alter table client_intakes enable row level security;

drop policy if exists "intake_tokens_authenticated" on intake_tokens;
create policy "intake_tokens_authenticated" on intake_tokens
  for all to authenticated using (true) with check (true);

drop policy if exists "client_intakes_authenticated" on client_intakes;
create policy "client_intakes_authenticated" on client_intakes
  for all to authenticated using (true) with check (true);

drop policy if exists "client_intakes_anon_insert" on client_intakes;
create policy "client_intakes_anon_insert" on client_intakes
  for insert to anon
  with check (
    exists (
      select 1 from intake_tokens t
      where t.id = intake_token_id
        and t.active = true
        and (t.expires_at is null or t.expires_at > now())
    )
  );

create or replace function public.intake_link_is_open(p_token uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from intake_tokens t
    where t.id = p_token
      and t.active = true
      and (t.expires_at is null or t.expires_at > now())
  );
$$;

grant execute on function public.intake_link_is_open(uuid) to anon, authenticated;
