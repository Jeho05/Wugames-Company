# WUGAMS ERP — Guide Complet d'Intégration & Référence API pour le Dashboard Admin

Ce document constitue la **source de vérité officielle** et le **guide technique complet** pour le développement, l'intégration et la maintenance du **Dashboard Administrateur (Frontend)** du système **WUGAMS ERP Holding Inc**.

---

## Sommaire

1. [Architecture Générale & Environnement](#1-architecture-générale--environnement)
2. [Gestion & Stockage des Fichiers & Images (Photos, Documents, Avatars)](#2-gestion--stockage-des-fichiers--images-photos-documents-avatars)
3. [Authentification, Sessions & Sécurité](#3-authentification-sessions--sécurité)
4. [Matrice des Rôles & Permissions (RBAC)](#4-matrice-des-rôles--permissions-rbac)
5. [Répertoire Exhaustif des Endpoints par Module](#5-répertoire-exhaustif-des-endpoints-par-module)
   - [5.1 Filiales & Gestion Multi-Sociétés](#51-filiales--gestion-multi-sociétés)
   - [5.2 Utilisateurs, Collaborateurs & Localisation](#52-utilisateurs-collaborateurs--localisation)
   - [5.3 Clients & CRM](#53-clients--crm)
   - [5.4 Fournisseurs & Achats](#54-fournisseurs--achats)
   - [5.5 Stocks, Produits & Alertes d'Inventaire](#55-stocks-produits--alertes-dinventaire)
   - [5.6 Chantiers & Projets](#56-chantiers--projets)
   - [5.7 Missions de Service & Opérations Terrain](#57-missions-de-service--opérations-terrain)
   - [5.8 Pointages & Contrôle Géolocalisé (Rayon 50m)](#58-pointages--contrôle-géolocalisé-rayon-50m)
   - [5.9 Devis, Proformas & Conversion en Facture](#59-devis-proformas--conversion-en-facture)
   - [5.10 Facturation, Recouvrement & Exports Comptables](#510-facturation-recouvrement--exports-comptables)
   - [5.11 Commandes & Enregistrement des Règlements (Mobile Money / Espèces)](#511-commandes--enregistrement-des-règlements-mobile-money--espèces)
   - [5.12 Primes Ouvriers (Calcul Mensuel BR-14)](#512-primes-ouvriers-calcul-mensuel-br-14)
   - [5.13 Programme de Fidélité Clients](#513-programme-de-fidélité-clients)
   - [5.14 Messagerie Instantanée Interne](#514-messagerie-instantanée-interne)
   - [5.15 Notifications & Flux Temps Réel (SSE)](#515-notifications--flux-temps-réel-sse)
   - [5.16 Évaluations & Contrôle Qualité](#516-évaluations--contrôle-qualité)
   - [5.17 Piste d'Audit & Historique de Sécurité](#517-piste-daudit--historique-de-sécurité)
   - [5.18 Gestion de la Vitrine Web & CMS](#518-gestion-de-la-vitrine-web--cms)
6. [Guide de Dépannage & Codes d'Erreur](#6-guide-de-dépannage--codes-derreur)

---

## 1. Architecture Générale & Environnement

### 1.1 Points d'Accès de l'API
- **Serveur de Développement Local** : `http://localhost:3000/api/v1`
- **Serveur de Production (Vercel Serverless)** : `https://wugames-holding-inc.vercel.app/api/v1`
- **Documentation Interactive Swagger UI** : `http://localhost:3000/api/docs` (ou `https://wugames-holding-inc.vercel.app/api/docs`)
- **Spécification JSON Swagger** : `/api/docs-json`

### 1.2 Format des Échanges
- Toutes les requêtes avec corps (Body) doivent avoir l'en-tête : `Content-Type: application/json`.
- Toutes les réponses sont retournées en JSON (sauf les exports comptables/PDF qui renvoient des flux binaires).
- En-tête d'authentification obligatoire pour les routes protégées :
  ```http
  Authorization: Bearer <access_token>
  ```

---

## 2. Gestion & Stockage des Fichiers & Images (Photos, Documents, Avatars)

> [!IMPORTANT]
> **Où et comment sont enregistrées les images ?**
> Le backend WUGAMS ERP est déployé en architecture **Serverless (Vercel)** avec une base de données **PostgreSQL hébergée sur Supabase**.
> 
> 1. **Dans la Base de Données PostgreSQL** : Nous stockons **uniquement les métadonnées et l'URL publique CDN** de l'image (ex: table `mission_photos`, table `chantier_photos`, champs `image_url`, `photo_url`, `document_url`).
> 2. **Les Fichiers Binaires Réels (JPG, PNG, WEBP, PDF)** : Sont stockés dans **Supabase Storage** (le service de stockage d'objets cloud S3-compatible intégré à notre infrastructure Supabase). 
> 
> **Pourquoi cette architecture ?**
> Sur Vercel Serverless, le système de fichiers est éphémère et en lecture seule : sauvegarder une image sur le disque dur local (`/uploads`) ferait perdre le fichier dès que la fonction serverless redémarre. L'upload vers le bucket Supabase Storage garantit la persistance définitive, une diffusion ultra-rapide par CDN mondial et une disponibilité 24/7.

### 2.1 Organisation des Buckets dans Supabase Storage

Créez / utilisez les 4 buckets publics suivants dans votre console Supabase :

| Bucket Name | Droits d'accès | Contenu |
|---|---|---|
| `missions` | Public Read / Authenticated Write | Photos d'intervention avant/après soumises par les ouvriers ou managers |
| `chantiers` | Public Read / Authenticated Write | Photos d'avancement des chantiers et plans de construction |
| `vitrine` | Public Read / Authenticated Write | Bannières, images de réalisations, photos d'articles de blog, photos de témoignages |
| `documents` | Private Read (URL signée) ou Public | PDF des devis, factures signées et attestations |

### 2.2 Workflow d'Upload depuis le Dashboard Admin (Frontend)

Le Dashboard Admin téléverse le fichier directement dans Supabase Storage via le SDK JavaScript officiel, puis transmet l'URL obtenue à l'API NestJS.

```
[ Dashboard Admin (Navigateur) ]
          |
          |  1. Upload du fichier binaire (JPG/PNG)
          v
[ Supabase Storage Bucket ]
          |
          |  2. Retourne l'URL CDN publique (https://...supabase.co/storage/v1/object/public/missions/photo123.jpg)
          v
[ Dashboard Admin (Navigateur) ]
          |
          |  3. Envoi du JSON à l'API NestJS : { mission_id, storage_url }
          v
[ Backend NestJS API ] ---> [ Base PostgreSQL (Table mission_photos) ]
```

### 2.3 Exemple de Code Frontend (React / Vue / Svelte / Vanilla)

```typescript
import { createClient } from '@supabase/supabase-js';

// Configuration du client Supabase pour le Dashboard Admin
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jnlpwznuihcsisqnyxmj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '...';
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Téléverse une image dans Supabase Storage et enregistre la photo dans la mission
 */
export async function uploadMissionPhoto(missionId: string, file: File, authToken: string) {
  // 1. Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop();
  const fileName = `${missionId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  // 2. Téléverser dans le bucket 'missions'
  const { data, error } = await supabase.storage
    .from('missions')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Erreur upload image: ${error.message}`);

  // 3. Obtenir l'URL CDN publique
  const { data: { publicUrl } } = supabase.storage
    .from('missions')
    .getPublicUrl(fileName);

  // 4. Enregistrer la photo sur l'API NestJS
  const response = await fetch('https://wugames-holding-inc.vercel.app/api/v1/missions/photos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      mission_id: missionId,
      storage_url: publicUrl,
    }),
  });

  if (!response.ok) throw new Error('Impossible de relier la photo à la mission sur l API.');
  return await response.json();
}
```

---

## 3. Authentification, Sessions & Sécurité

### 3.1 Connexion (`POST /auth/login`)
- **Accès** : Public
- **Corps (JSON)** :
  ```json
  {
    "email": "admin@wugams.com",
    "password": "VotreMotDePasse"
  }
  ```
- **Réponse (200 OK)** :
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid-...",
      "email": "admin@wugams.com",
      "first_name": "Super",
      "last_name": "Admin",
      "role": "ROLE_GERANT",
      "filiale_id": null,
      "is_2fa_enabled": false
    }
  }
  ```

### 3.2 Obtenir le Profil de la Session Active (`GET /auth/me`)
- **Accès** : Tout utilisateur connecté avec Bearer Token.
- **Réponse (200 OK)** : Profil complet avec rôle, permissions et localisation.

### 3.3 Sécurité Double Facteur (2FA - TOTP Google Authenticator)
1. **Générer le Secret & QR Code** : `POST /auth/2fa/generate`
   - Retourne l'URL du QR Code et le secret textuel.
2. **Activer le 2FA** : `POST /auth/2fa/enable` avec `{ "token": "123456" }`.
3. **Désactiver le 2FA** : `POST /auth/2fa/disable` avec `{ "token": "123456" }`.

### 3.4 Réinitialisation de Mot de Passe
- **Demande de réinitialisation** : `POST /auth/password-reset/request`
  ```json
  { "email": "admin@wugams.com" }
  ```
- **Confirmation du nouveau mot de passe** : `POST /auth/password-reset/confirm`
  ```json
  {
    "token": "token-recu-par-email",
    "new_password": "NouveauPassword123!"
  }
  ```

---

## 4. Matrice des Rôles & Permissions (RBAC)

Le système implémente un contrôle d'accès granulaire basé sur les rôles (`role_code`) :

| Rôle | Code API | Périmètre dans le Dashboard |
|---|---|---|
| **Super Administrateur / Gérant** | `ROLE_GERANT` | Accès absolu à tous les modules, configurations et filiales. |
| **Directeur des Opérations** | `ROLE_MGR_OPS` | Missions, chantiers, pointages, ouvriers, validation des rapports. |
| **Directeur de Filiale** | `ROLE_MGR_FILIALE` | Gestion complète restreinte à sa filiale d'affectation (`filiale_id`). |
| **Comptable** | `ROLE_COMPTABLE` | Devis, facturation, clôtures financières, primes mensuelles. |
| **Responsable Ouvriers** | `ROLE_RESP_OUVRIERS` | Planning ouvriers, affectations de missions, pointages terrain. |
| **Secrétaire / ADV** | `ROLE_SECRETAIRE` | Accueil clients, devis, bons de commande, messagerie. |
| **Développeur Digital / Marketing** | `ROLE_DEV_DIGITAL` | Vitrine CMS, blog, témoignages, réalisations, services. |
| **Ouvrier** | `ROLE_OUVRIER` | Pointage, consultation des missions assignées, envoi de rapports. |
| **Client** | `ROLE_CLIENT_MEMBRE` / `ROLE_CLIENT_STD` | Commandes, suivi devis/factures, fidélité (Espace Client). |

---

## 5. Répertoire Exhaustif des Endpoints par Module

### 5.1 Filiales & Gestion Multi-Sociétés

Pour afficher les données d'une filiale spécifique dans le dashboard, passez le paramètre de requête `?filiale_id=<uuid>` sur les routes correspondantes.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/filiales` | Tous authentifiés | Liste de toutes les filiales de la holding |
| `GET` | `/filiales/:id` | Tous authentifiés | Détail complet d'une filiale |
| `POST` | `/filiales` | `ROLE_GERANT` | Création d'une nouvelle filiale |
| `PATCH` | `/filiales/:id` | `ROLE_GERANT` | Mise à jour des coordonnées / paramètres d'une filiale |
| `GET` | `/filiales/consolidation` | `ROLE_GERANT`, `ROLE_COMPTABLE` | Synthèse financière consolidée du groupe |

---

### 5.2 Utilisateurs, Collaborateurs & Localisation

Le dashboard admin permet de créer, modifier et localiser n'importe quel collaborateur. Les coordonnées géographiques et l'adresse sont gérées dynamiquement.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/users` | `ROLE_GERANT`, `ROLE_MGR_FILIALE`, `ROLE_RESP_OUVRIERS` | Liste filtrable des utilisateurs (`?role=...&filiale_id=...`) |
| `GET` | `/users/:id` | `ROLE_GERANT`, `ROLE_MGR_FILIALE` | Détail d'un utilisateur |
| `POST` | `/users` | `ROLE_GERANT` | Création d'un collaborateur interne (manager, comptable, etc.) |
| `PATCH` | `/users/:id` | `ROLE_GERANT`, `ROLE_MGR_FILIALE` | Mise à jour profil, rôle, et géolocalisation |
| `GET` | `/managers` | `ROLE_GERANT` | Liste spécialisée des gestionnaires de filiales |

#### DTO de Mise à jour d'un Utilisateur avec Localisation (`PATCH /users/:id`) :
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+22997000000",
  "is_active": true,
  "localisation": "Cotonou, Quartier Haie Vive, Rue 340",
  "adresse": "12 Rue des Cocotiers",
  "ville": "Cotonou",
  "latitude": 6.3654,
  "longitude": 2.4183
}
```

---

### 5.3 Clients & CRM

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/clients` | Admin, Managers, Comptable, Secrétaire | Liste des clients (avec pagination et recherche) |
| `GET` | `/clients/:id` | Admin, Managers, Comptable, Secrétaire | Fiche complète du client, historique et solde fidélité |
| `POST` | `/clients` | Admin, Secrétaire, Managers | Création administrative d'un client |
| `PATCH` | `/clients/:id` | Admin, Secrétaire, Managers | Modification des informations client |
| `POST` | `/auth/register` | **Public** | Inscription autonome d'un client depuis le web ou mobile |

---

### 5.4 Fournisseurs & Achats

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/fournisseurs` | Admin, Managers, Comptable | Liste des partenaires fournisseurs avec note de performance |
| `GET` | `/fournisseurs/:id` | Admin, Managers, Comptable | Fiche fournisseur détaillée |
| `POST` | `/fournisseurs` | Admin, Mgr Partenaire | Création d'un nouveau fournisseur |
| `PATCH` | `/fournisseurs/:id` | Admin, Mgr Partenaire | Modification coordonnées et conditions |

---

### 5.5 Stocks, Produits & Alertes d'Inventaire

Gestion de l'inventaire en temps réel avec déclenchement automatique des alertes dès que `quantite_stock <= quantite_alerte`.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/stocks/produits` | Admin, Managers, Comptable, Secrétaire | Liste du catalogue produit (`?filiale_id=...`) |
| `GET` | `/stocks/produits/:id` | Admin, Managers, Comptable, Secrétaire | Fiche produit et seuil de stock |
| `POST` | `/stocks/produits` | Admin, Mgr Ops, Mgr Filiale | Création d'une référence produit |
| `PATCH` | `/stocks/produits/:id` | Admin, Mgr Ops, Mgr Filiale | Mise à jour prix, désignation, seuils |
| `GET` | `/stocks/alertes` | Admin, Managers, Comptable | Liste des produits sous le seuil d'alerte |
| `GET` | `/stocks/mouvements` | Admin, Managers, Comptable | Journal d'audit des entrées/sorties de stock |
| `POST` | `/stocks/mouvements` | Admin, Mgr Ops, Mgr Filiale | Enregistrement manuel d'un mouvement (Entrée/Sortie/Ajustement) |

---

### 5.6 Chantiers & Projets

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/chantiers` | Admin, Managers, Comptable | Liste des chantiers avec statut et budget |
| `GET` | `/chantiers/:id` | Admin, Managers, Comptable | Détail du chantier, photos et dépenses |
| `POST` | `/chantiers` | Admin, Mgr Ops, Mgr Filiale | Création d'un chantier |
| `PATCH` | `/chantiers/:id` | Admin, Mgr Ops, Mgr Filiale | Mise à jour des dates, budget ou statut |
| `DELETE` | `/chantiers/:id` | `ROLE_GERANT` | Suppression d'un chantier |

---

### 5.7 Missions de Service & Opérations Terrain

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/missions` | Admin, Managers, Resp Ouvriers | Liste de toutes les missions (`?filiale_id=...&statut=...`) |
| `GET` | `/missions/:id` | Admin, Managers, Resp Ouvriers, Ouvrier | Détail de la mission, client lié, ouvrier affecté |
| `POST` | `/missions` | Admin, Mgr Ops, Mgr Filiale | Création d'un ordre de mission |
| `POST` | `/missions/:id/affecter` | Admin, Mgr Ops, Resp Ouvriers | Affecter un ouvrier (accepte `ouvrier_id` ou `ouvrier_user_id`) |
| `PATCH` | `/missions/:id/statut` | Admin, Mgr Ops, Resp Ouvriers | Mettre à jour le statut (`PLANIFIE`, `EN_COURS`, `TERMINE`) |
| `GET` | `/missions/:id/rapport` | Admin, Mgr Ops, Resp Ouvriers | Consulter le rapport et photos soumis |
| `POST` | `/missions/photos` | Admin, Managers, Ouvriers | Lier une photo hébergée sur Supabase à la mission |

#### Affectation d'un Ouvrier (`POST /missions/:id/affecter`) :
```json
{
  "ouvrier_id": "uuid-de-l-ouvrier-ou-de-son-compte-utilisateur"
}
```

---

### 5.8 Pointages & Contrôle Géolocalisé (Rayon 50m)

L'API calcule automatiquement la distance en mètres entre les coordonnées GPS envoyées par l'ouvrier et l'adresse théorique de la mission. Si `distance > 50m`, le pointage est marqué `hors_rayon: true`.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/pointages` | Admin, Mgr Ops, Resp Ouvriers | Historique de tous les pointages avec filtres et alertes |
| `POST` | `/missions/pointages/arrivee` | `ROLE_OUVRIER` | Pointage d'arrivée géolocalisé |
| `POST` | `/missions/pointages/sortie` | `ROLE_OUVRIER` | Pointage de départ géolocalisé |
| `POST` | `/missions/:id/pointages/verification` | Admin, Mgr Ops, Resp Ouvriers | Contrôler et valider les pointages d'une mission |

---

### 5.9 Devis, Proformas & Conversion en Facture

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/devis` | Admin, Comptable, Managers, Secrétaire | Liste des devis avec filtres (`?statut=...&client_id=...`) |
| `GET` | `/devis/:id` | Admin, Comptable, Managers, Secrétaire | Consultation devis avec lignes détaillées |
| `POST` | `/devis` | Admin, Comptable, Secrétaire | Création d'un devis avec calcul automatique TTC |
| `PATCH` | `/devis/:id/statut` | Admin, Comptable, Secrétaire | Changer statut (`ENVOYE`, `SIGNE`, `REFUSE`, `EXPIRE`) |
| `POST` | `/devis/:id/convertir` | Admin, Comptable | **Conversion directe d'un devis signé en Facture** |
| `DELETE` | `/devis/:id` | `ROLE_GERANT` | Suppression d'un devis au statut brouillon |

---

### 5.10 Facturation, Recouvrement & Exports Comptables

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/factures` | Admin, Comptable, Managers | Liste des factures émanant des filiales |
| `GET` | `/factures/:id` | Admin, Comptable, Managers | Détail complet d'une facture |
| `POST` | `/factures` | Admin, Comptable | Émission d'une nouvelle facture |
| `GET` | `/factures/:id/export` | Admin, Comptable | Export / Génération du document de facture |
| `GET` | `/factures/consolidation` | `ROLE_GERANT`, `ROLE_COMPTABLE` | Synthèse globale de CA et créances par filiale |
| `GET` | `/factures/export/cloture` | `ROLE_GERANT`, `ROLE_COMPTABLE` | Export comptable pour les clôtures mensuelles/annuelles |

---

### 5.11 Commandes & Enregistrement des Règlements (Mobile Money / Espèces)

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/commandes` | Admin, Comptable, Secrétaire, Managers | Liste de toutes les commandes passées |
| `GET` | `/commandes/:id` | Admin, Comptable, Secrétaire, Managers | Détail de la commande et articles |
| `POST` | `/commandes` | Admin, Secrétaire, Client | Création d'un bon de commande |
| `POST` | `/commandes/:id/payer` | Admin, Comptable, Client | Initier un paiement (MTN MoMo, Moov Money, Espèces) |
| `POST` | `/commandes/:id/confirmer-paiement` | Admin, Comptable | Valider manuellement la réception des fonds et décrémenter le stock |

---

### 5.12 Primes Ouvriers (Calcul Mensuel BR-14)

Le moteur BR-14 calcule automatiquement les primes des ouvriers selon l'assiduité, les missions validées sans retard et les évaluations clients.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `POST` | `/primes/calculer` | `ROLE_GERANT`, `ROLE_COMPTABLE` | Déclencher le calcul automatique pour un mois (`{ "mois": "2026-09" }`) |
| `GET` | `/primes` | `ROLE_GERANT`, `ROLE_COMPTABLE` | Liste de toutes les primes calculées par ouvrier et par mois |
| `GET` | `/primes/mine` | `ROLE_OUVRIER` | Consultation de ses propres primes par l'ouvrier |

---

### 5.13 Programme de Fidélité Clients

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/fidelite` | Admin, Comptable, Secrétaire | Vue d'ensemble des comptes de fidélité clients |
| `GET` | `/fidelite/historique` | Admin, Comptable, Secrétaire | Journal des points crédités et débités |

---

### 5.14 Messagerie Instantanée Interne

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/messagerie/conversations` | Tous authentifiés | Liste des conversations actives de l'utilisateur connecté |
| `POST` | `/messagerie/conversations` | Tous authentifiés | Démarrer une conversation (`{ "participant_id": "...", "titre": "..." }`) |
| `GET` | `/messagerie/conversations/:id/messages` | Tous authentifiés | Historique des messages d'une conversation |
| `POST` | `/messagerie/conversations/:id/messages` | Tous authentifiés | Envoyer un message (`{ "contenu": "..." }`) |
| `PATCH` | `/messagerie/conversations/:id/lu` | Tous authentifiés | Marquer les messages comme lus |

---

### 5.15 Notifications & Flux Temps Réel (SSE)

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/notifications` | Tous authentifiés | Liste paginée des notifications reçues |
| `GET` | `/notifications/unread-count` | Tous authentifiés | **Nombre de notifications non lues (pour le badge de la cloche)** |
| `GET` | `/notifications/stream` | Tous authentifiés | **Flux Server-Sent Events (SSE)** : flux en direct avec heartbeat 30s |
| `PATCH` | `/notifications/:id/lu` | Tous authentifiés | Marquer une notification comme lue |
| `GET` | `/notifications-prefs` | Tous authentifiés | Préférences de réception (Push, Email, SMS, In-App) |
| `PATCH` | `/notifications-prefs` | Tous authentifiés | Mise à jour des canaux de notification souhaités |

---

### 5.16 Évaluations & Contrôle Qualité

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/evaluations` | Admin, Managers, Resp Ouvriers | Liste des notations et avis clients/superviseurs |
| `GET` | `/evaluations/:id` | Admin, Managers, Resp Ouvriers | Fiche détaillée d'une évaluation |
| `POST` | `/evaluations` | Admin, Managers, Clients | Soumettre une évaluation sur une mission achevée |

---

### 5.17 Piste d'Audit & Historique de Sécurité

Toutes les opérations sensibles (suppressions, modifications de statuts financiers, attributions de rôles) sont tracées de manière immuable.

| Méthode | Route | Rôles | Description |
|---|---|---|---|
| `GET` | `/audit-logs` | `ROLE_GERANT` | Journal d'audit complet (`?entity_type=...&action=...`) |

---

### 5.18 Gestion de la Vitrine Web & CMS

Permet aux administrateurs (`ROLE_GERANT` et `ROLE_DEV_DIGITAL`) de mettre à jour le site web institutionnel directement depuis le Dashboard.

| Méthode | Route | Rôles Admin | Description |
|---|---|---|---|
| `GET` / `POST` | `/vitrine/services` | GET: Public / POST: Admin | Gestion des services proposés sur le site |
| `PATCH` / `DELETE` | `/vitrine/services/:id` | Admin, Dev Digital | Modification ou retrait d'un service |
| `GET` / `POST` | `/vitrine/realisations` | GET: Public / POST: Admin | Réalisations / portfolio avant-après |
| `PATCH` / `DELETE` | `/vitrine/realisations/:id` | Admin, Dev Digital | Modification d'une réalisation et son URL image |
| `GET` / `POST` | `/vitrine/blog` | GET: Public / POST: Admin | Publication d'articles de blog |
| `PATCH` / `DELETE` | `/vitrine/blog/:id` | Admin, Dev Digital | Édition ou suppression d'un article |
| `GET` / `POST` | `/vitrine/temoignages` | GET: Public / POST: Admin | Modération et ajout de témoignages clients |
| `GET` / `POST` | `/vitrine/garanties` | GET: Public / POST: Admin | Cartes de réassurance et garanties affichées |
| `GET` / `POST` | `/vitrine/marquee` | GET: Public / POST: Admin | Textes déroulants animés du bandeau d'accueil |
| `GET` | `/vitrine/permissions` | Tous authentifiés | Permet au Dashboard de savoir si l'utilisateur peut éditer la vitrine |

---

## 6. Guide de Dépannage & Codes d'Erreur

L'API répond avec des structures d'erreur unifiées standardisées :

```json
{
  "statusCode": 400,
  "message": "At least one photo is required before submitting (BR-06)",
  "error": "Bad Request",
  "timestamp": "2026-09-10T20:30:00.000Z",
  "path": "/api/v1/missions/uuid/statut"
}
```

### Principaux Codes HTTP :
- **`200 OK`** : Opération de lecture ou modification réussie.
- **`201 Created`** : Nouvelle ressource créée avec succès (Mission, Chantier, Devis, Utilisateur).
- **`400 Bad Request`** : Données invalides envoyées dans le DTO ou règle métier non respectée (ex: validation de mission sans photo).
- **`401 Unauthorized`** : Token JWT manquant, expiré ou invalide.
- **`403 Forbidden`** : Le rôle de l'utilisateur ne l'autorise pas à exécuter cette action.
- **`404 Not Found`** : Ressource ou ID introuvable en base.
- **`409 Conflict`** : Doublon de clé unique (ex: email utilisateur déjà existant).
- **`500 Internal Server Error`** : Erreur serveur inattendue (à signaler avec l'horodatage).
