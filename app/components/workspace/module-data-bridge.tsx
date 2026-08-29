"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ModuleCreateForm } from "@/app/components/workspace/module-create-form";
import { FilialeCreateForm } from "@/app/components/workspace/filiale-create-form";
import { ModuleScreen } from "@/app/components/workspace/module-screen";
import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import { resetApiCache } from "@/app/lib/api-client";
import { markAsRead } from "@/app/lib/api/notifications";
import type { ModuleDefinition, ModuleRow } from "@/app/lib/demo-data";
import type { ModuleCreateConfig } from "@/app/lib/module-create";
import { getModuleCreateConfig } from "@/app/lib/module-create";
import { loadModuleData, type ModuleDataSource, type ModuleData } from "@/app/lib/module-data";
import { affecterMission } from "@/app/lib/api/missions";
import { listUsers } from "@/app/lib/api/users";
import { resolveNotificationHref } from "@/app/lib/notification-target";

type ModuleDataBridgeProps = {
  definition: ModuleDefinition;
  slug: string;
  initialCreateOpen?: boolean;
};

type CreateRenderProps = {
  onClose: () => void;
  onSubmit: (row: ModuleRow) => void;
};

function FilialeCreateRenderer({ onClose, onSubmit, onCreated }: CreateRenderProps & { onCreated: () => void }) {
  return (
    <FilialeCreateForm
      onClose={onClose}
      onSubmit={(row) => {
        onSubmit(row);
        onCreated();
      }}
    />
  );
}

function GenericCreateRenderer({ config, onClose, onSubmit, onCreated }: CreateRenderProps & { config: ModuleCreateConfig; onCreated: () => void }) {
  return <ModuleCreateForm config={config} onClose={onClose} onSubmitRow={onSubmit} onCreated={onCreated} />;
}

