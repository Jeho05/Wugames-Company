"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { formatFcfa } from "@/app/lib/store-data";
import type { ClientCommandeView } from "@/app/lib/client-data";
import { CommandeBadge } from "@/app/components/workspace/client/client-status";
import { ClientSection } from "@/app/components/workspace/client/client-section";

type ClientCommandesProps = {
  commandes: ClientCommandeView[];
};

export function ClientCommandes({ commandes }: ClientCommandesProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ClientSection
      action={
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          {commandes.length} commandes au total
        </span>
      }
      icon="box"
      id="portail-commandes"
      subtitle="Vos commandes passées à la boutique WUGAMS"
      title="Mes commandes"
    >
      {commandes.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <Icon name="box" size={22} className="text-slate-300" />
          <p className="text-sm font-bold text-[#16233a] dark:text-slate-200">Aucune commande pour le moment</p>
          <p className="max-w-64 text-xs leading-5 text-slate-400">
            Commandez sur l&apos;Espace Wu : vos commandes apparaîtront ici avec leur suivi.
          </p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Commande</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Date</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">État</th>
                <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Articles</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Montant</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Voir</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((commande, index) => {
                const isOpen = expanded === commande.id;
                return (
                  <FragmentRow commande={commande} index={index} isOpen={isOpen} key={commande.id} onToggle={() => setExpanded(isOpen ? null : commande.id)} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </ClientSection>
  );
}

function FragmentRow({
  commande,
  index,
  isOpen,
  onToggle,
}: {
  commande: ClientCommandeView;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <motion.tr
        className={
          "border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03] " +
          (isOpen ? "bg-slate-50/70 dark:bg-white/[0.03]" : "")
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
      >
        <td className="px-5 py-4">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
              <Icon name="shopping-bag" size={15} />
            </span>
            <span className="text-[13px] font-bold text-[#16233a] dark:text-slate-100">{commande.numero}</span>
          </span>
        </td>
        <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{commande.date}</td>
        <td className="px-5 py-4">
          <CommandeBadge statut={commande.statut} />
        </td>
        <td className="px-5 py-4 text-center text-[13px] font-bold tabular-nums text-[#16233a] dark:text-slate-100">
          {commande.nbArticles}
        </td>
        <td className="px-5 py-4 text-right text-[13px] font-bold tabular-nums text-[#16233a] dark:text-slate-100">
          {formatFcfa(commande.montant)}
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-end">
            <button
              aria-expanded={isOpen}
              className={
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (isOpen
                  ? "border-[#17294b] bg-[#17294b] text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#17294b]")
              }
              onClick={onToggle}
              type="button"
            >
              {isOpen ? "Masquer" : "Voir"}
              <Icon name="chevron-down" className={isOpen ? "rotate-180" : ""} size={13} />
            </button>
          </div>
        </td>
      </motion.tr>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.tr
            className="border-b border-slate-100 bg-[#fafbfd] last:border-0 dark:border-white/5 dark:bg-white/[0.02]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <td className="px-5 pb-5 pt-1" colSpan={6}>
              {commande.articles.length > 0 ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {commande.articles.map((article) => (
                    <li
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-[#101c36] dark:text-slate-300"
                      key={article}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                        <Icon name="package" size={12} />
                      </span>
                      {article}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5 text-[11px] font-semibold text-slate-400">
                  Détail de la commande disponible sous peu.
                </p>
              )}
            </td>
          </motion.tr>
        ) : null}
      </AnimatePresence>
    </>
  );
}
