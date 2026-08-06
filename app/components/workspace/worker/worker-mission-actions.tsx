"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerMission, WorkerPhoto } from "@/app/lib/worker-data";
import { actionForMission, actionMeta } from "@/app/lib/worker-data";
import { ConfirmDialog, WorkerSheet } from "@/app/components/workspace/worker/worker-sheet";
import { PhotoUploader } from "@/app/components/workspace/worker/worker-photo-uploader";
import { PointageSheet, type GpsResult, type PointageMode } from "@/app/components/workspace/worker/worker-gps-sheets";

export type WorkerRunKind = "accepter" | "arrivee" | "sortie" | "photo" | "rapport";

export type WorkerFlowKind = "confirm-accepter" | "gps" | "photos" | "report";

export function flowForAction(actionKind: string): WorkerFlowKind | null {
  switch (actionKind) {
    case "accepter":
      return "confirm-accepter";
    case "pointer_arrivee":
    case "pointer_sortie":
      return "gps";
    case "ajouter_photo":
      return "photos";
    case "rediger_rapport":
    case "soumettre_rapport":
      return "report";
    default:
      return null;
  }
}

export type MissionActionsProps = {
  mission: WorkerMission;
  photos: WorkerPhoto[];
  onPhotosChange: (photos: WorkerPhoto[]) => void;
  draft: string;
  onDraftChange: (text: string) => void;
  online: boolean;
  busy: boolean;
  flow: WorkerFlowKind | null;
  onFlowChange: (flow: WorkerFlowKind | null) => void;
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
  onRun: (
    kind: WorkerRunKind,
    missionId: string,
    payload?: Record<string, unknown>,
  ) => Promise<boolean>;
};

const REPORT_MAX = 1500;

const suggestions = [
  "Travail terminé : la mission a été réalisée conformément au planning.",
  "Zone nettoyée et matériaux rangés. Photos jointes au rapport.",
  "Difficulté rencontrée : matériel manquant, contacter le responsable.",
];

