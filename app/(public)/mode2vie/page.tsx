"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { mode2vieArticles, mode2vieCategories } from "@/app/lib/mode2vie-data";
import type { Mode2VieArticle } from "@/app/lib/mode2vie-data";

export default function Mode2ViePage() {
  const [categorie, setCategorie] = useState("Tous");
  const [reading, setReading] = useState<Mode2VieArticle | null>(null);
  const [diasporaIndex, setDiasporaIndex] = useState(0);

  const articles = useMemo(
    () =>
      categorie === "Tous"
        ? mode2vieArticles
        : mode2vieArticles.filter((article) => article.categorie === categorie),
    [categorie],
  );
  const [featured, ...rest] = articles;

  function openArticle(article: Mode2VieArticle) {
    setReading(article);
    setDiasporaIndex(0);
  }

  return (
    <main className="min-h-screen bg-[#fbfcfe] text-[#17294b]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101a2d]">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark href="/" inverse />
          <nav aria-label="Navigation Mode2Vie" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link className="text-slate-300 transition hover:text-white" href="/">
              Accueil
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/boutique">
              Boutique
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/realisations">
              Réalisations
            </Link>
            <Link className="text-slate-300 transition hover:text-white" href="/blog">
              Blog
            </Link>
            <Link aria-current="page" className="text-white" href="/mode2vie">
              Mode2Vie
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
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Vie chrétienne</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Mode2Vie [Lifestyle]</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Notre blog de vie chrétienne : la foi, le travail et la famille, vécus au quotidien.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {mode2vieCategories.map((cat) => (
            <button
              aria-pressed={categorie === cat.id}
              className={
                "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                (categorie === cat.id
                  ? "bg-[#17294b] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300")
              }
              key={cat.id}
              onClick={() => setCategorie(cat.id)}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <p className="text-sm font-semibold text-slate-500">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          <>
            {featured ? (
              <article className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
                {featured.diasporama[0] ? (
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto lg:h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={featured.titre}
                      className="h-full w-full object-cover"
                      decoding="async"
                      loading="lazy"
                      src={featured.diasporama[0]}
                    />
                  </div>
                ) : null}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{featured.categorie}</span>
                    <span>{featured.date}</span>
                    <span>· {featured.lecture} de lecture</span>
                  </div>
                  {featured.verset ? (
                    <p className="mt-4 rounded-xl bg-[#17294b] px-4 py-3 text-xs font-semibold italic leading-6 text-[#f2c56d]">
                      « {featured.verset} »
                    </p>
                  ) : null}
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[#17294b] sm:text-3xl">{featured.titre}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{featured.extrait}</p>
                  <p className="mt-3 text-[11px] font-semibold text-slate-400">{featured.auteur}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#243a61]"
                      onClick={() => openArticle(featured)}
                      type="button"
                    >
                      Lire l&apos;article <Icon name="arrow-right" size={16} />
                    </button>
                    {featured.blogUrl ? (
                      <a
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#324d70] transition hover:border-[#7ea5ca] hover:bg-[#edf6fd]"
                        href={featured.blogUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Lire sur le blog <Icon name="arrow-right" size={16} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ) : null}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <article
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  key={article.id}
                >
                  {article.diasporama[0] ? (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={article.titre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        decoding="async"
                        loading="lazy"
                        src={article.diasporama[0]}
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{article.categorie}</span>
                      <span>{article.lecture} de lecture</span>
                    </div>
                    {article.verset ? (
                      <p className="mt-3 rounded-xl bg-[#17294b] px-3.5 py-2.5 text-[11px] font-semibold italic leading-5 text-[#f2c56d]">
                        « {article.verset} »
                      </p>
                    ) : null}
                    <h3 className="mt-3 text-base font-bold tracking-[-0.02em] text-[#233856] transition group-hover:text-[#17294b]">
                      {article.titre}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{article.extrait}</p>
                    <p className="mt-auto pt-4 text-[11px] font-semibold text-slate-400">
                      {article.auteur} · {article.date}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
                        onClick={() => openArticle(article)}
                        type="button"
                      >
                        Lire <Icon name="arrow-right" size={14} />
                      </button>
                      {article.blogUrl ? (
                        <a
                          aria-label={"Lire sur le blog : " + article.titre}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-[#7ea5ca] hover:text-[#17294b]"
                          href={article.blogUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <Icon name="arrow-right" size={14} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {reading ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            aria-labelledby="mode2vie-reader-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">
                  Mode2Vie [Lifestyle] · {reading.categorie}
                </p>
                <h2 className="mt-1.5 pr-6 text-lg font-bold leading-7 tracking-[-0.03em] text-[#16233a]" id="mode2vie-reader-title">
                  {reading.titre}
                </h2>
                <p className="mt-2 text-[11px] font-medium text-slate-400">
                  {reading.auteur} · {reading.date} · {reading.lecture} de lecture
                </p>
              </div>
              <button
                aria-label="Fermer"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                onClick={() => setReading(null)}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {reading.diasporama.length > 0 ? (
              <div className="mt-5">
                <div className="relative overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${reading.titre} — image ${diasporaIndex + 1}`}
                    className="h-56 w-full object-cover sm:h-72"
                    src={reading.diasporama[diasporaIndex]}
                  />
                  {reading.diasporama.length > 1 ? (
                    <>
                      <button
                        aria-label="Image précédente"
                        className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        onClick={() =>
                          setDiasporaIndex((prev) => (prev === 0 ? reading.diasporama.length - 1 : prev - 1))
                        }
                        type="button"
                      >
                        <Icon name="arrow-right" size={16} className="rotate-180" />
                      </button>
                      <button
                        aria-label="Image suivante"
                        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                        onClick={() =>
                          setDiasporaIndex((prev) => (prev === reading.diasporama.length - 1 ? 0 : prev + 1))
                        }
                        type="button"
                      >
                        <Icon name="arrow-right" size={16} />
                      </button>
                    </>
                  ) : null}
                </div>
                {reading.diasporama.length > 1 ? (
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {reading.diasporama.map((_, i) => (
                      <button
                        aria-label={"Aller à l'image " + (i + 1)}
                        className={"size-1.5 rounded-full transition " + (i === diasporaIndex ? "bg-[#17294b]" : "bg-slate-300")}
                        key={i}
                        onClick={() => setDiasporaIndex(i)}
                        type="button"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {reading.verset ? (
              <p className="mt-5 rounded-2xl bg-[#17294b] px-4 py-3.5 text-[13px] font-semibold italic leading-6 text-[#f2c56d]">
                « {reading.verset} »
              </p>
            ) : null}

            <div className="mt-5 space-y-4">
              {reading.contenu.map((paragraphe, index) => (
                <p className="text-[13px] leading-7 text-slate-600" key={index}>
                  {paragraphe}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] leading-5 text-slate-500">Partagé avec la communauté WUGAMS</p>
              {reading.blogUrl ? (
                <a
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61]"
                  href={reading.blogUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Lire sur le blog <Icon name="arrow-right" size={12} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
