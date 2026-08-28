import type {
  Chantier,
  ClientDocument,
  ClientProfile,
  ClientProjet,
  Commande,
  Conversation,
  Devis,
  DemandeDevis,
  FournisseurProfile,
  Filiale,
  Manager,
  Mission,
  Facture,
  Produit,
  User,
  RoleCode,
} from "@/app/lib/contracts";
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
import * as devisApi from "@/app/lib/api/devis";
import * as chantiersApi from "@/app/lib/api/chantiers";
import * as commandesApi from "@/app/lib/api/commandes";
import * as messagerieApi from "@/app/lib/api/messagerie";
import * as managersApi from "@/app/lib/api/managers";
import * as clientSpaceApi from "@/app/lib/api/client-space";

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
    id: mission.id,
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

const devisStatuts: Record<string, ModuleStatus> = {
  BROUILLON: status("Brouillon", "neutral"),
  ENVOYE: status("Envoyé", "info"),
  SIGNE: status("Signé", "success"),
  REFUSE: status("Refusé", "danger"),
  EXPIRE: status("Expiré", "neutral"),
};

const chantierStatuts: Record<string, ModuleStatus> = {
  PLANIFIE: status("Planifié", "neutral"),
  EN_COURS: status("En cours", "info"),
  SUSPENDU: status("Suspendu", "warning"),
  TERMINE: status("Terminé", "success"),
  ANNULE: status("Annulé", "neutral"),
};

const commandeStatuts: Record<string, ModuleStatus> = {
  EN_ATTENTE: status("En attente", "info"),
  EN_PREPARATION: status("En préparation", "info"),
  EXPEDIEE: status("Expédiée", "info"),
  LIVREE: status("Livrée", "success"),
  ANNULEE: status("Annulée", "neutral"),
};

const demandeStatuts: Record<string, ModuleStatus> = {
  RECUE: status("Reçue", "neutral"),
  EN_COURS: status("En cours", "info"),
  A_CONFIRMER: status("À confirmer", "warning"),
  TERMINEE: status("Terminée", "success"),
};

const roleLabels: Record<string, string> = {
  ROLE_MGR_OPS: "Manager Opérations",
  ROLE_MGR_PARTENAIRE: "Manager Partenariats",
  ROLE_MGR_FILIALE: "Manager de Filiale",
  ROLE_RESP_OUVRIERS: "Responsable Ouvriers",
  ROLE_SECRETAIRE: "Secrétaire",
  ROLE_COMPTABLE: "Comptable",
  ROLE_DEV_DIGITAL: "Dev Digital",
  ROLE_GERANT: "Gérant",
};

const MANAGER_ROLES: string[] = [
  "ROLE_MGR_OPS",
  "ROLE_MGR_PARTENAIRE",
  "ROLE_MGR_FILIALE",
  "ROLE_RESP_OUVRIERS",
  "ROLE_SECRETAIRE",
  "ROLE_COMPTABLE",
  "ROLE_DEV_DIGITAL",
];

export function devisRow(devis: Devis): ModuleRow {
  return {
    référence: devis.numero,
    client: devis.client ? fullName(devis.client.first_name, devis.client.last_name) : "—",
    montant: formatFcfa(Number(devis.montant_ttc)),
    date: formatDate(devis.date_validite, "Sans limite"),
    statut: devisStatuts[devis.statut] ?? status(devis.statut, "neutral"),
  };
}

export function chantierRow(chantier: Chantier): ModuleRow {
  return {
    chantier: chantier.titre,
    client: chantier.client ? fullName(chantier.client.first_name, chantier.client.last_name) : "—",
    responsable: "—",
    échéance: formatDate(chantier.date_fin_prevue, "—"),
    statut: chantierStatuts[chantier.statut] ?? status(chantier.statut, "neutral"),
  };
}

export function commandeRow(commande: Commande): ModuleRow {
  return {
    reference: commande.numero,
    articles: commande.articles.map((a) => `${a.designation} ×${a.quantite}`).join(" · "),
    montant: formatFcfa(Number(commande.montant_total)),
    livraison: formatDate(commande.livraison.date_prevue, commande.livraison.adresse ?? "—"),
    status: commandeStatuts[commande.statut] ?? status(commande.statut, "neutral"),
  };
}

