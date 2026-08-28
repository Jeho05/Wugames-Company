import type {
  ChantierStatut,
  Commande,
  Devis,
  Facture,
  FactureStatut,
  Fidelite,
  Mission,
  MissionStatut,
  Notification,
  ClientProjet,
  DemandeDevis,
} from "@/app/lib/contracts";
import { getCommandes, getDemandes, getDevis, getFactures, getFidelite, getMissions, getProjets } from "@/app/lib/api/client-space";
import { listNotifications } from "@/app/lib/api/notifications";

export type ClientGlobalState = "ok" | "action" | "critical";

export type DevisStatut = "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "EXPIRE";

export type CommandeStatut = "EN_ATTENTE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";

export type ClientMissionView = {
  id: string;
  titre: string;
  statut: MissionStatut;
  progression: number;
  date: string;
  equipe: string;
  dernierPointage: string | null;
};

export type ClientDevisView = {
  id: string;
  numero: string;
  objet: string;
  montant: number;
  date: string;
  validite: string;
  statut: DevisStatut;
};

export type ClientCommandeView = {
  id: string;
  numero: string;
  date: string;
  statut: CommandeStatut;
  nbArticles: number;
  montant: number;
  articles: string[];
};

export type NotificationKind = "mission" | "facture" | "devis" | "commande" | "paiement" | "cleans";

export type DemandeType = "DEVIS" | "SERVICE" | "RECLAMATION";

export type DemandeStatut = "ENVOYEE" | "ETUDIEE" | "DEVIS_PROPOSE" | "ACCEPTEE" | "REFUSEE";

export type ClientDemandeView = {
  id: string;
  type: DemandeType;
  objet: string;
  detail: string;
  date: string;
  statut: DemandeStatut;
  piecesJointes: number;
};

export type ClientProjetPhoto = {
  url: string;
  legende: string;
};

export type ClientProjetView = {
  id: string;
  titre: string;
  filiale: string;
  statut: MissionStatut;
  progression: number;
  debut: string;
  fin: string | null;
  equipe: string;
  galerie: ClientProjetPhoto[];
  rapport: string | null;
};

export type ClientNotificationView = {
  id: string;
  kind: NotificationKind;
  titre: string;
  detail: string;
  time: string;
  lu: boolean;
};

export type ClientPortalData = {
  live: boolean;
  missions: ClientMissionView[];
  factures: Facture[];
  devis: ClientDevisView[];
  commandes: ClientCommandeView[];
  notifications: ClientNotificationView[];
  demandes: ClientDemandeView[];
  projets: ClientProjetView[];
  fidelite: Fidelite | null;
};

/* ------------------------------------------------------------------ */
/* Étiquettes & tonalités                                              */
/* ------------------------------------------------------------------ */

export type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export const missionStatutMeta: Record<MissionStatut, { label: string; tone: StatusTone; progression: number }> = {
  PLANIFIE: { label: "Planifiée", tone: "neutral", progression: 5 },
  NOTIFIE: { label: "Notifiée", tone: "info", progression: 15 },
  ACCEPTE: { label: "Acceptée", tone: "info", progression: 30 },
  EN_COURS: { label: "En cours", tone: "warning", progression: 60 },
  RAPPORT_SOUMIS: { label: "Rapport soumis", tone: "info", progression: 80 },
  VALIDE: { label: "Validée", tone: "success", progression: 95 },
  TERMINE: { label: "Terminée", tone: "success", progression: 100 },
  POINTAGE_A_VERIFIER: { label: "Pointage à vérifier", tone: "danger", progression: 45 },
};

export const factureStatutMeta: Record<FactureStatut, { label: string; tone: StatusTone }> = {
  BROUILLON: { label: "Brouillon", tone: "neutral" },
  EMISE: { label: "Émise", tone: "warning" },
  PAYEE: { label: "Payée", tone: "success" },
  EN_RETARD: { label: "En retard", tone: "danger" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
};

export const devisStatutMeta: Record<DevisStatut, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  ACCEPTE: { label: "Accepté", tone: "success" },
  REFUSE: { label: "Refusé", tone: "danger" },
  EXPIRE: { label: "Expiré", tone: "neutral" },
};

