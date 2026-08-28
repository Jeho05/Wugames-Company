"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { useRealisations } from "@/app/hooks/use-vitrine";

const filiales = ["Toutes", "Construction", "Rénovation", "Entretien", "Mobilier", "Matériaux"];

export default function RealisationsPage() {
  const [filiale, setFiliale] = useState("Toutes");
  const { data: realisations, loading } = useRealisations();

  const visible = useMemo(() => {
    if (!realisations) return [];
    return filiale === "Toutes" ? realisations : realisations.filter((r) => r.filiale === filiale);
  }, [realisations, filiale]);

  return (
    <main className="min-h-screen bg-[#fbfcfe] text-[#17294b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101a2d]">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark href="/" inverse />
          <nav aria-label="Navigation réalisations" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link className="text-slate-300 transition hover:text-white" href="/">
              Accueil
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/boutique">
              Boutique
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/blog">
              Blog
            </Link>
          </nav>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-3.5 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] sm:px-4 sm:text-sm"
            href="/connexion"
          >
            Mon espace <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </header>

      <section className="bg-[#101a2d] pb-12 pt-32 text-white">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Portfolio WUGAMS</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Nos réalisations</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Chantiers livrés, lieux entretenus, meubles façonnés : la preuve par l&apos;ouvrage, filiale par filiale.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : realisations && realisations.length > 0 ? (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {filiales.map((f) => (
                <button
                  aria-pressed={filiale === f}
                  className={
                    "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                    (filiale === f ? "bg-[#17294b] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300")
                  }
                  key={f}
                  onClick={() => setFiliale(f)}
                  type="button"
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((realisation) => (
                <article
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  key={realisation.id}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={realisation.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={realisation.image} />
                    <span className="absolute left-3 top-3 rounded-full bg-[#101a2d]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">{realisation.filiale}</span>
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#17294b] backdrop-blur">{realisation.value}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-bold tracking-[-0.02em] text-[#233856]">{realisation.title}</h2>
                      <span className="shrink-0 text-[11px] font-bold text-slate-400">{realisation.year}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {realisation.client} · {realisation.location}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{realisation.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {realisation.tags.map((tag) => (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {visible.length === 0 ? (
              <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <p className="text-sm font-semibold text-slate-500">Aucune réalisation dans cette filiale</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
              <Icon name="folder" size={24} />
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-[#17294b]">Aucune réalisation publiée</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Le portfolio se construit en temps réel. Le Gérant ajoutera les chantiers livrés depuis l&apos;espace vitrine.
            </p>
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-[#17294b] p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Un projet à lancer ?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
            Construction, rénovation, entretien ou mobilier : obtenez un devis clair et un calendrier engagé.
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
            href="/connexion"
          >
            Demander un devis <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
