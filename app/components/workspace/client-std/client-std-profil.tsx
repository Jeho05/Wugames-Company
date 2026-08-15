"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { TwoFaForm } from "@/app/components/workspace/two-fa-form";

type ClientStdProfilProps = {
  user: WorkspaceUser;
};

const contactRows: { label: string; value: string; icon: IconName }[] = [
  { label: "Téléphone", value: "+225 07 12 36 45 80", icon: "phone" },
  { label: "Email", value: "contact@wugams.com", icon: "mail" },
  { label: "Adresse", value: "Villa 42, Boulevard Latrille · Abidjan", icon: "map" },
  { label: "Entreprise", value: "Particulier · WUGAMS BTP & Services", icon: "building" },
];

export function ClientStdProfil({ user }: ClientStdProfilProps) {
  const [twoFa, setTwoFa] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    void logout().then(() => router.push("/connexion"));
  }

  function ouvrirTwoFa() {
    setTwoFaOpen(true);
  }

  function fermerTwoFa() {
    setTwoFaOpen(false);
    void import("@/app/lib/api/auth")
      .then(async ({ me }) => {
        const payload = await me();
        setTwoFa(payload.two_factor_enabled);
      })
      .catch(() => {
        /* API injoignable : conserver l'état local. */
      });
  }

  return (
    <ClientSection icon="user" id="std-profil" subtitle="Vos informations et la sécurité de votre compte" title="Mon profil">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <motion.article
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]"
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-[#17294b] to-[#3b5b8c] text-2xl font-extrabold tracking-tight text-[#f2c56d] shadow-lg shadow-[#17294b]/20">
                {user.initials}
              </span>
              <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white dark:border-[#101c36]">
                <Icon name="check" size={12} />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Client WUGAMS</p>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#16233a] dark:text-white">{user.name}</h3>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#17294b]/15 bg-[#17294b]/[0.05] px-2.5 py-1 text-[11px] font-bold text-[#17294b] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
                  <Icon name="shield" size={12} />
                  Compte actif
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                  <Icon name="user" size={12} />
                  Client standard
                </span>
              </div>
            </div>
          </div>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            {contactRows.map((row) => (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#fafbfd] px-4 py-3.5 dark:border-white/5 dark:bg-white/[0.03]" key={row.label}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                  <Icon name={row.icon} size={16} />
                </span>
                <div className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{row.label}</dt>
                  <dd className="mt-0.5 truncate text-xs font-bold text-slate-700 dark:text-slate-300">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </motion.article>

        <motion.article
          className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]"
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#17294b] text-[#f2c56d]">
              <Icon name="lock" size={18} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold tracking-[-0.02em] text-[#16233a] dark:text-white">Sécurité</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Protection de votre compte</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-[#fafbfd] px-4 py-3.5 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <span
                className={
                  "grid size-9 place-items-center rounded-xl " +
                  (twoFa ? "bg-emerald-500/[0.12] text-emerald-600" : "bg-slate-200/70 text-slate-500")
                }
              >
                <Icon name="shield" size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Double authentification</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {twoFa ? "Activée — votre compte est protégé" : "Recommandée pour sécuriser vos accès"}
                </p>
              </div>
            </div>
            <button
              aria-checked={twoFa}
              aria-label="Activer la double authentification"
              className={
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (twoFa ? "bg-emerald-500" : "bg-slate-300")
              }
              onClick={ouvrirTwoFa}
              role="switch"
              type="button"
            >
              <span
                className={
                  "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " +
                  (twoFa ? "left-[22px]" : "left-0.5")
                }
              />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#fafbfd] px-4 py-3.5 dark:border-white/5 dark:bg-white/[0.03]">
            <span className="grid size-9 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
              <Icon name="lock" size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Session sécurisée</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Connexion chiffrée de bout en bout</p>
            </div>
          </div>

          <div className="mt-auto pt-5">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              disabled={loggingOut}
              onClick={handleLogout}
              type="button"
            >
              {loggingOut ? (
                <Icon name="refresh" className="animate-spin" size={15} />
              ) : (
                <Icon name="logout" size={15} />
              )}
              {loggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
            <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
              Vous pourrez vous reconnecter à tout moment.
            </p>
          </div>
        </motion.article>
      </div>
      {twoFaOpen ? <TwoFaForm onClose={fermerTwoFa} /> : null}
    </ClientSection>
  );
}
