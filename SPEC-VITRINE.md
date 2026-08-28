# SPEC VITRINE DYNAMIQUE — WUGAMS (v1)

> Tout le contenu public est désormais **100 % dynamique**. Aucune donnée mockée n’est affichée : si l’API renvoie un tableau vide, la section est masquée. Le Gérant est propriétaire de tous les contenus et peut déléguer la permission à n’importe quel rôle/utilisateur. Le front ne perd aucun travail visuel : seules les sources de données changent.

---

## 1. Principe : hide-if-empty + localStorage interim

- **Front** : `app/lib/api/vitrine.ts` tente d’abord `GET /api/v1/vitrine/*` (sans auth). En cas d’échec (404/500/offline), il retombe sur `localStorage` (`app/lib/vitrine-store.ts`). Dès que le backend répond `200`, aucune modif front n’est nécessaire.
- **UX** : Pages publiques (`/`, `/boutique`, `/blog`, `/realisations`) :
  - `loading` → skeleton
  - `data.length === 0` → section masquée (ou empty state élégant avec CTA, jamais de mock)
- **Cartes** : tous les composants visuels existants (`SpotlightCard`, grilles, etc.) sont conservés — seule la prop `data` devient dynamique.

---

## 2. Rôles & délégation

| Rôle | Peut voir vitrine publique | Peut gérer contenus vitrine |
|---|---|---|
| `ROLE_GERANT` | oui | **oui (par défaut, propriétaire)** |
| Tout autre rôle (`ROLE_SECRETAIRE`, `ROLE_MGR_*`, `ROLE_DEV_DIGITAL`, etc.) | oui | **seulement si délégué par le Gérant** |
| `ROLE_CLIENT_*`, `ROLE_OUVRIER`, `ROLE_FOURNISSEUR` | oui | non |

**Délégation UI** : `/espace/vitrine` → onglet *Permissions*. Le Gérant y voit la liste des utilisateurs (`GET /users`) avec un toggle par utilisateur. Stockage :
- Backend final : table `vitrine_permissions` (`id, user_id, granted_by, granted_at`) + `GET /vitrine/permissions`, `POST /vitrine/permissions { user_id }`, `DELETE /vitrine/permissions/:userId` (réservé Gérant).
- Interim front : `localStorage` clé `wugams:vitrine:permissions` (tableau d’`user.id`). Check via `canManageVitrine(user)` (`app/lib/vitrine-store.ts:canManageVitrine`).

**Navigation** : `BackOfficeShell` affiche le groupe *Vitrine* à tout utilisateur `canManageVitrine`, même sans être admin.

---

## 3. Ressources à implémenter côté backend

Toutes les routes sont **publiques en lecture (GET)**, **auth + permission vitrine en écriture**. Préfixe recommandé : `/api/v1/vitrine`.

### 3.1 Témoignages — `/vitrine/temoignages`

Avis clients avec **étoiles (rating)** affichés sur `/` et `/boutique`.

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/vitrine/temoignages?published=true` | non | `VitrineTemoignage[]` |
| GET | `/vitrine/temoignages/:id` | non | `VitrineTemoignage` |
| POST | `/vitrine/temoignages` | Gérant/délégué | `VitrineTemoignage` |
| PATCH | `/vitrine/temoignages/:id` | Gérant/délégué | `VitrineTemoignage` |
| DELETE | `/vitrine/temoignages/:id` | Gérant/délégué | `{ message }` |

```json
{
  "id": "uuid",
  "name": "Koffi Amara",
  "role": "Propriétaire, Résidence Cocody",
  "text": "Après 3 mauvaises expériences...",
  "image": "https://images.unsplash.com/...",
  "rating": 5,
  "is_published": true,
  "created_at": "2026-08-28T10:00:00.000Z",
  "updated_at": "2026-08-28T10:00:00.000Z"
}
```

- `rating` : 1..5 (étoiles)
- `is_published` : si `false`, masqué côté public mais visible en admin
- Pagination optionnelle : `{ data, meta }` accepté, front lit `T[]` si tableau brut

### 3.2 Services / Filiales (homepage) — `/vitrine/services`

Cartes de la section *« Une équipe, cinq expertises »*.

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/vitrine/services` | `VitrineService[]` |
| POST | `/vitrine/services` | `VitrineService` |
| PATCH | `/vitrine/services/:id` | `VitrineService` |
| DELETE | `/vitrine/services/:id` | `{ message }` |

