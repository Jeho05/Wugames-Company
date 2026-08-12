"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerService, WorkerServicePreuve } from "@/app/lib/worker-services-data";

type RecorderResult = { ok: boolean; dataUrl?: string; error?: string };

function useMediaRecorder(kind: "audio" | "video") {
  const [state, setState] = useState<"idle" | "recording" | "done" | "error">("idle");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const start = useCallback(async (): Promise<RecorderResult> => {
    if (state === "recording") {
      stop();
      return { ok: true, dataUrl: dataUrl ?? undefined };
    }
    try {
      const constraints: MediaStreamConstraints =
        kind === "audio"
          ? { audio: true }
          : { audio: true, video: { facingMode: "environment", width: { ideal: 960 }, height: { ideal: 720 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setDataUrl(url);
        setState("done");
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.onerror = () => {
        setState("error");
        setError("Erreur de l'enregistreur");
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
      setError(null);
      setDataUrl(null);
      return { ok: true };
    } catch {
      setState("error");
      setError("Accès au micro/caméra refusé — vérifiez les autorisations du navigateur.");
      return { ok: false, error: "permission-denied" };
    }
  }, [dataUrl, kind, state, stop]);

  return { dataUrl, error, result: start, state, stop };
}

type WorkerServiceFormProps = {
  service: WorkerService;
  initial: WorkerServicePreuve;
  onCancel: () => void;
  onSave: (preuve: WorkerServicePreuve) => void;
};

export function WorkerServiceForm({ service, initial, onCancel, onSave }: WorkerServiceFormProps) {
  const [arrivedAt, setArrivedAt] = useState(initial.arrivedAt ?? "");
  const [departedAt, setDepartedAt] = useState(initial.departedAt ?? "");
  const [observations, setObservations] = useState(initial.observations ?? "");
  const [photoAvant, setPhotoAvant] = useState(initial.photoAvant ?? null);
  const [photoApres, setPhotoApres] = useState(initial.photoApres ?? null);
  const [savingPhoto, setSavingPhoto] = useState<"avant" | "apres" | null>(null);
  const [flash, setFlash] = useState(false);
  const camRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  const audio = useMediaRecorder("audio");
  const video = useMediaRecorder("video");

  const startCamera = useCallback(async (photoSide: "avant" | "apres") => {
    try {
      setSavingPhoto(photoSide);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const videoEl = camRef.current;
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play().catch(() => undefined);
      }
      return stream;
    } catch {
      setSavingPhoto(null);
      return null;
    }
  }, []);

  const capture = useCallback(async (photoSide: "avant" | "apres") => {
    const stream = await startCamera(photoSide);
    if (!stream) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
    const videoEl = camRef.current;
    if (videoEl) {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth || 960;
      canvas.height = videoEl.videoHeight || 720;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg", 0.82);
        if (photoSide === "avant") setPhotoAvant(url);
        else setPhotoApres(url);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 300);
      }
    }
    stream.getTracks().forEach((track) => track.stop());
    if (camRef.current) camRef.current.srcObject = null;
    setSavingPhoto(null);
  }, [startCamera]);

  const canSubmit = arrivedAt.trim() !== "" && departedAt.trim() !== "" && observations.trim() !== "" && photoAvant && photoApres;

  function submit() {
    onSave({
      arrivedAt: arrivedAt.trim(),
      departedAt: departedAt.trim(),
      observations: observations.trim(),
      audioUrl: audio.dataUrl,
      videoUrl: video.dataUrl,
      photoAvant,
      photoApres,
    });
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        aria-label="Formulaire de service"
        aria-modal="true"
        className="pointer-events-auto relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7 dark:bg-[#0f1a2e]"
        initial={reduce ? undefined : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: 24 }}
        role="dialog"
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#0f7a5f]/10 text-[#0f7a5f]">
              <Icon name="clipboard" size={19} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f7a5f]">Formulaire de service</p>
              <h3 className="mt-0.5 text-[15px] font-extrabold leading-5 text-[#16233a] dark:text-white">{service.client}</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">{service.adresse}</p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            onClick={onCancel}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Heures */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400" htmlFor="service-arrivee">
                Heure d'arrivée
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-[13px] font-bold tabular-nums text-[#16233a] outline-none transition focus:border-[#0f7a5f] focus:ring-2 focus:ring-[#0f7a5f]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                id="service-arrivee"
                onChange={(event) => setArrivedAt(event.target.value)}
                type="time"
                value={arrivedAt}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400" htmlFor="service-depart">
                Heure de départ
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-[13px] font-bold tabular-nums text-[#16233a] outline-none transition focus:border-[#0f7a5f] focus:ring-2 focus:ring-[#0f7a5f]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                id="service-depart"
                onChange={(event) => setDepartedAt(event.target.value)}
                type="time"
                value={departedAt}
              />
            </div>
          </div>

          {/* Photos avant / après */}
          <div>
            <p className="mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">Preuves photo (avant / après)</p>
            <div className="grid grid-cols-2 gap-3">
              {(["avant", "apres"] as const).map((side) => {
                const photo = side === "avant" ? photoAvant : photoApres;
                const busy = savingPhoto === side;
                return (
                  <button
                    className={
                      "relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-dashed transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                      (photo
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50 hover:border-[#0f7a5f]/40 dark:border-white/10 dark:bg-white/[0.03]")
                    }
                    key={side}
                    onClick={() => void capture(side)}
                    type="button"
                  >
                    {photo ? (
                      <>
                        <img alt={`${side === "avant" ? "Avant" : "Après"} le service`} className="h-full w-full object-cover" src={photo} />
                        <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/70 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                          {side}
                        </span>
                      </>
                    ) : (
                      <span className="absolute inset-0 grid place-items-center">
                        {busy ? (
                          <span className="flex flex-col items-center gap-1.5 text-[#0f7a5f]">
                            <Icon className="animate-spin" name="refresh" size={18} />
                            <span className="text-[10px] font-bold">Caméra…</span>
                          </span>
                        ) : (
                          <span className="flex flex-col items-center gap-1.5 text-slate-400">
                            <Icon name="camera" size={20} />
                            <span className="text-[10px] font-bold uppercase">{side === "avant" ? "Avant" : "Après"}</span>
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
              <video className="hidden" muted playsInline ref={camRef} />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400" htmlFor="service-observations">
              Observations & recommandations
            </label>
            <textarea
              className="min-h-24 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:ring-2 focus:ring-[#0f7a5f]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              id="service-observations"
              onChange={(event) => setObservations(event.target.value)}
              placeholder="État des lieux, produits utilisés, recommandations au client…"
              value={observations}
            />
          </div>

          {/* Audio / vidéo */}
          <div>
            <p className="mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Note vocale ou vidéo (alternative à l'écrit)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: "audio", label: "Note vocale", icon: "message" as const, recorder: audio },
                  { key: "video", label: "Vidéo courte", icon: "camera" as const, recorder: video },
                ]
              ).map(({ key, label, icon, recorder }) => (
                <div key={key}>
                  <button
                    className={
                      "flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-[12px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                      (recorder.state === "recording"
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : recorder.state === "done"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-[#16233a] hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100")
                    }
                    onClick={() => void recorder.result()}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={icon} size={15} className={recorder.state === "recording" ? "animate-pulse" : undefined} />
                      {label}
                    </span>
                    <span
                      className={
                        "size-2.5 rounded-full " +
                        (recorder.state === "recording" ? "animate-pulse bg-rose-500" : recorder.state === "done" ? "bg-emerald-500" : "bg-slate-300")
                      }
                    />
                  </button>
                  {recorder.state === "recording" ? (
                    <button className="mt-1.5 w-full text-center text-[10px] font-bold text-rose-500" onClick={recorder.stop} type="button">
                      Arrêter l'enregistrement
                    </button>
                  ) : null}
                  {recorder.state === "done" && recorder.dataUrl ? (
                    <audio className="mt-2 w-full" controls src={recorder.dataUrl} />
                  ) : null}
                  {recorder.state === "error" && recorder.error ? (
                    <p className="mt-1.5 text-[9px] leading-4 text-rose-500">{recorder.error}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {flash ? <div className="pointer-events-none fixed inset-0 z-[70] bg-white/80" /> : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-4 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-900/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
            onClick={submit}
            style={{ minHeight: 52 }}
            type="button"
          >
            <Icon name="check" size={16} />
            Valider le service rendu
          </button>
          <p className="text-center text-[10px] text-slate-400">
            Le client verra la coche verte sur sa maison et ses preuves avant / après.
          </p>
        </div>
      </motion.div>
    </div>
  );
}