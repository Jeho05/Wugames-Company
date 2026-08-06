"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchStock } from "@/app/lib/branch-data";

type BranchStockProps = {
  stock: BranchStock;
};

const prioriteMeta: Record<string, { label: string; badge: string }> = {
  urgente: { label: "Urgent", badge: "border-rose-200 bg-rose-50 text-rose-700" },
  haute: { label: "Haute", badge: "border-orange-200 bg-orange-50 text-orange-700" },
  moyenne: { label: "Moyenne", badge: "border-amber-200 bg-amber-50 text-amber-700" },
};

export function BranchStock({ stock }: BranchStockProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Quantité totale", value: stock.totalUnits.toLocaleString("fr-FR"), icon: "boxes" as const, tone: "text-[#0f2a52]" },
          { label: "Valeur estimée", value: stock.totalValue, icon: "chart" as const, tone: "text-[#0f2a52]" },
          { label: "Sous le seuil", value: String(stock.belowThreshold), icon: "warning" as const, tone: stock.belowThreshold > 0 ? "text-amber-600" : "text-emerald-600" },
          { label: "En rupture", value: String(stock.ruptures), icon: "package" as const, tone: stock.ruptures > 0 ? "text-rose-600" : "text-emerald-600" },
        ].map((card) => (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-white hover:shadow-md hover:shadow-slate-950/[0.05]" key={card.label}>
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Icon name={card.icon} size={16} />
              </span>
              <span className="text-[10px] font-bold text-slate-400">{card.label}</span>
            </div>
            <p className={"mt-3 text-xl font-extrabold tabular-nums tracking-tight " + card.tone}>{card.value}</p>
          </div>
        ))}
      </div>

      <ExecutivePanel
        action={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {stock.pendingReceptions} réception(s) à confirmer
          </span>
        }
        icon="refresh"
        subtitle="Nombre de mouvements · 6 derniers mois"
        title="Entrées et sorties"
      >
        <div className="h-[230px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={stock.flux} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="label" fontSize={10} fontWeight={600} tick={{ fill: "#94a3b8" }} tickLine={false} />
              <YAxis axisLine={false} fontSize={10} fontWeight={600} tick={{ fill: "#94a3b8" }} tickLine={false} width={28} />
              <Tooltip cursor={{ fill: "rgba(14,159,155,0.06)" }} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Bar dataKey="entrees" fill="#0e9f9b" name="Entrées" radius={[5, 5, 0, 0]} />
              <Bar dataKey="sortiesVente" fill="#38bdf8" name="Sorties vente" radius={[5, 5, 0, 0]} />
              <Bar dataKey="sortiesChantier" fill="#f59e0b" name="Sorties chantier" radius={[5, 5, 0, 0]} />
              <Bar dataKey="ajustements" fill="#94a3b8" name="Ajustements" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExecutivePanel>

      <ExecutivePanel
        action={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {stock.critical.length} produit(s)
          </span>
        }
        icon="warning"
        subtitle="Le motif du mouvement est obligatoire lors de l'enregistrement"
        title="Produits critiques"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <th className="pb-2.5 pr-3">Produit</th>
                <th className="pb-2.5 pr-3">Référence</th>
                <th className="pb-2.5 pr-3">Quantité</th>
                <th className="pb-2.5 pr-3">Seuil</th>
                <th className="pb-2.5 pr-3">Fournisseur</th>
                <th className="pb-2.5 pr-3">Dernière modif.</th>
                <th className="pb-2.5 pr-3">Priorité</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {stock.critical.map((product) => {
                const meta = prioriteMeta[product.priorite] ?? prioriteMeta.moyenne;
                return (
                  <tr className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70" key={product.id}>
                    <td className="py-3.5 pr-3">
                      <p className="text-[12px] font-bold text-[#16233a]">{product.nom}</p>
                      <p className="text-[10px] text-slate-400">{product.statut.replace(/_/g, " ").toLowerCase()}</p>
                    </td>
                    <td className="py-3.5 pr-3 font-mono text-[11px] font-bold text-slate-500">{product.reference}</td>
                    <td className="py-3.5 pr-3">
                      <span className={"text-[12px] font-extrabold tabular-nums " + (product.quantite <= 0 ? "text-rose-600" : "text-[#0f2a52]")}>
                        {product.quantite}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{product.seuil}</td>
                    <td className="py-3.5 pr-3 text-[11px] text-slate-500">{product.fournisseur ?? "—"}</td>
                    <td className="py-3.5 pr-3 text-[10px] text-slate-400">{product.derniereModification}</td>
                    <td className="py-3.5 pr-3">
                      <span className={"inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>{meta.label}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <a
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                        href={`/espace/stocks?id=${product.id}`}
                      >
                        <Icon name="arrow-up-right" size={11} />
                        Enregistrer un mouvement
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutivePanel>
    </div>
  );
}
