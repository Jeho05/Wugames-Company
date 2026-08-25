"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { TwoFaForm } from "@/app/components/workspace/two-fa-form";
import { useAuth } from "@/app/lib/auth-context";
import { WorkspaceCommandSearch } from "@/app/components/workspace/workspace-command-search";
import { getHealth } from "@/app/lib/api/health";
import { API_BASE_URL, getSession } from "@/app/lib/api-client";
import { brandClickState, brandSecretArmed, signConsole } from "@/app/lib/easter-eggs";
import { useNotificationsStream } from "@/app/lib/use-notifications-stream";
import type { Notification } from "@/app/lib/contracts";
import type { StreamState } from "@/app/lib/use-notifications-stream";
import {
  adminNavigationGroup,
  clientNavigationGroups,
  navigationGroups,
  supplierNavigationGroup,
} from "@/app/lib/demo-data";

type BackOfficeShellProps = {
  children: ReactNode;
};

const clientRoles = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

const roleLabels: Record<string, string> = {
  ROLE_CLIENT_MEMBRE: "Client Membre",
  ROLE_CLIENT_STD: "Client",
  ROLE_COMPTABLE: "Comptable",
  ROLE_DEV_DIGITAL: "Dev Digital",
  ROLE_FOURNISSEUR: "Fournisseur",
  ROLE_GERANT: "Gérant",
  ROLE_MGR_FILIALE: "Manager Filiale",
  ROLE_MGR_OPS: "Manager Opérations",
  ROLE_MGR_PARTENAIRE: "Manager Partenariats",
  ROLE_OUVRIER: "Ouvrier",
  ROLE_RESP_OUVRIERS: "Resp. Ouvriers",
  ROLE_SECRETAIRE: "Secrétaire",
};

