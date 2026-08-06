"use client";

import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerSyncState } from "@/app/lib/worker-data";

type OfflineSyncBannerProps = {
  state: WorkerSyncState;
  pendingCount: number;
  syncingLabel: string | null;
};

export function OfflineSyncBanner({ state, pendingCount, syncingLabel }: OfflineSyncBannerProps) {
  return (
    <AnimatePresence>
      {state !== "online" || pendingCount > 0 ? (
        <motion.div
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden"
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className={
              "flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[11px] font-bold " +
              (state === "offline"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-sky-200 bg-sky-50 text-sky-800")
            }
            role="status"
          >
            {state === "offline" ? (
              <>
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <Icon name="warning" size={13} />
                </span>
                <p className="flex-1">
                  Hors ligne — vos actions sont conservées localement
                  {pendingCount > 0 ? ` (${pendingCount} en attente)` : ""}.
                </p>
                <p className="text-[9px] font-semibold text-amber-600">Sync auto au retour du réseau</p>
              </>
            ) : (
              <>
                <span className="grid size-6 shrink-0 animate-spin place-items-center rounded-lg bg-sky-100 text-sky-700">
                  <Icon name="refresh" size={12} />
                </span>
                <p className="flex-1">{syncingLabel ?? "Synchronisation en cours…"}</p>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function SyncQueueStatus({ pendingCount }: { pendingCount: number }) {
  if (pendingCount === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Synchronisé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
      <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
      {pendingCount} action(s) en attente de sync
    </span>
  );
}
