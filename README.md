# NÉMÉA

Application PWA de gestion de prospects immobiliers avec moteur de correspondance automatique.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Supabase + PostgreSQL (schéma prêt, données démo en local)
- PWA (installable sur iPhone, Mac, iPad, Android)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Fonctionnalités

- **Profils** — fiches prospects avec historique des échanges
- **Import rapide** — parsing automatique de texte libre
- **Recherches** — critères obligatoires / souhaités / indifférents / refusés
- **Biens** — catalogue avec statuts
- **Correspondances** — scoring automatique prospect ↔ bien
- **Historique** — évolution des budgets et critères

## Supabase (optionnel)

1. Créer un projet Supabase
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL
3. Copier `.env.example` vers `.env` et renseigner les clés

## Build & déploiement

```bash
npm run build
npm run preview
```

### Netlify + Supabase (démo en ligne avec vraie base)

Guide pas à pas : **[DEPLOY.md](./DEPLOY.md)**

- **Netlify** : hébergement du site (gratuit)
- **Supabase** : PostgreSQL + API (gratuit)
- Sans clés Supabase dans Netlify → mode démo mémoire uniquement

### Démo sur iPhone (gratuit, sans App Store)

Néméa est une **PWA** : une fois déployée sur Netlify (ou Vercel) :

1. Ouvrir l’URL dans **Safari** sur iPhone
2. Bouton **Partager** → **Sur l’écran d’accueil**
3. L’app s’ouvre en plein écran, comme une app native

> Vercel fonctionne aussi (`vercel --prod`). Pour l’App Store il faudrait Capacitor, inutile pour une démo.
