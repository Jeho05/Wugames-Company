"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { useAuth } from "@/app/lib/auth-context";
import * as usersApi from "@/app/lib/api/users";
import type { User } from "@/app/lib/contracts";
import { Icon } from "@/app/components/ui/app-icon";
import {
  loadSupplierOverview,
  loadSupplierProduct,
  supplierApi,
  type SupplierOverview,
  type SupplierView,
} from "@/app/lib/supplier-data";

import { SupplierAccessGuard } from "@/app/components/workspace/supplier/supplier-access-guard";
import { SupplierSidebar } from "@/app/components/workspace/supplier/supplier-sidebar";
import { SupplierBottomNavigation } from "@/app/components/workspace/supplier/supplier-bottom-navigation";
import { SupplierDashboardHeader } from "@/app/components/workspace/supplier/supplier-dashboard-header";
import { SupplierHealthHero, type SupplierHealthState } from "@/app/components/workspace/supplier/supplier-health-hero";
import { SupplierKpiGrid, type SupplierKpiPreset } from "@/app/components/workspace/supplier/supplier-kpi-grid";
import { SupplierProductStatusChart } from "@/app/components/workspace/supplier/supplier-product-status-chart";
import { SupplierCriticalProducts } from "@/app/components/workspace/supplier/supplier-critical-products";
import { SupplierActivityFeed } from "@/app/components/workspace/supplier/supplier-activity-feed";
import { SupplierProductList, type SupplierListPreset } from "@/app/components/workspace/supplier/supplier-product-list";
import { SupplierMovementTimeline } from "@/app/components/workspace/supplier/supplier-movement-timeline";
import { SupplierNotifications } from "@/app/components/workspace/supplier/supplier-notifications";
import { SupplierProfile } from "@/app/components/workspace/supplier/supplier-profile";
import { SupplierProductDetails } from "@/app/components/workspace/supplier/supplier-product-details";
import { SupplierCommandPalette } from "@/app/components/workspace/supplier/supplier-command-palette";

const REFRESH_INTERVAL_MS = 120_000;

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Chargement">
      <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="hidden h-28 animate-pulse rounded-3xl bg-slate-200/70 md:block" />
        <div className="hidden h-28 animate-pulse rounded-3xl bg-slate-200/70 md:block" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70" />
    </div>
  );
}

function healthOf(overview: SupplierOverview): SupplierHealthState {
  if (overview.kpis.rupture > 0) return "rupture";
  if (overview.kpis.reappro > 0 || overview.kpis.commandes > 0) return "attention";
  return "ok";
}