export function ModuleDataBridge({ definition, slug, initialCreateOpen = false }: ModuleDataBridgeProps) {
  const { user } = useAuth();
  const [data, setData] = useState<ModuleData | null>(null);
  const [source, setSource] = useState<ModuleDataSource | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [affectMissionId, setAffectMissionId] = useState<string | null>(null);
  const [affectOuvrierId, setAffectOuvrierId] = useState("");
  const [affectLoading, setAffectLoading] = useState(false);
  const [affectOuvriers, setAffectOuvriers] = useState<{ value: string; label: string }[]>([]);

  const refresh = useCallback(() => {
    resetApiCache();
    setRefreshKey((key) => key + 1);
  }, []);

  const handleRowClick = useCallback(
    (row: ModuleRow) => {
      if (slug !== "notifications") return;
      const id = (row.id as string) ?? "";
      if (!id) return;
      // Mise à jour optimiste : la ligne passe « Lu » immédiatement, sans attendre le réseau.
      setData((current) =>
        current
          ? {
              ...current,
              rows: current.rows.map((r) => (String(r.id) === id ? { ...r, statut: { label: "Lu", tone: "neutral" } } : r)),
            }
          : current,
      );
      // Navigation vers la page d'origine de la notification
      try {
        const fakeNotif: Record<string, unknown> = {
          id,
          type: row.module as string,
          message: row.notification as string,
          // Certaines APIs renvoient table_cible/entite_id dans la row
          table_cible: (row as Record<string, unknown>).table_cible,
          entite_id: id,
        };
        const href = resolveNotificationHref(fakeNotif as unknown as import("@/app/lib/contracts").Notification, user?.role ?? null);
        if (href && href !== "/espace/notifications") {
          // Laisse le temps au markAsRead de partir, puis navigue
          window.setTimeout(() => {
            window.location.assign(href);
          }, 250);
        }
      } catch {
        /* navigation optionnelle */
      }
      markAsRead(id)
        .then(() => undefined)
        .catch(() => {
          resetApiCache();
          refresh();
        });
    },
    [slug, refresh, user?.role],
  );

  const handleMissionRowClick = useCallback(
    (row: ModuleRow) => {
      const id = (row.id as string) ?? "";
      if (!id) return;
      setAffectMissionId(id);
      setAffectOuvrierId("");
    },
    []
  );

  const handleAffectConfirm = useCallback(async () => {
    if (!affectMissionId) return;
    setAffectLoading(true);
    try {
      await affecterMission(affectMissionId, affectOuvrierId || undefined);
      setToastMsg("Mission affectée avec succès");
      setAffectMissionId(null);
      refresh();
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : "Échec de l'affectation");
    } finally {
      setAffectLoading(false);
    }
  }, [affectMissionId, affectOuvrierId, refresh]);

  const handleAffectCancel = useCallback(() => {
    setAffectMissionId(null);
    setAffectOuvrierId("");
    setToastMsg("");
  }, []);

  const createConfig = getModuleCreateConfig(slug, user?.role);

  function renderCreateForm(props: CreateRenderProps): ReactNode {
    if (slug === "filiales") {
      return <FilialeCreateRenderer {...props} onCreated={refresh} />;
    }
    if (createConfig) {
      return <GenericCreateRenderer config={createConfig} {...props} onCreated={refresh} />;
    }
    return undefined;
  }

  useEffect(() => {
    let cancelled = false;
    const role = user?.role;
    if (!role) return;

    loadModuleData(slug, role).then((result) => {
      if (cancelled) return;
      if (!result) {
        // API indisponible ou slug non géré : afficher un tableau vide plutôt qu'un loader infini
        setData({ rows: [], stats: [], insights: [] });
        setSource(null);
        return;
      }
      setData(result.data);
      setSource(result.source);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, user?.role, refreshKey]);

  useEffect(() => {
    if (!affectMissionId) return;
    listUsers()
      .then((users) => {
        const ouvriers = users
          .filter((u) => u.role === "ROLE_OUVRIER")
          .map((u) => ({
            value: u.ouvrier_profile?.id ?? u.id,
            label: `${[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}${u.ouvrier_profile?.specialite ? ` · ${u.ouvrier_profile.specialite}` : ""}`,
          }));
        setAffectOuvriers(ouvriers);
      })
      .catch(() => {
        /* API injoignable : liste vide. */
      });
  }, [affectMissionId]);

  const mergedDefinition = useMemo<ModuleDefinition>(() => {
    if (!data) {
      // Si data est null, ne pas utiliser les rows hardcodées
      return { ...definition, rows: [] };
    }
    if (source !== "api") return definition;
    return {
      ...definition,
      rows: data.rows.length > 0 ? data.rows : [],
      stats: data.stats,
      insights: data.insights,
    };
  }, [data, definition, source]);

  // Afficher un loader pendant le chargement des données — APRÈS tous les hooks
  if (data === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
          <p className="text-sm font-semibold text-slate-400">Chargement des données…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {source ? (
        <div className="flex justify-end">
          <span className="size-1.5 rounded-full bg-emerald-400" />
        </div>
      ) : null}

      <ModuleScreen definition={mergedDefinition} renderCreateForm={renderCreateForm} onRowClick={slug === "notifications" ? handleRowClick : slug === "missions" ? handleMissionRowClick : undefined} initialCreateOpen={initialCreateOpen} showCreateButton={slug === "filiales" || !!createConfig} />

      {affectMissionId && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">Affecter une mission</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]">Choisir un ouvrier</h2>
              </div>
              <button
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={handleAffectCancel}
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Sélectionnez l'ouvrier à affecter. Laisser vide pour une auto-affectation par rendement.</p>
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">Ouvrier</span>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                  value={affectOuvrierId}
                  onChange={(e) => setAffectOuvrierId(e.target.value)}
                >
                  <option value="">Auto (meilleur rendement)</option>
                  {affectOuvriers.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                onClick={handleAffectCancel}
                type="button"
              >
                Annuler
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={affectLoading}
                onClick={handleAffectConfirm}
                type="button"
              >
                {affectLoading ? "Affectation…" : "Affecter"}
                <Icon name="arrow-right" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
