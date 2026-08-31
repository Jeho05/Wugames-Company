"use client";

import { useEffect, useState, useCallback } from "react";
import * as vitrineApi from "@/app/lib/api/vitrine";

function useVitrineResource<T>(fetcher: () => Promise<T[]>, filter?: (items: T[]) => T[]) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const list = await fetcher();
      setData(filter ? filter(list) : list);
      setError(null);
    } catch (e) {
      console.error("[vitrine]", e);
      setData([]);
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }, [fetcher, filter]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    const t = setTimeout(() => {
      if (data === null) {
        setData([]);
        setError("Timeout");
      }
    }, 5000);
    return () => {
      clearTimeout(t);
      window.removeEventListener("wugams:vitrine:change", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return { data, refresh, loading: data === null, error };
}

export function useTemoignages() {
  return useVitrineResource(() => vitrineApi.listTemoignages(), (list) => list.filter((t) => t.is_published));
}

export function useServices() {
  return useVitrineResource(() => vitrineApi.listServices(), (list) => list.filter((s) => s.is_published).sort((a, b) => a.order - b.order));
}

export function useGaranties() {
  return useVitrineResource(() => vitrineApi.listGaranties(), (list) => list.filter((g) => g.is_published).sort((a, b) => a.order - b.order));
}

export function useRealisations() {
  return useVitrineResource(() => vitrineApi.listRealisations(), (list) => list.filter((r) => r.is_published));
}

export function useBlogPosts() {
  return useVitrineResource(() => vitrineApi.listBlogPosts(), (list) => list.filter((p) => p.is_published));
}

export function useMarquee() {
  return useVitrineResource(() => vitrineApi.listMarquee(), (list) => list.filter((m) => m.is_published).sort((a, b) => a.order - b.order));
}

export function useBoutiqueProduits() {
  const [data, setData] = useState<import("@/app/lib/contracts").Produit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled && data === null) {
        setData([]);
        setError("Timeout");
      }
    }, 5000);
    // Public catalogue via /vitrine/produits (auth:false), fallback to /stocks/produits si vide
    import("@/app/lib/api/vitrine")
      .then(({ listProduitsPublic }) => listProduitsPublic())
      .then((produits) => {
        if (cancelled) return;
        if (produits.length > 0) {
          // Map VitrineProduitPublic -> Produit minimal
          const mapped = produits.map((p) => ({
            id: p.id,
            nom: p.nom,
            description: p.description ?? null,
            reference: p.reference,
            prix_unitaire: p.prix_unitaire,
            quantite_actuelle: p.quantite_actuelle,
            stock_minimum: p.stock_minimum,
            statut: (p.statut as import("@/app/lib/contracts").ProduitStatut) ?? "DISPONIBLE",
            adresse_reference_lat: null,
            adresse_reference_lng: null,
            filiale_id: p.filiale?.id ?? "",
            fournisseur_id: null,
            created_at: p.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
            filiale: p.filiale ?? undefined,
          })) as import("@/app/lib/contracts").Produit[];
          setData(mapped.filter((p) => p.statut !== "ARCHIVE"));
          setError(null);
        } else {
          // Fallback vers stocks (nécessite auth, pour les sessions connectées)
          return import("@/app/lib/api/stocks").then(({ listProduits }) => listProduits()).then((produits2) => {
            if (!cancelled) {
              setData(produits2.filter((p) => p.statut !== "ARCHIVE"));
              setError(null);
            }
          });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("[boutique]", e);
          // Dernier fallback : stocks
          import("@/app/lib/api/stocks")
            .then(({ listProduits }) => listProduits())
            .then((produits2) => {
              if (!cancelled) setData(produits2.filter((p) => p.statut !== "ARCHIVE"));
            })
            .catch(() => {
              if (!cancelled) setData([]);
            });
          setError(e instanceof Error ? e.message : "Erreur");
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);
  return { data, loading: data === null, error };
}
