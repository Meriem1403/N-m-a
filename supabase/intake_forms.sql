-- NÉMÉA — Formulaires client (lien public → demandes en attente pour l’agent)

create table intake_tokens (
  id uuid primary key default gen_random_uuid(),
  label text,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table client_intakes (
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

create index idx_client_intakes_status on client_intakes(status);
create index idx_client_intakes_created on client_intakes(created_at desc);

create trigger client_intakes_updated_at before update on client_intakes
for each row execute function set_updated_at();

alter table intake_tokens enable row level security;
alter table client_intakes enable row level security;

-- Agents connectés : gestion complète
create policy "intake_tokens_authenticated" on intake_tokens
  for all to authenticated using (true) with check (true);

create policy "client_intakes_authenticated" on client_intakes
  for all to authenticated using (true) with check (true);

-- Prospect anonyme : envoi uniquement si le lien est actif
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

-- Vérifier un lien sans exposer la table (appel depuis le formulaire public)
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
