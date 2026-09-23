# Guide Technique pour l'IA Frontend — Mise à Jour du Module Produits & Upload dans le Dashboard Admin

Ce document est un **cahier des charges opérationnel pas-à-pas** destiné à une IA ou un développeur frontend chargé de mettre à jour le **Dashboard Administrateur** (`Wugames-Company`).

---

## 1. Contexte & Objectifs

Le backend NestJS / PostgreSQL (Supabase) a été mis à jour pour supporter :
1. **L'ajout d'une image obligatoire/recommandée sur chaque produit** : soit par **upload direct de fichier** (PNG, JPG, WEBP, GIF, max 5 Mo), soit par **lien direct URL** (ex: Unsplash, CDN).
2. **Le découplage total de la filiale et du fournisseur** : il est désormais possible de choisir **« Aucun »** (ou laisser vide / `null`) pour `filiale_id` et `fournisseur_id`. Le produit est alors un produit du catalogue global de la holding.
3. **La catégorisation selon les 15 catégories officielles** du catalogue général WUGAMS.
4. **Le filtrage par catégorie** sur les listes de produits.

---

## 2. Spécification des Contrats d'API Backend

**Base URL** : `http://localhost:3000/api/v1` (dev) ou `https://wugames-holding-inc.vercel.app/api/v1` (prod)  
**Header Auth requis** : `Authorization: Bearer <access_token>`

### 2.1. Upload d'une Image Produit (`POST /stocks/upload-image`)
- **Headers** : `Authorization: Bearer <token>`
- **Content-Type** : `multipart/form-data`
- **Body** :
  - Champ binaire : `image` (ou `file`)
  - OU JSON `{ "image_url": "https://..." }` pour validation d'une URL existante.
- **Réponse (201 Created)** :
  ```json
  {
    "url": "http://localhost:3000/uploads/produits/prod-1790167036851-803e1d2157a7.png",
    "relative_url": "/uploads/produits/prod-1790167036851-803e1d2157a7.png",
    "filename": "prod-1790167036851-803e1d2157a7.png",
    "original_name": "perceuse.png",
    "size": 65420,
    "mimetype": "image/png"
  }
  ```

### 2.2. Création de Produit (`POST /stocks/produits`)
- **Content-Type** : `application/json`
- **Payload** :
  ```json
  {
    "nom": "Tournevis plats et cruciformes",
    "reference": "OUT-TOU-001",
    "categorie": "OUTILS DE BRICOLAGE & MAÇONNERIE",
    "prix_unitaire": 7500,
    "quantite_actuelle": 50,
    "stock_minimum": 10,
    "description": "Jeu de tournevis ergonomiques en acier chrome-vanadium.",
    "filiale_id": null,
    "fournisseur_id": null,
    "image_url": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600"
  }
  ```
  > [!IMPORTANT]
  > Pour `filiale_id` et `fournisseur_id` : vous pouvez envoyer `null`, `undefined`, `""` ou la chaîne `"aucun"`. Le backend les convertit automatiquement en `null`. Ne plus rendre ces champs obligatoires dans la validation frontend !

### 2.3. Modification de Produit (`PATCH /stocks/produits/:id`)
- **Content-Type** : `application/json`
- Accepte les mêmes champs que la création en optionnel. Permet de modifier le lien d'image `image_url` ou de réassigner / détacher la filiale (`filiale_id: null`).

### 2.4. Upload direct sur Produit existant (`POST /stocks/produits/:id/image`)
- **Content-Type** : `multipart/form-data`
- **Body** : `image=<fichier-binaire>`
- Associe immédiatement la nouvelle photo au produit et renvoie le produit mis à jour.

### 2.5. Liste des Produits (`GET /stocks/produits`)
- **Paramètres de requête (Query params)** :
  - `?categorie=QUINCAILLERIE+%26+FIXATION` (filtre par catégorie)
  - `?filiale_id=uuid` (filtre par filiale)
  - `?statut=DISPONIBLE`

---

## 3. Liste Officielle des 15 Catégories

À utiliser pour les menus déroulants (`<select>` ou `<Combobox>`) :

```typescript
export const CATEGORIES_PRODUITS = [
  'QUINCAILLERIE & FIXATION',
  'OUTILS DE BRICOLAGE & MAÇONNERIE',
  'PEINTURE & FINITION',
  'PLOMBERIE & SANITAIRE',
  'NETTOYAGE, HYGIÈNE & ENTRETIEN',
  'AUTOMOBILE & LAVAGE',
  'JARDINAGE',
  'SÉCURITÉ',
  'MATÉRIEL DE LABORATOIRE',
  'MATÉRIAUX DE CONSTRUCTION',
  'PAPETERIE & FOURNITURES',
  'ACCESSOIRES DE BUREAU',
  'ÉQUIPEMENTS DE PROTECTION',
  'ÉCLAIRAGE',
  'PETITS ARTICLES POUR LA MAISON',
] as const;

export type CategorieProduit = typeof CATEGORIES_PRODUITS[number];
```

---

## 4. Interfaces TypeScript à mettre à jour côté Frontend

```typescript
export interface Produit {
  id: string;
  nom: string;
  reference: string;
  description?: string | null;
  categorie?: string | null;
  prix_unitaire: number;
  quantite_actuelle: number;
  stock_minimum: number;
  statut: 'DISPONIBLE' | 'REAPPROVISIONNEMENT_REQUIS' | 'COMMANDE_EN_COURS' | 'RUPTURE' | 'ARCHIVE';
  image_url?: string | null;
  filiale_id?: string | null;
  fournisseur_id?: string | null;
  filiale?: { id: string; nom: string; code: string } | null;
  fournisseur?: { id: string; raison_sociale: string } | null;
  created_at: string;
  updated_at: string;
}

export interface ProduitFormData {
  nom: string;
  reference: string;
  categorie: string;
  prix_unitaire: number;
  quantite_actuelle: number;
  stock_minimum: number;
  description?: string;
  filiale_id?: string | null;
  fournisseur_id?: string | null;
  image_url?: string | null;
}
```

