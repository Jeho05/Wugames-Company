import { describe, expect, it } from "vitest";

import { computeExpiry } from "@/app/lib/api-client";

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
