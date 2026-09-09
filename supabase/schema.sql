-- NÉMÉA — Schéma PostgreSQL pour Supabase

create type contact_source as enum (
  'telephone', 'email', 'site_web', 'leboncoin', 'seloger', 'bienici', 'recommandation', 'salon', 'autre'
);

create type criterion_level as enum ('required', 'wanted', 'indifferent', 'refused');
create type property_type as enum ('studio', 'T1', 'T2', 'T3', 'T4', 'T5+', 'maison', 'loft', 'autre');
create type property_status as enum ('disponible', 'option', 'compromis', 'vendu', 'retire');
create type exchange_type as enum ('appel', 'email', 'sms', 'visite', 'note');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  first_contact_date date not null default current_date,
  source contact_source not null default 'autre',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table exchanges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  type exchange_type not null default 'note',
  content text not null,
  created_at timestamptz not null default now()
);

create table searches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  active boolean not null default true,
  criteria jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table search_history (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references searches(id) on delete cascade,
  date date not null default current_date,
  changes jsonb not null default '{}',
  note text,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  price integer not null,
  city text not null,
  district text,
  type property_type not null,
  surface numeric not null,
  rooms integer not null,
  bedrooms integer,
  terrace boolean not null default false,
  balcony boolean not null default false,
  garden boolean not null default false,
  parking boolean not null default false,
  garage boolean not null default false,
  cave boolean not null default false,
  elevator boolean not null default false,
  floor integer,
  view boolean not null default false,
  works boolean not null default false,
  photos text[] not null default '{}',
  status property_status not null default 'disponible',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_searches_profile on searches(profile_id);
create index idx_searches_active on searches(active) where active = true;
create index idx_properties_status on properties(status);
create index idx_exchanges_profile on exchanges(profile_id);
create index idx_search_history_search on search_history(search_id);
