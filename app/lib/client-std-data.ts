import type { Mission, MissionStatut, Notification } from "@/app/lib/contracts";
import { getCommandes, getDevis, getMissions } from "@/app/lib/api/client-space";
import { listNotifications } from "@/app/lib/api/notifications";
import {
  commandeStatutMeta,
  devisStatutMeta,
  formatDateFr,
  formatDateTimeFr,
  missionStatutMeta,
} from "@/app/lib/client-data";
import type { CommandeStatut, DevisStatut } from "@/app/lib/client-data";

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
/* Données de démonstration (repli si l'API est indisponible)          */
/* ------------------------------------------------------------------ */

const demoMissions: ClientStdMissionView[] = [
  {
    id: "sm1",
    titre: "Réparation toiture · Magasin Zone 4",
    statut: "EN_COURS",
    progression: 62,
    date: "Aujourd'hui, 08:00",
    equipe: "Équipe Couverture",
    dernierPointage: "07:55 · arrivée sur site",
  },
  {
    id: "sm2",
    titre: "Nettoyage de bureaux · SOCIPAR",
    statut: "RAPPORT_SOUMIS",
    progression: 85,
    date: "Hier, 10:00",
    equipe: "Équipe Nettoyage",
    dernierPointage: "15:40 · sortie du site",
  },
  {
    id: "sm3",
    titre: "Livraison matériaux · Plateau",
    statut: "ACCEPTE",
    progression: 30,
    date: "Vendredi 7 août, 09:30",
    equipe: "Équipe Logistique",
    dernierPointage: null,
  },
  {
    id: "sm4",
    titre: "Entretien climatisation · Résidence",
    statut: "PLANIFIE",
    progression: 5,
    date: "Lundi 10 août, 14:00",
    equipe: "Équipe Technique",
    dernierPointage: null,
  },
];

const demoCommandes: ClientStdCommandeView[] = [
  {
    id: "sc1",
    numero: "CMD-2026-034",
    date: "5 août 2026",
    statut: "EN_PREPARATION",
    nbArticles: 4,
    montant: 342_000,
    articles: ["Peinture façade beige — 12 L", "Peinture acrylique blanche — 8 L", "Gesso d'accrochage — 3 L", "Rouleaux & pinceaux — 1 lot"],
  },
  {
    id: "sc2",
    numero: "CMD-2026-032",
    date: "30 juillet 2026",
    statut: "LIVREE",
    nbArticles: 2,
    montant: 156_800,
    articles: ["Coffre à outils 108 pièces", "Ruban adhésif professionnel — 10 rouleaux"],
  },
  {
    id: "sc3",
    numero: "CMD-2026-030",
    date: "22 juillet 2026",
    statut: "EN_PREPARATION",
    nbArticles: 1,
    montant: 89_900,
    articles: ["Kit quincaillerie porte d'entrée"],
  },
];

const demoDevis: ClientStdDevisView[] = [
  {
    id: "sd1",
    numero: "DEV-2026-098",
    objet: "Rafraîchissement façade · Magasin Zone 4",
    montant: 1_240_000,
    date: "5 août 2026",
    validite: "30 jours",
    statut: "EN_ATTENTE",
  },
  {
    id: "sd2",
    numero: "DEV-2026-096",
    objet: "Nettoyage bureaux · contrat trimestriel",
    montant: 690_000,
    date: "28 juillet 2026",
    validite: "30 jours",
    statut: "ACCEPTE",
  },
  {
    id: "sd3",
    numero: "DEV-2026-093",
    objet: "Rénovation salle de réunion",
    montant: 3_150_000,
    date: "12 juillet 2026",
    validite: "15 jours",
    statut: "EXPIRE",
  },
];

