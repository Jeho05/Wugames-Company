"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ApiError } from "@/app/lib/api-client";
import { createFiliale } from "@/app/lib/api/filiales";
import type { ModuleRow } from "@/app/lib/demo-data";
import { filialeRow } from "@/app/lib/module-data";

type FilialeCreateFormProps = {
  onClose: () => void;
  onSubmit: (row: ModuleRow) => void;
};

const domainSuggestions = [
  "Construction & BTP",
  "Nettoyage & Entretien",
  "Matériaux & Fournitures",
  "Mobilier & Design",
  "Énergie & Environnement",
  "Transport & Logistique",
  "Agriculture & Agroalimentaire",
  "Digital & Technologies",
  "Santé & Médical",
  "Éducation & Formation",
  "Commerce & Distribution",
  "Hôtellerie & Tourisme",
];

function slugCode(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 8) || "FIL"
  );
}

export function FilialeCreateForm({ onClose, onSubmit }: FilialeCreateFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [domain, setDomain] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const filteredSuggestions = domainSuggestions.filter((s) =>
    s.toLowerCase().includes(domain.toLowerCase())
  );

  const canSubmit = name.trim().length > 0 && domain.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const filiale = await createFiliale({
        nom: name.trim(),
        code: code.trim() || `${slugCode(name)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        description: domain.trim(),
      });
      onSubmit(filialeRow(filiale));
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : "Échec de la création. Réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby="filiale-create-title"
      aria-modal="true"
      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
            Nouvelle filiale
          </p>
          <h2
            className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]"
            id="filiale-create-title"
          >
            Créer une filiale
          </h2>
        </div>
        <button
          aria-label="Fermer"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label
            className="block text-xs font-bold text-slate-700"
            htmlFor="filiale-name"
          >
            Nom de la filiale <span className="text-red-500">*</span>
          </label>
          <input
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="filiale-name"
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              setCode(slugCode(value));
            }}
            placeholder="ex: WUGAMS Énergie"
            required
            type="text"
            value={name}
          />
        </div>

        <div>
          <label
            className="block text-xs font-bold text-slate-700"
            htmlFor="filiale-code"
          >
            Code (unique)
          </label>
          <input
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="filiale-code"
            onChange={(e) => setCode(e.target.value)}
            placeholder="Généré automatiquement"
            type="text"
            value={code}
          />
        </div>

        <div className="relative">
          <label
            className="block text-xs font-bold text-slate-700"
            htmlFor="filiale-domain"
          >
            Domaine d&apos;activité <span className="text-red-500">*</span>
          </label>
          <input
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="filiale-domain"
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => {
              setDomain(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="ex: Énergie & Environnement"
            required
            type="text"
            value={domain}
          />
          {showSuggestions && filteredSuggestions.length > 0 && domain.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {filteredSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    className="w-full px-3.5 py-2.5 text-left text-sm text-slate-600 transition hover:bg-sky-50 hover:text-[#17294b]"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDomain(suggestion);
                      setShowSuggestions(false);
                    }}
                    type="button"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {apiError ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            <Icon className="mt-0.5 shrink-0" name="warning" size={15} />
            <span>{apiError}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <button
            className="rounded-xl bg-[#e3a641] px-4 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] disabled:opacity-50 disabled:shadow-none"
            disabled={!canSubmit}
            type="submit"
          >
            <span className="inline-flex items-center gap-2">
              {submitting ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-[#14223b]/30 border-t-[#14223b]" />
              ) : (
                <Icon name="building" size={16} />
              )}
              {submitting ? "Création…" : "Créer la filiale"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
