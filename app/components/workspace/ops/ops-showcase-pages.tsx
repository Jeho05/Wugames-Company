"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import { demoSecVitrinePages, vitrineSectionMeta, type VitrinePage } from "@/app/lib/ops-data";

type OpsShowcasePagesProps = {
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

const sectionOrder: VitrinePage["section"][] = ["principale", "support", "contenu"];

export function OpsShowcasePages({ onToast }: OpsShowcasePagesProps) {
  const [pages, setPages] = useState<VitrinePage[]>(demoSecVitrinePages);

  const publiees = useMemo(() => pages.filter((p) => p.statut === "PUBLIE").length, [pages]);
  const brouillons = useMemo(() => pages.filter((p) => p.statut === "BROUILLON").length, [pages]);
  const totalVisites = useMemo(() => pages.reduce((sum, p) => sum + p.visites, 0), [pages]);

  function basculerPage(id: string) {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const prochain = page.statut === "PUBLIE" ? "BROUILLON" : "PUBLIE";
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, statut: prochain, updated_at: new Date().toISOString() } : p)));
    onToast(
      prochain === "PUBLIE"
        ? `Page « ${page.titre} » publiée sur le site`
        : `Page « ${page.titre} » repassée en brouillon`,
      prochain === "PUBLIE" ? "success" : "info",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-400">
          <span className="font-extrabold tabular-nums text-emerald-300">{publiees}</span> publiée(s) ·{" "}
          <span className="font-extrabold tabular-nums text-amber-300">{brouillons}</span> brouillon(s) ·{" "}
          <span className="font-extrabold tabular-nums text-white">{totalVisites.toLocaleString("fr-FR")}</span> visites ce
          mois
        </p>
      </div>

      {sectionOrder.map((section) => {
        const meta = vitrineSectionMeta[section];
        const items = pages.filter((p) => p.section === section);
        if (items.length === 0) return null;
        return (
          <OpsPanel
            action={
              <span className={"rounded-full border border-white/[0.08] px-2.5 py-1 text-[9px] font-bold " + meta.tile}>
                {meta.label}
              </span>
            }
            icon="newspaper"
            key={section}
            title={`${meta.label} — ${items.length} page(s)`}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {items.map((page) => (
                <article
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-white/[0.12]"
                  key={page.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-extrabold text-white">{page.titre}</h3>
                      <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-500">{page.route}</p>
                    </div>
                    <span
                      className={
                        "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-extrabold " +
                        (page.statut === "PUBLIE"
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/25 bg-amber-400/10 text-amber-300")
                      }
                    >
                      {page.statut === "PUBLIE" ? "Publiée" : "Brouillon"}
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] tabular-nums text-slate-400">
                      <span className="font-extrabold text-slate-200">{page.visites.toLocaleString("fr-FR")}</span> visites
                      · MAJ {new Date(page.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        aria-label={`${page.statut === "PUBLIE" ? "Dépublier" : "Publier"} ${page.titre}`}
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition " +
                          (page.statut === "PUBLIE"
                            ? "border border-white/10 text-slate-300 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
                            : "bg-[#0f7a5f] text-white shadow-lg shadow-emerald-950/40 hover:bg-[#0e8a6c]")
                        }
                        onClick={() => basculerPage(page.id)}
                        type="button"
                      >
                        <Icon name={page.statut === "PUBLIE" ? "minus" : "check"} size={11} />
                        {page.statut === "PUBLIE" ? "Dépublier" : "Publier"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </OpsPanel>
        );
      })}
    </div>
  );
}
