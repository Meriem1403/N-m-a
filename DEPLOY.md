# Déployer Néméa sur Internet (gratuit)

Stack recommandée :

| Rôle | Service | Offre gratuite |
|------|---------|----------------|
| **Site / PWA** | [Netlify](https://www.netlify.com) | Build + CDN |
| **Base PostgreSQL** | [Supabase](https://supabase.com) | 500 Mo, API REST |

Sans variables Supabase, l’app tourne en **mode démo** (données en mémoire, perdues au rechargement).  
Avec Supabase, les profils, recherches et biens sont **persistés en base**.

### Développement local (Docker)

Le repo ne contient **que le front**. Docker lance uniquement Vite — **un seul service** `nemea`, c’est normal.

| Où | Quoi |
|----|------|
| Conteneur `nemea` | Interface React (`http://localhost:5180`) |
| [Supabase](https://supabase.com) | Base + auth (URL/clé dans `.env`) |
| Netlify (prod) | Hébergement du build, pas Docker |

```bash
docker compose up --build -d
docker logs -f nemea-dev
```

Port **5180** sur la machine → **5173** dans le conteneur (évite le conflit avec `npm run dev` sur 5173).

---

## 1. Créer la base Supabase

1. Compte sur [supabase.com](https://supabase.com) → **New project**
2. Choisir une région proche (ex. **Frankfurt**)
3. Attendre la fin du provisioning

### Schéma SQL

1. **SQL Editor** → **New query**
2. Coller tout le fichier [`supabase/schema.sql`](./supabase/schema.sql)
3. **Run**

Au premier lancement en ligne, si la base est vide, l’app **importe automatiquement les données démo** dans Supabase.

### Clés API

1. **Project Settings** → **API**
2. Noter :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Clé client** → `VITE_SUPABASE_ANON_KEY`  
     Recommandé : onglet **Legacy anon, service_role API keys** → copier la clé **anon** (`eyJ…`).  
     La clé **Publishable** (`sb_publishable_…`) fonctionne parfois, mais en cas d’erreur de synchro, utiliser **Legacy anon**.

> Ne jamais committer la clé `service_role` dans le front.

---

## 2. Déployer le front sur Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Repo : **`Meriem1403/N-m-a`**, branche **`main`**
3. Build : `npm run build` · Publish : **`dist`** (déjà dans `netlify.toml`)
4. **Site configuration** → **Environment variables** :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | clé anon du projet |

5. **Deploy site** (ou **Trigger deploy** après avoir ajouté les variables)

### Vérifier le bon site

L’app immobilier a le titre **NÉMÉA** et la description *« Gestion de prospects immobiliers… »*.  
L’URL **`nemea.netlify.app`** peut être **un autre projet** — utilise l’URL affichée dans **ton** dashboard Netlify.

---

## 3. Développement local avec la base cloud

```bash
cp .env.example .env
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Sans `.env`, mode démo local uniquement.

---

## 4. PWA / cache

Après un déploiement, si l’ancienne version s’affiche :

- iPhone : supprimer l’icône sur l’écran d’accueil, rouvrir l’URL dans Safari, réinstaller
- Desktop : rechargement forcé ou fenêtre privée

---

## 5. Sécurité (obligatoire en production)

L’application affiche un **écran de connexion** dès que Supabase est configuré. Sans login, personne ne peut lire ni modifier les données (RLS).

### 5.1 Activer l’email / mot de passe

1. Supabase → **Authentication** → **Providers** → **Email** → activé.
2. Pour une agence fermée : **Authentication** → **Providers** → désactiver **Sign ups** (inscriptions publiques).
3. **Authentication** → **Users** → **Add user** → email + mot de passe pour chaque collaborateur.

### 5.2 Appliquer les policies RLS sécurisées

Si la base a encore été créée avec les anciennes policies `demo_*_all` :

1. **SQL Editor** → coller le fichier `supabase/secure_rls.sql` → **Run**.

Les visiteurs anonymes (clé anon sans session) n’ont plus accès aux tables.

### 5.3 Déployer le front

Commit + push → Netlify rebuild. Ouvrir le site : page **Connexion sécurisée**, puis accès à l’app avec le compte créé à l’étape 5.1.

### 5.4 Modèle d’accès

Tous les **comptes connectés** voient les **mêmes** profils, recherches et biens (équipe d’une même agence). Pour isoler les données par utilisateur, il faudrait ajouter une colonne `owner_id` et des policies `auth.uid()` — non inclus dans cette version.

### 5.5 Formulaires client (lien public)

1. **SQL Editor** → exécuter **`supabase/apply_updates.sql`** (recommandé, idempotent)  
   ou `supabase/intake_forms.sql` si base neuve sans ces tables.
2. Dans l’app : **Formulaires client** → **Générer et copier le lien** → envoyer par SMS / WhatsApp / email.
3. La cliente ouvre `/f/…` sans compte ; la demande apparaît dans l’app (alerte + badge menu).

### 5.6 Mot de passe oublié

1. Sur la page de connexion : **Mot de passe oublié ?** → email → lien reçu par mail.
2. Supabase → **Authentication** → **URL Configuration** :
   - **Site URL** : l’URL Netlify de l’app (ex. `https://votre-site.netlify.app`)
   - **Redirect URLs** : ajouter `https://votre-site.netlify.app/reinitialiser-mot-de-passe` (et la même URL en `http://localhost:5173/...` pour le dev).
3. Sans accès au mail : **Authentication** → **Users** → ton utilisateur → **Send password recovery** ou définir un **nouveau mot de passe** manuellement (admin Supabase).

---

## 6. Mise à jour Supabase après un pull Git (sans reset des données)

Les évolutions récentes de l’app (localisation PACA, import profil/bien, photos en base64, Docker, UI) **ne demandent pas de nouvelles colonnes** sur `profiles`, `searches` ou `properties` si vous avez déjà exécuté `schema.sql`.

| Étape | Fichier SQL | Quand |
|-------|-------------|--------|
| 1 | [`supabase/apply_updates.sql`](./supabase/apply_updates.sql) | Formulaires client, liens `/f/…` |
| 2 | [`supabase/secure_rls.sql`](./supabase/secure_rls.sql) | Uniquement si accès anonyme aux tables CRM (anciennes policies `demo_*`) |

Puis **Deploy** sur Netlify (ou rebuild Docker) pour servir le nouveau front.

---

## Dépannage

| Symptôme | Piste |
|----------|--------|
| Données perdues au refresh | Variables Supabase absentes sur Netlify |
| Erreur au chargement | Schéma SQL non exécuté ou RLS mal appliqué |
| Ancienne UI | Mauvaise URL Netlify ou cache PWA |
| Bandeau rouge « synchronisation » | Voir la console réseau (403 → policies / clés) |
