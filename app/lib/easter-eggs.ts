export const BRAND_SECRET_CLICKS = 5;
export const BRAND_CLICK_WINDOW_MS = 4_000;

export type BrandClickState = {
  hits: number;
  lastAt: number;
};

export function brandClickState(previous?: BrandClickState): BrandClickState {
  const now = Date.now();
  if (!previous || now - previous.lastAt > BRAND_CLICK_WINDOW_MS) {
    return { hits: 1, lastAt: now };
  }
  return { hits: previous.hits + 1, lastAt: now };
}

export function brandSecretArmed(state: BrandClickState): boolean {
  return state.hits >= BRAND_SECRET_CLICKS;
}

export function signConsole(): void {
  if (typeof console === "undefined") return;
  const styles = [
    "color:#e6ac49;font-weight:900;font-size:13px;",
    "color:#8fa8c8;font-size:12px;",
    "color:#5c6889;font-size:11px;",
  ];
  console.log(
    "%cWUGAMS%c · ERP multi-filiales — console du back-office\n%cAstuce : 5 clics rapides sur le logo ouvrent le coffre du gérant.",
    ...styles,
  );
}
