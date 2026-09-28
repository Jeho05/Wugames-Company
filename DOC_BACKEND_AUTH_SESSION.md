# WUGAMS — Doc Backend : contrat Auth / Session (durcissement frontend `6c34534`)

À destination du développeur backend (NestJS). Contexte : le frontend a corrigé
la course **login → cookie → navigation** qui bloquait l'arrivée au dashboard
en production. **Aucun nouvel endpoint backend n'est requis par ce correctif.**
Ce document liste uniquement les contrats que le backend **doit maintenir
stables**, car le frontend s'y fie désormais strictement.

Références front : `app/lib/api-client.ts`, `app/lib/auth-context.tsx`,
`proxy.ts`, `app/lib/api/auth.ts`, `app/lib/contracts.ts:48-85`.

---

## 1. Ce que le frontend garantit désormais (pour info, rien à faire)

- Après `POST /auth/login` réussi, le front **attend la confirmation du cookie**
  (`POST /api/session` → `{ ok: true }`, route Next.js interne) **avant** de
  naviguer vers `/espace`. Un échec cookie affiche un retry **sans ressaisir
  le mot de passe** (tokens conservés).
- `POST /auth/refresh` : le front ne considère le refresh comme réussi que si
  le nouveau cookie est reposé. Échec cookie → refresh traité comme `false`
  (retryable), session locale conservée.
- Restauration au chargement : `POST /auth/me` distingue session absente (prêt,
  `user = null`), session valide + `me()` OK, refresh nécessaire, session
  expirée/révoquée (purge), erreur réseau temporaire (état retryable, **jamais**
  confondue avec « déconnecté »).
- `401` = session morte (purge). `403` = refus métier (jamais traité comme un
  problème de session). `429/5xx/réseau` = transitoire (session conservée).

## 2. Contrats à maintenir stables (ne pas casser)

### 2.1 Claims JWT de l'`access_token` (lus par `proxy.ts`, SANS vérification de signature)

Le middleware décode le payload **uniquement pour l'UX navigation** (le backend
reste l'autorité). Il exige :

| Claim | Usage front | Contrainte |
|---|---|---|
| `exp` | expiration navigation ; cookie supprimé + redirect `/connexion` si `exp*1000 < now` | **obligatoire, en secondes**, aligné avec la durée de vie réelle du token |
| `role` | garde ultra-sensible `/espace/administration` (Gérant/Dev uniquement) | **obligatoire**, valeur `RoleCode` exacte |

⚠️ Si `exp` manque ou est faux : navigation cassée (redirects en boucle ou
sessions fantômes). Si `role` change de format : garde admin inopérante.

### 2.2 `POST /auth/login` → `AuthTokens`

```json
{
  "access_token": "<jwt, > 20 chars>",
  "refresh_token": "<opaque, > 10 chars>",
  "expires_in": "7d | 900 | 1h (string ou number, secondes si nu)",
  "user": { "id": "", "email": "", "role": "", "filiale_id": null,
             "two_factor_enabled": false, "profile_id": null }
}
```

- `expires_in` absent/illisible → le front retombe sur **7 jours** : préférez
  toujours le renseigner.
- Variante 2FA inchangée : `{ "requires_2fa": true, "user_id": "" }`, puis
  `POST /auth/2fa/verify { user_id, token }` → `AuthTokens` (mêmes garanties).

### 2.3 `POST /auth/me` → `JwtPayload`

`{ sub, email, role, filiale_id, two_factor_enabled, two_factor_verified,
profile_id, iat, exp }`. Tous les champs sont utilisés pour construire le
profil (nom/filiale via `GET /users/:id` + `GET /filiales` ensuite).

### 2.4 `POST /auth/refresh { refresh_token }`

- `401/403` → le front **purge** la session (considérez-les comme
  « refresh révoqué/expiré » uniquement, jamais pour un 429/5xx).
- `429/5xx` → le front **conserve** la session et réessaiera : ne renvoyez ces
  codes que pour du réellement transitoire.
- Si vous rotatez le refresh token, renvoyez `refresh_token` + `expires_in`
  dans la réponse (le front les adopte) ; sinon il réutilise l'ancien.

### 2.5 `POST /auth/logout`

Best-effort côté front (purge locale même en cas d'échec) : endpoint idempotent
recommandé (toujours `200`, même token déjà révoqué).

## 3. Latence & rate-limit (compatibilité)

- Le front impose un timeout de **10 s** sur la sync cookie et **15–20 s** sur
  les appels API : un `POST /auth/login` qui dépasse systématiquement ~8 s
  (cold start) dégradera l'UX — à surveiller côté serveur.
- Rate-limit front (`proxy.ts`) : **20 req/min/IP** sur login/register/2FA
  uniquement (`/auth/me`, `/auth/refresh`, `/auth/logout` exclus pour ne pas
  casser le multi-onglets). **Ne pas ajouter de rate-limit agressif côté
  backend sur `me`/`refresh`** : le front les appelle au focus onglet + avant
  expiration + retry 401.
- Le front ne rejoue **jamais** automatiquement un login 401 (pas de boucle
  de tentatives) : un rate-limit backend sur `/auth/login` reste sans risque
  tant qu'il renvoie `429` (message affiché tel quel).

## 4. Améliorations optionnelles (non bloquantes, déjà demandées)

1. `can_manage_vitrine: boolean` dans `POST /auth/me` et/ou le JWT
   (`BACKEND_REQUIREMENTS.md` §2) — éviterait un appel `/vitrine/permissions`
   au chargement du shell.
2. `personne_id` dans `GET /evaluations/ranking`, `destinataire_id` dans
   `GET /notifications` (idem §7–§8).
3. Tranchage `GET /client-space/factures` pour `ROLE_CLIENT_STD` (idem §10).

## 5. Comment vérifier côté backend après déploiement

1. Login valide → dashboard **sans** second essai (le cas qui échouait avant).
2. `POST /auth/refresh` avec refresh révoqué → `401/403` (purge front).
3. Backend coupé 30 s puis relancé, onglet resté ouvert → bandeau retryable,
   **pas** de déconnexion, retry → dashboard sans ressaisie.
4. Décoder un `access_token` : `exp` et `role` présents et exacts.

*En cas de changement volontaire d'un contrat §2, prévenir le front : les états
« indisponible / retry » sont câblés pour basculer en direct, mais les claims
JWT et les codes 401/403 conditionnent toute la navigation.*
