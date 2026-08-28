import type { Commande, Devis, Mission, MissionStatut, Notification, ClientProjet } from "@/app/lib/contracts";
import { getCommandes, getDevis, getMissions, getProjets } from "@/app/lib/api/client-space";
import { listNotifications } from "@/app/lib/api/notifications";
import { formatDateFr, formatDateTimeFr, missionStatutMeta } from "@/app/lib/client-data";
import type { ClientProjetView, CommandeStatut, DevisStatut } from "@/app/lib/client-data";

export type ClientStdGlobalState = "ok" | "action" | "critical";

export type ClientStdMissionView = {
  id: string;
  titre: string;
  statut: MissionStatut;
  progression: number;
  date: string;
  equipe: string;
  dernierPointage: string | null;
};

export type ClientStdDevisView = {
  id: string;
  numero: string;
  objet: string;
  montant: number;
  date: string;
  validite: string;
  statut: DevisStatut;
};

export type ClientStdCommandeView = {
  id: string;
  numero: string;
  date: string;
  statut: CommandeStatut;
  nbArticles: number;
  montant: number;
  articles: string[];
};

export type ClientStdNotificationKind = "mission" | "commande" | "devis" | "info";

export type ClientStdNotificationView = {
  id: string;
  kind: ClientStdNotificationKind;
  titre: string;
  detail: string;
  time: string;
  lu: boolean;
};

export type ClientStdData = {
  live: boolean;
  missions: ClientStdMissionView[];
  commandes: ClientStdCommandeView[];
  devis: ClientStdDevisView[];
  notifications: ClientStdNotificationView[];
  projets: ClientProjetView[];
};

export const clientStdStateMeta: Record<ClientStdGlobalState, { label: string; detail: string; tone: "danger" | "warning" | "success" }> = {
  ok: { label: "Aucun problème", detail: "Tout se déroule comme prévu", tone: "success" },
  action: { label: "Action requise", detail: "Un devis attend votre réponse", tone: "warning" },
  critical: { label: "Mission urgente", detail: "Un pointage nécessite votre attention", tone: "danger" },
};

export function clientStdStateFrom(
  missions: ClientStdMissionView[],
  devis: ClientStdDevisView[]
): ClientStdGlobalState {
  if (missions.some((m) => m.statut === "POINTAGE_A_VERIFIER")) return "critical";
  if (devis.some((d) => d.statut === "EN_ATTENTE")) return "action";
  return "ok";
}

export function clientStdProgress(missions: ClientStdMissionView[]): number {
  if (missions.length === 0) return 0;
  return Math.round(missions.reduce((sum, m) => sum + m.progression, 0) / missions.length);
}

/* ------------------------------------------------------------------ */
/* Conversion API → vues                                               */
/* ------------------------------------------------------------------ */

function missionView(mission: Mission): ClientStdMissionView {
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

function notificationView(notification: Notification): ClientStdNotificationView | null {
  const message = notification.message ?? null;
  if (!message) return null;
  const raw = String(notification.type ?? "").toLowerCase();
  const kind: ClientStdNotificationKind = raw.includes("commande")
    ? "commande"
    : raw.includes("devis")
      ? "devis"
      : raw.includes("info") || raw.includes("message")
        ? "info"
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

function devisView(devis: Devis): ClientStdDevisView {
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

const devisStatutFromApi: Record<string, DevisStatut> = {
  BROUILLON: "EN_ATTENTE",
  ENVOYE: "EN_ATTENTE",
  SIGNE: "ACCEPTE",
  REFUSE: "REFUSE",
  EXPIRE: "EXPIRE",
};

const projetStatutFromApi: Record<string, MissionStatut> = {
  PLANIFIE: "PLANIFIE",
  EN_COURS: "EN_COURS",
  SUSPENDU: "ACCEPTE",
  TERMINE: "TERMINE",
  ANNULE: "TERMINE",
};

function commandeView(commande: Commande): ClientStdCommandeView {
  return {
    id: commande.id,
    numero: commande.numero,
    date: formatDateFr(commande.created_at),
    statut: commande.statut,
    nbArticles: commande.articles.reduce((sum, article) => sum + article.quantite, 0),
    montant: Number(commande.montant_total ?? 0),
    articles: commande.articles.map((article) => `${article.designation} — ${article.quantite} × ${article.prix_unitaire}`),
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
/* Chargement — aucun endpoint financier pour le ROLE_CLIENT_STD       */
/* ------------------------------------------------------------------ */

export async function loadClientStdData(): Promise<ClientStdData | null> {
  const [missionsRes, commandesRes, devisRes, notificationsRes, projetsRes] = await Promise.allSettled([
    getMissions(),
    getCommandes(),
    getDevis(),
    listNotifications(),
    getProjets(),
  ]);

  // Si toutes les APIs échouent, retourner un objet vide plutôt qu'un loader infini

  const live =
    missionsRes.status === "fulfilled" ||
    commandesRes.status === "fulfilled" ||
    devisRes.status === "fulfilled";

  const apiMissions = missionsRes.status === "fulfilled" ? missionsRes.value.map(missionView) : [];

  const apiCommandes = commandesRes.status === "fulfilled" ? commandesRes.value.map(commandeView) : [];

  const apiDevis = devisRes.status === "fulfilled" ? devisRes.value.map(devisView) : [];

  const apiNotifications = notificationsRes.status === "fulfilled"
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientStdNotificationView => n !== null)
    : [];

  const apiProjets = projetsRes.status === "fulfilled" ? projetsRes.value.map(projetView) : [];

  return {
    live,
    missions: apiMissions,
    commandes: apiCommandes,
    devis: apiDevis,
    notifications: apiNotifications,
    projets: apiProjets,
  };
}
