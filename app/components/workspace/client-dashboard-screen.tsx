import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";

type ClientDashboardScreenProps = {
  user: WorkspaceUser;
};

const projectSteps = [
  { label: "Devis accepté", state: "done" },
  { label: "Travaux en cours", state: "current" },
  { label: "Réception & facture", state: "next" },
];

const clientDocuments = [
  { date: "24 juillet", name: "Compte-rendu de visite", type: "Rapport" },
  { date: "18 juillet", name: "Devis signé DEV-2026-085", type: "Devis" },
  { date: "12 juillet", name: "Planning prévisionnel", type: "Planning" },
];

export function ClientDashboardScreen({ user }: ClientDashboardScreenProps) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] bg-[#17294b] px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f2c56d]">
              Votre espace WUGAMS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.055em] sm:text-[38px]">
              Bonjour, {firstName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Retrouvez l&apos;avancement de vos projets, vos documents et vos échanges avec votre équipe WUGAMS.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-3 text-sm font-bold text-[#17294b] transition hover:bg-[#efb653]"
              href="/espace/demandes"
            >
              <Icon name="plus" size={17} />
              Demander un devis
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]"
              href="/espace/messages"
            >
              Contacter WUGAMS
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
        </div>
        <span className="absolute" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Projet en cours", "01", "Rénovation résidence"],
          ["Prochaine visite", "29 juil.", "09:30 · Cocody"],
          ["Documents disponibles", "06", "Devis, rapports et photos"],
        ].map(([label, value, detail], index) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <span className={"grid size-9 place-items-center rounded-xl " + (index === 1 ? "bg-amber-50 text-amber-600" : "bg-[#edf3f9] text-[#426b95]")}>
                <Icon name={index === 0 ? "folder" : index === 1 ? "calendar" : "file-text"} size={18} />
              </span>
            </div>
            <p className="mt-5 text-[27px] font-bold tracking-[-0.05em] text-[#17294b]">{value}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Votre projet en cours</p>
                <p className="mt-1 text-xs text-slate-500">Rénovation intérieure · Résidence Traoré</p>
              </div>
              <StatusBadge tone="info">Travaux en cours</StatusBadge>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Avancement global</p>
                <p className="mt-1 text-3xl font-bold tracking-[-0.055em] text-[#17294b]">68%</p>
              </div>
              <p className="text-xs font-medium text-slate-500">Mise à jour il y a 2 h</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[68%] rounded-full bg-[#e3a641]" />
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {projectSteps.map((step, index) => (
                <div className="relative" key={step.label}>
                  {index !== projectSteps.length - 1 ? <span className="absolute left-5 right-[-20px] top-5 hidden h-px bg-slate-200 sm:block" /> : null}
                  <span
                    className={
                      "relative z-10 grid size-10 place-items-center rounded-full text-xs font-bold " +
                      (step.state === "done"
                        ? "bg-emerald-100 text-emerald-700"
                        : step.state === "current"
                          ? "bg-[#17294b] text-white"
                          : "bg-slate-100 text-slate-400")
                    }
                  >
                    {step.state === "done" ? <Icon name="check" size={17} /> : index + 1}
                  </span>
                  <p className="mt-3 text-xs font-bold text-slate-700">{step.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    {step.state === "done" ? "Validé le 18 juillet" : step.state === "current" ? "Intervention en cours" : "À venir"}
                  </p>
                </div>
              ))}
            </div>
            <Link className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#426b95] hover:text-[#17294b]" href="/espace/projets">
              Voir le détail du projet <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Prochain rendez-vous</p>
              <p className="mt-1 text-xs text-slate-500">Visite de suivi sur site</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Icon name="calendar" size={18} />
            </span>
          </div>
          <div className="mt-5 rounded-xl bg-[#f5f7fb] p-4">
            <p className="text-2xl font-bold tracking-[-0.05em] text-[#17294b]">Mardi 29</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Juillet 2026 · 09:30</p>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs font-medium text-slate-600">
              <Icon className="text-[#426b95]" name="map" size={16} />
              Résidence Traoré, Cocody
            </div>
          </div>
          <Link className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-[#426b95] transition hover:border-[#9fb6cf] hover:bg-sky-50" href="/espace/messages">
            Poser une question <Icon name="arrow-right" size={15} />
          </Link>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Vos derniers documents</p>
              <p className="mt-0.5 text-xs text-slate-500">Tout ce qui est utile à votre projet</p>
            </div>
            <Link className="text-xs font-bold text-[#426b95] hover:text-[#17294b]" href="/espace/documents">
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {clientDocuments.map((document) => (
              <div className="flex items-center gap-3 px-5 py-4 sm:px-6" key={document.name}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
                  <Icon name="file-text" size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-700">{document.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{document.type} · {document.date}</p>
                </div>
                <Icon className="text-slate-300" name="arrow-up-right" size={17} />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Besoin d&apos;aide ?</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Votre interlocuteur WUGAMS est disponible pour toute question sur votre projet.
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f5f7fb] p-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#dce7f5] text-xs font-bold text-[#244269]">SG</span>
            <div>
              <p className="text-xs font-bold text-slate-700">Sarah Gnahoua</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Manager clientèle</p>
            </div>
          </div>
          <Link className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]" href="/espace/messages">
            Envoyer un message <Icon name="message" size={15} />
          </Link>
        </article>
      </section>
    </div>
  );
}
