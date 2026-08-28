"use client";

import { useEffect, useState, useCallback } from "react";
import * as vitrineApi from "@/app/lib/api/vitrine";

export function useTemoignages() {
  const [data, setData] = useState<vitrineApi.VitrineTemoignage[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listTemoignages();
    setData(list.filter((t) => t.is_published));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useServices() {
  const [data, setData] = useState<vitrineApi.VitrineService[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listServices();
    setData(list.filter((s) => s.is_published).sort((a, b) => a.order - b.order));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useGaranties() {
  const [data, setData] = useState<vitrineApi.VitrineGarantie[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listGaranties();
    setData(list.filter((g) => g.is_published).sort((a, b) => a.order - b.order));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useRealisations() {
  const [data, setData] = useState<vitrineApi.VitrineRealisation[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listRealisations();
    setData(list.filter((r) => r.is_published));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useBlogPosts() {
  const [data, setData] = useState<vitrineApi.VitrineBlogPost[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listBlogPosts();
    setData(list.filter((p) => p.is_published));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useMarquee() {
  const [data, setData] = useState<vitrineApi.VitrineMarqueeItem[] | null>(null);
  const refresh = useCallback(async () => {
    const list = await vitrineApi.listMarquee();
    setData(list.filter((m) => m.is_published).sort((a, b) => a.order - b.order));
  }, []);
  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener("wugams:vitrine:change", onChange);
    return () => window.removeEventListener("wugams:vitrine:change", onChange);
  }, [refresh]);
  return { data, refresh, loading: data === null };
}

export function useBoutiqueProduits() {
  const [data, setData] = useState<import("@/app/lib/contracts").Produit[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("@/app/lib/api/stocks").then(({ listProduits }) =>
      listProduits()
        .then((produits) => {
          if (!cancelled) setData(produits.filter((p) => p.statut !== "ARCHIVE"));
        })
        .catch(() => {
          if (!cancelled) setData([]);
        })
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return { data, loading: data === null };
}
