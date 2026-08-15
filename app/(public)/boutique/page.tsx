"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { formatFcfa, productCategories, productFiliales, products } from "@/app/lib/store-data";
import type { CartItem, Product } from "@/app/lib/store-data";

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

export default function BoutiquePage() {
  const [category, setCategory] = useState("Tous");
  const [filiale, setFiliale] = useState("Toutes");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [payment, setPayment] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");

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

  function submitOrder() {
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrderDone(true);
    setCart([]);
    window.localStorage.removeItem(CART_KEY);
  }

  return (
    <main className="min-h-screen bg-[#fbfcfe] text-[#17294b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101a2d]">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark href="/" inverse />
          <nav aria-label="Navigation boutique" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link className="text-white" href="/">
              Accueil
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/realisations">
              Réalisations
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/blog">
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              aria-label={"Panier, " + cartCount + " article(s)"}
              className="relative grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <Icon name="shopping-bag" size={19} />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[#e3a641] px-1 py-0.5 text-[10px] font-extrabold text-[#14223b]">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-3.5 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] sm:px-4 sm:text-sm"
              href="/connexion"
            >
              Mon espace <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#101a2d] pb-10 pt-32 text-white">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
            Espace Wu · Livraison 7 j/7
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
            Entretien, matériaux, mobilier &amp; outillage
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Commandez en ligne et faites-vous livrer sur votre chantier, même en urgence.
            Paiement par carte ou Mobile Money.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Icon className="text-emerald-400" name="check" size={15} /> Urgence Porto-Novo · Express
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon className="text-emerald-400" name="check" size={15} /> Retrait à l&apos;Espace Wu
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon className="text-emerald-400" name="check" size={15} /> Tarif membres &amp; chantiers
            </span>
          </div>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl">
            <Icon name="check" size={17} />
            {toast}
          </div>
        </div>
      ) : null}

      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {productCategories.map((cat) => (
              <button
                aria-pressed={category === cat}
                className={
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                  (category === cat
                    ? "bg-[#17294b] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300")
                }
                key={cat}
                onClick={() => setCategory(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-[210px]">
            <span className="sr-only">Filtrer par filiale</span>
            <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="building" size={15} />
            <select
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-bold text-slate-600 outline-none transition focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]"
              onChange={(event) => setFiliale(event.target.value)}
              value={filiale}
            >
              {productFiliales.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" name="chevron-down" size={14} />
          </label>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <article
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              key={product.id}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.image}
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#101a2d]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                  {product.category}
                </span>
                <span
                  className={
                    "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold " +
                    (product.stock === "En stock"
                      ? "bg-emerald-100 text-emerald-700"
                      : product.stock === "Stock faible"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600")
                  }
                >
                  {product.stock}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#233856]">{product.name}</h3>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                    ★ {product.note}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {product.filiale} · au {product.unit}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[15px] font-bold text-[#17294b]">{formatFcfa(product.price)}</p>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#e3a641] px-3 py-2 text-xs font-bold text-[#14223b] transition hover:bg-[#efb653]"
                    onClick={() => addToCart(product)}
                    type="button"
                  >
                    <Icon name="plus" size={14} />
                    Ajouter
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Les prix affichés incluent la TVA. Livraison offerte dès 100 000 FCFA sur Abidjan.
        </p>
      </section>

      <section className="border-t border-slate-200 bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-12 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
                Avis produits · clients vérifiés
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#17294b]">
                Ce que disent nos clients
              </h2>
            </div>
            <p className="hidden text-sm font-bold text-slate-500 sm:block">
              ★ 4,7 / 5 · 128 avis
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { product: "Ciment 50 kg", name: "Koffi A.", text: "Livraison en 3 h sur mon chantier de Bingerville. Qualité constante, prix affiché = prix payé.", stars: 5 },
              { product: "Carrelage grès 60×60", name: "Aminata T.", text: "Le dépôt de Cocody avait tout en stock. Le carrelage est magnifique, pose comprise sans casse.", stars: 5 },
              { product: "Câble électrique 2,5 mm", name: "David K.", text: "Bon rapport qualité/prix, section conforme aux normes. Je recommande pour les chantiers neufs.", stars: 4 },
            ].map((review) => (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={review.name}>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      className={"size-3.5 " + (star <= review.stars ? "fill-current" : "fill-slate-200")}
                      key={star}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-600">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold text-[#233856]">{review.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{review.product}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                onClick={() => setCheckoutOpen(false)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
                onClick={submitOrder}
                type="button"
              >
                {payment === "carte" ? "Payer " + formatFcfa(cartTotal) : "Payer par Mobile Money"}
                <Icon name="arrow-right" size={15} />
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
    </main>
  );
}
