# Doc backend — Missions & espace ouvrier (WUGAMS)

> À destination de l'équipe back-end. Base API : `https://wugames-holding-inc.vercel.app/api/v1`
> Frontend : `https://wugams.vercel.app` (référence vive : branche `main`).
> Contexte : voir `DOC_BACKEND_AUTH_SESSION.md` (précédent), `ADMIN_DASHBOARD_API_GUIDE.md`,
> `SPEC-BACKEND.md` (§3 RBAC, §4.6 workflow missions).

## 0. Pourquoi ce document

Côté frontend, l'espace ouvrier a été refondu :

- L'ouvrier **n'utilise plus aucun module back-office** (missions, chantiers, carte,
  ouvriers). Sa vue unique est son espace dédié `GET /espace` (WorkerCommandCenter),
  alimenté par `GET /missions` et les actions mission ci-dessous.
- Les actions ouvrier sont intégralement **server-first** : plus d'état affiché que le
  serveur n'a accepté. Chaque refus définitif (400/403/404/409) est signalé à l'ouvrier
  avec son code HTTP. Il est donc **critique** que les règles ci-dessous soient
  implémentées telles quelles, sinon l'ouvrier voit des 403 sans savoir pourquoi.

## 1. Constat terrain (smoke test 2026-08-15 + docs contradictoires)

| Sujet | Constat |
|---|---|
| `GET /missions` pour `ROLE_OUVRIER` | `SPEC-BACKEND.md` §3 (non permis) vs §5.7 / `ADMIN_DASHBOARD_API_GUIDE.md` §5.7 (permis, scopé). Frontend implémente la version **permis + scopé** — à se caler dessus. |
| `PATCH /missions/:id/statut` pour `ROLE_OUVRIER` | Même conflit de documentation. Le frontend envoie `ACCEPTE` puis `RAPPORT_SOUMIS` depuis l'ouvrier. |
| `POST /missions` | Le frontend n'envoie **jamais** `statut` (le serveur crée en `PLANIFIE`). À conserver. |
| `POST /missions/:id/affecter` | OK avec `{ouvrier_id}` ou `{}` (auto-affection). À conserver. |
| `GET /users`, `GET /chantiers`, `GET /primes`, `GET /pointages` | 403 pour Secrétaire — **assumé et géré** côté front (données vides, pas de crash). Rien à changer, c'est cohérent avec §5.2. |

## 2. Changements attendus

### 2.1 `GET /missions` ouvert et scopé pour `ROLE_OUVRIER`

- Réponse : **uniquement** les missions où `ouvrier_id` == l'id de profil ouvrier du JWT
  (`profile_id` claim). Les missions non affectées ou affectées à un autre ouvrier
  n'apparaissent pas.
- Le claim `profile_id` du JWT est l'**identifiant du profil ouvrier** (pas de l'utilisateur).
  C'est lui qu'il faut comparer à `Mission.ouvrier_id` — pas le `sub` de l'utilisateur.
  (Rappel `DOC_BACKEND_AUTH_SESSION.md` : `GET /users/:id` est 403 pour
  `ROLE_OUVRIER` ; le frontend ne résout JAMAIS son profil via cet endpoint.)
- Raison du changement : le module `/espace/missions` reste **fermé** à l'ouvrier dans le
  back-office, mais l'espace ouvrier a besoin de sa liste de missions. L'ouverture est
  scopée, donc sans fuite d'information.
- Si vous préférez un endpoint dédié (`GET /ouvrier/missions`), dites-le — le frontend
  s'alignera. En attendant, la liste **doit** être disponible via `GET /missions`.

### 2.2 Transitions que `ROLE_OUVRIER` doit pouvoir déclencher sur ses missions

Cible : `PATCH /missions/:id/statut` et `POST /missions/pointages/*`.

```
NOTIFIE     → ACCEPTE            (ouvrier accepte la mission)
EN_COURS    → [pointage SORTIE]  (voir 2.3 : le pointage porte la transition)
EN_COURS    → RAPPORT_SOUMIS     (rapport_texte requis, voir 2.4)
```

Règles :

