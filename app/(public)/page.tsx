"use client";

import Link from "next/link";
import Image from "next/image";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { SpotlightCard } from "@/app/components/branding/spotlight-card";
import { Reveal } from "@/app/components/branding/reveal";
import { GradientMesh } from "@/app/components/branding/gradient-mesh";
import { ShaderBeams } from "@/app/components/branding/shader-beams";
import { Marquee } from "@/app/components/branding/marquee";
import { PulseButton } from "@/app/components/branding/pulse-button";
import { TestimonialImage } from "@/app/components/branding/images";
import { MobileNav } from "@/app/components/ui/mobile-nav";
import { GooeyText } from "@/app/components/ui/gooey-text-morphing";
import { ScrollChoreography } from "@/app/components/ui/scroll-choreography";
import { ContactForm } from "@/app/components/branding/contact-form";

const navLinks = [
  { label: "Le problème", href: "#probleme" },
  { label: "Notre solution", href: "#solution" },
  { label: "Ils nous font confiance", href: "#temoignages" },
  { label: "Rencontrez-nous", href: "#rencontre" },
];

const siteLinks = [
  { label: "Boutique", href: "/boutique" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Blog", href: "/blog" },
];

const painPoints = [
  "Vous avez déjà fait appel à un artisan qui n'a pas tenu ses promesses ?",
  "Vos travaux prennent du retard, vos devis augmentent, et personne ne vous rassure ?",
  "Vous ne savez plus à qui faire confiance pour réaliser vos projets de construction, de rénovation ou d'entretien ?",
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
    description: "Vente de matériaux de bricolage, de construction et d'entretien, livraison rapide et conseil technique.",
    icon: "boxes" as const,
    title: "Matériaux & Fournitures",
  },
  {
    description: "Achat, création, conception et restauration de mobilier sur mesure.",
    icon: "hardhat" as const,
    title: "Mobilier & Design",
  },
  {
    description: "Partenariat et Communauté",
    icon: "building" as const,
    title: "Diriger & Créer d'entreprises",
  },
];

const beforeAfter = [
  { after: "Une équipe engagée pour accompagner votre projet à chaque étape.", before: "5 artisans différents, 5 interlocuteurs" },
  { after: "Une communication régulière à chaque étape de votre projet.", before: "Plus de nouvelles pendant 3 semaines" },
  { after: "Devis clair, sans surprise", before: "Devis à 2M, facture finale à 5M" },
  { after: "Garantie d'accompagnement et de service après la réalisation de votre projet.", before: "Aucune garantie, bons sentiments" },
];

