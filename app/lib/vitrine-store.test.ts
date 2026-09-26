import { describe, expect, it } from "vitest";

import { canManageVitrine, getDelegatedIds } from "@/app/lib/vitrine-store";

describe("vitrine-store (production)", () => {
  it("n'accorde aucune délégation locale (toujours vide)", () => {
    expect(getDelegatedIds()).toEqual([]);
  });

  it("autorise Gérant / Dev Digital par rôle uniquement", () => {
    expect(canManageVitrine({ id: "a", role: "ROLE_GERANT" })).toBe(true);
    expect(canManageVitrine({ id: "a", role: "ROLE_DEV_DIGITAL" })).toBe(true);
  });

  it("refuse les autres rôles sans délégation API", () => {
    expect(canManageVitrine({ id: "a", role: "ROLE_SECRETAIRE" })).toBe(false);
    expect(canManageVitrine(null)).toBe(false);
  });

  it("accepte une délégation fournie par l'API (paramètre explicite)", () => {
    expect(canManageVitrine({ id: "u-9", role: "ROLE_SECRETAIRE" }, ["u-9"])).toBe(true);
    expect(canManageVitrine({ id: "u-9", role: "ROLE_SECRETAIRE" }, ["u-7"])).toBe(false);
  });
});
