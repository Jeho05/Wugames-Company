"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerOverview } from "@/app/lib/worker-data";
import type { WorkerPrime } from "@/app/lib/worker-services-data";
import { formatMontantFcfa } from "@/app/lib/worker-services-data";
import { ClientMode2Vie } from "@/app/components/workspace/client/client-mode2vie";

type WorkerProfileScreenProps = {
  overview: WorkerOverview;
  pendingCount: number;
  prime: WorkerPrime | null;
  onPrimeWithdrawn: (primeId: string) => void;
  onLogout: () => void;
};

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      aria-checked={enabled}
      aria-label={label}
      className={
        "relative h-7 w-12 shrink-0 rounded-full transition-colors " + (enabled ? "bg-[#0f7a5f]" : "bg-slate-200")
      }
      onClick={() => onChange(!enabled)}
      role="switch"
      type="button"
    >
      <span
        className={
          "absolute top-0.5 grid size-6 place-items-center rounded-full bg-white shadow transition-all " +
          (enabled ? "left-[22px]" : "left-0.5")
        }
      >
        <Icon className={enabled ? "text-[#0f7a5f]" : "text-slate-300"} name="check" size={10} />
      </span>
    </button>
  );
}

export function WorkerProfileScreen({ overview, pendingCount, prime, onPrimeWithdrawn, onLogout }: WorkerProfileScreenProps) {
  const { worker, filiale, twoFactor, email, phone } = overview;
  const [pushEnabled, setPushEnabled] = useState(true);
  const [rappelEnabled, setRappelEnabled] = useState(true);
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [mode2vieOpen, setMode2vieOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutMode, setPayoutMode] = useState<"momo" | "bank" | null>(null);
  const [payoutDone, setPayoutDone] = useState(false);
  const reduce = useReducedMotion();

  const primeDisponible = prime && prime.statut === "DISPONIBLE" ? prime : null;

  const initials = worker.nom
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  function confirmerRetrait() {
    if (!primeDisponible) return;
    setPayoutDone(true);
    setPayoutMode(null);
  }

  return (
    <div className="space-y-5">
      {mode2vieOpen ? (
        <section aria-label="Mode2Vie">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Mode2Vie [Lifestyle]™</p>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500"
              onClick={() => setMode2vieOpen(false)}
              type="button"
            >
              <Icon name="close" size={12} />
              Fermer
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <ClientMode2Vie compact sectionId="worker-mode2vie" />
          </div>
        </section>
      ) : null}

      <section aria-label="Profil" className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.05]">
        <div className="bg-gradient-to-br from-[#0f7a5f] via-[#0e6e57] to-[#0c5f4b] p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg font-extrabold text-white ring-2 ring-white/25">
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-extrabold text-white">{worker.nom}</h2>
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-100/90">
                {worker.specialite} · Matricule {worker.matricule}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-white">
                <Icon name="building" size={10} />
                {filiale}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {[
            { label: "Missions", value: "—", note: "en cours" },
            { label: "Pointages", value: "—", note: "ce cycle" },
            { label: "Photos", value: "—", note: "envoyées" },
          ].map((item) => (
            <div className="px-3 py-4 text-center" key={item.label}>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-xl font-extrabold text-[#16233a]">{item.value}</p>
              <p className="text-[9px] text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Informations de compte" className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.05]">
        <h3 className="px-5 pt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Compte & sécurité</h3>
        <ul className="mt-2 divide-y divide-slate-100 px-5 pb-2">
          <li className="flex items-center gap-3 py-3.5">
            <Icon className="text-slate-400" name="users" size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#16233a]">Email</p>
              <p className="truncate text-[11px] text-slate-400">{email || "Non renseigné"}</p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <Icon className="text-slate-400" name="message" size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#16233a]">Téléphone</p>
              <p className="text-[11px] text-slate-400">{phone || "Non renseigné"}</p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <Icon className="text-slate-400" name="lock" size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#16233a]">Double authentification</p>
              <p className="text-[11px] text-slate-400">{twoFactor ? "Activée sur votre compte" : "Non activée"}</p>
            </div>
            <span className={"rounded-full px-2.5 py-1 text-[9px] font-extrabold " + (twoFactor ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
              {twoFactor ? "Activée" : "À activer"}
            </span>
          </li>
        </ul>
      </section>

      <section aria-label="Espaces WUGAMS" className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.05]">
        <h3 className="px-5 pt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Espaces accessibles</h3>
        <div className="mt-2 grid grid-cols-3 gap-2.5 px-5 pb-5">
          <Link
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center transition hover:border-[#e3a641]/40 hover:bg-white hover:shadow-md"
            href="/boutique"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#0f7a5f]/10 text-[#0f7a5f] transition group-hover:scale-105">
              <Icon name="shopping-bag" size={17} />
            </span>
            <span className="text-[10px] font-bold text-[#16233a]">Espace Wu</span>
            <span className="text-[8px] leading-3 text-slate-400">Boutique membre</span>
          </Link>
          <Link
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center transition hover:border-[#e3a641]/40 hover:bg-white hover:shadow-md"
            href="/blog"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#17294b]/[0.07] text-[#17294b] transition group-hover:scale-105">
              <Icon name="newspaper" size={17} />
            </span>
            <span className="text-[10px] font-bold text-[#16233a]">Blog</span>
            <span className="text-[8px] leading-3 text-slate-400">Conseils & actualités</span>
          </Link>
          <button
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center transition hover:border-[#e3a641]/40 hover:bg-white hover:shadow-md"
            onClick={() => setMode2vieOpen((open) => !open)}
            type="button"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#e3a641]/[0.14] text-[#b47e1e] transition group-hover:scale-105">
              <Icon name="sparkles" size={17} />
            </span>
            <span className="text-[10px] font-bold text-[#16233a]">Mode2Vie™</span>
            <span className="text-[8px] leading-3 text-slate-400">Vie chrétienne</span>
          </button>
        </div>
      </section>

      {/* Primes & salaire */}
      <section aria-label="Primes et salaire" className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.05]">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Primes & salaire</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">Retrait MoMo ou bancaire</span>
        </div>
        <div className="px-5 pb-5">
          {primeDisponible ? (
            <div className="mt-3 rounded-2xl border border-[#e3a641]/40 bg-[#e3a641]/[0.08] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#16233a]">
                    <Icon name="sparkles" size={14} className="text-[#b47e1e]" />
                    {primeDisponible.libelle}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">{primeDisponible.date}</p>
                  <p className="mt-2 text-xl font-extrabold tabular-nums text-[#0f7a5f]">
                    {formatMontantFcfa(primeDisponible.montant)}
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-2xl bg-[#0f7a5f] px-4 py-2.5 text-[11px] font-extrabold text-white shadow-lg shadow-emerald-900/20 transition active:scale-[0.98]"
                  onClick={() => setPayoutOpen(true)}
                  type="button"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3.5 text-[11px] leading-5 text-slate-400 dark:bg-white/[0.03]">
              Aucune prime disponible pour le moment. Votre salaire est notifié ici dès qu&apos;il est prêt.
            </p>
          )}
        </div>
      </section>

      <section aria-label="Préférences" className="rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.05]">
        <h3 className="px-5 pt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Préférences</h3>
        <ul className="mt-2 divide-y divide-slate-100 px-5 pb-2">
          <li className="flex items-center justify-between gap-3 py-3.5">
            <div>
              <p className="text-[12px] font-bold text-[#16233a]">Notifications push</p>
              <p className="text-[10px] text-slate-400">Nouvelles missions et rappels</p>
            </div>
            <Toggle enabled={pushEnabled} label="Notifications push" onChange={setPushEnabled} />
          </li>
          <li className="flex items-center justify-between gap-3 py-3.5">
            <div>
              <p className="text-[12px] font-bold text-[#16233a]">Rappels de mission</p>
              <p className="text-[10px] text-slate-400">Le matin, 2 h avant le début</p>
            </div>
            <Toggle enabled={rappelEnabled} label="Rappels de mission" onChange={setRappelEnabled} />
          </li>
          <li className="flex items-center justify-between gap-3 py-3.5">
            <div>
              <p className="text-[12px] font-bold text-[#16233a]">Signature de pointage</p>
              <p className="text-[10px] text-slate-400">Confirmation visuelle en arrivée</p>
            </div>
            <Toggle enabled={signatureEnabled} label="Signature de pointage" onChange={setSignatureEnabled} />
          </li>
          <li className="flex items-center gap-3 py-3.5">
            <Icon className="text-slate-400" name="refresh" size={16} />
            <div className="flex-1">
              <p className="text-[12px] font-bold text-[#16233a]">Synchronisation</p>
              <p className="text-[10px] text-slate-400">
                {pendingCount === 0 ? "À jour" : `${pendingCount} action(s) en attente du réseau`}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">Auto</span>
          </li>
        </ul>
      </section>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-4 text-[13px] font-extrabold text-rose-600 transition active:scale-[0.99]"
        onClick={onLogout}
        style={{ minHeight: 52 }}
        type="button"
      >
        <Icon name="arrow-up-right" className="rotate-45" size={15} />
        Se déconnecter
      </button>
      <p className="pb-2 text-center text-[9px] text-slate-300">WUGAMS · Espace ouvrier · v1.0</p>
    </div>
  );
}
