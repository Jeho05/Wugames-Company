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

const demoProjets: ClientProjetView[] = [
  {
    id: "spj1",
    titre: "Réparation toiture · Magasin Zone 4",
    filiale: "WUGAMS Rénovation",
    statut: "EN_COURS",
    progression: 62,
    debut: "4 août 2026",
    fin: null,
    equipe: "Équipe Couverture",
    galerie: [
      { url: "https://images.unsplash.com/photo-1632260260864-caf7fde5ec36?w=1400&q=80", legende: "Toiture avant travaux" },
      { url: "https://images.unsplash.com/photo-1621429869419-7e4ddb0f8c21?w=1400&q=80", legende: "Remplacement des tôles" },
    ],
    rapport: "Remplacement partiel de la couverture en cours. Étanchéité vérifiée à chaque jonction.",
  },
  {
    id: "spj2",
    titre: "Nettoyage de bureaux · SOCIPAR",
    filiale: "WUGAMS Nettoyage & Entretien",
    statut: "RAPPORT_SOUMIS",
    progression: 85,
    debut: "5 août 2026",
    fin: null,
    equipe: "Équipe Nettoyage",
    galerie: [
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80", legende: "Open space après intervention" },
    ],
    rapport: "Nettoyage complet des espaces communs. Rapport photos joint au dossier.",
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
    filiale: "—",
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

export const demoClientStdData: ClientStdData = {
  live: false,
  missions: demoMissions,
  commandes: demoCommandes,
  devis: demoDevis,
  notifications: demoNotifications,
  projets: demoProjets,
};

export async function loadClientStdData(): Promise<ClientStdData> {
  const [missionsRes, commandesRes, devisRes, notificationsRes, projetsRes] = await Promise.allSettled([
    getMissions(),
    getCommandes(),
    getDevis(),
    listNotifications(),
    getProjets(),
  ]);

  const live =
    missionsRes.status === "fulfilled" ||
    commandesRes.status === "fulfilled" ||
    devisRes.status === "fulfilled";

  const apiMissions = missionsRes.status === "fulfilled" && missionsRes.value.length > 0
    ? missionsRes.value.map(missionView)
    : demoMissions;

  const apiCommandes = commandesRes.status === "fulfilled" && commandesRes.value.length > 0
    ? commandesRes.value.map(commandeView)
    : demoCommandes;

  const apiDevis = devisRes.status === "fulfilled" && devisRes.value.length > 0
    ? devisRes.value.map(devisView)
    : demoDevis;

  const apiNotifications = notificationsRes.status === "fulfilled" && notificationsRes.value.length > 0
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientStdNotificationView => n !== null)
    : demoNotifications;

  const apiProjets = projetsRes.status === "fulfilled" && projetsRes.value.length > 0
    ? projetsRes.value.map(projetView)
    : demoProjets;

  return {
    live,
    missions: apiMissions,
    commandes: apiCommandes,
    devis: apiDevis,
    notifications: apiNotifications,
    projets: apiProjets,
  };
}
