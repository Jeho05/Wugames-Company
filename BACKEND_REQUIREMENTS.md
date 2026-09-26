# WUGAMS — Besoins Backend (dev NestJS)

Document à destination du développeur back-end. Il liste **uniquement ce que le
frontend attend et ne reçoit pas (ou reçoit en écart à la spec)** après l'audit
production du frontend (commit `21e7923`). Références : `SPEC-BACKEND.md` (v2),
`ADMIN_DASHBOARD_API_GUIDE.md` (§4–§5), `SPEC-VITRINE.md` (§6 TODO backend).

> Règle de production appliquée côté front : ce qui n'existe pas côté backend
> n'est **ni simulé, ni persisté en local** — l'UI affiche « fonctionnalité
> indisponible / configuration backend requise ». Chaque point ci-dessous lève
> donc une vraie limitation visible par les utilisateurs.

Conventions rappelées (SPEC-BACKEND §1) : préfixe `/api/v1`, réponses en
`snake_case`, dates ISO 8601, erreurs NestJS `{ statusCode, message, error }`,
`message` tableau joint par ` · ` côté front.

---

## P0 — Bloquant production (fonctionnalités visibles mais inopérantes)

### 1. Abonnements WUGAMS Clean — aucun endpoint
**État front** : `app/lib/cleans-data.ts:loadCleansOverview()` appelle
`GET /cleans/overview` → échec → état vide explicite ; le bouton « Activer ce
plan » affiche « fonctionnalité indisponible — configuration backend requise »
(`app/components/workspace/client/client-cleans.tsx:activer`).

**À créer** (proposition, à valider métier) :

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/cleans/overview` | client connecté | `CleansOverview` (voir §8) |
| GET | `/cleans/plans` | publique ou auth | `CleansPlan[]` (le front a un catalogue statique en attendant) |
| POST | `/cleans/abonnements` | client connecté | `CleansAbonnement` (body `{ plan_id, nb_toilettes, localisation }`) |
| POST | `/cleans/abonnements/:id/payer` | client connecté | paiement Mobile Money (même pattern que `/commandes/:id/payer`) |
| PATCH | `/cleans/abonnements/:id` | client connecté | changement de plan / résiliation |
| GET | `/cleans/services?abonnement_id=` | client connecté | `CleansService[]` (passages planifiés/réalisés/validés + photos) |

**Critère d'acceptation** : activation → `200` + nouvel état serveur ; rechargement
de page conserve l'abonnement ; `dateDebut`, `prochainPaiement`,
`prochainPassage` renseignés par le serveur (jamais de dates front).

### 2. Permissions vitrine — délégation inopérante
**État front** : `app/lib/api/vitrine.ts:319-330` appelle déjà
`GET /vitrine/permissions`, `POST /vitrine/permissions { user_id }`,
`DELETE /vitrine/permissions/:userId`. En cas d'échec, la délégation est
**refusée par défaut** (`canManageVitrine` sans ids API = `false`) : les
délégués ne voient jamais `/espace/vitrine`.

**À créer** (SPEC-VITRINE §3.8) :

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/vitrine/permissions` | `ROLE_GERANT` | `{ user_ids: string[] }` |
| POST | `/vitrine/permissions` | `ROLE_GERANT` | `{ user_ids }` (body `{ user_id }`) |
| DELETE | `/vitrine/permissions/:userId` | `ROLE_GERANT` | `{ user_ids }` |

**Recommandé** : inclure `can_manage_vitrine: boolean` dans `POST /auth/me`
(et/ou le JWT) pour éviter un appel supplémentaire au chargement du shell.

**Critère d'acceptation** : un secrétaire délégué voit le groupe Vitrine en
sidebar, la recherche et la page ; un non-délégué reçoit `403` en écriture.

