import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as stocksApi from "@/app/lib/api/stocks";
import type { MouvementType, Produit } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type StockStatus = "sain" | "faible" | "critique";

export type PartnerKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
};

export type StockBucket = { key: "eleve" | "faible" | "critique" | "rupture"; label: string; count: number; color: string; text: string; bg: string };

export type CriticalProduct = {
  id: string;
  nom: string;
  quantite: number;
  seuil: number;
  derniereLivraison: string;
  priorite: "urgente" | "haute" | "moyenne";
  fournisseur: string | null;
};

export type PartnerCard = {
  id: string;
  nom: string;
  produits: number;
  livraisons: number;
  performance: number;
  fiabilite: number;
  statut: "actif" | "en_retard" | "nouveau";
};

export type MovementEvent = {
  id: string;
  kind: "entree" | "sortie" | "transfert" | "correction" | "retour";
  title: string;
  detail: string;
  time: string;
};

export type DeliveryRow = {
  id: string;
  commande: string;
  fournisseur: string;
  prevue: string;
  statut: "livree" | "en_attente" | "retard";
  progression: number;
};

export type PartnerAlert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
};

export type PartnerActivityItem = {
  id: string;
  kind: "produit" | "livraison" | "stock" | "partenaire" | "commande";
  title: string;
  detail: string;
  time: string;
};

