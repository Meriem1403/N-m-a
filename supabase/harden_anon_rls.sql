-- NÉMÉA — Renforcer l’accès : CRM réservé aux comptes connectés (pas d’accès anon aux profils/biens)
-- Exécuter dans Supabase → SQL Editor après schema.sql / secure_rls.sql

-- Anciennes policies démo (accès anonyme total)
drop policy if exists "demo_profiles_all" on profiles;
drop policy if exists "demo_exchanges_all" on exchanges;
drop policy if exists "demo_searches_all" on searches;
drop policy if exists "demo_search_history_all" on search_history;
drop policy if exists "demo_properties_all" on properties;

-- CRM : uniquement authenticated (idempotent si déjà en place)
drop policy if exists "profiles_authenticated" on profiles;
create policy "profiles_authenticated" on profiles
  for all to authenticated using (true) with check (true);

drop policy if exists "exchanges_authenticated" on exchanges;
create policy "exchanges_authenticated" on exchanges
  for all to authenticated using (true) with check (true);

drop policy if exists "searches_authenticated" on searches;
create policy "searches_authenticated" on searches
  for all to authenticated using (true) with check (true);

drop policy if exists "search_history_authenticated" on search_history;
create policy "search_history_authenticated" on search_history
  for all to authenticated using (true) with check (true);

drop policy if exists "properties_authenticated" on properties;
create policy "properties_authenticated" on properties
  for all to authenticated using (true) with check (true);

-- Retirer les droits anon sur le CRM (même si quelqu’un appelle l’API avec la clé anon)
revoke all on table public.profiles from anon;
revoke all on table public.exchanges from anon;
revoke all on table public.searches from anon;
revoke all on table public.search_history from anon;
revoke all on table public.properties from anon;

-- Formulaires publics /f/… : anon peut seulement vérifier un lien et envoyer une demande
grant select on table public.intake_tokens to anon;
grant insert on table public.client_intakes to anon;