const demoNotifications: ClientStdNotificationView[] = [
  {
    id: "sn1",
    kind: "mission",
    titre: "Mission mise à jour",
    detail: "Nettoyage de bureaux · SOCIPAR — rapport soumis",
    time: "Il y a 3 h",
    lu: false,
  },
  {
    id: "sn2",
    kind: "commande",
    titre: "Commande modifiée",
    detail: "CMD-2026-034 — ajout de 2 rouleaux de peinture",
    time: "Il y a 8 h",
    lu: false,
  },
  {
    id: "sn3",
    kind: "devis",
    titre: "Nouveau devis",
    detail: "DEV-2026-098 · Rafraîchissement façade — en attente de votre réponse",
    time: "Hier",
    lu: false,
  },
  {
    id: "sn4",
    kind: "info",
    titre: "Information",
    detail: "Votre espace client est désormais disponible",
    time: "2 août",
    lu: true,
  },
];

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

/* ------------------------------------------------------------------ */
/* Chargement — aucun endpoint financier pour le ROLE_CLIENT_STD       */
/* ------------------------------------------------------------------ */

export const demoClientStdData: ClientStdData = {
  live: false,
  missions: demoMissions,
  commandes: demoCommandes,
  devis: demoDevis,
  notifications: demoNotifications,
};

export async function loadClientStdData(): Promise<ClientStdData> {
  const [missionsRes, commandesRes, devisRes, notificationsRes] = await Promise.allSettled([
    getMissions(),
    getCommandes(),
    getDevis(),
    listNotifications(),
  ]);

  const live =
    missionsRes.status === "fulfilled" ||
    commandesRes.status === "fulfilled" ||
    devisRes.status === "fulfilled";

  const apiMissions = missionsRes.status === "fulfilled" && missionsRes.value.length > 0
    ? missionsRes.value.map(missionView)
    : demoMissions;

  const apiCommandes = commandesRes.status === "fulfilled" && commandesRes.value.length > 0
    ? (commandesRes.value as unknown[]).map((raw, index) => {
        const entry = raw as Record<string, unknown>;
        const numero = String(entry.numero ?? entry.reference ?? `CMD-2026-${String(100 + index)}`);
        const rawStatut = String(entry.statut ?? "EN_PREPARATION");
        return {
          id: String(entry.id ?? numero),
          numero,
          date: formatDateFr(String(entry.date ?? entry.created_at ?? "")),
          statut: (rawStatut as CommandeStatut) in commandeStatutMeta
            ? (rawStatut as CommandeStatut)
            : "EN_PREPARATION",
          nbArticles: Number(entry.nb_articles ?? (Array.isArray(entry.articles) ? entry.articles.length : 0)),
          montant: Number(entry.montant ?? entry.montant_ttc ?? 0),
          articles: Array.isArray(entry.articles)
            ? (entry.articles as unknown[]).map((article) => String(article))
            : [],
        } satisfies ClientStdCommandeView;
      })
    : demoCommandes;

  const apiDevis = devisRes.status === "fulfilled" && devisRes.value.length > 0
    ? (devisRes.value as unknown[]).map((raw, index) => {
        const entry = raw as Record<string, unknown>;
        const numero = String(entry.numero ?? entry.reference ?? `DEV-2026-${String(100 + index)}`);
        return {
          id: String(entry.id ?? numero),
          numero,
          objet: String(entry.objet ?? entry.titre ?? "Devis WUGAMS"),
          montant: Number(entry.montant ?? entry.montant_ttc ?? 0),
          date: formatDateFr(String(entry.date ?? entry.created_at ?? "")),
          validite: String(entry.validite ?? "30 jours"),
          statut: (String(entry.statut ?? "EN_ATTENTE") as DevisStatut) in devisStatutMeta
            ? (String(entry.statut) as DevisStatut)
            : "EN_ATTENTE",
        } satisfies ClientStdDevisView;
      })
    : demoDevis;

  const apiNotifications = notificationsRes.status === "fulfilled" && notificationsRes.value.length > 0
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientStdNotificationView => n !== null)
    : demoNotifications;

  return {
    live,
    missions: apiMissions,
    commandes: apiCommandes,
    devis: apiDevis,
    notifications: apiNotifications,
  };
}
