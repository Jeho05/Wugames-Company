"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientCleans } from "@/app/components/workspace/client/client-cleans";
import { demoCleansOverview } from "@/app/lib/cleans-data";

/**
 * Page Wugams Clean — abonnement entretien, plans et suivi des passages.
 * (Remplace l'ancienne page « Espaces Wugams » : uniquement Wugams Clean.)
 */
export function ClientCleanScreen() {
  const cleans = demoCleansOverview;
  const actif = cleans.abonnement.statut === "ACTIF";
  const valides = cleans.services.filter((s) => s.statut === "VALIDE").length;

  const stats = [
    { value: String(cleans.services.length), label: "toilettes suivies" },
    { value: String(valides), label: "passages validés" },
    { value: cleans.abonnement.prochainPassage ?? "—", label: "prochain passage" },
  ];

  return (
    <div className="mx-auto w-full max-w-[880px] space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17294b] via-[#1d3461] to-[#101f3a] p-6 shadow-xl shadow-[#17294b]/20 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -right-16 -top-20 size-64 rounded-full bg-[#e3a641]/25 blur-[80px]" />
          <span className="absolute -bottom-24 -left-10 size-56 rounded-full bg-sky-400/15 blur-[70px]" />
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f2c56d]/50 bg-[#f2c56d]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f2c56d]">
              <Icon name="sparkles" size={12} />
              Wugams Clean
            </span>
            {actif ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Abonnement actif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                Sans abonnement
              </span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[28px]">
            Un espace impeccable, <span className="text-[#f2c56d]">sans y penser</span>.
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300">
            Entretien régulier de vos toilettes par nos Cleaners, preuve photo avant / après à chaque passage.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center backdrop-blur-sm"
                key={stat.label}
              >
                <dd className="truncate text-sm font-extrabold tracking-tight text-white sm:text-base">{stat.value}</dd>
                <dt className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ClientCleans cleans={cleans} sectionId="espace-clean" embedded />
    </div>
  );
}