export function SupplierCommandCenter() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [fullUser, setFullUser] = useState<User | null>(null);
  const [overview, setOverview] = useState<SupplierOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SupplierView>("overview");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listPreset, setListPreset] = useState<SupplierListPreset | null>(null);
  const [presetKey, setPresetKey] = useState(0);
  const [movementFocus, setMovementFocus] = useState<{ productId: string; at: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const refresh = useCallback(async () => {
    const result = await loadSupplierOverview(fullUser);
    setOverview(result);
    return result;
  }, [fullUser]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    usersApi
      .getUser(user.id)
      .then((full) => {
        if (cancelled) return;
        setFullUser(full);
        return loadSupplierOverview(full);
      })
      .then((result) => {
        if (cancelled || !result) return;
        setOverview(result);
      })
      .catch(() => {
        if (cancelled) return;
        setFullUser(null);
        void loadSupplierOverview(null).then((result) => {
          if (!cancelled) setOverview(result);
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loading, refresh]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = useCallback(() => {
    void logout().then(() => router.push("/connexion"));
  }, [logout, router]);

  const handleOpenProduct = useCallback((productId: string) => {
    setSelectedId(productId);
    void loadSupplierProduct(productId, overview?.profile.fournisseurId ?? null)
      .then((produit) => {
        setOverview((prev) => (prev ? { ...prev, products: prev.products.map((p) => (p.id === produit.id ? produit : p)) } : prev));
      })
      .catch(() => {
        toast("Impossible d'actualiser ce produit. Les informations affichées datent de la dernière synchronisation.", "info");
      });
  }, [overview?.profile.fournisseurId, toast]);

  const handleMarkRead = useCallback((notificationId: string) => {
    setOverview((prev) =>
      prev
        ? {
            ...prev,
            notifications: {
              ...prev.notifications,
              list: prev.notifications.list.map((notification) => (notification.id === notificationId ? { ...notification, lu: true } : notification)),
              unread: Math.max(0, prev.notifications.unread - 1),
            },
          }
        : prev,
    );
    void supplierApi.markNotificationAsRead(notificationId).catch(() => {
      toast("Impossible de marquer la notification comme lue.", "error");
    });
  }, [toast]);

  const handleMarkAllRead = useCallback(() => {
    setOverview((prev) =>
      prev
        ? {
            ...prev,
            notifications: {
              ...prev.notifications,
              list: prev.notifications.list.map((notification) => ({ ...notification, lu: true })),
              unread: 0,
            },
          }
        : prev,
    );
    void Promise.allSettled(overview?.notifications.list.filter((notification) => !notification.lu).map((notification) => supplierApi.markNotificationAsRead(notification.id)) ?? []).then(
      (results) => {
        if (results.some((result) => result.status === "rejected")) {
          toast("Certaines notifications n'ont pas pu être marquées comme lues.", "error");
        }
      },
    );
  }, [overview?.notifications.list, toast]);

  const handleRefresh = useCallback(() => {
    void refresh()
      .then(() => toast("Données actualisées."))
      .catch(() => toast("Actualisation impossible pour le moment.", "error"));
  }, [refresh, toast]);

  const handleKpiNavigate = useCallback((preset: SupplierKpiPreset) => {
    if (preset.type === "mouvements") {
      setMovementFocus(null);
      setView("mouvements");
      return;
    }
    if (preset.type === "tous") {
      setListPreset(null);
      setView("produits");
      return;
    }
    setListPreset(preset.type === "statut" ? { statut: preset.statut } : { sousMin: true });
    setPresetKey((key) => key + 1);
    setView("produits");
  }, []);

  const handleFilterMovements = useCallback((productId: string) => {
    setMovementFocus({ productId, at: Date.now() });
    setView("mouvements");
  }, []);

  const unread = overview?.notifications.unread ?? 0;
  const firstName = fullUser ? `${fullUser.first_name} ${fullUser.last_name}`.trim() : overview?.profile.firstName ?? "Fournisseur";
  const selected = selectedId ? (overview?.products.find((produit) => produit.id === selectedId) ?? null) : null;

  if (loading || !overview) {
    return (
      <SupplierAccessGuard>
        <div className="min-h-dvh bg-[#f7f9fc] dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 lg:px-8 lg:pl-[19rem]">
            <LoadingSkeleton />
          </div>
        </div>
      </SupplierAccessGuard>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <SupplierAccessGuard>
        <div className="min-h-dvh bg-[#f7f9fc] text-[#17294b] dark:bg-slate-950">
          <SupplierSidebar onNavigate={setView} unread={unread} view={view} />

          <SupplierDashboardHeader
            firstName={firstName}
            onOpenNotifications={() => setView("notifications")}
            onOpenProfile={() => setView("profil")}
            onOpenSearch={() => setPaletteOpen(true)}
            unread={unread}
            view={view}
          />

          <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 lg:px-8 lg:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={view}
                transition={{ duration: 0.18 }}
              >
                {view === "overview" ? (
                  <div className="space-y-4 lg:space-y-5">
                    <SupplierHealthHero
                      firstName={firstName}
                      health={healthOf(overview)}
                      kpis={overview.kpis}
                      onRefresh={handleRefresh}
                      onViewCritical={() => handleKpiNavigate({ type: "statut", statut: "RUPTURE" })}
                      onViewNotifications={() => setView("notifications")}
                      onViewProducts={() => setView("produits")}
                      raisonSociale={overview.profile.raisonSociale}
                      source={overview.source}
                      unread={unread}
                      updatedAt={overview.updatedAt}
                    />
                    <SupplierKpiGrid kpis={overview.kpis} onNavigate={handleKpiNavigate} />
                    <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
                      <div className="lg:col-span-2">
                        <SupplierProductStatusChart kpis={overview.kpis} />
                      </div>
                      <div className="lg:col-span-3">
                        <SupplierActivityFeed
                          movements={overview.movements}
                          onOpenProduct={handleOpenProduct}
                          products={overview.products}
                        />
                      </div>
                    </div>
                    <SupplierCriticalProducts
                      onOpenProduct={handleOpenProduct}
                      onViewMovements={handleFilterMovements}
                      products={overview.products}
                    />
                  </div>
                ) : null}

                {view === "produits" ? (
                  <SupplierProductList
                    filiales={overview.filiales}
                    key={presetKey}
                    onOpenProduct={handleOpenProduct}
                    preset={listPreset}
                    products={overview.products}
                  />
                ) : null}

                {view === "mouvements" ? (
                  <SupplierMovementTimeline
                    defaultProductId={movementFocus?.productId ?? "TOUS"}
                    key={movementFocus ? `focus-${movementFocus.productId}-${movementFocus.at}` : "all"}
                    movements={overview.movements}
                  />
                ) : null}

                {view === "notifications" ? (
                  <SupplierNotifications
                    notifications={overview.notifications.list}
                    onMarkAllRead={handleMarkAllRead}
                    onMarkRead={handleMarkRead}
                    onOpenProduct={handleOpenProduct}
                  />
                ) : null}

                {view === "profil" ? (
                  <SupplierProfile
                    onLogout={handleLogout}
                    onTwoFactorChanged={() => {
                      if (!user) return;
                      void usersApi.getUser(user.id).then(setFullUser);
                    }}
                    profile={overview.profile}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </main>

          <SupplierBottomNavigation onNavigate={setView} unread={unread} view={view} />

          <SupplierCommandPalette
            filiales={overview.filiales}
            movements={overview.movements}
            onClose={() => setPaletteOpen(false)}
            onFilterMovements={handleFilterMovements}
            onNavigate={setView}
            onOpenProduct={handleOpenProduct}
            open={paletteOpen}
            products={overview.products}
          />

          <AnimatePresence>
            {selected ? (
              <SupplierProductDetails key={selected.id} onClose={() => setSelectedId(null)} produit={selected} />
            ) : null}
          </AnimatePresence>

          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-xl flex-col items-center gap-2 px-4">
            <AnimatePresence>
              {toasts.map((item) => (
                <motion.div
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className={
                    "flex max-w-full items-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-bold text-white shadow-2xl " +
                    (item.tone === "success" ? "bg-[#0f7a5f]" : item.tone === "error" ? "bg-rose-600" : "bg-slate-900")
                  }
                  exit={{ y: 12, opacity: 0, scale: 0.96 }}
                  initial={{ y: 12, opacity: 0, scale: 0.96 }}
                  key={item.id}
                  role="status"
                >
                  <Icon
                    className="shrink-0"
                    name={item.tone === "success" ? "check" : item.tone === "error" ? "warning" : "clock"}
                    size={14}
                  />
                  {item.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </SupplierAccessGuard>
    </MotionConfig>
  );
}
