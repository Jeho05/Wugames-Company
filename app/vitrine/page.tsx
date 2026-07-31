"use client";

import { useEffect, useState } from "react";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { MobileNav } from "@/app/components/ui/mobile-nav";
import { Reveal } from "@/app/components/branding/reveal";
import { GradientMesh } from "@/app/components/branding/gradient-mesh";
import { ShaderBeams } from "@/app/components/branding/shader-beams";
import { CinematicHeroSection, AnimatedButton, AnimatedCard } from "@/app/components/animations";
import { useToday } from "@/app/hooks/use-today";

const vitrineNavLinks = [
  { label: "Le mantra", href: "#mantra" },
  { label: "Les principes", href: "#principes" },
  { label: "Le focus", href: "#focus" },
];

const MANTRAS = [
  { day: "Dimanche", text: "Je me ressource aujourd'hui pour revenir plus fort demain." },
  { day: "Lundi", text: "Je suis capable. Aujourd'hui, je le prouve." },
  { day: "Mardi", text: "Qui veut, trouve les solutions. Je passe à l'action." },
  { day: "Mercredi", text: "La motivation se travaille comme un muscle. Je m'entraîne." },
  { day: "Jeudi", text: "Une mission à la fois. Le reste attendra." },
  { day: "Vendredi", text: "J'ai dépassé mes limites cette semaine. Je termine fort." },
  { day: "Samedi", text: "Chaque action compte. Je construis, une étape à la fois." },
];

const principles = [
  {
    icon: "arrow-up-right" as const,
    num: "01",
    title: "L'action",
    quote: "Qui veut, trouve les solutions.",
    text: "Qui ne veut pas, trouve des excuses. Chaque demande est une occasion de prouver ce qu'on sait faire.",
  },
  {
    icon: "chart" as const,
    num: "02",
    title: "Le dépassement",
    quote: "On ne naît pas champion, on le devient.",
    text: "Chaque chantier est une répétition. À force de recommencer, on devient meilleur.",
  },
  {
    icon: "clock" as const,
    num: "03",
    title: "Le focus",
    quote: "Une chose à la fois, jusqu'au bout.",
    text: "La concentration, c'est refuser le bruit pour finir ce qui compte vraiment.",
  },
];

const focusRules = [
  { text: "Un objectif en tête : les travaux du jour.", detail: "Tout le reste attend son tour." },
  { text: "Le téléphone hors du champ de vision.", detail: "Les alertes peuvent attendre trente minutes." },
  { text: "Je termine ce que je commence.", detail: "Une mission finie vaut mieux que trois en cours." },
];