```json
{
  "id": "uuid",
  "title": "Rénovation & Construction",
  "description": "Rénovation intérieure et extérieure...",
  "icon": "folder",
  "order": 1,
  "is_published": true,
  "created_at": "ISO"
}
```

- `icon` : `IconName` du design system (`folder`, `sparkles`, `boxes`, `hardhat`, `building`, `shield`, `check`, `clock`, `message`, etc.)
- `order` : tri croissant

### 3.3 Garanties / Engagements — `/vitrine/garanties`

Cartes *« Nos engagements »*.

```json
{
  "id": "uuid",
  "title": "Garantie de suivi et d'accompagnement",
  "text": "Notre engagement ne s'arrête pas à la fin des travaux...",
  "icon": "shield",
  "order": 1,
  "is_published": true,
  "created_at": "ISO"
}
```

Routes identiques à 3.2 (`/vitrine/garanties`).

### 3.4 Marquee — `/vitrine/marquee`

Bande défilante sous le hero.

```json
{ "id": "uuid", "label": "1 200+ projets livrés", "order": 1, "is_published": true }
```

### 3.5 Réalisations — `/vitrine/realisations`

Portfolio `/realisations`.

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/vitrine/realisations?filiale=&published=true` | `VitrineRealisation[]` |
| POST | `/vitrine/realisations` | `VitrineRealisation` |
| PATCH | `/vitrine/realisations/:id` | `VitrineRealisation` |
| DELETE | `/vitrine/realisations/:id` | `{ message }` |

```json
{
  "id": "uuid",
  "title": "Rénovation complète — Villa Cocody",
  "filiale": "Rénovation",
  "client": "Particulier",
  "location": "Cocody, Abidjan",
  "value": "38,5 M FCFA",
  "year": "2026",
  "image": "https://images.unsplash.com/...",
  "tags": ["Rénovation", "Finitions", "14 semaines"],
  "description": "Toiture, second œuvre...",
  "is_published": true,
  "created_at": "ISO"
}
```

- `filiale` : `Construction | Rénovation | Entretien | Mobilier | Matériaux`
- `tags` : tableau de strings

### 3.6 Blog — `/vitrine/blog`

Articles `/blog` et `/blog/[slug]`.

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/vitrine/blog?category=&published=true` | `VitrineBlogPost[]` |
| GET | `/vitrine/blog/:slug` | `VitrineBlogPost` |
| POST | `/vitrine/blog` | `VitrineBlogPost` |
| PATCH | `/vitrine/blog/:id` | `VitrineBlogPost` |
| DELETE | `/vitrine/blog/:id` | `{ message }` |

```json
{
  "id": "uuid",
  "slug": "renovation-reussie-7-reflexes",
  "title": "Rénovation réussie : les 7 réflexes avant de signer",
  "category": "Conseils",
  "author": "Équipe WUGAMS Rénovation",
  "date": "28 juillet 2026",
  "read_time": "6 min",
  "excerpt": "Avant de lancer un chantier...",
  "image": "https://images.unsplash.com/...",
  "content": ["Paragraphe 1...", "Paragraphe 2..."],
  "is_published": true,
  "created_at": "ISO"
}
```

- `slug` : unique, URL-safe
- `category` : `Conseils | Actualités | Réalisations | Boutique` (extensible)
- `content` : tableau de paragraphes (un par ligne côté admin)

### 3.7 Boutique (produits)