export function MissionActions({
  mission,
  photos,
  onPhotosChange,
  draft,
  onDraftChange,
  online,
  busy,
  flow,
  onFlowChange,
  onToast,
  onRun,
}: MissionActionsProps) {
  const action = actionForMission(mission, photos.length > 0, draft.length > 0);
  const meta = actionMeta[action.kind];
  const [gpsMode, setGpsMode] = useState<PointageMode>("arrivee");

  const openFlow = useCallback(
    (kind: WorkerFlowKind | null) => {
      if (kind === "gps") {
        if (!mission.arrivagePointee && action.kind === "pointer_sortie") {
          onToast("Pointage de sortie impossible : aucun pointage d'arrivée effectué", "error");
          return;
        }
        setGpsMode(action.kind === "pointer_sortie" ? "sortie" : "arrivee");
      }
      onFlowChange(kind);
    },
    [action.kind, mission.arrivagePointee, onFlowChange, onToast],
  );

  const handlePrimary = useCallback(() => {
    if (action.kind === "soumettre_rapport") {
      const text = draft.trim();
      if (text.length < 10) {
        onToast("Le rapport doit contenir au moins 10 caractères", "error");
        onFlowChange("report");
        return;
      }
      void onRun("rapport", mission.id, { texte: text }).then((ok) => {
        if (ok) {
          onDraftChange("");
          onFlowChange(null);
          onToast("Rapport soumis. En attente de validation par votre responsable", "success");
        }
      });
      return;
    }
    openFlow(flowForAction(action.kind));
  }, [action.kind, draft, mission, onDraftChange, onFlowChange, onRun, onToast, openFlow]);

  const handleConfirmAccept = useCallback(() => {
    void onRun("accepter", mission.id).then((ok) => {
      if (ok) {
        onFlowChange(null);
        onToast("Mission acceptée. Rendez-vous sur le chantier pour pointer votre arrivée", "success");
      }
    });
  }, [mission.id, onFlowChange, onRun, onToast]);

  const handleGpsConfirm = useCallback(
    (result: GpsResult) => {
      void onRun(gpsMode, mission.id, {
        latitude: result.latitude,
        longitude: result.longitude,
        horsRayon: result.horsRayon,
      }).then((ok) => {
        if (ok) {
          onFlowChange(null);
          if (result.horsRayon) {
            onToast("Pointage hors zone transmis pour vérification", "info");
          } else {
            onToast(`Pointage d'${gpsMode === "arrivee" ? "arrivée" : "sortie"} confirmé par le serveur`, "success");
          }
        }
      });
    },
    [gpsMode, mission.id, onFlowChange, onRun, onToast],
  );

  const submitReport = useCallback(
    (text: string) => {
      void onRun("rapport", mission.id, { texte: text }).then((ok) => {
        if (ok) {
          onDraftChange("");
          onFlowChange(null);
          onToast("Rapport soumis. En attente de validation par votre responsable", "success");
        }
      });
    },
    [mission.id, onDraftChange, onFlowChange, onRun, onToast],
  );

  const idle = action.kind === "attente_validation" || action.kind === "terminee";

  return (
    <div id="worker-primary-action">
      {idle ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
            <Icon name={meta.icon} size={16} />
          </span>
          <div className="flex-1">
            <p className="text-[12px] font-extrabold text-[#16233a]">{meta.label}</p>
            <p className="text-[10px] text-slate-500">{meta.hint}</p>
          </div>
        </div>
      ) : (
        <div>
          <button
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#0f7a5f] px-5 py-4 text-white shadow-lg shadow-emerald-900/20 transition active:scale-[0.99] disabled:opacity-60"
            disabled={busy}
            onClick={handlePrimary}
            style={{ minHeight: 56 }}
            type="button"
          >
            <span className="flex items-center gap-2.5">
              <Icon name={meta.icon} size={18} />
              <span className="text-left text-[13px] font-extrabold">{busy ? "Envoi…" : meta.label}</span>
            </span>
            <Icon className="-rotate-90 text-emerald-200" name="chevron-down" size={16} />
          </button>
          <p className="mt-1.5 px-2 text-[10px] leading-4 text-slate-400">{meta.hint}</p>
          {!online ? (
            <p className="mt-1.5 flex items-center gap-1.5 px-2 text-[10px] font-bold text-amber-600">
              <Icon name="warning" size={11} />
              Hors ligne : l&apos;action sera synchronisée au retour du réseau.
            </p>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        busy={busy}
        confirmLabel="Oui, accepter"
        message="En acceptant, vous vous engagez à vous rendre sur le chantier à la date planifiée. L'acceptation est enregistrée."
        onCancel={() => onFlowChange(null)}
        onConfirm={handleConfirmAccept}
        open={flow === "confirm-accepter"}
        title="Accepter cette mission ?"
      />

      <PointageSheet
        busy={busy}
        missionLat={mission.lat}
        missionLng={mission.lng}
        mode={gpsMode}
        onClose={() => onFlowChange(null)}
        onConfirm={handleGpsConfirm}
        open={flow === "gps"}
        rayonMetres={mission.rayonMetres}
      />

      <WorkerSheet open={flow === "photos"} title="Photos du chantier" onClose={() => onFlowChange(null)}>
        <PhotoUploader missionId={mission.id} onPhotosChange={onPhotosChange} photos={photos} />
        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-500">
          Les photos sont compressées automatiquement avant l&apos;envoi pour limiter la consommation de données.
          Chaque photo reste privée et n&apos;est visible que par votre filiale.
        </p>
      </WorkerSheet>

      <WorkerSheet open={flow === "report"} title="Rapport de mission" onClose={() => onFlowChange(null)}>
        <div>
          {photos.length === 0 ? (
            <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Icon className="mt-0.5 shrink-0 text-amber-600" name="warning" size={14} />
              <p className="text-[11px] font-bold leading-5 text-amber-800">
                Ajoutez au moins une photo avant de soumettre le rapport.
              </p>
            </div>
          ) : null}
          <label className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400" htmlFor="rapport">
            Description du travail réalisé
          </label>
          <textarea
            autoFocus
            className="mt-1.5 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-6 text-[#16233a] outline-none focus:border-[#0f7a5f]/50 focus:bg-white"
            id="rapport"
            maxLength={REPORT_MAX}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Décrivez le travail effectué, les difficultés éventuelles…"
            value={draft}
          />
          <p className={"mt-1 text-right text-[10px] " + (draft.length < 10 ? "font-bold text-rose-500" : "text-slate-400")}>
            {draft.length < 10 ? `${10 - draft.length} caractères minimum` : `${draft.length}/${REPORT_MAX}`}
          </p>
          <div className="mt-2 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-[11px] leading-5 text-slate-500 transition hover:border-[#0f7a5f]/40 hover:text-[#0f7a5f]"
                key={suggestion}
                onClick={() => onDraftChange(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <button
            className="mt-4 w-full min-h-[52px] rounded-2xl bg-[#0f7a5f] text-[13px] font-extrabold text-white transition active:scale-[0.99] disabled:opacity-50"
            disabled={draft.trim().length < 10 || photos.length === 0 || busy}
            onClick={() => submitReport(draft.trim())}
            type="button"
          >
            Soumettre le rapport
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Le rapport est transmis à votre responsable. Vous ne pouvez pas valider une mission vous-même.
          </p>
        </div>
      </WorkerSheet>

      <AnimatePresence>
        {busy ? (
          <motion.p
            animate={{ opacity: 1 }}
            className="fixed inset-x-0 bottom-24 z-30 mx-auto w-fit rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold text-white shadow-xl"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <span className="mr-2 inline-block size-2 animate-ping rounded-full bg-emerald-400 align-middle" />
            Envoi en cours…
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
