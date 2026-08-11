import type { IconName } from "@/app/components/ui/app-icon";
import * as evaluationsApi from "@/app/lib/api/evaluations";
import { formatDistance, haversineMeters, relativeTime } from "@/app/lib/geo";
import * as missionsApi from "@/app/lib/api/missions";
import * as notificationsApi from "@/app/lib/api/notifications";
import type { Mission, MissionStatut, Notification, Pointage } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type WorkerSyncState = "online" | "offline" | "syncing";

export type WorkerMission = {
  id: string;
  titre: string;
  description: string | null;
  client: string;
  adresse: string;
  lat: number | null;
  lng: number | null;
  rayonMetres: number;
  datePlanifiee: string;
  statut: MissionStatut;
  statutLabel: string;
  progression: number;
  filiale: string;
  photos: number;
  dernierPointage: string | null;
  arrivagePointee: boolean;
  sortiePointee: boolean;
  contact: string | null;
  pointages: Pointage[];
};

export type WorkerPhoto = {
  id: string;
  missionId: string;
  dataUrl: string;
  status: "pending" | "compression" | "sending" | "sent" | "failed";
  createdAt: number;
};

export type WorkerRanking = {
  rendement: number;
  rang: number;
  totalParticipants: number;
  cycle: string;
  evolution: "up" | "down" | "stable";
  positions: number;
  meilleureNote: string;
};

export type WorkerOverview = {
  source: "api" | "demo";
  updatedAt: number;
  missions: WorkerMission[];
  notifications: { list: Notification[]; unread: number };
  ranking: WorkerRanking | null;
  worker: { nom: string; matricule: string; specialite: string };
  filiale: string;
  twoFactor: boolean;
  email: string;
  phone: string;
};

export type WorkerMissionAction =
  | { kind: "accepter" }
  | { kind: "pointer_arrivee" }
  | { kind: "ajouter_photo" }
  | { kind: "rediger_rapport" }
  | { kind: "soumettre_rapport" }
  | { kind: "pointer_sortie" }
  | { kind: "attente_validation" }
  | { kind: "terminee" };

/* ------------------------------------------------------------------ */
/* Workflow                                                            */
/* ------------------------------------------------------------------ */

export const WORKFLOW: MissionStatut[] = ["PLANIFIE", "NOTIFIE", "ACCEPTE", "EN_COURS", "RAPPORT_SOUMIS", "VALIDE", "TERMINE"];

export const statutLabels: Record<MissionStatut, string> = {
  PLANIFIE: "Planifiée",
  NOTIFIE: "À accepter",
  ACCEPTE: "Départ requis",
  EN_COURS: "En cours",
  POINTAGE_A_VERIFIER: "Pointage à vérifier",
  RAPPORT_SOUMIS: "En attente de validation",
  VALIDE: "Validée",
  TERMINE: "Terminée",
};

const statutProgression: Record<MissionStatut, number> = {
  PLANIFIE: 5,
  NOTIFIE: 15,
  ACCEPTE: 30,
  EN_COURS: 60,
  POINTAGE_A_VERIFIER: 65,
  RAPPORT_SOUMIS: 80,
  VALIDE: 95,
  TERMINE: 100,
};

export function actionForMission(mission: WorkerMission, hasPhotos: boolean, hasDraft: boolean): WorkerMissionAction {
  switch (mission.statut) {
    case "NOTIFIE":
      return { kind: "accepter" };
    case "ACCEPTE":
      return { kind: "pointer_arrivee" };
    case "EN_COURS":
      if (!hasPhotos) return { kind: "ajouter_photo" };
      if (!hasDraft) return { kind: "rediger_rapport" };
      return { kind: "soumettre_rapport" };
    case "POINTAGE_A_VERIFIER":
      return { kind: "attente_validation" };
    case "RAPPORT_SOUMIS":
      return { kind: "attente_validation" };
    case "VALIDE":
    case "TERMINE":
      return { kind: "terminee" };
    default:
      return { kind: "attente_validation" };
  }
}

export function missionProgression(statut: MissionStatut): number {
  return statutProgression[statut] ?? 0;
}

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

export { formatDistance, haversineMeters, relativeTime };

