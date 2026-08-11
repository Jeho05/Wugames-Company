import { describe, expect, it } from "vitest";

import {
  BRAND_CLICK_WINDOW_MS,
  BRAND_SECRET_CLICKS,
  brandClickState,
  brandSecretArmed,
} from "@/app/lib/easter-eggs";
import type { BrandClickState } from "@/app/lib/easter-eggs";

describe("brandClickState", () => {
  it("démarre à un clic", () => {
    expect(brandClickState().hits).toBe(1);
  });

  it("accumule les clics dans la fenêtre", () => {
    let state = brandClickState();
    for (let i = 0; i < 4; i++) {
      state = brandClickState(state);
    }
    expect(state.hits).toBe(BRAND_SECRET_CLICKS);
  });

  it("réinitialise après expiration de la fenêtre", () => {
    const stale: BrandClickState = { hits: BRAND_SECRET_CLICKS - 1, lastAt: Date.now() - (BRAND_CLICK_WINDOW_MS + 1) };
    expect(brandClickState(stale).hits).toBe(1);
  });

  it("n'est armé qu'à partir du seuil", () => {
    const almost: BrandClickState = { hits: BRAND_SECRET_CLICKS - 1, lastAt: Date.now() };
    expect(brandSecretArmed(almost)).toBe(false);

    let state = brandClickState();
    for (let i = 1; i < BRAND_SECRET_CLICKS; i++) {
      state = brandClickState(state);
    }
    expect(brandSecretArmed(state)).toBe(true);
  });
});
