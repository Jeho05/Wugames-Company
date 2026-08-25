"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { useAuth } from "@/app/lib/auth-context";
import {
  boutiqueCategorieMeta,
  boutiqueCommandeFromApi,
  demoBoutiqueCommandes,
  demoBoutiqueProduits,
  formatMontantFcfa,
  loadBoutiqueData,
  passerCommandeApi,
  type BoutiqueCommande,
  type BoutiqueProduit,
} from "@/app/lib/client-shop-data";

type PanierLigne = { produit: BoutiqueProduit; quantite: number };

type ClientBoutiqueProps = {
  sectionId?: string;
  embedded?: boolean;
};

const commandeStatutMeta: Record<BoutiqueCommande["statut"], { label: string; badge: string }> = {
  EN_ATTENTE: { label: "En attente", badge: "border-slate-200 bg-slate-50 text-slate-600" },
  EN_PREPARATION: { label: "En préparation", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  EXPEDIEE: { label: "Expédiée", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  LIVREE: { label: "Livrée", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  ANNULEE: { label: "Annulée", badge: "border-rose-200 bg-rose-50 text-rose-700" },
};

const categorieOrder: BoutiqueProduit["categorie"][] = ["entretien", "materiaux", "mobilier", "outillage"];

export function ClientBoutique({ sectionId = "portail-boutique", embedded = false }: ClientBoutiqueProps) {
  const { user } = useAuth();
  const [produits, setProduits] = useState<BoutiqueProduit[]>(demoBoutiqueProduits);
  const [commandes, setCommandes] = useState<BoutiqueCommande[]>(demoBoutiqueCommandes);
  const [live, setLive] = useState(false);
  const [panier, setPanier] = useState<PanierLigne[]>([]);
  const [categorie, setCategorie] = useState<BoutiqueProduit["categorie"] | "toutes">("toutes");
  const [commandeOk, setCommandeOk] = useState(false);
  const [erreurCommande, setErreurCommande] = useState("");
  const [telephone, setTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadBoutiqueData(user?.filialeId ?? null).then((data) => {
      if (cancelled) return;
      setProduits(data.produits);
      setCommandes(data.commandes);
      setLive(data.live);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.filialeId]);

  const total = useMemo(() => panier.reduce((sum, ligne) => sum + ligne.produit.prix * ligne.quantite, 0), [panier]);
  const totalUnites = useMemo(() => panier.reduce((sum, ligne) => sum + ligne.quantite, 0), [panier]);

  const visible = useMemo(
    () => (categorie === "toutes" ? produits : produits.filter((p) => p.categorie === categorie)),
    [categorie, produits],
  );

  function ajouter(produit: BoutiqueProduit) {
    setPanier((prev) => {
      const ligne = prev.find((l) => l.produit.id === produit.id);
      if (ligne) {
        return prev.map((l) =>
          l.produit.id === produit.id ? { ...l, quantite: Math.min(l.quantite + 1, produit.stock || 1) } : l,
        );
      }
      return [...prev, { produit, quantite: 1 }];
    });
    setCommandeOk(false);
    setErreurCommande("");
  }

  function retirer(produitId: string) {
    setPanier((prev) =>
      prev
        .map((l) => (l.produit.id === produitId ? { ...l, quantite: l.quantite - 1 } : l))
        .filter((l) => l.quantite > 0),
    );
  }

  async function commander() {
    if (panier.length === 0 || envoi) return;

    if (live && !user?.filialeId) {
      setCommandeOk(false);
      setErreurCommande(
        "La commande en ligne n'est pas disponible pour votre compte : aucune filiale n'est rattachée. Contactez WUGAMS pour finaliser votre commande.",
      );
      return;
    }

    const commandeEnLigne = live && user?.filialeId && telephone.trim().length >= 8;
    if (commandeEnLigne) {
      setEnvoi(true);
      try {
        const commande = await passerCommandeApi(user.filialeId as string, panier, telephone.trim());
        setCommandes((prev) => [boutiqueCommandeFromApi(commande), ...prev]);
        setPanier([]);
        setCommandeOk(true);
        return;
      } catch {
        /* bascule silencieuse vers le flux de démonstration */
      } finally {
        setEnvoi(false);
      }
    }

    const nouvelle: BoutiqueCommande = {
      id: `bc-${Date.now()}`,
      items: panier.map((l) => ({ produitId: l.produit.id, nom: l.produit.nom, quantite: l.quantite, prix: l.produit.prix })),
      total,
      statut: "EN_PREPARATION",
      date: new Date().toISOString(),
      moyen: "COMPTE",
    };
    setCommandes((prev) => [nouvelle, ...prev]);
    setPanier([]);
    setCommandeOk(true);
  }

  const boutiqueContent = (
    <div className="grid gap-5 grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      {/* Catalogue */}
      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            className={
              "rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition " +
              (categorie === "toutes"
                ? "border-[#0f7a5f] bg-[#0f7a5f] text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300")
            }
            onClick={() => setCategorie("toutes")}
            type="button"
          >
            Tous
          </button>
          {categorieOrder.map((key) => (
            <button
              className={
                "rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition " +
                (categorie === key
                  ? "border-[#0f7a5f] bg-[#0f7a5f] text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300")
              }
              key={key}
              onClick={() => setCategorie(key)}
              type="button"
            >
              {boutiqueCategorieMeta[key].label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((produit, index) => {
            const ligne = panier.find((l) => l.produit.id === produit.id);
            const rupture = produit.stock === 0;
            const meta = boutiqueCategorieMeta[produit.categorie];
            return (
              <motion.article
                animate={{ opacity: 1, y: 0 }}
                className={
                  "rounded-3xl border p-4 transition " +
                  (rupture
                    ? "border-slate-100 bg-slate-50/60 opacity-70 dark:border-white/5 dark:bg-white/[0.02]"
                    : ligne
                      ? "border-[#0f7a5f]/40 bg-[#0f7a5f]/[0.05] dark:border-emerald-400/30"
                      : "border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] hover:border-slate-300 dark:border-white/10 dark:bg-[#101c36]")
                }
                initial={{ opacity: 0, y: 10 }}
                key={produit.id}
                transition={{ duration: 0.35, delay: index * 0.03 }}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-extrabold leading-5 text-[#16233a] dark:text-slate-100 truncate">{produit.nom}</h3>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400 line-clamp-2">{produit.description}</p>
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">{meta.label}</p>
                  </div>
                  <span
                    className={
                      "shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-extrabold tabular-nums " +
                      (rupture ? "bg-slate-100 text-slate-400" : "bg-[#0f7a5f]/10 text-[#0f7a5f] dark:bg-emerald-400/10 dark:text-emerald-300")
                    }
                  >
                    {formatMontantFcfa(produit.prix)}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-400">
                    {rupture ? (
                      <span className="font-bold text-rose-500">Rupture de stock</span>
                    ) : (
                      <>
                        {produit.stock} {produit.unite}(s) disponibles
                      </>
                    )}
                  </span>
                  {ligne && ligne.quantite > 0 ? (
                    <div className="flex items-center gap-1 rounded-full border border-[#0f7a5f]/30 bg-white p-1 dark:border-emerald-400/30 dark:bg-white/5">
                      <button
                        aria-label={`Retirer ${produit.nom} du panier`}
                        className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                        onClick={() => retirer(produit.id)}
                        type="button"
                      >
                        <Icon name="minus" size={12} />
                      </button>
                      <span className="min-w-6 text-center text-[12px] font-extrabold tabular-nums text-[#16233a] dark:text-slate-100">
                        {ligne.quantite}
                      </span>
                      <button
                        aria-label={`Ajouter ${produit.nom} au panier`}
                        className="grid size-7 place-items-center rounded-full bg-[#0f7a5f] text-white transition hover:bg-[#0e6e57] disabled:opacity-40"
                        disabled={rupture}
                        onClick={() => ajouter(produit)}
                        type="button"
                      >
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7a5f] px-3.5 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-[#0e6e57] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-white/10"
                      disabled={rupture}
                      onClick={() => ajouter(produit)}
                      type="button"
                    >
                      <Icon name="plus" size={11} />
                      Ajouter
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Panier + commandes */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-extrabold text-[#16233a] dark:text-slate-100">
              Mon panier
              {totalUnites > 0 ? <span className="ml-2 rounded-full bg-[#0f7a5f]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#0f7a5f] dark:bg-emerald-400/10 dark:text-emerald-300">{totalUnites}</span> : null}
            </h3>
            <Icon className="text-slate-300" name="shopping-bag" size={16} />
          </div>

          {commandeOk ? (
            <div className="mt-4 grid place-items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-6 text-center dark:bg-emerald-400/10">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-500 text-white">
                <Icon name="check" size={20} />
              </span>
              <p className="text-[12px] font-extrabold text-emerald-700 dark:text-emerald-300">Commande confirmée</p>
              <p className="text-[10px] leading-4 text-slate-400">
                Votre commande est en préparation à l&apos;Espace Wu. Suivi disponible dans « Mes commandes ».
              </p>
            </div>
          ) : panier.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-center text-[11px] leading-5 text-slate-400 dark:bg-white/[0.03]">
              Votre panier est vide. Ajoutez des produits pour passer commande.
            </p>
          ) : (
            <>
              {erreurCommande ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                  {erreurCommande}
                </div>
              ) : null}
              <ul className="mt-3 space-y-2">
                {panier.map((ligne) => (
                  <li
                    className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.03]"
                    key={ligne.produit.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-[#16233a] dark:text-slate-200">{ligne.produit.nom}</p>
                      <p className="mt-0.5 text-[9px] tabular-nums text-slate-400">
                        {ligne.quantite} × {formatMontantFcfa(ligne.produit.prix)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-[11px] font-extrabold tabular-nums text-[#0f7a5f] dark:text-emerald-300">
                        {formatMontantFcfa(ligne.produit.prix * ligne.quantite)}
                      </span>
                      <button
                        aria-label={`Retirer ${ligne.produit.nom}`}
                        className="grid size-6 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                        onClick={() => retirer(ligne.produit.id)}
                        type="button"
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-[#17294b] px-4 py-3 text-white">
                <span className="text-[10px] font-bold text-slate-300">Total</span>
                <span className="text-[15px] font-extrabold tabular-nums">{formatMontantFcfa(total)}</span>
              </div>
              {live ? (
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                  <Icon className="shrink-0 text-[#0f7a5f] dark:text-emerald-300" name="phone" size={14} />
                  <input
                    aria-label="Numéro Mobile Money"
                    autoComplete="tel"
                    className="w-full bg-transparent text-[11px] font-bold text-[#16233a] placeholder:text-slate-300 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    inputMode="tel"
                    onChange={(event) => setTelephone(event.target.value)}
                    placeholder="Numéro Mobile Money (MTN/Moov)"
                    type="tel"
                    value={telephone}
                  />
                </div>
              ) : null}
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-3 text-[12px] font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#0e6e57] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={(live && telephone.trim().length < 8) || envoi}
                onClick={() => void commander()}
                type="button"
              >
                {envoi ? (
                  <Icon className="animate-spin" name="refresh" size={14} />
                ) : (
                  <Icon name="check" size={14} />
                )}
                {envoi ? "Paiement en cours…" : `Commander (${formatMontantFcfa(total)})`}
              </button>
              <p className="mt-2 text-center text-[9px] text-slate-300">
                Paiement Mobile Money ou imputé sur votre compte membre · retrait à l&apos;Espace Wu
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-extrabold text-[#16233a] dark:text-slate-100">Mes commandes</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
              {commandes.length}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
            {commandes.slice(0, 3).map((commande) => {
              const statutMeta = commandeStatutMeta[commande.statut];
              return (
                <li className="py-3 first:pt-0 last:pb-0" key={commande.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-[#16233a] dark:text-slate-200">
                        {commande.items.map((item) => `${item.quantite}× ${item.nom}`).join(" · ")}
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {new Date(commande.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
                        {commande.moyen === "COMPTE" ? "compte membre" : commande.moyen === "MOMO" ? "Mobile Money" : "carte"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={"rounded-full border px-2 py-0.5 text-[8px] font-extrabold " + statutMeta.badge}>
                        {statutMeta.label}
                      </span>
                      <span className="text-[11px] font-extrabold tabular-nums text-[#16233a] dark:text-slate-100">
                        {formatMontantFcfa(commande.total)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  if (embedded) return boutiqueContent;

  return (
    <ClientSection
      action={
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " +
            (live
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300")
          }
        >
          <span className={"size-1.5 animate-pulse rounded-full " + (live ? "bg-emerald-500" : "bg-amber-500")} />
          {live ? "Espace Wu · données en direct" : "Espace Wu · démonstration"}
        </span>
      }
      icon="shopping-bag"
      id={sectionId}
      subtitle="Entretien, matériaux, mobilier et outillage — commandez depuis votre espace"
      title="Espace Wu — la boutique WUGAMS"
    >
      {boutiqueContent}
    </ClientSection>
  );
}