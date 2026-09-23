import { describe, expect, it } from "vitest";

import { CATEGORIES_PRODUITS, type Produit } from "@/app/lib/contracts";
import { produitRow } from "@/app/lib/module-data";

describe("Produits & Stocks Module Specifications", () => {
  it("définit exactement les 15 catégories officielles de la holding", () => {
    expect(CATEGORIES_PRODUITS).toHaveLength(15);
    expect(CATEGORIES_PRODUITS).toContain("QUINCAILLERIE & FIXATION");
    expect(CATEGORIES_PRODUITS).toContain("OUTILS DE BRICOLAGE & MAÇONNERIE");
    expect(CATEGORIES_PRODUITS).toContain("PEINTURE & FINITION");
    expect(CATEGORIES_PRODUITS).toContain("PLOMBERIE & SANITAIRE");
    expect(CATEGORIES_PRODUITS).toContain("NETTOYAGE, HYGIÈNE & ENTRETIEN");
    expect(CATEGORIES_PRODUITS).toContain("AUTOMOBILE & LAVAGE");
    expect(CATEGORIES_PRODUITS).toContain("JARDINAGE");
    expect(CATEGORIES_PRODUITS).toContain("SÉCURITÉ");
    expect(CATEGORIES_PRODUITS).toContain("MATÉRIEL DE LABORATOIRE");
    expect(CATEGORIES_PRODUITS).toContain("MATÉRIAUX DE CONSTRUCTION");
    expect(CATEGORIES_PRODUITS).toContain("PAPETERIE & FOURNITURES");
    expect(CATEGORIES_PRODUITS).toContain("ACCESSOIRES DE BUREAU");
    expect(CATEGORIES_PRODUITS).toContain("ÉQUIPEMENTS DE PROTECTION");
    expect(CATEGORIES_PRODUITS).toContain("ÉCLAIRAGE");
    expect(CATEGORIES_PRODUITS).toContain("PETITS ARTICLES POUR LA MAISON");
  });

  it("produitRow gère correctement un produit de la holding sans filiale assignée", () => {
    const globalProduit: Produit = {
      id: "prod-global-1",
      nom: "Tournevis Haute Précision",
      reference: "OUT-001",
      description: "Outil pro",
      categorie: "OUTILS DE BRICOLAGE & MAÇONNERIE",
      prix_unitaire: 12000,
      quantite_actuelle: 42,
      stock_minimum: 10,
      statut: "DISPONIBLE",
      image_url: "https://images.unsplash.com/photo-test",
      filiale_id: null,
      fournisseur_id: null,
      filiale: null,
      fournisseur: null,
      created_at: "2026-09-23T12:00:00Z",
      updated_at: "2026-09-23T12:00:00Z",
    };

    const row = produitRow(globalProduit);

    expect(row.id).toBe("prod-global-1");
    expect(row.image).toBe("https://images.unsplash.com/photo-test");
    expect(row.produit).toBe("Tournevis Haute Précision · OUT-001");
    expect(row.catégorie).toBe("OUTILS DE BRICOLAGE & MAÇONNERIE");
    expect(row.dépôt).toBe("Holding WUGAMS (Global)");
    expect(row.disponible).toBe("42 unités");
    expect(row.seuil).toBe("10 unités");
    expect(row._raw).toBe(globalProduit);
  });

  it("produitRow affiche la filiale quand elle est renseignée", () => {
    const localProduit: Produit = {
      id: "prod-local-2",
      nom: "Perceuse sans fil",
      reference: "OUT-002",
      categorie: "OUTILS DE BRICOLAGE & MAÇONNERIE",
      prix_unitaire: 45000,
      quantite_actuelle: 5,
      stock_minimum: 8,
      statut: "REAPPROVISIONNEMENT_REQUIS",
      image_url: null,
      filiale_id: "filiale-abidjan",
      filiale: { id: "filiale-abidjan", nom: "Wugames BTP Abidjan", code: "WUG-ABJ" },
      created_at: "2026-09-23T12:00:00Z",
      updated_at: "2026-09-23T12:00:00Z",
    };

    const row = produitRow(localProduit);

    expect(row.dépôt).toBe("Wugames BTP Abidjan");
    expect(row.image).toBe("");
  });

  it("produitRow affiche 'Non catégorisé' si la catégorie est absente", () => {
    const uncategorizedProduit: Produit = {
      id: "prod-3",
      nom: "Produit générique",
      reference: "GEN-001",
      prix_unitaire: 1000,
      quantite_actuelle: 10,
      stock_minimum: 2,
      statut: "DISPONIBLE",
      created_at: "2026-09-23T12:00:00Z",
      updated_at: "2026-09-23T12:00:00Z",
    };

    const row = produitRow(uncategorizedProduit);
    expect(row.catégorie).toBe("Non catégorisé");
  });
});
