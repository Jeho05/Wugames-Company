import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as facturesApi from "@/app/lib/api/factures";
import type { FactureStatut } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CashflowPoint = { label: string; valeur: number; foret?: boolean };

export type AccountantKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
  estimated?: boolean;
};

export type AccountantHealth = "excellente" | "surveillance" | "critique";

export type InvoiceRow = {
  id: string;
  numero: string;
  client: string;
  montant: number;
  dateEmission: string;
  echeance: string | null;
  statut: FactureStatut;
  filiale: string | null;
};

export type PaymentEvent = {
  id: string;
  kind: "recu" | "attente" | "refuse" | "remboursement";
  title: string;
  detail: string;
  time: string;
};

export type AlertItem = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
};

export type BreakdownPart = { name: string; value: number; color: string };

export type ReportItem = {
  id: string;
  name: string;
  format: "PDF" | "XLSX" | "CSV";
  date: string;
  size: string;
};

export type AccountantActivityItem = {
  id: string;
  kind: "facture" | "paiement" | "annulation" | "rapport" | "modification";
  title: string;
  detail: string;
  time: string;
};

export type AccountantOverview = {
  source: "api" | "demo";
  updatedAt: number;
  health: AccountantHealth;
  kpis: AccountantKpi[];
  cashflow: {
    daily: CashflowPoint[];
    monthly: CashflowPoint[];
    forecast: CashflowPoint[];
  };
  invoices: InvoiceRow[];
  payments: PaymentEvent[];
  statutsBreakdown: BreakdownPart[];
  filialesBreakdown: BreakdownPart[];
  recettesDepenses: { label: string; value: number; color: string }[];
  alerts: AlertItem[];
  reports: ReportItem[];
  activity: AccountantActivityItem[];
};

/* ------------------------------------------------------------------ */
/* Données de repli (démo — uniquement si l'API est indisponible)      */
/* ------------------------------------------------------------------ */

const demoKpis: AccountantKpi[] = [
  { key: "ca", label: "Chiffre d'affaires", value: "486,4 M FCFA", change: "+8,2 %", trend: "up", icon: "chart", spark: [182, 195, 205, 215, 232, 248, 261, 278, 292, 315, 348, 372], caption: "cumul 2026 · 412 factures" },
  { key: "recettes", label: "Recettes du mois", value: "42,8 M FCFA", change: "+12,4 %", trend: "up", icon: "arrow-up", spark: [28, 31, 29, 34, 33, 36, 35, 38, 37, 40, 41, 43], caption: "encaissées · 18 paiements" },
  { key: "depenses", label: "Dépenses du mois", value: "27,3 M FCFA", change: "+2,4 %", trend: "up", icon: "arrow-down", spark: [22, 24, 23, 25, 26, 25, 27, 26, 28, 27, 29, 27], caption: "charges courantes estimées", estimated: true },
  { key: "benefice", label: "Bénéfice net", value: "15,5 M FCFA", change: "+18,7 %", trend: "up", icon: "sparkles", spark: [6, 7, 6, 9, 7, 11, 9, 12, 10, 13, 12, 16], caption: "marge nette estimée 36,2 %", estimated: true },
  { key: "impayees", label: "Factures impayées", value: "9", change: "−2 vs mois dernier", trend: "down", icon: "warning", spark: [14, 13, 12, 14, 11, 12, 10, 11, 9, 10, 11, 9], caption: "total 58,3 M FCFA en retard" },
  { key: "paiements", label: "Paiements reçus", value: "41,2 M FCFA", change: "+9,1 %", trend: "up", icon: "check", spark: [24, 26, 25, 29, 28, 31, 30, 33, 32, 36, 38, 41], caption: "18 paiements ce mois" },
  { key: "creances", label: "Créances", value: "58,3 M FCFA", change: "+6,2 %", trend: "up", icon: "clock", spark: [34, 36, 38, 41, 40, 43, 45, 48, 47, 51, 55, 58], caption: "factures à encaisser" },
  { key: "tresorerie", label: "Trésorerie disponible", value: "124,8 M FCFA", change: "+9,1 %", trend: "up", icon: "building", spark: [86, 90, 92, 97, 101, 104, 108, 111, 114, 118, 121, 125], caption: "soldes bancaires estimés", estimated: true },
];

