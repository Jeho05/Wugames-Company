"use client";

import { useMemo, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { createCommande, updateCommandeStatut } from "@/app/lib/api/commandes";
import { useAuth } from "@/app/lib/auth-context";
import type { Commande } from "@/app/lib/contracts";
import {
  demoSecProduits,
  demoSecVentes,
  formatMontantFcfa,
  venteModeMeta,
  type ProduitVente,
  type Vente,
} from "@/app/lib/secretary-data";

type SecretarySalesSpaceProps = {
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

type PanierLigne = { produit: ProduitVente; quantite: number };

const modeOptions: Vente["mode"][] = ["MOMO", "CARTE", "ESPECES", "COMPTE"];

export function SecretarySalesSpace({ onToast }: SecretarySalesSpaceProps) {
  const { user } = useAuth();
  const [produits] = useState<ProduitVente[]>(demoSecProduits);
  const [panier, setPanier] = useState<PanierLigne[]>([]);
  const [ventes, setVentes] = useState<Vente[]>(demoSecVentes);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mode, setMode] = useState<Vente["mode"] | null>(null);
  const [done, setDone] = useState(false);
  const [client, setClient] = useState("");
  const [encaissement, setEncaissement] = useState<Commande | null>(null);

  const total = useMemo(() => panier.reduce((sum, l) => sum + l.produit.prix * l.quantite, 0), [panier]);
  const totalUnites = useMemo(() => panier.reduce((sum, l) => sum + l.quantite, 0), [panier]);

  function ajouter(produit: ProduitVente) {
    setPanier((prev) => {
      const ligne = prev.find((l) => l.produit.id === produit.id);
      if (ligne) {
        return prev.map((l) =>
          l.produit.id === produit.id ? { ...l, quantite: Math.min(l.quantite + 1, produit.stock || 1) } : l,
        );
      }
      return [...prev, { produit, quantite: 1 }];
    });
  }

  function retirer(produitId: string) {
    setPanier((prev) =>
      prev
        .map((l) => (l.produit.id === produitId ? { ...l, quantite: l.quantite - 1 } : l))
        .filter((l) => l.quantite > 0),
    );
  }

  function ouvrirCheckout() {
    if (panier.length === 0) {
      onToast("Le panier est vide", "error");
      return;
    }
    setMode(null);
    setDone(false);
    setCheckoutOpen(true);
  }

  async function confirmerPaiement() {
    if (!mode) return;
    setEncaissement(null);
    try {
      const commande = await createCommande({
        filiale_id: user?.filialeId ?? "",
        lignes: panier.map((l) => ({
          produit_id: l.produit.id,
          quantite: l.quantite,
          prix_unitaire: l.produit.prix,
        })),
      });
      setEncaissement(commande);
      if (mode !== "COMPTE") {
        try {
          await updateCommandeStatut(commande.id, "EXPEDIEE");
        } catch {
          /* la commande existe : la transition d'état n'est pas bloquante. */
        }
      }
    } catch {
      /* API injoignable : la vente reste locale (mode démo). */
      setEncaissement(null);
    } finally {
      setDone(true);
    }
  }

  function finaliser() {
    if (!mode) return;
    const nouvelle: Vente = {
      id: encaissement?.id ?? `v-${Date.now()}`,
      client: client.trim() || "Client comptoir",
      items: panier.map((l) => ({ produitId: l.produit.id, nom: l.produit.nom, quantite: l.quantite, prix: l.produit.prix })),
      total,
      mode,
      statut: mode === "COMPTE" ? "EN_ATTENTE" : "PAYEE",
      date: new Date().toISOString(),
      caisse: "Secrétaire",
    };
    setVentes((prev) => [nouvelle, ...prev]);
    setPanier([]);
    setClient("");
    setEncaissement(null);
    setCheckoutOpen(false);
    onToast(
      mode === "COMPTE"
        ? `Vente de ${formatMontantFcfa(total)} imputée au compte membre`
        : `Vente de ${formatMontantFcfa(total)} encaissée (${venteModeMeta[mode].label})`,
      "success",
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      {/* Catalogue */}
      <ExecutivePanel icon="package" subtitle="Ajoutez les produits au panier, puis encaissez" title="Catalogue">
        <div className="grid gap-3 sm:grid-cols-2">
          {produits.map((produit, index) => {
            const ligne = panier.find((l) => l.produit.id === produit.id);
            const rupture = produit.stock === 0;
            return (
              <Reveal delay={index * 0.03} key={produit.id}>
                <div
                  className={
                    "rounded-2xl border p-4 transition " +
                    (rupture
                      ? "border-rose-100 bg-rose-50/50 opacity-70"
                      : ligne
                        ? "border-[#0f7a5f]/40 bg-[#0f7a5f]/[0.04]"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white")
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] font-extrabold leading-5 text-[#16233a]">{produit.nom}</h3>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {produit.unite} · stock :{" "}
                        <span className={rupture ? "font-bold text-rose-600" : "font-bold text-slate-500"}>
                          {rupture ? "rupture" : `${produit.stock} restant(s)`}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#17294b]/[0.07] px-2.5 py-1 text-[10px] font-extrabold tabular-nums text-[#17294b]">
                      {formatMontantFcfa(produit.prix)}
                    </span>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between gap-2">
                    {ligne && ligne.quantite > 0 ? (
                      <div className="flex items-center gap-1 rounded-full border border-[#0f7a5f]/30 bg-white p-1">
                        <button
                          aria-label={`Retirer ${produit.nom} du panier`}
                          className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                          onClick={() => retirer(produit.id)}
                          type="button"
                        >
                          <Icon name="minus" size={12} />
                        </button>
                        <span className="min-w-6 text-center text-[12px] font-extrabold tabular-nums text-[#16233a]">
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
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7a5f] px-3.5 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-[#0e6e57] disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={rupture}
                        onClick={() => ajouter(produit)}
                        type="button"
                      >
                        <Icon name="plus" size={11} />
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </ExecutivePanel>

      {/* Caisse */}
      <ExecutivePanel accent icon="shopping-bag" subtitle={`${totalUnites} article(s) dans le panier`} title="Caisse">
        {panier.length === 0 ? (
          <div className="grid place-items-center gap-2 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#f2c56d]">
              <Icon name="shopping-bag" size={22} />
            </span>
            <p className="text-[12px] font-bold text-white/80">Panier vide</p>
            <p className="max-w-52 text-[10px] leading-4 text-slate-400">Ajoutez des produits du catalogue pour démarrer une vente.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2.5">
              {panier.map((ligne) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3.5 py-2.5"
                  key={ligne.produit.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-white">{ligne.produit.nom}</p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-slate-400">
                      {ligne.quantite} × {formatMontantFcfa(ligne.produit.prix)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] font-extrabold tabular-nums text-[#f2c56d]">
                      {formatMontantFcfa(ligne.produit.prix * ligne.quantite)}
                    </span>
                    <button
                      aria-label={`Retirer ${ligne.produit.nom}`}
                      className="grid size-7 place-items-center rounded-full bg-white/10 text-slate-300 transition hover:bg-rose-500/30 hover:text-white"
                      onClick={() => retirer(ligne.produit.id)}
                      type="button"
                    >
                      <Icon name="minus" size={11} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-[11px] font-bold text-slate-300">Total à encaisser</span>
              <span className="text-[17px] font-extrabold tabular-nums text-white">{formatMontantFcfa(total)}</span>
            </div>

            <button
              className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f2c56d] px-4 py-3.5 text-[13px] font-extrabold text-[#17294b] shadow-xl shadow-black/20 transition hover:bg-[#f5d184] active:scale-[0.99]"
              onClick={ouvrirCheckout}
              type="button"
            >
              <Icon name="credit-card" size={15} />
              Encaisser ({formatMontantFcfa(total)})
            </button>
          </>
        )}
      </ExecutivePanel>

      {/* Historique */}
      <ExecutivePanel
        action={
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">
            {ventes.length} vente(s) récente(s)
          </span>
        }
        className="xl:col-span-2"
        icon="history"
        subtitle="Les dernières transactions de la filiale"
        title="Ventes récentes"
      >
        <div className="divide-y divide-slate-100">
          {ventes.map((vente) => {
            const modeMeta = venteModeMeta[vente.mode];
            return (
              <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={vente.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    <Icon name={modeMeta.icon} size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-extrabold text-[#16233a]">{vente.client}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {vente.items.map((i) => `${i.quantite}× ${i.nom}`).join(" · ")} · {modeMeta.label} ·{" "}
                      {new Date(vente.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span
                    className={
                      "rounded-full border px-2.5 py-1 text-[9px] font-extrabold " +
                      (vente.statut === "PAYEE"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-800")
                    }
                  >
                    {vente.statut === "PAYEE" ? "Payée" : "En attente"}
                  </span>
                  <span className="text-[13px] font-extrabold tabular-nums text-[#17294b]">{formatMontantFcfa(vente.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ExecutivePanel>

      {/* Checkout */}
      <AnimatePresence>
        {checkoutOpen ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!done) setCheckoutOpen(false); }}
            />
            <motion.div
              aria-label="Encaissement"
              aria-modal="true"
              className="pointer-events-auto relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              role="dialog"
            >
              {done ? (
                <div className="grid place-items-center gap-3 py-6 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[#0f7a5f]/10 text-[#0f7a5f]">
                    <Icon name="check" size={26} />
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#16233a]">Encaissement enregistré</h3>
                  <p className="max-w-72 text-[11px] leading-5 text-slate-400">
                    {formatMontantFcfa(total)} via {mode ? venteModeMeta[mode].label : ""} · reçu disponible dans
                    l&apos;historique de la caisse.
                  </p>
                  <button
                    className="mt-2 rounded-2xl bg-[#0f7a5f] px-6 py-2.5 text-[12px] font-extrabold text-white shadow-lg shadow-emerald-900/20"
                    onClick={finaliser}
                    type="button"
                  >
                    Terminer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f7a5f]">Encaissement</p>
                      <h3 className="mt-1 text-lg font-extrabold text-[#16233a]">{formatMontantFcfa(total)}</h3>
                      <p className="mt-1 text-[10px] text-slate-400">{totalUnites} article(s) · client comptoir</p>
                    </div>
                    <button
                      aria-label="Fermer"
                      className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                      onClick={() => setCheckoutOpen(false)}
                      type="button"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>

                  <label className="mt-5 block">
                    <span className="text-[11px] font-bold text-slate-500">Client (optionnel)</span>
                    <input
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Nom du client ou raison sociale"
                      value={client}
                    />
                  </label>

                  <p className="mt-4 text-[11px] font-bold text-slate-500">Mode de paiement</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {modeOptions.map((option) => {
                      const meta = venteModeMeta[option];
                      return (
                        <button
                          className={
                            "flex items-center gap-2.5 rounded-2xl border p-3 text-left transition " +
                            (mode === option
                              ? "border-[#0f7a5f] bg-[#0f7a5f]/[0.06]"
                              : "border-slate-200 hover:border-slate-300")
                          }
                          key={option}
                          onClick={() => setMode(option)}
                          type="button"
                        >
                          <span
                            className={
                              "grid size-8 shrink-0 place-items-center rounded-xl " +
                              (mode === option ? "bg-[#0f7a5f] text-white" : "bg-slate-100 text-slate-500")
                            }
                          >
                            <Icon name={meta.icon} size={14} />
                          </span>
                          <span className="text-[11px] font-bold leading-4 text-[#16233a]">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-3.5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-900/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!mode}
                    onClick={confirmerPaiement}
                    type="button"
                  >
                    <Icon name="check" size={15} />
                    Confirmer l&apos;encaissement
                  </button>
                </>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
