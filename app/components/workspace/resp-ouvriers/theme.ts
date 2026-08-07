import type { FieldLevel, FieldStatus } from "@/app/lib/resp-ouvriers-data";
import type { MissionStatut } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Palette WUGAMS Field Command — surfaces profondes, halos discrets   */
/* ------------------------------------------------------------------ */

export const C = {
  bg: "#0a0f1e",
  bgDeep: "#070b16",
  panel: "#0f172f",
  panelSoft: "#131c38",
  panelRaised: "#16224a",
  line: "rgba(148, 163, 207, 0.14)",
  lineSoft: "rgba(148, 163, 207, 0.08)",
  lineStrong: "rgba(148, 163, 207, 0.26)",
  text: "#dbe4f5",
  muted: "#8b96b3",
  faint: "#5c6889",
  gold: "#e3a641",
  goldBright: "#f6cb76",
  cyan: "#5cc8ff",
  green: "#3ddc97",
  amber: "#f5b84d",
  rose: "#ff8ba0",
  violet: "#a78bfa",
};

export type Tone = "slate" | "cyan" | "gold" | "green" | "amber" | "rose" | "violet";

export const TONE_HEX: Record<Tone, string> = {
  slate: "#8b96b3",
  cyan: C.cyan,
  gold: C.gold,
  green: C.green,
  amber: C.amber,
  rose: C.rose,
  violet: C.violet,
};

export const TONE_CHIP: Record<Tone, string> = {
  slate: "border-white/10 bg-white/[0.05] text-slate-300",
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  gold: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-300",
};

/* ------------------------------------------------------------------ */
/* Statuts de mission → langage visuel                                 */
/* ------------------------------------------------------------------ */

export const STATUS: Record<MissionStatut, { label: string; tone: Tone; hex: string; chip: string }> = {
  PLANIFIE: { label: "Planifiée", tone: "slate", hex: TONE_HEX.slate, chip: TONE_CHIP.slate },
  NOTIFIE: { label: "Notifiée", tone: "cyan", hex: TONE_HEX.cyan, chip: TONE_CHIP.cyan },
  ACCEPTE: { label: "Acceptée", tone: "gold", hex: TONE_HEX.gold, chip: TONE_CHIP.gold },
  EN_COURS: { label: "En cours", tone: "green", hex: TONE_HEX.green, chip: TONE_CHIP.green },
  RAPPORT_SOUMIS: { label: "Rapport soumis", tone: "amber", hex: TONE_HEX.amber, chip: TONE_CHIP.amber },
  VALIDE: { label: "Validée", tone: "green", hex: TONE_HEX.green, chip: TONE_CHIP.green },
  TERMINE: { label: "Terminée", tone: "slate", hex: "#6b7a9c", chip: TONE_CHIP.slate },
  POINTAGE_A_VERIFIER: { label: "Pointage à vérifier", tone: "rose", hex: TONE_HEX.rose, chip: TONE_CHIP.rose },
};

/* ------------------------------------------------------------------ */
/* Niveaux d'attention                                                 */
/* ------------------------------------------------------------------ */

export const LEVEL: Record<FieldLevel, { hex: string; soft: string; label: string; bar: string; chip: string }> = {
  normal: {
    hex: TONE_HEX.slate,
    soft: "rgba(139, 150, 179, 0.10)",
    label: "Normal",
    bar: "bg-slate-400/60",
    chip: TONE_CHIP.slate,
  },
  attention: {
    hex: TONE_HEX.amber,
    soft: "rgba(245, 184, 77, 0.12)",
    label: "Attention",
    bar: "bg-amber-400",
    chip: TONE_CHIP.amber,
  },
  critical: {
    hex: TONE_HEX.rose,
    soft: "rgba(255, 139, 160, 0.12)",
    label: "Critique",
    bar: "bg-rose-400",
    chip: TONE_CHIP.rose,
  },
};

export const FIELD_STATUS: Record<FieldStatus, { label: string; hex: string; soft: string; ring: string }> = {
  operational: { label: "OPERATIONAL", hex: TONE_HEX.green, soft: "rgba(61, 220, 151, 0.14)", ring: "border-emerald-400/30" },
  attention: { label: "ATTENTION", hex: TONE_HEX.amber, soft: "rgba(245, 184, 77, 0.14)", ring: "border-amber-400/30" },
  "action-required": { label: "ACTION REQUIRED", hex: TONE_HEX.rose, soft: "rgba(255, 139, 160, 0.14)", ring: "border-rose-400/30" },
};

export const WORKER_STATE: Record<string, { label: string; hex: string; chip: string }> = {
  sur_site: { label: "Sur site", hex: TONE_HEX.green, chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  en_route: { label: "En route", hex: TONE_HEX.cyan, chip: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300" },
  disponible: { label: "Disponible", hex: TONE_HEX.amber, chip: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
  offline: { label: "Hors ligne", hex: "#6b7a9c", chip: "border-white/10 bg-white/[0.05] text-slate-400" },
};
