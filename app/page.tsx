"use client";

import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { SpotlightCard } from "@/app/components/branding/spotlight-card";
import { Reveal } from "@/app/components/branding/reveal";
import { GradientMesh } from "@/app/components/branding/gradient-mesh";
import { Marquee } from "@/app/components/branding/marquee";
import { ShimmerText } from "@/app/components/branding/shimmer-text";
import { PulseButton } from "@/app/components/branding/pulse-button";

const painPoints = [
  "Vous avez déjà fait appel à un artisan qui n&apos;a pas tenu ses promesses ?",
  "Des travaux en retard, des devis qui explosent, personne pour vous rassurer ?",
  "Vous ne savez plus à qui faire confiance pour vos projets immobiliers ?",
];

const services = [
  {
    description: "Rénovation intérieure et extérieure, construction neuve, aménagement complet.",
    icon: "folder" as const,
    title: "Rénovation & Construction",
  },
  {
    description: "Nettoyage professionnel pour résidences, bureaux, complexes médicaux et espaces verts.",
    icon: "sparkles" as const,
    title: "Nettoyage & Entretien",
  },
  {
    description: "Matériaux de construction et de bricolage, livraison rapide et conseil technique.",
    icon: "boxes" as const,
    title: "Matériaux & Fournitures",
  },
  {
    description: "Création, conception et restauration de mobilier sur mesure.",
    icon: "hardhat" as const,
    title: "Mobilier & Design",
  },
  {
    description: "Accompagnement pour diriger, structurer et créer de nouvelles entreprises.",
    icon: "building" as const,
    title: "Diriger & Créer d'entreprises",
  },
];

const beforeAfter = [
  { after: "Un seul interlocuteur pour tout le projet", before: "5 artisans différents, 5 interlocuteurs" },
  { after: "Suivi en temps réel de l&apos;avancement", before: "Plus de nouvelles pendant 3 semaines" },
  { after: "Devis clair, sans surprise", before: "Devis à 2M, facture finale à 5M" },
  { after: "Garantie décennale incluse", before: "Aucune garantie, bons sentiments" },
];

const testimonials = [
  {
    name: "Koffi Amara",
    role: "Propriétaire, Résidence Cocody",
    text: "Après 3 mauvaises expériences avec des artisans, WUGAMS a tout changé. Le suivi en temps réel, la transparence sur les coûts. Pour la première fois, j&apos;ai pu dormir tranquille pendant mes travaux.",
  },
  {
    name: "Ahoua Brigitte",
    role: "Directrice, SCI Les Palmiers",
    text: "On ne nous a rien vendu. On nous a écoutés, compris, puis proposé une solution adaptée. C&apos;est ça la différence WUGAMS. Le résultat a dépassé nos attentes.",
  },
  {
    name: "Koné David",
    role: "Entrepreneur immobilier",
    text: "De la rénovation à la décoration, un seul interlocuteur. Zéro mauvaise surprise. Mon projet a été livré dans les temps et le budget était respecté à l&apos;euro près.",
  },
];

const guarantees = [
  { icon: "shield" as const, title: "Garantie décennale", text: "Tous nos travaux sont couverts par une garantie légale de 10 ans." },
  { icon: "check" as const, title: "Devis transparent", text: "Le prix annoncé est le prix payé. Aucune surprise, aucune charge cachée." },
  { icon: "clock" as const, title: "Respect des délais", text: "Nous nous engageons sur un calendrier. Si nous ne tenons pas, nous compensons." },
  { icon: "message" as const, title: "Suivi en temps réel", text: "Vous voyez l&apos;avancement de vos travaux à tout moment, depuis votre téléphone." },
];