export function conversationRow(conversation: Conversation): ModuleRow {
  return {
    sujet: conversation.sujet,
    liéà: conversation.projet ?? "—",
    interlocuteurs: conversation.participants.map((p) => fullName(p.first_name, p.last_name)).join(" · ") || "—",
    dernièreactivité: formatDate(conversation.derniere_activite, "—"),
    statut: conversation.non_lus > 0 ? status("Non lu", "info") : status("Répondu", "success"),
  };
}

export function clientProjetRow(projet: ClientProjet): ModuleRow {
  return {
    projet: projet.titre,
    adresse: projet.adresse ?? "—",
    avancement: `${projet.avancement_pct ?? 0} %`,
    updated: formatDate(projet.prochaine_visite, "—"),
    statut: chantierStatuts[projet.statut] ?? status(projet.statut, "neutral"),
  };
}

export function demandeRow(demande: DemandeDevis): ModuleRow {
  return {
    demande: demande.libelle,
    service: demande.service,
    created: formatDate(demande.created_at),
    contact: "—",
    statut: demandeStatuts[demande.statut] ?? status(demande.statut, "neutral"),
  };
}

export function clientDocumentRow(doc: ClientDocument): ModuleRow {
  return {
    document: doc.titre,
    projet: doc.projet ?? "—",
    date: formatDate(doc.date),
    author: doc.auteur ?? "—",
    statut: status("Disponible", "success"),
  };
}

export function managerRow(manager: Manager): ModuleRow {
  const user = manager.user;
  const activite = manager.activite_du_mois;
  const detail = [
    activite?.missions ? `${activite.missions} missions` : null,
    activite?.controles ? `${activite.controles} contrôles` : null,
    activite?.commandes ? `${activite.commandes} commandes` : null,
  ].filter(Boolean).join(" · ");
  return {
    manager: fullName(user.first_name, user.last_name, user.email),
    role: roleLabels[user.role] ?? user.role,
    filiale: user.filiale?.nom ?? "—",
    perimetre: manager.perimetre ?? "—",
    activite: detail || "—",
    statut: user.is_active ? status("Actif", "success") : status("Inactif", "neutral"),
  };
}

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
    id: (record.id as string) ?? "",
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

type Loader = (role: RoleCode) => Promise<ModuleData>;

const CLIENT_ROLES: readonly RoleCode[] = ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"];

