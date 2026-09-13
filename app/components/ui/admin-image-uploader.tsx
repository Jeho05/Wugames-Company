"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/app/components/ui/app-icon";
import { uploadFileToStorage, type StorageBucket } from "@/app/lib/upload-service";

type AdminImageUploaderProps = {
  value?: string | null;
  onChange: (url: string) => void;
  onClear?: () => void;
  bucket?: StorageBucket;
  pathPrefix?: string;
  label?: string;
  hint?: string;
  aspectRatio?: "square" | "video" | "banner" | "avatar";
  disabled?: boolean;
  className?: string;
};

export function AdminImageUploader({
  value,
  onChange,
  onClear,
  bucket = "vitrine",
  pathPrefix = "admin",
  label = "Image ou document",
  hint = "Formats acceptés : JPG, PNG, WEBP (max 10 Mo). Compression automatique.",
  aspectRatio = "video",
  disabled = false,
  className = "",
}: AdminImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      // Vérification basique du type
      if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
        setErrorMessage("Veuillez sélectionner une image valide (JPG, PNG, WEBP) ou un PDF.");
        return;
      }

      // Vérification taille max 15 Mo
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("Le fichier dépasse la limite maximale de 15 Mo.");
        return;
      }

      setErrorMessage(null);
      setIsUploading(true);
      setUploadProgress(20);

      try {
        const interval = setInterval(() => {
          setUploadProgress((prev) => (prev && prev < 85 ? prev + 15 : prev));
        }, 150);

        const result = await uploadFileToStorage(file, {
          bucket,
          pathPrefix,
          maxDimension: 1920,
          quality: 0.85,
        });

        clearInterval(interval);
        setUploadProgress(100);

        setTimeout(() => {
          onChange(result.publicUrl);
          setIsUploading(false);
          setUploadProgress(null);
        }, 250);
      } catch (err) {
        setIsUploading(false);
        setUploadProgress(null);
        const msg = err instanceof Error ? err.message : "Échec de l'upload.";
        setErrorMessage(msg);
      }
    },
    [bucket, onChange, pathPrefix]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        void handleFile(files[0]);
      }
    },
    [disabled, handleFile, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    if (disabled || isUploading) return;
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  }, [disabled, isUploading, onChange, onClear]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setManualUrl("");
    setShowManualInput(false);
  };

  // Dimensions et classes selon l'aspect ratio
  const ratioClasses = {
    square: "aspect-square max-w-xs",
    video: "aspect-video max-w-md",
    banner: "aspect-[21/9] max-w-lg",
    avatar: "size-28 rounded-full",
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label et bouton bascule URL manuelle */}
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-bold text-slate-700">{label}</label>}
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] font-semibold text-slate-400 hover:text-amber-600 transition"
        >
          {showManualInput ? "Téléverser un fichier" : "Saisir une URL"}
        </button>
      </div>

      {/* Saisie manuelle d'URL alternative */}
      {showManualInput ? (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#0c1424] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#17294b]"
          >
            Appliquer
          </button>
        </form>
      ) : value ? (
        /* Aperçu de l'image existante */
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xs transition hover:border-slate-300">
          <div className={`relative w-full overflow-hidden ${ratioClasses} mx-auto bg-slate-100`}>
            {value.startsWith("http") || value.startsWith("data:") || value.startsWith("blob:") ? (
              <Image
                src={value}
                alt="Aperçu du fichier"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Icon name="file-text" size={32} />
              </div>
            )}

            {/* Overlay d'actions au survol */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition group-hover:opacity-100 backdrop-blur-xs">
              <button
                type="button"
                disabled={disabled || isUploading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md transition hover:bg-white"
                title="Remplacer l'image"
              >
                <Icon name="pencil" size={13} />
                Remplacer
              </button>
              <button
                type="button"
                disabled={disabled || isUploading}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-600"
                title="Supprimer l'image"
              >
                <Icon name="trash" size={13} />
                Retirer
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Zone de Glisser-Déposer / Sélection */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
            isDragging
              ? "border-amber-500 bg-amber-50/50 scale-[0.99]"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                void handleFile(e.target.files[0]);
              }
            }}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="w-full max-w-xs space-y-3 py-3">
              <div className="flex items-center justify-center text-amber-600 animate-spin">
                <Icon name="refresh" size={26} />
              </div>
              <p className="text-xs font-semibold text-slate-700">Téléversement et optimisation...</p>
              {uploadProgress !== null && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-amber-500 transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-slate-600 shadow-xs border border-slate-200/80">
                <Icon name="upload" size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Cliquez pour choisir un fichier <span className="font-normal text-slate-500">ou glissez-déposez ici</span>
                </p>
                {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
          <Icon name="warning" size={13} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
