import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { PulseButton } from "@/app/components/branding/pulse-button";
import { WugamsCleanCatalog } from "@/app/components/branding/wugams-clean-catalog";
import { WUGAMS_CLEAN_CONTACT } from "@/app/lib/wugams-clean-catalog";

export const metadata = {
  title: "WUGAMS CLEAN — Plan de Service & Abonnements",
  description:
    "Catalogue des offres de nettoyage de sanitaires & solution digitale intégrée : Plans A, B, C, options, application mobile, score d'hygiène.",
};

export default function WugamsCleanPublicPage() {
  return (
    <main className="bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-[1080px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Retour accueil WUGAMS">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:text-slate-900 sm:inline-flex"
            >
              ← Accueil
            </Link>
            <PulseButton href="/inscription">S&apos;abonner</PulseButton>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1080px] px-4 py-10 sm:px-6 sm:py-14">
        <WugamsCleanCatalog />

        <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-slate-950 px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-300">WUGAMS CLEAN</p>
            <p className="mt-1 text-lg font-bold">Prêt à garder des sanitaires impeccables ?</p>
            <p className="mt-1 text-xs text-slate-300">
              {WUGAMS_CLEAN_CONTACT.site} · {WUGAMS_CLEAN_CONTACT.email}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <PulseButton href="/inscription">Demander un devis</PulseButton>
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Espace client
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
