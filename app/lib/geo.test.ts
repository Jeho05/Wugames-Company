import { describe, expect, it } from "vitest";

import { formatDistance, haversineMeters, relativeTime } from "@/app/lib/geo";

describe("haversineMeters", () => {
  it("renvoie 0 pour deux points identiques", () => {
    expect(haversineMeters(5.3482, -4.0185, 5.3482, -4.0185)).toBe(0);
  });

  it("approche 111 km pour 1 degré d'écart sur l'équateur", () => {
    const distance = haversineMeters(0, 0, 0, 1);
    expect(distance).toBeGreaterThan(111_000);
    expect(distance).toBeLessThan(111_300);
  });

  it("calcule une distance réaliste pour deux pointages voisins (Abidjan)", () => {
    const distance = haversineMeters(5.3482, -4.0185, 5.3483, -4.0186);
    expect(distance).toBeGreaterThan(10);
    expect(distance).toBeLessThan(25);
  });

  it("est symétrique", () => {
    const a = haversineMeters(5.3482, -4.0185, 5.3121, -3.9936);
    const b = haversineMeters(5.3121, -3.9936, 5.3482, -4.0185);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("formatDistance", () => {
  it("formate en mètres arrondis à 10", () => {
    expect(formatDistance(42.5)).toBe("40 m");
    expect(formatDistance(999)).toBe("1000 m");
  });

  it("formate en kilomètres au-delà de 1 km", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(2345)).toBe("2.3 km");
  });
});

describe("relativeTime", () => {
  it("gère les dates invalides", () => {
    expect(relativeTime("pas-une-date")).toBe("—");
  });

  it("gère la valeur d'entrée invalide via Date", () => {
    expect(relativeTime("2026-13-99")).toBe("—");
  });

  it("formate les minutes, heures et jours", () => {
    const now = Date.now();
    expect(relativeTime(new Date(now - 30_000).toISOString())).toBe("À l'instant");
    expect(relativeTime(new Date(now - 5 * 60_000).toISOString())).toBe("Il y a 5 min");
    expect(relativeTime(new Date(now - 3 * 3_600_000).toISOString())).toBe("Il y a 3 h");
    expect(relativeTime(new Date(now - 24 * 3_600_000).toISOString())).toBe("Hier");
  });
});