const demoCashflow = {
  daily: Array.from({ length: 30 }, (_, index) => ({
    label: `${new Date(2026, 6, 30 - (29 - index)).getDate()}/${new Date(2026, 6, 30 - (29 - index)).getMonth() + 1}`,
    valeur: Math.round((0.9 + ((index * 37) % 13) / 9) * 100) / 100,
  })),
  monthly: [
    { label: "Août", valeur: 31.2 }, { label: "Sept.", valeur: 33.8 }, { label: "Oct.", valeur: 34.1 },
    { label: "Nov.", valeur: 36.4 }, { label: "Déc.", valeur: 38.9 }, { label: "Janv.", valeur: 37.5 },
    { label: "Févr.", valeur: 41.2 }, { label: "Mars", valeur: 39.8 }, { label: "Avr.", valeur: 43.6 },
    { label: "Mai", valeur: 42.9 }, { label: "Juin", valeur: 45.3 }, { label: "Juil.", valeur: 48.1 },
  ],
  forecast: [
    { label: "J+1", valeur: 1.62, foret: true }, { label: "J+2", valeur: 1.71, foret: true },
    { label: "J+3", valeur: 1.58, foret: true }, { label: "J+4", valeur: 1.74, foret: true },
    { label: "J+5", valeur: 1.66, foret: true }, { label: "J+6", valeur: 1.8, foret: true },
    { label: "J+7", valeur: 1.77, foret: true },
  ],
};

const demoInvoices: InvoiceRow[] = [
  { id: "f1", numero: "FAC-2026-0412", client: "SCI Les Palmiers", montant: 38400000, dateEmission: "2026-08-03", echeance: "2026-09-02", statut: "EMISE", filiale: "Wugames Abidjan" },
  { id: "f2", numero: "FAC-2026-0411", client: "Bureaux N'Dri", montant: 21800000, dateEmission: "2026-08-01", echeance: "2026-08-31", statut: "EN_RETARD", filiale: "Wugames Abidjan" },
  { id: "f3", numero: "FAC-2026-0410", client: "Résidence Koffi", montant: 5475000, dateEmission: "2026-07-28", echeance: "2026-08-27", statut: "PAYEE", filiale: "Wugames Cotonou" },
  { id: "f4", numero: "FAC-2026-0409", client: "Hôtel Le Baobab", montant: 12600000, dateEmission: "2026-07-24", echeance: "2026-08-23", statut: "PAYEE", filiale: "Wugames Dakar" },
  { id: "f5", numero: "FAC-2026-0408", client: "Villa Amara", montant: 8940000, dateEmission: "2026-07-21", echeance: "2026-08-20", statut: "EMISE", filiale: "Wugames Cotonou" },
  { id: "f6", numero: "FAC-2026-0407", client: "Immeuble Soro", montant: 15200000, dateEmission: "2026-07-15", echeance: "2026-08-14", statut: "EN_RETARD", filiale: "Wugames Abidjan" },
  { id: "f7", numero: "FAC-2026-0406", client: "Clinique Horizon", montant: 6730000, dateEmission: "2026-07-10", echeance: "2026-08-09", statut: "ANNULEE", filiale: "Wugames Dakar" },
  { id: "f8", numero: "FAC-2026-0405", client: "Marché Grand Bassam", montant: 41500000, dateEmission: "2026-07-05", echeance: "2026-08-04", statut: "BROUILLON", filiale: "Wugames Abidjan" },
];

const demoPayments: PaymentEvent[] = [
  { id: "p1", kind: "recu", title: "Paiement reçu", detail: "Résidence Koffi · FAC-2026-0410 · 5 475 000 FCFA", time: "Aujourd'hui, 09:42" },
  { id: "p2", kind: "recu", title: "Paiement reçu", detail: "Hôtel Le Baobab · FAC-2026-0409 · 12 600 000 FCFA", time: "Hier, 16:18" },
  { id: "p3", kind: "attente", title: "Paiement en attente", detail: "Villa Amara · FAC-2026-0408 · en cours de vérification", time: "Hier, 11:05" },
  { id: "p4", kind: "refuse", title: "Paiement refusé", detail: "Immeuble Soro · FAC-2026-0407 · fonds insuffisants", time: "Il y a 2 jours" },
  { id: "p5", kind: "recu", title: "Paiement reçu", detail: "SCI Les Palmiers · FAC-2026-0398 · 38 400 000 FCFA", time: "Il y a 3 jours" },
  { id: "p6", kind: "remboursement", title: "Remboursement effectué", detail: "Clinique Horizon · avoir AV-2026-007 · 1 200 000 FCFA", time: "Il y a 5 jours" },
];

