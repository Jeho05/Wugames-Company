import { describe, expect, it } from "vitest";

import { computeExpiry, getSafeRedirect } from "@/app/lib/api-client";

describe("computeExpiry", () => {
  const now = 1_750_000_000_000;

  it("parse une durée en jours ('7d')", () => {
    expect(computeExpiry("7d", now)).toBe(now + 7 * 86_400_000);
  });

  it("parse une durée en heures ('1h')", () => {
    expect(computeExpiry("1h", now)).toBe(now + 3_600_000);
  });

  it("parse une durée en minutes ('2m')", () => {
    expect(computeExpiry("2m", now)).toBe(now + 120_000);
  });

  it("interprète un nombre nu comme des secondes", () => {
    expect(computeExpiry("900", now)).toBe(now + 900_000);
    expect(computeExpiry(900, now)).toBe(now + 900_000);
  });

  it("retombe sur 7 jours quand la valeur est absente", () => {
    expect(computeExpiry(undefined, now)).toBe(now + 7 * 86_400_000);
  });

  it("retombe sur 7 jours quand la valeur est illisible", () => {
    expect(computeExpiry("abc", now)).toBe(now + 7 * 86_400_000);
    expect(computeExpiry("", now)).toBe(now + 7 * 86_400_000);
  });

  it("accepte les espaces autour de la valeur", () => {
    expect(computeExpiry(" 7d ", now)).toBe(now + 7 * 86_400_000);
  });
});

describe("getSafeRedirect — anti open-redirect post-login", () => {
  it("conserve une route interne demandée", () => {
    expect(getSafeRedirect("/espace/missions")).toBe("/espace/missions");
    expect(getSafeRedirect("/espace/devis?creer=1")).toBe("/espace/devis?creer=1");
  });

  it("retombe sur /espace quand la destination est absente", () => {
    expect(getSafeRedirect(null)).toBe("/espace");
    expect(getSafeRedirect(undefined)).toBe("/espace");
    expect(getSafeRedirect("")).toBe("/espace");
  });

  it("rejette les URL externes et les protocoles", () => {
    expect(getSafeRedirect("https://evil.test/phish")).toBe("/espace");
    expect(getSafeRedirect("//evil.test/espace")).toBe("/espace");
    expect(getSafeRedirect("javascript:alert(1)")).toBe("/espace");
    expect(getSafeRedirect("https://evil.test")).toBe("/espace");
  });
});