### 3. Tables vitrine — atelier Gérant sans persistance
Rappel SPEC-VITRINE §6 : créer `temoignages`, `services`, `garanties`,
`realisations`, `blog_posts`, `marquee_items` + routes `GET` publiques /
`POST/PATCH/DELETE` protégées `canManageVitrine`, validation `icon` contre
l'enum front, `is_published`, journalisation `audit_logs.table_cible =
vitrine_*`.

---

## P1 — Fort impact (données « Non disponible » côté front)

### 4. Catalogue boutique publique
`GET /stocks/produits` → `403` sans token (vérifié en smoke tests). La boutique
publique affiche « Catalogue en préparation ».
**Choix backend** : rendre `GET /stocks/produits` public (lecture seule,
champs non sensibles) **ou** créer `GET /vitrine/produits` (proxy du stock
publié). Sans cela, seuls les connectés voient la boutique workspace.

### 5. Comptabilité — charges / trésorerie
Le front a **supprimé** les formules `CA × 64 %` / `× 36 %` : les KPI
« Dépenses », « Bénéfice net », « Trésorerie » affichent « Non disponible ».
Si ces indicateurs sont voulus : exposer une source réelle (ex.
`GET /comptabilite/charges?mois=&filiale_id=`, soldes bancaires, ou entité
`depenses`). Sans source, le front restera sur « Non disponible » (décision
assumée, ne pas estimer).

### 6. Score performance fournisseur
Le front affiche la fiabilité (`% produits non en rupture`, agrégat documenté)
mais `performance = null` (« Non évaluée ») faute de règle officielle.
Si un score composite est voulu, **le backend doit définir la formule**
(pondérations, clamp, paliers de statut) — le front ne l'inventera pas.

---

## P2 — Durcissement contrats (petits champs, gros effets)

### 7. `GET /evaluations/ranking` — ajouter l'identité
Les entrées ranking (`{ id, personne_nom, total, rendement_9s, rang }`) ne
contiennent **aucun identifiant personne** : le front doit re-fetcher
`GET /evaluations` pour matcher `personne_id === user.id`.
**Demande** : ajouter `personne_id` (et si possible `ouvrier_id`) à chaque
entrée ranking. En attendant, le front double l'appel ; sans correspondance,
le classement ouvrier affiche « Classement indisponible » (jamais de rang
inventé).

### 8. `GET /notifications` — ajouter le destinataire
Le contrat `Notification` n'a pas de champ destinataire : le front **ne peut
pas** filtrer défensivement côté client (il s'en remet au scoping serveur,
SPEC-BACKEND §4.9).
**Demande** : ajouter `destinataire_id` (ou `user_id`) aux notifications pour
permettre une isolation vérifiable côté front (ouvrier = ses notifs).

### 9. Confirmer la sémantique `mission.ouvrier_id`
Le front isole par `mission.ouvrier_id === ouvrier_profile.id`
(`app/lib/worker-data.ts`). **Confirmer** que `ouvrier_id` est bien l'id du
`ouvrier_profile` (et non du `user`), sinon l'isolation front casse
silencieusement (liste vide légitime confondue avec bug).

### 10. Incohérence RBAC à trancher — `GET /client-space/factures`
`403` pour `ROLE_CLIENT_STD`, `200` pour `ROLE_CLIENT_MEMBRE` (constat
SPEC-BACKEND §2.6), alors que la spec déclare la route sans restriction.
**Trancher** : si les STD n'y ont pas droit, mettre à jour la spec (§4.11) ;
sinon ouvrir aux STD. Le front suit la matrice actuelle (factures visibles
aux deux rôles côté navigation, `403` serveur possible → `ForbiddenState`).

---

## P3 — Vérifications RBAC serveur (le front ne fait que l'UX)

Le backend **doit** revérifier rôle + `filiale_id` sur chaque endpoint. Points
sensibles issus de la matrice front (`app/lib/rbac-matrix.ts`,
`ADMIN_DASHBOARD_API_GUIDE.md` §5) :

| Endpoint | Rôles autorisés attendus |
|---|---|
| `POST /users` (création collaborateur) | `ROLE_GERANT` uniquement |
| `POST/PATCH /filiales`, `DELETE /chantiers`, `DELETE /devis` | `ROLE_GERANT` uniquement |
| `POST /missions/:id/affecter` | Gérant, Mgr Ops, Mgr Filiale (sa filiale), Resp Ouvriers |
| `POST /missions/:id/pointages/verification` | Gérant, Dev Digital, Mgr Ops, Mgr Filiale, Resp Ouvriers |
| `POST /factures`, `POST /primes/calculer`, `GET /primes` | Gérant, Comptable |
| `POST /devis`, `PATCH /devis/:id/statut` | Gérant, Comptable, Secrétaire |
| `POST /devis/:id/convertir` | Gérant, Comptable, Secrétaire + devis `SIGNE` (`400` sinon) |
| `POST /stocks/produits`, `PATCH /stocks/produits/:id`, `POST /stocks/mouvements` | Gérant, Mgr Ops, Mgr Filiale |
| `POST /chantiers`, `PATCH /chantiers/:id` | Gérant, Mgr Ops, Mgr Filiale |
| `POST /clients` (admin) | Gérant, Secrétaire, Managers |
| `POST /fournisseurs` | Gérant, Mgr Partenaire |
| `GET /primes/mine?mois=` | `ROLE_OUVRIER` scopé à lui-même |
| Toutes les listes (`/missions`, `/factures`, `/users`, …) | restriction au `filiale_id` du JWT pour les managers (SPEC §3) |

---

## Règles métier à confirmer / maintenir

- Transitions missions : `PLANIFIE → NOTIFIE → ACCEPTE → EN_COURS →
  RAPPORT_SOUMIS → VALIDE → TERMINE` (+ `POINTAGE_A_VERIFIER` anomalie) ;
  `rapport_texte` obligatoire pour `RAPPORT_SOUMIS` ; seul un validateur pose
  `VALIDE` (`validateur_id` renseigné).
- Pointage hors rayon (`distance > rayon_tolerance_metres`) → mission
  `POINTAGE_A_VERIFIER` + notification `pointage_a_verifier`.
- Factures `EN_RETARD` : cron quotidien **et** calcul à la lecture (§4.7).
- Devis : statut initial `BROUILLON`, séquence atomique par filiale ;
  `EXPIRE` calculé si `date_validite < aujourd'hui`.