export const commandeStatutMeta: Record<CommandeStatut, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "info" },
  EN_PREPARATION: { label: "En préparation", tone: "info" },
  EXPEDIEE: { label: "Expédiée", tone: "info" },
  LIVREE: { label: "Livrée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

/** Correspondance des statuts devis de l'API vers les statuts de l'UI client. */
const devisStatutFromApi: Record<string, DevisStatut> = {
  BROUILLON: "EN_ATTENTE",
  ENVOYE: "EN_ATTENTE",
  SIGNE: "ACCEPTE",
  REFUSE: "REFUSE",
  EXPIRE: "EXPIRE",
};

/** Correspondance des statuts demandes de l'API vers les statuts de l'UI client. */
const demandeStatutFromApi: Record<string, DemandeStatut> = {
  RECUE: "ENVOYEE",
  EN_COURS: "ETUDIEE",
  A_CONFIRMER: "DEVIS_PROPOSE",
  TERMINEE: "ACCEPTEE",
};

/** Correspondance des statuts chantiers de l'API vers les statuts de l'UI client (missions). */
const projetStatutFromApi: Record<ChantierStatut, MissionStatut> = {
  PLANIFIE: "PLANIFIE",
  EN_COURS: "EN_COURS",
  SUSPENDU: "ACCEPTE",
  TERMINE: "TERMINE",
  ANNULE: "TERMINE",
};

export const demandeTypeMeta: Record<DemandeType, { label: string; tone: StatusTone }> = {
  DEVIS: { label: "Demande de devis", tone: "info" },
  SERVICE: { label: "Demande de service", tone: "warning" },
  RECLAMATION: { label: "Réclamation", tone: "danger" },
};

export const demandeStatutMeta: Record<DemandeStatut, { label: string; tone: StatusTone }> = {
  ENVOYEE: { label: "Envoyée", tone: "neutral" },
  ETUDIEE: { label: "À l'étude", tone: "info" },
  DEVIS_PROPOSE: { label: "Devis proposé", tone: "warning" },
  ACCEPTEE: { label: "Acceptée", tone: "success" },
  REFUSEE: { label: "Refusée", tone: "danger" },
};

export function globalStateFrom(missions: ClientMissionView[], factures: Facture[], devis: ClientDevisView[], abonnementStatut?: "ACTIF" | "EXPIRE" | "AUCUN"): ClientGlobalState {
  if (abonnementStatut === "AUCUN") return "critical";
  if (abonnementStatut === "EXPIRE") return "action";
  if (abonnementStatut === "ACTIF") return "ok";
  const hasCritical =
    factures.some((f) => f.statut === "EN_RETARD") ||
    missions.some((m) => m.statut === "POINTAGE_A_VERIFIER");
  if (hasCritical) return "critical";
  const hasAction =
    factures.some((f) => f.statut === "EMISE") ||
    devis.some((d) => d.statut === "EN_ATTENTE") ||
    missions.some((m) => m.statut === "ACCEPTE" || m.statut === "EN_COURS" || m.statut === "RAPPORT_SOUMIS");
  if (hasAction) return "action";
  return "ok";
}

export const globalStateMeta: Record<ClientGlobalState, { label: string; detail: string; tone: StatusTone }> = {
  ok: { label: "Abonnement Wugam Clean actif", detail: "Votre abonnement est actif et à jour", tone: "success" },
  action: { label: "Abonnement expiré", detail: "Votre abonnement a expiré — renouvelez pour continuer", tone: "warning" },
  critical: { label: "Aucun abonnement", detail: "Activez un abonnement Wugam Clean pour accéder à vos services", tone: "danger" },
};

/* ------------------------------------------------------------------ */
/* Formatage                                                           */
/* ------------------------------------------------------------------ */

export const formatFcfaCompact = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000) return `${Math.round(amount / 1_000).toLocaleString("fr-FR")} k`;
  return amount.toLocaleString("fr-FR");
};

export function formatDateFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTimeFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
    " · " +
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Conversion API → vues                                               */
/* ------------------------------------------------------------------ */

