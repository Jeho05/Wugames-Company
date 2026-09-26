import { describe, expect, it } from "vitest";

import { canAccessHref } from "@/app/lib/permissions";
import type { AuthUser } from "@/app/lib/auth-context";

function user(role: AuthUser["role"], id = "u-1"): AuthUser {
  return {
    id,
    email: "test@wugams.test",
    filiale: "Siège",
    filialeId: null,
    initials: "TT",
    name: "Test",
    role,
    profileId: null,
    firstName: null,
    lastName: null,
    phone: null,
    adresse: null,
    clientProfileId: null,
    twoFactorEnabled: false,
  };
}

describe("canAccessHref — vitrine (production)", () => {
  it("autorise Gérant et Dev Digital sans délégation", () => {
    expect(canAccessHref("/espace/vitrine", user("ROLE_GERANT"))).toBe(true);
    expect(canAccessHref("/espace/vitrine", user("ROLE_DEV_DIGITAL"))).toBe(true);
  });

  it("refuse les autres rôles quand la délégation est inconnue (défaut)", () => {
    expect(canAccessHref("/espace/vitrine", user("ROLE_SECRETAIRE"))).toBe(false);
    expect(canAccessHref("/espace/vitrine", user("ROLE_SECRETAIRE"), [])).toBe(false);
  });

  it("autorise un délégué connu VIA L'API uniquement", () => {
    expect(canAccessHref("/espace/vitrine", user("ROLE_SECRETAIRE", "u-9"), ["u-9"])).toBe(true);
    expect(canAccessHref("/espace/vitrine", user("ROLE_SECRETAIRE", "u-9"), ["u-7"])).toBe(false);
  });

  it("refuse sans utilisateur", () => {
    expect(canAccessHref("/espace/vitrine", null)).toBe(false);
  });
});
