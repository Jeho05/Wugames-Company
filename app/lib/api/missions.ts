import { apiFetch } from "@/app/lib/api-client";
import type {
  AffecterMissionResult,
  CreateMissionPayload,
  Mission,
  MissionRapport,
  MissionStatut,
  Pointage,
  VerifierPointagePayload,
} from "@/app/lib/contracts";

export async function listMissions(): Promise<Mission[]> {
  return apiFetch<Mission[]>("/missions");
}

export async function getMission(id: string): Promise<Mission> {
  return apiFetch<Mission>(`/missions/${id}`);
}

export async function createMission(payload: CreateMissionPayload): Promise<Mission> {
  return apiFetch<Mission>("/missions", { method: "POST", body: payload });
}

export async function updateMissionStatut(
  id: string,
  statut: MissionStatut,
  rapportTexte?: string,
): Promise<Mission> {
  return apiFetch<Mission>(`/missions/${id}/statut`, {
    method: "PATCH",
    body: rapportTexte ? { statut, rapport_texte: rapportTexte } : { statut },
  });
}

export async function affecterMission(id: string, ouvrierId?: string): Promise<AffecterMissionResult> {
  return apiFetch<AffecterMissionResult>(`/missions/${id}/affecter`, {
    method: "POST",
    body: ouvrierId ? { ouvrier_id: ouvrierId } : {},
  });
}

export async function getMissionRapport(id: string): Promise<MissionRapport> {
  return apiFetch<MissionRapport>(`/missions/${id}/rapport`);
}

export async function verifierPointages(id: string, payload: VerifierPointagePayload): Promise<Mission> {
  return apiFetch<Mission>(`/missions/${id}/pointages/verification`, {
    method: "POST",
    body: payload,
  });
}

export async function pointageArrivee(
  missionId: string,
  latitude: number,
  longitude: number,
): Promise<Pointage> {
  return apiFetch<Pointage>("/missions/pointages/arrivee", {
    method: "POST",
    body: { mission_id: missionId, latitude, longitude },
  });
}

export async function pointageSortie(
  missionId: string,
  latitude: number,
  longitude: number,
): Promise<Pointage> {
  return apiFetch<Pointage>("/missions/pointages/sortie", {
    method: "POST",
    body: { mission_id: missionId, latitude, longitude },
  });
}

export async function addMissionPhoto(missionId: string, storageUrl: string): Promise<unknown> {
  return apiFetch("/missions/photos", {
    method: "POST",
    body: { mission_id: missionId, storage_url: storageUrl },
  });
}
