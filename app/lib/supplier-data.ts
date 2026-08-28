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
  source: "api";
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
/* Chargement — BR-05 : jamais de fournisseur_id transmis à l'API      */
/* ------------------------------------------------------------------ */

export async function loadSupplierOverview(user: User | null): Promise<SupplierOverview> {
  const fournisseurId = user?.fournisseur_profile?.id ?? null;

  const [produitsResult, notificationsResult, unreadResult] = await Promise.allSettled([
    stocksApi.listProduits(),
    notificationsApi.listNotifications(),
    notificationsApi.unreadCount(),
  ]);

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
