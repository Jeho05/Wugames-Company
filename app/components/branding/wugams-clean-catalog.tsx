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
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
      {children}
    </h2>
  );
}

function GreenSub({ children }: { children: string }) {
  return <p className="mt-2 text-sm font-medium leading-6 text-teal-700 sm:text-base">{children}</p>;
}

export function WugamsCleanCatalog({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-800">
          <Icon name="shield" size={14} />
          {WUGAMS_CLEAN_HERO.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          {WUGAMS_CLEAN_HERO.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-teal-700">
          {WUGAMS_CLEAN_HERO.subtitle}
        </p>
      </div>

      {/* Offres intro */}
      <div className="text-center">
        <span className="mx-auto block h-1 w-16 rounded-full bg-teal-600" />
        <div className="mt-4">
          <SectionTitle>{WUGAMS_CLEAN_OFFRES_INTRO.title}</SectionTitle>
          <GreenSub>{WUGAMS_CLEAN_OFFRES_INTRO.subtitle}</GreenSub>
        </div>
      </div>

      {/* Plan A */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_A.nom}</SectionTitle>
          <p className="mt-4 text-base font-bold text-teal-800">Fréquence : {PLAN_A.frequence}</p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-bold">Cibles :</span> {PLAN_A.cibles}
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-teal-700 text-white">
                  {PLAN_A.colonnes.map((c) => (
                    <th key={c} className="px-4 py-3 font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_A.lignes.map((l, i) => (
                  <tr key={l.toilettes} className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                    <td className="px-4 py-3 text-slate-600">{l.toilettes}</td>
                    <td className="px-4 py-3">
                      {l.prixMensuel !== null ? (
                        <span className="inline-flex rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white">
                          {new Intl.NumberFormat("fr-FR").format(l.prixMensuel)} F
                        </span>
                      ) : (
                        <span className="text-slate-600">Sur devis</span>
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
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_B.nom}</SectionTitle>
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-bold">Destiné à :</span> {PLAN_B.destineA}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="px-4 py-3 font-bold">Nb de toilettes</th>
                  {PLAN_B.formules.map((f) => (
                    <th key={f} className="px-4 py-3 font-bold">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_B.lignes.map((l, i) => (
                  <tr key={l.tranche} className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                    <td className="px-4 py-3 font-bold text-slate-600">{l.tranche}</td>
                    <td className="px-4 py-3 text-slate-600">{formatFcfaClean(l.essentiel)} / tol.</td>
                    <td className="px-4 py-3 text-slate-600">{formatFcfaClean(l.confort)} / tol.</td>
                    <td className="px-4 py-3 text-slate-600">{formatFcfaClean(l.premium)} / tol.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Prix mensuel par toilette — {PLAN_B.unite}</p>
        </div>
      </section>

      {/* Plan C */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="p-6 sm:p-8">
          <SectionTitle>{PLAN_C.nom}</SectionTitle>
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-bold">Secteurs :</span> {PLAN_C.secteurs}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="px-4 py-3 font-bold">Nb Toilettes</th>
                  {PLAN_C.formules.map((f) => (
                    <th key={f} className="px-4 py-3 font-bold">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_C.lignes.map((l, i) => (
                  <tr key={l.tranche} className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                    <td className="px-4 py-3 text-slate-600">{l.tranche}</td>
                    <td className="px-4 py-3 text-slate-600">{formatFcfaClean(l.standard)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatFcfaClean(l.intensive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs italic leading-5 text-slate-500">* {PLAN_C.permanence}</p>
        </div>
      </section>

      {/* Options & Remises */}
      <section>
        <SectionTitle>Options & Remises WUGAMS</SectionTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-base font-bold text-teal-800">Options & Inclusions</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {WUGAMS_CLEAN_OPTIONS.inclusions.map((o) => (
                <li key={o.label} className="flex items-start gap-2">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-teal-600" />
                  <span>
                    {o.label} : <strong>{o.valeur}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-base font-bold text-teal-800">Avantages Contractuels</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {WUGAMS_CLEAN_OPTIONS.avantages.map((a) => (
                <li key={a.label}>
                  {a.label} : <strong>{a.valeur}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {!compact && (
        <>
          {/* Innovation */}
          <div className="text-center">
            <span className="mx-auto block h-1 w-16 rounded-full bg-teal-600" />
            <div className="mt-4">
              <SectionTitle>{WUGAMS_CLEAN_DIGITAL.titre}</SectionTitle>
              <GreenSub>{WUGAMS_CLEAN_DIGITAL.sousTitre}</GreenSub>
            </div>
          </div>

          <section>
            <SectionTitle>{WUGAMS_CLEAN_DIGITAL.appTitre}</SectionTitle>
            <ul className="mt-4 space-y-3">
              {WUGAMS_CLEAN_DIGITAL.fonctionnalites.map((f) => (
                <li key={f.titre} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-600 text-white">
                    <Icon
                      name={f.titre.includes("Horaire") ? "clock" : f.titre.includes("Checklist") ? "check" : f.titre.includes("Preuves") ? "camera" : "warning"}
                      size={15}
                    />
                  </span>
                  <span>
                    <strong className="text-slate-800">{f.titre} :</strong> {f.texte}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle>Pilotage & Espace Client</SectionTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {WUGAMS_CLEAN_DIGITAL.pilotage.map((p) => (
                <div key={p.titre} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-base font-bold text-teal-800">{p.titre}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.texte}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>{WUGAMS_CLEAN_SCORE.titre}</SectionTitle>
            <div className="mt-4 grid gap-6 md:grid-cols-[280px_1fr] md:items-center">
              <div className="rounded-2xl bg-teal-700 p-6 text-center text-white">
                <p className="text-6xl font-extrabold">/100</p>
                <p className="mt-1 text-sm text-teal-100">Indicateur Qualité</p>
              </div>
              <div>
                <h3 className="text-base font-bold text-teal-800">{WUGAMS_CLEAN_SCORE.sousTitre}</h3>
                <p className="mt-1 text-sm text-slate-600">{WUGAMS_CLEAN_SCORE.texte}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {WUGAMS_CLEAN_SCORE.echelle.map((e) => (
                    <li key={e.tranche}>
                      <strong className="text-slate-800">{e.tranche} :</strong> {e.label}
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
                <div key={e.titre} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-base font-bold text-teal-800">{e.titre}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{e.texte}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Merci */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Merci pour votre confiance !</h2>
            <p className="mt-2 font-medium text-teal-700">{WUGAMS_CLEAN_CONTACT.tagline}</p>
            <p className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-600">
              <span>{WUGAMS_CLEAN_CONTACT.site}</span>
              <span className="text-slate-300">|</span>
              <span>{WUGAMS_CLEAN_CONTACT.email}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