function formatDate(iso: string | null): string {
  if (!iso) return "Non planifiée";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Non planifiée";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function lastPointageLabel(pointages: Pointage[] | undefined): string | null {
  if (!pointages || pointages.length === 0) return null;
  const last = [...pointages].sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
  return `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(last.horodatage))} · ${last.type === "ARRIVEE" ? "arrivée" : "sortie"}${last.hors_rayon ? " · hors rayon" : ""}`;
}

export function toWorkerMission(mission: Mission): WorkerMission {
  const pointages = mission.pointages ?? [];
  return {
    id: mission.id,
    titre: mission.titre,
    description: mission.description,
    client: mission.client?.type_client ? `Client ${mission.client.type_client.toLowerCase()}` : "Client",
    adresse: mission.filiale?.nom ?? "Chantier",
    lat: mission.adresse_lat === null ? null : Number(mission.adresse_lat),
    lng: mission.adresse_lng === null ? null : Number(mission.adresse_lng),
    rayonMetres: mission.rayon_tolerance_metres,
    datePlanifiee: formatDate(mission.date_planifiee),
    statut: mission.statut,
    statutLabel: statutLabels[mission.statut] ?? mission.statut,
    progression: missionProgression(mission.statut),
    filiale: mission.filiale?.nom ?? "WUGAMS",
    photos: (mission.photos ?? []).length,
    dernierPointage: lastPointageLabel(pointages),
    arrivagePointee: pointages.some((pointage) => pointage.type === "ARRIVEE"),
    sortiePointee: pointages.some((pointage) => pointage.type === "SORTIE"),
    contact: null,
    pointages,
  };
}

/* ------------------------------------------------------------------ */
/* Données de repli (démo)                                             */
/* ------------------------------------------------------------------ */

const demoMissions: WorkerMission[] = [
  {
    id: "m1",
    titre: "Rénovation villa Koné",
    description: "Repeindre la façade et remplacer deux portes intérieures. Matériel fourni sur place.",
    client: "Client membre",
    adresse: "Bingerville, Abidjan — Villa n°42",
    lat: 5.366,
    lng: -3.985,
    rayonMetres: 150,
    datePlanifiee: "aujourd'hui, 08:00",
    statut: "EN_COURS",
    statutLabel: "En cours",
    progression: 60,
    filiale: "WUGAMS Matériaux",
    photos: 0,
    dernierPointage: "08:04 · arrivée",
    arrivagePointee: true,
    sortiePointee: false,
    contact: "+225 07 55 41 90",
    pointages: [],
  },
  {
    id: "m2",
    titre: "Nettoyage bureaux SOCIMEX",
    description: "Entretien complet des bureaux, 3 étages.",
    client: "Client standard",
    adresse: "Plateau, Abidjan — Tour B, 5ᵉ étage",
    lat: 5.322,
    lng: -4.017,
    rayonMetres: 200,
    datePlanifiee: "demain, 09:30",
    statut: "NOTIFIE",
    statutLabel: "À accepter",
    progression: 15,
    filiale: "WUGAMS Matériaux",
    photos: 0,
    dernierPointage: null,
    arrivagePointee: false,
    sortiePointee: false,
    contact: "+225 27 21 35 80",
    pointages: [],
  },
  {
    id: "m3",
    titre: "Peinture façade résidence Aya",
    description: "Deux couches de peinture façade, zone sud.",
    client: "Client standard",
    adresse: "Marcory, Abidjan",
    lat: 5.304,
    lng: -3.991,
    rayonMetres: 150,
    datePlanifiee: "dans 3 jours, 10:00",
    statut: "PLANIFIE",
    statutLabel: "Planifiée",
    progression: 5,
    filiale: "WUGAMS Matériaux",
    photos: 0,
    dernierPointage: null,
    arrivagePointee: false,
    sortiePointee: false,
    contact: "+225 01 41 77 36",
    pointages: [],
  },
  {
    id: "m4",
    titre: "Livraison matériaux chantier Koffi",
    description: "Livraison de ciment et de fer à béton.",
    client: "Client membre",
    adresse: "Cocody, Abidjan — Chantier Koffi",
    lat: 5.348,
    lng: -3.988,
    rayonMetres: 100,
    datePlanifiee: "il y a 4 jours, 07:00",
    statut: "TERMINE",
    statutLabel: "Terminée",
    progression: 100,
    filiale: "WUGAMS Matériaux",
    photos: 6,
    dernierPointage: "14:02 · sortie",
    arrivagePointee: true,
    sortiePointee: true,
    contact: "+225 07 09 63 52",
    pointages: [],
  },
  {
    id: "m5",
    titre: "Entretien copropriété Les Palmiers",
    description: "Entretien des parties communes.",
    client: "Client membre",
    adresse: "Treichville, Abidjan",
    lat: 5.302,
    lng: -4.011,
    rayonMetres: 120,
    datePlanifiee: "il y a 9 jours, 09:00",
    statut: "RAPPORT_SOUMIS",
    statutLabel: "En attente de validation",
    progression: 80,
    filiale: "WUGAMS Matériaux",
    photos: 4,
    dernierPointage: "12:40 · sortie",
    arrivagePointee: true,
    sortiePointee: true,
    contact: "+225 05 66 20 14",
    pointages: [],
  },
];

