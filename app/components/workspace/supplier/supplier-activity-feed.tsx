"use client";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit } from "@/app/lib/contracts";
import type { SupplierMovementView } from "@/app/lib/supplier-data";
import { formatDateTime, formatQuantite, mouvementMeta, statutLabel } from "@/app/lib/supplier-data";

export type ActivityEvent = {
  id: string;
  icon: "arrow-up" | "arrow-down" | "hardhat" | "settings" | "warning";
  tone: string;
  title: string;
  detail: string;
  created_at: string;
};

type SupplierActivityFeedProps = {
  products: Produit[];
  movements: SupplierMovementView[];
  onOpenProduct: (productId: string) => void;
};

function buildEvents(products: Produit[], movements: SupplierMovementView[]): ActivityEvent[] {
  const events: ActivityEvent[] = movements.slice(0, 8).map((mouvement) => {
    const meta = mouvementMeta[mouvement.type];
    return {
      id: mouvement.id,
      icon: meta.icon,
      tone: meta.chip,
      title: `${mouvement.produitNom} — ${meta.label.toLowerCase()} enregistrée`,
      detail: `${meta.sign}${formatQuantite(mouvement.quantite)} · ${mouvement.filialeNom ?? "—"}`,
      created_at: mouvement.created_at,
    };
  });

  for (const product of products) {
    if (product.statut === "RUPTURE" || product.statut === "REAPPROVISIONNEMENT_REQUIS") {
      events.push({
        id: `etat-${product.id}`,
        icon: "warning",
        tone: product.statut === "RUPTURE"
          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
        title: `« ${product.nom} » est actuellement ${product.statut === "RUPTURE" ? "en rupture" : "en réapprovisionnement requis"}`,
        detail: `${statutLabel(product.statut)} · ${product.filiale?.nom ?? "—"}`,
        created_at: product.updated_at,
      });
    }
  }

  return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function SupplierActivityFeed({ products, movements, onOpenProduct }: SupplierActivityFeedProps) {
  const events = buildEvents(products, movements);

  return (
    <section aria-label="Activité récente" className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-950/[0.04] dark:border-slate-800 dark:bg-slate-900 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight text-[#17294b] dark:text-slate-100">Activité récente</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Derniers mouvements et états de vos produits</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-sky-400">
          <Icon name="activity" size={18} />
        </span>
      </div>

      {events.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-[12px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
          Aucune activité récente n&apos;est disponible pour vos produits.
        </p>
      ) : (
        <ol className="relative mt-5 space-y-5 pl-2">
          <span aria-hidden="true" className="absolute bottom-2 left-[22px] top-2 w-px bg-slate-100 dark:bg-slate-800" />
          {events.map((event) => (
            <li className="relative flex items-start gap-3.5" key={event.id}>
              <span className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl ring-4 ring-white dark:ring-slate-900 " + event.tone}>
                <Icon name={event.icon} size={15} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[12px] font-bold leading-5 text-[#17294b] dark:text-slate-100">{event.title}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{event.detail}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(event.created_at)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {movements.length > 0 ? (
        <button
          className="mt-5 w-full rounded-2xl border border-slate-200 py-3 text-[12px] font-extrabold text-[#1e40af] transition hover:bg-slate-50 dark:border-slate-700 dark:text-sky-400 dark:hover:bg-slate-800/60"
          onClick={() => onOpenProduct(movements[0].produitId)}
          type="button"
        >
          Voir le détail du dernier mouvement
        </button>
      ) : null}
    </section>
  );
}
