"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerPhoto } from "@/app/lib/worker-data";

type PhotoUploaderProps = {
  missionId: string;
  photos: WorkerPhoto[];
  onPhotosChange: (photos: WorkerPhoto[]) => void;
};

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.72;
const SIMULATED_UPLOAD_MS = 1400;

function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("lecture"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image"));
      image.onload = () => {
        const ratio = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader({ missionId, photos, onPhotosChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);

  const send = useCallback(
    (photo: WorkerPhoto) => {
      onPhotosChange(photos.map((item) => (item.id === photo.id ? { ...item, status: "sending" } : item)));
      window.setTimeout(() => {
        onPhotosChange(photos.map((item) => (item.id === photo.id ? { ...item, status: "sent" } : item)));
      }, SIMULATED_UPLOAD_MS);
    },
    [onPhotosChange, photos],
  );

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setAdding(true);
      for (const file of Array.from(files)) {
        try {
          const dataUrl = await compressToDataUrl(file);
          const photo: WorkerPhoto = {
            id: crypto.randomUUID(),
            missionId,
            dataUrl,
            status: "compression",
            createdAt: Date.now(),
          };
          onPhotosChange([...photos, photo]);
          send(photo);
        } catch {
          onPhotosChange([
            ...photos,
            {
              id: crypto.randomUUID(),
              missionId,
              dataUrl: "",
              status: "failed",
              createdAt: Date.now(),
            },
          ]);
        }
      }
      setAdding(false);
    },
    [missionId, onPhotosChange, photos, send],
  );

  const retry = useCallback(
    (id: string) => {
      const photo = photos.find((item) => item.id === id);
      if (photo) send(photo);
    },
    [photos, send],
  );

  const remove = useCallback(
    (id: string) => onPhotosChange(photos.filter((item) => item.id !== id)),
    [onPhotosChange, photos],
  );

  return (
    <div>
      <input
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => void addFiles(event.target.files)}
        ref={inputRef}
        type="file"
      />

      {photos.length === 0 ? (
        <button
          className="grid w-full place-items-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-slate-500 transition active:scale-[0.99]"
          onClick={() => inputRef.current?.click()}
          style={{ minHeight: 160 }}
          type="button"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#0f7a5f] shadow-sm">
            <Icon name="camera" size={22} />
          </span>
          <span className="text-[13px] font-bold">Prendre une photo</span>
          <span className="max-w-52 text-center text-[11px] leading-5">
            Au moins une photo est obligatoire avant d&apos;envoyer le rapport.
          </span>
        </button>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-2.5">
            {photos.map((photo) => (
              <motion.div animate={{ scale: 1, opacity: 1 }} className="relative" initial={{ scale: 0.9, opacity: 0 }} key={photo.id}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                  {photo.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Photo de chantier" className="size-full object-cover" src={photo.dataUrl} />
                  ) : (
                    <div className="grid size-full place-items-center text-slate-300">
                      <Icon name="warning" size={22} />
                    </div>
                  )}
                  {photo.status === "sending" || photo.status === "compression" ? (
                    <div className="absolute inset-0 grid place-items-center bg-slate-950/45">
                      <Icon className="animate-spin text-white" name="refresh" size={18} />
                    </div>
                  ) : null}
                  {photo.status === "sent" ? (
                    <div className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-emerald-500 text-white shadow">
                      <Icon name="check" size={11} />
                    </div>
                  ) : null}
                  {photo.status === "failed" ? (
                    <div className="absolute inset-0 grid place-items-center bg-rose-950/40">
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-extrabold text-rose-600">Échec</span>
                    </div>
                  ) : null}
                </div>
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  {photo.status === "failed" ? (
                    <button
                      aria-label="Réessayer"
                      className="grid size-7 place-items-center rounded-full bg-white text-slate-700 shadow"
                      onClick={() => retry(photo.id)}
                      type="button"
                    >
                      <Icon name="refresh" size={12} />
                    </button>
                  ) : null}
                  <button
                    aria-label="Supprimer la photo"
                    className="grid size-7 place-items-center rounded-full bg-white text-rose-500 shadow"
                    onClick={() => remove(photo.id)}
                    type="button"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
            <button
              aria-label="Ajouter une photo"
              className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 transition active:scale-[0.97]"
              disabled={adding}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <Icon name="camera" size={20} />
            </button>
          </div>
          <p className="mt-2.5 text-center text-[10px] text-slate-400">
            {photos.filter((item) => item.status === "sent").length} photo(s) prête(s) · compresse automatiquement avant l&apos;envoi
          </p>
        </div>
      )}

      <AnimatePresence>
        {adding ? (
          <motion.p animate={{ opacity: 1 }} className="mt-2 text-center text-[11px] font-bold text-[#0f7a5f]" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
            Compression de la photo…
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
