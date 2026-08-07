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

type ModuleDataBridgeProps = {
  definition: ModuleDefinition;
  slug: string;
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

export function ModuleDataBridge({ definition, slug }: ModuleDataBridgeProps) {
  const { user } = useAuth();
  const [data, setData] = useState<ModuleData | null>(null);
  const [source, setSource] = useState<ModuleDataSource | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const role = user?.role;
    if (!role) return;

    loadModuleData(slug, role).then((result) => {
      if (cancelled) return;
      setData(result.data);
      setSource(result.source);
    });

    return () => {
      cancelled = true;
    };
  }, [slug, user?.role, refreshKey]);

  const mergedDefinition = useMemo<ModuleDefinition>(() => {
    if (source !== "api" || !data) return definition;
    return {
      ...definition,
      rows: data.rows.length > 0 ? data.rows : definition.rows,
      stats: data.stats,
      insights: data.insights,
    };
  }, [data, definition, source]);

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
      markAsRead(id)
        .then(() => undefined)
        .catch(() => {
          resetApiCache();
          refresh();
        });
    },
    [slug, refresh],
  );

  const createConfig = getModuleCreateConfig(slug);

  function renderCreateForm(props: CreateRenderProps): ReactNode {
    if (slug === "filiales") {
      return <FilialeCreateRenderer {...props} onCreated={refresh} />;
    }
    if (createConfig) {
      return <GenericCreateRenderer config={createConfig} {...props} onCreated={refresh} />;
    }
    return undefined;
  }

  return (
    <div className="space-y-4">
      {source ? (
        <div className="flex justify-end">
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold " +
              (source === "api"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200")
            }
          >
            <Icon name={source === "api" ? "check" : "sparkles"} size={13} />
            {source === "api" ? "Données en direct · API WUGAMS" : "Mode démonstration · API indisponible"}
          </span>
        </div>
      ) : null}

      <ModuleScreen definition={mergedDefinition} renderCreateForm={renderCreateForm} onRowClick={slug === "notifications" ? handleRowClick : undefined} />
    </div>
  );
}
