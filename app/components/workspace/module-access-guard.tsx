"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { useAuth } from "@/app/lib/auth-context";
import { canAccessHref } from "@/app/lib/permissions";
import { Icon } from "@/app/components/ui/app-icon";

/**
 * Garde RBAC frontend des routes directes `/espace/[module]`.
 * Vérifie `role + module → authorized` AVANT tout chargement réseau :
 * l'utilisateur interdit voit un état 403 explicite (pas une erreur API
 * après une longue attente). Même matrice que sidebar/recherche.
 * Le backend reste l'autorité finale (403 serveur).
 */
export function ModuleAccessGuard({ slug, children }: { slug: string; children: ReactNode }) {
  const { ready, user } = useAuth();
  const href = `/espace/${slug}`;

  if (!ready || !user) {
    return (
      <div className="grid min-h-[40vh] place-items-center" aria-busy="true">
        <div className="h-24 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!canAccessHref(href, user)) {
    return (
      <div className="grid min-h-[40vh] place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm" role="alert">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
            <Icon name="lock" size={22} />
          </span>
          <h2 className="mt-3 text-sm font-bold text-slate-800">Accès refusé (403)</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Votre rôle ne permet pas d&apos;accéder au module « {slug} ». Si vous pensez qu&apos;il s&apos;agit
            d&apos;une erreur, contactez votre administrateur.
          </p>
          <Link
            className="mt-4 inline-block rounded-xl bg-[#17294b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
            href="/espace"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
