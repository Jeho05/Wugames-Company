"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { stockAlerts } from "@/app/lib/demo-data";
import type { ModuleStatus } from "@/app/lib/demo-data";

const supplierStock: {
  produit: string;
  depot: string;
  disponible: string;
  seuil: string;
  statut: ModuleStatus;
}[] = [
  { produit: "Peinture blanc mat 25L", depot: "Treichville", disponible: "12 unités", seuil: "15 unités", statut: { label: "À commander", tone: "warning" } },
  { produit: "Ciment 50 kg", depot: "Cocody", disponible: "04 unités", seuil: "20 unités", statut: { label: "Rupture proche", tone: "danger" } },
  { produit: "Câble électrique 2,5 mm", depot: "Treichville", disponible: "09 rouleaux", seuil: "12 rouleaux", statut: { label: "À commander", tone: "warning" } },
  { produit: "Carrelage grès 60×60", depot: "Marcory", disponible: "88 cartons", seuil: "30 cartons", statut: { label: "Disponible", tone: "success" } },
];

export function SupplierDashboardScreen() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
            Portail fournisseur · lecture seule
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">
            BatiPro CI
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Vos produits en dépôt WUGAMS, le stock restant en temps réel et les alertes de
            réapprovisionnement.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs font-bold text-sky-800 xl:self-auto">
          <Icon name="shield" size={15} />
          Accès limité à votre identifiant (BR-05)
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Produits référencés", value: "23" },
          { label: "Stock en dépôt", value: "1 146 unités" },
          { label: "Ventes du mois", value: "8,2 M FCFA" },
          { label: "Alertes de rupture", value: "03" },
        ].map((stat, index) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-[27px] font-bold tracking-[-0.045em] text-[#182842]">{stat.value}</p>
              <span className={"size-2.5 rounded-full " + (index === 2 ? "bg-[#e3a641]" : "bg-[#7ba3cc]")} />
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">
                Stock initial et restant en dépôt
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Vos produits · mise à jour en temps réel</p>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#426b95] hover:text-[#17294b]"
              type="button"
            >
              <Icon name="download" size={15} />
              Exporter en CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3.5 sm:px-6">Produit</th>
                  <th className="px-3 py-3.5">Dépôt</th>
                  <th className="px-3 py-3.5">Disponible</th>
                  <th className="px-3 py-3.5">Seuil minimum</th>
                  <th className="px-5 py-3.5 text-right sm:px-6">Statut</th>
                </tr>
              </thead>
              <tbody>
                {supplierStock.map((row) => (
                  <tr className="border-b border-slate-100 last:border-0" key={row.produit}>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 sm:px-6">{row.produit}</td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-600">{row.depot}</td>
                    <td className="px-3 py-4 text-xs font-semibold text-slate-700">{row.disponible}</td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-600">{row.seuil}</td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <StatusBadge tone={row.statut.tone}>{row.statut.label}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">
                  Alertes de rupture
                </p>
                <p className="mt-1 text-xs text-slate-500">Seuils minimums par dépôt</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Icon name="warning" size={18} />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {stockAlerts.map((alert) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  key={alert.title}
                >
                  <p className="min-w-0 truncate text-xs font-bold text-slate-700">{alert.title}</p>
                  <StatusBadge tone={alert.tone}>{alert.stock}</StatusBadge>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-[#17294b] p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold tracking-[-0.025em]">Commandes en cours</p>
                <p className="mt-1 text-xs text-slate-400">Vos bons de commande WUGAMS</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-[#f2c56d]">
                <Icon name="truck" size={18} />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { ref: "BC-2026-084", date: "Émise le 28 juil.", montant: "2 480 000 FCFA", statut: "Livraison prévue · 05 août" },
                { ref: "BC-2026-076", date: "Émise le 12 juil.", montant: "960 000 FCFA", statut: "Livrée · 18 juil." },
                { ref: "BC-2026-061", date: "Émise le 02 juin", montant: "1 320 000 FCFA", statut: "Livrée · 09 juin" },
              ].map((order) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5" key={order.ref}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#f2c56d]">{order.ref}</p>
                    <p className="text-xs font-semibold text-white">{order.montant}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{order.date}</p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-300">{order.statut}</p>
                </div>
              ))}
            </div>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#f2c56d] transition hover:text-white"
              href="/espace/messages"
            >
              Contacter WUGAMS <Icon name="arrow-right" size={15} />
            </Link>
          </article>
        </aside>
      </section>
    </div>
  );
}
