"use client";

import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { formatFcfa, productCategories, productFiliales, products } from "@/app/lib/store-data";
import type { CartItem, Product } from "@/app/lib/store-data";
import { useAuth } from "@/app/lib/auth-context";
import { passerCommandeApi, type BoutiqueProduit } from "@/app/lib/client-shop-data";

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
  const [category, setCategory] = useState("Tous");
  const [filiale, setFiliale] = useState("Toutes");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [payment, setPayment] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setCart(loadCart()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "Tous" || product.category === category) &&
          (filiale === "Toutes" || product.filiale === filiale)
      ),
    [category, filiale]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToast(product.name + " ajouté au panier.");
    setTimeout(() => setToast(""), 3000);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  async function submitOrder() {
    if (!user) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const lignes = cart.map((item) => ({
        produit: {
          id: item.product.id,
          nom: item.product.name,
          categorie: "materiaux" as const,
          prix: item.product.price,
          stock: 999,
          unite: item.product.unit,
          description: item.product.description,
        } as BoutiqueProduit,
        quantite: item.quantity,
      }));
      await passerCommandeApi(user.filialeId ?? "", lignes, phone);
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrderDone(true);
      setCart([]);
      window.localStorage.removeItem(CART_KEY);
    } catch (err) {
      setSubmitError("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#17294b] to-[#1e3557] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              <Icon name="shopping-bag" size={12} />
              <span>Boutique WUGAMS</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Matériaux & fournitures
            </h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Parcourez le catalogue et commandez directement depuis votre espace.
            </p>
          </div>
          <button
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            onClick={() => setCartOpen(true)}
            type="button"
            aria-label={"Panier, " + cartCount + " article(s)"}
          >
            <Icon name="shopping-bag" size={22} />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-[#e3a641] text-[11px] font-black text-[#14223b] shadow-lg">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-100">
              <Icon name="check" size={16} />
            </span>
            <span>{toast}</span>
          </div>
        </div>
      ) : null}

      {/* Filters Section */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Catégories
            </p>
            <div className="flex flex-wrap gap-2">
              {productCategories.map((cat) => (
                <button
                  aria-pressed={category === cat}
                  className={
                    "rounded-lg px-4 py-2 text-xs font-bold transition " +
                    (category === cat
                      ? "bg-gradient-to-br from-[#17294b] to-[#1e3557] text-white shadow-md"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#17294b]/20 hover:bg-slate-100")
                  }
                  key={cat}
                  onClick={() => setCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              Filiale
            </p>
            <label className="relative block">
              <span className="sr-only">Filtrer par filiale</span>
              <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="building" size={16} />
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20"
                onChange={(event) => setFiliale(event.target.value)}
                value={filiale}
              >
                {productFiliales.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" name="chevron-down" size={16} />
            </label>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <article
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            key={product.id}
          >
            <button
              className="block w-full text-left"
              onClick={() => setSelectedProduct(product)}
              type="button"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  src={product.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute left-3 top-3 rounded-lg bg-[#101a2d]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  {product.category}
                </span>
                <span
                  className={
                    "absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm " +
                    (product.stock === "En stock"
                      ? "bg-emerald-500 text-white"
                      : product.stock === "Stock faible"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-500 text-white")
                  }
                >
                  {product.stock}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#17294b]">{product.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{product.filiale}</p>
                    <p className="text-lg font-bold text-[#17294b]">{formatFcfa(product.price)}</p>
                    <p className="text-[10px] text-slate-400">par {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Icon name="star" size={12} className="text-amber-500" />
                    <span className="font-bold text-slate-700">{product.note}</span>
                  </div>
                </div>
              </div>
            </button>
            <div className="border-t border-slate-100 p-3">
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e3a641] to-[#f2c56d] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-md transition hover:shadow-lg active:scale-[0.98]"
                onClick={() => addToCart(product)}
                type="button"
              >
                <Icon name="plus" size={16} />
                Ajouter au panier
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Les prix affichés incluent la TVA. Livraison offerte dès 100 000 FCFA sur Abidjan.
      </p>

      {cartOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Fermer le panier"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setCartOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-[#1a2943]">Votre panier</p>
                <p className="mt-0.5 text-xs text-slate-500">{cartCount} article{cartCount > 1 ? "s" : ""}</p>
              </div>
              <button
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setCartOpen(false)}
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="shopping-bag" size={22} />
                  </span>
                  <p className="mt-4 text-sm font-bold text-slate-700">Panier vide</p>
                  <p className="mt-1 text-xs text-slate-500">Parcourez le catalogue pour ajouter des articles.</p>
                  <button
                    className="mt-4 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
                    onClick={() => setCartOpen(false)}
                    type="button"
                  >
                    Voir le catalogue
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
                  {cart.map((item) => (
                    <div className="flex gap-3 py-4" key={item.product.id}>
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={item.product.name} className="h-full w-full object-cover" src={item.product.image} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-xs font-bold text-[#233856]">{item.product.name}</p>
                          <button
                            aria-label={"Retirer " + item.product.name}
                            className="text-slate-300 transition hover:text-[#db6d5b]"
                            onClick={() => removeItem(item.product.id)}
                            type="button"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                          {formatFcfa(item.product.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            aria-label="Diminuer la quantité"
                            className="grid size-6 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            type="button"
                          >
                            <Icon name="minus" size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#233856]">{item.quantity}</span>
                          <button
                            aria-label="Augmenter la quantité"
                            className="grid size-6 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            type="button"
                          >
                            <Icon name="plus" size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-xs font-bold text-[#17294b]">
                        {formatFcfa(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-500">Total</p>
                    <p className="text-lg font-bold text-[#17294b]">{formatFcfa(cartTotal)}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {cartTotal >= 100000 ? "Livraison offerte sur Abidjan." : "Livraison Abidjan : 4 500 FCFA."}
                  </p>
                  <button
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-3 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
                    onClick={() => setCheckoutOpen(true)}
                    type="button"
                  >
                    Passer la commande <Icon name="arrow-right" size={17} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <div
            aria-labelledby="checkout-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
                  Paiement sécurisé
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="checkout-title">
                  Finaliser la commande
                </h2>
              </div>
              <button
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setCheckoutOpen(false)}
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <p className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-500">Total à payer</span>
              <span className="font-bold text-[#17294b]">{formatFcfa(cartTotal)}</span>
            </p>

            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-600">Numéro de téléphone</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+225 07 00 00 00 00"
                type="tel"
                value={phone}
              />
            </label>

            <div className="mt-4">
              <p className="text-xs font-bold text-slate-600">Moyen de paiement</p>
              <div className="mt-2 space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    aria-pressed={payment === method.id}
                    className={
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition " +
                      (payment === method.id
                        ? "border-[#e3a641] bg-amber-50/70 ring-2 ring-amber-200/60"
                        : "border-slate-200 bg-white hover:border-slate-300")
                    }
                    key={method.id}
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
              <button
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                onClick={() => setCheckoutOpen(false)}
                type="button"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={submitOrder}
                type="button"
                disabled={submitting || cart.length === 0}
              >
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
            <h2 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#17294b]">
              Commande confirmée !
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {payment !== "carte" ? (
                <>
                  Une demande de paiement de <strong>{formatFcfa(cartTotal)}</strong> a été envoyée
                  au <strong>{phone || "numéro indiqué"}</strong> par{" "}
                  {paymentMethods.find((m) => m.id === payment)?.label}.
                </>
              ) : (
                <>Le paiement de <strong>{formatFcfa(cartTotal)}</strong> a été accepté.</>
              )}{" "}
              Vous recevrez la confirmation de livraison par SMS.
            </p>
            <button
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
              onClick={() => setOrderDone(false)}
              type="button"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <div
            aria-labelledby="product-detail-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="dialog"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
                src={selectedProduct.image}
              />
              <span className="absolute left-3 top-3 rounded-full bg-[#101a2d]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                {selectedProduct.category}
              </span>
              <span
                className={
                  "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold " +
                  (selectedProduct.stock === "En stock"
                    ? "bg-emerald-100 text-emerald-700"
                    : selectedProduct.stock === "Stock faible"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600")
                }
              >
                {selectedProduct.stock}
              </span>
              <button
                aria-label="Fermer"
                className="absolute right-3 top-14 grid size-8 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
                onClick={() => setSelectedProduct(null)}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
                    {selectedProduct.filiale}
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="product-detail-title">
                    {selectedProduct.name}
                  </h2>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-400">
                  ★ {selectedProduct.note}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {selectedProduct.description}
              </p>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs text-slate-500">Prix unitaire</p>
                  <p className="text-lg font-bold text-[#17294b]">{formatFcfa(selectedProduct.price)}</p>
                </div>
                <p className="text-xs text-slate-500">par {selectedProduct.unit}</p>
              </div>
              <div className="mt-5 flex gap-2.5">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                  onClick={() => setSelectedProduct(null)}
                  type="button"
                >
                  Fermer
                </button>
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] transition hover:bg-[#efb653]"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
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
