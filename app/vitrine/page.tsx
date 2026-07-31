"use client";

import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { MobileNav } from "@/app/components/ui/mobile-nav";
import { EnhancedHeroSection, AnimatedButton, AnimatedCard, StaggeredSection } from "@/app/components/animations";

const vitrineNavLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "Méthode", href: "#methode" },
  { label: "Contact", href: "#contact" },
];

const benefits = [
  {
    icon: "folder" as const,
    text: "Un flux clair, du devis à la facture et au retour client.",
    title: "Opérations maîtrisées",
  },
  {
    icon: "hardhat" as const,
    text: "Des équipes mieux coordonnées, même sur le terrain.",
    title: "Terrain connecté",
  },
  {
    icon: "boxes" as const,
    text: "Des seuils, dépôts et commandes visibles au bon moment.",
    title: "Stocks sous contrôle",
  },
];

const workflow = [
  ["01", "Demande client", "Une demande est centralisée avec son contexte et ses pièces jointes."],
  ["02", "Exécution terrain", "Les missions sont planifiées, acceptées et documentées par les équipes."],
  ["03", "Pilotage fiable", "Les statuts, alertes et données consolident les décisions du groupe."],
];

export default function VitrinePage() {
  return (
    <main className="overflow-hidden bg-[#fbfcfe] text-[#17294b]">
      {/* Enhanced Hero Section with Animations */}
      <EnhancedHeroSection
        title="WUGAMS"
        subtitle={{
          line1: "Pilotez vos filiales.",
          line2: "Gardez le terrain en vue.",
        }}
        eyebrow={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e7d3ae] bg-[#fff8eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5680a]">
            <Icon name="sparkles" size={14} />
            WUGAMS Holding Inc.
          </span>
        }
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <AnimatedButton
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
            >
              Accéder à l&apos;espace <Icon name="arrow-right" size={18} />
            </AnimatedButton>
            <AnimatedButton
              href="#solutions"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50"
              variant="secondary"
            >
              Découvrir les modules <Icon className="rotate-90" name="arrow-right" size={18} />
            </AnimatedButton>
          </div>
        }
        proof={
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-amber-200/70">
            <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Multi-filiales</span>
            <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Pilotage en temps réel</span>
            <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Accès par rôle</span>
          </div>
        }
        backgroundSrc="/placeholder-hero.jpg"
        enable3D={true}
        enableLottie={false}
      />

      {/* Navigation Header - Positioned over Hero */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f9fc]/80 backdrop-blur-sm border-b border-slate-200/80">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
            <a className="transition hover:text-[#17294b]" href="#solutions">Solutions</a>
            <a className="transition hover:text-[#17294b]" href="#methode">Méthode</a>
            <a className="transition hover:text-[#17294b]" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <AnimatedButton
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#243a61] sm:px-4 sm:text-sm"
            >
              Espace WUGAMS <Icon name="arrow-right" size={16} />
            </AnimatedButton>
            <MobileNav links={vitrineNavLinks} />
          </div>
        </div>
      </header>

      <StaggeredSection
        className="mx-auto grid max-w-[1240px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-24"
        id="solutions"
        stagger={120}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Un socle pour grandir</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-[-0.05em] text-[#17294b] sm:text-4xl">
            Tout ce qui fait avancer une filiale, enfin aligné.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
            Le front s&apos;organise autour des flux les plus importants : relation client, exécution de chantier, ressources, achats et pilotage.
          </p>
        </div>
        <div className="grid gap-3">
          {benefits.map((benefit, index) => (
            <AnimatedCard key={benefit.title}>
              <article className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#bdd0e2] hover:shadow-lg hover:shadow-slate-900/5">
                <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + (index === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                  <Icon name={benefit.icon} size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#24395d]">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{benefit.text}</p>
                </div>
                <Icon className="ml-auto mt-1 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#426b95]" name="arrow-up-right" size={17} />
              </article>
            </AnimatedCard>
          ))}
        </div>
      </StaggeredSection>

      <StaggeredSection
        className="border-y border-slate-200 bg-[#eef4fa]"
        id="methode"
        stagger={150}
      >
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Un cycle sans rupture</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
              Un parcours lisible pour les clients comme pour les équipes.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {workflow.map(([number, title, text]) => (
              <AnimatedCard key={number}>
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-4xl font-bold tracking-[-0.06em] text-[#d19331]">{number}</p>
                  <h3 className="mt-8 text-lg font-bold tracking-[-0.03em] text-[#24395d]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
                </article>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </StaggeredSection>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="contact">
        <div className="relative overflow-hidden rounded-[28px] bg-[#17294b] px-7 py-12 text-white sm:px-12 lg:px-16">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">WUGAMS Holding Inc.</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
              Prêt à mettre le groupe en mouvement ?
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Accédez à votre espace de travail pour piloter les opérations, vos équipes et les prochaines décisions importantes.
            </p>
            <AnimatedButton
              href="/connexion"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3 text-sm font-bold text-[#14223b] transition hover:bg-[#efb653]"
            >
              Ouvrir l&apos;espace WUGAMS <Icon name="arrow-right" size={17} />
            </AnimatedButton>
          </div>
          <span className="absolute -right-20 -top-24 size-80 rounded-full bg-[#e3a641]/20 blur-3xl" />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandMark />
          <p>&copy; 2026 WUGAMS Holding Inc. &mdash; Plateforme de gestion multi-filiales.</p>
        </div>
      </footer>
    </main>
  );
}
