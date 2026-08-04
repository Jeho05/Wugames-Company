"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/app/lib/api-client";
import type { ModuleRow } from "@/app/lib/demo-data";
import type { CreateField, CreateFieldOption, ModuleCreateConfig } from "@/app/lib/module-create";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";

type ModuleCreateFormProps = {
  config: ModuleCreateConfig;
  onClose: () => void;
  onSubmitRow: (row: ModuleRow) => void;
  onCreated: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldError(field: CreateField, raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (field.required && !value) return "Champ requis.";
  if (value && field.type === "email" && !EMAIL_RE.test(value)) return "Adresse e-mail invalide.";
  if (value && field.type === "number") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "Valeur numérique attendue.";
    if (field.min !== undefined && parsed < field.min) return `Minimum : ${field.min}.`;
  }
  return null;
}

export function ModuleCreateForm({ config, onClose, onSubmitRow, onCreated }: ModuleCreateFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, CreateFieldOption[]>>({});

  useEffect(() => {
    let cancelled = false;
    for (const field of config.fields) {
      if (!field.optionsLoader) continue;
      field.optionsLoader()
        .then((options) => {
          if (!cancelled) setDynamicOptions((prev) => ({ ...prev, [field.name]: options }));
        })
        .catch(() => {
          if (!cancelled) setDynamicOptions((prev) => ({ ...prev, [field.name]: [] }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [config]);

  const optionsFor = useMemo(
    () => (field: CreateField): CreateFieldOption[] => field.optionsLoader ? dynamicOptions[field.name] ?? [] : field.options ?? [],
    [dynamicOptions]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const field of config.fields) {
      const error = fieldError(field, values[field.name]);
      if (error) nextErrors[field.name] = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const entity = await config.submit(values);
      onCreated();
      const row = config.rowMapper ? config.rowMapper(entity) : null;
      if (row) onSubmitRow(row);
      else onClose();
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : "Échec de l'enregistrement. Réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div
      aria-labelledby="module-create-title"
      aria-modal="true"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">{config.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="module-create-title">
            {config.title}
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

      <form className="mt-5 space-y-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
        {config.fields.map((field) => {
          const options = optionsFor(field);
          const loadingOptions = field.optionsLoader !== undefined && options.length === 0;
          const error = errors[field.name];

          return (
            <label className="block" key={field.name}>
              <span className="text-xs font-bold text-slate-600">
                {field.label}
                {field.required ? <span className="text-rose-500"> *</span> : null}
              </span>
              {field.type === "select" ? (
                <select
                  className={
                    "mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white " +
                    (error
                      ? "border-rose-300 ring-4 ring-rose-100"
                      : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]")
                  }
                  disabled={loadingOptions}
                  onChange={(event) => {
                    const next = { ...values, [field.name]: event.target.value };
                    setValues(next);
                    setErrors((prev) => ({ ...prev, [field.name]: "" }));
                  }}
                  value={values[field.name] ?? ""}
                >
                  <option value="">
                    {loadingOptions ? "Chargement…" : field.required ? "Sélectionner…" : "Aucun"}
                  </option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={
                    "mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white " +
                    (error
                      ? "border-rose-300 ring-4 ring-rose-100"
                      : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]")
                  }
                  min={field.min}
                  onChange={(event) => {
                    const next = { ...values, [field.name]: event.target.value };
                    setValues(next);
                    setErrors((prev) => ({ ...prev, [field.name]: "" }));
                  }}
                  placeholder={field.placeholder}
                  step={field.step}
                  type={field.type}
                  value={values[field.name] ?? ""}
                />
              )}
              {field.help ? <span className="mt-1 block text-[11px] text-slate-400">{field.help}</span> : null}
              {error ? <span className="mt-1 block text-[11px] font-bold text-rose-500">{error}</span> : null}
            </label>
          );
        })}

        {apiError ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            <Icon className="mt-0.5 shrink-0" name="warning" size={15} />
            <span>{apiError}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <LoadingButton
            className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-3.5 py-2 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] disabled:cursor-not-allowed disabled:opacity-60"
            loading={submitting}
            loadingLabel="Enregistrement…"
            type="submit"
          >
            <Icon name="plus" size={16} />
            Enregistrer
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
