import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";

const services = [
  {
    description: "Rénovation intérieure et extérieure, construction neuve, aménagement complet de vos espaces.",
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
    description: "Création, conception et restauration de mobilier sur mesure pour particuliers et professionnels.",
    icon: "hardhat" as const,
    title: "Mobilier & Design",
  },
  {
    description: "Accompagnement pour diriger, structurer et créer de nouvelles entreprises et filiales.",
    icon: "building" as const,
    title: "Filiales & Entrepreneuriat",
  },
];

const steps = [
  ["01", "Rencontrez WUGAMS", "Échangez avec notre équipe en physique ou en visio pour clarifier votre projet, vos besoins et votre budget."],
  ["02", "Devis détaillé", "Sur la base de la rencontre, nous établissons un devis précis et transparent, sans surprise."],
  ["03", "Travaux & suivi", "Suivez l&apos;avancement en temps réel, échangez avec votre équipe et validez chaque étape."],
  ["04", "Résultat garanti", "Réception des travaux, garantie décennale et service après-vente inclus."],
];

const testimonials = [
  {
    name: "Koffi Amara",
    role: "Propriétaire, Résidence Cocody",
    text: "WUGAMS a transformé notre résidence en 3 semaines. Le suivi en temps réel m'a rassuré tout au long du projet.",
  },
  {
    name: "Ahoua Brigitte",
    role: "Directrice, SCI Les Palmiers",
    text: "La qualité des équipes et la transparence du processus nous ont convaincus. Je recommande à 100%.",
  },
  {
    name: "Koné David",
    role: "Entrepreneur immobilier",
    text: "De la rénovation à la décoration, un seul interlocuteur. Le gain de temps est énorme.",
  },
];

const stats = [
  ["1 200+", "Projets réalisés"],
  ["4,7 / 5", "Satisfaction client"],
  ["5", "Filiales spécialisées"],
  ["48 h", "Délai de devis"],
];