export default function VitrinePage() {
  const [overHero, setOverHero] = useState(true);
  const today = useToday();

  useEffect(() => {
    const onScroll = () => setOverHero(window.scrollY < window.innerHeight * 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const greeting = today?.greeting ?? "Bonjour";
  const dateLabel = today?.dateLabel ?? "L'équipe";
  const mantra = MANTRAS[today?.dayOfWeek ?? 1] ?? MANTRAS[1];

  return (
    <main className="overflow-x-clip bg-[#fbfcfe] text-[#17294b]">
      {/* Cinematic Welcome Hero */}
      <CinematicHeroSection
        scenes={[
          {
            image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=100&w=2832&fm=webp&auto=format&fit=crop",
            imageAlt: "Villa moderne livrée par WUGAMS au crépuscule",
            chapter: dateLabel,
            kicker: `${greeting}, l'équipe`,
            heading: "WUGAMS",
            variant: "display",
            text: "Une nouvelle journée pour construire. Concentrez-vous sur l'essentiel.",
            content: (
              <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-amber-200/80">
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Aujourd&apos;hui compte</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Chaque action compte</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Ensemble, on avance</span>
              </div>
            ),
          },
          {
            image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=100&w=2832&fm=webp&auto=format&fit=crop",
            imageAlt: "Chantier de construction WUGAMS en cours",
            chapter: "Prise d'action",
            kicker: "Moteur n°1 — L'action",
            heading: "Qui veut, trouve les solutions.",
            text: "Qui ne veut pas, trouve des excuses. Ce matin, choisissez vos solutions.",
          },
          {
            image: "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?q=100&w=2832&fm=webp&auto=format&fit=crop",
            imageAlt: "Équipes WUGAMS sur le terrain",
            chapter: "Le focus",
            kicker: "Moteur n°2 — La concentration",
            heading: "Un chantier à la fois.",
            text: "Le téléphone en poche. Une mission à la fois. Terminez ce que vous commencez.",
            content: (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <AnimatedButton
                  href="/connexion"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                >
                  Accéder à mon espace <Icon name="arrow-right" size={18} />
                </AnimatedButton>
                <AnimatedButton
                  href="#mantra"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Le mantra du jour <Icon name="sparkles" size={18} />
                </AnimatedButton>
              </div>
            ),
          },
        ]}
      />

      {/* Navigation Header - Adaptive over hero */}
      <header className={
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
        (overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-slate-200/80 bg-[#f7f9fc]/85 backdrop-blur-sm")
      }>
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark inverse={overHero} />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#mantra">Le mantra</a>
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#principes">Les principes</a>
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#focus">Le focus</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <AnimatedButton
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#243a61] sm:px-4 sm:text-sm"
            >
              Mon espace <Icon name="arrow-right" size={16} />
            </AnimatedButton>
            <MobileNav inverse={overHero} links={vitrineNavLinks} />
          </div>
        </div>
      </header>

      {/* Mantra du jour */}
      <section className="relative overflow-hidden bg-[#17294b] text-white" id="mantra">
        <ShaderBeams />
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Affirmation du jour</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  Le mantra du jour.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  La motivation se travaille comme un muscle. Chaque matin, un mantra. Répétez-le
                  à voix haute, trois fois, avant d&apos;ouvrir vos chantiers.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-sm sm:p-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                  Aujourd&apos;hui — {today?.dayName ?? ""}
                </p>
                <blockquote className="mt-6 text-2xl font-bold leading-snug tracking-[-0.03em] text-white sm:text-3xl">
                  « {mantra.text} »
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e3a641] text-[#14223b]">
                    <Icon name="sparkles" size={16} />
                  </span>
                  <p className="text-xs text-slate-300">Répétez-le 3 fois, à voix haute, debout.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Les 3 principes */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="principes">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Les 3 principes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
              Les règles qui nous font avancer.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Trois moteurs. Si vous n&apos;avez que dix secondes le matin, lisez-les.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {principles.map((principle, i) => (
            <Reveal delay={i * 120} key={principle.num}>
              <AnimatedCard className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#bdd0e2] hover:shadow-lg hover:shadow-slate-900/5">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
                    <Icon name={principle.icon} size={20} />
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">{principle.num}</span>
                </div>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#d19331]">{principle.title}</h3>
                <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.03em] text-[#17294b]">{principle.quote}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{principle.text}</p>
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Focus & concentration */}
      <section className="relative overflow-hidden bg-[#101c32] text-white" id="focus">
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Focus & concentration</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
                  Le bruit attire. Le chantier avance pour celui qui reste concentré.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  Trois règles du jour. Simples. Non négociables.
                </p>
                <div className="mt-8">
                  <AnimatedButton
                    href="/connexion"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                  >
                    Accéder à mon espace <Icon name="arrow-right" size={18} />
                  </AnimatedButton>
                </div>
              </div>
            </Reveal>
            <div className="space-y-4">
              {focusRules.map((rule, i) => (
                <Reveal delay={i * 120} key={i}>
                  <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <Icon name="check" size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{rule.text}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{rule.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandMark />
          <p>&copy; 2026 WUGAMS Holding Inc. &mdash; Une journée, un chantier, un focus.</p>
        </div>
      </footer>
    </main>
  );
}