---

## 5. Modifications UI / UX à implémenter dans le Dashboard

### 5.1. Formulaire d'Ajout / Édition de Produit (Modal ou Page)

#### A. Sélecteur d'Image Double Mode (Upload Fichier OU Lien URL)
Ajouter un composant à deux onglets (Tabs ou Switch) :
1. **Onglet 1 : « Téléverser un fichier » (Fichier local)** :
   - Zone de Drag & Drop ou bouton stylé « Parcourir » acceptant `.jpg, .jpeg, .png, .webp`.
   - Dès la sélection d'un fichier :
     - Appel immédiat vers `POST /api/v1/stocks/upload-image` avec `FormData`.
     - Indicateur de chargement (spinner / barre de progression).
     - Dès que l'API renvoie `{ url }`, renseigner la valeur dans `formData.image_url` et afficher une prévisualisation de la photo.
2. **Onglet 2 : « Lien d'image direct » (URL externe)** :
   - Champ de texte standard `<input type="url" placeholder="https://images.unsplash.com/..." />`.
   - Dès la saisie, afficher un aperçu de l'image en direct.
   - Gérer `onError` sur la balise `<img>` pour afficher un fallback si l'URL est invalide.

#### B. Sélecteur de Catégorie
- Remplacer tout champ texte libre par un `<select>` ou un sélecteur moderne contenant les **15 catégories officielles** listées dans `CATEGORIES_PRODUITS`.
- Valeur par défaut : première catégorie ou « Sélectionner une catégorie ».

#### C. Sélecteurs Filiale & Fournisseur
- Modifier la validation du formulaire : **ces champs ne doivent plus être requis** (`required: false`).
- Ajouter la première option : `<option value="">Aucune filiale (Catalogue global holding)</option>`.
- Idem pour le fournisseur : `<option value="">Aucun fournisseur</option>`.
- Si l'utilisateur choisit cette option vide, envoyer `filiale_id: null` (ou `"aucun"`).

---

### 5.2. Exemple de Composant d'Upload Réutilisable (React / Next.js)

```tsx
import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProductImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  token: string;
  apiUrl?: string;
}

export function ProductImageUploader({
  value,
  onChange,
  token,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
}: ProductImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif|avif)$/i)) {
      setError('Format non supporté (JPEG, PNG, WEBP, GIF acceptés)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Taille maximale autorisée : 5 Mo');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${apiUrl}/stocks/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Échec de l’upload de l’image');
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Photo du produit</label>
        <div className="flex rounded-lg border p-1 bg-gray-50 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
              mode === 'upload' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-gray-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Fichier
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
              mode === 'url' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-gray-500'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Lien URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition cursor-pointer relative bg-gray-50/50">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileUpload}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {loading ? (
            <div className="flex flex-col items-center justify-center py-2 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin mb-1" />
              <span className="text-xs">Téléversement en cours...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-gray-500">
              <Upload className="w-6 h-6 mb-1 text-gray-400" />
              <span className="text-xs font-medium">Glisser-déposer ou cliquer pour choisir une image</span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WEBP jusqu’à 5 Mo</span>
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          placeholder="https://images.unsplash.com/photo-..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {value && (
        <div className="relative rounded-lg overflow-hidden border w-24 h-24 bg-gray-100 mt-2">
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Invalide';
            }}
          />
        </div>
      )}
    </div>
  );
}
```

---

### 5.3. Tableau de Liste des Produits (Tableau & Cartes)

Dans le composant affichant la liste des produits :
1. **Ajouter une colonne « Image »** :
   - Miniature ronde ou carrée `w-10 h-10 rounded-lg object-cover`.
   - Si `image_url` est vide ou null, afficher une icône par défaut (`<Package className="w-5 h-5 text-gray-400" />`).
2. **Ajouter un badge « Catégorie »** :
   - Affiche le nom de la catégorie (ex: badge bleu/gris clair).
3. **Affichage Filiale** :
   - Si `produit.filiale` existe : afficher `produit.filiale.nom`.
   - Si `produit.filiale` est null : afficher **« Holding WUGAMS (Global) »** en italique ou gris.
4. **Filtre par Catégorie au-dessus de la table** :
   - Ajouter un `<select>` permettant de filtrer les produits par catégorie :
     ```typescript
     const handleCategoryFilter = (cat: string) => {
       fetchProducts(cat ? { categorie: cat } : {});
     };
     ```

---

## 6. Checklist de Validation pour l'IA Frontend

- [ ] Les types TypeScript du produit incluent `image_url?: string | null` et `categorie?: string | null`.
- [ ] Le formulaire de création permet d'uploader une image OU de renseigner un lien direct.
- [ ] Le formulaire de création propose un dropdown des 15 catégories.
- [ ] Le formulaire de création autorise `filiale_id` et `fournisseur_id` vides / non renseignés sans bloquer la validation.
- [ ] L'image est correctement affichée dans la liste des produits du tableau.
- [ ] Un sélecteur de filtre par catégorie est fonctionnel au-dessus de la liste.
- [ ] La modification d'un produit (`PATCH`) permet de changer l'image et la catégorie.
