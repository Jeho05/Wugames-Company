"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { Icon } from "@/app/components/ui/app-icon";
import { uploadProduitImage } from "@/app/lib/api/stocks";

type ProductImageUploaderProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  required?: boolean;
};

export function ProductImageUploader({
  value,
  onChange,
  label = "Photo du produit",
  required = false,
}: ProductImageUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">(value && value.startsWith("http") && !value.includes("/uploads/") ? "url" : "upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif|avif)$/i)) {
      setError("Format non supporté (JPEG, PNG, WEBP, GIF, AVIF acceptés)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Taille maximale autorisée : 5 Mo");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await uploadProduitImage(file);
      if (res?.url) {
        onChange(res.url);
      } else {
        throw new Error("L'API n'a pas renvoyé d'URL valide");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du téléversement de l'image";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">
          {label}
          {required ? <span className="text-rose-500"> *</span> : <span className="ml-1 text-[11px] font-normal text-slate-400">(recommandée)</span>}
        </label>
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${
              mode === "upload"
                ? "bg-white font-bold text-[#17294b] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setMode("upload")}
            type="button"
          >
            <Icon name="upload" size={13} />
            <span>Fichier</span>
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${
              mode === "url"
                ? "bg-white font-bold text-[#17294b] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setMode("url")}
            type="button"
          >
            <span className="text-[13px]">🔗</span>
            <span>Lien URL</span>
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          className={`relative flex min-h-[108px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
            isDragging
              ? "border-[#d19331] bg-amber-50/50"
              : "border-slate-200 bg-slate-50/60 hover:border-[#7ea5ca] hover:bg-slate-50"
          } ${loading ? "pointer-events-none opacity-80" : ""}`}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDrop={handleDrop}
        >
          <input
            accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            disabled={loading}
            onChange={handleInputChange}
            title="Choisir une image"
            type="file"
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-2 text-[#385d86]">
              <div className="size-6 animate-spin rounded-full border-2 border-[#385d86] border-t-transparent" />
              <span className="mt-2 text-xs font-semibold">Téléversement en cours…</span>
              <span className="text-[11px] text-slate-400">Enregistrement sur le stockage cloud</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <span className="grid size-9 place-items-center rounded-xl bg-white text-slate-600 shadow-xs">
                <Icon name="upload" size={18} />
              </span>
              <span className="mt-2 text-xs font-bold text-slate-700">
                Glisser-déposer ou cliquer pour choisir une image
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">
                PNG, JPG, WEBP, GIF jusqu’à 5 Mo
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            onChange={(e) => {
              setError(null);
              onChange(e.target.value.trim() || null);
            }}
            placeholder="https://images.unsplash.com/photo-... ou URL CDN"
            type="url"
            value={value ?? ""}
          />
          <p className="text-[11px] text-slate-400">
            Saisissez le lien direct vers une image hébergée en ligne.
          </p>
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500">
          <Icon name="warning" size={13} />
          <span>{error}</span>
        </div>
      ) : null}

      {value ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Aperçu du produit"
              className="size-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/120x120/f1f5f9/64748b?text=Image+Invalide";
              }}
              src={value}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-700">{value}</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <Icon name="check" size={12} /> Image prête et associée
            </p>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            onClick={() => onChange(null)}
            title="Supprimer la photo"
            type="button"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