**Déjà couvert par `/stocks/produits`**. Pour la vitrine publique :

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/stocks/produits?published=true` | non (ou public) | `Produit[]` |

- Si l’endpoint reste `auth: true`, le front public le gère déjà : en cas de `401/403`, la grille affiche l’empty state *« Catalogue en préparation »* (hide-if-empty respecté).
- **Recommandation backend** : rendre `GET /stocks/produits` **public** ou créer `GET /vitrine/produits` qui proxy le stock publié, afin que la boutique publique affiche les vrais produits sans token.

### 3.8 Permissions vitrine — `/vitrine/permissions`

| Méthode | Route | Auth | Réponse |
|---|---|---|---|
| GET | `/vitrine/permissions` | Gérant | `{ user_ids: string[] }` |
| POST | `/vitrine/permissions` | Gérant | `{ user_ids }` body `{ user_id: string }` |
| DELETE | `/vitrine/permissions/:userId` | Gérant | `{ user_ids }` |

Alternative : inclure `can_manage_vitrine: boolean` dans `GET /users` / `GET /auth/me` (JWT).

---

## 4. Comportement front déjà en place

- `app/lib/api/vitrine.ts` : chaque fonction tente `apiFetch` puis fallback `localStorage`. Aucune donnée mock n’est codée en dur.
- `app/hooks/use-vitrine.ts` : `useTemoignages`, `useServices`, `useGaranties`, `useRealisations`, `useBlogPosts`, `useMarquee`, `useBoutiqueProduits` → `data === null` (loading) → skeleton, `data.length === 0` → section masquée.
- Pages dynamisées : `app/(public)/page.tsx`, `app/(public)/boutique/page.tsx`, `app/(public)/blog/page.tsx`, `app/(public)/blog/[slug]/page.tsx`, `app/(public)/realisations/page.tsx`.
- Atelier Gérant : `app/(workspace)/espace/vitrine/page.tsx` — CRUD complet par type + onglet Permissions. Accessible via *Administration → Vitrine & Contenus* (Gérant) ou *Vitrine* (délégués).
- `BackOfficeShell` : affiche le groupe Vitrine à tout `canManageVitrine`.
- Boutique cart : conserve `localStorage` clé `wugams-cart`, mapping `Produit` réel (`prix_unitaire`, `statut`, `quantite_actuelle`).

---

## 5. Migration des anciens mocks

Les anciens exports suivants **ne sont plus importés** côté vitrine (mais conservés pour ne pas casser le back-office) :

- `app/lib/content-data.ts:blogPosts`, `realisations` → remplacés par `vitrine/blog`, `vitrine/realisations`
- `app/lib/store-data.ts:products` → remplacé par `stocks/produits` (réel)
- `testimonials`, `services`, `guarantees` inline dans `app/(public)/page.tsx` → remplacés par `vitrine/*`

Si besoin de démo, le Gérant peut recréer ces contenus en 2 minutes depuis l’atelier vitrine. Un bouton *« Importer les démos »* pourra être ajouté en admin pour re-seeder.

---

## 6. TODO backend — checklist pour le dev

- [ ] Créer les 6 tables (`temoignages`, `services`, `garanties`, `realisations`, `blog_posts`, `marquee_items`) + `vitrine_permissions`.
- [ ] Exposer les routes `GET` publiques + `POST/PATCH/DELETE` protégées par `canManageVitrine`.
- [ ] Valider `icon` contre l’enum `IconName` front (ne pas casser le rendu).
- [ ] Rendre `GET /stocks/produits` public ou créer `GET /vitrine/produits`.
- [ ] Ajouter `GET /vitrine/permissions` et inclure le flag dans le JWT / `/auth/me`.
- [ ] Journaliser les mutations vitrine dans `audit_logs` (`table_cible: vitrine_*`).
- [ ] Prévoir `is_published` pour brouillons.

---

## 7. Esthétique

Aucune carte n’a été redessinée : `SpotlightCard`, `Marquee`, grilles, `TestimonialImage`, etc. restent identiques. Seule la source change. L’empty state utilise le même langage visuel (bordures pointillées, icônes `Icon`, tons `amber`/`slate`).
