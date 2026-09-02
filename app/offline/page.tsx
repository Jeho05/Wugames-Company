"use client";

import Link from "next/link";
import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfcfe] p-6 text-[#17294b]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <BrandMark />
        <span className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
          <Icon name="warning" size={24} />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-[-0.035em]">Vous êtes hors ligne</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          La connexion est interrompue. Vérifiez votre réseau et réessayez. Vos données WUGAMS seront resynchronisées dès le retour en ligne.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-sm font-bold text-white">
            Retour à l&apos;accueil <Icon name="arrow-right" size={16} />
          </Link>
          <button onClick={() => typeof window !== "undefined" && window.location.reload()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
            Réessayer
          </button>
        </div>
      </div>
    </main>
  );
}
