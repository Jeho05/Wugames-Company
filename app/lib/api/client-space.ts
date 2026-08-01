import { apiFetch } from "@/app/lib/api-client";
import type { ClientProfile, Facture, Mission } from "@/app/lib/contracts";

export async function getProfil(): Promise<ClientProfile> {
  return apiFetch<ClientProfile>("/client-space/profil");
}

export async function getFactures(): Promise<Facture[]> {
  return apiFetch<Facture[]>("/client-space/factures");
}

export async function getCommandes(): Promise<unknown[]> {
  return apiFetch<unknown[]>("/client-space/commandes");
}

export async function getMissions(): Promise<Mission[]> {
  return apiFetch<Mission[]>("/client-space/missions");
}

export async function getDevis(): Promise<unknown[]> {
  return apiFetch<unknown[]>("/client-space/devis");
}
