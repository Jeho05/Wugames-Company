"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { useAuth } from "@/app/lib/auth-context";
import * as usersApi from "@/app/lib/api/users";
import type { User } from "@/app/lib/contracts";
import { Icon } from "@/app/components/ui/app-icon";
import {
  actionForMission,
  actionMeta,
  enqueuePendingAction,
  getPendingActions,
  loadWorkerOverview,
  missionProgression,
  removePendingAction,
  statutLabels,
  type WorkerOverview,
  type WorkerPhoto,
  workerApi,
} from "@/app/lib/worker-data";
import {
  flowForAction,
  MissionActions,
  type WorkerFlowKind,
  type WorkerRunKind,
} from "@/app/components/workspace/worker/worker-mission-actions";
import {
  WorkerBottomNavigation,
  type WorkerTab,
} from "@/app/components/workspace/worker/worker-bottom-nav";
import { OfflineSyncBanner } from "@/app/components/workspace/worker/worker-sync-banner";
import { WorkerTodayScreen, pickActiveMission } from "@/app/components/workspace/worker/worker-today-screen";
import { WorkerMissionsScreen } from "@/app/components/workspace/worker/worker-missions-screen";
import { WorkerActivityScreen } from "@/app/components/workspace/worker/worker-activity-screen";
import { WorkerProfileScreen } from "@/app/components/workspace/worker/worker-profile-screen";
import { WorkerServicesScreen } from "@/app/components/workspace/worker/worker-services-screen";
import { useNetworkOnline } from "@/app/components/workspace/worker/worker-online-hook";
import {
  demoWorkerServicesOverview,
  loadServiceProofs,
  loadWorkerServicesOverview,
  saveServiceProof,
} from "@/app/lib/worker-services-data";
import type { WorkerServiceOverview, WorkerServicePreuve } from "@/app/lib/worker-services-data";

const REFRESH_INTERVAL_MS = 120_000;

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

function firstNames(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Chargement">
      <div className="h-40 animate-pulse rounded-3xl bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="h-24 animate-pulse rounded-3xl bg-slate-200/70" />
      </div>
      <div className="h-40 animate-pulse rounded-3xl bg-slate-200/70" />
    </div>
  );
}

