import type { ClientProfile, FournisseurProfile, Filiale, Produit, Mission, Facture, User, RoleCode } from "@/app/lib/contracts";
import type { ModuleRow, ModuleStatus, StatusTone } from "@/app/lib/demo-data";
import { formatFcfa } from "@/app/lib/store-data";
import * as clientsApi from "@/app/lib/api/clients";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as filialesApi from "@/app/lib/api/filiales";
import * as stocksApi from "@/app/lib/api/stocks";
import * as missionsApi from "@/app/lib/api/missions";
import * as facturesApi from "@/app/lib/api/factures";
import * as usersApi from "@/app/lib/api/users";
import * as notificationsApi from "@/app/lib/api/notifications";

export type ModuleData = {
  rows: ModuleRow[];
  stats: { label: string; value: string }[];
  insights: { label: string; value: string }[];
};

export type ModuleDataSource = "api" | "demo";

export type ModuleLoadResult = { data: ModuleData; source: ModuleDataSource };

function status(label: string, tone: StatusTone): ModuleStatus {
  return { label, tone };
}

function formatDate(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

function fullName(first?: string | null, last?: string | null, fallback = "—"): string {
  return [first, last].filter(Boolean).join(" ") || fallback;
}

/* ------------------------------------------------------------------ */
/* Mappeurs entité → ligne UI                                          */
/* ------------------------------------------------------------------ */

export function clientRow(client: ClientProfile): ModuleRow {
  const user = client.user;
  return {
    client: fullName(user?.first_name, user?.last_name, user?.email ?? client.id.slice(0, 8)),
    type: client.type_client === "MEMBRE" ? "Client membre" : client.type_client === "STANDARD" ? "Client standard" : "Client",
    contact: user?.email ?? "—",
    activité: formatDate(client.updated_at, "Aucune"),
    statut: user?.is_active === false ? status("Inactif", "neutral") : status("Actif", "success"),
  };
}

export function fournisseurRow(fournisseur: FournisseurProfile): ModuleRow {
  return {
    fournisseur: fournisseur.raison_sociale ?? fullName(fournisseur.user?.first_name, fournisseur.user?.last_name),
    catégorie: "—",
    commande: "—",
    délai: "—",
    statut: fournisseur.user?.is_active === false ? status("Inactif", "neutral") : status("Actif", "success"),
  };
}

export function filialeRow(filiale: Filiale): ModuleRow {
  return {
    filiale: filiale.nom,
    domain: filiale.description ?? "—",
    manager: "—",
    effectif: "—",
    activité: "—",
    statut: filiale.is_active ? status("Active", "success") : status("Inactive", "neutral"),
  };
}

const produitStatuts: Record<string, ModuleStatus> = {
  DISPONIBLE: status("Disponible", "success"),
  REAPPROVISIONNEMENT_REQUIS: status("À commander", "warning"),
  COMMANDE_EN_COURS: status("Commande en cours", "info"),
  RUPTURE: status("Rupture", "danger"),
  ARCHIVE: status("Archivé", "neutral"),
};

export function produitRow(produit: Produit): ModuleRow {
  return {
    produit: `${produit.nom} · ${produit.reference}`,
    dépôt: produit.filiale?.nom ?? "—",
    disponible: `${produit.quantite_actuelle} unités`,
    seuil: `${produit.stock_minimum} unités`,
    statut: produitStatuts[produit.statut] ?? status(produit.statut, "neutral"),
  };
}

const missionStatuts: Record<string, ModuleStatus> = {
  PLANIFIE: status("Planifiée", "neutral"),
  NOTIFIE: status("Notifiée", "info"),
  ACCEPTE: status("Acceptée", "info"),
  EN_COURS: status("En cours", "info"),
  RAPPORT_SOUMIS: status("Rapport soumis", "warning"),
  VALIDE: status("Validée", "success"),
  TERMINE: status("Terminée", "success"),
  POINTAGE_A_VERIFIER: status("Pointage à vérifier", "danger"),
};

export function missionRow(mission: Mission): ModuleRow {
  return {
    mission: mission.titre,
    équipe: mission.ouvrier?.user ? fullName(mission.ouvrier.user.first_name, mission.ouvrier.user.last_name) : "—",
    lieu: mission.filiale?.nom ?? "—",
    créneau: formatDate(mission.date_planifiee, "Non planifiée"),
    statut: missionStatuts[mission.statut] ?? status(mission.statut, "neutral"),
  };
}

const factureStatuts: Record<string, ModuleStatus> = {
  BROUILLON: status("Brouillon", "neutral"),
  EMISE: status("Émise", "info"),
  PAYEE: status("Payée", "success"),
  EN_RETARD: status("En retard", "danger"),
  ANNULEE: status("Annulée", "neutral"),
};

export function factureRow(facture: Facture): ModuleRow {
  return {
    référence: facture.numero,
    client: facture.client ? fullName(facture.client.first_name, facture.client.last_name) : "—",
    montant: formatFcfa(Number(facture.montant_ttc)),
    date: formatDate(facture.date_echeance ?? facture.date_emission),
    statut: factureStatuts[facture.statut] ?? status(facture.statut, "neutral"),
  };
}

function userRow(user: User): ModuleRow {
  return {
    ouvrier: fullName(user.first_name, user.last_name, user.email),
    compétences: user.ouvrier_profile?.specialite ?? "—",
    équipe: "—",
    performance: "—",
    statut: user.is_active ? status("Actif", "success") : status("Inactif", "neutral"),
  };
}

function notificationRow(notification: unknown): ModuleRow {
  const record = notification as Record<string, unknown>;
  const message = (record.message ?? record.titre ?? "Notification") as string;
  return {
    notification: message,
    module: (record.type ?? "Système") as string,
    destinataire: "—",
    reçue: formatDate(record.created_at as string | null | undefined),
    statut: record.lu ? status("Lu", "neutral") : status("Non lue", "info"),
  };
}

/* ------------------------------------------------------------------ */
/* Chargement par module                                               */
/* ------------------------------------------------------------------ */

type Loader = () => Promise<ModuleData>;

const apiLoaders: Record<string, Loader> = {
  clients: async () => {
    const clients = await clientsApi.listClients();
    const membres = clients.filter((c) => c.type_client === "MEMBRE").length;
    const standards = clients.filter((c) => c.type_client === "STANDARD").length;
    return {
      rows: clients.map(clientRow),
      stats: [
        { label: "Clients API", value: String(clients.length) },
        { label: "Membres", value: String(membres) },
        { label: "Standards", value: String(standards) },
      ],
      insights: [
        { label: "Clients actifs", value: String(clients.filter((c) => c.user?.is_active !== false).length) },
        { label: "Adresses renseignées", value: String(clients.filter((c) => c.adresse).length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  fournisseurs: async () => {
    const fournisseurs = await fournisseursApi.listFournisseurs();
    return {
      rows: fournisseurs.map(fournisseurRow),
      stats: [
        { label: "Fournisseurs API", value: String(fournisseurs.length) },
        { label: "SIRET renseigné", value: String(fournisseurs.filter((f) => f.siret).length) },
        { label: "Avec coordonnées", value: String(fournisseurs.filter((f) => f.adresse).length) },
      ],
      insights: [
        { label: "Actifs", value: String(fournisseurs.filter((f) => f.user?.is_active !== false).length) },
        { label: "Raisons sociales", value: String(fournisseurs.filter((f) => f.raison_sociale).length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  filiales: async () => {
    const filiales = await filialesApi.listFiliales();
    return {
      rows: filiales.map(filialeRow),
      stats: [
        { label: "Filiales API", value: String(filiales.length) },
        { label: "Actives", value: String(filiales.filter((f) => f.is_active).length) },
        { label: "Sans description", value: String(filiales.filter((f) => !f.description).length) },
      ],
      insights: [
        { label: "Codes enregistrés", value: filiales.map((f) => f.code).join(" · ") },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  stocks: async () => {
    const produits = await stocksApi.listProduits();
    const actifs = produits.filter((p) => p.statut !== "ARCHIVE");
    const alertes = actifs.filter((p) => p.statut !== "DISPONIBLE");
    const valeur = actifs.reduce((sum, p) => sum + Number(p.prix_unitaire) * p.quantite_actuelle, 0);
    return {
      rows: produits.map(produitRow),
      stats: [
        { label: "Produits API", value: String(produits.length) },
        { label: "Alertes de seuil", value: String(alertes.length) },
        { label: "Valeur du stock", value: formatFcfa(valeur) },
      ],
      insights: [
        { label: "Disponibles", value: String(actifs.filter((p) => p.statut === "DISPONIBLE").length) },
        { label: "Ruptures", value: String(actifs.filter((p) => p.statut === "RUPTURE").length) },
        { label: "Archivés", value: String(produits.length - actifs.length) },
      ],
    };
  },
  missions: async () => {
    const missions = await missionsApi.listMissions();
    const enCours = missions.filter((m) => m.statut === "EN_COURS" || m.statut === "ACCEPTE" || m.statut === "NOTIFIE");
    const aValider = missions.filter((m) => m.statut === "RAPPORT_SOUMIS" || m.statut === "POINTAGE_A_VERIFIER" || m.statut === "VALIDE");
    return {
      rows: missions.map(missionRow),
      stats: [
        { label: "Missions API", value: String(missions.length) },
        { label: "En cours / notifiées", value: String(enCours.length) },
        { label: "À valider", value: String(aValider.length) },
      ],
      insights: [
        { label: "Terminées", value: String(missions.filter((m) => m.statut === "TERMINE").length) },
        { label: "Avec rapport", value: String(missions.filter((m) => m.rapport_texte).length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  devis: async () => {
    const factures = await facturesApi.listFactures();
    const payees = factures.filter((f) => f.statut === "PAYEE").length;
    const enAttente = factures.filter((f) => f.statut === "EMISE" || f.statut === "EN_RETARD").length;
    return {
      rows: factures.map(factureRow),
      stats: [
        { label: "Factures API", value: String(factures.length) },
        { label: "Payées", value: String(payees) },
        { label: "En attente", value: String(enAttente) },
      ],
      insights: [
        { label: "Numérotation auto", value: factures[0]?.numero ? "Active" : "—" },
        { label: "Exercice", value: String(factures[0]?.exercice_comptable ?? "—") },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  factures: async () => {
    const factures = await facturesApi.listFactures();
    const payees = factures.filter((f) => f.statut === "PAYEE").length;
    const enAttente = factures.filter((f) => f.statut === "EMISE" || f.statut === "EN_RETARD").length;
    return {
      rows: factures.map(factureRow),
      stats: [
        { label: "Factures API", value: String(factures.length) },
        { label: "Payées", value: String(payees) },
        { label: "En attente", value: String(enAttente) },
      ],
      insights: [
        { label: "Montant total TTC", value: formatFcfa(factures.reduce((sum, f) => sum + Number(f.montant_ttc), 0)) },
        { label: "Annulées", value: String(factures.filter((f) => f.statut === "ANNULEE").length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  ouvriers: async () => {
    const users = await usersApi.listUsers();
    const ouvriers = users.filter((u) => u.role === "ROLE_OUVRIER");
    return {
      rows: ouvriers.map(userRow),
      stats: [
        { label: "Ouvriers API", value: String(ouvriers.length) },
        { label: "Actifs", value: String(ouvriers.filter((u) => u.is_active).length) },
        { label: "Matriculés", value: String(ouvriers.filter((u) => u.ouvrier_profile?.matricule).length) },
      ],
      insights: [
        { label: "Spécialités renseignées", value: String(ouvriers.filter((u) => u.ouvrier_profile?.specialite).length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  notifications: async () => {
    const notifications = await notificationsApi.listNotifications();
    const unread = notifications.filter((n) => !n.lu).length;
    return {
      rows: notifications.map(notificationRow),
      stats: [
        { label: "Notifications API", value: String(notifications.length) },
        { label: "Non lues", value: String(unread) },
        { label: "Traitées", value: String(notifications.length - unread) },
      ],
      insights: [
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
};

export async function loadModuleData(slug: string, role: RoleCode): Promise<ModuleLoadResult> {
  const loader = apiLoaders[slug];
  if (!loader) return { data: { rows: [], stats: [], insights: [] }, source: "demo" };

  const usableRoles: RoleCode[] = ["ROLE_GERANT", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_DEV_DIGITAL", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR"];
  if (!usableRoles.includes(role)) return { data: { rows: [], stats: [], insights: [] }, source: "demo" };

  try {
    return { data: await loader(), source: "api" };
  } catch {
    return { data: { rows: [], stats: [], insights: [] }, source: "demo" };
  }
}
