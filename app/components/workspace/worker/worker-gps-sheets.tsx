"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { formatDistance, haversineMeters } from "@/app/lib/worker-data";
import { WorkerSheet } from "@/app/components/workspace/worker/worker-sheet";

export type PointageMode = "arrivee" | "sortie";

export type GpsResult = {
  latitude: number;
  longitude: number;
  precisionMetres: number;
  horsRayon: boolean;
  distanceMetres: number;
};

type PointageSheetProps = {
  open: boolean;
  mode: PointageMode;
  missionLat: number | null;
  missionLng: number | null;
  rayonMetres: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: (result: GpsResult) => void;
};

type GpsStep = "intro" | "acquiring" | "success" | "error";

const modeLabel: Record<PointageMode, string> = {
  arrivee: "Pointage d'arrivée",
  sortie: "Pointage de sortie",
};

export function PointageSheet({ open, mode, missionLat, missionLng, rayonMetres, busy, onClose, onConfirm }: PointageSheetProps) {
  const [step, setStep] = useState<GpsStep>("intro");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [result, setResult] = useState<GpsResult | null>(null);
  const [precision, setPrecision] = useState<number | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const geolocation = typeof navigator !== "undefined" ? navigator.geolocation : null;

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("intro");
      setErrorKey(null);
      setResult(null);
      setPrecision(null);
    }
  }

  const acquire = useCallback(() => {
    if (!geolocation) {
      setErrorKey("unsupported");
      setStep("error");
      return;
    }
    setStep("acquiring");
    setPrecision(null);
    geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setPrecision(accuracy);
        const distance = missionLat !== null && missionLng !== null ? haversineMeters(latitude, longitude, missionLat, missionLng) : null;
        const horsRayon = distance !== null && distance > rayonMetres;
        setResult({
          latitude,
          longitude,
          precisionMetres: accuracy,
          horsRayon: Boolean(horsRayon),
          distanceMetres: distance ?? 0,
        });
        setStep("success");
      },
      (error) => {
        setErrorKey(
          error.code === error.PERMISSION_DENIED
            ? "permission"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable",
        );
        setStep("error");
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 15_000 },
    );
  }, [geolocation, missionLat, missionLng, rayonMetres]);

  const confirm = useCallback(() => {
    if (result) {
      navigator.vibrate?.([60, 60, 120]);
      onConfirm(result);
    }
  }, [onConfirm, result]);

  const errorContent: Record<string, { title: string; text: string }> = {
    permission: {
      title: "Localisation refusée",
      text: "Autorisez l'accès à la position de l'application dans les réglages du téléphone (Réglages → Confidentialité → Localisation), puis réessayez.",
    },
    unavailable: {
      title: "GPS introuvable",
      text: "Vérifiez que le GPS est activé et que vous êtes dans une zone couverte par le réseau, puis réessayez.",
    },
    timeout: {
      title: "Signal trop lent",
      text: "La position n'a pas été obtenue à temps. Déplacez-vous vers un espace ouvert, vérifiez le réseau, puis réessayez.",
    },
    unsupported: {
      title: "Non disponible",
      text: "La géolocalisation n'est pas disponible sur cet appareil. Contactez votre responsable.",
    },
  };

  const error = errorKey ? errorContent[errorKey] : null;

  return (
    <WorkerSheet open={open} title={modeLabel[mode]} onClose={onClose}>
      <AnimatePresence mode="wait">
        {step === "intro" ? (
          <motion.div animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} initial={{ opacity: 0, x: 24 }} key="intro">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0f7a5f]/10 text-[#0f7a5f]">
                  <Icon name="map" size={22} />
                </span>
                <div>
                  <p className="text-[14px] font-extrabold text-[#16233a]">Vérification de votre position</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">Aucune action n&apos;est possible sans ce contrôle.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Seules vos coordonnées GPS sont envoyées au serveur",
                  "L'heure du pointage est enregistrée côté serveur",
                  missionLat !== null && missionLng !== null
                    ? `Rayon de tolérance : ${formatDistance(rayonMetres)} autour du chantier`
                    : "La zone du chantier sera vérifiée au premier pointage",
                  "Vous restez dans l'application pendant toute la vérification",
                ].map((line) => (
                  <li className="flex items-start gap-2 text-[12px] leading-5 text-slate-600" key={line}>
                    <Icon className="mt-0.5 shrink-0 text-[#0f7a5f]" name="check" size={13} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="mt-4 w-full min-h-[52px] rounded-2xl bg-[#0f7a5f] text-[14px] font-extrabold text-white transition active:scale-[0.99]"
              onClick={acquire}
              type="button"
            >
              Demander ma position
            </button>
          </motion.div>
        ) : null}

        {step === "acquiring" ? (
          <motion.div animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} initial={{ opacity: 0, x: 24 }} key="acquiring">
            <div className="grid place-items-center rounded-3xl bg-slate-50 py-10">
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#0f7a5f]/20" />
                <span className="relative grid size-20 place-items-center rounded-full bg-[#0f7a5f] text-white shadow-xl shadow-emerald-900/25">
                  <Icon name="map" size={30} />
                </span>
              </div>
              <p className="mt-5 text-[14px] font-extrabold text-[#16233a]">Localisation GPS en cours…</p>
              <p className="mt-1 text-[12px] text-slate-500">
                {precision !== null ? `Précision actuelle : ± ${formatDistance(precision)}` : "Le téléphone cherche les satellites"}
              </p>
              <p className="mt-4 text-center text-[11px] text-slate-400">
                Restez dans l&apos;application et en extérieur si possible.
                <br />
                Cette étape peut prendre quelques secondes.
              </p>
            </div>
          </motion.div>
        ) : null}

        {step === "success" && result ? (
          <motion.div animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} initial={{ opacity: 0, x: 24 }} key="success">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#0f7a5f]/10 text-[#0f7a5f]">
                    <Icon name="check" size={20} />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#16233a]">Position obtenue</p>
                    <p className="text-[11px] text-slate-500">Précision ± {formatDistance(result.precisionMetres)}</p>
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-3 py-1.5 text-[10px] font-extrabold " +
                    (result.horsRayon ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")
                  }
                >
                  {result.horsRayon ? "Hors zone" : "Sur zone"}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-[12px] leading-6 text-slate-600">
                <p className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="map" size={13} />
                  Distance au chantier : <b className="text-[#16233a]">{formatDistance(result.distanceMetres)}</b>
                  {result.horsRayon ? <span className="text-amber-600">(rayon : {formatDistance(rayonMetres)})</span> : null}
                </p>
                <p className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="clock" size={13} />
                  Horodatage enregistré côté serveur
                </p>
                <p className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="lock" size={13} />
                  Seules les coordonnées sont transmises
                </p>
              </div>
              {result.horsRayon ? (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-bold leading-5 text-amber-800">
                  Vous êtes à {formatDistance(Math.max(result.distanceMetres - rayonMetres, 0))} au-delà du rayon autorisé. Le
                  pointage sera transmis pour vérification à votre responsable.
                </p>
              ) : null}
            </div>
            <button
              className="mt-4 w-full min-h-[52px] rounded-2xl bg-[#0f7a5f] text-[14px] font-extrabold text-white transition active:scale-[0.99] disabled:opacity-60"
              disabled={busy}
              onClick={confirm}
              type="button"
            >
              {busy ? "Envoi…" : `Confirmer le pointage d'${mode === "arrivee" ? "arrivée" : "sortie"}`}
            </button>
          </motion.div>
        ) : null}

        {step === "error" && error ? (
          <motion.div animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} initial={{ opacity: 0, x: 24 }} key="error">
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <Icon name="warning" size={20} />
                </span>
                <div>
                  <p className="text-[14px] font-extrabold text-rose-700">{error.title}</p>
                  <p className="text-[12px] text-rose-500">Impossible d&apos;obtenir votre position</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-6 text-rose-700">{error.text}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="min-h-[48px] rounded-2xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 transition active:scale-[0.98]"
                onClick={onClose}
                type="button"
              >
                Annuler
              </button>
              <button
                className="min-h-[48px] rounded-2xl bg-[#0f7a5f] text-[13px] font-extrabold text-white transition active:scale-[0.98]"
                onClick={acquire}
                type="button"
              >
                Réessayer
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WorkerSheet>
  );
}
