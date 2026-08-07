import { StatusBadge } from "@/app/components/ui/status-badge";
import {
  commandeStatutMeta,
  devisStatutMeta,
  factureStatutMeta,
  missionStatutMeta,
} from "@/app/lib/client-data";
import type { CommandeStatut, DevisStatut } from "@/app/lib/client-data";
import type { FactureStatut, MissionStatut } from "@/app/lib/contracts";

export function MissionBadge({ statut }: { statut: MissionStatut }) {
  const meta = missionStatutMeta[statut];
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

export function FactureBadge({ statut }: { statut: FactureStatut }) {
  const meta = factureStatutMeta[statut];
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

export function DevisBadge({ statut }: { statut: DevisStatut }) {
  const meta = devisStatutMeta[statut];
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

export function CommandeBadge({ statut }: { statut: CommandeStatut }) {
  const meta = commandeStatutMeta[statut];
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}
