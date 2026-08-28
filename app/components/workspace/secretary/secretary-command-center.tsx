"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { LiveIndicator } from "@/app/components/workspace/live-indicator";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { SecretaryAccountCreation } from "@/app/components/workspace/secretary/secretary-account-creation";
import { SecretaryActivity } from "@/app/components/workspace/secretary/secretary-activity";
import { SecretaryAgenda } from "@/app/components/workspace/secretary/secretary-agenda";
import { SecretaryBoutiques } from "@/app/components/workspace/secretary/secretary-boutiques";
import { SecretaryClientsTable } from "@/app/components/workspace/secretary/secretary-clients-table";
import { SecretaryHero } from "@/app/components/workspace/secretary/secretary-hero";
import { SecretaryKpiGrid } from "@/app/components/workspace/secretary/secretary-kpi-grid";
import { SecretaryNotifications } from "@/app/components/workspace/secretary/secretary-notifications";
import { SecretarySalesSpace } from "@/app/components/workspace/secretary/secretary-sales-space";
import { SecretarySearch } from "@/app/components/workspace/secretary/secretary-search";
import { SecretaryShortcuts, type SecretarySection } from "@/app/components/workspace/secretary/secretary-shortcuts";
import { SecretarySuppliersTable } from "@/app/components/workspace/secretary/secretary-suppliers-table";
import { SecretaryTasks } from "@/app/components/workspace/secretary/secretary-tasks";
import { loadSecretaryOverview, type SecretaryOverview } from "@/app/lib/secretary-data";

const REFRESH_INTERVAL_MS = 60_000;

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

const sectionTabs: { key: SecretarySection; label: string; icon: "dashboard" | "shopping-bag" | "credit-card" | "clipboard" }[] = [
  { key: "tableau", label: "Tableau de bord", icon: "dashboard" },
  { key: "boutiques", label: "Boutiques", icon: "shopping-bag" },
  { key: "ventes", label: "Espace de vente", icon: "credit-card" },
  { key: "comptes", label: "Création de comptes", icon: "clipboard" },
];

export function SecretaryCommandCenter() {
  const [data, setData] = useState<SecretaryOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<SecretarySection>("tableau");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastQueue = useRef<Toast[]>([]);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast((current) => {
      if (current) {
        toastQueue.current.push({ id: Date.now() + toastQueue.current.length, message, tone });
        return current;
      }
      return { id: Date.now(), message, tone };
    });
  }, []);

  const showNextToast = useCallback(() => {
    const next = toastQueue.current.shift();
    if (next) setToast(next);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadSecretaryOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

useEffect(() => {
    let cancelled = false;
    loadSecretaryOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {data ? (
          <>
            <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LiveIndicator live={data.source === "api"} />
                <p className="text-xs font-semibold text-slate-400">
                  Dernière mise à jour ·{" "}
                  <span className="font-mono tabular-nums text-slate-600">{formatUpdatedAt(data.updatedAt)}</span>
                </p>
              </div>
              <button
                aria-label="Actualiser les données"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#17294b] disabled:opacity-60"
                disabled={refreshing}
                onClick={() => void refresh()}
                type="button"
              >
                <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
                Actualiser
              </button>
            </div>

            <Reveal delay={0.01}>
              <nav aria-label="Sections" className="flex gap-2 overflow-x-auto pb-1">
                {sectionTabs.map((tab) => (
                  <button
                    aria-current={section === tab.key ? "page" : undefined}
                    className={
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition " +
                      (section === tab.key
                        ? "border-[#0f7a5f] bg-[#0f7a5f] text-white shadow-lg shadow-emerald-900/20"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-[#16233a]")
                    }
                    key={tab.key}
                    onClick={() => setSection(tab.key)}
                    type="button"
                  >
                    <Icon name={tab.icon} size={13} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={section}
                transition={{ duration: 0.18 }}
              >
                {section === "tableau" ? (
                  <div className="space-y-6">
                    <SecretaryHero
                      demandesCount={Number(data.kpis.find((kpi) => kpi.key === "demandes")?.value.replace(/\D/g, "") ?? 0)}
                      tasksCount={data.tasks.length}
                    />

                    <Reveal delay={0.03}>
                      <SecretarySearch index={data.searchIndex} />
                    </Reveal>

                    <Reveal delay={0.05}>
                      <SecretaryKpiGrid kpis={data.kpis.slice(0, 4)} />
                    </Reveal>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <SecretaryTasks tasks={data.tasks} />
                      <SecretaryNotifications items={data.notifications} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <SecretaryAgenda events={data.agenda} />
                      <SecretaryActivity items={data.activity} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                      <SecretaryShortcuts onNavigate={setSection} />
                      <SecretaryClientsTable clients={data.clients} />
                    </div>

                    <Reveal delay={0.08}>
                      <SecretarySuppliersTable fournisseurs={data.fournisseurs} />
                    </Reveal>
                  </div>
                ) : null}

                {section === "boutiques" ? <SecretaryBoutiques onToast={showToast} /> : null}
                {section === "ventes" ? <SecretarySalesSpace onToast={showToast} /> : null}
                {section === "comptes" ? <SecretaryAccountCreation onToast={showToast} /> : null}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
            <div className="flex flex-col items-center gap-4">
              <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
              <p className="text-sm font-semibold text-slate-400">Chargement de votre centre administratif…</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <AnimatePresence>
            {toast ? (
              <motion.div
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className={
                  "flex max-w-[min(92vw,420px)] items-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-bold text-white shadow-2xl " +
                  (toast.tone === "success" ? "bg-[#0f7a5f]" : toast.tone === "error" ? "bg-rose-600" : "bg-slate-900")
                }
                exit={{ y: 12, opacity: 0, scale: 0.96 }}
                initial={{ y: 12, opacity: 0, scale: 0.96 }}
                key={toast.id}
                onAnimationComplete={() => {
                  window.setTimeout(() => {
                    setToast(null);
                    showNextToast();
                  }, 2600);
                }}
                role="status"
              >
                <Icon
                  className="shrink-0"
                  name={toast.tone === "success" ? "check" : toast.tone === "error" ? "warning" : "info"}
                  size={14}
                />
                <span className="leading-5">{toast.message}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
