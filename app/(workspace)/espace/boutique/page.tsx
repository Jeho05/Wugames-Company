"use client";

import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import { passerCommandeApi, type BoutiqueProduit } from "@/app/lib/client-shop-data";
import { useBoutiqueProduits } from "@/app/hooks/use-vitrine";
import type { Produit } from "@/app/lib/contracts";

type CartItem = { produit: Produit; quantity: number };

function formatFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
}

function stockLabel(produit: Produit): { label: string; tone: string } {
  if (produit.statut === "RUPTURE") return { label: "Rupture", tone: "bg-slate-100 text-slate-600" };
  if (produit.statut === "REAPPROVISIONNEMENT_REQUIS") return { label: "Stock faible", tone: "bg-amber-100 text-amber-700" };
  if (produit.statut === "COMMANDE_EN_COURS") return { label: "Sur commande", tone: "bg-slate-100 text-slate-600" };
  return { label: "En stock", tone: "bg-emerald-100 text-emerald-700" };
}

const CART_KEY = "wugams-cart";

const paymentMethods = [
  { id: "mtn", label: "MTN Mobile Money", hint: "Paiement via compte MTN MoMo", short: "MTN" },
  { id: "moov", label: "Moov Money", hint: "Paiement via compte Moov Money", short: "Moov" },
  { id: "wave", label: "Wave", hint: "Paiement via l'application Wave", short: "Wave" },
  { id: "carte", label: "Carte bancaire", hint: "Visa & Mastercard", short: "Carte" },
];

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export default function WorkspaceBoutiquePage() {
  const { user } = useAuth();
  const { data: produits, loading } = useBoutiqueProduits();
  const [category, setCategory] = useState("Tous");
  const [filiale, setFiliale] = useState("Toutes");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [payment, setPayment] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setCart(loadCart()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const categories = useMemo(() => {
    if (!produits || produits.length === 0) return ["Tous"];
    const cats = Array.from(new Set(produits.map((p) => p.filiale?.nom ?? "Général")));
    return ["Tous", ...cats];
  }, [produits]);

  const filiales = useMemo(() => {
    if (!produits || produits.length === 0) return ["Toutes"];
    const fils = Array.from(new Set(produits.map((p) => p.filiale?.nom ?? "WUGAMS")));
    return ["Toutes", ...fils];
  }, [produits]);

  const visibleProduits = useMemo(() => {
    if (!produits) return [];
    return produits.filter(
      (p) => (category === "Tous" || (p.filiale?.nom ?? "Général") === category) && (filiale === "Toutes" || (p.filiale?.nom ?? "WUGAMS") === filiale)
    );
  }, [produits, category, filiale]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.produit.prix_unitaire) * item.quantity, 0);

  function addToCart(produit: Produit) {
    setCart((prev) => {
      const existing = prev.find((item) => item.produit.id === produit.id);
      if (existing) return prev.map((item) => (item.produit.id === produit.id ? { ...item, quantity: item.quantity + 1 } : item));
      return [...prev, { produit, quantity: 1 }];
    });
    setToast(produit.nom + " ajouté au panier.");
    setTimeout(() => setToast(""), 3000);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) => prev.map((item) => (item.produit.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)).filter((item) => item.quantity > 0));
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.produit.id !== productId));
  }

  async function submitOrder() {
    if (!user) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const lignes = cart.map((item) => ({
        produit: {
          id: item.produit.id,
          nom: item.produit.nom,
          categorie: "materiaux" as const,
          prix: Number(item.produit.prix_unitaire),
          stock: item.produit.quantite_actuelle,
          unite: "unité",
          description: item.produit.description ?? item.produit.reference,
        } as BoutiqueProduit,
        quantite: item.quantity,
      }));
      await passerCommandeApi(user.filialeId ?? "", lignes, phone, payment as "mtn" | "moov" | "wave" | "carte");
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrderDone(true);
      setCart([]);
      window.localStorage.removeItem(CART_KEY);
    } catch {
      setSubmitError("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#17294b] to-[#1e3557] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              <Icon name="shopping-bag" size={12} />
              <span>Boutique WUGAMS</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Matériaux & fournitures</h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">Parcourez le catalogue et commandez directement depuis votre espace.</p>
          </div>
        </div>
      </div>

      <button
        className="fixed bottom-6 right-6 z-50 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e3a641] to-[#f2c56d] text-[#14223b] shadow-2xl transition hover:scale-110 sm:size-14"
        onClick={() => setCartOpen(true)}
        type="button"
        aria-label={"Ouvrir le panier, " + cartCount + " article(s)"}
      >
        <Icon name="shopping-bag" size={24} className="sm:!w-5 sm:!h-5" />
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-[26px] items-center justify-center rounded-full bg-[#17294b] px-1.5 py-0.5 text-xs font-black text-white shadow-lg ring-2 ring-[#f2c56d]">
            {cartCount}
          </span>
        ) : null}
      </button>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-100">
              <Icon name="check" size={16} />
            </span>
            <span>{toast}</span>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : produits && produits.length > 0 ? (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Catégories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      aria-pressed={category === cat}
                      className={
                        "rounded-lg px-4 py-2 text-xs font-bold transition " +
                        (category === cat ? "bg-[#17294b] text-white shadow-md" : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#17294b]/20 hover:bg-slate-100")
                      }
                      onClick={() => setCategory(cat)}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Filiale</p>
                <label className="relative block">
                  <span className="sr-only">Filtrer par filiale</span>
                  <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="building" size={16} />
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20"
                    onChange={(event) => setFiliale(event.target.value)}
                    value={filiale}
                  >
                    {filiales.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                  <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" name="chevron-down" size={16} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProduits.map((produit) => {
              const stock = stockLabel(produit);
              return (
                <article key={produit.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <button className="block w-full text-left" onClick={() => setSelectedProduit(produit)} type="button">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={produit.nom} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80" />
                      <span className="absolute left-3 top-3 rounded-lg bg-[#101a2d]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">{produit.filiale?.nom ?? produit.reference}</span>
                      <span className={"absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm " + stock.tone}>{stock.label}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#17294b]">{produit.nom}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{produit.description ?? produit.reference}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">{produit.filiale?.nom ?? "WUGAMS"}</p>
                          <p className="text-lg font-bold text-[#17294b]">{formatFcfa(Number(produit.prix_unitaire))}</p>
                          <p className="text-[10px] text-slate-400">{produit.quantite_actuelle} en stock</p>
                        </div>
                      </div>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 p-3">
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-md transition hover:bg-[#efb653] disabled:opacity-50"
                      disabled={produit.statut === "RUPTURE"}
                      onClick={() => addToCart(produit)}
                      type="button"
                    >
                      <Icon name="plus" size={16} />
                      Ajouter au panier
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {visibleProduits.length === 0 ? (
            <div className="mt-8 grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
              <p className="text-sm font-semibold text-slate-500">Aucun produit dans cette catégorie</p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
            <Icon name="shopping-bag" size={24} />
          </span>
          <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-[#17294b]">Catalogue en préparation</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Aucun produit disponible. Le catalogue est en cours de préparation par le Gérant.</p>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400">Les prix incluent la TVA. Livraison offerte dès 100 000 FCFA sur Abidjan.</p>

      {cartOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-end sm:items-stretch">
          <button aria-label="Fermer le panier" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} type="button" />
          <aside className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-full sm:max-w-lg sm:rounded-none">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#17294b] to-[#1e3557] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-white/10 text-white backdrop-blur">
                  <Icon name="shopping-bag" size={22} />
                </span>
                <div>
                  <p className="text-lg font-bold text-white">Votre panier</p>
                  <p className="text-sm text-white/70">{cartCount} article{cartCount > 1 ? "s" : ""}</p>
                </div>
              </div>
              <button aria-label="Fermer" className="grid size-10 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setCartOpen(false)} type="button">
                <Icon name="close" size={22} />
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-xs">
                  <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-slate-100">
                    <Icon name="shopping-bag" size={32} className="text-slate-300" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-slate-700">Panier vide</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">Parcourez le catalogue pour découvrir nos produits.</p>
                  <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-6 py-3 text-sm font-bold text-white" onClick={() => setCartOpen(false)} type="button">
                    Voir le catalogue <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.produit.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt={item.produit.nom} className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-[#17294b]">{item.produit.nom}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">{formatFcfa(Number(item.produit.prix_unitaire))} / unité</p>
                              </div>
                              <button aria-label={"Retirer " + item.produit.nom} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeItem(item.produit.id)} type="button">
                                <Icon name="trash" size={16} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
                                <button aria-label="Diminuer" className="grid size-7 place-items-center rounded-md text-slate-600 hover:bg-white" onClick={() => updateQuantity(item.produit.id, -1)} type="button">
                                  <Icon name="minus" size={14} />
                                </button>
                                <span className="min-w-[28px] text-center text-sm font-bold text-[#17294b]">{item.quantity}</span>
                                <button aria-label="Augmenter" className="grid size-7 place-items-center rounded-md text-slate-600 hover:bg-white" onClick={() => updateQuantity(item.produit.id, 1)} type="button">
                                  <Icon name="plus" size={14} />
                                </button>
                              </div>
                              <p className="text-sm font-bold text-[#17294b]">{formatFcfa(Number(item.produit.prix_unitaire) * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-slate-600">Sous-total</p>
                    <p className="text-2xl font-bold text-[#17294b]">{formatFcfa(cartTotal)}</p>
                  </div>
                  <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-4 text-base font-bold text-[#14223b] shadow-xl" onClick={() => setCheckoutOpen(true)} type="button">
                    Passer la commande <Icon name="arrow-right" size={18} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <div aria-labelledby="checkout-title" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">Paiement sécurisé</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="checkout-title">
                  Finaliser la commande
                </h2>
              </div>
              <button aria-label="Fermer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setCheckoutOpen(false)} type="button">
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-500">Total à payer</span>
              <span className="font-bold text-[#17294b]">{formatFcfa(cartTotal)}</span>
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-600">Numéro de téléphone</span>
              <input className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#7ea5ca] focus:bg-white" onChange={(event) => setPhone(event.target.value)} placeholder="+225 07 00 00 00 00" type="tel" value={phone} />
            </label>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-600">Moyen de paiement</p>
              <div className="mt-2 space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    aria-pressed={payment === method.id}
                    className={"flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left " + (payment === method.id ? "border-[#e3a641] bg-amber-50/70 ring-2 ring-amber-200/60" : "border-slate-200 bg-white")}
                    onClick={() => setPayment(method.id)}
                    type="button"
                  >
                    <span>
                      <span className="block text-xs font-bold text-[#233856]">{method.label}</span>
                      <span className="block text-[11px] text-slate-400">{method.hint}</span>
                    </span>
                    {payment === method.id ? (
                      <span className="grid size-6 place-items-center rounded-full bg-[#e3a641] text-[#14223b]">
                        <Icon name="check" size={13} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            {submitError ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                <Icon name="warning" size={16} />
                {submitError}
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-2.5">
              <button className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600" onClick={() => setCheckoutOpen(false)} type="button" disabled={submitting}>
                Annuler
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" onClick={submitOrder} type="button" disabled={submitting || cart.length === 0}>
                {submitting ? "Envoi en cours…" : payment === "carte" ? "Payer " + formatFcfa(cartTotal) : "Payer par Mobile Money"}
                {!submitting && <Icon name="arrow-right" size={15} />}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {orderDone ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 text-center shadow-2xl">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon name="check" size={26} />
            </span>
            <h2 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#17294b]">Commande confirmée !</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {payment !== "carte" ? (
                <>
                  Une demande de paiement de <strong>{formatFcfa(cartTotal)}</strong> a été envoyée au <strong>{phone || "numéro indiqué"}</strong> par {paymentMethods.find((m) => m.id === payment)?.label}.
                </>
              ) : (
                <>Le paiement de <strong>{formatFcfa(cartTotal)}</strong> a été accepté.</>
              )}{" "}
              Vous recevrez la confirmation de livraison par SMS.
            </p>
            <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3 text-sm font-bold text-[#14223b]" onClick={() => setOrderDone(false)} type="button">
              Continuer mes achats
            </button>
          </div>
        </div>
      ) : null}

      {selectedProduit ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <div aria-labelledby="product-detail-title" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={selectedProduit.nom} className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=800&q=80" />
              <span className="absolute left-3 top-3 rounded-full bg-[#101a2d]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">{selectedProduit.filiale?.nom ?? selectedProduit.reference}</span>
              <span className={"absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold " + stockLabel(selectedProduit).tone}>{stockLabel(selectedProduit).label}</span>
              <button aria-label="Fermer" className="absolute right-3 top-14 grid size-8 place-items-center rounded-full bg-white/90 text-slate-600" onClick={() => setSelectedProduit(null)} type="button">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">{selectedProduit.filiale?.nom ?? "WUGAMS"}</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="product-detail-title">
                    {selectedProduit.nom}
                  </h2>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-400">{selectedProduit.quantite_actuelle} en stock</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{selectedProduit.description ?? selectedProduit.reference}</p>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs text-slate-500">Prix unitaire</p>
                  <p className="text-lg font-bold text-[#17294b]">{formatFcfa(Number(selectedProduit.prix_unitaire))}</p>
                </div>
                <p className="text-xs text-slate-500">par unité</p>
              </div>
              <div className="mt-5 flex gap-2.5">
                <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600" onClick={() => setSelectedProduit(null)} type="button">
                  Fermer
                </button>
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] disabled:opacity-50"
                  disabled={selectedProduit.statut === "RUPTURE"}
                  onClick={() => {
                    addToCart(selectedProduit);
                    setSelectedProduit(null);
                  }}
                  type="button"
                >
                  <Icon name="plus" size={16} />
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