export function BackOfficeShell({ children }: BackOfficeShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showTwoFa, setShowTwoFa] = useState(false);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [brandClicks, setBrandClicks] = useState<{ hits: number; lastAt: number } | null>(null);
  const [showCoffre, setShowCoffre] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then(() => {
        if (!cancelled) setHealthOk(true);
      })
      .catch(() => {
        if (!cancelled) setHealthOk(false);
      });
    signConsole();
    return () => {
      cancelled = true;
    };
  }, []);

  const streamEnabled = user !== null && !clientRoles.has(user.role);
  const streamState = useNotificationsStream(streamEnabled, (notification: Notification) => {
    if (!notification.lu) setLiveUnread((count) => count + 1);
  });

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (pathname === "/espace/notifications") setLiveUnread(0);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        window.dispatchEvent(new Event("wugams:open-search"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!user) {
    return null;
  }

  const isClient = clientRoles.has(user.role);
  const isAdmin = user.role === "ROLE_GERANT" || user.role === "ROLE_DEV_DIGITAL";
  const groups = [
    ...(isClient ? clientNavigationGroups : user.role === "ROLE_FOURNISSEUR" ? supplierNavigationGroup : navigationGroups),
    ...(isAdmin ? [adminNavigationGroup] : []),
  ];
  const roleLabel = roleLabels[user.role] ?? user.role;

  function handleLogout() {
    void logout().then(() => router.push("/connexion"));
  }

  function handleBrandClick() {
    const next = brandClickState(brandClicks ?? undefined);
    setBrandClicks(next);
    if (brandSecretArmed(next)) {
      setShowCoffre(true);
      setBrandClicks(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#16233a]">
      {mobileOpen ? (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/10 bg-[#101a2d] px-4 pb-5 pt-6 shadow-2xl shadow-slate-950/15 transition-transform duration-200 lg:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-2">
          <span onClick={handleBrandClick} role="presentation">
            <BrandMark href="/espace" inverse />
          </span>
          <button
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </p>
              <nav className="mt-2 space-y-1" aria-label={group.label}>
                {group.items.map((item) => {
                  const active =
                    item.href === "/espace"
                      ? pathname === "/espace"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition " +
                        (active
                          ? "bg-[#243656] text-white shadow-lg shadow-slate-950/20"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white")
                      }
                      href={item.href}
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span
                        className={
                          "grid size-7 place-items-center rounded-lg transition " +
                          (active
                            ? "bg-[#e6ac49] text-[#10203a]"
                            : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200")
                        }
                      >
                        <Icon name={item.icon} size={16} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {!isClient ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#e6ac49]/15 text-[#f5c66f]">
                <Icon name="shield" size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Périmètre sécurisé</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  Filiale et rôle appliqués automatiquement.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <Link
          className="mt-4 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          href="/"
        >
          <span className="flex items-center gap-3">
            <Icon name="arrow-right" className="rotate-180" size={17} />
            {isClient ? "Retour à l\u2019accueil" : "Voir la vitrine"}
          </span>
        </Link>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-[#f5f7fb]/90 px-4 backdrop-blur xl:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Icon name="menu" size={19} />
            </button>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {isClient ? "Espace client" : "Espace de pilotage"}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#22314b]">
                {user.filiale}
              </p>
            </div>
            <span
              className={
                "hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide md:inline-flex " +
                (healthOk === false
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700")
              }
            >
              {healthOk === false ? "API hors ligne" : healthOk === null ? "Vérification API…" : "API connectée"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <WorkspaceCommandSearch />
            {!isClient ? (
              <Link
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#17294b]"
                href="/espace/notifications"
                title={streamState === "live" ? "Notifications en direct" : "Notifications"}
              >
                <Icon name="bell" size={18} />
                {liveUnread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[#db6d5b] px-1 text-[9px] font-black text-white ring-2 ring-[#f5f7fb]">
                    {liveUnread > 99 ? "99+" : liveUnread}
                  </span>
                ) : (
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#db6d5b] ring-2 ring-white" />
                )}
              </Link>
            ) : null}
            <div className="relative">
              {userMenuOpen ? (
                <button
                  aria-label="Fermer le menu utilisateur"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setUserMenuOpen(false)}
                  type="button"
                />
              ) : null}
              <button
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-slate-300"
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                title="Menu du compte"
              >
                <span className="grid size-7 place-items-center rounded-lg bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                  {user.initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[11px] font-bold text-slate-700">{user.name}</span>
                  <span className="block text-[9px] font-medium text-slate-400">{roleLabel}</span>
                </span>
                <Icon className="hidden text-slate-400 sm:block" name="chevron-down" size={14} />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold text-[#17294b]">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#17294b]"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowTwoFa(true);
                      }}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                        <Icon name="shield" size={15} />
                      </span>
                      Sécurité · Gérer la 2FA
                    </button>
                    <button
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      onClick={handleLogout}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-red-50 text-red-500">
                        <Icon name="arrow-right" className="rotate-180" size={15} />
                      </span>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {showTwoFa ? <TwoFaForm onClose={() => setShowTwoFa(false)} /> : null}

      {showCoffre ? <CoffreDuGerant onClose={() => setShowCoffre(false)} streamState={streamState} /> : null}
    </div>
  );
}

function CoffreDuGerant({ onClose, streamState }: { onClose: () => void; streamState: StreamState }) {
  const { user } = useAuth();
  const session = getSession();

  const rows = [
    { label: "Utilisateur", value: user ? `${user.name} · ${user.role}` : "—" },
    { label: "Filiale", value: user?.filiale ?? "—" },
    { label: "Base API", value: API_BASE_URL },
    { label: "Session", value: session ? "Jeton actif" : "Aucune session" },
    { label: "Flux temps réel", value: streamState === "live" ? "connecté" : "hors ligne" },
  ];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#0b1530]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#101a2d] text-white shadow-2xl ring-1 ring-[#e6ac49]/30">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black tracking-[-0.02em]">
            <Icon name="shield" size={16} style={{ color: "#e6ac49" }} />
            Coffre du gérant
          </h2>
          <button
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={17} />
          </button>
        </div>
        <div className="space-y-2.5 p-5">
          <p className="text-[11px] leading-5 text-slate-400">
            Accès dérobé n°1 du back-office. Données système en lecture seule — rien ne peut être
            modifié ici.
          </p>
          {rows.map((row) => (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
              key={row.label}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c6889]">
                {row.label}
              </span>
              <span className="truncate font-mono text-[11px] font-bold text-[#c3cbdf]">{row.value}</span>
            </div>
          ))}
          <p className="rounded-xl bg-[#e6ac49]/10 px-3 py-2.5 text-[11px] leading-5 text-[#f2c56d]">
            « Qui contrôle le coffre contrôle l&apos;ERP. » — 5 clics rapides sur le logo, encore
            5, et le coffre se referme.
          </p>
          <button
            className="w-full rounded-xl bg-[#e6ac49] px-4 py-2.5 text-xs font-black text-[#101827] transition hover:bg-[#f2c56d]"
            onClick={onClose}
            type="button"
          >
            Refermer le coffre
          </button>
        </div>
      </div>
    </div>
  );
}
