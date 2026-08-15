# SPECIFICATION BACK-END — API WUGAMS ERP (v2)

Document à destination du développeur back-end. Il décrit **exactement ce que le front-end
(WUGAMS Front ERP, Next.js) attend de l'API NestJS** : contrats de requêtes/réponses, règles
métier, RBAC et comportements.

> Le front consomme l'API **uniquement à travers les contrats ci-dessous**. Tout écart
> (nom de champ, format de date, shape de réponse) casse silencieusement l'UI (le front retombe
> alors en « mode démonstration »). La conformité exacte est la priorité n°1.

---

## 0. Changelog v2 — ce qui a changé

> Résumé des évolutions par rapport à la v1. Les sections concernées détaillent les contrats.

| # | Changement | Section |
|---|---|---|
| 1 | **Échelle d'évaluation actée : `s1..s9` sur 40 (max 360), `note_texte` sur 50** — plus d'ambiguïté, le back stocke et renvoie en base 40 | §4.8 |
| 2 | **`EN_RETARD` calculé automatiquement** (cron quotidien + calcul au GET) + champ `date_paiement` sur la facture | §4.7 |
| 3 | **Workflow de vérification des pointages** : `POST /missions/:id/pointages/verification`, `validateur_id` renseigné par le validateur | §4.6 |
| 4 | **`GET /stocks/alertes`** : alertes de seuil calculées côté serveur (règle 20 % actée) | §4.5 |
| 5 | **`POST /auth/password-reset`** (demande + confirmation) et **`POST /auth/2fa/disable`** | §2.4, §2.5 |
| 6 | **Notifications temps réel** : `GET /notifications/stream` (SSE) | §4.9 |
| 7 | **Entité Devis complète** (remplace le piggyback sur les factures) + **conversion devis → facture** | §4.14 |
| 8 | **Auto-affectation des missions** par rendement 9S (BR-14) : `POST /missions/:id/affecter` | §4.6 |
| 9 | **Primes mensuelles** : `GET /primes?mois=` | §4.13 |
| 10 | **Entité Chantier** (suivi travaux + financier) | §4.15 |
| 11 | **Commandes boutique + paiement Mobile Money** (MTN MoMo / Moov Money, BR-13) | §4.16 |
| 12 | **Messagerie interne** (conversations, messages) | §4.17 |
| 13 | **Programme membres** : points de fidélité, avantages `ROLE_CLIENT_MEMBRE` | §4.18 |
| 14 | **Notifications SMS/WhatsApp** (préférences utilisateur + envoi) | §4.19 |

**Décisions à confirmer avant développement** :
- Provider SMS/WhatsApp : API réelle (Twilio, Africastalking, Orange SMS…) ou stub configurable
  (`NOTIFICATIONS_PROVIDER=demo`) ? La v2 spécifie une interface, pas un fournisseur.
- Montants : le front n'envoie que HT/TTC saisis ; le calcul de la TVA (18 %, Côte d'Ivoire)
  reste une évolution facultative côté back.

---

## 1. Contexte

| Élément | Valeur |
|---|---|
| Plateforme | WUGAMS — ERP multi-filiales (construction, rénovation, entretien, matériaux) |
| Back-end | NestJS (actuel) — instance déployée : `https://wugames-holding-inc.vercel.app` |
| Préfixe API | `/api/v1` |
| Base d'URL pour le front | `NEXT_PUBLIC_API_URL=/api/v1` (proxy Next.js same-origin) |
| Transport | JSON (`Content-Type: application/json`, `Accept: application/json`) |
| Front | Next.js 16 + React 19 — `app/lib/api-client.ts` est le seul client HTTP |

### 1.1 CORS

Le back-end n'envoie **pas** d'en-têtes CORS ; le front les contourne via un proxy
(`next.config.ts`). **Recommandé côté back** : activer CORS pour l'origine du front
(ex. `http://localhost:3000` et le domaine de prod) pour permettre les appels directs
(mobile, tests, tooling) — non bloquant pour le front actuel.

### 1.2 Format d'erreur (standard NestJS — obligatoire)

Le client front parse le corps JSON d'erreur et affiche `message` tel quel :

```json
{ "statusCode": 400, "message": "string ou string[]", "error": "Bad Request", "timestamp": "..." }
```

- `message` peut être un tableau (validations) ; le front le joint avec ` · `.
- Le front lève `ApiError` avec `statusCode`. Il traite spécialement le `401` (refresh
  automatique) et le `400` (affichage).

### 1.3 Conventions de nommage

- **Champs de réponse en `snake_case`** : `created_at`, `filiale_id`, `montant_ttc`… (voir
  les contrats ci-dessous). Ne pas utiliser `camelCase` dans les réponses.
- Dates : **ISO 8601** (`2026-08-11T10:30:00.000Z`).
- Montants : nombres (le front formate en FCFA côté UI).
- Pagination : le front appelle sans pagination explicite (les listes sont des tableaux
  bruts). Si un endpoint pagine, la forme attendue est `{ data: [], meta: { page, pageSize, total } }`
  — mais le front lit directement `T[]` pour la plupart des listes.

### 1.4 Endpoints synchrones vs asynchrones

- Tous les endpoints de cette spec sont **synchrones** (réponse complète dans le corps HTTP).
- Le seul canal asynchrone est **SSE** pour les notifications (§4.9). Pas de WebSocket.
- Les envois SMS/WhatsApp (§4.19) sont **asynchrones côté back** : l'endpoint confirme la
  réception et l'envoi part en tâche de fond (ne pas bloquer la réponse HTTP).

---

## 2. Authentification & comptes

Flux complet : login → (2FA si requis) → sessions → refresh → logout → inscription (rôles)
→ **mot de passe oublié** → **désactivation 2FA**.

### 2.1 Endpoints

#### `POST /auth/login` — publique
```json
// Requête
{ "email": "admin@wugams.com", "password": "admin1234" }
```
Deux réponses possibles :

```json
// Cas 1 : succès complet
{
  "access_token": "jwt...",
  "refresh_token": "opaque...",
  "expires_in": "7d",
  "user": {
    "id": "uuid",
    "email": "admin@wugams.com",
    "role": "ROLE_GERANT",
    "filiale_id": "uuid | null",
    "two_factor_enabled": false,
    "profile_id": "uuid | null"
  }
}
```

```json
// Cas 2 : 2FA exigée pour ce compte
{ "requires_2fa": true, "user_id": "uuid" }
```

> `expires_in` : chaîne ou nombre. Formats acceptés par le front : `"7d"`, `"1h"`, `"900"`,
> `"3600"` (unité : `s` défaut, `m`, `h`, `d`).

#### `POST /auth/2fa/verify` — publique
```json
// Requête
{ "user_id": "uuid", "token": "123456" }
```
Réponse : **mêmes tokens que le cas 1 du login** (`access_token`, `refresh_token`,
`expires_in`, `user`).