const testimonials = [
  {
    name: "Koffi Amara",
    role: "Propriétaire, Résidence Cocody",
    text: "Après 3 mauvaises expériences avec des artisans, WUGAMS a tout changé. Le suivi en temps réel, la transparence sur les coûts. Pour la première fois, j&apos;ai pu dormir tranquille pendant mes travaux.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    name: "Ahoua Brigitte",
    role: "Directrice, SCI Les Palmiers",
    text: "On ne nous a rien vendu. On nous a écoutés, compris, puis proposé une solution adaptée. C&apos;est ça la différence WUGAMS. Le résultat a dépassé nos attentes.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    name: "Koné David",
    role: "Entrepreneur immobilier",
    text: "De la rénovation à la décoration, un seul interlocuteur. Zéro mauvaise surprise. Mon projet a été livré dans les temps et le budget était respecté à l&apos;euro près.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
];

const guarantees = [
  { icon: "shield" as const, title: "Garantie de suivi et d'accompagnement", text: "Notre engagement ne s'arrête pas à la fin des travaux. Nous assurons un suivi et restons disponibles pour vous accompagner après la réalisation de votre projet." },
  { icon: "check" as const, title: "Le devis qui vous convient", text: "Nous vous proposons différentes options et vous accompagnons dans la validation de la solution retenue." },
  { icon: "clock" as const, title: "Respect du calendrier", text: "Nous définissons un calendrier réaliste avec vous. Si vous avez des contraintes de temps, nous pouvons proposer une réalisation express." },
  { icon: "message" as const, title: "Suivi en temps réel", text: "Nous maintenons une communication claire et continue pour vous permettre de suivre l'évolution de votre projet." },
];

const mobileNavLinks = [...navLinks, ...siteLinks];

export default function ClientBrandingPage() {
  return (
    <main className="overflow-x-hidden bg-[#fbfcfe] text-[#17294b]">

      {/* ═══ HEADER ═══ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b1526]/95 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between gap-3 px-5 sm:px-8">
          <BrandMark inverse />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <a className="text-white/85 transition hover:text-white" href="#probleme">Le problème</a>
            <a className="text-white/85 transition hover:text-white" href="#solution">Notre solution</a>
            <a className="text-white/85 transition hover:text-white" href="#temoignages">Ils nous font confiance</a>
            <a className="text-white/85 transition hover:text-white" href="#rencontre">Rencontrez-nous</a>
            {siteLinks.map((link) => (
              <Link className="text-white/85 transition hover:text-[#f2c56d]" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition hover:border-white/35 hover:bg-white/20 sm:px-4 sm:py-2.5 sm:text-sm" href="/connexion">
              Se connecter
            </Link>
            <div className="hidden sm:block">
              <PulseButton href="#rencontre">
                Parlons de votre projet
              </PulseButton>
            </div>
            <MobileNav inverse links={mobileNavLinks} />
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <ScrollChoreography
        images={{
          topLeft: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=100&w=2832&fm=webp&auto=format&fit=crop",
          topRight: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=100&w=2832&fm=webp&auto=format&fit=crop",
          bottomLeft: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=100&w=2832&fm=webp&auto=format&fit=crop",
          bottomRight: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=100&w=2832&fm=webp&auto=format&fit=crop",
        }}
      />

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
                    Vous n&apos;êtes pas seul. <span className="font-bold text-[#17294b]">83% des propriétaires</span> ont déjà eu une expérience désagréable avec un artisan. Le résultat ? Du temps perdu, de l&apos;argent gaspillé, et un stress inutile.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    <span className="font-bold text-[#17294b]">Il existe une meilleure façon de réaliser vos projets.</span> C&apos;est exactement pour cela que WUGAMS existe.
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
            <div className="relative text-center">
              <div className="pointer-events-none absolute -right-10 -top-20 hidden h-48 w-72 overflow-hidden rounded-2xl opacity-10 lg:block">
                <Image
                  alt="Chantier WUGAMS"
                  className="size-full object-cover"
                  height={400}
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80"
                  width={600}
                />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Nos filiales</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Une équipe, cinq expertises.</h2>
              <GooeyText
                className="mx-auto mt-4 h-9 sm:h-11"
                textClassName="text-xl font-bold tracking-[-0.04em] text-[#426b95] sm:text-3xl"
                texts={["Construire.", "Rénover.", "Entretenir.", "Aménager.", "Entreprendre."]}
              />
              <p className="mt-4 mx-auto max-w-xl text-sm leading-7 text-slate-500">
                Chaque filiale WUGAMS est spécialisée. Une équipe engagée vous accompagne à chaque étape de votre projet.
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
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Voici les promesses que nous faisons à chacun de nos clients.</h2>
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
                      <TestimonialImage name={t.name} src={t.img} />
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
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Prendre rendez-vous avec WUGAMS.</h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                Une bonne réalisation commence toujours par une bonne compréhension du projet. Cette rencontre nous permet de comprendre vos besoins, de partager votre vision et de construire ensemble un projet adapté à vos attentes.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: "map" as const, text: "Physique : Bénin, Porto-Novo / Dowa Saint-Paul C/31" },
                  { icon: "message" as const, text: "En ligne : Google Meet, Skype, Teams, WhatsApp, Zoom, etc." },
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
                  Prenez rendez-vous ici
                </PulseButton>
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#7ea5ca] hover:bg-[#edf6fd] hover:text-[#17294b]" href="/connexion">
                  J&apos;ai déjà un compte
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-slate-400">Vous disposez déjà d&apos;un espace client ? Connectez-vous à votre espace pour suivre votre projet et accéder à vos services.</p>
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
                    { num: "1", title: "Vous nous écrivez", desc: "Un message ou un appel suffit pour nous confier votre besoin." },
                    { num: "2", title: "Nous nous rencontrons", desc: "30 minutes en visio ou en personne, le temps d'écouter et de comprendre votre projet." },
                    { num: "3", title: "Nous clarifions", desc: "Nous posons les questions que personne d'autre ne pose, pour cerner chaque détail de votre projet." },
                    { num: "4", title: "Nous vous proposons", desc: "Un devis détaillé et chiffré, sans surprise. La décision vous appartient." },
                    { num: "5", title: "Nous construisons", desc: "Nos équipes réalisent les travaux pendant que vous suivez l'avancement, jusqu'à la livraison." },
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
        <Reveal>
          <ContactForm />
        </Reveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="contact">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-[#17294b] px-7 py-12 text-white sm:px-12 lg:px-16">
            <ShaderBeams />
            <GradientMesh />
            <div className="relative z-10 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Prêt à commencer ?</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">Chaque projet commence par une première étape.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Nous sommes disponibles pour échanger sur votre projet. Prenons le temps de comprendre votre vision, vos attentes et les solutions qui pourront y répondre.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PulseButton href="/inscription">
                  Prenez un rendez-vous ici
                </PulseButton>
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.12]" href="/connexion">
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
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Site</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><Link className="transition hover:text-[#17294b]" href="/boutique">Boutique matériaux</Link></li>
                <li><Link className="transition hover:text-[#17294b]" href="/realisations">Nos réalisations</Link></li>
                <li><Link className="transition hover:text-[#17294b]" href="/blog">Blog &amp; conseils</Link></li>
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