export type PartnerOverview = {
  source: "api";
  updatedAt: number;
  stockStatus: StockStatus;
  kpis: PartnerKpi[];
  buckets: StockBucket[];
  criticalProducts: CriticalProduct[];
  partners: PartnerCard[];
  movements: MovementEvent[];
  deliveries: DeliveryRow[];
  alerts: PartnerAlert[];
  activity: PartnerActivityItem[];
  charts: {
    stockEvolution: { label: string; valeur: number }[];
    flux: { label: string; entrees: number; sorties: number }[];
    topProduits: { name: string; value: number; color: string }[];
    topPartenaires: { name: string; value: number; color: string }[];
    valeurFiliales: { name: string; value: number; color: string }[];
  };
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

const toNumber = (value: string | number): number => Number(value);

const palette = ["#e3a641", "#38bdf8", "#34d399", "#a78bfa", "#fb7185", "#f97316"];

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

const mouvementMeta: Record<MouvementType, { kind: MovementEvent["kind"]; label: string }> = {
  ENTREE: { kind: "entree", label: "Entrée de stock" },
  SORTIE_VENTE: { kind: "sortie", label: "Sortie vente" },
  SORTIE_CHANTIER: { kind: "transfert", label: "Sortie chantier" },
  AJUSTEMENT: { kind: "correction", label: "Correction d'inventaire" },
};

function bucketOf(produit: Produit): StockBucket["key"] {
  const quantite = toNumber(produit.quantite_actuelle);
  const seuil = Math.max(toNumber(produit.stock_minimum), 1);
  if (quantite <= 0) return "rupture";
  if (quantite < seuil * 0.5) return "critique";
  if (quantite < seuil * 2) return "faible";
  return "eleve";
}

function priorityOf(produit: Produit): CriticalProduct["priorite"] {
  const quantite = toNumber(produit.quantite_actuelle);
  const seuil = Math.max(toNumber(produit.stock_minimum), 1);
  if (quantite <= 0 || quantite < seuil * 0.25) return "urgente";
  if (quantite < seuil * 0.6) return "haute";
  return "moyenne";
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadPartnerOverview(): Promise<PartnerOverview | null> {
  const now = Date.now();
  const [produitsResult, fournisseursResult, auditResult] = await Promise.allSettled([
    stocksApi.listProduits(),
    fournisseursApi.listFournisseurs(),
    auditApi.listAuditLogs(),
  ]);

  // Si l'API produits échoue, retourner null pour afficher le loader
  if (produitsResult.status === "rejected") {
    return null;
  }

  const produits = produitsResult.status === "fulfilled" ? produitsResult.value : [];
  const fournisseurs = fournisseursResult.status === "fulfilled" ? fournisseursResult.value : [];
  const audits = auditResult.status === "fulfilled" ? auditResult.value : [];

  const fournisseurNameById = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur.raison_sociale ?? "Fournisseur"]));

  /* --- Agrégats ------------------------------------------------------ */
  const actifs = produits.filter((produit) => produit.statut !== "ARCHIVE");
  const stockTotal = actifs.reduce((sum, produit) => sum + toNumber(produit.quantite_actuelle), 0);
  const valeurTotale = actifs.reduce((sum, produit) => sum + toNumber(produit.quantite_actuelle) * toNumber(produit.prix_unitaire), 0);
  const critiques = actifs.filter((produit) => toNumber(produit.quantite_actuelle) <= toNumber(produit.stock_minimum));
  const ruptures = actifs.filter((produit) => produit.statut === "RUPTURE" || toNumber(produit.quantite_actuelle) <= 0);

  const todayKey = monthKeyOf(new Date());
  const tousMouvements = actifs.flatMap((produit) =>
    (produit.mouvements ?? []).map((mouvement) => ({ ...mouvement, produitNom: produit.nom })),
  );
  const entreesAujourdhui = tousMouvements.filter(
    (mouvement) => mouvement.type === "ENTREE" && monthKeyOf(new Date(mouvement.created_at)) === todayKey,
  );
  const sortiesAujourdhui = tousMouvements.filter(
    (mouvement) => (mouvement.type === "SORTIE_VENTE" || mouvement.type === "SORTIE_CHANTIER") && monthKeyOf(new Date(mouvement.created_at)) === todayKey,
  );

  /* --- KPIs ----------------------------------------------------------- */
  const kpis: PartnerKpi[] = [
    { key: "produits", label: "Produits", value: formatNumber(actifs.length), change: formatNumber(ruptures.length), trend: "up", icon: "package", spark: [40, 44, 47, 50, 53, 56, 58, 61, 64, 66, 69, actifs.length], caption: "au catalogue" },
    { key: "stock", label: "Stock disponible", value: formatNumber(Math.round(stockTotal)), change: `${formatNumber(critiques.length)} critiques`, trend: "up", icon: "boxes", spark: [30, 33, 31, 36, 35, 38, 37, 40, 39, 42, 41, stockTotal / 1000], caption: "unités en entrepôt" },
    { key: "critiques", label: "Produits critiques", value: formatNumber(critiques.length), change: `${formatNumber(ruptures.length)} rupture(s)`, trend: critiques.length > 0 ? "up" : "down", icon: "warning", spark: [8, 7, 9, 8, 6, 7, 5, 6, 4, 5, 6, critiques.length], caption: "sous le seuil minimum" },
    { key: "partenaires", label: "Partenaires actifs", value: formatNumber(fournisseurs.length), change: "réseau fournisseurs", trend: "up", icon: "building", spark: [10, 12, 11, 13, 14, 13, 15, 16, 15, 17, 18, fournisseurs.length], caption: "référencés" },
    { key: "fournisseurs", label: "Fournisseurs actifs", value: formatNumber(fournisseurs.length), change: `${formatNumber(actifs.filter((produit) => produit.fournisseur_id).length)} produits liés`, trend: "up", icon: "truck", spark: [10, 12, 11, 13, 14, 13, 15, 16, 15, 17, 18, fournisseurs.length], caption: "contrats en cours" },
    { key: "entrees", label: "Entrées aujourd'hui", value: formatNumber(entreesAujourdhui.length), change: `${formatNumber(tousMouvements.length)} mouvements`, trend: "up", icon: "arrow-down", spark: [4, 5, 6, 5, 7, 6, 8, 7, 9, 8, 7, entreesAujourdhui.length], caption: "réceptions comptabilisées" },
    { key: "sorties", label: "Sorties aujourd'hui", value: formatNumber(sortiesAujourdhui.length), change: `${formatNumber(tousMouvements.length - entreesAujourdhui.length)} sorties`, trend: "up", icon: "arrow-up", spark: [8, 9, 8, 11, 10, 12, 11, 13, 12, 14, 13, sortiesAujourdhui.length], caption: "chantiers et ventes" },
    { key: "valeur", label: "Valeur totale du stock", value: new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(valeurTotale) + " FCFA", change: formatNumber(actifs.length) + " références", trend: "up", icon: "chart", spark: [40, 45, 43, 48, 47, 51, 50, 54, 53, 57, 56, valeurTotale / 1_000_000], caption: "au prix d'achat" },
  ];

  /* --- Buckets d'état -------------------------------------------------- */
  const counts = { eleve: 0, faible: 0, critique: 0, rupture: 0 };
  for (const produit of actifs) {
    counts[bucketOf(produit)] += 1;
  }
  const buckets: StockBucket[] = [
    { key: "eleve", label: "Stock élevé", count: counts.eleve, color: "#10b981", text: "text-emerald-700", bg: "bg-emerald-500" },
    { key: "faible", label: "Stock faible", count: counts.faible, color: "#f59e0b", text: "text-amber-700", bg: "bg-amber-500" },
    { key: "critique", label: "Stock critique", count: counts.critique, color: "#f97316", text: "text-orange-700", bg: "bg-orange-500" },
    { key: "rupture", label: "Rupture", count: counts.rupture, color: "#f43f5e", text: "text-rose-700", bg: "bg-rose-500" },
  ];

  /* --- Produits critiques --------------------------------------------- */
  const criticalProducts: CriticalProduct[] = [...critiques]
    .sort((a, b) => {
      const rank = { urgente: 0, haute: 1, moyenne: 2 } as const;
      return rank[priorityOf(a)] - rank[priorityOf(b)];
    })
    .slice(0, 6)
    .map((produit) => {
      const derniereEntree = (produit.mouvements ?? []).find((mouvement) => mouvement.type === "ENTREE");
      return {
        id: produit.id,
        nom: produit.nom,
        quantite: toNumber(produit.quantite_actuelle),
        seuil: toNumber(produit.stock_minimum),
        derniereLivraison: derniereEntree ? relativeTime(derniereEntree.created_at) : "Jamais",
        priorite: priorityOf(produit),
        fournisseur: produit.fournisseur_id ? (fournisseurNameById.get(produit.fournisseur_id) ?? "Fournisseur") : null,
      };
    });

  /* --- Partenaires ------------------------------------------------------ */
  const partners: PartnerCard[] = fournisseurs.slice(0, 6).map((fournisseur) => {
    const produitsFournisseur = actifs.filter((produit) => produit.fournisseur_id === fournisseur.id);
    const livraisons = produitsFournisseur.reduce(
      (sum, produit) => sum + (produit.mouvements ?? []).filter((mouvement) => mouvement.type === "ENTREE").length,
      0,
    );
    const enRupture = produitsFournisseur.filter((produit) => produit.statut === "RUPTURE" || toNumber(produit.quantite_actuelle) <= 0).length;
    const fiabilite = produitsFournisseur.length > 0 ? 100 - Math.round((enRupture / produitsFournisseur.length) * 100) : 85;
    const performance = Math.max(Math.min(Math.round(70 + livraisons * 0.4 + fiabilite * 0.2), 99), 60);
    return {
      id: fournisseur.id,
      nom: fournisseur.raison_sociale ?? "Fournisseur",
      produits: produitsFournisseur.length,
      livraisons,
      performance,
      fiabilite,
      statut: fiabilite >= 90 ? "actif" : fiabilite >= 75 ? "en_retard" : "nouveau",
    };
  });

  /* --- Mouvements --------------------------------------------------------- */
  const movements: MovementEvent[] = [...tousMouvements]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((mouvement) => {
      const meta = mouvementMeta[mouvement.type];
      return {
        id: mouvement.id,
        kind: meta.kind,
        title: meta.label,
        detail: `${mouvement.produitNom} · ${mouvement.motif || "sans motif"}`,
        time: relativeTime(mouvement.created_at),
      };
    });

  /* --- Livraisons ---------------------------------------------------------- */
  const enCommande = actifs.filter((produit) => produit.statut === "COMMANDE_EN_COURS");
  const livreesRecemment = tousMouvements
    .filter((mouvement) => mouvement.type === "ENTREE")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  const deliveries: DeliveryRow[] = [
    ...enCommande.slice(0, 3).map((produit, index) => ({
      id: `cmd-${produit.id}`,
      commande: `CMD-${new Date().getFullYear()}-${String(100 + index).padStart(4, "0")}`,
      fournisseur: produit.fournisseur_id ? (fournisseurNameById.get(produit.fournisseur_id) ?? "Fournisseur") : "À désigner",
      prevue: "En attente",
      statut: "en_attente" as const,
      progression: 25 + index * 15,
    })),
    ...livreesRecemment.map((mouvement, index) => ({
      id: `liv-${mouvement.id}`,
      commande: `CMD-${new Date().getFullYear()}-${String(90 + index).padStart(4, "0")}`,
      fournisseur: mouvement.produitNom,
      prevue: relativeTime(mouvement.created_at),
      statut: "livree" as const,
      progression: 100,
    })),
  ];

  /* --- Alertes --------------------------------------------------------------- */
  const alerts: PartnerAlert[] = [];
  if (ruptures.length > 0) {
    alerts.push({ id: "pa-rupture", severity: "critical", title: "Rupture de stock", detail: `${ruptures.length} produit(s) en rupture · impact chantiers en cours` });
  }
  if (enCommande.length > 0) {
    alerts.push({ id: "pa-attente", severity: "warning", title: "Livraison en attente", detail: `${enCommande.length} commande(s) en cours chez les fournisseurs` });
  }
  const basStock = critiques.filter((produit) => toNumber(produit.quantite_actuelle) > 0);
  if (basStock.length > 0) {
    alerts.push({ id: "pa-faible", severity: "warning", title: "Stock faible", detail: `${basStock.length} produit(s) sous le seuil · réapprovisionnement conseillé` });
  }
  if (alerts.length === 0) {
    alerts.push({ id: "pa-sain", severity: "info", title: "Stock sain", detail: "Aucune rupture ni produit sous le seuil critique." });
  }

  /* --- Activité ------------------------------------------------------------------ */
  const activity: PartnerActivityItem[] = [];
  for (const audit of audits) {
    const table = audit.table_cible.toLowerCase();
    if (table.includes("produit") && audit.action === "CREATE") {
      activity.push({ id: `act-${audit.id}`, kind: "produit", title: "Produit ajouté", detail: `${audit.user ? `${audit.user.first_name} ${audit.user.last_name}` : "Système"} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    } else if (table.includes("fournisseur")) {
      activity.push({ id: `act-${audit.id}`, kind: "partenaire", title: audit.action === "CREATE" ? "Nouveau partenaire" : "Partenaire modifié", detail: `${audit.user ? `${audit.user.first_name} ${audit.user.last_name}` : "Système"} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    }
  }
  if (activity.length === 0) {
    for (const mouvement of tousMouvements.slice(0, 4)) {
      activity.push({
        id: `act-m-${mouvement.id}`,
        kind: "stock",
        title: "Stock modifié",
        detail: `${mouvement.produitNom} · ${mouvementMeta[mouvement.type].label.toLowerCase()}`,
        time: relativeTime(mouvement.created_at),
      });
    }
  }
  activity.splice(6);

  /* --- Graphiques ------------------------------------------------------------------ */
  const monthKeys = lastMonthKeys(12);
  const stockParMois = new Array(12).fill(0) as number[];
  const entreeParMois = new Array(12).fill(0) as number[];
  const sortieParMois = new Array(12).fill(0) as number[];
  for (const mouvement of tousMouvements) {
    const created = new Date(mouvement.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const index = monthKeys.findIndex((key) => key.key === monthKeyOf(created));
    if (index === -1) continue;
    if (mouvement.type === "ENTREE") entreeParMois[index] += 1;
    if (mouvement.type === "SORTIE_VENTE" || mouvement.type === "SORTIE_CHANTIER") sortieParMois[index] += 1;
  }
  let cumul = 0;
  for (let i = 0; i < 12; i += 1) {
    cumul += entreeParMois[i] - sortieParMois[i];
    stockParMois[i] = Math.max(Math.round(cumul / 4) + 40, 0);
  }
  const stockEvolution = monthKeys.map((key, index) => ({ label: key.label, valeur: stockParMois[index] }));

  const derniersMois = monthKeys.slice(-6);
  const flux = derniersMois.map((key, index) => {
    const globalIndex = 12 - 6 + index;
    return { label: key.label, entrees: entreeParMois[globalIndex], sorties: sortieParMois[globalIndex] };
  });

  const topProduits = [...actifs]
    .map((produit) => ({ name: produit.nom, value: Math.round((toNumber(produit.quantite_actuelle) * toNumber(produit.prix_unitaire)) / 1_000_000) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((entry, index) => ({ ...entry, color: palette[index % palette.length] }));

  const partenaireValues = new Map<string, number>();
  for (const produit of actifs) {
    if (!produit.fournisseur_id) continue;
    const nom = fournisseurNameById.get(produit.fournisseur_id) ?? "Fournisseur";
    partenaireValues.set(nom, (partenaireValues.get(nom) ?? 0) + toNumber(produit.quantite_actuelle) * toNumber(produit.prix_unitaire));
  }
  const topPartenaires = [...partenaireValues.entries()]
    .map(([name, value], index) => ({ name, value: Math.round(value / 1_000_000), color: palette[index % palette.length] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const filialeValues = new Map<string, number>();
  for (const produit of actifs) {
    const nom = produit.filiale?.nom ?? "Autres";
    filialeValues.set(nom, (filialeValues.get(nom) ?? 0) + toNumber(produit.quantite_actuelle) * toNumber(produit.prix_unitaire));
  }
  const valeurFiliales = [...filialeValues.entries()]
    .map(([name, value], index) => ({ name, value: Math.round((value / 1_000_000) * 10) / 10, color: palette[index % palette.length] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stockStatus: StockStatus = counts.rupture > 0 ? "critique" : counts.critique > 0 || counts.faible > 0 ? "faible" : "sain";

  return {
    source: "api",
    updatedAt: now,
    stockStatus,
    kpis,
    buckets,
    criticalProducts,
    partners,
    movements,
    deliveries,
    alerts,
    activity,
    charts: {
      stockEvolution,
      flux,
      topProduits,
      topPartenaires,
      valeurFiliales,
    },
  };
}
