"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authTrace } from "@/app/lib/api-client";
import { useAuth } from "@/app/lib/auth-context";
import { BackOfficeShell } from "@/app/components/workspace/back-office-shell";

function WorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]" aria-busy="true" aria-label="Restauration de la session en cours">
      <div className="flex min-h-screen">
        <div className="hidden w-[264px] shrink-0 flex-col gap-3 bg-[#0c1424] p-4 lg:flex">
          <div className="h-8 animate-pulse rounded-lg bg-white/10" />
          <div className="h-14 animate-pulse rounded-xl bg-white/10" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="h-[68px] animate-pulse rounded-2xl bg-white shadow-sm" />
          <p className="mt-4 text-xs font-semibold text-slate-500" role="status">
            Restauration de votre session…
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { ready, user, restoreStatus, restoreError, retryRestore } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user && restoreStatus !== "error") {
      authTrace("redirect-to-login", "espace sans session");
      router.replace("/connexion?redirect=" + encodeURIComponent("/espace"));
    }
  }, [ready, user, restoreStatus, router]);

  // Restauration en cours : skeleton explicite, jamais d'écran vide/mort.
  if (!ready || restoreStatus === "restoring") {
    return <WorkspaceSkeleton />;
  }

  // Erreur réseau/serveur temporaire : état retryable, pas de fausse déconnexion.
  if (restoreStatus === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6f9] p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-800">Session non restaurée</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {restoreError ?? "Le serveur est momentanément indisponible. Vos identifiants restent valides."}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
              onClick={retryRestore}
              type="button"
            >
              Réessayer
            </button>
            <button
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              onClick={() => router.replace("/connexion?redirect=" + encodeURIComponent("/espace"))}
              type="button"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirection vers /connexion en cours : skeleton plutôt que `null` brutal.
    return <WorkspaceSkeleton />;
  }

  return <BackOfficeShell>{children}</BackOfficeShell>;
}
