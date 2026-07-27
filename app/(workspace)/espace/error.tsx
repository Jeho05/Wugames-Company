"use client";

import { Icon } from "@/app/components/ui/app-icon";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Icon name="warning" size={22} />
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#17294b]">
          Cette vue ne se charge pas
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error.message || "Une erreur est survenue pendant le chargement de l'espace."}
        </p>
        <button
          className="mt-6 rounded-xl bg-[#17294b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#243a61]"
          onClick={() => reset()}
          type="button"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
