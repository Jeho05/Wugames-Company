import Link from "next/link";

import { WorkerLoginForm } from "@/app/components/auth/worker-login-form";
import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";

export default function TravailleurLoginPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0b1526] p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1360px] overflow-hidden rounded-[24px] border border-white/10 bg-[#101c32] shadow-2xl shadow-black/40 sm:min-h-[calc(100dvh-3rem)] sm:rounded-[28px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-b from-[#17294b] to-[#0c1626] p-10 text-white lg:flex lg:flex-col">
          <div className="relative z-10">
            <BrandMark inverse />
          </div>
          <div className="relative z-10 my-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f2c56d]">
              <Icon name="hardhat" size={14} />
              Espace travailleur
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.06] tracking-[-0.055em]">
              Votre journée commence ici.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Accédez à vos missions du jour, vos services et l&apos;Espace Wu. Vos identifiants sont
              fournis par votre responsable WUGAMS.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              ["Missions du jour", "à valider plein terrain"],
              ["Suivi & preuves", "photos avant / après"],
              ["Primes & salaires", "retrait Mobile Money"],
            ].map(([value, label]) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={label}>
                <p className="text-base font-bold tracking-[-0.03em] text-[#f2c56d]">{value}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <span className="absolute -right-24 -top-24 size-80 rounded-full bg-[#e3a641]/15 blur-3xl" />
          <span className="absolute -bottom-28 left-8 size-72 rounded-full bg-sky-400/10 blur-3xl" />
        </section>

        <section className="flex items-center justify-center bg-[#0e1a2e] p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <BrandMark inverse />
            </div>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e3a641]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f2c56d] lg:mt-0">
              <Icon name="lock" size={14} />
              Connexion travailleur
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-white">
              Bon retour sur le terrain.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Connectez-vous avec vos identifiants WUGAMS pour accéder à votre espace.
            </p>
            <WorkerLoginForm />
            <p className="mt-7 text-center text-xs text-slate-500">
              <Link className="font-semibold text-[#f2c56d] hover:text-white" href="/vitrine">
                ← Voir la vitrine interne
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}