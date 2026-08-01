import { apiFetch } from "@/app/lib/api-client";
import type { CreateEvaluationPayload, Evaluation, EvaluationRanking, MessageResponse } from "@/app/lib/contracts";

export async function listEvaluations(): Promise<Evaluation[]> {
  return apiFetch<Evaluation[]>("/evaluations");
}

export async function getEvaluation(id: string): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluations/${id}`);
}

export async function createEvaluation(payload: CreateEvaluationPayload): Promise<Evaluation> {
  return apiFetch<Evaluation>("/evaluations", { method: "POST", body: payload });
}

export type UpdateEvaluationPayload = Partial<
  Omit<CreateEvaluationPayload, "personne_id" | "personne_nom" | "cycle_label">
>;

export async function updateEvaluation(id: string, payload: UpdateEvaluationPayload): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluations/${id}`, { method: "PATCH", body: payload });
}

export async function removeEvaluation(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/evaluations/${id}`, { method: "DELETE" });
}

export async function evaluationRanking(cycleLabel?: string): Promise<EvaluationRanking> {
  return apiFetch<EvaluationRanking>("/evaluations/ranking", {
    query: cycleLabel ? { cycle_label: cycleLabel } : undefined,
  });
}