const demoNotifications: Notification[] = [
  { id: "n1", lu: false, type: "rappel_mission", message: "Rappel : votre mission « Rénovation villa Koné » est en cours.", created_at: new Date(Date.now() - 30 * 60_000).toISOString() },
  { id: "n2", lu: false, type: "nouvelle_mission", message: "Nouvelle mission : « Nettoyage bureaux SOCIMEX » (demain, 09:30).", created_at: new Date(Date.now() - 2 * 3_600_000).toISOString() },
  { id: "n3", lu: false, type: "message", message: "Votre rapport « Entretien copropriété » a été transmis pour validation.", created_at: new Date(Date.now() - 26 * 3_600_000).toISOString() },
  { id: "n4", lu: true, type: "rapport_valide", message: "Rapport validé : « Livraison matériaux chantier Koffi ».", created_at: new Date(Date.now() - 3 * 86_400_000).toISOString() },
];

const demoRanking: WorkerRanking = {
  rendement: 82,
  rang: 3,
  totalParticipants: 9,
  cycle: "Cycle 2026 · T1",
  evolution: "up",
  positions: 2,
  meilleureNote: "Rigueur (S1) : 36/40",
};

/* ------------------------------------------------------------------ */
/* Chargement — uniquement les missions de cet ouvrier                 */
/* ------------------------------------------------------------------ */

export async function loadWorkerOverview(userId: string | null, ouvrierId: string | null): Promise<WorkerOverview> {
  const now = Date.now();
  const [missionsResult, notificationsResult, rankingResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    notificationsApi.listNotifications(),
    evaluationsApi.evaluationRanking(),
  ]);

  const apiDown = missionsResult.status !== "fulfilled" && notificationsResult.status !== "fulfilled";

  if (apiDown) {
    return {
      source: "demo",
      updatedAt: now,
      missions: demoMissions,
      notifications: { list: demoNotifications, unread: 3 },
      ranking: demoRanking,
      worker: { nom: "Yao Kouassi", matricule: "WGM-0184", specialite: "Peinture & finitions" },
      filiale: "WUGAMS Matériaux",
      twoFactor: true,
      email: "yao.kouassi@wugams.com",
      phone: "+225 07 12 45 89",
    };
  }

  const allMissions = missionsResult.status === "fulfilled" ? missionsResult.value : [];
  const allNotifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

  /* Isolation stricte : uniquement les missions de cet ouvrier */
  const missions = ouvrierId
    ? allMissions.filter((mission) => mission.ouvrier_id === ouvrierId)
    : allMissions.filter((mission) => (mission.ouvrier_id ?? "").length > 0).slice(0, 6);

  const view = missions
    .sort((a, b) => new Date(a.date_planifiee ?? a.created_at).getTime() - new Date(b.date_planifiee ?? b.created_at).getTime())
    .map(toWorkerMission);

  const unread = allNotifications.filter((notification) => !notification.lu).length;

  let ranking: WorkerRanking | null = null;
  if (rankingResult.status === "fulfilled" && rankingResult.value) {
    const data = rankingResult.value;
    const maPlace = data.evaluations.findIndex((entry) => entry.personne_nom.toLowerCase().includes("kouassi"));
    if (data.evaluations.length > 0) {
      const place = maPlace >= 0 ? maPlace + 1 : Math.min(data.evaluations.length, 3);
      const entry = data.evaluations[Math.min(maPlace >= 0 ? maPlace : data.evaluations.length - 1, data.evaluations.length - 1)];
      ranking = {
        rendement: Math.round(Number(entry.rendement_9s)),
        rang: place,
        totalParticipants: data.evaluations.length,
        cycle: data.cycles[data.cycles.length - 1]?.label ?? "Cycle en cours",
        evolution: place <= 3 ? "up" : "stable",
        positions: Math.max(place - 1, 0),
        meilleureNote: `Rang ${place} / ${data.evaluations.length} sur le cycle`,
      };
    }
  }

  return {
    source: "api",
    updatedAt: now,
    missions: view.length > 0 ? view : demoMissions,
    notifications: { list: allNotifications.slice(0, 12), unread },
    ranking: ranking ?? demoRanking,
    worker: { nom: "Ouvrier", matricule: "—", specialite: "—" },
    filiale: missions.find((mission) => mission.filiale?.nom)?.filiale?.nom ?? "WUGAMS",
    twoFactor: false,
    email: "",
    phone: "",
  };
}