const demoAlerts: AlertItem[] = [
  { id: "al1", severity: "critical", title: "Facture en retard", detail: "FAC-2026-0411 · Bureaux N'Dri · 21 800 000 FCFA · échéance dépassée de 5 jours" },
  { id: "al2", severity: "critical", title: "Paiement refusé", detail: "FAC-2026-0407 · Immeuble Soro · relance bancaire nécessaire" },
  { id: "al3", severity: "warning", title: "Échéance proche", detail: "FAC-2026-0412 · SCI Les Palmiers · 38 400 000 FCFA · due dans 6 jours" },
  { id: "al4", severity: "warning", title: "Créances élevées", detail: "9 factures impayées · 58,3 M FCFA · 12 % du CA" },
  { id: "al5", severity: "info", title: "Trésorerie sous surveillance", detail: "Seuil de confort à 100 M FCFA · actuellement 124,8 M FCFA" },
];

const demoReports: ReportItem[] = [
  { id: "r1", name: "Rapport de clôture — juillet 2026", format: "PDF", date: "31 juil. 2026", size: "1,2 Mo" },
  { id: "r2", name: "Bilan mensuel consolidé", format: "PDF", date: "31 juil. 2026", size: "864 Ko" },
  { id: "r3", name: "Suivi des créances — T2 2026", format: "XLSX", date: "28 juil. 2026", size: "412 Ko" },
  { id: "r4", name: "Export factures (juillet)", format: "CSV", date: "25 juil. 2026", size: "96 Ko" },
];

const demoActivity: AccountantActivityItem[] = [
  { id: "ac1", kind: "facture", title: "Facture créée", detail: "FAC-2026-0412 · SCI Les Palmiers · 38 400 000 FCFA", time: "Il y a 2 h" },
  { id: "ac2", kind: "paiement", title: "Paiement reçu", detail: "FAC-2026-0410 · Résidence Koffi · 5 475 000 FCFA", time: "Il y a 4 h" },
  { id: "ac3", kind: "modification", title: "Modification financière", detail: "FAC-2026-0408 · échéance reportée au 20 août", time: "Hier" },
  { id: "ac4", kind: "annulation", title: "Facture annulée", detail: "FAC-2026-0406 · Clinique Horizon", time: "Hier" },
  { id: "ac5", kind: "rapport", title: "Rapport généré", detail: "Rapport de clôture — juillet 2026", time: "Il y a 2 jours" },
  { id: "ac6", kind: "paiement", title: "Paiement reçu", detail: "FAC-2026-0398 · SCI Les Palmiers · 38 400 000 FCFA", time: "Il y a 3 jours" },
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

export const formatFcfa = (value: number): string =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";

export const formatFcfaCompact = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M FCFA`;
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k FCFA`;
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
};

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

const toNumber = (value: string | number): number => Number(value);

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastMonthKeys(count: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKeyOf(d), label: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d) });
  }
  return out;
}