1. `ACCEPTE` : uniquement depuis `NOTIFIE`, uniquement si `mission.ouvrier_id` == profil
   du JWT. `409` si le statut a déjà bougé (le front affiche « la mission a déjà changé
   de statut » — c'est voulu).
2. `RAPPORT_SOUMIS` : uniquement depuis `EN_COURS`, avec `rapport_texte` obligatoire
   (`400` si absent/vide/<10 caractères). Un ouvrier ne peut pas sauter à
   `VALIDE`/`TERMINE`.
3. `NOTIFIE` et `PLANIFIE` restent posés par l'encadrement ; `VALIDE` est réservé aux
   rôles valideurs (`POINTAGE_A_VERIFIER → VALIDE`, `RAPPORT_SOUMIS → VALIDE`,
   `VALIDE → TERMINE`). Un `ROLE_OUVRIER` qui tente ces transitions doit recevoir `403`.

### 2.3 Pointages GPS (`POST /missions/pointages/arrivee` et `/sortie`)

Body (déjà implémenté côté front) :

```json
{ "mission_id": "<uuid>", "latitude": 5.3599, "longitude": -4.0083 }
```

Règles attendues :

1. **Ownership** : le pointeur doit être l'ouvrier affecté à la mission
   (`mission.ouvrier_id` == `profile_id` du JWT). Sinon `403`.
2. `ARRIVEE` : mission dans `ACCEPTE` (ouvrier sur place) → `EN_COURS`.
   Si le point est hors de `rayon_tolerance_metres` de `adresse_lat/adresse_lng`,
   la mission passe en `POINTAGE_A_VERIFIER` et le pointage est bien entendu
   **enregistré** avec `hors_rayon = true` + `distance_calculee_m` renseignés.
3. `SORTIE` : mission dans `EN_COURS` (ou `POINTAGE_A_VERIFIER` après départ hors
   rayon, a trancher côté vous — dites-nous) → retour vers `EN_COURS`/`POINTAGE_A_VERIFIER`
   selon le rayon. La validation finale reste côté encadrement.
4. Anti-doublon : `ARRIVEE` déjà pointée sans `SORTIE` intermédiaire → `409` (pas
   d'arrivée en double). Réponse `201` avec l'objet `Pointage`.
5. Un ouvrier ne pointe **que sa propre mission** ; `mission_id` inconnu → `404`.

Le frontend décide de sa transition locale : arrivée dans le rayon → `EN_COURS`,
hors rayon → `POINTAGE_A_VERIFIER`. Si votre calcul diffère, la **donnée renvoyée** fait
foi — renvoyez la mission (ou au moins son statut) si possible dans la réponse.

### 2.4 Photos de mission (`POST /missions/photos`)

Body :

```json
{ "mission_id": "<uuid>", "storage_url": "<url Supabase/storage>" }
```

- Ownership identique aux pointages (ouvrier affecté uniquement) — sinon `403`.
- `storage_url` doit être validé (format URL, bucket attendu) → `400` sinon.
- L'ajout doit rester possible pour l'ouvrier tant que la mission est dans
  `EN_COURS` (et idéalement jusqu'à `RAPPORT_SOUMIS`, a trancher — le rapport du
  frontend exige d'abord la sortie pointée puis les photos).

### 2.5 `POST /missions/:id/affecter` : auto-`NOTIFIE`

Comportement implémenté (confirmé par smoke test) et à conserver :

- `{}` → la plateforme choisit l'ouvrier (auto-affection), `{ouvrier_id}` → affectation
  ciblée.
- **L'affectation doit passer la mission en `NOTIFIE`** (c'est ce qui la rend visible
  dans la file ouvrier). Si vous créez une mission via `POST /missions` en `PLANIFIE`
  puis affectez, ne réclamez pas un `POST /statut NOTIFIE` séparé ; à défaut, le
  frontend chaîne `affecter` puis `PATCH statut NOTIFIE` — mais un seul appel serait
  préférable (atomicité).
- `409` si la mission est déjà affectée à un autre ouvrier et n'est plus en `PLANIFIE`.

### 2.6 `chantier_id` sur `Mission` (évolution demandée)

Le frontend doit bientôt lier l'ordre de mission à un chantier :

- Ajouter `chantier_id UUID NULL REFERENCES chantiers(id)` sur `missions` (nullable :
  mission hors chantier possible).
- Exposer `chantier_id` dans les payloads `GET /missions`, `GET /missions/:id` et
  accepter `chantier_id` dans `POST /missions`.
- Accès lecture chantier pour `ROLE_OUVRIER` : le worker a besoin d'au moins
  `chantier.nom`/`adresse_lat`/`adresse_lng`/`adresse` de **ses** chantiers. Deux
  options (au choix, dites-nous) :
  1. enrichir la réponse `GET /missions` d'un objet `chantier` pour l'ouvrier, ou
  2. ouvrir `GET /chantiers/:id` (et idéalement `GET /chantiers?mine=1`) de manière
     scopée au `ROLE_OUVRIER`.

L'ouverture `GET /chantiers` **globale** à l'ouvrier n'est PAS demandée : le module
Chantiers du back-office reste fermé à `ROLE_OUVRIER` (cf. rbac frontend).

## 3. Matrice RBAC attendue (missions/ouvrier)

Source de vérité côté vous ; le frontend miroite exactement celle-ci.

| Endpoint | Rôles permis | Notes |
|---|---|---|
| `GET /missions` | GERANT, DEV_DIGITAL (+ à confirmer : MGR_OPS, MGR_FILIALE, RESP_OUVRIERS en 403 aujourd'hui — cf. smoke test) | Resp. Ouvriers en a besoin — à ouvrir **scopé** (missions de ses ouvriers) |
| `GET /missions` | **ROLE_OUVRIER** (scopé own) | §2.1 |
| `POST /missions` | GERANT, DEV_DIGITAL (+Resp_Ouvriers à confirmer) | crée en `PLANIFIE` ; pas de `statut` accepté |
| `PATCH /missions/:id/statut` → NOTIFIE | GERANT, DEV_DIGITAL, MGR_OPS, MGR_FILIALE, RESP_OUVRIERS | jamais ROLE_OUVRIER |
| `PATCH /missions/:id/statut` → ACCEPTE | **ouvrier affecté** (own) | §2.2 |
| `PATCH /missions/:id/statut` → RAPPORT_SOUMIS | **ouvrier affecté** (own) | §2.2 |
| `PATCH /missions/:id/statut` → VALIDE / TERMINE | GERANT, DEV_DIGITAL (validateur_id) | jamais ouvrier |
| `POST /missions/:id/affecter` | GERANT, DEV_DIGITAL, MGR_OPS, MGR_FILIALE, RESP_OUVRIERS | auto-`NOTIFIE` §2.5 |
| `POST /missions/pointages/*` | ouvrier affecté (own) | §2.3 |
| `POST /missions/photos` | ouvrier affecté (own) | §2.4 |
| `POST /missions/:id/pointages/verification` | RESP_OUVRIERS, GERANT, DEV_DIGITAL | validation `POINTAGE_A_VERIFIER → VALIDE/EN_COURS` |
| `GET /missions/:id/rapport` | GERANT, DEV_DIGITAL, MGR_*, RESP_OUVRIERS | jamais ouvrier (il écrit, il ne relit pas les rapports notés) |

Application systématique : un `ROLE_OUVRIER` sur un endpoint non listé = `403`
avec corps `{ "detail": "Accès refusé" }` — le corps de message est affiché
telle quelle à l'ouvrier si fourni.

## 4. Tests d'acceptation (curl)

Prérequis : deux tokens (`$TOKEN_OUVRIER` = compte ouvrier avec `profile_id` ;
`$TOKEN_GERANT`). `$MID` = id d'une mission de l'ouvrier.

```bash
# 1) Liste scopée ouvrier : contient ses missions, PAS celles d'un autre ouvrier
curl -sS -H "Authorization: Bearer $TOKEN_OUVRIER" \
  https://wugames-holding-inc.vercel.app/api/v1/missions \
  | jq '[.[].ouvrier_id] | unique'

# 2) Ouvrier accepte une mission NOTIFIE → 200/201, statut ACCEPTE
curl -sS -X PATCH -H "Authorization: Bearer $TOKEN_OUVRIER" \
  -H "Content-Type: application/json" \
  -d '{"statut":"ACCEPTE"}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/$MID/statut

# 3) Ouvrier tente VALIDE → 403 (jamais permis)
curl -sS -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_OUVRIER" \
  -H "Content-Type: application/json" -d '{"statut":"VALIDE"}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/$MID/statut   # 403

# 4) Ouvrier tente une mission d'un autre ouvrier → 403/404
curl -sS -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_OUVRIER" \
  -H "Content-Type: application/json" -d '{"statut":"ACCEPTE"}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/$MID_AUTRE/statut

# 5) Rapport sans texte → 400 ; avec texte → 200
curl -sS -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_OUVRIER" \
  -H "Content-Type: application/json" -d '{"statut":"RAPPORT_SOUMIS"}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/$MID/statut   # 400
curl -sS -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_OUVRIER" \
  -H "Content-Type: application/json" -d '{"statut":"RAPPORT_SOUMIS","rapport_texte":"Travaux terminés, conformes au plan."}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/$MID/statut   # 200

# 6) Pointage arrivée → si hors rayon : statut POINTAGE_A_VERIFIER + hors_rayon=true
curl -sS -X POST -H "Authorization: Bearer $TOKEN_OUVRIER" -H "Content-Type: application/json" \
  -d '{"mission_id":"'$MID'","latitude":5.36,"longitude":-4.01}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/pointages/arrivee

# 7) Photo d'un ouvrier non affecté → 403
curl -sS -o /dev/null -w "%{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN_OUVRIBIS" \
  -H "Content-Type: application/json" \
  -d '{"mission_id":"'$MID'","storage_url":"https://cdn.example.com/p.jpg"}' \
  https://wugames-holding-inc.vercel.app/api/v1/missions/photos
```

Critères de passage : 1⇒ uniquement `profile_id` de l'appelant ; 2⇒ 2xx ;
3⇒ 403 ; 4⇒ 403/404 ; 5⇒ 400 puis 2xx ; 6⇒ 201 + `hors_rayon` cohérent ;
7⇒ 403.

## 5. Deux questions ouvertes

1. §2.3(3) : où mettez-vous la transition après un **départ** pointé (`EN_COURS`
   reste-t-il, ou passe-t-on direct en `POINTAGE_A_VERIFIER` et c'est la validation
   finale qui pousse à `VALIDE`) ? Le frontend suit la réponse serveur.
2. `GET /missions` pour `RESP_OUVRIERS` : peut-on l'ouvrir scopé (missions attribuées
   aux ouvriers de sa filiale/équipe) ? Le module « Ouvriers » en dépend pour les
   actions d'encadrement.
