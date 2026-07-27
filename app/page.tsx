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
];

const steps = [
  ["01", "Décrivez votre projet", "Remplissez un formulaire simple avec vos besoins, photos et budget estimé."],
  ["02", "Recevez un devis", "Un expert WUGAMS étudie votre demande et vous envoie un devis détaillé sous 48h."],
  ["03", "Travaux & suivi", "Suivez l'avancement en temps réel, échangez avec votre équipe et validez chaque étape."],
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
  ["4", "Filiales spécialisées"],
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
            <a className="transition hover:text-[#17294b]" href="#comment">Comment ça marche</a>
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

        <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e7d3ae] bg-[#fff8eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5680a]">
              <Icon name="sparkles" size={14} />
              WUGAMS &mdash; Votre partenaire immobilier
            </span>
            <h1 className="mt-6 text-[42px] font-bold leading-[1.04] tracking-[-0.065em] text-[#17294b] sm:text-6xl">
              Votre maison mérite le meilleur.
            </h1>
            <p className="mt-6 mx-auto max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Rénovation, entretien, construction, mobilier &mdash; WUGAMS vous accompagne de la demande à la livraison avec des équipes qualifiées et un suivi en temps réel.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                href="/inscription"
              >
                Demander un devis gratuit <Icon name="arrow-right" size={18} />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50"
                href="#services"
              >
                Découvrir nos services <Icon className="rotate-90" name="arrow-right" size={18} />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Devis gratuit sous 48h</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Garantie décennale</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Suivi en temps réel</span>
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
            Des experts pour chaque besoin.
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-sm leading-7 text-slate-500">
            WUGAMS regroupe 4 filiales spécialisées pour couvrir l&apos;ensemble de vos projets immobiliers.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bdd0e2] hover:shadow-lg hover:shadow-slate-900/5" key={service.title}>
              <span className={"grid size-11 place-items-center rounded-2xl " + (index % 2 === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                <Icon name={service.icon} size={22} />
              </span>
              <h3 className="mt-5 text-base font-bold text-[#24395d]">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>
              <Link className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#426b95] transition hover:text-[#17294b]" href="/inscription">
                En savoir plus <Icon name="arrow-right" size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#eef4fa]" id="comment">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Comment ça marche</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
              De votre demande à la clé en main.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, text]) => (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={number}>
                <p className="text-4xl font-bold tracking-[-0.06em] text-[#d19331]">{number}</p>
                <h3 className="mt-6 text-lg font-bold tracking-[-0.03em] text-[#24395d]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
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
              Transformez votre espace de vie dès aujourd&apos;hui.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Créez votre espace client, décrivez votre projet et recevez un devis personnalisé. Simple, rapide, sans engagement.
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
                WUGAMS Holding Inc. &mdash; Votre partenaire de confiance pour tous vos projets immobiliers.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Services</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><a className="transition hover:text-[#17294b]" href="#services">Rénovation & Construction</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Nettoyage & Entretien</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Matériaux & Fournitures</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#services">Mobilier & Design</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Entreprise</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><Link className="transition hover:text-[#17294b]" href="/vitrine">Espace WUGAMS</Link></li>
                <li><a className="transition hover:text-[#17294b]" href="#temoignages">Témoignages</a></li>
                <li><a className="transition hover:text-[#17294b]" href="#contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Espace client</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li><Link className="transition hover:text-[#17294b]" href="/connexion">Se connecter</Link></li>
                <li><Link className="transition hover:text-[#17294b]" href="/inscription">Créer un compte</Link></li>
                <li><Link className="transition hover:text-[#17294b]" href="/vitrine">Vitrine interne</Link></li>
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
