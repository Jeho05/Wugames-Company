import Link from "next/link";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { MobileNav } from "@/app/components/ui/mobile-nav";

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
      <section className="relative border-b border-slate-200/80 bg-[#f7f9fc]">
        <header className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <BrandMark />
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
            <a className="transition hover:text-[#17294b]" href="#solutions">Solutions</a>
            <a className="transition hover:text-[#17294b]" href="#methode">Méthode</a>
            <a className="transition hover:text-[#17294b]" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#243a61] sm:px-4 sm:text-sm"
              href="/connexion"
            >
              Espace WUGAMS <Icon name="arrow-right" size={16} />
            </Link>
            <MobileNav links={vitrineNavLinks} />
          </div>
        </header>

        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_0.88fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e7d3ae] bg-[#fff8eb] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a5680a]">
              <Icon name="sparkles" size={14} />
              WUGAMS Holding Inc.
            </span>
            <h1 className="mt-6 max-w-2xl text-[42px] font-bold leading-[1.04] tracking-[-0.065em] text-[#17294b] sm:text-6xl">
              Pilotez vos filiales. Gardez le terrain en vue.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              WUGAMS connecte les opérations, les équipes, les stocks et la relation client pour faire grandir chaque activité avec méthode.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]"
                href="/connexion"
              >
                Accéder à l&apos;espace <Icon name="arrow-right" size={18} />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#324d70] shadow-sm transition hover:border-[#9fb6cf] hover:bg-sky-50"
                href="#solutions"
              >
                Découvrir les modules <Icon className="rotate-90" name="arrow-right" size={18} />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Multi-filiales</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Pilotage en temps réel</span>
              <span className="inline-flex items-center gap-2"><Icon className="text-emerald-600" name="check" size={16} /> Accès par rôle</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[550px]">
            <div className="absolute -inset-7 rounded-[44px] bg-[#dfeafa] blur-3xl" />
            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 sm:p-4">
              <div className="flex items-center justify-between rounded-xl bg-[#17294b] px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#e3a641] text-[11px] font-black text-[#17294b]">W</span>
                  <span className="text-xs font-bold">Pilotage WUGAMS</span>
                </div>
                <span className="size-2 rounded-full bg-[#8de1c5] ring-4 ring-[#8de1c5]/15" />
              </div>
              <div className="grid gap-3 pt-3 sm:grid-cols-[0.66fr_1fr]">
                <div className="rounded-xl bg-[#f5f7fb] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">Vue groupe</p>
                  <div className="mt-3 space-y-2">
                    {["Tableau de bord", "Chantiers", "Équipes", "Stocks", "Rapports"].map((item, index) => (
                      <div
                        className={
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-semibold " +
                          (index === 0 ? "bg-[#24395d] text-white" : "text-slate-500")
                        }
                        key={item}
                      >
                        <span className={"size-1.5 rounded-full " + (index === 0 ? "bg-[#e3a641]" : "bg-slate-300")} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Vue d&apos;ensemble</p>
                      <p className="mt-0.5 text-[8px] text-slate-400">Aujourd&apos;hui, 27 juillet</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">+12,8%</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ["41,8 M", "CA"],
                      ["18", "Chantiers"],
                      ["94%", "Présence"],
                    ].map(([value, label]) => (
                      <div className="rounded-lg bg-[#f5f7fb] p-2" key={label}>
                        <p className="text-[11px] font-bold tracking-[-0.04em] text-[#24395d]">{value}</p>
                        <p className="mt-1 text-[7px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex h-24 items-end gap-1.5">
                    {[33, 48, 42, 64, 54, 78, 68, 92].map((height, index) => (
                      <span
                        className={"flex-1 rounded-t-sm " + (index === 7 ? "bg-[#e3a641]" : "bg-[#c9d9ea]")}
                        key={index}
                        style={{ height: height + "%" }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-2">
                    <p className="text-[8px] font-bold text-amber-800">8 alertes stock à traiter</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-7 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:block">
              <p className="text-xl font-bold tracking-[-0.045em] text-[#17294b]">4,7 / 5</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Satisfaction client</p>
            </div>
          </div>
        </div>
        <span className="absolute -right-32 top-20 size-[480px] rounded-full bg-[#e3a641]/10 blur-3xl" />
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-24" id="solutions">
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
            <article className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bdd0e2] hover:shadow-lg hover:shadow-slate-900/5" key={benefit.title}>
              <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + (index === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                <Icon name={benefit.icon} size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#24395d]">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{benefit.text}</p>
              </div>
              <Icon className="ml-auto mt-1 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#426b95]" name="arrow-up-right" size={17} />
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#eef4fa]" id="methode">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">Un cycle sans rupture</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
              Un parcours lisible pour les clients comme pour les équipes.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {workflow.map(([number, title, text]) => (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={number}>
                <p className="text-4xl font-bold tracking-[-0.06em] text-[#d19331]">{number}</p>
                <h3 className="mt-8 text-lg font-bold tracking-[-0.03em] text-[#24395d]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-5 py-3 text-sm font-bold text-[#14223b] transition hover:bg-[#efb653]"
              href="/connexion"
            >
              Ouvrir l&apos;espace WUGAMS <Icon name="arrow-right" size={17} />
            </Link>
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
