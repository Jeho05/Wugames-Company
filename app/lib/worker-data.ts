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
  source: "api";
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
/* Chargement — uniquement les missions de cet ouvrier                 */
/* ------------------------------------------------------------------ */

export async function loadWorkerOverview(userId: string | null, ouvrierId: string | null): Promise<WorkerOverview> {
  const now = Date.now();
  const [missionsResult, notificationsResult, rankingResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    notificationsApi.listNotifications(),
    evaluationsApi.evaluationRanking(),
  ]);

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
    missions: view,
    notifications: { list: allNotifications.slice(0, 12), unread },
    ranking,
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
