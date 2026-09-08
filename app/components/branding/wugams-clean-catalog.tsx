"use client";

import { Icon } from "@/app/components/ui/app-icon";
import {
  PLAN_A,
  PLAN_B,
  PLAN_C,
  WUGAMS_CLEAN_CONTACT,
  WUGAMS_CLEAN_DIGITAL,
  WUGAMS_CLEAN_ENGAGEMENTS,
  WUGAMS_CLEAN_HERO,
  WUGAMS_CLEAN_OFFRES_INTRO,
  WUGAMS_CLEAN_OPTIONS,
  WUGAMS_CLEAN_SCORE,
  formatFcfaClean,
} from "@/app/lib/wugams-clean-catalog";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
      {children}
    </h2>
  );
}

function GreenSub({ children }: { children: string }) {
  return (
    <p className="mt-2 text-sm font-semibold leading-6 text-teal-800 sm:text-base dark:text-teal-200">
      {children}
    </p>
  );
}

const cardCls =
  "overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]";
const softCardCls =
  "rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]";
const bodyTextCls = "text-slate-800 dark:text-slate-200";
const mutedTextCls = "text-slate-700 dark:text-slate-300";
const titleTealCls = "text-teal-900 dark:text-teal-200";

export function WugamsCleanCatalog({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-900 dark:border-teal-400/30 dark:bg-teal-400/15 dark:text-teal-200">
          <Icon name="shield" size={14} />
          {WUGAMS_CLEAN_HERO.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          {WUGAMS_CLEAN_HERO.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base font-semibold text-teal-800 dark:text-teal-200">
          {WUGAMS_CLEAN_HERO.subtitle}
        </p>
      </div>

      {/* Offres intro */}
      <div className="text-center">
        <span className="mx-auto block h-1 w-16 rounded-full bg-teal-700 dark:bg-teal-400" />
        <div className="mt-4">
          <SectionTitle>{WUGAMS_CLEAN_OFFRES_INTRO.title}</SectionTitle>
          <GreenSub>{WUGAMS_CLEAN_OFFRES_INTRO.subtitle}</GreenSub>
        </div>
      </div>

      {/* Plan A */}
      <section className={cardCls}>
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_A.nom}</SectionTitle>
          <p className="mt-4 text-base font-bold text-teal-900 dark:text-teal-200">
            Fréquence : {PLAN_A.frequence}
          </p>
          <p className={`mt-1 text-sm font-medium ${mutedTextCls}`}>
            <span className="font-bold text-slate-900 dark:text-white">Cibles :</span> {PLAN_A.cibles}
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-300 dark:border-white/15">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-teal-800 text-white">
                  {PLAN_A.colonnes.map((c) => (
                    <th key={c} className="px-4 py-3 text-sm font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_A.lignes.map((l, i) => (
                  <tr
                    key={l.toilettes}
                    className={
                      i % 2 === 1
                        ? "bg-slate-100 dark:bg-white/[0.05]"
                        : "bg-white dark:bg-transparent"
                    }
                  >
                    <td
                      className={`px-4 py-3 font-semibold ${bodyTextCls}`}
                    >
                      {l.toilettes}
                    </td>
                    <td className="px-4 py-3">
                      {l.prixMensuel !== null ? (
                        <span className="inline-flex rounded-lg bg-teal-800 px-3 py-1.5 text-sm font-bold text-white">
                          {new Intl.NumberFormat("fr-FR").format(l.prixMensuel)} F
                        </span>
                      ) : (
                        <span className={`font-semibold ${bodyTextCls}`}>Sur devis</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Plan B */}
      <section className={cardCls}>
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_B.nom}</SectionTitle>
          <p className={`mt-4 text-sm font-medium ${mutedTextCls}`}>
            <span className="font-bold text-slate-900 dark:text-white">Destiné à :</span>{" "}
            {PLAN_B.destineA}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-300 dark:border-white/15">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-teal-800 text-white">
                  <th className="px-4 py-3 text-sm font-bold">Nb de toilettes</th>
                  {PLAN_B.formules.map((f) => (
                    <th key={f} className="px-4 py-3 text-sm font-bold">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_B.lignes.map((l, i) => (
                  <tr
                    key={l.tranche}
                    className={
                      i % 2 === 1
                        ? "bg-slate-100 dark:bg-white/[0.05]"
                        : "bg-white dark:bg-transparent"
                    }
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {l.tranche}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>
                      {formatFcfaClean(l.essentiel)} / tol.
                    </td>
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>
                      {formatFcfaClean(l.confort)} / tol.
                    </td>
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>
                      {formatFcfaClean(l.premium)} / tol.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-2 text-xs font-medium ${mutedTextCls}`}>
            Prix mensuel par toilette — {PLAN_B.unite}
          </p>
        </div>
      </section>

      {/* Plan C */}
      <section className={cardCls}>
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_C.nom}</SectionTitle>
          <p className={`mt-4 text-sm font-medium ${mutedTextCls}`}>
            <span className="font-bold text-slate-900 dark:text-white">Secteurs :</span>{" "}
            {PLAN_C.secteurs}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-300 dark:border-white/15">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="bg-teal-800 text-white">
                  <th className="px-4 py-3 text-sm font-bold">Nb Toilettes</th>
                  {PLAN_C.formules.map((f) => (
                    <th key={f} className="px-4 py-3 text-sm font-bold">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_C.lignes.map((l, i) => (
                  <tr
                    key={l.tranche}
                    className={
                      i % 2 === 1
                        ? "bg-slate-100 dark:bg-white/[0.05]"
                        : "bg-white dark:bg-transparent"
                    }
                  >
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>{l.tranche}</td>
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>
                      {formatFcfaClean(l.standard)}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${bodyTextCls}`}>
                      {formatFcfaClean(l.intensive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-3 text-xs font-medium italic leading-5 ${mutedTextCls}`}>
            * {PLAN_C.permanence}
          </p>
        </div>
      </section>

      {/* Options & Remises */}
      <section>
        <SectionTitle>Options & Remises WUGAMS</SectionTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={softCardCls}>
            <div className="p-6">
              <h3 className={`text-base font-bold ${titleTealCls}`}>Options & Inclusions</h3>
              <ul className={`mt-3 space-y-2.5 text-sm font-medium ${bodyTextCls}`}>
                {WUGAMS_CLEAN_OPTIONS.inclusions.map((o) => (
                  <li key={o.label} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300" />
                    <span>
                      {o.label} :{" "}
                      <strong className="text-slate-900 dark:text-white">{o.valeur}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={softCardCls}>
            <div className="p-6">
              <h3 className={`text-base font-bold ${titleTealCls}`}>Avantages Contractuels</h3>
              <ul className={`mt-3 space-y-2.5 text-sm font-medium ${bodyTextCls}`}>
                {WUGAMS_CLEAN_OPTIONS.avantages.map((a) => (
                  <li key={a.label}>
                    {a.label} :{" "}
                    <strong className="text-slate-900 dark:text-white">{a.valeur}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {!compact && (
        <>
          {/* Innovation */}
          <div className="text-center">
            <span className="mx-auto block h-1 w-16 rounded-full bg-teal-700 dark:bg-teal-400" />
            <div className="mt-4">
              <SectionTitle>{WUGAMS_CLEAN_DIGITAL.titre}</SectionTitle>
              <GreenSub>{WUGAMS_CLEAN_DIGITAL.sousTitre}</GreenSub>
            </div>
          </div>

          <section>
            <SectionTitle>{WUGAMS_CLEAN_DIGITAL.appTitre}</SectionTitle>
            <ul className="mt-4 space-y-4">
              {WUGAMS_CLEAN_DIGITAL.fonctionnalites.map((f) => (
                <li
                  key={f.titre}
                  className={`flex items-start gap-3 text-sm font-medium leading-6 ${bodyTextCls}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-800 text-white">
                    <Icon
                      name={f.titre.includes("Horaire") ? "clock" : f.titre.includes("Checklist") ? "check" : f.titre.includes("Preuves") ? "camera" : "warning"}
                      size={16}
                    />
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">{f.titre} :</strong>{" "}
                    {f.texte}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle>Pilotage & Espace Client</SectionTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {WUGAMS_CLEAN_DIGITAL.pilotage.map((p) => (
                <div key={p.titre} className={softCardCls}>
                  <div className="p-6">
                    <h3 className={`text-base font-bold ${titleTealCls}`}>{p.titre}</h3>
                    <p className={`mt-2 text-sm font-medium leading-6 ${bodyTextCls}`}>
                      {p.texte}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>{WUGAMS_CLEAN_SCORE.titre}</SectionTitle>
            <div className="mt-4 grid gap-6 md:grid-cols-[280px_1fr] md:items-center">
              <div className="rounded-2xl bg-teal-800 p-6 text-center text-white">
                <p className="text-6xl font-extrabold tracking-tight">/100</p>
                <p className="mt-1 text-sm font-semibold text-teal-100">Indicateur Qualité</p>
              </div>
              <div>
                <h3 className={`text-base font-bold ${titleTealCls}`}>
                  {WUGAMS_CLEAN_SCORE.sousTitre}
                </h3>
                <p className={`mt-1 text-sm font-medium ${bodyTextCls}`}>
                  {WUGAMS_CLEAN_SCORE.texte}
                </p>
                <ul className={`mt-3 space-y-2 text-sm font-medium ${bodyTextCls}`}>
                  {WUGAMS_CLEAN_SCORE.echelle.map((e) => (
                    <li key={e.tranche}>
                      <strong className="text-slate-900 dark:text-white">{e.tranche} :</strong>{" "}
                      {e.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Nos Engagements Qualité</SectionTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {WUGAMS_CLEAN_ENGAGEMENTS.map((e) => (
                <div key={e.titre} className={softCardCls}>
                  <div className="p-6">
                    <h3 className={`text-base font-bold ${titleTealCls}`}>{e.titre}</h3>
                    <p className={`mt-2 text-sm font-medium leading-6 ${bodyTextCls}`}>{e.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Merci */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Merci pour votre confiance !
            </h2>
            <p className="mt-2 font-semibold text-teal-800 dark:text-teal-200">
              {WUGAMS_CLEAN_CONTACT.tagline}
            </p>
            <p className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-bold text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-slate-100">
              <span>{WUGAMS_CLEAN_CONTACT.site}</span>
              <span aria-hidden="true" className="text-slate-500 dark:text-slate-400">
                |
              </span>
              <span>{WUGAMS_CLEAN_CONTACT.email}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