function missionView(mission: Mission): ClientMissionView {
  const meta = missionStatutMeta[mission.statut];
  const equipe = mission.ouvrier
    ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}`.trim()
    : "Équipe WUGAMS";
  const dernierPointage = mission.pointages && mission.pointages.length > 0
    ? formatDateTimeFr(mission.pointages[mission.pointages.length - 1].horodatage)
    : null;
  return {
    id: mission.id,
    titre: mission.titre,
    statut: mission.statut,
    progression: meta.progression,
    date: mission.date_planifiee ? formatDateFr(mission.date_planifiee) : "—",
    equipe,
    dernierPointage,
  };
}

function notificationView(notification: Notification): ClientNotificationView | null {
  const message = notification.message ?? null;
  if (!message) return null;
  const raw = String(notification.type ?? "").toLowerCase();
  const kind: NotificationKind = raw.includes("cleans") || raw.includes("abonnement")
    ? "cleans"
    : raw.includes("facture") || raw.includes("paiement")
      ? raw.includes("paiement") ? "paiement" : "facture"
      : raw.includes("devis")
        ? "devis"
        : raw.includes("commande")
          ? "commande"
          : "mission";
  return {
    id: notification.id,
    kind,
    titre: message.split("\n")[0] ?? "Notification",
    detail: message,
    time: notification.created_at ? formatDateTimeFr(notification.created_at) : "—",
    lu: notification.lu ?? false,
  };
}

function devisView(devis: Devis): ClientDevisView {
  const objet = devis.lignes && devis.lignes.length > 0
    ? devis.lignes.map((ligne) => ligne.designation).join(" · ")
    : devis.client
      ? `Devis pour ${[devis.client.first_name, devis.client.last_name].filter(Boolean).join(" ") || devis.client.email}`
      : "Devis WUGAMS";
  return {
    id: devis.id,
    numero: devis.numero,
    objet: objet.slice(0, 64),
    montant: Number(devis.montant_ttc ?? devis.montant_ht ?? 0),
    date: formatDateFr(devis.created_at),
    validite: devis.date_validite ? formatDateFr(devis.date_validite) : "30 jours",
    statut: devisStatutFromApi[devis.statut] ?? "EN_ATTENTE",
  };
}

function commandeView(commande: Commande): ClientCommandeView {
  return {
    id: commande.id,
    numero: commande.numero,
    date: formatDateFr(commande.created_at),
    statut: commande.statut,
    nbArticles: commande.articles.reduce((sum, article) => sum + article.quantite, 0),
    montant: Number(commande.montant_total ?? 0),
    articles: commande.articles.map((article) => `${article.designation} — ${article.quantite} × ${formatFcfaCompact(article.prix_unitaire)}`),
  };
}

export function demandeView(demande: DemandeDevis): ClientDemandeView {
  return {
    id: demande.id,
    type: "DEVIS",
    objet: demande.libelle,
    detail: demande.service,
    date: formatDateFr(demande.created_at),
    statut: demandeStatutFromApi[demande.statut] ?? "ENVOYEE",
    piecesJointes: 0,
  };
}

function projetView(projet: ClientProjet): ClientProjetView {
  return {
    id: projet.id,
    titre: projet.titre,
    filiale: projet.adresse ?? "—",
    statut: projetStatutFromApi[projet.statut] ?? "PLANIFIE",
    progression: projet.avancement_pct ?? 0,
    debut: "—",
    fin: projet.prochaine_visite ? formatDateFr(projet.prochaine_visite) : null,
    equipe: projet.photos_count > 0 ? `${projet.photos_count} photo${projet.photos_count > 1 ? "s" : ""}` : "—",
    galerie: [],
    rapport: null,
  };
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadClientPortalData(): Promise<ClientPortalData> {
  const [facturesRes, devisRes, commandesRes, missionsRes, notificationsRes, demandesRes, projetsRes, fideliteRes] =
    await Promise.allSettled([
      getFactures(),
      getDevis(),
      getCommandes(),
      getMissions(),
      listNotifications(),
      getDemandes(),
      getProjets(),
      getFidelite(),
    ]);

  const apiFactures = facturesRes.status === "fulfilled" ? facturesRes.value : [];

  const apiMissions = missionsRes.status === "fulfilled" ? missionsRes.value.map(missionView) : [];

  const apiDevis = devisRes.status === "fulfilled" ? devisRes.value.map(devisView) : [];

  const apiCommandes = commandesRes.status === "fulfilled" ? commandesRes.value.map(commandeView) : [];

  const apiNotifications = notificationsRes.status === "fulfilled"
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientNotificationView => n !== null)
    : [];

  const apiDemandes = demandesRes.status === "fulfilled" ? demandesRes.value.map(demandeView) : [];

  const apiProjets = projetsRes.status === "fulfilled" ? projetsRes.value.map(projetView) : [];

  const apiFidelite = fideliteRes.status === "fulfilled" ? fideliteRes.value : null;

  return {
    live: true,
    missions: apiMissions,
    factures: apiFactures,
    devis: apiDevis,
    commandes: apiCommandes,
    notifications: apiNotifications,
    demandes: apiDemandes,
    projets: apiProjets,
    fidelite: apiFidelite,
  };
}