export default function ClientBrandingPage() {
  return (
    <main className="overflow-hidden bg-[#fbfcfe] text-[#17294b]">
      <section className="relative border-b border-slate-200/80 bg-[#f7f9fc]">
        <header className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
            <a className="transition hover:text-[#17294b]" href="#services">Services</a>
            <a className="transition hover:text-[#17294b]" href="#rencontre">Rencontrez-nous</a>
            <a className="transition hover:text-[#17294b]" href="#temoignages">Avis clients</a>
            <a className="transition hover:text-[#17294b]" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50 sm:px-4 sm:text-sm"
              href="/connexion"
            >
              Se connecter
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-3.5 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] sm:px-4 sm:text-sm"
              href="/inscription"
            >
              Créer un espace <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e7d3ae] bg-[#fff8eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5680a]">
              <Icon name="sparkles" size={14} />
              WUGAMS Holding Inc.
            </span>
            <h1 className="mt-6 max-w-2xl text-[42px] font-bold leading-[1.04] tracking-[-0.065em] text-[#17294b] sm:text-6xl">
              Bâtir, rénover, entreprendre &mdash; avec la bonne équipe.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              WUGAMS est un groupe multi-filiales dédié à la rénovation, l&apos;entretien, la fourniture de matériaux, le mobilier et l&apos;entrepreneuriat. On commence par vous écouter, ensuite on construit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                href="#rencontre"
              >
                Planifier une rencontre <Icon name="arrow-right" size={18} />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50"
                href="#services"
              >
                Découvrir nos filiales <Icon className="rotate-90" name="arrow-right" size={18} />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Consultation gratuite</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Devis sans engagement</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Garantie décennale</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute -inset-7 rounded-[44px] bg-[#dfeafa] blur-3xl" />
            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/15 sm:p-6">
              <div className="flex items-center gap-3 rounded-xl bg-[#17294b] px-4 py-3 text-white">
                <span className="grid size-8 place-items-center rounded-lg bg-[#e3a641] text-[12px] font-black text-[#17294b]">W</span>
                <div>
                  <p className="text-xs font-bold">WUGAMS Holding Inc.</p>
                  <p className="text-[10px] text-slate-400">5 filiales &middot; Un seul interlocuteur</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: "folder" as const, label: "Rénovation & Construction", color: "bg-[#edf3f9] text-[#426b95]" },
                  { icon: "sparkles" as const, label: "Nettoyage & Entretien", color: "bg-amber-50 text-amber-600" },
                  { icon: "boxes" as const, label: "Matériaux & Fournitures", color: "bg-[#edf3f9] text-[#426b95]" },
                  { icon: "hardhat" as const, label: "Mobilier & Design", color: "bg-amber-50 text-amber-600" },
                  { icon: "building" as const, label: "Filiales & Entrepreneuriat", color: "bg-[#edf3f9] text-[#426b95]" },
                ].map((item) => (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3" key={item.label}>
                    <span className={"grid size-8 shrink-0 place-items-center rounded-lg " + item.color}>
                      <Icon name={item.icon} size={16} />
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] py-3 text-xs font-bold text-white transition hover:bg-[#243a61]"
                href="#rencontre"
              >
                Rencontrer WUGAMS <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
        <span className="absolute -right-32 top-20 size-[480px] rounded-full bg-[#e3a641]/10 blur-3xl" />
      </section>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-5 py-10 sm:px-8 md:grid-cols-4 md:py-12">
          {stats.map(([value, label]) => (
            <div className="text-center" key={label}>
              <p className="text-2xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="services">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Nos filiales</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
            Un groupe, cinq expertises.
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-sm leading-7 text-slate-500">
            Chaque filiale WUGAMS est spécialisée pour répondre à un besoin précis, avec des équipes dédiées.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, index) => (
            <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bdd0e2] hover:shadow-lg hover:shadow-slate-900/5" key={service.title}>
              <span className={"grid size-11 place-items-center rounded-2xl " + (index % 2 === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                <Icon name={service.icon} size={22} />
              </span>
              <h3 className="mt-5 text-base font-bold text-[#24395d]">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>
              <Link className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#426b95] transition hover:text-[#17294b]" href="#rencontre">
                En savoir plus <Icon name="arrow-right" size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#eef4fa]" id="rencontre">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Rencontrez WUGAMS</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
                Avant le devis, on clarifie le projet ensemble.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                Chaque projet est unique. Nous commençons par un échange &mdash; en physique ou en visio &mdash; pour comprendre vos besoins, votre contexte et vos attentes. C&apos;est seulement après cette rencontre que nous établissons un devis précis et transparent.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: "map" as const, text: "Rencontre physique sur site ou au bureau WUGAMS" },
                  { icon: "message" as const, text: "Visioconférence pour les clients à distance" },
                  { icon: "check" as const, text: "Compréhension mutuelle avant tout engagement" },
                ].map((item) => (
                  <div className="flex items-start gap-3" key={item.text}>
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <p className="text-sm font-medium text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                  href="/inscription"
                >
                  Prendre rendez-vous <Icon name="arrow-right" size={18} />
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50"
                  href="/connexion"
                >
                  Créer votre espace client
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-[#dfeafa] blur-3xl" />
              <div className="relative rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
                <div className="rounded-xl bg-[#17294b] px-5 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f2c56d]">Comment ça se passe ?</p>
                  <h3 className="mt-2 text-lg font-bold">Le parcours WUGAMS</h3>
                </div>
                <div className="mt-5 space-y-5">
                  {[
                    { num: "1", title: "Prise de contact", desc: "Vous nous écrivez ou appelez. On vous écoute." },
                    { num: "2", title: "Rencontre", desc: "On se voit pour comprendre le projet en détail." },
                    { num: "3", title: "Proposition", desc: "On vous fait un devis clair, chiffré, sans surprise." },
                    { num: "4", title: "Exécution", desc: "Nos équipes travaillent. Vous suivez en temps réel." },
                    { num: "5", title: "Livraison", desc: "Réception, garantie, et suivi après-vente." },
                  ].map((step, index) => (
                    <div className="flex gap-4" key={step.num}>
                      <div className="flex flex-col items-center">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e3a641] text-xs font-bold text-[#14223b]">
                          {step.num}
                        </span>
                        {index !== 4 ? <span className="mt-1 h-full w-px bg-slate-200" /> : null}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-bold text-[#17294b]">{step.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="temoignages">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Ils nous font confiance</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
            Ce que disent nos clients.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={testimonial.name}>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg className="size-4 fill-current" key={star} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                  {testimonial.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-700">{testimonial.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24" id="contact">
        <div className="relative overflow-hidden rounded-[28px] bg-[#17294b] px-7 py-12 text-white sm:px-12 lg:px-16">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">Prêt à commencer ?</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
              Parlons de votre projet dès aujourd&apos;hui.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Créez votre espace client, prenez rendez-vous et échangez avec notre équipe. On clarifie tout avant de commencer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3 text-sm font-bold text-[#14223b] transition hover:bg-[#efb653]"
                href="/inscription"
              >
                Créer mon espace <Icon name="arrow-right" size={17} />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]"
                href="/connexion"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
          <span className="absolute -right-20 -top-24 size-80 rounded-full bg-[#e3a641]/20 blur-3xl" />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <BrandMark />
              <p className="mt-3 max-w-xs text-xs leading-5 text-slate-400">
                WUGAMS Holding Inc. &mdash; Votre partenaire de confiance pour tous vos projets immobiliers et entrepreneuriaux.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Filiales</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><a className="transition hover:text-[#17294b]" href="#services">Rénovation & Construction</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Nettoyage & Entretien</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Matériaux & Fournitures</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Mobilier & Design</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Filiales & Entrepreneuriat</a></li>
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
