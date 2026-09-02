"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { MobileNav } from "@/app/components/ui/mobile-nav";
import { Reveal } from "@/app/components/branding/reveal";
import { GradientMesh } from "@/app/components/branding/gradient-mesh";
import { ShaderBeams } from "@/app/components/branding/shader-beams";
import { CinematicHeroSection, AnimatedButton, AnimatedCard } from "@/app/components/animations";
import { useToday } from "@/app/hooks/use-today";

const vitrineNavLinks = [
  { label: "Le verset", href: "#verset" },
  { label: "Les principes", href: "#principes" },
  { label: "Foi & travail", href: "#foi" },
  { label: "Le focus", href: "#focus" },
];

const VERSES = [
  {
    day: "Dimanche",
    verse: "Il y a un temps pour tout, un temps pour toute chose sous les cieux.",
    ref: "Ecclésiaste 3:1",
    mantra: "Je me ressource aujourd'hui pour revenir plus fort demain.",
  },
  {
    day: "Lundi",
    verse: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.",
    ref: "Colossiens 3:23",
    mantra: "Je suis capable. Aujourd'hui, je le prouve — pour Sa gloire.",
  },
  {
    day: "Mardi",
    verse: "Tout ce que ta main trouve à faire, fais-le avec ta force.",
    ref: "Ecclésiaste 9:10",
    mantra: "Qui veut, trouve les solutions. Je passe à l'action.",
  },
  {
    day: "Mercredi",
    verse: "Ne nous lassons pas de faire le bien ; nous moissonnerons au temps convenable, si nous ne nous relâchons pas.",
    ref: "Galates 6:9",
    mantra: "La motivation se travaille comme un muscle. Je m'entraîne, sans me lasser.",
  },
  {
    day: "Jeudi",
    verse: "Une seule chose est nécessaire. Marie a choisi la bonne part.",
    ref: "Luc 10:42",
    mantra: "Une mission à la fois. Le reste attendra.",
  },
  {
    day: "Vendredi",
    verse: "J'ai combattu le bon combat, j'ai achevé la course, j'ai gardé la foi.",
    ref: "2 Timothée 4:7",
    mantra: "J'ai dépassé mes limites cette semaine. Je termine fort, dans la foi.",
  },
  {
    day: "Samedi",
    verse: "Que votre lumière luise devant les hommes, afin qu'ils voient vos bonnes œuvres.",
    ref: "Matthieu 5:16",
    mantra: "Chaque action compte. Je construis, une étape à la fois.",
  },
];

const principles = [
  {
    icon: "arrow-up-right" as const,
    num: "01",
    title: "La foi",
    verse: "Tout ce que vous faites, faites-le de bon cœur.",
    text: "Chaque chantier est d'abord un service rendu à Dieu avant d'être un service rendu au client. Quand la foi pilote les mains, la qualité n'est plus négociable.",
  },
  {
    icon: "chart" as const,
    num: "02",
    title: "Le dépassement",
    verse: "Ne nous lassons pas de faire le bien.",
    text: "On ne naît pas champion, on le devient. À force de recommencer, et par la grâce de Dieu, on devient meilleur.",
  },
  {
    icon: "clock" as const,
    num: "03",
    title: "Le focus",
    verse: "Une seule chose est nécessaire.",
    text: "La concentration, c'est refuser le bruit pour finir ce qui compte vraiment — jusqu'au bout, et bien fait.",
  },
];

