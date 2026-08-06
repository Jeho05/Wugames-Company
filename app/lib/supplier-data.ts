import * as authApi from "@/app/lib/api/auth";
import * as notificationsApi from "@/app/lib/api/notifications";
import * as stocksApi from "@/app/lib/api/stocks";
import type {
  MouvementStock,
  MouvementType,
  Notification,
  Produit,
  ProduitStatut,
  User,
} from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types — calqués sur les réponses réelles de l'API                   */
/* ------------------------------------------------------------------ */

export type SupplierView = "overview" | "produits" | "mouvements" | "notifications" | "profil";

export type SupplierMovementView = {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  type: MouvementType;
  quantite: number;
  motif: string | null;
  reference_externe: string | null;
  created_at: string;
  filialeId: string | null;
  filialeNom: string | null;
};

export type SupplierProfileView = {
  firstName: string;
  lastName: string;
  raisonSociale: string | null;
  email: string;
  phone: string | null;
  adresse: string | null;
  siret: string | null;
  twoFactor: boolean;
  fournisseurId: string | null;
};

export type SupplierKpis = {
  total: number;
  disponibles: number;
  reappro: number;
  rupture: number;
  commandes: number;
  archives: number;
  quantiteTotale: number;
  mouvements30j: number;
  filiales: number;
};

export type SupplierOverview = {
  source: "api" | "demo";
  updatedAt: number;
  profile: SupplierProfileView;
  products: Produit[];
  movements: SupplierMovementView[];
  notifications: { list: Notification[]; unread: number };
  kpis: SupplierKpis;
  filiales: { id: string; nom: string }[];
};

/* ------------------------------------------------------------------ */
/* Métadonnées de statut                                               */
/* ------------------------------------------------------------------ */

export const statutMeta: Record<
  ProduitStatut,
  { label: string; short: string; dot: string; badge: string; bar: string; severity: 0 | 1 | 2 | 3 }
> = {
  DISPONIBLE: {
    label: "Disponible",
    short: "Disponible",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    bar: "bg-emerald-500",
    severity: 0,
  },
  REAPPROVISIONNEMENT_REQUIS: {
    label: "Réapprovisionnement requis",
    short: "Réappro. requis",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
    bar: "bg-amber-500",
    severity: 2,
  },
  COMMANDE_EN_COURS: {
    label: "Commande en cours",
    short: "Commande en cours",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
    bar: "bg-sky-500",
    severity: 1,
  },
  RUPTURE: {
    label: "Rupture",
    short: "Rupture",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
    bar: "bg-rose-500",
    severity: 3,
  },
  ARCHIVE: {
    label: "Archivé",
    short: "Archivé",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400",
    bar: "bg-slate-400",
    severity: 0,
  },
};

export const STATUTS_ACTIFS: ProduitStatut[] = [
  "DISPONIBLE",
  "REAPPROVISIONNEMENT_REQUIS",
  "COMMANDE_EN_COURS",
  "RUPTURE",
  "ARCHIVE",
];

export const statutLabel = (statut: ProduitStatut): string => statutMeta[statut]?.label ?? statut;

export function businessMessage(produit: Produit): { message: string; tone: "ok" | "warn" | "danger" | "info" } {
  switch (produit.statut) {
    case "RUPTURE":
      return { message: "Ce produit est actuellement en rupture de stock.", tone: "danger" };
    case "REAPPROVISIONNEMENT_REQUIS":
      return { message: "Ce produit a atteint son seuil minimum et nécessite un réapprovisionnement.", tone: "warn" };
    case "COMMANDE_EN_COURS":
      return { message: "Un réapprovisionnement est en cours pour ce produit.", tone: "info" };
    case "ARCHIVE":
      return { message: "Ce produit est archivé et n'est plus suivi en stock.", tone: "info" };
    default:
      return { message: "Le niveau de stock est satisfaisant.", tone: "ok" };
  }
}

export const mouvementMeta: Record<
  MouvementType,
  { label: string; icon: "arrow-up" | "arrow-down" | "hardhat" | "settings"; chip: string; sign: "+" | "−" | "±" }
