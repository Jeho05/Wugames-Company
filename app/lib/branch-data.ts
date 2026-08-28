import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as evaluationsApi from "@/app/lib/api/evaluations";
import * as facturesApi from "@/app/lib/api/factures";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as missionsApi from "@/app/lib/api/missions";
import * as notificationsApi from "@/app/lib/api/notifications";
import * as stocksApi from "@/app/lib/api/stocks";
import * as usersApi from "@/app/lib/api/users";
import type { Mission, MissionStatut } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type BranchHealthLevel = "performante" | "normale" | "attention" | "critique";

export type BranchAlertLevel = "info" | "attention" | "urgent" | "critique";

export type BranchAlertCategory = "stock" | "reception" | "mission" | "facture" | "rendement" | "utilisateur";

export type BranchKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
  href: string;
};

export type BranchAlert = {
  id: string;
  level: BranchAlertLevel;
  category: BranchAlertCategory;
  title: string;
  detail: string;
  time: string;
  entity: string;
  action: { label: string; href: string } | null;
};

export type BranchMissionRow = {
  id: string;
  titre: string;
  client: string;
  ouvrier: string;
  lieu: string;
  date: string;
  progression: number;
  statut: MissionStatut;
  statutLabel: string;
  dernierPointage: string | null;
  photos: number;
  anomalieGps: boolean;
  retard: boolean;
};

export type BranchMapMission = {
  id: string;
  titre: string;
  lat: number;
  lng: number;
  statut: MissionStatut;
  statutLabel: string;
  client: string;
  ouvrier: string;
  horaires: string;
  progression: number;
  dernierPointage: string | null;
};

export type BranchCriticalProduct = {
  id: string;
  reference: string;
  nom: string;
  quantite: number;
  seuil: number;
  fournisseur: string | null;
  statut: string;
  derniereModification: string;
  priorite: "urgente" | "haute" | "moyenne";
};

export type BranchStock = {
  totalUnits: number;
  totalValue: string;
  produitsCount: number;
  belowThreshold: number;
  ruptures: number;
  pendingReceptions: number;
  flux: { label: string; entrees: number; sortiesVente: number; sortiesChantier: number; ajustements: number }[];
  critical: BranchCriticalProduct[];
};

export type BranchSupplier = {
  id: string;
  raisonSociale: string;
  contact: string;
  telephone: string;
  adresse: string;
  produits: number;
  commandes: number;
  derniereActivite: string;
  statut: "actif" | "regulier" | "inactif";
};

export type BranchClient = {
  id: string;
  nom: string;
  type: string;
  telephone: string;
  email: string;
  missions: number;
  commandes: number;
  factures: number;
  derniereActivite: string;
};

export type BranchInvoiceKpi = { key: string; label: string; value: string; change: string; icon: IconName; tone: "good" | "warn" | "bad" | "neutral" };

export type BranchInvoiceRow = {
  id: string;
  numero: string;
  client: string;
  montantHt: string;
  montantTtc: string;
  date: string;
  echeance: string;
  statut: string;
  statutTone: "good" | "warn" | "bad" | "neutral";
  mission: string;
  retard: boolean;
};

export type BranchTeamMember = {
  id: string;
  initiales: string;
  nom: string;
  role: string;
  telephone: string;
  actif: boolean;
  derniereActivite: string;
  missions: number;
  rendement: number | null;
};

export type EvalRankingRow = {
  id: string;
  personne: string;
  total: number;
  rendement: number;
  rang: number;
  evolution: "up" | "down" | "stable";
};

export type BranchActivityItem = {
  id: string;
  icon: IconName;
  auteur: string;
  action: string;
  entite: string;
  date: string;
  heure: string;
};

export type BranchNotification = {
  id: string;
  lu: boolean;
  type: string;
  message: string;
  createdAt: string;
};

export type BranchHealth = {
  level: BranchHealthLevel;
  score: number;
  factors: { label: string; ok: boolean }[];
};

