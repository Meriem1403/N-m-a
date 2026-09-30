-- NÉMÉA — Passer de RLS « démo ouverte » à accès réservé aux utilisateurs connectés
-- À exécuter dans Supabase → SQL Editor (une fois), après avoir créé au moins un utilisateur Auth.

-- 1) Supprimer les policies démo (accès anonyme total)
drop policy if exists "demo_profiles_all" on profiles;
drop policy if exists "demo_exchanges_all" on exchanges;
drop policy if exists "demo_searches_all" on searches;
drop policy if exists "demo_search_history_all" on search_history;
drop policy if exists "demo_properties_all" on properties;

-- 2) Accès CRUD uniquement pour les sessions authentifiées (JWT Supabase Auth)
-- Tous les comptes connectés partagent les mêmes données (adapté à une agence / petite équipe).

create policy "profiles_authenticated" on profiles
  for all to authenticated using (true) with check (true);

create policy "exchanges_authenticated" on exchanges
  for all to authenticated using (true) with check (true);

create policy "searches_authenticated" on searches
  for all to authenticated using (true) with check (true);

create policy "search_history_authenticated" on search_history
  for all to authenticated using (true) with check (true);

create policy "properties_authenticated" on properties
  for all to authenticated using (true) with check (true);
