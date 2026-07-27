import Link from "next/link";

import { RegisterForm } from "@/app/components/auth/register-form";
import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1360px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.08fr_0.92fr] sm:min-h-[calc(100vh-3rem)]">
        <section className="relative hidden overflow-hidden bg-[#17294b] p-10 text-white lg:flex lg:flex-col">
          <div className="relative z-10">
            <BrandMark inverse />
          </div>
          <div className="relative z-10 my-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f2c56d]">
              <Icon name="sparkles" size={14} />
              Rejoignez WUGAMS
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.06] tracking-[-0.055em]">
              Votre espace client, un accès à vos projets.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Suivez vos travaux, échangez avec vos équipes, consultez vos documents et payez en ligne. Tout est au même endroit.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              ["48h", "Délai de devis"],
              ["1 200+", "Projets livrés"],
              ["4,7/5", "Satisfaction"],
            ].map(([value, label]) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={label}>
                <p className="text-2xl font-bold tracking-[-0.04em] text-[#f2c56d]">{value}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <span className="absolute -right-24 -top-24 size-80 rounded-full bg-[#e3a641]/20 blur-3xl" />
          <span className="absolute -bottom-28 left-8 size-72 rounded-full bg-sky-400/15 blur-3xl" />
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <BrandMark />
            </div>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#edf6ff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#426b95] lg:mt-0">
              <Icon name="plus" size={14} />
              Inscription
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[#17294b]">
              Créez votre espace.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Inscrivez-vous en quelques secondes pour suivre vos projets et demander des devis.
            </p>
            <RegisterForm />
            <p className="mt-7 text-center text-xs text-slate-500">
              Vous avez déjà un compte ?{" "}
              <Link className="font-bold text-[#426b95] hover:text-[#17294b]" href="/connexion">
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
