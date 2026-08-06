"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { Icon } from "@/app/components/ui/app-icon";

type SupplierAccessGuardProps = {
  children: ReactNode;
};

export function SupplierAccessGuard({ children }: SupplierAccessGuardProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  if (user.role !== "ROLE_FOURNISSEUR") {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f7f9fc] p-6 dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <Icon name="shield" size={26} />
          </span>
          <h1 className="mt-4 text-[17px] font-extrabold text-[#17294b] dark:text-slate-100">Accès refusé</h1>
          <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            Cet espace est réservé aux comptes fournisseurs WUGAMS. Votre session actuelle ne permet pas d&apos;y accéder.
          </p>
          <button
            className="mt-6 min-h-12 w-full rounded-2xl bg-[#1e40af] text-[13px] font-extrabold text-white transition hover:bg-[#1e3a8a]"
            onClick={() => void logout().then(() => router.push("/connexion"))}
            type="button"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return children;
}