function lastDays(count: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push({ key: dayKeyOf(d), label: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  return out;
}

function bucketByMonth(items: { date: string | null | undefined; value: number }[], keys: string[]): number[] {
  const buckets = new Array(keys.length).fill(0) as number[];
  for (const item of items) {
    if (!item.date) continue;
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = keys.indexOf(monthKeyOf(parsed));
    if (index !== -1) buckets[index] += item.value;
  }
  return buckets;
}

function bucketByDay(items: { date: string | null | undefined; value: number }[], keys: string[]): number[] {
  const buckets = new Array(keys.length).fill(0) as number[];
  for (const item of items) {
    if (!item.date) continue;
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = keys.indexOf(dayKeyOf(parsed));
    if (index !== -1) buckets[index] += item.value;
  }
  return buckets;
}

function momPercent(current: number, previous: number): string | null {
  if (previous <= 0) return null;
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")} %`;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}

const statutColor: Record<FactureStatut, string> = {
  BROUILLON: "#64748b",
  EMISE: "#38bdf8",
  PAYEE: "#34d399",
  EN_RETARD: "#fb7185",
  ANNULEE: "#94a3b8",
};

const statutLabels: Record<FactureStatut, string> = {
  BROUILLON: "Brouillon",
  EMISE: "Émise",
  PAYEE: "Payée",
  EN_RETARD: "En retard",
  ANNULEE: "Annulée",
};

function daysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.ceil((parsed.getTime() - Date.now()) / 86_400_000);
}

function computeHealth(creances: number, ca: number): AccountantHealth {
  if (ca <= 0 && creances <= 0) return "excellente";
  const ratio = ca > 0 ? (creances / ca) * 100 : 100;
  if (ratio < 15) return "excellente";
  if (ratio < 30) return "surveillance";
  return "critique";
}

function buildForecast(dailyValues: number[]): CashflowPoint[] {
  const recent = dailyValues.slice(-7);
  if (recent.length === 0) return [];
  const mean = recent.reduce((sum, value) => sum + value, 0) / recent.length;
  const drift = recent.length >= 2 ? (recent[recent.length - 1] - recent[0]) / (recent.length - 1) : 0;
  return Array.from({ length: 7 }, (_, index) => {
    const valeur = Math.max(0.2, mean + drift * (index + 1) + ((index * 17) % 5) / 10);
    return { label: `J+${index + 1}`, valeur: Math.round(valeur * 100) / 100, foret: true };
  });
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadAccountantOverview(): Promise<AccountantOverview> {
  const now = Date.now();
  const [facturesResult, consolidationResult, auditResult] = await Promise.allSettled([
    facturesApi.listFactures(),
    facturesApi.getFacturesConsolidation(),
    auditApi.listAuditLogs(),
  ]);

  const factures = facturesResult.status === "fulfilled" ? facturesResult.value : [];
  const audits = auditResult.status === "fulfilled" ? auditResult.value : [];
  const consolidation =
    consolidationResult.status === "fulfilled" ? consolidationResult.value : null;

  if (factures.length === 0) {
    return {
      source: "demo",
      updatedAt: now,
      health: "excellente",
      kpis: demoKpis,
      cashflow: demoCashflow,
      invoices: demoInvoices,
      payments: demoPayments,
      statutsBreakdown: [
        { name: "Payées", value: 214, color: "#34d399" },
        { name: "Émises", value: 96, color: "#38bdf8" },
        { name: "En retard", value: 41, color: "#fb7185" },
        { name: "Brouillons", value: 38, color: "#64748b" },
        { name: "Annulées", value: 23, color: "#94a3b8" },
      ],
      filialesBreakdown: [
        { name: "Wugames Abidjan", value: 41, color: "#e3a641" },
        { name: "Wugames Cotonou", value: 29, color: "#38bdf8" },
        { name: "Wugames Dakar", value: 18, color: "#34d399" },
        { name: "Wugames Lomé", value: 12, color: "#a78bfa" },
      ],
      recettesDepenses: [
        { label: "Recettes", value: 42.8, color: "#34d399" },
        { label: "Dépenses", value: 27.3, color: "#fb7185" },
        { label: "Bénéfice", value: 15.5, color: "#e3a641" },
      ],
      alerts: demoAlerts,
      reports: demoReports,
      activity: demoActivity,
    };
  }

  /* --- Agrégats réels ---------------------------------------------- */
  const actives = factures.filter((facture) => facture.statut !== "ANNULEE" && facture.statut !== "BROUILLON");
  const caTotal = actives.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0);
  const encaisse = factures.filter((facture) => facture.statut === "PAYEE");
  const encaisseTotal = encaisse.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0);
  const enRetard = factures.filter((facture) => facture.statut === "EN_RETARD");
  const enAttente = factures.filter((facture) => facture.statut === "EMISE");
  const creancesTotal = [...enRetard, ...enAttente].reduce(
    (sum, facture) => sum + toNumber(facture.montant_ttc),
    0,
  );

  const nowDate = new Date();
  const thisMonthKey = monthKeyOf(nowDate);
  const prevMonthDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1);
  const prevMonthKey = monthKeyOf(prevMonthDate);

  const recettesThisMonth = encaisse.filter(
    (facture) => monthKeyOf(new Date(facture.date_emission ?? facture.created_at)) === thisMonthKey,
  );
  const recettesPrevMonth = encaisse.filter(
    (facture) => monthKeyOf(new Date(facture.date_emission ?? facture.created_at)) === prevMonthKey,
  );
  const recettesThis = recettesThisMonth.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0);
  const recettesPrev = recettesPrevMonth.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0);

  const impayeesPrev = factures.filter((facture) => {
    const created = new Date(facture.created_at);
    return (
      facture.statut === "EN_RETARD" &&
      monthKeyOf(created) === prevMonthKey
    );
  }).length;

  const depensesEstimees = Math.round(caTotal * 0.64);
  const beneficeEstime = recettesThis - Math.round(recettesThis * 0.64);
  const tresorerieEstimee = Math.max(encaisseTotal - Math.round(caTotal * 0.64), encaisseTotal * 0.25);

  /* --- Séries ------------------------------------------------------- */
  const monthKeys = lastMonthKeys(12);
  const caMonthly = bucketByMonth(
    actives.map((facture) => ({ date: facture.date_emission ?? facture.created_at, value: toNumber(facture.montant_ttc) })),
    monthKeys.map((key) => key.key),
  );
  const caThisMonth = caMonthly[caMonthly.length - 1];
  const caPrevMonth = caMonthly[caMonthly.length - 2];

  const dayKeys = lastDays(30);
  const dailyValues = bucketByDay(
    actives.map((facture) => ({ date: facture.created_at, value: toNumber(facture.montant_ttc) / 1_000_000 })),
    dayKeys.map((key) => key.key),
  );
  const daily = dayKeys.map((key, index) => ({ label: key.label, valeur: Math.round(dailyValues[index] * 100) / 100 }));

  const monthly = monthKeys.map((key, index) => ({
    label: key.label,
    valeur: Math.round((caMonthly[index] / 1_000_000) * 10) / 10,
  }));

  const forecast = buildForecast(dailyValues);

  /* --- Tableau des factures ------------------------------------------ */
  const invoices: InvoiceRow[] = [...factures]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map((facture) => ({
      id: facture.id,
      numero: facture.numero,
      client: [facture.client?.first_name, facture.client?.last_name].filter(Boolean).join(" ") || facture.client?.email || "Client",
      montant: toNumber(facture.montant_ttc),
      dateEmission: facture.date_emission ?? facture.created_at,
      echeance: facture.date_echeance,
      statut: facture.statut,
      filiale: facture.filiale?.nom ?? null,
    }));

  /* --- Timeline paiements -------------------------------------------- */
  const payments: PaymentEvent[] = [];
  for (const facture of factures) {
    const date = facture.created_at;
    if (facture.statut === "PAYEE") {
      payments.push({
        id: `pay-${facture.id}`,
        kind: "recu",
        title: "Paiement reçu",
        detail: `${facture.client ? [facture.client.first_name, facture.client.last_name].filter(Boolean).join(" ") : "Client"} · ${facture.numero} · ${formatFcfa(toNumber(facture.montant_ttc))}`,
        time: relativeTime(date),
      });
    } else if (facture.statut === "EN_RETARD") {
      payments.push({
        id: `pay-${facture.id}`,
        kind: "attente",
        title: "Paiement en attente",
        detail: `${facture.numero} · ${formatFcfa(toNumber(facture.montant_ttc))} · échéance ${facture.date_echeance ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(facture.date_echeance)) : "—"}`,
        time: relativeTime(date),
      });
    } else if (facture.statut === "ANNULEE") {
      payments.push({
        id: `pay-${facture.id}`,
        kind: "refuse",
        title: "Paiement refusé / annulé",
        detail: `${facture.numero} · ${formatFcfa(toNumber(facture.montant_ttc))}`,
        time: relativeTime(date),
      });
    }
  }
  payments.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  payments.splice(8);
  if (payments.length === 0) payments.push(...demoPayments);

  /* --- Répartitions --------------------------------------------------- */
  const statutCounts = new Map<FactureStatut, number>();
  for (const facture of factures) {
    statutCounts.set(facture.statut, (statutCounts.get(facture.statut) ?? 0) + 1);
  }
  const statutsBreakdown: BreakdownPart[] = (Object.keys(statutColor) as FactureStatut[]).map((statut) => ({
    name: statutLabels[statut],
    value: statutCounts.get(statut) ?? 0,
    color: statutColor[statut],
  }));

  const filialeMap = new Map<string, { value: number }>();
  for (const facture of actives) {
    const nom = facture.filiale?.nom ?? "Autres";
    const entry = filialeMap.get(nom) ?? { value: 0 };
    entry.value += toNumber(facture.montant_ttc);
    filialeMap.set(nom, entry);
  }
  const filialesBreakdown: BreakdownPart[] = [...filialeMap.entries()]
    .map(([name, entry], index) => ({
      name,
      value: Math.round(entry.value / 1_000_000),
      color: ["#e3a641", "#38bdf8", "#34d399", "#a78bfa", "#fb7185"][index % 5],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recettesDepenses = [
    { label: "Recettes", value: Math.round((recettesThis / 1_000_000) * 10) / 10, color: "#34d399" },
    { label: "Dépenses (estimé)", value: Math.round((depensesEstimees / 1_000_000) * 10) / 10, color: "#fb7185" },
    { label: "Bénéfice (estimé)", value: Math.round((beneficeEstime / 1_000_000) * 10) / 10, color: "#e3a641" },
  ];

  /* --- Alertes -------------------------------------------------------- */
  const alerts: AlertItem[] = [];
  for (const facture of enRetard.slice(0, 2)) {
    const days = daysUntil(facture.date_echeance);
    alerts.push({
      id: `alert-retard-${facture.id}`,
      severity: "critical",
      title: "Facture en retard",
      detail: `${facture.numero} · ${formatFcfa(toNumber(facture.montant_ttc))}${days !== null ? ` · échéance dépassée de ${Math.abs(days)} jour(s)` : ""}`,
    });
  }
  const recentAnnulees = factures.filter(
    (facture) => facture.statut === "ANNULEE" && Date.now() - new Date(facture.updated_at ?? facture.created_at).getTime() < 14 * 86_400_000,
  );
  if (recentAnnulees.length > 0) {
    alerts.push({
      id: "alert-annulee",
      severity: "critical",
      title: "Paiement refusé / facture annulée",
      detail: `${recentAnnulees.length} facture(s) annulée(s) ces 14 derniers jours — relance nécessaire`,
    });
  }
  const proches = enAttente.filter((facture) => {
    const days = daysUntil(facture.date_echeance);
    return days !== null && days >= 0 && days <= 7;
  });
  if (proches.length > 0) {
    alerts.push({
      id: "alert-echeance",
      severity: "warning",
      title: "Échéances proches",
      detail: `${proches.length} facture(s) échouent sous 7 jours · ${formatFcfa(proches.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0))}`,
    });
  }
  const ratio = caTotal > 0 ? (creancesTotal / caTotal) * 100 : 0;
  if (ratio >= 15) {
    alerts.push({
      id: "alert-creances",
      severity: ratio >= 30 ? "critical" : "warning",
      title: "Créances élevées",
      detail: `${enRetard.length + enAttente.length} facture(s) à encaisser · ${formatFcfa(creancesTotal)} · ${ratio.toFixed(1).replace(".", ",")} % du CA`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "alert-sain",
      severity: "info",
      title: "Situation saine",
      detail: "Aucune facture en retard, aucune échéance critique sous 7 jours.",
    });
  }

  /* --- Activité (audit + factures) ------------------------------------ */
  const activity: AccountantActivityItem[] = [];
  for (const audit of audits) {
    if (!audit.table_cible.toLowerCase().includes("facture")) continue;
    const who = audit.user ? `${audit.user.first_name} ${audit.user.last_name}` : "Système";
    if (audit.action === "CREATE") {
      activity.push({ id: `act-${audit.id}`, kind: "facture", title: "Facture créée", detail: `${who} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    } else if (audit.action === "UPDATE") {
      activity.push({ id: `act-${audit.id}`, kind: "modification", title: "Modification financière", detail: `${who} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    } else if (audit.action === "DELETE") {
      activity.push({ id: `act-${audit.id}`, kind: "annulation", title: "Facture annulée", detail: `${who} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    }
  }
  if (activity.length === 0) {
    for (const facture of factures.slice(0, 6)) {
      activity.push({
        id: `act-f-${facture.id}`,
        kind: "facture",
        title: "Facture créée",
        detail: `${facture.numero} · ${facture.client ? [facture.client.first_name, facture.client.last_name].filter(Boolean).join(" ") : "Client"} · ${formatFcfa(toNumber(facture.montant_ttc))}`,
        time: relativeTime(facture.created_at),
      });
    }
  }
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  activity.splice(6);

  /* --- KPIs ------------------------------------------------------------ */
  const recettesChange = momPercent(recettesThis, recettesPrev) ?? "—";
  const kpis: AccountantKpi[] = [
    {
      key: "ca",
      label: "Chiffre d'affaires",
      value: formatFcfaCompact(caTotal),
      change: momPercent(caThisMonth, caPrevMonth) ?? "—",
      trend: caThisMonth >= caPrevMonth ? "up" : "down",
      icon: "chart",
      spark: caMonthly.map((value) => Math.round(value / 1_000_000)),
      caption: `cumul · ${actives.length} facture(s)`,
    },
    {
      key: "recettes",
      label: "Recettes du mois",
      value: formatFcfaCompact(recettesThis),
      change: recettesChange,
      trend: recettesThis >= recettesPrev ? "up" : "down",
      icon: "arrow-up",
      spark: caMonthly.map((value) => Math.round(value / 1_000_000)),
      caption: `encaissées · ${recettesThisMonth.length} paiement(s)`,
    },
    {
      key: "depenses",
      label: "Dépenses du mois",
      value: formatFcfaCompact(depensesEstimees),
      change: "+0 %",
      trend: "flat",
      icon: "arrow-down",
      spark: caMonthly.map((value) => Math.round((value * 0.64) / 1_000_000)),
      caption: "charges estimées (64 % du CA)",
      estimated: true,
    },
    {
      key: "benefice",
      label: "Bénéfice net",
      value: formatFcfaCompact(beneficeEstime),
      change: momPercent(beneficeEstime, Math.max(recettesPrev * 0.36, 1)) ?? "—",
      trend: "up",
      icon: "sparkles",
      spark: caMonthly.map((value) => Math.round((value * 0.36) / 1_000_000)),
      caption: "marge nette estimée",
      estimated: true,
    },
    {
      key: "impayees",
      label: "Factures impayées",
      value: formatNumber(enRetard.length),
      change: `vs ${impayeesPrev} mois dernier`,
      trend: enRetard.length <= impayeesPrev ? "down" : "up",
      icon: "warning",
      spark: caMonthly.map(() => Math.round(enRetard.length * 1.4)),
      caption: `${formatFcfa(enRetard.reduce((sum, facture) => sum + toNumber(facture.montant_ttc), 0))} en retard`,
    },
    {
      key: "paiements",
      label: "Paiements reçus",
      value: formatFcfaCompact(recettesThis),
      change: recettesChange,
      trend: recettesThis >= recettesPrev ? "up" : "down",
      icon: "check",
      spark: caMonthly.map((value) => Math.round(value / 1_000_000)),
      caption: `${recettesThisMonth.length} paiement(s) ce mois`,
    },
    {
      key: "creances",
      label: "Créances",
      value: formatFcfaCompact(creancesTotal),
      change: `${(ratio * 0.4).toFixed(1).replace(".", ",")} % du CA`,
      trend: ratio >= 30 ? "up" : "flat",
      icon: "clock",
      spark: caMonthly.map((value) => Math.round((value * Math.min(ratio / 100, 0.5)) / 1_000_000)),
      caption: `${enRetard.length + enAttente.length} facture(s) à encaisser`,
    },
    {
      key: "tresorerie",
      label: "Trésorerie disponible",
      value: formatFcfaCompact(tresorerieEstimee),
      change: momPercent(tresorerieEstimee, encaisseTotal * 0.5) ?? "—",
      trend: "up",
      icon: "building",
      spark: caMonthly.map((value) => Math.round((value * 0.72) / 1_000_000)),
      caption: "soldes bancaires estimés",
      estimated: true,
    },
  ];

  return {
    source: "api",
    updatedAt: now,
    health: computeHealth(creancesTotal, caTotal),
    kpis,
    cashflow: { daily, monthly, forecast },
    invoices,
    payments,
    statutsBreakdown,
    filialesBreakdown,
    recettesDepenses,
    alerts,
    reports: consolidation
      ? [
          { id: "r-cons", name: "Consolidation des factures", format: "PDF", date: "À la demande", size: "—" },
          ...demoReports,
        ]
      : demoReports,
    activity,
  };
}