function isClient(role: RoleCode): boolean {
  return (CLIENT_ROLES as readonly string[]).includes(role);
}

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
    const devis = await devisApi.listDevis();
    const signes = devis.filter((d) => d.statut === "SIGNE").length;
    const envoyes = devis.filter((d) => d.statut === "ENVOYE").length;
    return {
      rows: devis.map(devisRow),
      stats: [
        { label: "Devis API", value: String(devis.length) },
        { label: "Signés", value: String(signes) },
        { label: "Envoyés", value: String(envoyes) },
      ],
      insights: [
        { label: "Montant total TTC", value: formatFcfa(devis.reduce((sum, d) => sum + Number(d.montant_ttc), 0)) },
        { label: "Refusés / expirés", value: String(devis.filter((d) => d.statut === "REFUSE" || d.statut === "EXPIRE").length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  chantiers: async () => {
    const chantiers = await chantiersApi.listChantiers();
    const enCours = chantiers.filter((c) => c.statut === "EN_COURS" || c.statut === "PLANIFIE").length;
    const termines = chantiers.filter((c) => c.statut === "TERMINE").length;
    return {
      rows: chantiers.map(chantierRow),
      stats: [
        { label: "Chantiers API", value: String(chantiers.length) },
        { label: "En cours / planifiés", value: String(enCours) },
        { label: "Terminés", value: String(termines) },
      ],
      insights: [
        { label: "Avancement moyen", value: chantiers.length ? `${Math.round(chantiers.reduce((sum, c) => sum + (c.avancement_pct ?? 0), 0) / chantiers.length)} %` : "—" },
        { label: "Budget prévisionnel", value: formatFcfa(chantiers.reduce((sum, c) => sum + Number(c.budget_previsionnel ?? 0), 0)) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  commandes: async (role) => {
    if (isClient(role)) {
      const commandes = await clientSpaceApi.getCommandes();
      return {
        rows: commandes.map(commandeRow),
        stats: [
          { label: "Commandes", value: String(commandes.length) },
          { label: "En préparation", value: String(commandes.filter((c) => c.statut === "EN_PREPARATION").length) },
          { label: "Livrées", value: String(commandes.filter((c) => c.statut === "LIVREE").length) },
        ],
        insights: [
          { label: "Total commandé", value: formatFcfa(commandes.reduce((sum, c) => sum + Number(c.montant_total), 0)) },
          { label: "Payées", value: String(commandes.filter((c) => c.paiement?.statut === "PAYE").length) },
          { label: "Source", value: "API WUGAMS" },
        ],
      };
    }
    const commandes = await commandesApi.listCommandes();
    const enPreparation = commandes.filter((c) => c.statut === "EN_PREPARATION").length;
    const livrees = commandes.filter((c) => c.statut === "LIVREE").length;
    return {
      rows: commandes.map(commandeRow),
      stats: [
        { label: "Commandes API", value: String(commandes.length) },
        { label: "En préparation", value: String(enPreparation) },
        { label: "Livrées", value: String(livrees) },
      ],
      insights: [
        { label: "Total commandé", value: formatFcfa(commandes.reduce((sum, c) => sum + Number(c.montant_total), 0)) },
        { label: "Payées", value: String(commandes.filter((c) => c.paiement?.statut === "PAYE").length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  messagerie: async () => {
    const conversations = await messagerieApi.listConversations();
    const nonLus = conversations.reduce((sum, c) => sum + (c.non_lus ?? 0), 0);
    return {
      rows: conversations.map(conversationRow),
      stats: [
        { label: "Conversations API", value: String(conversations.length) },
        { label: "Non lues", value: String(nonLus) },
        { label: "Actives", value: String(conversations.length) },
      ],
      insights: [
        { label: "Dernière activité", value: conversations[0] ? formatDate(conversations[0].derniere_activite, "—") : "—" },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  messages: async () => {
    const conversations = await messagerieApi.listConversations();
    const nonLus = conversations.reduce((sum, c) => sum + (c.non_lus ?? 0), 0);
    return {
      rows: conversations.map(conversationRow),
      stats: [
        { label: "Conversations", value: String(conversations.length) },
        { label: "Non lues", value: String(nonLus) },
        { label: "Actives", value: String(conversations.length) },
      ],
      insights: [
        { label: "Dernière activité", value: conversations[0] ? formatDate(conversations[0].derniere_activite, "—") : "—" },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  managers: async () => {
    const managers = await managersApi.listManagers();
    const actifs = managers.filter((m) => m.user.is_active).length;
    return {
      rows: managers.filter((m) => MANAGER_ROLES.includes(m.user.role)).map(managerRow),
      stats: [
        { label: "Managers API", value: String(managers.length) },
        { label: "Actifs", value: String(actifs) },
        { label: "À activer", value: String(managers.length - actifs) },
      ],
      insights: [
        { label: "Rôles couverts", value: Array.from(new Set(managers.map((m) => roleLabels[m.user.role] ?? m.user.role))).join(" · ") || "—" },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  factures: async (role) => {
    if (isClient(role)) {
      const factures = await clientSpaceApi.getFactures();
      return {
        rows: factures.map(factureRow),
        stats: [
          { label: "Factures", value: String(factures.length) },
          { label: "Payées", value: String(factures.filter((f) => f.statut === "PAYEE").length) },
          { label: "En attente", value: String(factures.filter((f) => f.statut === "EMISE" || f.statut === "EN_RETARD").length) },
        ],
        insights: [
          { label: "Montant total TTC", value: formatFcfa(factures.reduce((sum, f) => sum + Number(f.montant_ttc), 0)) },
          { label: "Annulées", value: String(factures.filter((f) => f.statut === "ANNULEE").length) },
          { label: "Source", value: "API WUGAMS" },
        ],
      };
    }
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
  projets: async () => {
    const projets = await clientSpaceApi.getProjets();
    const enCours = projets.filter((p) => p.statut === "EN_COURS" || p.statut === "PLANIFIE").length;
    return {
      rows: projets.map(clientProjetRow),
      stats: [
        { label: "Projets", value: String(projets.length) },
        { label: "En cours", value: String(enCours) },
        { label: "Terminés", value: String(projets.filter((p) => p.statut === "TERMINE").length) },
      ],
      insights: [
        { label: "Avancement moyen", value: projets.length ? `${Math.round(projets.reduce((sum, p) => sum + (p.avancement_pct ?? 0), 0) / projets.length)} %` : "—" },
        { label: "Avec photos", value: String(projets.filter((p) => p.photos_count > 0).length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  demandes: async () => {
    const demandes = await clientSpaceApi.getDemandes();
    const enCours = demandes.filter((d) => d.statut === "EN_COURS" || d.statut === "RECUE").length;
    return {
      rows: demandes.map(demandeRow),
      stats: [
        { label: "Demandes", value: String(demandes.length) },
        { label: "En traitement", value: String(enCours) },
        { label: "Terminées", value: String(demandes.filter((d) => d.statut === "TERMINEE").length) },
      ],
      insights: [
        { label: "À confirmer", value: String(demandes.filter((d) => d.statut === "A_CONFIRMER").length) },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
  documents: async () => {
    const documents = await clientSpaceApi.getDocuments();
    return {
      rows: documents.map(clientDocumentRow),
      stats: [
        { label: "Documents", value: String(documents.length) },
        { label: "Rapports", value: String(documents.filter((d) => d.type === "RAPPORT").length) },
        { label: "Photos", value: String(documents.filter((d) => d.type === "PHOTO").length) },
      ],
      insights: [
        { label: "Devis", value: String(documents.filter((d) => d.type === "DEVIS").length) },
        { label: "Plannings", value: String(documents.filter((d) => d.type === "PLANNING").length) },
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
  rapports: async () => {
    const [consolidation, cloture] = await Promise.all([
      facturesApi.getFacturesConsolidation(),
      facturesApi.rapportCloture().catch(() => null),
    ]);
    const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date());
    const rows: ModuleRow[] = [
      {
        rapport: "Synthèse financière consolidée",
        période: monthLabel,
        auteur: "API WUGAMS",
        dernièreédition: "Automatique",
        statut: status("Prêt", "success"),
      },
      ...consolidation.filiales.map((filiale) => ({
        rapport: `Détail filiale — ${filiale.nom} (${filiale.code})`,
        période: monthLabel,
        auteur: "API WUGAMS",
        dernièreédition: `${filiale.count} facture${filiale.count > 1 ? "s" : ""}`,
        statut: filiale.total_ttc > 0 ? status("Prêt", "success") : status("À vide", "neutral"),
      })),
    ];
    if (cloture) {
      rows.push({
        rapport: "Rapport de clôture",
        période: "Exercice en cours",
        auteur: "API WUGAMS",
        dernièreédition: "Généré à la demande",
        statut: status("Exportable", "info"),
      });
    }
    return {
      rows,
      stats: [
        { label: "Total HT", value: formatFcfa(consolidation.totals.total_ht) },
        { label: "Total TTC", value: formatFcfa(consolidation.totals.total_ttc) },
        { label: "Factures", value: String(consolidation.totals.total_factures) },
      ],
      insights: [
        { label: "Filiales consolidées", value: String(consolidation.filiales.length) },
        { label: "Clôture", value: cloture ? "Disponible" : "—" },
        { label: "Source", value: "API WUGAMS" },
      ],
    };
  },
};

export async function loadModuleData(slug: string, role: RoleCode): Promise<ModuleLoadResult | null> {
  const loader = apiLoaders[slug];
  if (!loader) return null;

  const usableRoles: RoleCode[] = ["ROLE_GERANT", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_DEV_DIGITAL", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"];
  if (!usableRoles.includes(role)) return null;

  try {
    return { data: await loader(role), source: "api" };
  } catch {
    return null;
  }
}
