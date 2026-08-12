"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { mode2vieArticles, mode2vieCategories } from "@/app/lib/mode2vie-data";
import type { Mode2VieArticle } from "@/app/lib/mode2vie-data";

type ClientMode2VieProps = {
  compact?: boolean;
  sectionId?: string;
};

export function ClientMode2Vie({ compact = false, sectionId = "portail-mode2vie" }: ClientMode2VieProps) {
  const [categorie, setCategorie] = useState("Tous");
  const [reading, setReading] = useState<Mode2VieArticle | null>(null);
  const reduce = useReducedMotion();

  const articles = categorie === "Tous"
    ? mode2vieArticles
    : mode2vieArticles.filter((article) => article.categorie === categorie);

  return (
    <ClientSection
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f2c56d]/50 bg-[#f2c56d]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#b47e1e]">
          <Icon name="sparkles" size={12} />
          Vie chrétienne
        </span>
      }
      icon="newspaper"
      id={sectionId}
      subtitle="Foi & Travail, versets du jour, témoignages — notre vie chrétienne au quotidien"
      title="Mode2Vie [Lifestyle]™"
    >
      <div className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        {mode2vieCategories.map((cat) => (
          <button
            className={
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
              (categorie === cat.id
                ? "border-[#17294b] bg-[#17294b] text-white shadow-lg shadow-[#17294b]/20"
                : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400")
            }
            key={cat.id}
            onClick={() => setCategorie(cat.id)}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => (
          <motion.article
            className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36]"
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            key={article.id}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-[#f2c56d]/40 bg-[#f2c56d]/10 px-2.5 py-1 text-[10px] font-bold text-[#b47e1e]">
                {article.categorie}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">{article.date}</span>
            </div>

            {article.verset ? (
              <p className="mt-4 rounded-2xl bg-[#17294b] px-3.5 py-3 text-[11px] font-semibold italic leading-5 text-[#f2c56d]">
                « {article.verset} »
              </p>
            ) : null}

            <h3 className="mt-4 text-[14px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
              {article.titre}
            </h3>
            <p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{article.extrait}</p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-[#16233a] dark:text-slate-200">{article.auteur}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <Icon name="clock" size={11} />
                  {article.lecture} de lecture
                </p>
              </div>
              <button
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
                onClick={() => setReading(article)}
                type="button"
              >
                Lire <Icon name="arrow-right" size={12} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-[#f2c56d]/40 bg-[#f2c56d]/[0.06] px-4 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        Mode2Vie [Lifestyle]™ est notre blog de vie chrétienne : la foi, le travail et la famille, vécus au quotidien.
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
              className="pointer-events-auto max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">
                    Mode2Vie [Lifestyle]™ · {reading.categorie}
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

              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                <Icon name="sparkles" size={15} className="text-[#b47e1e]" />
                <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Partagé avec la communauté WUGAMS — Mode2Vie [Lifestyle]™
                </p>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ClientSection>
  );
}