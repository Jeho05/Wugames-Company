import { apiFetch } from "@/app/lib/api-client";
import type {
  ClientDocument,
  ClientProfile,
  ClientProjet,
  Commande,
  Devis,
  DemandeDevis,
  Facture,
  Fidelite,
  Mission,
} from "@/app/lib/contracts";

export async function getProfil(): Promise<ClientProfile> {
  return apiFetch<ClientProfile>("/client-space/profil");
}

export async function getFactures(): Promise<Facture[]> {
  return apiFetch<Facture[]>("/client-space/factures");
}

export async function getCommandes(): Promise<Commande[]> {
  return apiFetch<Commande[]>("/client-space/commandes");
}

export async function getMissions(): Promise<Mission[]> {
  return apiFetch<Mission[]>("/client-space/missions");
}

export async function getDevis(): Promise<Devis[]> {
  return apiFetch<Devis[]>("/client-space/devis");
}

export async function getDemandes(): Promise<DemandeDevis[]> {
  return apiFetch<DemandeDevis[]>("/client-space/demandes");
}

export async function createDemande(payload: { libelle: string; service: string }): Promise<DemandeDevis> {
  return apiFetch<DemandeDevis>("/client-space/demandes", { method: "POST", body: payload });
}

export async function getProjets(): Promise<ClientProjet[]> {
  return apiFetch<ClientProjet[]>("/client-space/projets");
}

export async function getDocuments(): Promise<ClientDocument[]> {
  return apiFetch<ClientDocument[]>("/client-space/documents");
}

export async function getFidelite(): Promise<Fidelite> {
  return apiFetch<Fidelite>("/client-space/fidelite");
}