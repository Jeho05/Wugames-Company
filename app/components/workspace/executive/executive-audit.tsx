"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { AuditLog } from "@/app/lib/contracts";

type ExecutiveAuditProps = {
  audits: AuditLog[];
};

const actionMeta: Record<string, { label: string; classes: string }> = {
  CREATE: { label: "Création", classes: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  UPDATE: { label: "Modification", classes: "border-amber-200 bg-amber-50 text-amber-800" },
  DELETE: { label: "Suppression", classes: "border-red-200 bg-red-50 text-red-700" },
};

const tableLabels: Record<string, string> = {
  missions: "Missions",
  factures: "Factures",
  clients: "Clients",
  stocks: "Stocks",
  utilisateurs: "Utilisateurs",
  fournisseurs: "Fournisseurs",
  produits: "Produits",
  filiales: "Filiales",
  evaluations: "Évaluations",
};

function formatDateTime(value: string): { date: string; time: string } {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "—" };
  return {
    date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

export function ExecutiveAudit({ audits }: ExecutiveAuditProps) {
  const reduce = useReducedMotion();

  return (
    <ExecutivePanel
      action={
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3e638e] transition hover:text-[#17294b]"
          href="/espace/administration?onglet=audit"
        >
          Journal complet <Icon name="arrow-right" size={14} />
        </Link>
      }
      icon="shield"
      subtitle="Traçabilité immuable des actions sensibles"
      title="Journal d'audit"
    >
      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="py-3 pr-4">Utilisateur</th>
              <th className="py-3 pr-4">Action</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Cible</th>
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 text-right">Heure</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td className="py-10 text-center text-sm text-slate-400" colSpan={6}>
                  Aucun événement d&apos;audit pour le moment.
                </td>
              </tr>
            ) : (
              audits.map((log, index) => {
                const action = actionMeta[log.action] ?? { label: log.action, classes: "border-slate-200 bg-slate-100 text-slate-600" };
                const { date, time } = formatDateTime(log.created_at);
                const name = log.user ? `${log.user.first_name} ${log.user.last_name}` : "—";
                const typeLabel = tableLabels[log.table_cible] ?? log.table_cible;

                return (
                  <motion.tr
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id}
                    transition={{ duration: 0.35, delay: 0.05 * index }}
                  >
                    <td className="py-3.5 pr-4">
                      <p className="text-[12px] font-bold text-[#16233a]">{name}</p>
                      <p className="text-[10px] text-slate-400">{log.user?.email ?? "—"}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={"inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold " + action.classes}>
                        {action.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-mono text-[10px] font-semibold text-slate-500">{log.table_cible}</span>
                      <p className="text-[10px] text-slate-400">{typeLabel}</p>
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-[10px] font-semibold text-slate-500">
                      {log.entite_id.slice(0, 10)}
                    </td>
                    <td className="py-3.5 pr-4 text-[11px] font-semibold text-slate-500">{date}</td>
                    <td className="py-3.5 text-right font-mono text-[11px] font-semibold text-slate-500">{time}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </ExecutivePanel>
  );
}