- Commandes : statut initial `EN_ATTENTE` ; `confirmer-paiement` → `PAYE` +
  `EXPEDIEE` + décrément stock (`SORTIE_VENTE`).
- Fidélité : 1 FCFA = 1 pt ; paliers ARGENT ≥ 5 000, OR ≥ 20 000 ;
  réductions BRONZE 0 % / ARGENT 3 % / OR 5 %.
- Journalisation `audit-logs` sur CREATE/UPDATE/DELETE de **toutes** les
  entités (y compris devis, chantiers, commandes, primes, vitrine).
- SSE `GET /notifications/stream` : heartbeat 30 s, événement nommé
  `notification`, types normalisés §4.9 ; le GET classique reste la source de
  repli (polling).

---

## Ordre de livraison suggéré

1. `/vitrine/permissions` + flag JWT (petit, débloque la délégation).
2. `/cleans/*` (débloque l'activation + paiement + passages).
3. Boutique publique (un flag ou une route).
4. Champs `personne_id` (ranking) + `destinataire_id` (notifications) +
   confirmation `ouvrier_id`.
5. Tranchage `client-space/factures` STD + règle performance fournisseur.
6. Source comptable charges/trésorerie (si voulue).
7. Revue RBAC serveur du tableau P3 + audit-logs complets.

*Front impliqué : `app/lib/api/*` (contrats `app/lib/contracts.ts`), matrice
`app/lib/rbac-matrix.ts`, permissions `app/lib/permissions.ts`. Dès qu'un
endpoint ci-dessus est livré, le front a seulement besoin de son contrat exact
— les états « indisponible » sont déjà câblés pour basculer en direct.*