#### `POST /auth/refresh` — publique
```json
// Requête
{ "refresh_token": "opaque..." }
```
```json
// Réponse
{ "access_token": "jwt...", "refresh_token": "opaque... (optionnel)", "expires_in": "7d" }
```
Le refresh token peut être tournant (le front garde l'ancien si absent). Échec → `401`.

#### `POST /auth/me` — **auth requise, méthode POST (pas GET)**
Renvoie le payload JWT décodé :
```json
{
  "sub": "uuid",
  "email": "admin@wugams.com",
  "role": "ROLE_GERANT",
  "filiale_id": "uuid | null",
  "two_factor_enabled": false,
  "two_factor_verified": true,
  "profile_id": "uuid | null",
  "iat": 1750000000,
  "exp": 1750604800
}
```
⚠️ `two_factor_verified` est lu par le panel sécurité : vrai quand l'utilisateur a été
authentifié via 2FA dans la session courante.

#### `POST /auth/logout` — auth requise
Révoque le refresh token (best-effort). Réponse : `{ "message": "string" }`.

#### `POST /auth/register` — **auth requise + rôle Gérant uniquement** (l'inscription libre est désactivée volontairement)
```json
// Requête
{
  "email": "user@wugams.com",
  "password": "motdepasse",
  "first_name": "Prénom",
  "last_name": "Nom",
  "phone": "+2250700000000 (optionnel)",
  "role": "ROLE_OUVRIER",
  "filiale_id": "uuid | null (optionnel)"
}
```
Réponse : `AuthUserDto` (shape `user` du login).

#### `POST /auth/2fa/setup` — auth requise
Renvoie les secrets TOTP pour afficher un QR code :
```json
{ "secret": "BASE32...", "qr_code": "otpauth://totp/... (URL ou data-URI)" }
```

#### `POST /auth/2fa/enable` — auth requise
```json
// Requête
{ "token": "123456" }
```
Valide le token TOTP et active la 2FA. Réponse : `{ "message": "string" }`.

### 2.2 [NOUVEAU] `POST /auth/password-reset` — deux étapes

**Étape 1 — demander la réinitialisation** (publique, pas de révélation de compte) :
```json
// Requête
{ "email": "user@wugams.com" }
```
Réponse : `{ "message": "string" }` (toujours `200`, que l'email existe ou non — anti-énumération).
Le back génère un token à usage unique (TTL 1 h) et l'expédie **par email** (ou via le provider
§4.19). Un token déjà consommé est invalidé (jeton à stocker hashé).

**Étape 2 — confirmer avec le token** (publique) — endpoint distinct `POST /auth/password-reset/confirm` :
```json
// Requête
{ "token": "uuid", "new_password": "NouveauMotDePasse123!" }
```
Réponse : `{ "message": "string" }`. Token invalide/expiré → `400`. Après succès, tous les
refresh tokens de l'utilisateur sont révoqués.

> Le front affichera un lien « Mot de passe oublié » sur `/connexion` (à venir côté UI).

### 2.3 [NOUVEAU] `POST /auth/2fa/disable` — auth requise
```json
// Requête
{ "token": "123456" }
```
Désactive la 2FA après vérification du TOTP courant. Réponse : `{ "message": "string" }`.
(Le front l'exposera dans le panneau sécurité du profil.)

### 2.4 Rôles (codes exacts — source de vérité)

```
ROLE_CLIENT_STD | ROLE_CLIENT_MEMBRE | ROLE_OUVRIER | ROLE_RESP_OUVRIERS
ROLE_FOURNISSEUR | ROLE_SECRETAIRE | ROLE_COMPTABLE | ROLE_MGR_OPS
ROLE_MGR_PARTENAIRE | ROLE_MGR_FILIALE | ROLE_DEV_DIGITAL | ROLE_GERANT
```

### 2.5 Comptes de test à maintenir

| Rôle | Email | Mot de passe |
|---|---|---|
| Gérant (accès complet + administration) | `admin@wugams.com` | `admin1234` |
| Client membre | `client.https@test.wugams` | `Test1234!` |
| Ouvrier | `ouvrier.https@test.wugams` | `Test1234!` |
| **Secrétaire (nouveau)** | `secretaire@test.wugams` | `Test1234!` |
| **Manager Opérations (nouveau)** | `manager.ops@test.wugams` | `Test1234!` |
| **Resp. ouvriers (nouveau)** | `resp.ouvriers@test.wugams` | `Test1234!` |

> Les 3 nouveaux comptes alimentent les boutons « un clic » de la page `/connexion` et les
> command centers par rôle du front.

---

## 2.6 Constat de déploiement — smoke tests live (2026-08-15)

> Testés contre `https://wugames-holding-inc.vercel.app` (base `/api/v1`), compte gérant
> `admin@wugams.com` + compte client créé via `POST /clients`. Les écarts ci-dessous sont
> **des bugs du backend déployé** ; le front s'appuie sur son fallback silencieux « Mode
> démonstration » pour absorber les 500.

### Recheck (2026-08-15 après-midi) — la quasi-totalité est corrigée ✅

| Endpoint | Avant | Après |
|---|---|---|
| `GET /missions`, `/chantiers`, `/commandes`, `/devis`, `/factures`, `/pointages`, `/primes`, `/notifications`, `/messagerie/conversations`, `/notifications-prefs` | 500 | **OK** (20 missions, 3 devis, 3 chantiers, 3 commandes, 4 pointages…) |
| `POST /devis` | 400/500 | **OK** — `statut` initial `BROUILLON`, TVA appliquée (`montant_ttc` calculé) |
| `PATCH /devis/{id}/statut` (`ENVOYE`, `SIGNE`) + `POST /devis/{id}/convertir` | — | **OK** — conversion → crée la facture liée (`devis_id` renseigné) |
| `POST /commandes` | 500 | **OK** — `statut` initial **`EN_ATTENTE`** (⚠️ nouveau statut, le front l'a ajouté) ; sans `prix_unitaire`, le prix catalogue est utilisé |
| `PATCH /commandes/{id}/statut` (`EN_PREPARATION` → `EXPEDIEE` → `LIVREE`) | — | **OK** — `livraison.date_livree` renseignée à `LIVREE` |
| `POST /commandes/{id}/payer` | — | **OK** — réponse `{reference, mode, telephone, montant, instruction, commande}` |
| `POST /commandes/{id}/confirmer-paiement` | — | **OK** — paiement `PAYE`, commande → `EXPEDIEE` automatiquement |
| `POST /factures` + `PATCH /factures/{id}/statut` (`EMISE`, `PAYEE`) | 500 | **OK** — initial `BROUILLON` ; `date_paiement` renseignée à `PAYEE` |
| `PATCH /notifications-prefs` | 500 | **OK** |
| `POST /auth/password-reset/confirm` (token invalide) | 500 | **OK — 400** ✅ |
| `GET /client-space/{profil,demandes,devis,commandes,missions,projets,documents,fidelite}` | 500/404 | **OK** — fidelite initiale : `BRONZE`, 0 pt |
| `POST /client-space/demandes` | 400 | **OK** — forme `{ libelle, service }` (statut `RECUE`) ; `{type, description}` → 400 (forme invalide) |
| `GET /missions/{id}/rapport` | — | **OK** — structure complète (pointages, photos, validateur, durée, distance) |
| `PATCH /missions/{id}/statut` | — | **OK** |

### Recheck final (2026-08-15 après-midi) — tout est corrigé ✅

| Point | Avant | Après |
|---|---|---|
| **`POST /auth/register` (inscription libre)** | 401 sans token | **OK — public** : 201, `{message, access_token, refresh_token, user}`, rôle `ROLE_CLIENT_STD` + `client_profile` créés, auto-login, login + client-space fonctionnels. Le formulaire `/inscription` du front est branché dessus |
| `POST /missions/{id}/affecter` | 500 | **OK** — 200 `{mission, suggestions}` (le 404 ponctuel venait d'un ouvrier supprimé du seed) |
| `POST /clients` exposait `password_hash` | ⚠️ | **OK** — retiré de la réponse |
| `POST /missions/{id}/pointages/verification` | 400 | **OK** — 200 même sans pointages |
| DTO de l'OpenAPI | vides `{}` | **OK** — 44 schémas documentés (`RegisterDto`, `CreateMissionDto`, `CreateFactureDto`, `CreateCommandeDto`, `CreateLigneDevisDto`, `UpdateNotificationPrefsDto`, `CreateDemandeDevisDto`…) avec `required` corrects |
| URL de la spec | `/api/v1/docs-json` | **⚠️ déplacée** : `https://wugames-holding-inc.vercel.app/docs-json` (racine) ; chemins préfixés `/api/v1/…` |

Il ne reste **aucun bug fonctionnel connu** du backend. Points d'attention conservés : RBAC normaux
(`GET /fidelite` réservé clients via `/client-space/fidelite`, `GET /stocks/produits` 403 en client →
catalogue boutique en démo) ; `RegisterPayload.role` et `filiale_id` optionnels (le back attribue une
filiale par défaut).

### Historique (premier passage, avant correction)

### Fonctionnels

| Endpoint | Note |
|---|---|
| `POST /auth/login`, `POST /auth/me`, `POST /auth/logout` | OK (JWT : `sub`, `email`, `role`, `filiale_id`, `two_factor_enabled`, `profile_id`) |
| `GET/POST /clients`, `/fournisseurs`, `/filiales`, `/users`, `/managers`, `/evaluations` | OK |
| `GET /stocks/produits`, `GET /stocks/alertes`, `POST /stocks/mouvements`, `POST /stocks/produits` | OK |
| `GET /audit-logs` | OK — query **required** : `table_cible`, `entite_id` |
| `POST /missions` | OK — **ne pas envoyer `statut`** (défaut `PLANIFIE`) ; `client_id`, `date_planifiee` acceptés |
| `POST /users` | OK — `{ email, password, first_name, last_name, role, filiale_id }` |
| `POST /clients` | OK — forme **plate** : `{ email, password, first_name, last_name }` (+ `telephone`, `adresse` optionnels). Crée `ROLE_CLIENT_STD` + `client_profile`. ⚠️ renvoie `password_hash` dans la réponse |
| `GET /client-space/profil`, `GET /client-space/missions` | OK (missions : 0 élément pour un client sans mission) |
| `POST /auth/password-reset/confirm` | Endpoint présent, mais token invalide → **500** (un 400 serait propre) |

### En échec — HTTP 500 (bug backend, DTO/params pourtant corrects)

`GET /missions`, `GET /chantiers`, `GET /commandes`, `GET /devis`, `GET /factures`,
`GET /primes`, `GET /pointages`, `GET /notifications`, `GET /messagerie/conversations`,
`GET /notifications-prefs`, `POST /devis`, `POST /commandes`, `POST /factures`,
`PATCH /notifications-prefs`, `GET /fidelite`, `GET /fidelite/historique`,
`GET /client-space/{demandes,devis,commandes,projets,documents,fidelite}`,
`POST /client-space/demandes` (400 — DTO non documenté, 3 formes testées).

### RBAC vérifié en live

- Client (std/membre) : `GET /stocks/produits` → **403** (catalogue boutique non visible côté
  stock ; le front utilise la démo pour le catalogue et le fallback pour la commande).
- `GET /client-space/factures` → **403** pour `ROLE_CLIENT_STD` (réservé membre).
- Secrétaire (filiale liée) : `GET /missions`, `/chantiers`, `/primes`, `/pointages` → **403**
  (réservés gérant/dev digital) ; `GET /commandes`, `/devis`, `/factures` → 500 (même bug que gérant).

### DTO réels (spécifiés dans `/docs-json`)

- `CreateLigneDevisDto` : `designation`, `quantite`, `prix_unitaire_ht` (**tous required** — pas `prix_unitaire`).
- `CreateLigneCommandeDto` : `produit_id`, `quantite` (required), `prix_unitaire` (optionnel).
- `CreateDevisDto` / `CreateCommandeDto` : `filiale_id` + `lignes` required.
- `UpdateNotificationPrefsDto` : `{ canaux: object, types: object, telephone: string }` (endpoint `/notifications-prefs`).

### Comptes créés par les smoke tests (à nettoyer au prochain reset)

`client.smoke.1786792986@wugams.com` (CLIENT_MEMBRE, sans profile), `d.smoke.1786793027@wugams.com`
(CLIENT_STD, avec profile), `secretaire.smoke.1786792705@wugams.com` (SECRETAIRE, filiale MAT),
missions « Test smoke mission * », commande créée si le 500 est corrigé. Mot de passe commun : `SmokeTest123!`.

---

## 3. RBAC & cloisonnement

- **Le back est la source de vérité du RBAC et du cloisonnement par `filiale_id`.** Le front
  n'affiche que des actions autorisées, mais **chaque endpoint doit vérifier rôle + périmètre
  côté serveur**.
- `GET /users`, `GET /audit-logs`, l'administration et **`GET /primes` (paramétrage)** sont
  réservés à `ROLE_GERANT` et `ROLE_DEV_DIGITAL`.
- Les managers (`ROLE_MGR_OPS`, `ROLE_MGR_PARTENAIRE`, `ROLE_MGR_FILIALE`, `ROLE_RESP_OUVRIERS`)
  ne voient que **leur filiale et leurs équipes** : toute requête doit être restreinte au
  `filiale_id` du JWT.
- Les clients (`ROLE_CLIENT_STD`, `ROLE_CLIENT_MEMBRE`) n'accèdent qu'à `/client-space/*` et
  à leurs propres données. Le membre a en plus la fidélité (§4.18) et la boutique (§4.16).
- Les `ROLE_OUVRIER` accèdent à leurs missions, pointages, évaluations et **leur prime**.
- Les `ROLE_FOURNISSEUR` accèdent aux modules fournisseurs (produits de leur catalogue).
- **Vérification des pointages** : `ROLE_MGR_OPS`, `ROLE_MGR_FILIALE`, `ROLE_RESP_OUVRIERS`
  (et Gérant/Dev Digital) uniquement.
- **Conversion devis → facture** : Gérant, Comptable, Secrétaire.
- **Paiement boutique** : l'utilisateur connecté ne paie que ses propres commandes.

---

## 4. Ressources — contrats détaillés

> Toutes les routes ci-dessous sont **auth requise** (Bearer JWT) sauf mention contraire.

### 4.1 Utilisateurs — `/users`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/users` | `User[]` |
| GET | `/users/:id` | `User` |
| POST | `/users` | `User` |
| PATCH | `/users/:id` | `User` |
| DELETE | `/users/:id` | `{ "message": "string" }` |

`User` (réponse — le front lit **tous** ces champs) :

```json
{
  "id": "uuid",
  "email": "user@wugams.com",
  "first_name": "Prénom",
  "last_name": "Nom",
  "phone": "string | null",
  "role": "ROLE_...",
  "filiale_id": "uuid | null",
  "is_active": true,
  "two_factor_enabled": false,
  "created_at": "ISO",
  "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "Construction", "code": "CONS" } | null,
  "ouvrier_profile": { "id": "uuid", "specialite": "string | null", "matricule": "string | null" } | null,
  "fournisseur_profile": { "id": "uuid", "raison_sociale": "string | null" } | null,
  "client_profile": { "id": "uuid", "type_client": "MEMBRE | STANDARD | null" } | null
}
```

POST `/users` (payload) :
```json
{ "email": "string", "password": "string", "first_name": "string", "last_name": "string",
  "phone": "string (opt)", "role": "ROLE_...", "filiale_id": "uuid | null (opt)", "is_active": true (opt) }
```
PATCH : même objet partiel, `password` optionnel (réinitialisation). Le front utilise aussi
`GET /users` pour lister les ouvriers (filtre par rôle côté UI).

### 4.2 Clients — `/clients`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/clients` | `ClientProfile[]` (avec `user` embarqué) |
| GET | `/clients/:id` | `ClientProfile` |
| POST | `/clients` | `{ user, client_profile }` |
| PATCH | `/clients/:id` | `ClientProfile` |
| DELETE | `/clients/:id` | `{ "message": "string" }` |

`ClientProfile` :
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "adresse": "string | null",
  "type_client": "MEMBRE | STANDARD | null",
  "created_at": "ISO",
  "updated_at": "ISO",
  "user": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string", "phone": "string | null", "is_active": true }
}
```

POST `/clients` (créé **user + profil en une opération**) :
```json
{ "email": "string", "password": "string", "first_name": "string", "last_name": "string",
  "phone": "string (opt)", "adresse": "string (opt)", "type_client": "MEMBRE | STANDARD (défaut STANDARD)" }
```
PATCH : partiel, sans `password`.

### 4.3 Fournisseurs — `/fournisseurs`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/fournisseurs` | `FournisseurProfile[]` |
| GET | `/fournisseurs/:id` | `FournisseurProfile` |
| POST | `/fournisseurs` | `{ user, fournisseur_profile }` |
| PATCH | `/fournisseurs/:id` | `FournisseurProfile` |
| DELETE | `/fournisseurs/:id` | `{ "message": "string" }` |

`FournisseurProfile` :
```json
{
  "id": "uuid", "user_id": "uuid", "raison_sociale": "string | null", "siret": "string | null",
  "adresse": "string | null", "created_at": "ISO", "updated_at": "ISO",
  "user": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string", "phone": "string | null", "is_active": true }
}
```

POST `/fournisseurs` :
```json
{ "email": "string", "password": "string", "first_name": "string", "last_name": "string",
  "phone": "string (opt)", "raison_sociale": "string", "siret": "string (opt)", "adresse": "string (opt)" }
```

### 4.4 Filiales — `/filiales`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/filiales` | `Filiale[]` |
| GET | `/filiales/:id` | `Filiale` |
| POST | `/filiales` | `Filiale` |
| PATCH | `/filiales/:id` | `Filiale` |
| DELETE | `/filiales/:id` | `{ "message": "string" }` |
| GET | `/filiales/consolidation` | `FilialeConsolidation` |

⚠️ **Ordre des routes NestJS** : `/filiales/consolidation` doit être déclarée **avant**
`/filiales/:id`, sinon elle sera capturée par le paramètre.

`Filiale` :
```json
{ "id": "uuid", "nom": "Construction", "code": "CONS", "description": "string | null",
  "is_active": true, "created_at": "ISO", "updated_at": "ISO" }
```

`FilialeConsolidation` (dashboard exécutif) :
```json
{
  "filiales": [
    { "id": "uuid", "nom": "string", "code": "string",
      "_count": { "users": 12, "produits": 40, "missions": 18, "factures": 25, "commandes": 9 } }
  ],
  "summary": { "total_filiales": 3, "total_users": 45, "total_produits": 120,
               "total_missions": 52, "total_factures": 71, "total_commandes": 23 }
}
```

### 4.5 Stocks — `/stocks`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/stocks/produits?filiale_id=&statut=&fournisseur_id=` | `Produit[]` |
| GET | `/stocks/produits/:id` | `Produit` |
| POST | `/stocks/produits` | `Produit` |
| PATCH | `/stocks/produits/:id` | `Produit` |
| DELETE | `/stocks/produits/:id` | `{ "message": "string" }` |
| POST | `/stocks/mouvements` | `MouvementStock` |
| POST | `/stocks/produits/:id/commander` | `Produit` (statut → `COMMANDE_EN_COURS`) |
| POST | `/stocks/produits/:id/reception` | `Produit` (stock incrémenté, statut recalculé) |
| **GET (nouveau)** | `/stocks/alertes` | `StockAlerte[]` |

`Produit` :
```json
{
  "id": "uuid", "nom": "Ciment 35 kg", "description": "string | null", "reference": "CIM-001",
  "prix_unitaire": 6250, "quantite_actuelle": 100, "stock_minimum": 10,
  "statut": "DISPONIBLE | REAPPROVISIONNEMENT_REQUIS | COMMANDE_EN_COURS | RUPTURE | ARCHIVE",
  "adresse_reference_lat": 5.32 | null, "adresse_reference_lng": -4.01 | null,
  "filiale_id": "uuid", "fournisseur_id": "uuid | null",
  "created_at": "ISO", "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "fournisseur": { "id": "uuid", "raison_sociale": "string | null" } | null,
  "mouvements": [ "MouvementStock[] (optionnel)" ]
}
```

`MouvementStock` :
```json
{ "id": "uuid", "produit_id": "uuid", "type": "ENTREE | SORTIE_VENTE | SORTIE_CHANTIER | AJUSTEMENT",
  "quantite": 25, "motif": "string", "reference_externe": "string | null", "created_at": "ISO" }
```

**[NOUVEAU] `StockAlerte` (GET `/stocks/alertes`)** — alertes calculées serveur, consommées par
le dashboard et le portail fournisseur :
```json
{
  "produit_id": "uuid",
  "reference": "CIM-001",
  "nom": "Ciment 35 kg",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "quantite_actuelle": 8,
  "stock_minimum": 10,
  "seuil_alerte_20pct": 2,
  "niveau": "RUPTURE | SOUS_SEUIL | SOUS_20PCT",
  "statut": "RUPTURE | REAPPROVISIONNEMENT_REQUIS | COMMANDE_EN_COURS",
  "fournisseur_id": "uuid | null"
}
```
Règle de niveau : `quantite = 0` → `RUPTURE` ; `0 < q < stock_minimum` → `SOUS_SEUIL` ;
`q < stock_minimum × 0,2` → `SOUS_20PCT` (les deux derniers peuvent coexister ; le back renvoie
le plus critique). Filtres : `?filiale_id=&niveau=`.

POST `/stocks/produits` :
```json
{ "nom": "string", "reference": "string", "description": "string (opt)", "prix_unitaire": 6250,
  "quantite_actuelle": 100 (opt), "stock_minimum": 10 (opt), "filiale_id": "uuid", "fournisseur_id": "uuid | null" }
```
PATCH : partiel (`nom`, `reference`, `description`, `prix_unitaire`, `stock_minimum`, `fournisseur_id`).
POST `/stocks/mouvements` : `{ "produit_id": "uuid", "type": "...", "quantite": 25, "motif": "string", "reference_externe": "string (opt)" }`.

**Règle métier statut** (à appliquer serveur après chaque mutation) :
`quantite_actuelle = 0` → `RUPTURE` ; `0 < q < stock_minimum` → `REAPPROVISIONNEMENT_REQUIS` ;
`q >= stock_minimum` → `DISPONIBLE`. `COMMANDE_EN_COURS` posé par `/commander`,
`ARCHIVE` manuel. **Notif automatique** : dès qu'un produit passe sous le seuil (ou sous 20 %),
le back crée une notification (type `alerte_stock`, §4.9) pour les rôles stock et le fournisseur
attitré.

### 4.6 Missions & pointages — `/missions`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/missions` | `Mission[]` |
| GET | `/missions/:id` | `Mission` |
| POST | `/missions` | `Mission` |
| PATCH | `/missions/:id/statut` | `Mission` |
| **POST (nouveau)** | `/missions/:id/affecter` | `Mission` (ouvrier auto-proposé) |
| **GET (nouveau)** | `/missions/:id/rapport` | `MissionRapport` |
| POST | `/missions/pointages/arrivee` | `Pointage` |
| POST | `/missions/pointages/sortie` | `Pointage` |
| **POST (nouveau)** | `/missions/:id/pointages/verification` | `Pointage` ou `Mission` |
| POST | `/missions/photos` | `{ "message": "string" }` (ou entité photo) |

`Mission` :
```json
{
  "id": "uuid", "titre": "Nettoyage Chantier A", "description": "string | null",
  "statut": "PLANIFIE | NOTIFIE | ACCEPTE | EN_COURS | RAPPORT_SOUMIS | VALIDE | TERMINE | POINTAGE_A_VERIFIER",
  "filiale_id": "uuid", "client_id": "uuid | null", "ouvrier_id": "uuid | null",
  "rapport_texte": "string | null",
  "date_planifiee": "ISO | null",
  "adresse_lat": 5.32 | null, "adresse_lng": -4.01 | null, "rayon_tolerance_metres": 50,
  "validateur_id": "uuid | null",
  "created_at": "ISO", "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "ouvrier": { "id": "uuid", "user": { "first_name": "string", "last_name": "string" } } | null,
  "client": { "id": "uuid", "type_client": "string | null" } | null,
  "pointages": [ "Pointage[] (optionnel)" ],
  "photos": [ { "id": "uuid", "mission_id": "uuid", "storage_url": "string", "uploaded_at": "ISO" } ]
}
```

POST `/missions` :
```json
{ "titre": "string", "description": "string (opt)", "filiale_id": "uuid", "client_id": "uuid | null",
  "ouvrier_id": "uuid | null", "date_planifiee": "ISO (opt)", "adresse_lat": 5.32 (opt),
  "adresse_lng": -4.01 (opt), "rayon_tolerance_metres": 50 (opt) }
```

PATCH `/missions/:id/statut` :
```json
{ "statut": "EN_COURS", "rapport_texte": "string (envoyé avec RAPPORT_SOUMIS)" }
```
**Transitions autorisées (validation serveur, sinon `400`)** :
`PLANIFIE → NOTIFIE → ACCEPTE → EN_COURS → RAPPORT_SOUMIS → VALIDE → TERMINE`, plus
`EN_COURS → POINTAGE_A_VERIFIER` (anomalie de pointage) et `POINTAGE_A_VERIFIER → EN_COURS |
RAPPORT_SOUMIS | VALIDE`. `rapport_texte` **obligatoire** pour `RAPPORT_SOUMIS`. Seul le validateur
(§3) peut poser `VALIDE` (renseigne alors `validateur_id`).

**[NOUVEAU] POST `/missions/:id/affecter` — auto-affectation par rendement 9S (BR-14)**
```json
// Requête — ouvrier_id optionnel
{ "ouvrier_id": "uuid (optionnel, contourne la proposition)" }
```
Sans `ouvrier_id`, le back renvoie la mission avec `ouvrier_id` rempli par le meilleur candidat :
```json
{
  "mission": "Mission (avec ouvrier_id)",
  "suggestions": [
    { "ouvrier_id": "uuid", "nom": "Kouamé Firmin", "specialite": "Peinture",
      "rendement_global": 92.1, "missions_terminees_30j": 12, "deja_affecte_aujourdhui": false }
  ]
}
```
Algorithme : ouvriers de la filiale avec profil `ouvrier_profile`, triés par `rendement_global`
décroissant (section §4.8), excluant ceux déjà en mission `EN_COURS`/`ACCEPTE`/`NOTIFIE` le même
jour. Retourne les 3 premiers. Puis `PATCH /missions/:id/statut { "statut": "NOTIFIE" }` notifie
l'ouvrier (§4.19).

**[NOUVEAU] GET `/missions/:id/rapport`** — vue rapport prête à imprimer/archiver :
```json
{
  "mission": "Mission",
  "rapport_texte": "string | null",
  "photos": [ "MissionPhoto[]" ],
  "pointages": [ "Pointage[]" ],
  "ouvrier": { "id": "uuid", "nom": "string", "matricule": "string | null" } | null,
  "validateur": { "id": "uuid", "nom": "string" } | null,
  "duree_totale_minutes": 420 | null,
  "distance_totale_m": 1850 | null
}
```
`duree_totale_minutes` = écart premier pointage arrivée → dernier pointage sortie ;
`distance_totale_m` = distance cumulée entre pointages successifs (haversine).

**[NOUVEAU] POST `/missions/:id/pointages/verification` — workflow de vérification**
```json
// Requête
{ "statut": "VALIDE | REJETE", "motif": "string (requis si REJETE)" }
```
- `VALIDE` : les pointages de la mission sont marqués vérifiés, `validateur_id` = utilisateur
  connecté, mission → `VALIDE` (si rapport soumis) ou `EN_COURS`.
- `REJETE` : mission → `EN_COURS`, notification à l'ouvrier, `motif` joint.
Réponse : `Mission` mise à jour. Réservé aux rôles de vérification (§3).

Pointages (géolocalisés — règle métier) :
```json
// POST /missions/pointages/arrivee  ou  /sortie
{ "mission_id": "uuid", "latitude": 5.3482, "longitude": -4.0185 }
```
```json
// Réponse Pointage
{ "id": "uuid", "mission_id": "uuid", "ouvrier_id": "uuid", "type": "ARRIVEE | SORTIE",
  "latitude": 5.3482, "longitude": -4.0185, "horodatage": "ISO",
  "distance_calculee_m": 42.5 | null, "hors_rayon": false }
```
**Règles** : le back calcule la distance (haversine) entre le point et `adresse_lat/lng` de la
mission ; `hors_rayon = distance > rayon_tolerance_metres`. Position invalide → rejet `400`.
Pointages hors rayon ou anomalies → mission `POINTAGE_A_VERIFIER` + notification
(`pointage_a_verifier`).

POST `/missions/photos` : `{ "mission_id": "uuid", "storage_url": "string" }`.

### 4.7 Factures — `/factures`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/factures` | `Facture[]` |
| GET | `/factures/:id` | `Facture` |
| POST | `/factures` | `Facture` |
| PATCH | `/factures/:id/statut` | `Facture` |
| POST | `/factures/:id/annuler` | `{ "message": "string" }` |
| DELETE | `/factures/:id` | `{ "message": "string" }` |
| GET | `/factures/consolidation` | `FactureConsolidation` |
| GET | `/factures/:id/export` | JSON (voir note) |
| GET | `/factures/export/cloture?date_debut=&date_fin=&filiale_id=` | JSON (voir note) |
| **POST (nouveau)** | `/factures` (depuis devis, voir §4.14) | `Facture` |

⚠️ **Ordre des routes** : `/factures/consolidation` et `/factures/export/*` avant
`/factures/:id`.
⚠️ **Exports** : le front parse toujours la réponse en JSON. Les exports doivent donc renvoyer
du JSON (`{ "url": "..." }`, `{ "contenu": "base64..." }` ou une URL signée), **pas** un binaire.

`Facture` :
```json
{
  "id": "uuid", "numero": "FAC-2026-091", "filiale_id": "uuid",
  "client_id": "uuid | null", "mission_id": "uuid | null", "devis_id": "uuid | null (nouveau)",
  "montant_ht": 100000, "montant_ttc": 120000,
  "statut": "BROUILLON | EMISE | PAYEE | EN_RETARD | ANNULEE",
  "date_emission": "ISO | null", "date_echeance": "ISO | null",
  "date_paiement": "ISO | null (nouveau)",
  "exercice_comptable": 2026, "numero_sequence": 91,
  "created_at": "ISO", "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "client": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string", "phone": "string | null" } | null
}
```

POST `/factures` :
```json
{ "filiale_id": "uuid", "client_id": "uuid | null", "mission_id": "uuid | null",
  "devis_id": "uuid | null (nouveau, source de conversion)",
  "montant_ht": 100000, "montant_ttc": 120000, "date_echeance": "ISO (opt)" }
```
**Règle de numérotation** : `numero = FAC-{exercice}-{sequence}` avec `numero_sequence`
incrémenté **atomiquement** par filiale et par exercice ; `exercice_comptable` = année courante.
Formats de référence dans l'UI : `FAC-2026-091`, devis `DEV-2026-085`, commandes `CMD-2026-118`.

PATCH `/factures/:id/statut` : `{ "statut": "PAYEE" }` — **le back renseigne automatiquement
`date_paiement`** à la date du jour.
POST `/factures/:id/annuler` : `{ "motif": "string (défaut 'Annulation')" }` → statut `ANNULEE`.

**[NOUVEAU] Règle métier `EN_RETARD` automatique** :
- **Cron quotidien** (ex. 00:05) : toute facture `EMISE` avec `date_echeance < aujourd'hui` → `EN_RETARD`.
- **Calcul à la lecture** (au `GET /factures` et `GET /factures/:id`) : même règle appliquée
  avant renvoi (permet de rattraper un batch manqué sans attendre le cron).
- `EN_RETARD` est un statut **dérivé mais persistant** : une facture payée après échéance passe
  `PAYEE` (avec `date_paiement`), elle ne reste pas `EN_RETARD`.
- Une facture `EN_RETARD` → notif `facture_en_retard` (comptable + client, §4.19).

`FactureConsolidation` (dashboard) :
```json
{
  "filiales": [ { "nom": "string", "code": "string", "total_ht": 0, "total_ttc": 0, "count": 3 } ],
  "totals": { "total_ht": 0, "total_ttc": 0, "total_factures": 3 }
}
```

### 4.8 Évaluations (performance 9S) — `/evaluations`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/evaluations` | `Evaluation[]` |
| GET | `/evaluations/:id` | `Evaluation` |
| POST | `/evaluations` | `Evaluation` |
| PATCH | `/evaluations/:id` | `Evaluation` |
| DELETE | `/evaluations/:id` | `{ "message": "string" }` |
| GET | `/evaluations/ranking?cycle_label=` | `EvaluationRanking` |

**⚠️ Échelle actée (décision v2)** : les notes `s1..s9` sont sur **base 40 par semaine**
(9 semaines, **total max 360**). Le back **stocke et renvoie en base 40**. `note_texte` sur
**base 50**. Un payload reçu sur base 10 doit être converti (`×4`) côté back avant stockage —
mais le front envoie déjà en base 40 (grille UI /10 convertie ×4 au submit).

`Evaluation` :
```json
{
  "id": "uuid", "personne_id": "uuid", "personne_nom": "Kouamé Firmin",
  "cycle_label": "Cycle 2026-06",
  "s1": 36, "s2": 38, "s3": 40, "s4": 34, "s5": 39, "s6": 37, "s7": 38, "s8": 36, "s9": 40,
  "note_texte": 44 | null,
  "total": 338, "rendement_9s": 93.9, "rendement_texte": 88.0, "rendement_global": 92.1,
  "rang": 1 | null,
  "created_at": "ISO", "updated_at": "ISO"
}
```

POST `/evaluations` :
```json
{ "personne_id": "uuid", "personne_nom": "string", "cycle_label": "string",
  "s1": 36, "s2": 38, "s3": 40, "s4": 34, "s5": 39, "s6": 37, "s7": 38, "s8": 36, "s9": 40,
  "note_texte": 44 (opt) }
```
PATCH : partiel **sans** `personne_id`, `personne_nom`, `cycle_label` (le front met à jour
`s1..s9` d'une grille existante).

`EvaluationRanking` (classement BR-08 par cycle) :
```json
{
  "cycles": [ { "label": "Cycle 2026-06", "count": 5 } ],
  "evaluations": [
    { "id": "uuid", "personne_nom": "string", "total": 338, "rendement_9s": 93.9, "rang": 1 }
  ],
  "total": 5
}
```

**Formules (règles BR-08 / BR-14, à calculer serveur — testées côté front, mêmes valeurs)** :
- `total = s1 + … + s9` (base 360)
- `rendement_9s = (total / 360) × 100`
- `rendement_texte = (note_texte / 50) × 100`
- `rendement_global = 0,7 × rendement_9s + 0,3 × rendement_texte` (alimente primes §4.13 et
  auto-affectation §4.6)
- `rang` = position triée par `rendement_9s` décroissant, au sein du cycle.

### 4.9 Notifications — `/notifications`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/notifications` | `Notification[]` |
| GET | `/notifications/unread-count` | **nombre brut** (pas un objet) |
| PATCH | `/notifications/read` | `{ "message": "string" }` |
| **GET (nouveau)** | `/notifications/stream` | **SSE** |

```json
// GET /notifications — champs minimums lus par l'UI
{ "id": "uuid", "lu": false, "type": "Système", "message": "string", "created_at": "ISO" }
```
PATCH `/notifications/read` : `{ "id": "uuid" }` (corps avec `id`, pas un path param).

**[NOUVEAU] GET `/notifications/stream` — Server-Sent Events (auth requise, Bearer)**
- `Content-Type: text/event-stream`, garder la connexion ouverte (heartbeat toutes les 30 s :
  `: ping`).
- Événement nommé `notification` avec le payload JSON de `Notification`.
- Délivrées : celles destinées à l'utilisateur connecté (scope filiale/équipe pour les
  managers, §3).
- **Types d'événements normalisés** (champ `type`) : `alerte_stock`, `nouvelle_mission`,
  `rappel_mission`, `pointage_a_verifier`, `rapport_valide`, `rapport_rejete`,
  `facture_emise`, `facture_en_retard`, `devis_signe`, `commande_validee`, `message`,
  `prime_calculee`, `système`.
- Le front utilise SSE quand disponible et **retombe en polling** sinon : l'endpoint GET
  classique doit donc rester à jour en permanence (créer la notification en base, puis
  l'émettre sur le stream).

### 4.10 Journal d'audit — `/audit-logs`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/audit-logs?table_cible=&entite_id=` | `AuditLog[]` (réservé Gérant / Dev Digital) |

```json
{
  "id": "uuid", "user_id": "uuid | null", "action": "CREATE | UPDATE | DELETE",
  "table_cible": "users", "entite_id": "uuid", "valeur_avant": "any | null",
  "valeur_apres": "any | null", "ip": "string | null", "created_at": "ISO",
  "user": { "id": "uuid", "first_name": "string", "last_name": "string", "email": "string" } | null
}
```
**À implémenter** : journalisation automatique des CREATE/UPDATE/DELETE sur **toutes** les
entités (dont les nouvelles : devis, chantiers, commandes, primes), avec `valeur_avant`/
`valeur_apres`, IP de l'appelant et `user` embarqué. Un export CSV du journal est attendu dans
l'UI (peut être client-side depuis la liste).

### 4.11 Espace client — `/client-space` (réservé ROLE_CLIENT_*)

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/client-space/profil` | `ClientProfile` (du client connecté) |
| GET | `/client-space/factures` | `Facture[]` (scopées au client) |
| GET | `/client-space/commandes` | `Commande[]` (§4.16, scopées au client) |
| GET | `/client-space/missions` | `Mission[]` (scopées au client) |
| GET | `/client-space/devis` | `Devis[]` (§4.14, scopés au client) |
| **GET (nouveau)** | `/client-space/demandes` | `DemandeDevis[]` (voir §5) |
| **GET (nouveau)** | `/client-space/projets` | `Projet[]` (voir §5) |
| **GET (nouveau)** | `/client-space/documents` | `Document[]` (voir §5) |
| **GET (nouveau)** | `/client-space/fidelite` | `Fidelite` (§4.18) |

### 4.12 Santé — `/health` (publique)

`{ "statut": "ok", "database": "up | down (opt)", "timestamp": "ISO (opt)" }`

### 4.13 [NOUVEAU] Primes — `/primes`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/primes?mois=2026-06&filiale_id=` | `Prime[]` |
| GET | `/primes/:id` | `Prime` |
| POST | `/primes/calculer` | `Prime[]` (déclenche le calcul du mois) |
| PATCH | `/primes/:id` | `Prime` (validation/ajustement) |

`Prime` :
```json
{
  "id": "uuid", "mois": "2026-06", "ouvrier_id": "uuid",
  "ouvrier": { "id": "uuid", "nom": "string", "matricule": "string | null" },
  "filiale_id": "uuid",
  "rendement_global": 92.1,
  "pointages_valides": 18, "missions_terminees": 9,
  "montant_base": 45000, "bonus_rendement": 12500, "malus_pointages": 0,
  "montant_total": 57500,
  "statut": "CALCULEE | VALIDEE | PAYEE",
  "note": "string | null",
  "created_at": "ISO", "updated_at": "ISO"
}
```

**Règle de calcul (à implémenter)** — proposée, ajustable :
- `montant_base` = f(filiale, catégorie ouvrier) (configurable en base).
- `bonus_rendement` = `montant_base × max(rendement_global − 80, 0) / 100`.
- `malus_pointages` = déduit quand `pointages_valides / missions_terminees` < 90 %.
- `montant_total = montant_base + bonus_rendement − malus_pointages` (jamais négatif).
- `POST /primes/calculer` : calcul pour tous les ouvriers de la filiale du demandeur pour le
  mois passé, **idempotent** par (mois, ouvrier) ; déclenche une notification `prime_calculee`.
- L'ouvrier voit sa prime via `GET /client-space` équivalent : **`GET /primes/mine?mois=`**
  (accessible `ROLE_OUVRIER`, scopée à lui-même).

### 4.14 [NOUVEAU] Devis — `/devis`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/devis` | `Devis[]` |
| GET | `/devis/:id` | `Devis` |
| POST | `/devis` | `Devis` |
| PATCH | `/devis/:id` | `Devis` |
| DELETE | `/devis/:id` | `{ "message": "string" }` |
| PATCH | `/devis/:id/statut` | `Devis` |
| **POST** | `/devis/:id/convertir` | `{ devis, facture }` |

`Devis` :
```json
{
  "id": "uuid", "numero": "DEV-2026-085",
  "filiale_id": "uuid", "client_id": "uuid | null",
  "lignes": [
    { "id": "uuid", "designation": "Peinture façade", "quantite": 2, "prix_unitaire_ht": 250000, "montant_ht": 500000 }
  ],
  "montant_ht": 500000, "montant_ttc": 600000,
  "statut": "BROUILLON | ENVOYE | SIGNE | REFUSE | EXPIRE",
  "date_validite": "ISO | null",
  "devis_sequence": 85, "exercice_comptable": 2026,
  "created_at": "ISO", "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "client": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string" } | null,
  "facture": { "id": "uuid", "numero": "string" } | null
}
```

- POST `/devis` : `{ filiale_id, client_id?, lignes[], date_validite? }` — `numero` auto
  (`DEV-{exercice}-{seq}`, séquence atomique par filiale), statut initial `BROUILLON`.
- PATCH `/devis/:id/statut` : `{ "statut": "ENVOYE | SIGNE | REFUSE" }`. `EXPIRE` calculé
  automatiquement si `date_validite < aujourd'hui` (au GET).
- **`POST /devis/:id/convertir`** : crée une facture (§4.7) avec `devis_id` renseigné, montants
  repris des lignes, et marque le devis `SIGNE`. Réponse : `{ "devis": Devis, "facture": Facture }`.
  Interdit si devis non `SIGNE` → `400`.
- Notifs : devis `ENVOYE` → `devis_signe` au client quand `SIGNE` (§4.19).

### 4.15 [NOUVEAU] Chantiers — `/chantiers`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/chantiers?filiale_id=&statut=` | `Chantier[]` |
| GET | `/chantiers/:id` | `Chantier` |
| POST | `/chantiers` | `Chantier` |
| PATCH | `/chantiers/:id` | `Chantier` |
| DELETE | `/chantiers/:id` | `{ "message": "string" }` |

`Chantier` :
```json
{
  "id": "uuid", "titre": "Rénovation résidence Traoré",
  "adresse": "Cocody, Abidjan", "adresse_lat": 5.3482 | null, "adresse_lng": -4.0185 | null,
  "filiale_id": "uuid", "client_id": "uuid | null",
  "budget_previsionnel": 5000000, "depenses_engagees": 3120000, "recettes": 4200000,
  "avancement_pct": 68,
  "statut": "PLANIFIE | EN_COURS | SUSPENDU | TERMINE | ANNULE",
  "date_debut": "ISO | null", "date_fin_prevue": "ISO | null",
  "photos": [ { "id": "uuid", "storage_url": "string", "uploaded_at": "ISO" } ],
  "created_at": "ISO", "updated_at": "ISO",
  "filiale": { "id": "uuid", "nom": "string", "code": "string" },
  "client": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string" } | null,
  "_missions": 6, "_pointages": 18
}
```
- POST : `{ titre, adresse?, adresse_lat?, adresse_lng?, filiale_id, client_id?, budget_previsionnel?, date_fin_prevue? }`.
- PATCH : partiel (`titre`, `adresse*`, `budget_previsionnel`, `avancement_pct`, `statut`, …).
- `marge = recettes − depenses_engagees` (calculable client-side à partir des champs).
- Notif quand `avancement_pct` atteint 100 (ou `statut` → `TERMINE`) : `message` type
  `chantier_termine`.

### 4.16 [NOUVEAU] Commandes boutique — `/commandes` (BR-13)

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/commandes?statut=&client_id=` | `Commande[]` |
| GET | `/commandes/:id` | `Commande` |
| POST | `/commandes` | `Commande` (statut `EN_PREPARATION`) |
| PATCH | `/commandes/:id/statut` | `Commande` (suivi livraison) |
| POST | `/commandes/:id/payer` | `PaiementMobile` |
| POST | `/commandes/:id/confirmer-paiement` | `Commande` (callback/callback simulé) |
| DELETE | `/commandes/:id` | `{ "message": "string" }` (si non payée) |

`Commande` :
```json
{
  "id": "uuid", "numero": "CMD-2026-118",
  "client_id": "uuid", "filiale_id": "uuid",
  "articles": [
    { "produit_id": "uuid", "designation": "Ciment 50 kg ×10", "quantite": 10, "prix_unitaire": 6250, "montant": 62500 }
  ],
  "montant_total": 148500,
  "statut": "EN_PREPARATION | EXPEDIEE | LIVREE | ANNULEE",
  "paiement": { "mode": "MTN_MOMO | MOOV_MONEY | CARTE | A_LA_LIVRAISON", "statut": "EN_ATTENTE | PAYE | ECHOUE", "reference": "string | null" },
  "livraison": { "adresse": "string", "date_prevue": "ISO | null", "date_livree": "ISO | null" },
  "created_at": "ISO", "updated_at": "ISO",
  "client": { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string" } | null
}
```

**Paiement Mobile Money** (BR-13) :
- `POST /commandes/:id/payer` : `{ "mode": "MTN_MOMO | MOOV_MONEY", "telephone": "+2250700000000" }`
  → le back initie la requête de paiement auprès du provider et répond
  `{ "reference": "uuid", "statut": "EN_ATTENTE" }` (le client confirme sur son téléphone).
- `POST /commandes/:id/confirmer-paiement` : webhook/callback du provider (ou confirmation
  simulée en dev via `NOTIFICATIONS_PROVIDER=demo`). Statut → `PAYE`, commande → `EXPEDIEE`,
  **le stock décrémente automatiquement** (mouvement `SORTIE_VENTE` + recalcul statut §4.5).
- En `demo`, `confirmer-paiement` est appelable par l'UI avec `{ "reference": "..." }`.
- Numérotation `CMD-{exercice}-{seq}` atomique par filiale.
- Notifs : `commande_validee` (client) ; fournisseur concerné notifié quand un article de sa
  gamme passe sous le seuil (§4.5).

### 4.17 [NOUVEAU] Messagerie — `/messagerie`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/messagerie/conversations` | `Conversation[]` |
| GET | `/messagerie/conversations/:id/messages` | `Message[]` |
| POST | `/messagerie/conversations/:id/messages` | `Message` |
| POST | `/messagerie/conversations` | `Conversation` (démarrage) |
| PATCH | `/messagerie/conversations/:id/lu` | `{ "message": "string" }` |

`Conversation` :
```json
{
  "id": "uuid", "sujet": "Visite de suivi mardi", "projet": "Résidence Traoré | null",
  "participants": [ { "id": "uuid", "first_name": "string", "last_name": "string", "role": "ROLE_..." } ],
  "derniere_activite": "ISO", "dernier_message": "string",
  "non_lus": 2,
  "created_at": "ISO", "updated_at": "ISO"
}
```
`Message` :
```json
{ "id": "uuid", "conversation_id": "uuid", "auteur_id": "uuid", "contenu": "string",
  "lu": false, "created_at": "ISO" }
```
- Les participants sont restreints au périmètre du JWT (manager → sa filiale, client → ses
  projets, §3). Pas de fichiers joints en v1 (le contenu peut contenir des URLs).
- Nouveau message → notification `message` (non-lu) sur le stream (§4.9).

### 4.18 [NOUVEAU] Fidélité membres — `/fidelite`

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/fidelite` | `Fidelite` (du client connecté) |
| GET | `/fidelite/historique` | `FideliteMouvement[]` |

`Fidelite` :
```json
{
  "id": "uuid", "client_id": "uuid",
  "points_actuels": 1240, "points_cumules": 3400,
  "tier": "BRONZE | ARGENT | OR",
  "reduction_boutique_pct": 5,
  "updated_at": "ISO"
}
```
`FideliteMouvement` :
```json
{ "id": "uuid", "fidelite_id": "uuid", "type": "GAIN | UTILISATION | EXPIRATION",
  "points": 250, "libelle": "Commande CMD-2026-118", "created_at": "ISO" }
```
Règles : 1 FCFA dépensé (commande payée §4.16, facture payée §4.7) = 1 point
(configurable) ; paliers : `ARGENT` ≥ 5 000 pts cumulés, `OR` ≥ 20 000 ; réduction appliquée
à la boutique (`BRONZE` 0 %, `ARGENT` 3 %, `OR` 5 %). L'utilisation de points génère un
mouvement `UTILISATION` et un coupon (champ `libelle`).

### 4.19 [NOUVEAU] Notifications externes SMS/WhatsApp

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/notifications-prefs` | `NotificationPrefs` |
| PATCH | `/notifications-prefs` | `NotificationPrefs` |

`NotificationPrefs` :
```json
{
  "user_id": "uuid",
  "canaux": { "push": true, "sms": false, "whatsapp": false },
  "types": {
    "nouvelle_mission": ["push", "sms"],
    "rappel_mission": ["push"],
    "facture_emise": ["push"],
    "facture_en_retard": ["push", "whatsapp"],
    "pointage_a_verifier": ["push"],
    "commande_validee": ["push", "sms"]
  },
  "telephone": "+2250700000000 | null"
}
```
Règles :
- Le back ne fait **jamais** d'envoi externe bloquant : mise en file + worker (`provider demo`
  par défaut, loggué).
- Les SMS/WhatsApp ne partent que si `telephone` est renseigné et le type activé.
- Templates minimalistes (ex. mission : « WUGAMS : mission « Nettoyage Chantier A » demain
  09:30. Merci de confirmer. »).

---

## 5. Modules encore en « mode démonstration » — À CONSTRUIRE (reste)

Avec la v2, la plupart des anciens modules démo ont un contrat (devis, commandes, chantiers,
messagerie). **Il reste** :

| Module (route) | Écran affiché | Ce qu'il faut exposer |
|---|---|---|
| `/espace/managers` | Comptes managers, périmètres, activité | `GET /managers` → users rôles managers enrichis : `{ user, perimetre, activite_du_mois (nb missions / contrôles / commandes) }` ; création via `POST /users` |
| `/espace/carte` | Carte des chantiers + historique pointages | `GET /chantiers` (géolocalisés, §4.15) + `GET /pointages?periode=&filiale_id=` → historique : `{ id, mission_id, mission, ouvrier, type, horodatage, lat, lng, verifie }` |
| Espace client `/espace/demandes` | Demandes de devis | `GET /client-space/demandes` : `{ id, libelle, service, statut (RECUE, EN_COURS, A_CONFIRMER, TERMINEE), created_at }` — création côté client `POST /client-space/demandes` |
| Espace client `/espace/projets` | Suivi de travaux (%) | `GET /client-space/projets` : les chantiers (§4.15) du client, mappés `{ id, titre, adresse, avancement_pct, statut, prochaine_visite, photos_count }` |
| Espace client `/espace/documents` | Devis, rapports, photos par projet | `GET /client-space/documents` : `{ id, titre, type (RAPPORT, DEVIS, PHOTO, PLANNING), projet, date, auteur }` — agrégation des devis/rapports/photos du client |

**Badge UI** : chaque module branché affiche « Données en direct · API WUGAMS » ; si l'appel
échoue (réseau ou 4xx/5xx), il bascule silencieusement en « Mode démonstration ». Livrer un
endpoint = badge vert. Une erreur HTTP **ne casse pas** la page (fallback), mais un shape
incorrect produit des lignes vides.

---

## 6. Règles métier transverses (rappel exécutoire)

1. **RBAC serveur strict** : vérifier rôle + `filiale_id` du JWT sur chaque route (§3).
2. **Numérotation séquentielle** par filiale + exercice, atomique : factures `FAC-YYYY-SEQ`,
   devis `DEV-YYYY-SEQ`, commandes `CMD-YYYY-SEQ` (§4.7, §4.14, §4.16).
3. **Statuts de stock** recalculés après chaque entrée/sortie + alertes serveur + notification
   de seuil (§4.5).
4. **Pointage géolocalisé** : distance haversine, `hors_rayon`, horodatage serveur ; anomalies
   → mission `POINTAGE_A_VERIFIER` ; **vérification** via `POST …/pointages/verification`
   avec `validateur_id` (§4.6).
5. **Workflow missions** : transitions de statut validées serveur ; `rapport_texte` requis
   pour `RAPPORT_SOUMIS` ; auto-affectation par rendement 9S (§4.6).
6. **Évaluation 9S** : base 40/semaine, calculs BR-08/BR-14 (§4.8), cycle par `cycle_label`.
7. **Factures** : `EN_RETARD` automatique (cron + calcul au GET), `date_paiement` posé au
   passage `PAYEE` (§4.7).
8. **Audit** : journaliser CREATE/UPDATE/DELETE sur toutes les entités (§4.10).
9. **2FA TOTP** : secret + QR (`otpauth://`) ; login d'un compte 2FA actif → `requires_2fa` ;
   désactivation contrôlée par TOTP (§2.3).
10. **Mot de passe oublié** : token à usage unique 1 h, anti-énumération, révocation des
    refresh tokens (§2.2).
11. **Primes** : calcul idempotent par (mois, ouvrier), notification `prime_calculee` (§4.13).
12. **Paiements Mobile Money** : initie → `EN_ATTENTE` → callback → `PAYE` → décrément stock
    (BR-13, §4.16).
13. **Réponses en `snake_case`**, dates ISO 8601, erreurs au format NestJS, `expires_in`
    compréhensible (`7d`, `1h`, secondes).
14. **Exports en JSON uniquement** (§4.7).
15. **SSE** : un seul canal, heartbeat 30 s, événements nommés §4.9 ; tout reste lisible via
    le GET classique.

---

## 7. Checklist de conformité (acceptance)

**Auth & comptes**
- [ ] `POST /auth/login` renvoie `requires_2fa` pour les comptes 2FA ; `expires_in` = `"7d"`
- [ ] `POST /auth/me` (POST, pas GET) renvoie le JWT avec `two_factor_verified`
- [ ] `POST /auth/password-reset` (2 étapes) : token 1 h, anti-énumération, révocation refresh
- [ ] `POST /auth/2fa/disable` validé par TOTP
- [ ] Comptes de test §2.5 disponibles (dont secrétaire, manager ops, resp. ouvriers)

**Données & règles**
- [ ] Tous les champs des entités §4 présents, en `snake_case`
- [ ] Évaluations : `s1..s9` en base 40, calculs BR-08/BR-14 conformes aux formules §4.8
  (valeurs identiques aux tests unitaires du front)
- [ ] `EN_RETARD` automatique (cron + GET) ; `date_paiement` posé au passage `PAYEE`
- [ ] `GET /stocks/alertes` + notification de seuil
- [ ] Vérification des pointages : `validateur_id` renseigné, transitions contrôlées
- [ ] `POST /missions/:id/affecter` propose le meilleur ouvrier (rendement 9S)
- [ ] Numérotation `FAC/DEV/CMD-{année}-{seq}` cohérente
- [ ] Devis : CRUD + conversion devis → facture (devis `SIGNE` requis)
- [ ] Chantiers : budget/recettes/avancement, marge dérivable
- [ ] Commandes : paiement MoMo initié → callback → stock décrémenté
- [ ] Primes : calcul idempotent, `GET /primes/mine` scopé ouvrier
- [ ] Fidélité : points sur paiements, paliers BRONZE/ARGENT/OR
- [ ] Messagerie : périmètre JWT respecté, non-lus
- [ ] Notifs externes : non bloquantes, provider `demo` par défaut, préférences §4.19

**Système**
- [ ] `GET /notifications/unread-count` renvoie un nombre brut
- [ ] SSE `/notifications/stream` : auth, heartbeat 30 s, événement `notification`
- [ ] `GET /users` et `GET /audit-logs` restreints Gérant / Dev Digital
- [ ] Modules §5 restants exposés (managers, carte, demandes, projets, documents)
- [ ] Erreurs NestJS standard partout ; `401` sur token invalide/expiré (déclenche le refresh front)
- [ ] CORS activé pour l'origine du front
