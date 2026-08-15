import { apiFetch } from "@/app/lib/api-client";
import type { Prime, UpdatePrimePayload } from "@/app/lib/contracts";

export type PrimeFilters = {
  mois?: string;
  filiale_id?: string;
};

export async function listPrimes(filters: PrimeFilters = {}): Promise<Prime[]> {
  return apiFetch<Prime[]>("/primes", { query: filters });
}

export async function getPrime(id: string): Promise<Prime> {
  return apiFetch<Prime>(`/primes/${id}`);
}

export async function calculerPrimes(mois: string, filialeId?: string): Promise<Prime[]> {
  return apiFetch<Prime[]>("/primes/calculer", {
    method: "POST",
    body: filialeId ? { mois, filiale_id: filialeId } : { mois },
  });
}

export async function updatePrime(id: string, payload: UpdatePrimePayload): Promise<Prime> {
  return apiFetch<Prime>(`/primes/${id}`, { method: "PATCH", body: payload });
}

export async function getPrimeMine(mois?: string): Promise<Prime[]> {
  return apiFetch<Prime[]>("/primes/mine", { query: { mois } });
}