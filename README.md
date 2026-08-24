# WUGAMS - Front-end ERP

Fondation front-end de la plateforme multi-filiales WUGAMS, construite avec Next.js 16, React 19 et Tailwind CSS 4. Le back-office est branché sur l'API NestJS WUGAMS ERP (`https://wugames-holding-inc.vercel.app`).

## Démarrer

Exécuter npm install puis npm run dev.

Ouvrir ensuite http://localhost:3000.

La connexion et le back-office appellent l'API en direct via un proxy Next.js (`next.config.ts` : `/api/v1/*` → back-end). Le back-end n'envoyant pas d'en-têtes CORS, ce proxy évite tout appel inter-origines.

## Pages livrées

- / - vitrine institutionnelle WUGAMS.
- /connexion - connexion client (espace client).
- /connexion-travailleur - connexion travailleur (employés, managers, gérant).
- /espace - tableau de bord consolidé (filiales, factures, missions, alertes stock, notifications — données API).
- /espace/[module] - vues clients, fournisseurs, filiales, stocks, missions, devis, factures, ouvriers et notifications branchées sur l'API.
- /espace/administration - comptes et journal d'audit réels (réservé Gérant / Dev Digital).
- /espace/ouvriers - module + grille de performance S1-S9 alimentée par les évaluations de l'API.

Chaque module branché affiche un badge « Données en direct · API WUGAMS » (ou « Mode démonstration » en cas d'indisponibilité) et retombe silencieusement sur les données de démonstration.

## Organisation utile

app/

- (workspace)/espace/ : routes du back-office ERP.
- components/auth/ : interface de connexion.
- components/ui/ : composants visuels partagés.
- components/workspace/ : navigation, dashboard, tables métier, pont de données (`module-data-bridge.tsx`) et formulaires de création branchés API.
- lib/api/ : appels typés par ressource (auth, users, clients, fournisseurs, filiales, stocks, missions, factures, évaluations, notifications, audit-logs, client-space).
- lib/api-client.ts : client HTTP (session, refresh single-flight, erreurs API normalisées).
- lib/contracts.ts : contrats TypeScript partagés avec le back-end.
- lib/module-data.ts : chargement par module (API ou démo) et mapping entité → ligne UI.
- lib/module-create.ts : configs des formulaires de création (clients, fournisseurs, stocks, missions, factures).
- lib/demo-data.ts : données de repli pour les modules non encore exposés par l'API.

## Configuration

- `.env.local` : `NEXT_PUBLIC_API_URL=/api/v1` (chemin relatif → proxy Next).
- `BACKEND_URL` (optionnel) : remplace l'URL par défaut du back-end dans `next.config.ts`.

## Raccordement au back-end

1. Utiliser `apiFetch` dans `app/lib/api-client.ts` — le client sérialise le JSON, ajoute le jeton d'accès, recharge le jeton si nécessaire (single-flight) et remonte les erreurs de manière uniforme (`ApiError`).

2. Déclarer chaque ressource dans `app/lib/api/` + `app/lib/contracts.ts`, puis l'enregistrer dans `app/lib/module-data.ts` (`apiLoaders`) pour brancher un module existant.

3. Le back-end reste la source de vérité pour le RBAC et le cloisonnement filiale_id. Le front n'affiche que les actions autorisées, mais chaque endpoint doit aussi vérifier le rôle et le périmètre serveur.

4. Session : access token court (`expires_in` parsé, ex. "7d") + refresh token opaque échangé sur `/auth/refresh` ; 2FA gérée côté UI quand le compte l'exige.

## Vérifications

Exécuter npm run lint puis npm run build.