export function WorkerCommandCenter() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const online = useNetworkOnline();

  const [fullUser, setFullUser] = useState<User | null>(null);
  const [overview, setOverview] = useState<WorkerOverview | null>(null);
  const [servicesOverview, setServicesOverview] = useState<WorkerServiceOverview>(demoWorkerServicesOverview);
  const [proofs, setProofs] = useState<Record<string, WorkerServicePreuve>>(() => loadServiceProofs());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<WorkerTab>("aujourdhui");
  const [flow, setFlow] = useState<WorkerFlowKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncingLabel, setSyncingLabel] = useState<string | null>(null);
  const [photosByMission, setPhotosByMission] = useState<Record<string, WorkerPhoto[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const refresh = useCallback(async () => {
    const ouvrierId = fullUser?.ouvrier_profile?.id ?? null;
    const result = await loadWorkerOverview(fullUser?.id ?? user?.id ?? null, ouvrierId);
    setOverview(result);
    setPendingCount(getPendingActions().length);
    return result;
  }, [fullUser, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    usersApi
      .getUser(user.id)
      .then((full) => {
        if (!cancelled) setFullUser(full);
      })
      .catch(() => {
        if (!cancelled) setFullUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadWorkerOverview(user.id, fullUser?.ouvrier_profile?.id ?? null).then((overview) => {
      if (cancelled) return;
      setOverview(overview);
      setPendingCount(getPendingActions().length);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fullUser, user]);

  useEffect(() => {
    let cancelled = false;
    loadWorkerServicesOverview().then((result) => {
      if (cancelled) return;
      setServicesOverview(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS, { skip: loading });

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const patchMission = useCallback((missionId: string, kind: WorkerRunKind, payload: Record<string, unknown>) => {
    setOverview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        missions: prev.missions.map((mission) => {
          if (mission.id !== missionId) return mission;
          const horsRayon = payload.horsRayon === true;
          let statut = mission.statut;
          if (kind === "accepter") statut = "ACCEPTE";
          if (kind === "arrivee") statut = horsRayon ? "POINTAGE_A_VERIFIER" : "EN_COURS";
          if (kind === "rapport") statut = "RAPPORT_SOUMIS";
          const sortie = kind === "sortie";
          const arrivee = kind === "arrivee";
          return {
            ...mission,
            statut,
            statutLabel: statutLabels[statut] ?? mission.statutLabel,
            progression: missionProgression(statut),
            arrivagePointee: mission.arrivagePointee || arrivee,
            sortiePointee: mission.sortiePointee || sortie,
            dernierPointage: arrivee || sortie ? `à l'instant · ${arrivee ? "arrivée" : "sortie"}${horsRayon ? " · hors rayon" : ""}` : mission.dernierPointage,
          };
        }),
      };
    });
  }, []);

  const dispatchAction = useCallback(
    async (kind: WorkerRunKind, missionId: string, payload: Record<string, unknown>) => {
      switch (kind) {
        case "accepter":
          return workerApi.accepter(missionId);
        case "arrivee":
          return workerApi.pointerArrivee(missionId, Number(payload.latitude), Number(payload.longitude));
        case "sortie":
          return workerApi.pointerSortie(missionId, Number(payload.latitude), Number(payload.longitude));
        case "photo":
          return workerApi.envoyerPhoto(missionId, String(payload.storageUrl));
        case "rapport":
          return workerApi.soumettreRapport(missionId, String(payload.texte));
        default:
          return Promise.resolve(undefined);
      }
    },
    [],
  );

  const flushQueue = useCallback(async () => {
    const pending = getPendingActions();
    if (pending.length === 0) return;
    setSyncingLabel(`${pending.length} action(s) à synchroniser…`);
    const pendingIds = new Set(pending.map((action) => action.id));
    for (const action of pending) {
      try {
        await dispatchAction(action.kind, action.missionId, action.payload);
        removePendingAction(action.id);
        pendingIds.delete(action.id);
      } catch {
        /* action conservée pour la prochaine tentative */
      }
    }
    if (pendingIds.size === 0) toast("Toutes vos actions ont été synchronisées", "success");
    setSyncingLabel(null);
    setPendingCount(getPendingActions().length);
    await refresh();
  }, [dispatchAction, refresh, toast]);

  useEffect(() => {
    if (!online) return;
    void Promise.resolve().then(() => flushQueue());
  }, [flushQueue, online]);

  const onRun = useCallback(
    async (kind: WorkerRunKind, missionId: string, payload?: Record<string, unknown>) => {
      const body = payload ?? {};
      // Mise à jour optimiste : l'UI réagit immédiatement, la synchro suit en arrière-plan.
      patchMission(missionId, kind, body);
      if (!online) {
        enqueuePendingAction({ missionId, kind, payload: body });
        setPendingCount(getPendingActions().length);
        toast("Action enregistrée — synchronisée au retour du réseau", "info");
        return true;
      }
      setBusy(true);
      void dispatchAction(kind, missionId, body)
        .then(() => {
          navigator.vibrate?.(40);
        })
        .catch(() => {
          enqueuePendingAction({ missionId, kind, payload: body });
          setPendingCount(getPendingActions().length);
          toast("Envoi impossible — action conservée localement", "error");
        })
        .finally(() => setBusy(false));
      return true;
    },
    [dispatchAction, online, patchMission, toast],
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      setOverview((prev) =>
        prev
          ? {
              ...prev,
              notifications: {
                ...prev.notifications,
                list: prev.notifications.list.map((notification) => (notification.id === id ? { ...notification, lu: true } : notification)),
              },
            }
          : prev,
      );
      void workerApi.marquerLue(id).catch(() => undefined);
    },
    [],
  );

  const handleMarkAllRead = useCallback(() => {
    setOverview((prev) => {
      if (prev) {
        const nonLues = prev.notifications.list.filter((notification) => !notification.lu);
        for (const notification of nonLues) {
          void workerApi.marquerLue(notification.id).catch(() => undefined);
        }
      }
      return prev
        ? {
            ...prev,
            notifications: {
              ...prev.notifications,
              list: prev.notifications.list.map((notification) => ({ ...notification, lu: true })),
            },
          }
        : prev;
    });
  }, []);

  const handleLogout = useCallback(() => {
    void logout().then(() => router.push("/connexion"));
  }, [logout, router]);

  const handleValidateService = useCallback((serviceId: string, preuve: WorkerServicePreuve) => {
    saveServiceProof(serviceId, preuve);
    setProofs((prev) => ({ ...prev, [serviceId]: preuve }));
    setServicesOverview((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId ? { ...service, statut: "VALIDE" } : service,
      ),
    }));
  }, []);

  const activeMission = useMemo(() => (overview ? pickActiveMission(overview.missions) : null), [overview]);
  const activePhotos = activeMission ? (photosByMission[activeMission.id] ?? []) : [];
  const activeDraft = activeMission ? (drafts[activeMission.id] ?? "") : "";
  const unread = overview?.notifications.list.filter((notification) => !notification.lu).length ?? 0;

  const fab = useMemo(() => {
    if (!activeMission) return null;
    const action = actionForMission(activeMission, activePhotos.length > 0, activeDraft.length > 0);
    if (action.kind === "attente_validation" || action.kind === "terminee") return null;
    const meta = actionMeta[action.kind];
    return {
      label: meta.label,
      icon: meta.icon,
      open: () => {
        setTab("aujourdhui");
        setFlow(flowForAction(action.kind));
      },
    };
  }, [activeDraft, activeMission, activePhotos.length]);

  if (loading || !overview) {
    return (
      <div className="min-h-dvh bg-[#f4f7f4] pb-36 text-slate-900">
        <div className="mx-auto max-w-md px-4 pb-4 pt-5">
          <LoadingSkeleton />
        </div>
        <WorkerBottomNavigation
          fabIcon="map"
          fabLabel=""
          onFab={() => undefined}
          onTab={() => undefined}
          tab="aujourdhui"
          unread={0}
        />
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[#f4f7f4] text-slate-900">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-[#f4f7f4]/85 backdrop-blur-lg">
          <div className="mx-auto max-w-md px-4 pb-2.5 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[18px] font-extrabold leading-6 text-[#16233a]">
                  Bonjour {fullUser?.first_name ?? firstNames(overview.worker.nom)} 👋
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                  {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-500">
                  {overview.source === "demo" ? "Mode démo" : "En ligne"}
                </span>
                <button
                  aria-label="Actualiser"
                  className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-[#0f7a5f] shadow-sm transition active:scale-95"
                  disabled={refreshing}
                  onClick={() => {
                    setRefreshing(true);
                    void refresh().finally(() => setRefreshing(false));
                  }}
                  type="button"
                >
                  <Icon className={refreshing ? "animate-spin" : ""} name="refresh" size={15} />
                </button>
              </div>
            </div>
            <div className="mt-2.5">
              <OfflineSyncBanner pendingCount={pendingCount} state={online ? (syncingLabel ? "syncing" : "online") : "offline"} syncingLabel={syncingLabel} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-md px-4 pb-36 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 8 }}
              key={tab}
              transition={{ duration: 0.18 }}
            >
              {tab === "aujourdhui" ? (
                <WorkerTodayScreen
                  actionSlot={
                    activeMission ? (
                      <MissionActions
                        busy={busy}
                        draft={activeDraft}
                        flow={flow}
                        mission={activeMission}
                        online={online}
                        onDraftChange={(text) => setDrafts((prev) => ({ ...prev, [activeMission.id]: text }))}
                        onFlowChange={setFlow}
                        onPhotosChange={(photos) => setPhotosByMission((prev) => ({ ...prev, [activeMission.id]: photos }))}
                        onRun={onRun}
                        onToast={toast}
                        photos={activePhotos}
                      />
                    ) : null
                  }
                  missions={overview.missions}
                  onOpenMissions={() => setTab("missions")}
                  ranking={overview.ranking}
                />
              ) : null}
              {tab === "services" ? (
                <WorkerServicesScreen
                  onToast={toast}
                  onValidate={handleValidateService}
                  proofs={proofs}
                  services={servicesOverview.services}
                />
              ) : null}
              {tab === "missions" ? <WorkerMissionsScreen missions={overview.missions} /> : null}
              {tab === "activite" ? (
                <WorkerActivityScreen
                  notifications={overview.notifications.list}
                  onMarkAllRead={handleMarkAllRead}
                  onMarkRead={handleMarkRead}
                  ranking={overview.ranking}
                  unread={unread}
                />
              ) : null}
              {tab === "profil" ? (
                <WorkerProfileScreen
                  onLogout={handleLogout}
                  onPrimeWithdrawn={(primeId) => {
                    setServicesOverview((prev) => ({ ...prev, primeDisponible: null }));
                    toast("Votre demande de retrait a été envoyée", "success");
                  }}
                  overview={overview}
                  pendingCount={pendingCount}
                  prime={servicesOverview.primeDisponible}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </main>

        <WorkerBottomNavigation
          fabIcon={fab?.icon ?? "map"}
          fabLabel={fab?.label ?? ""}
          onFab={fab ? fab.open : () => undefined}
          onTab={setTab}
          tab={tab}
          unread={unread}
        />

        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto flex max-w-md flex-col items-center gap-2 px-4">
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
    </MotionConfig>
  );
}
