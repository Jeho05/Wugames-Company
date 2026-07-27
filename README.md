# WUGAMS - Front-end ERP

Fondation front-end de la plateforme multi-filiales WUGAMS, construite avec Next.js 16, React 19 et Tailwind CSS 4.

## Démarrer

Exécuter npm install puis npm run dev.

Ouvrir ensuite http://localhost:3000.

## Pages livrées

- / - vitrine institutionnelle WUGAMS.
- /connexion - connexion de démonstration et choix de profil.
- /espace - tableau de bord consolidé.
- /espace/[module] - vues clients, chantiers, missions, ouvriers, devis/factures, stocks, fournisseurs, filiales, messagerie, notifications et rapports.

Les données affichées sont fictives et centralisées dans app/lib/demo-data.ts. Elles permettent de finaliser la navigation, les états, les listes, la recherche et les modales avant le branchement du back-end.

## Organisation utile

app/

- (workspace)/espace/ : routes du back-office ERP.
- components/auth/ : interface de connexion.
- components/ui/ : composants visuels partagés.
- components/workspace/ : navigation, dashboard et tables métier.
- lib/api-client.ts : client HTTP générique pour l'API.
- lib/contracts.ts : contrats TypeScript à partager avec le back-end.
- lib/demo-data.ts : données provisoires de l'interface.

## Raccordement au back-end

1. Ajouter NEXT_PUBLIC_API_URL dans .env.local, par exemple NEXT_PUBLIC_API_URL=http://localhost:3001/api.

2. Utiliser apiFetch dans app/lib/api-client.ts pour chaque ressource. Le client sérialise les requêtes JSON, ajoute le jeton d'accès si nécessaire et remonte les erreurs API de manière uniforme.

3. Remplacer progressivement les données de app/lib/demo-data.ts par des appels adaptés aux ressources : clients, chantiers, missions, ouvriers, devis, factures, stocks, fournisseurs, filiales, notifications et rapports.

4. Le back-end reste la source de vérité pour le RBAC et le cloisonnement filiale_id. Le front ne doit afficher que les actions autorisées, mais chaque endpoint doit aussi vérifier le rôle et le périmètre serveur.

Pour l'authentification, privilégier un access token court et un refresh token protégé par cookie HttpOnly, avec 2FA obligatoire pour les profils d'administration décrits dans le document technique.

## Vérifications

Exécuter npm run lint puis npm run build.