const faithPillars = [
  {
    icon: "sparkles" as const,
    title: "Le travail est une prière",
    verse: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur.",
    ref: "Colossiens 3:23",
    text: "Avant d'être une tâche, chaque chantier est une offrande. Ce qui est fait pour Dieu ne se fait jamais à moitié.",
  },
  {
    icon: "shield" as const,
    title: "L'intégrité avant tout",
    verse: "La balance fausse est en horreur à l'Éternel, mais le juste poids lui est agréable.",
    ref: "Proverbes 11:1",
    text: "Un devis honnête, une parole tenue, un travail livré. Notre réputation est notre témoignage.",
  },
  {
    icon: "users" as const,
    title: "Servir, pas se servir",
    verse: "Le Fils de l'homme est venu, non pour être servi, mais pour servir.",
    ref: "Marc 10:45",
    text: "Chaque client est une personne que Dieu nous confie. On le sert comme on voudrait être servi.",
  },
  {
    icon: "eye" as const,
    title: "Bénir notre communauté",
    verse: "Que votre lumière brille devant les hommes, afin qu'ils voient vos bonnes œuvres.",
    ref: "Matthieu 5:16",
    text: "Construire de bonnes maisons, c'est aussi bâtir une ville où il fait bon vivre et croire.",
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
  const verse = VERSES[today?.dayOfWeek ?? 1] ?? VERSES[1];

  return (
    <main className="overflow-x-clip bg-[#fbfcfe] text-[#17294b]">
      {/* Cinematic Welcome Hero */}
      <CinematicHeroSection
        scenes={[
          {
            image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=75&w=1920&fm=webp&auto=format&fit=crop",
            imageAlt: "Villa moderne livrée par WUGAMS au crépuscule",
            chapter: dateLabel,
            kicker: `${greeting}, l'équipe`,
            heading: "WUGAMS",
            variant: "display",
            text: "Une nouvelle journée pour construire. Que votre travail soit une bénédiction, pour vous et pour ceux que vous servez.",
            content: (
              <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-amber-200/80">
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Aujourd&apos;hui compte</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Faites tout de bon cœur</span>
                <span className="inline-flex items-center gap-2"><Icon className="text-emerald-400" name="check" size={16} /> Ensemble, servons</span>
              </div>
            ),
          },
          {
            image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=75&w=1920&fm=webp&auto=format&fit=crop",
            imageAlt: "Chantier de construction WUGAMS en cours",
            chapter: "Prise d'action",
            kicker: "Moteur n°1 — La foi",
            heading: "Tout ce que vous faites, faites-le pour le Seigneur.",
            text: "Colossiens 3:23. Qui veut, trouve les solutions — et qui a la foi les sert jusqu'au bout.",
          },
          {
            image: "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?q=75&w=1920&fm=webp&auto=format&fit=crop",
            imageAlt: "Équipes WUGAMS sur le terrain",
            chapter: "Le focus",
            kicker: "Moteur n°2 — La concentration",
            heading: "Un chantier à la fois.",
            text: "Le téléphone en poche. Une mission à la fois. Terminez ce que vous commencez, comme pour Dieu.",
            content: (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <AnimatedButton
                  href="/connexion-travailleur"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                >
                  Connexion travailleur <Icon name="arrow-right" size={18} />
                </AnimatedButton>
                <AnimatedButton
                  href="#verset"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Le verset du jour <Icon name="sparkles" size={18} />
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
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#verset">Le verset</a>
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#principes">Les principes</a>
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#foi">Foi &amp; travail</a>
            <a className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="#focus">Le focus</a>
            <Link className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="/boutique">Boutique</Link>
            <Link className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="/realisations">Réalisations</Link>
            <Link className={"transition " + (overHero ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-[#17294b]")} href="/blog">Blog</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <AnimatedButton
              href="/connexion-travailleur"
              className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#243a61] sm:px-4 sm:text-sm"
            >
              Connexion travailleur <Icon name="arrow-right" size={16} />
            </AnimatedButton>
            <MobileNav inverse={overHero} links={vitrineNavLinks} />
          </div>
        </div>
      </header>

      {/* Verset du jour */}
      <section className="relative overflow-hidden bg-[#17294b] text-white" id="verset">
        <ShaderBeams />
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">La Parole avant le chantier</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  Le verset du jour.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  La foi se travaille comme un muscle. Chaque matin, un verset à méditer — puis une
                  promesse à mettre en œuvre. Lisez-le avant d&apos;ouvrir vos chantiers.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-sm sm:p-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                  Aujourd&apos;hui — {today?.dayName ?? ""}
                </p>
                <blockquote className="mt-6 text-2xl font-bold leading-snug tracking-[-0.03em] text-white sm:text-3xl">
                  « {verse.verse} »
                </blockquote>
                <p className="mt-3 text-sm font-semibold text-[#f2c56d]">{verse.ref}</p>
                <div className="mt-8 rounded-2xl border border-white/10 bg-[#e3a641] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14223b]">En pratique</p>
                  <p className="mt-1 text-base font-bold text-[#14223b]">{verse.mantra}</p>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e3a641] text-[#14223b]">
                    <Icon name="sparkles" size={16} />
                  </span>
                  <p className="text-xs text-slate-300">Priez-le ce matin, puis mettez-le en pratique, debout.</p>
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
              Trois moteurs fondés sur la Parole. Si vous n&apos;avez que dix secondes le matin, lisez-les.
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
                <p className="mt-2 text-lg font-bold leading-tight tracking-[-0.03em] text-[#17294b]">« {principle.verse} »</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{principle.text}</p>
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Foi & travail */}
      <section className="relative overflow-hidden bg-[#17294b] text-white" id="foi">
        <ShaderBeams />
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Foi &amp; travail</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                Nous travaillons d&apos;abord pour Dieu, ensuite pour nos clients.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Quatre convictions qui donnent du sens à chaque chantier. Notre foi n&apos;est pas un étage, c&apos;est la fondation.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faithPillars.map((pillar, i) => (
              <Reveal delay={i * 120} key={pillar.title}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm transition hover:border-[#f2c56d]/40">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#e3a641]/15 text-[#f2c56d]">
                    <Icon name={pillar.icon} size={20} />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm italic leading-6 text-amber-100/90">« {pillar.verse} »</p>
                  <p className="mt-1 text-xs font-semibold text-[#f2c56d]">{pillar.ref}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Focus & concentration */}
      <section className="relative overflow-hidden bg-[#101c32] text-white" id="focus">
        <GradientMesh />
        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Focus &amp; concentration</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
                  Le bruit attire. Le chantier avance pour celui qui reste concentré.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  Trois règles du jour. Simples. Non négociables.
                </p>
                <div className="mt-8">
                  <AnimatedButton
                    href="/connexion-travailleur"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                  >
                    Accéder à mon espace <Icon name="arrow-right" size={18} />
                  </AnimatedButton>
                </div>
                <div className="mt-8 ml-1 border-l-2 border-[#e3a641] pl-4">
                  <p className="text-sm italic leading-6 text-slate-300">
                    « Tout ce que ta main trouve à faire, fais-le avec ta force. »
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#f2c56d]">Ecclésiaste 9:10</p>
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
          <p>&copy; 2026 WUGAMS Holding Inc. &mdash; Une journée, un chantier, un focus. Que Dieu bénisse votre travail.</p>
        </div>
      </footer>
    </main>
  );
}