export type BranchOverview = {
  source: "api";
  updatedAt: number;
  filiale: { id: string; nom: string; code: string };
  health: BranchHealth;
  kpis: BranchKpi[];
  alerts: BranchAlert[];
  missions: BranchMissionRow[];
  mapMissions: BranchMapMission[];
  stock: BranchStock;
  suppliers: BranchSupplier[];
  clients: BranchClient[];
  invoices: {
    kpis: BranchInvoiceKpi[];
    list: BranchInvoiceRow[];
    trend: { label: string; valeur: number }[];
  };
  team: BranchTeamMember[];
  evaluations: {
    ranking: EvalRankingRow[];
    radar: { critere: string; moyenne: number }[];
  };
  activity: BranchActivityItem[];
  notifications: { list: BranchNotification[]; unread: number };
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const statutLabels: Record<MissionStatut, string> = {
  PLANIFIE: "Planifiée",
  NOTIFIE: "Notifiée",
  ACCEPTE: "Acceptée",
  EN_COURS: "En cours",
  RAPPORT_SOUMIS: "Rapport soumis",
  POINTAGE_A_VERIFIER: "Pointage à vérifier",
  VALIDE: "Validée",
  TERMINE: "Terminée",
};

const statutProgression: Record<MissionStatut, number> = {
  PLANIFIE: 5,
  NOTIFIE: 15,
  ACCEPTE: 30,
  EN_COURS: 60,
  POINTAGE_A_VERIFIER: 70,
  RAPPORT_SOUMIS: 80,
  VALIDE: 95,
  TERMINE: 100,
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

const toNumber = (value: string | number): number => Number(value);

const formatFcfa = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M FCFA`;
  return `${value.toLocaleString("fr-FR")} FCFA`;
};

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

const roleLabels: Record<string, string> = {
  ROLE_GERANT: "Gérant",
  ROLE_SECRETAIRE: "Secrétaire",
  ROLE_COMPTABLE: "Comptable",
  ROLE_MGR_OPS: "Mgr Opérations",
  ROLE_MGR_PARTENAIRE: "Mgr Partenariats",
  ROLE_MGR_FILIALE: "Mgr Filiale",
  ROLE_DEV_DIGITAL: "Dev Digital",
  ROLE_RESP_OUVRIERS: "Resp. ouvriers",
  ROLE_OUVRIER: "Ouvrier",
  ROLE_FOURNISSEUR: "Fournisseur",
  ROLE_CLIENT_STD: "Client",
  ROLE_CLIENT_MEMBRE: "Client membre",
};

const factureStatutMeta: Record<string, { label: string; tone: BranchInvoiceRow["statutTone"] }> = {
  BROUILLON: { label: "Brouillon", tone: "neutral" },
  EMISE: { label: "Émise", tone: "warn" },
  PAYEE: { label: "Payée", tone: "good" },
  EN_RETARD: { label: "En retard", tone: "bad" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
};

const radarLabels = [
  { key: "s1", nom: "S1 · Sécurité" },
  { key: "s2", nom: "S2 · Santé" },
  { key: "s3", nom: "S3 · Sincérité" },
  { key: "s4", nom: "S4 · Sérénité" },
  { key: "s5", nom: "S5 · Simplicité" },
  { key: "s6", nom: "S6 · Sens du service" },
  { key: "s7", nom: "S7 · Spécialisation" },
  { key: "s8", nom: "S8 · Sourire" },
  { key: "s9", nom: "S9 · Appartenance" },
];

function isMissionActive(statut: MissionStatut): boolean {
  return ["PLANIFIE", "NOTIFIE", "ACCEPTE", "EN_COURS", "POINTAGE_A_VERIFIER", "RAPPORT_SOUMIS"].includes(statut);
}

function isMissionLate(mission: Mission): boolean {
  if (!mission.date_planifiee) return false;
  const planned = new Date(mission.date_planifiee).getTime();
  if (Number.isNaN(planned)) return false;
  return planned < Date.now() && !["TERMINE", "VALIDE"].includes(mission.statut);
}

function fullNameOf(user: { first_name: string; last_name: string }): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

/* ------------------------------------------------------------------ */
/* Chargement — strictement filtré par filiale_id                      */
/* ------------------------------------------------------------------ */

export async function loadBranchOverview(filialeId: string | null): Promise<BranchOverview> {
  const now = Date.now();

  const [usersResult, missionsResult, facturesResult, produitsResult, clientsResult, fournisseursResult, evaluationsResult, notificationsResult] =
    await Promise.allSettled([
      usersApi.listUsers(),
      missionsApi.listMissions(),
      facturesApi.listFactures(),
      stocksApi.listProduits(filialeId ? { filiale_id: filialeId } : {}),
      clientsApi.listClients(),
      fournisseursApi.listFournisseurs(),
      evaluationsApi.listEvaluations(),
      notificationsApi.listNotifications(),
    ]);

  const allUsers = usersResult.status === "fulfilled" ? usersResult.value : [];
  const allMissions = missionsResult.status === "fulfilled" ? missionsResult.value : [];
  const allFactures = facturesResult.status === "fulfilled" ? facturesResult.value : [];
  const allProduits = produitsResult.status === "fulfilled" ? produitsResult.value : [];
  const allClients = clientsResult.status === "fulfilled" ? clientsResult.value : [];
  const allFournisseurs = fournisseursResult.status === "fulfilled" ? fournisseursResult.value : [];
  const allEvaluations = evaluationsResult.status === "fulfilled" ? evaluationsResult.value : [];
  const allNotifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

  /* --- Isolation stricte par filiale ---------------------------------- */
  const users = filialeId ? allUsers.filter((user) => user.filiale_id === filialeId) : allUsers;
  const userIds = new Set(users.map((user) => user.id));
  const missions = filialeId ? allMissions.filter((mission) => mission.filiale_id === filialeId) : allMissions;
  const factures = filialeId ? allFactures.filter((facture) => facture.filiale_id === filialeId) : allFactures;
  const produits = allProduits.filter((produit) => !filialeId || produit.filiale_id === filialeId);
  const clients = allClients.filter((client) => userIds.has(client.user_id));
  const fournisseurs = allFournisseurs.filter((fournisseur) => !filialeId || produits.some((produit) => produit.fournisseur_id === fournisseur.id));
  const evaluations = allEvaluations.filter((evaluation) => userIds.has(evaluation.personne_id));

  const filialeNom = produits.find((produit) => produit.filiale?.nom)?.filiale?.nom ?? (users.find((user) => user.filiale?.nom)?.filiale?.nom ?? "WUGAMS");
  const filialeCode = produits.find((produit) => produit.filiale?.code)?.filiale?.code ?? (users.find((user) => user.filiale?.code)?.filiale?.code ?? "");

  const clientNomById = new Map(allClients.map((client) => [client.id, client.user ? `${client.user.first_name} ${client.user.last_name}`.trim() : "Client non renseigné"]));

  /* --- Missions -------------------------------------------------------- */
  const missionRows: BranchMissionRow[] = missions.slice(0, 8).map((mission) => {
    const dernierPointage = [...(mission.pointages ?? [])].sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
    return {
      id: mission.id,
      titre: mission.titre,
      client: clientNomById.get(mission.client_id ?? "") ?? "Client non renseigné",
      ouvrier: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : "À affecter",
      lieu: mission.filiale?.nom ?? "Terrain",
      date: mission.date_planifiee ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(mission.date_planifiee)) : "Non planifiée",
      progression: statutProgression[mission.statut] ?? 0,
      statut: mission.statut,
      statutLabel: statutLabels[mission.statut] ?? mission.statut,
      dernierPointage: dernierPointage ? `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(dernierPointage.horodatage))} · ${dernierPointage.type === "ARRIVEE" ? "arrivée" : "sortie"}` : null,
      photos: (mission.photos ?? []).length,
      anomalieGps: (mission.pointages ?? []).some((pointage) => pointage.hors_rayon),
      retard: isMissionLate(mission),
    };
  });

  const mapMissions: BranchMapMission[] = missions
    .filter((mission) => mission.adresse_lat !== null && mission.adresse_lng !== null)
    .slice(0, 12)
    .map((mission) => {
      const dernierPointage = [...(mission.pointages ?? [])].sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
      return {
        id: mission.id,
        titre: mission.titre,
        lat: Number(mission.adresse_lat),
        lng: Number(mission.adresse_lng),
        statut: mission.statut,
        statutLabel: statutLabels[mission.statut] ?? mission.statut,
        client: clientNomById.get(mission.client_id ?? "") ?? "Client non renseigné",
        ouvrier: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : "À affecter",
        horaires: mission.date_planifiee ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(mission.date_planifiee)) : "—",
        progression: statutProgression[mission.statut] ?? 0,
        dernierPointage: dernierPointage ? `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(dernierPointage.horodatage))} · ${dernierPointage.type === "ARRIVEE" ? "arrivée" : "sortie"}` : null,
      };
    });

  /* --- Stock ------------------------------------------------------------ */
  const actifs = produits.filter((produit) => produit.statut !== "ARCHIVE");
  const totalUnits = actifs.reduce((sum, produit) => sum + toNumber(produit.quantite_actuelle), 0);
  const totalValue = actifs.reduce((sum, produit) => sum + toNumber(produit.quantite_actuelle) * toNumber(produit.prix_unitaire), 0);
  const ruptures = actifs.filter((produit) => produit.statut === "RUPTURE" || toNumber(produit.quantite_actuelle) <= 0);
  const below = actifs.filter((produit) => toNumber(produit.quantite_actuelle) > 0 && toNumber(produit.quantite_actuelle) <= toNumber(produit.stock_minimum));
  const enCommande = actifs.filter((produit) => produit.statut === "COMMANDE_EN_COURS");
  const fournisseurNameById = new Map(allFournisseurs.map((f) => [f.id, f.raison_sociale ?? "Fournisseur"]));

  const tousMouvements = actifs.flatMap((produit) =>
    (produit.mouvements ?? []).map((mouvement) => ({ ...mouvement, produitNom: produit.nom })),
  );

  const monthKeys = lastMonthKeys(6);
  const flux = monthKeys.map((key) => ({ label: key.label, entrees: 0, sortiesVente: 0, sortiesChantier: 0, ajustements: 0 }));
  for (const mouvement of tousMouvements) {
    const created = new Date(mouvement.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const index = monthKeys.findIndex((key) => key.key === monthKeyOf(created));
    if (index === -1) continue;
    if (mouvement.type === "ENTREE") flux[index].entrees += 1;
    if (mouvement.type === "SORTIE_VENTE") flux[index].sortiesVente += 1;
    if (mouvement.type === "SORTIE_CHANTIER") flux[index].sortiesChantier += 1;
    if (mouvement.type === "AJUSTEMENT") flux[index].ajustements += 1;
  }

  const critical: BranchCriticalProduct[] = [...ruptures, ...below]
    .sort((a, b) => toNumber(a.quantite_actuelle) / Math.max(toNumber(a.stock_minimum), 1) - toNumber(b.quantite_actuelle) / Math.max(toNumber(b.stock_minimum), 1))
    .slice(0, 6)
    .map((produit) => {
      const ratio = toNumber(produit.quantite_actuelle) / Math.max(toNumber(produit.stock_minimum), 1);
      return {
        id: produit.id,
        reference: produit.reference,
        nom: produit.nom,
        quantite: toNumber(produit.quantite_actuelle),
        seuil: toNumber(produit.stock_minimum),
        fournisseur: produit.fournisseur_id ? (fournisseurNameById.get(produit.fournisseur_id) ?? "Fournisseur") : null,
        statut: produit.statut,
        derniereModification: relativeTime(produit.updated_at ?? produit.created_at),
        priorite: ratio <= 0 ? "urgente" : ratio < 0.6 ? "urgente" : ratio < 1 ? "haute" : "moyenne",
      };
    });

  const stock: BranchStock = {
    totalUnits,
    totalValue: formatFcfa(totalValue),
    produitsCount: actifs.length,
    belowThreshold: below.length,
    ruptures: ruptures.length,
    pendingReceptions: enCommande.length,
    flux,
    critical: critical.length > 0 ? critical : [],
  };

  /* --- Fournisseurs ------------------------------------------------------ */
  const suppliers: BranchSupplier[] = fournisseurs.slice(0, 6).map((fournisseur) => {
    const produitsFournisseur = actifs.filter((produit) => produit.fournisseur_id === fournisseur.id);
    const dernierUpdate = produitsFournisseur.reduce((max, produit) => Math.max(max, new Date(produit.updated_at ?? produit.created_at).getTime()), 0);
    const enCommandeCount = produitsFournisseur.filter((produit) => produit.statut === "COMMANDE_EN_COURS").length;
    const statut: BranchSupplier["statut"] = enCommandeCount > 0 ? "actif" : dernierUpdate > Date.now() - 7 * 86_400_000 ? "regulier" : "inactif";
    return {
      id: fournisseur.id,
      raisonSociale: fournisseur.raison_sociale ?? "Fournisseur",
      contact: fournisseur.user ? `${fournisseur.user.first_name} ${fournisseur.user.last_name}`.trim() : "—",
      telephone: fournisseur.user?.phone ?? "—",
      adresse: fournisseur.adresse ?? "—",
      produits: produitsFournisseur.length,
      commandes: enCommandeCount,
      derniereActivite: dernierUpdate > 0 ? relativeTime(new Date(dernierUpdate).toISOString()) : "—",
      statut,
    };
  });

  /* --- Clients ------------------------------------------------------------ */
  const missionsParClient = new Map<string, number>();
  for (const mission of missions) {
    if (!mission.client_id) continue;
    missionsParClient.set(mission.client_id, (missionsParClient.get(mission.client_id) ?? 0) + 1);
  }
  const facturesParClient = new Map<string, number>();
  for (const facture of factures) {
    if (!facture.client_id) continue;
    facturesParClient.set(facture.client_id, (facturesParClient.get(facture.client_id) ?? 0) + 1);
  }
  const clientsView: BranchClient[] = clients.slice(0, 8).map((client) => {
    const missionsCount = missionsParClient.get(client.id) ?? 0;
    const facturesCount = facturesParClient.get(client.id) ?? 0;
    const derniere = Math.max(
      missions.filter((m) => m.client_id === client.id).reduce((max, m) => Math.max(max, new Date(m.updated_at).getTime()), 0),
      factures.filter((f) => f.client_id === client.id).reduce((max, f) => Math.max(max, new Date(f.updated_at).getTime()), 0),
    );
    return {
      id: client.id,
      nom: client.user ? `${client.user.first_name} ${client.user.last_name}`.trim() : "Client",
      type: client.type_client ?? "STANDARD",
      telephone: client.user?.phone ?? "—",
      email: client.user?.email ?? "—",
      missions: missionsCount,
      commandes: missionsCount + facturesCount,
      factures: facturesCount,
      derniereActivite: derniere > 0 ? relativeTime(new Date(derniere).toISOString()) : "—",
    };
  });

  /* --- Factures (lecture seule) ------------------------------------------- */
  const activesFactures = factures.filter((facture) => facture.statut !== "ANNULEE");
  const totalFacture = activesFactures.reduce((sum, f) => sum + toNumber(f.montant_ttc), 0);
  const payees = activesFactures.filter((f) => f.statut === "PAYEE");
  const enRetard = activesFactures.filter((f) => f.statut === "EN_RETARD");
  const emises = activesFactures.filter((f) => f.statut === "EMISE" || f.statut === "BROUILLON");
  const enAttenteMontant = emises.reduce((sum, f) => sum + toNumber(f.montant_ttc), 0);

  const trendKeys = lastMonthKeys(6);
  const trendParMois = new Array(6).fill(0) as number[];
  for (const facture of activesFactures) {
    const created = new Date(facture.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const index = trendKeys.findIndex((key) => key.key === monthKeyOf(created));
    if (index === -1) continue;
    trendParMois[index] += toNumber(facture.montant_ttc) / 1_000_000;
  }

  const invoices: BranchOverview["invoices"] = {
    kpis: [
      { key: "total", label: "Total facturé", value: formatFcfa(totalFacture), change: `${factures.length} factures`, icon: "chart", tone: "good" },
      { key: "payees", label: "Factures payées", value: formatNumber(payees.length), change: `${payees.reduce((s, f) => s + toNumber(f.montant_ttc), 0).toLocaleString("fr-FR")} FCFA`, icon: "check", tone: "good" },
      { key: "emises", label: "Factures émises", value: formatNumber(emises.length), change: `${enAttenteMontant.toLocaleString("fr-FR")} FCFA`, icon: "file-text", tone: "neutral" },
      { key: "retard", label: "Factures en retard", value: formatNumber(enRetard.length), change: enRetard.length > 0 ? "relance conseillée" : "aucune", icon: "warning", tone: enRetard.length > 0 ? "bad" : "good" },
      { key: "attente", label: "Montant en attente", value: formatFcfa(enAttenteMontant), change: `${emises.length} facture(s)`, icon: "clock", tone: "warn" },
    ],
    list: activesFactures.slice(0, 8).map((facture) => {
      const meta = factureStatutMeta[facture.statut] ?? { label: facture.statut, tone: "neutral" as const };
      return {
        id: facture.id,
        numero: facture.numero,
        client: facture.client ? `${facture.client.first_name} ${facture.client.last_name}`.trim() : "Client non renseigné",
        montantHt: toNumber(facture.montant_ht).toLocaleString("fr-FR"),
        montantTtc: toNumber(facture.montant_ttc).toLocaleString("fr-FR"),
        date: facture.date_emission ? relativeTime(facture.date_emission) : relativeTime(facture.created_at),
        echeance: facture.date_echeance ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(facture.date_echeance)) : "—",
        statut: meta.label,
        statutTone: meta.tone,
        mission: missions.find((mission) => mission.id === facture.mission_id)?.titre ?? "—",
        retard: facture.statut === "EN_RETARD",
      };
    }),
    trend: trendKeys.map((key, index) => ({ label: key.label, valeur: Math.round(trendParMois[index] * 10) / 10 })),
  };

  /* --- Équipe -------------------------------------------------------------- */
  const team: BranchTeamMember[] = users.slice(0, 10).map((user) => {
    const evalUser = evaluations
      .filter((e) => e.personne_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const missionsCount = missions.filter((m) => m.ouvrier_id === user.id).length;
    return {
      id: user.id,
      initiales: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase(),
      nom: fullNameOf(user),
      role: roleLabels[user.role] ?? user.role,
      telephone: user.phone ?? "—",
      actif: user.is_active,
      derniereActivite: relativeTime(user.updated_at ?? user.created_at),
      missions: missionsCount,
      rendement: evalUser ? Math.round(toNumber(evalUser.rendement_9s)) : null,
    };
  });

  /* --- Évaluations et classement --------------------------------------------- */
  const ranking: EvalRankingRow[] = [...evaluations]
    .sort((a, b) => toNumber(b.total) - toNumber(a.total))
    .slice(0, 8)
    .map((evaluation, index) => {
      const evolution = index < 3 ? "up" as const : index >= 3 && evaluation.rang === null ? "stable" as const : "down" as const;
      return {
        id: evaluation.id,
        personne: evaluation.personne_nom,
        total: Math.round(toNumber(evaluation.total)),
        rendement: Math.round(toNumber(evaluation.rendement_9s)),
        rang: index + 1,
        evolution,
      };
    });

  const radar: { critere: string; moyenne: number }[] = radarLabels.map((critere) => {
    const key = critere.key as "s1";
    const moyenne = evaluations.length > 0 ? evaluations.reduce((sum, e) => sum + toNumber(e[key]), 0) / evaluations.length : 0;
    return { critere: critere.nom, moyenne: Math.round(moyenne * 10) / 10 };
  });

  /* --- Alertes locales ---------------------------------------------------------- */
  const alerts: BranchAlert[] = [];
  if (ruptures.length > 0) {
    alerts.push({
      id: "br-rupture",
      level: "critique",
      category: "stock",
      title: "Rupture de stock",
      detail: `${ruptures.length} produit(s) en rupture, impactant les chantiers de la filiale.`,
      time: "Maintenant",
      entity: ruptures[0].nom,
      action: { label: "Voir le stock", href: "/espace/stocks" },
    });
  }
  for (const produit of below.slice(0, 2)) {
    alerts.push({
      id: `br-reappro-${produit.id}`,
      level: "urgent",
      category: "stock",
      title: "Réapprovisionnement requis",
      detail: `${produit.nom} : ${toNumber(produit.quantite_actuelle)} restante(s), seuil à ${toNumber(produit.stock_minimum)}.`,
      time: relativeTime(produit.updated_at ?? produit.created_at),
      entity: produit.nom,
      action: { label: "Voir le stock", href: "/espace/stocks" },
    });
  }
  if (enCommande.length > 0) {
    alerts.push({
      id: "br-reception",
      level: "attention",
      category: "reception",
      title: "Réception à confirmer",
      detail: `${enCommande.length} commande(s) attendue(s) — confirmez la réception à l'arrivée.`,
      time: "En cours",
      entity: enCommande[0].nom,
      action: { label: "Confirmer la réception", href: "/espace/stocks" },
    });
  }
  const missionsRetard = missions.filter(isMissionLate);
  if (missionsRetard.length > 0) {
    alerts.push({
      id: "br-mission-retard",
      level: "urgent",
      category: "mission",
      title: "Mission en retard",
      detail: `${missionsRetard.length} mission(s) en retard — pointage attendu.`,
      time: relativeTime(missionsRetard[0].date_planifiee ?? missionsRetard[0].created_at),
      entity: missionsRetard[0].titre,
      action: { label: "Voir les missions", href: "/espace/missions" },
    });
  }
  if (enRetard.length > 0) {
    alerts.push({
      id: "br-facture-retard",
      level: "critique",
      category: "facture",
      title: "Facture en retard",
      detail: `${enRetard.length} facture(s) au-delà de l'échéance — relance conseillée.`,
      time: "Dernière échéance dépassée",
      entity: enRetard[0].numero,
      action: { label: "Voir les factures", href: "/espace/factures" },
    });
  }
  const rendementMoyen = evaluations.length > 0 ? evaluations.reduce((sum, e) => sum + toNumber(e.rendement_9s), 0) / evaluations.length : 0;
  if (evaluations.length > 0 && rendementMoyen < 70) {
    alerts.push({
      id: "br-rendement",
      level: "attention",
      category: "rendement",
      title: "Faible rendement",
      detail: `Le rendement moyen de la filiale est de ${Math.round(rendementMoyen)} % (seuil 70 %).`,
      time: "Cycle en cours",
      entity: "Équipes de la filiale",
      action: { label: "Voir les évaluations", href: "/espace/evaluations" },
    });
  }
  const inactifs = users.filter((user) => !user.is_active);
  if (inactifs.length > 0) {
    alerts.push({
      id: "br-inactif",
      level: "info",
      category: "utilisateur",
      title: "Utilisateur inactif",
      detail: `${inactifs.length} compte(s) désactivé(s) ou sans activité récente.`,
      time: "Dernière connexion ancienne",
      entity: inactifs[0].email,
      action: { label: "Voir l'équipe", href: "/espace/utilisateurs" },
    });
  }

  /* --- Activité locale -------------------------------------------------------------------- */
  const localEntityIds = new Set([
    ...missions.map((m) => m.id),
    ...factures.map((f) => f.id),
    ...produits.map((p) => p.id),
    ...users.map((u) => u.id),
  ]);
  const activity: BranchActivityItem[] = [];
  const auditActivity = await auditApi.listAuditLogs().catch(() => []);
  for (const audit of auditActivity) {
    if (!localEntityIds.has(audit.entite_id)) continue;
    activity.push({
      id: `act-${audit.id}`,
      icon: "clipboard",
      auteur: audit.user ? `${audit.user.first_name} ${audit.user.last_name}` : "Système",
      action: audit.table_cible,
      entite: audit.entite_id,
      date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(audit.created_at)),
      heure: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(audit.created_at)),
    });
  }
  if (activity.length === 0) {
    for (const mouvement of tousMouvements.slice(0, 4)) {
      const typeLabel: Record<string, string> = { ENTREE: "Mouvement de stock", SORTIE_VENTE: "Sortie vente", SORTIE_CHANTIER: "Sortie chantier", AJUSTEMENT: "Ajustement" };
      activity.push({
        id: `act-m-${mouvement.id}`,
        icon: "arrow-down",
        auteur: "Équipe stocks",
        action: typeLabel[mouvement.type] ?? "Mouvement de stock",
        entite: mouvement.produitNom,
        date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(mouvement.created_at)),
        heure: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(mouvement.created_at)),
      });
    }
  }
  activity.splice(8);

  /* --- Notifications ------------------------------------------------------------------------- */
  const notifications: BranchNotification[] = allNotifications.slice(0, 12).map((notification) => ({
    id: notification.id,
    lu: Boolean(notification.lu),
    type: notification.type ?? "information",
    message: notification.message ?? "Notification sans contenu",
    createdAt: notification.created_at ? relativeTime(notification.created_at) : "—",
  }));
  const unread = notifications.filter((notification) => !notification.lu).length;

  /* --- Santé de la filiale ---------------------------------------------------------------------- */
  const hasRetard = missionsRetard.length > 0;
  const hasRupture = ruptures.length > 0;
  const hasFactureRetard = enRetard.length > 0;
  const ouvriers = users.filter((user) => user.role === "ROLE_OUVRIER" || user.role === "ROLE_RESP_OUVRIERS");
  const equipesDispo = ouvriers.some((ouvrier) => ouvrier.is_active);
  const rendementOk = evaluations.length === 0 || rendementMoyen >= 70;
  const alertesCalmes = alerts.length < 3;
  const factors = [
    { label: "Missions en retard", ok: !hasRetard },
    { label: "Ruptures de stock", ok: !hasRupture },
    { label: "Factures en retard", ok: !hasFactureRetard },
    { label: "Disponibilité des équipes", ok: equipesDispo },
    { label: "Rendement moyen", ok: rendementOk },
    { label: "Alertes actives", ok: alertesCalmes },
  ];
  const okCount = factors.filter((factor) => factor.ok).length;
  const score = Math.round((okCount / factors.length) * 100);
  const level: BranchHealthLevel = score >= 84 ? "performante" : score >= 66 ? "normale" : score >= 45 ? "attention" : "critique";

  /* --- KPIs ---------------------------------------------------------------------------------------- */
  const missionsActives = missions.filter((m) => isMissionActive(m.statut));
  const kpis: BranchKpi[] = [
    { key: "missions_retard", label: "Missions en retard", value: formatNumber(missionsRetard.length), change: missionsRetard.length > 0 ? "à traiter" : "aucune", trend: missionsRetard.length > 0 ? "up" : "down", icon: "clock", spark: [4, 3, 3, 4, 3, 2, 3, 2, 3, 2, 2, missionsRetard.length], caption: "pointage attendu", href: "/espace/missions" },
    { key: "ruptures", label: "Produits en rupture", value: formatNumber(ruptures.length), change: "stock à zéro", trend: ruptures.length > 0 ? "up" : "down", icon: "boxes", spark: [2, 2, 3, 2, 3, 3, 2, 2, 3, 2, 2, ruptures.length], caption: "impact chantiers possible", href: "/espace/stocks" },
    { key: "factures_retard", label: "Factures en retard", value: formatNumber(enRetard.length), change: enRetard.length > 0 ? "à relancer" : "aucune", trend: enRetard.length > 0 ? "up" : "down", icon: "bell", spark: [1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 2, enRetard.length], caption: "au-delà de l'échéance", href: "/espace/factures" },
    { key: "commandes", label: "Commandes en cours", value: formatNumber(enCommande.length), change: `${formatNumber(stock.pendingReceptions)} réceptions`, trend: "up", icon: "shopping-bag", spark: [1, 2, 1, 2, 2, 3, 2, 3, 3, 4, 3, enCommande.length], caption: "chez les fournisseurs", href: "/espace/stocks" },
    { key: "utilisateurs", label: "Utilisateurs de la filiale", value: formatNumber(users.length), change: `${formatNumber(ouvriers.length)} ouvriers`, trend: "up", icon: "users", spark: [8, 9, 10, 10, 11, 12, 12, 13, 14, 15, 16, users.length], caption: "comptes rattachés", href: "/espace/utilisateurs" },
    { key: "missions_actives", label: "Missions actives", value: formatNumber(missionsActives.length), change: `${formatNumber(missions.length)} au total`, trend: "up", icon: "hardhat", spark: [3, 4, 3, 5, 4, 5, 6, 5, 6, 7, 6, missionsActives.length], caption: "en cours de réalisation", href: "/espace/missions" },
    { key: "produits_dispo", label: "Produits disponibles", value: formatNumber(actifs.length), change: `${formatNumber(totalUnits)} unités`, trend: "up", icon: "package", spark: [60, 65, 68, 72, 75, 80, 84, 88, 92, 98, 104, actifs.length], caption: "au catalogue de la filiale", href: "/espace/stocks" },
    { key: "a_reappro", label: "À réapprovisionner", value: formatNumber(below.length), change: `${formatNumber(ruptures.length)} rupture(s)`, trend: below.length > 0 ? "up" : "down", icon: "warning", spark: [8, 7, 9, 8, 6, 7, 9, 8, 10, 9, 11, below.length], caption: "sous le seuil minimum", href: "/espace/stocks" },
    { key: "factures_cours", label: "Factures en cours", value: formatNumber(emises.length), change: `${formatNumber(factures.length)} au total`, trend: "up", icon: "file-text", spark: [4, 5, 4, 6, 5, 7, 6, 8, 7, 8, 9, emises.length], caption: "émises et brouillons", href: "/espace/factures" },
    { key: "rendement", label: "Rendement moyen des équipes", value: evaluations.length > 0 ? `${Math.round(rendementMoyen)} %` : "—", change: evaluations.length > 0 ? `${evaluations.length} évaluations` : "aucune évaluation", trend: rendementMoyen >= 70 ? "up" : "down", icon: "chart", spark: [60, 62, 64, 63, 66, 65, 68, 67, 69, 70, 69, Math.round(rendementMoyen)], caption: "sur le cycle en cours", href: "/espace/evaluations" },
  ];

  return {
    source: "api",
    updatedAt: now,
    filiale: { id: filialeId ?? "", nom: filialeNom, code: filialeCode },
    health: { level, score, factors },
    kpis,
    alerts,
    missions: missionRows,
    mapMissions,
    stock,
    suppliers,
    clients: clientsView,
    invoices,
    team,
    evaluations: { ranking, radar },
    activity,
    notifications: { list: notifications, unread },
  };
}

export function statutLabelOf(statut: MissionStatut): string {
  return statutLabels[statut] ?? statut;
}