export default function ClientBrandingPage() {
  return (
    <main className="overflow-hidden bg-[#fbfcfe] text-[#17294b]">

      {/* ═══ HERO ═══ */}
      <section className="relative border-b border-slate-200/80 bg-[#f7f9fc]">
        <GradientMesh />
        <header className="relative z-10 mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
            <a className="transition hover:text-[#17294b]" href="#probleme">Le problème</a>
            <a className="transition hover:text-[#17294b]" href="#solution">Notre solution</a>
            <a className="transition hover:text-[#17294b]" href="#temoignages">Ils nous font confiance</a>
            <a className="transition hover:text-[#17294b]" href="#rencontre">Rencontrez-nous</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50 sm:px-4 sm:text-sm" href="/connexion">
              Se connecter
            </Link>
            <PulseButton href="#rencontre">
              <span className="hidden sm:inline">Parlons de votre projet</span>
            </PulseButton>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl lg:mx-0">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e7d3ae] bg-[#fff8eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5680a]">
                <Icon name="sparkles" size={14} />
                WUGAMS Holding Inc. &mdash; 5 filiales, un seul interlocuteur
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 max-w-2xl text-[42px] font-bold leading-[1.04] tracking-[-0.065em] sm:text-6xl">
                <ShimmerText text="Vous méritez un partenaire qui tient ses promesses." />
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                WUGAMS ne vous vend rien. On vous accompagne. De la première rencontre à la livraison, on vous écoute, on clarifie votre projet, et on construit avec vous. Pas de surprise. Pas de mauvaise fois.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PulseButton href="#rencontre">
                  Consultation gratuite — 30 min
                </PulseButton>
                <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50" href="#solution">
                  Voir ce qu&apos;on fait exactement <Icon className="rotate-90" name="arrow-right" size={18} />
                </a>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> 1 200+ projets livrés</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> 4,7/5 satisfaction</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Zéro surprise tarifaire</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <Marquee
        className="border-y border-slate-200/60 bg-[#f0f4f8] py-3"
        items={["1 200+ projets livrés", "4,7/5 satisfaction", "Zéro surprise tarifaire", "Garantie décennale 10 ans", "5 filiales spécialisées", "Suivi en temps réel", "Consultation gratuite", "Devis transparent"]}
      />

      {/* ═══ PROBLÈME ═══ */}
      <section className="bg-white" id="probleme">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Le problème</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Vous avez déjà vécu ça ?</h2>
                <div className="mt-8 space-y-4">
                  {painPoints.map((point, i) => (
                    <Reveal delay={i * 120} key={i}>
                      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 p-4">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600"><Icon name="warning" size={14} /></span>
                        <p className="text-sm font-medium text-slate-700">{point}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={400}>
                  <p className="mt-6 text-sm leading-7 text-slate-500">
                    Vous n&apos;êtes pas seul. <span className="font-bold text-[#17294b]">83% des propriétaires</span> ont déjà eu une mauvaise expérience avec un artisan. Le résultat ? Du temps perdu, de l&apos;argent gaspillé, et un stress inutile.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    <span className="font-bold text-[#17294b]">Vous méritez mieux que ça.</span> Et c&apos;est exactement pour ça que WUGAMS existe.
                  </p>
                </Reveal>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[32px] bg-[#fef3e2] blur-3xl" />
                <div className="relative rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">Ce qui change avec WUGAMS</p>
                  <div className="mt-5 space-y-4">
                    {beforeAfter.map((item, i) => (
                      <Reveal delay={300 + i * 100} key={item.before}>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-500"><Icon name="close" size={12} /></span>
                            <p className="text-xs text-slate-500 line-through">{item.before}</p>
                          </div>
                          <div className="mt-2 flex items-start gap-2.5">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Icon name="check" size={12} /></span>
                            <p className="text-sm font-bold text-[#17294b]">{item.after}</p>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FILIALES ═══ */}
      <section className="relative border-y border-slate-200 bg-[#eef4fa]" id="solution">
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Nos filiales</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Un groupe, cinq expertises.</h2>
              <p className="mt-4 mx-auto max-w-xl text-sm leading-7 text-slate-500">
                Chaque filiale WUGAMS est spécialisée. Vous n&apos;avez qu&apos;un seul interlocuteur, mais une équipe complète derrière.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {services.map((service, i) => (
              <Reveal delay={i * 100} key={service.title}>
                <SpotlightCard className="h-full border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
                  <div className="p-5">
                    <span className={"grid size-11 place-items-center rounded-2xl " + (i % 2 === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                      <Icon name={service.icon} size={22} />
                    </span>
                    <h3 className="mt-5 text-base font-bold text-[#24395d]">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ENGAGEMENTS ═══ */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Nos engagements</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Ce qu&apos;on vous promet. Et ce qu&apos;on tient.</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((item, i) => (
              <Reveal delay={i * 100} key={item.title}>
                <SpotlightCard className="h-full border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
                  <div className="p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]"><Icon name={item.icon} size={20} /></span>
                    <h3 className="mt-4 text-sm font-bold text-[#24395d]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.text}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TÉMOIGNAGES ═══ */}
      <section className="border-y border-slate-200 bg-[#f7f9fc]" id="temoignages">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Preuve sociale</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Ils nous ont fait confiance. Ils ne le regrettent pas.</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal delay={i * 120} key={t.name}>
                <SpotlightCard className="h-full border border-slate-200 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5">
                  <div className="p-6">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg className="size-4 fill-current" key={s} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">&ldquo;{t.text}&rdquo;</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{t.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">
              <span className="font-bold text-[#17294b]">1 200+ projets</span> livrés avec succès &middot; <span className="font-bold text-[#17294b]">4,7/5</span> de satisfaction moyenne
            </p>
          </div>
        </div>
      </section>

      {/* ═══ RENCONTRE ═══ */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="rencontre">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Première étape</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Rencontrez WUGAMS. Gratuitement.</h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                Pas de vente. Pas de pression. Juste un échange pour comprendre votre projet. C&apos;est après cette rencontre qu&apos;on décide ensemble si on travaille ensemble.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: "map" as const, text: "Physique : au bureau ou sur votre site, au Bénin" },
                  { icon: "message" as const, text: "Visio : Zoom, Google Meet, où vous êtes" },
                  { icon: "clock" as const, text: "30 minutes. Suffisant pour clarifier le projet." },
                ].map((item, i) => (
                  <Reveal delay={i * 100} key={item.text}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]"><Icon name={item.icon} size={15} /></span>
                      <p className="text-sm font-medium text-slate-600">{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PulseButton href="/inscription">
                  Réserver ma consultation gratuite
                </PulseButton>
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50" href="/connexion">
                  J&apos;ai déjà un compte
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-slate-400">Aucune carte bancaire requise. Aucun engagement. On parle, c&apos;est tout.</p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-[#dfeafa] blur-3xl" />
              <div className="relative rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
                <div className="rounded-xl bg-[#17294b] px-5 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f2c56d]">Notre processus</p>
                  <h3 className="mt-2 text-lg font-bold">5 étapes. Zéro surprise.</h3>
                </div>
                <div className="mt-5 space-y-5">
                  {[
                    { num: "1", title: "Vous nous écrivez", desc: "Un message, un appel. Vous nous expliquez votre besoin." },
                    { num: "2", title: "On se rencontre", desc: "30 minutes en visio ou en personne. On vous écoute." },
                    { num: "3", title: "On clarifie", desc: "On pose les questions que personne ne pose. On comprend le projet." },
                    { num: "4", title: "On vous propose", desc: "Un devis détaillé, chiffré, sans surprise. Vous décidez." },
                    { num: "5", title: "On construit", desc: "Nos équipes travaillent. Vous suivez. On livre. Point." },
                  ].map((step, i) => (
                    <Reveal delay={400 + i * 120} key={step.num}>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e3a641] text-xs font-bold text-[#14223b]">{step.num}</span>
                          {i !== 4 ? <span className="mt-1 h-full w-px bg-slate-200" /> : null}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-bold text-[#17294b]">{step.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="contact">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-[#17294b] px-7 py-12 text-white sm:px-12 lg:px-16">
            <GradientMesh className="opacity-30" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Prêt à commencer ?</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">Chaque jour sans action, c&apos;un jour de perdu.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Votre projet mérite d&apos;avancer. On vous offre 30 minutes pour clarifier les choses. Sans engagement. Sans carte bancaire. Juste un échange humain.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PulseButton href="/inscription">
                  Réserver ma consultation
                </PulseButton>
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]" href="/connexion">
                  Espace client existant
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <BrandMark />
              <p className="mt-3 max-w-xs text-xs leading-5 text-slate-400">WUGAMS Holding Inc. &mdash; Bâtir, rénover, entreprendre. Avec la bonne équipe.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Filiales</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><a className="transition hover:text-[#17294b]" href="#solution">Rénovation & Construction</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#solution">Nettoyage & Entretien</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#solution">Matériaux & Fournitures</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#solution">Mobilier & Design</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#solution">Diriger &amp; Créer d&apos;entreprises</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Démarche</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><a className="transition hover:text-[#17294b]" href="#rencontre">Rencontrez WUGAMS</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#temoignages">Témoignages</a></li>
                <li><Link className="transition hover:text-[#17294b]" href="/vitrine">Espace WUGAMS (interne)</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Espace client</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><Link className="transition hover:text-[#17294b]" href="/connexion">Se connecter</Link></li>
                <li><Link className="transition hover:text-[#17294b]" href="/inscription">Créer un compte</Link></li>
                <li><a className="transition hover:text-[#17294b]" href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-[11px] text-slate-400">
            <p>&copy; 2026 WUGAMS Holding Inc. &mdash; Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
