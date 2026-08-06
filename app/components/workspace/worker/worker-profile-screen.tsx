"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerOverview } from "@/app/lib/worker-data";

type WorkerProfileScreenProps = {
  overview: WorkerOverview;
  pendingCount: number;
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

export function WorkerProfileScreen({ overview, pendingCount, onLogout }: WorkerProfileScreenProps) {
  const { worker, filiale, twoFactor, email, phone } = overview;
  const [pushEnabled, setPushEnabled] = useState(true);
  const [rappelEnabled, setRappelEnabled] = useState(true);
  const [signatureEnabled, setSignatureEnabled] = useState(false);

  const initials = worker.nom
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="space-y-5">
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
