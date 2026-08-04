"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";

const subjects = [
  "Construction",
  "Rénovation",
  "Entretien & nettoyage",
  "Mobilier sur mesure",
  "Matériaux & fournitures",
  "Autre demande",
];

export function ContactForm() {
  const router = useRouter();
  const [subject, setSubject] = useState(subjects[0]);

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
          Formulaire de contact
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-[-0.035em] text-[#17294b]">
          Écrivez-nous directement
        </h3>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            router.push("/connexion");
          }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Nom complet</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                  name="name"
                  placeholder="Votre nom"
                  required
                  type="text"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600">Téléphone</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                  name="phone"
                  placeholder="+225 07 00 00 00 00"
                  type="tel"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Adresse e-mail</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                name="email"
                placeholder="vous@exemple.com"
                required
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Sujet</span>
              <select
                className="mt-1.5 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                onChange={(event) => setSubject(event.target.value)}
                value={subject}
              >
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Votre message</span>
              <textarea
                className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                name="message"
                placeholder="Décrivez votre projet en quelques lignes…"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Pièces jointes <span className="font-medium text-slate-400">(photos, plans — 5 max)</span>
              </span>
              <input
                accept="image/*,.pdf,.dwg"
                className="mt-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500 outline-none transition file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#17294b] file:px-3.5 file:py-2 file:text-xs file:font-bold file:text-white hover:border-[#7ea5ca] focus:border-[#7ea5ca]"
                multiple
                name="pieces-jointes"
                type="file"
              />
            </label>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#243a61] sm:w-auto"
              type="submit"
            >
              Envoyer le message <Icon name="arrow-right" size={17} />
            </button>
            <p className="text-[11px] text-slate-400">
              Connectez-vous ou créez un compte pour envoyer votre message.
            </p>
          </form>
      </div>

      <aside className="space-y-4">
        {[
          { icon: "message" as const, title: "E-mail", lines: ["wugams_holding_inc@hotmail.com"] },
          { icon: "clock" as const, title: "Horaires", lines: ["Lundi - Vendredi", "Matinée : 9 h 00 – 11 h 00", "Soirée : 15 h 00 – 17 h 00", "Urgences chantier : 5 j/7"] },
          { icon: "map" as const, title: "Adresse", lines: ["Bénin, Porto-Novo / Dowa Saint-Paul C/31", "Visite libre"] },
          { icon: "truck" as const, title: "Livraison matériaux", lines: ["Commander sur Espace WU"] },
        ].map((card) => (
          <div
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={card.title}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
              <Icon name={card.icon} size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#233856]">{card.title}</p>
              {card.lines.map((line) => (
                <p className="mt-0.5 text-xs leading-5 text-slate-500" key={line}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
