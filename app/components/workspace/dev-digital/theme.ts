export const C = {
  bg: "#0a0f1e",
  surface: "#0f172f",
  surfaceElevated: "#16224a",
  border: "rgba(148,163,207,0.12)",
  borderStrong: "rgba(148,163,207,0.22)",
  text: "#e9eefb",
  muted: "#8b96b3",
  faint: "#5c6889",
  blue: "#5cc8ff",
  cyan: "#7dd3fc",
  violet: "#a78bfa",
  green: "#3ddc97",
  amber: "#f5b84d",
  rose: "#f58ea8",
  slate: "#9aa7c7",
};

/* Signature visuelle des actions d'audit. Les actions inconnues
   reçoivent une fallback slate — jamais de capacité inventée. */
export const ACTION_META: Record<string, { color: string; soft: string; label: string }> = {
  CREATE: { color: C.green, soft: "rgba(61,220,151,0.14)", label: "CREATE" },
  UPDATE: { color: C.amber, soft: "rgba(245,184,77,0.14)", label: "UPDATE" },
  DELETE: { color: C.rose, soft: "rgba(245,142,168,0.14)", label: "DELETE" },
};

export function actionMeta(action: string): { color: string; soft: string; label: string } {
  return ACTION_META[action] ?? { color: C.slate, soft: "rgba(154,167,199,0.14)", label: action };
}