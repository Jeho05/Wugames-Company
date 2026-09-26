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
import { canManageVitrine } from "@/app/lib/vitrine-store";
import { NotificationToaster } from "@/app/components/workspace/notification-toaster";
import { AccountSheet } from "@/app/components/workspace/account-sheet";
import { resolveNotificationTarget } from "@/app/lib/notification-target";

import { listFiliales } from "@/app/lib/api/filiales";
import type { Filiale } from "@/app/lib/contracts";

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
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [filialeDropdownOpen, setFilialeDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTwoFa, setShowTwoFa] = useState(false);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [brandClicks, setBrandClicks] = useState<{ hits: number; lastAt: number } | null>(null);
  const [showCoffre, setShowCoffre] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);
  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [selectedFilialeId, setSelectedFilialeId] = useState<string>("all");
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, sessionExpired, clearSessionExpired } = useAuth();

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then(() => {
        if (!cancelled) setHealthOk(true);
      })
      .catch(() => {
        if (!cancelled) setHealthOk(false);
      });
    listFiliales()
      .then((data) => {
        if (!cancelled) setFiliales(data);
      })
      .catch(() => undefined);
    signConsole();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectFiliale = (id: string) => {
    setSelectedFilialeId(id);
    setFilialeDropdownOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wugams:filiale-change", {
          detail: { filialeId: id === "all" ? null : id },
        })
      );
    }
  };

  const streamEnabled = user !== null && !clientRoles.has(user.role);
  const streamState = useNotificationsStream(streamEnabled, (notification: Notification) => {
    if (!notification.lu) setLiveUnread((count) => count + 1);
    try {
      const target = resolveNotificationTarget(notification, user?.role ?? null);
      window.dispatchEvent(
        new CustomEvent("wugams:notify", {
          detail: { notification, href: target?.href ?? null, label: target?.label ?? null },
        })
      );
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as unknown as { vibrate: (n: number[]) => void }).vibrate([80, 40, 80]);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  });

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (pathname === "/espace/notifications") setLiveUnread(0);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "?" || (event.key === "k" && (event.metaKey || event.ctrlKey))) && !event.altKey) {
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
  const canVitrine = canManageVitrine(user);
  const vitrineGroup = {
    label: "Vitrine",
    items: [{ href: "/espace/vitrine", icon: "sparkles" as const, label: "Vitrine & Contenus" }],
  };
  const groups = [
    ...(isClient ? clientNavigationGroups : user.role === "ROLE_FOURNISSEUR" ? supplierNavigationGroup : navigationGroups),
    ...(isAdmin ? [adminNavigationGroup] : []),
    ...(canVitrine && !isAdmin ? [vitrineGroup] : []),
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

  const currentFilialeLabel =
    selectedFilialeId === "all"
      ? "Toutes les filiales (Consolidé)"
      : filiales.find((f) => f.id === selectedFilialeId)?.nom ?? user.filiale ?? "Filiale";

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#16233a]">
      {mobileOpen ? (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      {/* Flowdash Dark Sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-[#1e293b] bg-[#0c1424] px-3.5 pb-4 pt-5 shadow-2xl transition-transform duration-200 lg:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-4 border-b border-white/[0.07]">
          <span onClick={handleBrandClick} role="presentation" className="cursor-pointer">
            <BrandMark href="/espace" inverse />
          </span>
          <button
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="my-4 flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 border border-white/[0.06]">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e3a641]/20 text-[#e3a641] text-xs font-bold border border-[#e3a641]/30">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.name}</p>
            <p className="truncate text-[10px] font-medium text-slate-400">{roleLabel}</p>
          </div>
          <span className="size-2 shrink-0 rounded-full bg-emerald-400 ring-2 ring-[#0c1424]" title="En ligne" />
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-none">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {group.label}
              </p>
              <nav className="mt-1.5 space-y-0.5" aria-label={group.label}>
                {group.items.map((item) => {
                  const active =
                    item.href === "/espace"
                      ? pathname === "/espace"
                      : pathname.startsWith(item.href);

                  const isNotifItem = item.href === "/espace/notifications";

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={
                        "group flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 " +
                        (active
                          ? "bg-[#182338] text-white font-semibold shadow-xs border-l-2 border-[#e3a641]"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100")
                      }
                      href={item.href}
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={
                            "grid size-6 place-items-center rounded-md transition-colors " +
                            (active ? "text-[#e3a641]" : "text-slate-400 group-hover:text-slate-200")
                          }
                        >
                          <Icon name={item.icon} size={16} />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      {isNotifItem && liveUnread > 0 ? (
                        <span className="grid min-w-4 place-items-center rounded-full bg-[#e3a641] px-1.5 py-0.5 text-[10px] font-bold text-[#0c1424]">
                          {liveUnread}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-white/[0.07] space-y-1">
          <Link
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            href="/"
          >
            <Icon name="arrow-right" className="rotate-180" size={15} />
            <span>{isClient ? "Retour à l'accueil" : "Voir le site vitrine"}</span>
          </Link>
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
            type="button"
          >
            <Icon name="lock" size={15} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-h-screen overflow-x-hidden lg:pl-[264px]">
        {/* Flowdash Light Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md xl:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 shadow-xs lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Icon name="menu" size={18} />
            </button>

            {/* Filiale Switcher Dropdown (Flowdash Multi-Tenancy Selector) */}
            {!isClient && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilialeDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                  title="Changer de filiale ou voir le groupe consolidé"
                >
                  <span className="size-2 rounded-full bg-[#e3a641]" />
                  <span className="max-w-[180px] truncate sm:max-w-[240px] font-bold text-[#17294b]">
                    {currentFilialeLabel}
                  </span>
                  <Icon name="chevron-down" size={13} className="text-slate-400" />
                </button>

                {filialeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setFilialeDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Périmètre d&apos;analyse</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">Filtrer les indicateurs et rapports</p>
                      </div>
                      <div className="mt-1 space-y-0.5 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleSelectFiliale("all")}
                          className={
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition " +
                            (selectedFilialeId === "all" ? "bg-[#17294b] text-white font-bold" : "text-slate-600 hover:bg-slate-50")
                          }
                        >
                          <span>Toutes les filiales (Consolidé)</span>
                          {selectedFilialeId === "all" && <Icon name="check" size={14} className="text-[#e3a641]" />}
                        </button>
                        {filiales.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => handleSelectFiliale(f.id)}
                            className={
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition " +
                              (selectedFilialeId === f.id ? "bg-[#17294b] text-white font-bold" : "text-slate-600 hover:bg-slate-50")
                            }
                          >
                            <span className="truncate">{f.nom}</span>
                            {selectedFilialeId === f.id && <Icon name="check" size={14} className="text-[#e3a641]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Health API Badge */}
            <span
              className={
                "hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide md:inline-flex items-center gap-1.5 " +
                (healthOk === false
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700")
              }
            >
              <span className={"size-1.5 rounded-full " + (healthOk === false ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
              {healthOk === false ? "API hors ligne" : "API connectée"}
            </span>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Flowdash Quick Search Trigger */}
            <WorkspaceCommandSearch />

            {/* Quick Action (+) Dropdown Button */}
            {!isClient && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setQuickActionsOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#e3a641] px-3 py-2 text-xs font-bold text-[#0c1424] shadow-sm hover:bg-[#efb653] transition"
                  title="Créer rapidement une ressource"
                >
                  <Icon name="plus" size={15} />
                  <span className="hidden sm:inline">Créer</span>
                </button>

                {quickActionsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setQuickActionsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions Rapides</p>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          href="/espace/missions?creer=1"
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Icon name="clipboard" size={15} className="text-indigo-600" />
                          <span>Ordre de mission</span>
                        </Link>
                        <Link
                          href="/espace/devis?creer=1"
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Icon name="file-text" size={15} className="text-emerald-600" />
                          <span>Nouveau devis</span>
                        </Link>
                        <Link
                          href="/espace/factures?creer=1"
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Icon name="chart" size={15} className="text-sky-600" />
                          <span>Nouvelle facture</span>
                        </Link>
                        <Link
                          href="/espace/administration?creer=1"
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Icon name="users" size={15} className="text-amber-600" />
                          <span>Collaborateur / Compte</span>
                        </Link>
                        <Link
                          href="/espace/stocks?creer=1"
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Icon name="boxes" size={15} className="text-teal-600" />
                          <span>Article de stock</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notification Bell with Badge */}
            {!isClient && (
              <Link
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-slate-300 hover:text-[#17294b]"
                href="/espace/notifications"
                title={streamState === "live" ? "Notifications en direct" : "Notifications"}
              >
                <Icon name="bell" size={18} />
                {liveUnread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid min-w-4.5 place-items-center rounded-full bg-[#db6d5b] px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {liveUnread > 99 ? "99+" : liveUnread}
                  </span>
                ) : (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#e3a641] ring-2 ring-white" />
                )}
              </Link>
            )}

            {/* User Profile Chip & Dropdown */}
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
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-xs transition hover:border-slate-300"
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                title="Menu du compte"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-[#0c1424] text-[11px] font-bold text-[#e3a641]">
                  {user.initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[11px] font-bold text-slate-700">{user.name}</span>
                  <span className="block text-[9px] font-medium text-slate-400">{roleLabel}</span>
                </span>
                <Icon className="hidden text-slate-400 sm:block" name="chevron-down" size={13} />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold text-[#17294b]">{user.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#17294b]"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowProfile(true);
                      }}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                        <Icon name="user" size={15} />
                      </span>
                      Mon profil
                    </button>
                    <button
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#17294b]"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowTwoFa(true);
                      }}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                        <Icon name="shield" size={15} />
                      </span>
                      Sécurité · 2FA
                    </button>
                    <button
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
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

        {/* Page Main Content */}
        <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-12 sm:px-6 lg:px-8 lg:py-7">
          {sessionExpired ? (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Icon className="text-amber-600" name="warning" size={18} />
                <p className="text-sm font-semibold text-amber-800">
                  Votre session a expiré. Veuillez vous reconnecter.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                  onClick={() => {
                    clearSessionExpired();
                    router.push("/connexion?redirect=" + encodeURIComponent(pathname));
                  }}
                  type="button"
                >
                  Se reconnecter
                </button>
                <button
                  className="rounded-lg p-1.5 text-amber-400 transition hover:text-amber-600"
                  onClick={clearSessionExpired}
                  type="button"
                  aria-label="Fermer"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>
          ) : null}
          {children}
        </main>
      </div>

      {showTwoFa ? <TwoFaForm onClose={() => setShowTwoFa(false)} /> : null}
      {showProfile ? <AccountSheet open={showProfile} onClose={() => setShowProfile(false)} /> : null}
      {showCoffre ? <CoffreDuGerant onClose={() => setShowCoffre(false)} streamState={streamState} /> : null}
      <NotificationToaster />
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