> = {
  ENTREE: {
    label: "Entrée",
    icon: "arrow-up",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    sign: "+",
  },
  SORTIE_VENTE: {
    label: "Sortie vente",
    icon: "arrow-down",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
    sign: "−",
  },
  SORTIE_CHANTIER: {
    label: "Sortie chantier",
    icon: "hardhat",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300",
    sign: "−",
  },
  AJUSTEMENT: {
    label: "Ajustement",
    icon: "settings",
    chip: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
    sign: "±",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function formatQuantite(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPrix(value: string | number): string {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(numeric) ? `${new Intl.NumberFormat("fr-FR").format(numeric)} F CFA` : "—";
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return formatDate(iso);
}

/* ------------------------------------------------------------------ */
/* Agrégation des mouvements — dédupliqués par id                      */
/* ------------------------------------------------------------------ */

export function aggregateMovements(products: Produit[]): SupplierMovementView[] {
  const map = new Map<string, SupplierMovementView>();
  for (const produit of products) {
    for (const mouvement of produit.mouvements ?? []) {
      const existing = map.get(mouvement.id);
      const view: SupplierMovementView = {
        id: mouvement.id,
        produitId: produit.id,
        produitNom: produit.nom,
        produitReference: produit.reference,
        type: mouvement.type,
        quantite: mouvement.quantite,
        motif: mouvement.motif ?? null,
        reference_externe: mouvement.reference_externe ?? null,
        created_at: mouvement.created_at,
        filialeId: produit.filiale?.id ?? null,
        filialeNom: produit.filiale?.nom ?? null,
      };
      if (!existing) {
        map.set(mouvement.id, view);
      } else if (existing.filialeId === null && produit.filiale) {
        map.set(mouvement.id, view);
      }
    }
  }
  return [...map.values()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/* ------------------------------------------------------------------ */
/* KPIs — calculés uniquement à partir des produits retournés          */
/* ------------------------------------------------------------------ */

export function computeKpis(products: Produit[], movements: SupplierMovementView[]): SupplierKpis {
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const filiales = new Set<string>();
  let quantiteTotale = 0;
  let disponibles = 0;
  let reappro = 0;
  let rupture = 0;
  let commandes = 0;
  let archives = 0;

  for (const produit of products) {
    quantiteTotale += produit.quantite_actuelle;
    if (produit.filiale?.id) filiales.add(produit.filiale.id);
    switch (produit.statut) {
      case "DISPONIBLE":
        disponibles += 1;
        break;
      case "REAPPROVISIONNEMENT_REQUIS":
        reappro += 1;
        break;
      case "COMMANDE_EN_COURS":
        commandes += 1;
        break;
      case "RUPTURE":
        rupture += 1;
        break;
      case "ARCHIVE":
        archives += 1;
        break;
    }
  }

  return {
    total: products.length,
    disponibles,
    reappro,
    rupture,
    commandes,
    archives,
    quantiteTotale,
    mouvements30j: movements.filter((mouvement) => new Date(mouvement.created_at).getTime() >= thirtyDaysAgo).length,
    filiales: filiales.size,
  };
}

/* ------------------------------------------------------------------ */
/* Données de démonstration — un seul fournisseur, jamais mélangé      */
/* ------------------------------------------------------------------ */

const demoMouvements: Record<string, MouvementStock[]> = {
  "p1": [
    { id: "m101", produit_id: "p1", type: "ENTREE", quantite: 40, motif: "Réception de la commande", reference_externe: "CMD-2026-118", created_at: "2026-07-28T09:14:00.000Z" },
    { id: "m102", produit_id: "p1", type: "SORTIE_VENTE", quantite: 6, motif: "Vente au comptoir", created_at: "2026-07-29T11:02:00.000Z" },
    { id: "m103", produit_id: "p1", type: "SORTIE_CHANTIER", quantite: 4, motif: "Chantier villa Koné", reference_externe: "MS-2026-77", created_at: "2026-08-01T08:40:00.000Z" },
    { id: "m104", produit_id: "p1", type: "SORTIE_VENTE", quantite: 2, motif: "Vente en ligne", created_at: "2026-08-03T16:20:00.000Z" },
  ],
  "p2": [
    { id: "m201", produit_id: "p2", type: "ENTREE", quantite: 30, motif: "Réception de la commande", reference_externe: "CMD-2026-96", created_at: "2026-07-02T09:00:00.000Z" },
    { id: "m202", produit_id: "p2", type: "SORTIE_CHANTIER", quantite: 12, motif: "Chantier immeuble Palmiers", reference_externe: "MS-2026-54", created_at: "2026-07-15T07:55:00.000Z" },
    { id: "m203", produit_id: "p2", type: "SORTIE_VENTE", quantite: 6, motif: "Vente au comptoir", created_at: "2026-07-26T10:30:00.000Z" },
    { id: "m204", produit_id: "p2", type: "AJUSTEMENT", quantite: 0, motif: "Inventaire mensuel", created_at: "2026-07-31T17:00:00.000Z" },
  ],
  "p3": [
    { id: "m301", produit_id: "p3", type: "ENTREE", quantite: 60, motif: "Réception de la commande", reference_externe: "CMD-2026-87", created_at: "2026-06-25T08:30:00.000Z" },
    { id: "m302", produit_id: "p3", type: "SORTIE_VENTE", quantite: 8, motif: "Vente au comptoir", created_at: "2026-07-05T15:10:00.000Z" },
    { id: "m303", produit_id: "p3", type: "SORTIE_CHANTIER", quantite: 10, motif: "Chantier résidence Aya", reference_externe: "MS-2026-61", created_at: "2026-07-21T08:05:00.000Z" },
  ],
  "p4": [
    { id: "m401", produit_id: "p4", type: "ENTREE", quantite: 25, motif: "Réception de la commande", reference_externe: "CMD-2026-104", created_at: "2026-07-08T10:00:00.000Z" },
    { id: "m402", produit_id: "p4", type: "SORTIE_VENTE", quantite: 5, motif: "Vente en ligne", created_at: "2026-07-19T14:45:00.000Z" },
    { id: "m403", produit_id: "p4", type: "SORTIE_CHANTIER", quantite: 11, motif: "Chantier villa Koné", reference_externe: "MS-2026-77", created_at: "2026-07-30T09:12:00.000Z" },
  ],
  "p5": [
    { id: "m501", produit_id: "p5", type: "ENTREE", quantite: 15, motif: "Réception de la commande", reference_externe: "CMD-2026-52", created_at: "2026-06-14T09:20:00.000Z" },
    { id: "m502", produit_id: "p5", type: "SORTIE_VENTE", quantite: 15, motif: "Vente au comptoir", created_at: "2026-06-28T11:40:00.000Z" },
    { id: "m503", produit_id: "p5", type: "AJUSTEMENT", quantite: 0, motif: "Inventaire mensuel", created_at: "2026-07-31T17:05:00.000Z" },
  ],
  "p6": [
    { id: "m601", produit_id: "p6", type: "ENTREE", quantite: 20, motif: "Réception de la commande", reference_externe: "CMD-2026-110", created_at: "2026-07-11T08:50:00.000Z" },
    { id: "m602", produit_id: "p6", type: "SORTIE_CHANTIER", quantite: 3, motif: "Chantier immeuble Palmiers", reference_externe: "MS-2026-70", created_at: "2026-07-24T07:45:00.000Z" },
  ],
  "p7": [
    { id: "m701", produit_id: "p7", type: "ENTREE", quantite: 100, motif: "Réception de la commande", reference_externe: "CMD-2026-72", created_at: "2026-06-20T08:10:00.000Z" },
    { id: "m702", produit_id: "p7", type: "SORTIE_VENTE", quantite: 14, motif: "Vente au comptoir", created_at: "2026-07-09T10:25:00.000Z" },
    { id: "m703", produit_id: "p7", type: "SORTIE_VENTE", quantite: 9, motif: "Vente en ligne", created_at: "2026-07-27T15:35:00.000Z" },
  ],
  "p8": [
    { id: "m801", produit_id: "p8", type: "ENTREE", quantite: 30, motif: "Réception de la commande", reference_externe: "CMD-2026-95", created_at: "2026-07-04T09:40:00.000Z" },
    { id: "m802", produit_id: "p8", type: "SORTIE_VENTE", quantite: 4, motif: "Vente au comptoir", created_at: "2026-07-22T13:15:00.000Z" },
    { id: "m803", produit_id: "p8", type: "SORTIE_CHANTIER", quantite: 4, motif: "Chantier résidence Aya", reference_externe: "MS-2026-61", created_at: "2026-08-02T08:30:00.000Z" },
  ],
};

const demoProduits: Produit[] = [
  {
    id: "p1", nom: "Peinture blanc mat 25 L", description: "Peinture acrylique blanche mate, usage intérieur et extérieur.", reference: "PE-2501",
    prix_unitaire: 38500, quantite_actuelle: 28, stock_minimum: 15, statut: "DISPONIBLE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-treich",
    fournisseur_id: "f-batipro", created_at: "2026-03-12T09:00:00.000Z", updated_at: "2026-08-03T16:20:00.000Z",
    filiale: { id: "f-treich", nom: "WUGAMS Treichville", code: "TRE" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p1,
  },
  {
    id: "p2", nom: "Ciment 50 kg", description: "Ciment gris CPJ 42,5 en sac de 50 kg.", reference: "CM-5002",
    prix_unitaire: 6200, quantite_actuelle: 12, stock_minimum: 20, statut: "REAPPROVISIONNEMENT_REQUIS",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-cocody",
    fournisseur_id: "f-batipro", created_at: "2026-02-05T09:00:00.000Z", updated_at: "2026-07-31T17:00:00.000Z",
    filiale: { id: "f-cocody", nom: "WUGAMS Cocody", code: "COC" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p2,
  },
  {
    id: "p3", nom: "Carrelage grès 60×60", description: "Carrelage grès cérame émaillé 60×60, finition brillante.", reference: "CG-6001",
    prix_unitaire: 9800, quantite_actuelle: 42, stock_minimum: 30, statut: "DISPONIBLE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-marcory",
    fournisseur_id: "f-batipro", created_at: "2026-01-20T09:00:00.000Z", updated_at: "2026-07-21T08:05:00.000Z",
    filiale: { id: "f-marcory", nom: "WUGAMS Marcory", code: "MAR" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p3,
  },
  {
    id: "p4", nom: "Câble électrique 2,5 mm²", description: "Câble rigide cuivre 2,5 mm², rouleau de 100 m.", reference: "CE-2503",
    prix_unitaire: 14500, quantite_actuelle: 9, stock_minimum: 12, statut: "REAPPROVISIONNEMENT_REQUIS",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-treich",
    fournisseur_id: "f-batipro", created_at: "2026-03-30T09:00:00.000Z", updated_at: "2026-07-30T09:12:00.000Z",
    filiale: { id: "f-treich", nom: "WUGAMS Treichville", code: "TRE" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p4,
  },
  {
    id: "p5", nom: "Peinture acrylique bleu 4 L", description: "Peinture acrylique bleu profond, pot de 4 L.", reference: "PA-4010",
    prix_unitaire: 12300, quantite_actuelle: 0, stock_minimum: 10, statut: "RUPTURE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-cocody",
    fournisseur_id: "f-batipro", created_at: "2026-02-18T09:00:00.000Z", updated_at: "2026-07-31T17:05:00.000Z",
    filiale: { id: "f-cocody", nom: "WUGAMS Cocody", code: "COC" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p5,
  },
  {
    id: "p6", nom: "Plaque de plâtre 1,2×2,5 m", description: "Plaque de plâtre standard 13 mm, épaisseur 1,2×2,5 m.", reference: "PP-1201",
    prix_unitaire: 7400, quantite_actuelle: 17, stock_minimum: 8, statut: "COMMANDE_EN_COURS",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-yopo",
    fournisseur_id: "f-batipro", created_at: "2026-04-09T09:00:00.000Z", updated_at: "2026-07-24T07:45:00.000Z",
    filiale: { id: "f-yopo", nom: "WUGAMS Yopougon", code: "YOP" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p6,
  },
  {
    id: "p7", nom: "Tuyau PVC 100 mm", description: "Tuyau PVC pression 100 mm, longueur 3 m.", reference: "TP-1000",
    prix_unitaire: 3150, quantite_actuelle: 77, stock_minimum: 40, statut: "DISPONIBLE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-marcory",
    fournisseur_id: "f-batipro", created_at: "2026-01-08T09:00:00.000Z", updated_at: "2026-07-27T15:35:00.000Z",
    filiale: { id: "f-marcory", nom: "WUGAMS Marcory", code: "MAR" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p7,
  },
  {
    id: "p8", nom: "Ciment colle 25 kg", description: "Ciment colle flexible pour carrelage, sac de 25 kg.", reference: "CC-2500",
    prix_unitaire: 8900, quantite_actuelle: 22, stock_minimum: 12, statut: "DISPONIBLE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-yopo",
    fournisseur_id: "f-batipro", created_at: "2026-03-01T09:00:00.000Z", updated_at: "2026-08-02T08:30:00.000Z",
    filiale: { id: "f-yopo", nom: "WUGAMS Yopougon", code: "YOP" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: demoMouvements.p8,
  },
  {
    id: "p9", nom: "Panneau OSB 18 mm", description: "Panneau OSB 18 mm, format 2500×1250 mm.", reference: "OS-1812",
    prix_unitaire: 12900, quantite_actuelle: 0, stock_minimum: 5, statut: "ARCHIVE",
    adresse_reference_lat: null, adresse_reference_lng: null, filiale_id: "f-treich",
    fournisseur_id: "f-batipro", created_at: "2025-11-14T09:00:00.000Z", updated_at: "2026-05-02T09:00:00.000Z",
    filiale: { id: "f-treich", nom: "WUGAMS Treichville", code: "TRE" },
    fournisseur: { id: "f-batipro", raison_sociale: "BatiPro CI" }, mouvements: [],
  },
];

const demoNotifications: Notification[] = [
  {
    id: "n1", lu: false, type: "stock",
    message: "« Ciment 50 kg » a atteint son seuil minimum à WUGAMS Cocody. Un réapprovisionnement est nécessaire.",
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(), niveau: "haut", produit_id: "p2",
  },
  {
    id: "n2", lu: false, type: "produit",
    message: "« Peinture acrylique bleu 4 L » est en rupture de stock à WUGAMS Cocody.",
    created_at: new Date(Date.now() - 5 * 3_600_000).toISOString(), niveau: "haut", produit_id: "p5",
  },
  {
    id: "n3", lu: false, type: "stock",
    message: "« Câble électrique 2,5 mm² » est sous son seuil minimum à WUGAMS Treichville.",
    created_at: new Date(Date.now() - 26 * 3_600_000).toISOString(), niveau: "moyen", produit_id: "p4",
  },
  {
    id: "n4", lu: false, type: "produit",
    message: "Une commande de réapprovisionnement est en cours pour « Plaque de plâtre 1,2×2,5 m ».",
    created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(), niveau: "info", produit_id: "p6",
  },
  {
    id: "n5", lu: true, type: "securite",
    message: "Une nouvelle connexion a été détectée sur votre compte fournisseur. Vérifiez que c'est bien vous.",
    created_at: new Date(Date.now() - 6 * 86_400_000).toISOString(), niveau: "moyen",
  },
  {
    id: "n6", lu: true, type: "info",
    message: "Bienvenue sur votre portail fournisseur WUGAMS. Vous pouvez suivre vos produits en temps réel.",
    created_at: new Date(Date.now() - 14 * 86_400_000).toISOString(), niveau: "info",
  },
];

function demoOverview(user: User | null): SupplierOverview {
  const profile: SupplierProfileView = {
    firstName: user?.first_name ?? "Bienvenue",
    lastName: user?.last_name ?? "",
    raisonSociale: user?.fournisseur_profile?.raison_sociale ?? "BatiPro CI",
    email: user?.email ?? "contact@batipro.ci",
    phone: user?.phone ?? "+225 27 21 00 45",
    adresse: "Zone industrielle, Abidjan",
    siret: "CI-123456789",
    twoFactor: user?.two_factor_enabled ?? false,
    fournisseurId: user?.fournisseur_profile?.id ?? "f-batipro",
  };
  const movements = aggregateMovements(demoProduits);
  return {
    source: "demo",
    updatedAt: Date.now(),
    profile,
    products: demoProduits,
    movements,
    notifications: { list: demoNotifications, unread: 4 },
    kpis: computeKpis(demoProduits, movements),
    filiales: [...new Map(demoProduits.filter((p) => p.filiale).map((p) => [p.filiale!.id, p.filiale!])).values()],
  };
}

/* ------------------------------------------------------------------ */
/* Chargement — BR-05 : jamais de fournisseur_id transmis à l'API      */
/* ------------------------------------------------------------------ */

export async function loadSupplierOverview(user: User | null): Promise<SupplierOverview> {
  const fournisseurId = user?.fournisseur_profile?.id ?? null;

  const [produitsResult, notificationsResult, unreadResult] = await Promise.allSettled([
    stocksApi.listProduits(),
    notificationsApi.listNotifications(),
    notificationsApi.unreadCount(),
  ]);

  const apiDown = produitsResult.status !== "fulfilled" && notificationsResult.status !== "fulfilled";

  if (apiDown) {
    return demoOverview(user);
  }

  const all = produitsResult.status === "fulfilled" ? produitsResult.value : [];
  /* Isolation stricte côté frontend en complément du filtrage API :
     on ne retient que les produits rattachés au fournisseur authentifié. */
  const own = fournisseurId ? all.filter((produit) => produit.fournisseur_id === fournisseurId) : [];

  const movements = aggregateMovements(own);
  const notifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
  const unread = unreadResult.status === "fulfilled" ? unreadResult.value : notifications.filter((n) => !n.lu).length;

  const profile: SupplierProfileView = {
    firstName: user?.first_name ?? "Fournisseur",
    lastName: user?.last_name ?? "",
    raisonSociale: user?.fournisseur_profile?.raison_sociale ?? null,
    email: user?.email ?? "",
    phone: user?.phone ?? null,
    adresse: null,
    siret: null,
    twoFactor: user?.two_factor_enabled ?? false,
    fournisseurId,
  };

  return {
    source: "api",
    updatedAt: Date.now(),
    profile,
    products: own,
    movements,
    notifications: { list: notifications.slice(0, 30), unread },
    kpis: computeKpis(own, movements),
    filiales: [...new Map(own.filter((p) => p.filiale).map((p) => [p.filiale!.id, p.filiale!])).values()],
  };
}

/* ------------------------------------------------------------------ */
/* Fiche produit — re-vérification d'appartenance (BR-05)              */
/* ------------------------------------------------------------------ */

export class SupplierForbiddenError extends Error {
  constructor() {
    super("forbidden");
    this.name = "SupplierForbiddenError";
  }
}

export async function loadSupplierProduct(productId: string, ownFournisseurId: string | null): Promise<Produit> {
  const produit = await stocksApi.getProduit(productId);
  if (ownFournisseurId && produit.fournisseur_id !== ownFournisseurId) {
    throw new SupplierForbiddenError();
  }
  return produit;
}

/* ------------------------------------------------------------------ */
/* API fournisseur — lecture seule uniquement                          */
/* ------------------------------------------------------------------ */

export const supplierApi = {
  getSupplierProducts: () => stocksApi.listProduits(),
  getSupplierProductById: (productId: string) => stocksApi.getProduit(productId),
  getNotifications: () => notificationsApi.listNotifications(),
  getUnreadNotificationCount: () => notificationsApi.unreadCount(),
  markNotificationAsRead: (notificationId: string) => notificationsApi.markAsRead(notificationId),
  setupTwoFactorAuthentication: () => authApi.setup2fa(),
  enableTwoFactorAuthentication: (token: string) => authApi.enable2fa(token),
};

export type { MouvementStock };