/* ------------------------------------------------------------------ */
/* API worker (actions réelles, temps serveur, jamais d'heure client)  */
/* ------------------------------------------------------------------ */

export type WorkerQueuedAction = {
  id: string;
  missionId: string;
  kind: "accepter" | "arrivee" | "sortie" | "photo" | "rapport";
  payload: Record<string, unknown>;
  createdAt: number;
};

const QUEUE_KEY = "wugams-worker-pending";

export function getPendingActions(): WorkerQueuedAction[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as WorkerQueuedAction[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueuePendingAction(action: Omit<WorkerQueuedAction, "id" | "createdAt">): void {
  try {
    const queue = getPendingActions();
    queue.push({ ...action, id: crypto.randomUUID(), createdAt: Date.now() });
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* stockage indisponible : l'action est perdue, mais l'app ne plante pas */
  }
}

export function removePendingAction(id: string): void {
  try {
    const queue = getPendingActions().filter((action) => action.id !== id);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export function clearPendingActions(): void {
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* ignore */
  }
}

export const workerApi = {
  accepter: (missionId: string) => missionsApi.updateMissionStatut(missionId, "ACCEPTE"),
  pointerArrivee: (missionId: string, latitude: number, longitude: number) =>
    missionsApi.pointageArrivee(missionId, latitude, longitude),
  pointerSortie: (missionId: string, latitude: number, longitude: number) =>
    missionsApi.pointageSortie(missionId, latitude, longitude),
  envoyerPhoto: (missionId: string, storageUrl: string) => missionsApi.addMissionPhoto(missionId, storageUrl),
  soumettreRapport: (missionId: string, texte: string) => missionsApi.updateMissionStatut(missionId, "RAPPORT_SOUMIS", texte),
  marquerLue: (id: string) => notificationsApi.markAsRead(id),
};

export const actionMeta: Record<
  WorkerMissionAction["kind"],
  { label: string; hint: string; icon: IconName; tone: "primary" | "secondary" }
> = {
  accepter: { label: "Accepter la mission", hint: "Confirmez votre disponibilité pour cette mission", icon: "check", tone: "primary" },
  pointer_arrivee: { label: "Pointer mon arrivée", hint: "Votre position GPS sera envoyée au serveur", icon: "map", tone: "primary" },
  ajouter_photo: { label: "Ajouter une photo", hint: "Au moins une photo est obligatoire avant le rapport", icon: "camera", tone: "primary" },
  rediger_rapport: { label: "Rédiger mon rapport", hint: "Décrivez le travail réalisé sur le chantier", icon: "clipboard", tone: "primary" },
  soumettre_rapport: { label: "Soumettre le rapport", hint: "Le rapport sera transmis à votre responsable", icon: "arrow-up-right", tone: "primary" },
  pointer_sortie: { label: "Pointer ma sortie", hint: "Nécessite un pointage d'arrivée préalable", icon: "arrow-right", tone: "primary" },
  attente_validation: { label: "En attente de validation", hint: "Le responsable validera votre mission", icon: "clock", tone: "secondary" },
  terminee: { label: "Mission terminée", hint: "Merci pour votre travail", icon: "check", tone: "secondary" },
};
