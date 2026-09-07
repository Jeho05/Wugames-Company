"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { mode2vieArticles, mode2vieCategories } from "@/app/lib/mode2vie-data";
import type { Mode2VieArticle } from "@/app/lib/mode2vie-data";

type ClientMode2VieProps = {
  compact?: boolean;
  sectionId?: string;
};

function readingMinutes(lecture: string): number {
  const match = lecture.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function ClientMode2Vie({ sectionId = "espace-mode2vie" }: ClientMode2VieProps) {
  const [categorie, setCategorie] = useState("Tous");
  const [reading, setReading] = useState<Mode2VieArticle | null>(null);
  const [diasporaIndex, setDiasporaIndex] = useState(0);
  const reduce = useReducedMotion();

  const articles =
    categorie === "Tous"
      ? mode2vieArticles
      : mode2vieArticles.filter((article) => article.categorie === categorie);
  const [featured, ...rest] = articles;

  const versetDuJour = useMemo(
    () => mode2vieArticles.find((article) => article.categorie === "Versets du jour") ?? mode2vieArticles[0],
    [],
  );
  const totalMinutes = useMemo(
    () => mode2vieArticles.reduce((sum, article) => sum + readingMinutes(article.lecture), 0),
    [],
  );

  function openArticle(article: Mode2VieArticle) {
    setReading(article);
    setDiasporaIndex(0);
  }

  return (
    <section aria-labelledby={`${sectionId}-title`} className="scroll-mt-24 lg:scroll-mt-28" id={sectionId}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17294b] via-[#1d3461] to-[#101f3a] p-6 shadow-xl shadow-[#17294b]/20 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -right-16 -top-20 size-64 rounded-full bg-[#e3a641]/25 blur-[80px]" />
          <span className="absolute -bottom-24 -left-10 size-56 rounded-full bg-sky-400/15 blur-[70px]" />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f2c56d]/50 bg-[#f2c56d]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f2c56d]">
              <Icon name="sparkles" size={12} />
              Vie chrétienne
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {mode2vieArticles.length} articles · {totalMinutes} min de lecture
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[28px]" id={`${sectionId}-title`}>
            Mode2Vie <span className="text-[#f2c56d]">[Lifestyle]</span>
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300">
            Foi &amp; Travail, versets du jour, témoignages — notre vie chrétienne au quotidien.
          </p>
          <div className="scrollbar-none -mx-1 mt-5 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
            {mode2vieCategories.map((cat) => (
              <button
                aria-pressed={categorie === cat.id}
                className={
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  (categorie === cat.id
                    ? "border-[#f2c56d] bg-[#f2c56d] text-[#14223b] shadow-lg shadow-amber-900/30"
                    : "border-white/15 bg-white/[0.06] text-slate-200 hover:border-white/30 hover:text-white")
                }
                key={cat.id}
                onClick={() => setCategorie(cat.id)}
                type="button"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Verset du jour ───────────────────────────────── */}
      {versetDuJour ? (
        <div className="mt-4 overflow-hidden rounded-3xl border border-[#f2c56d]/40 bg-gradient-to-r from-[#f2c56d]/[0.14] via-[#f2c56d]/[0.06] to-transparent p-5 dark:border-[#f2c56d]/25 dark:bg-[#101c36] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#17294b] text-[#f2c56d] shadow-lg shadow-[#17294b]/15">
                <Icon name="sparkles" size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Verset du jour</p>
                <p className="mt-1.5 text-[15px] font-bold italic leading-7 text-[#16233a] dark:text-slate-100">
                  « {versetDuJour.verset} »
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{versetDuJour.titre}</p>
              </div>
            </div>
            <button
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#17294b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
              onClick={() => openArticle(versetDuJour)}
              type="button"
            >
              Méditer <Icon name="arrow-right" size={12} />
            </button>
          </div>
        </div>
      ) : null}

      {articles.length === 0 ? (
        <div className="mt-4 grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Aucun article dans cette catégorie</p>
        </div>
      ) : (
        <>
          {/* ── À la une ─────────────────────────────────── */}
          {featured ? (
            <motion.article
              className="group mt-4 grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              initial={reduce ? undefined : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              key={featured.id}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {featured.diasporama[0] ? (
                <div className="relative min-h-52 overflow-hidden bg-slate-100 sm:min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={featured.titre}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    src={featured.diasporama[0]}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#101a2d]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f2c56d] backdrop-blur">
                    À la une
                  </span>
                </div>
              ) : null}
              <div className="flex flex-col justify-center p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-semibold text-slate-400">
                  <span className="rounded-full border border-[#f2c56d]/40 bg-[#f2c56d]/10 px-3 py-1 text-[10px] font-bold text-[#b47e1e]">
                    {featured.categorie}
                  </span>
                  <span>{featured.date}</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" size={11} />
                    {featured.lecture} de lecture
                  </span>
                </div>
                {featured.verset ? (
                  <p className="mt-4 rounded-2xl bg-[#17294b] px-4 py-3 text-[11px] font-semibold italic leading-5 text-[#f2c56d]">
                    « {featured.verset} »
                  </p>
                ) : null}
                <h3 className="mt-4 text-[17px] font-bold leading-7 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                  {featured.titre}
                </h3>
                <p className="mt-2 line-clamp-3 text-[12px] leading-6 text-slate-500 dark:text-slate-400">{featured.extrait}</p>
                <p className="mt-3 text-[10px] font-bold text-[#16233a] dark:text-slate-200">{featured.auteur}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
                    onClick={() => openArticle(featured)}
                    type="button"
                  >
                    Lire l&apos;article <Icon name="arrow-right" size={12} />
                  </button>
                  {featured.blogUrl ? (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#17294b]/20 bg-white px-4 py-2.5 text-[11px] font-bold text-[#17294b] transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200"
                      href={featured.blogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Blog <Icon name="arrow-right" size={12} />
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ) : null}

          {/* ── Grille ───────────────────────────────────── */}
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article, index) => (
              <motion.article
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36]"
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                key={article.id}
                transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                {article.diasporama[0] ? (
                  <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={article.titre}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      src={article.diasporama[0]}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#101a2d]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                      {article.categorie}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-5 pt-4">
                    <span className="rounded-full border border-[#f2c56d]/40 bg-[#f2c56d]/10 px-3 py-1 text-[10px] font-bold text-[#b47e1e]">
                      {article.categorie}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{article.date}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  {article.diasporama[0] ? (
                    <p className="text-[10px] font-semibold text-slate-400">{article.date}</p>
                  ) : null}
                  {article.verset ? (
                    <p className="mt-3 rounded-2xl bg-[#17294b] px-4 py-3 text-[11px] font-semibold italic leading-5 text-[#f2c56d]">
                      « {article.verset} »
                    </p>
                  ) : null}
                  <h3 className="mt-3 min-w-0 text-[14px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                    {article.titre}
                  </h3>
                  <p className="mt-2 line-clamp-2 min-w-0 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{article.extrait}</p>
                  <div className="min-h-4 flex-1" />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold text-[#16233a] dark:text-slate-200">{article.auteur}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                        <Icon name="clock" size={11} />
                        {article.lecture} de lecture
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {article.blogUrl ? (
                        <a
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#17294b]/20 bg-white px-3 py-2 text-[11px] font-bold text-[#17294b] transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200"
                          href={article.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Blog <Icon name="arrow-right" size={12} />
                        </a>
                      ) : null}
                      <button
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
                        onClick={() => openArticle(article)}
                        type="button"
                      >
                        Lire <Icon name="arrow-right" size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 rounded-2xl border border-[#f2c56d]/40 bg-[#f2c56d]/[0.06] px-4 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        Mode2Vie [Lifestyle] est notre blog de vie chrétienne : la foi, le travail et la famille, vécus au quotidien.
      </p>

      <AnimatePresence>
        {reading ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReading(null)}
            />
            <motion.div
              aria-label="Article Mode2Vie"
              aria-modal="true"
              className="pointer-events-auto relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">
                    Mode2Vie [Lifestyle] · {reading.categorie}
                  </p>
                  <h3 className="mt-1.5 pr-6 text-lg font-bold leading-7 tracking-[-0.03em] text-[#16233a] dark:text-white">
                    {reading.titre}
                  </h3>
                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    {reading.auteur} · {reading.date} · {reading.lecture} de lecture
                  </p>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
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
                          onClick={() => setDiasporaIndex((prev) => (prev === 0 ? reading.diasporama.length - 1 : prev - 1))}
                          type="button"
                        >
                          <Icon name="arrow-right" size={16} className="rotate-180" />
                        </button>
                        <button
                          aria-label="Image suivante"
                          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                          onClick={() => setDiasporaIndex((prev) => (prev === reading.diasporama.length - 1 ? 0 : prev + 1))}
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
                  <p className="text-[13px] leading-7 text-slate-600 dark:text-slate-300" key={index}>
                    {paragraphe}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="sparkles" size={15} className="shrink-0 text-[#b47e1e]" />
                  <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    Partagé avec la communauté WUGAMS
                  </p>
                </div>
                {reading.blogUrl ? (
                  <a
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61]"
                    href={reading.blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lire sur le blog <Icon name="arrow-right" size={12} />
                  </a>
                ) : null}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
