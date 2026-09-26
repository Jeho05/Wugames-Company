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

describe("canAccessHref — matrice modules (sidebar = recherche)", () => {
  it("interdit les modules ERP à l'ouvrier (Pilotage, Stocks, Factures…)", () => {
    expect(canAccessHref("/espace/stocks", user("ROLE_OUVRIER"))).toBe(false);
    expect(canAccessHref("/espace/factures", user("ROLE_OUVRIER"))).toBe(false);
    expect(canAccessHref("/espace/clients", user("ROLE_OUVRIER"))).toBe(false);
    expect(canAccessHref("/espace/rapports", user("ROLE_OUVRIER"))).toBe(false);
    expect(canAccessHref("/espace/administration", user("ROLE_OUVRIER"))).toBe(false);
  });

  it("autorise l'ouvrier sur son périmètre (missions, carte, notifications)", () => {
    expect(canAccessHref("/espace/missions", user("ROLE_OUVRIER"))).toBe(true);
    expect(canAccessHref("/espace/carte", user("ROLE_OUVRIER"))).toBe(true);
    expect(canAccessHref("/espace/notifications", user("ROLE_OUVRIER"))).toBe(true);
  });

  it("expose les factures aux rôles autorisés (sidebar + recherche cohérentes)", () => {
    expect(canAccessHref("/espace/factures", user("ROLE_GERANT"))).toBe(true);
    expect(canAccessHref("/espace/factures", user("ROLE_COMPTABLE"))).toBe(true);
    expect(canAccessHref("/espace/factures", user("ROLE_MGR_PARTENAIRE"))).toBe(false);
    expect(canAccessHref("/espace/factures", user("ROLE_RESP_OUVRIERS"))).toBe(false);
  });

  it("autorise Mode2Vie aux clients uniquement", () => {
    expect(canAccessHref("/espace/mode2vie", user("ROLE_CLIENT_STD"))).toBe(true);
    expect(canAccessHref("/espace/mode2vie", user("ROLE_CLIENT_MEMBRE"))).toBe(true);
    expect(canAccessHref("/espace/mode2vie", user("ROLE_OUVRIER"))).toBe(false);
    expect(canAccessHref("/espace/mode2vie", user("ROLE_SECRETAIRE"))).toBe(false);
  });

  it("restreint l'administration au Gérant et Dev Digital", () => {
    expect(canAccessHref("/espace/administration", user("ROLE_GERANT"))).toBe(true);
    expect(canAccessHref("/espace/administration", user("ROLE_DEV_DIGITAL"))).toBe(true);
    expect(canAccessHref("/espace/administration", user("ROLE_SECRETAIRE"))).toBe(false);
    expect(canAccessHref("/espace/administration", user("ROLE_COMPTABLE"))).toBe(false);
  });
});
