import { describe, expect, it } from "vitest";

import {
  rendement9S,
  rendementGlobal,
  rendementTexte,
  RENDEMENT_9S_WEIGHT,
  RENDEMENT_TEXTE_WEIGHT,
  TEXT_BASE,
  TOTAL_BASE,
  WEEK_BASE,
} from "@/app/lib/rendement";

describe("constantes BR-08 / BR-14", () => {
  it("pose les bases 40/semaine, 9 semaines et 50 pour la note texte", () => {
    expect(WEEK_BASE).toBe(40);
    expect(TOTAL_BASE).toBe(360);
    expect(TEXT_BASE).toBe(50);
    expect(RENDEMENT_9S_WEIGHT).toBe(0.7);
    expect(RENDEMENT_TEXTE_WEIGHT).toBe(0.3);
  });
});

describe("rendement9S", () => {
  it("renvoie 100 % quand toutes les semaines sont au max (40/40)", () => {
    expect(rendement9S([40, 40, 40, 40, 40, 40, 40, 40, 40])).toBe(100);
  });

  it("renvoie 90 % pour 9 semaines à 36", () => {
    expect(rendement9S([36, 36, 36, 36, 36, 36, 36, 36, 36])).toBeCloseTo(90, 6);
  });

  it("calcule le total sur la grille de démo (338/360)", () => {
    const semaines = [36, 38, 40, 34, 39, 37, 38, 36, 40];
    expect(rendement9S(semaines)).toBeCloseTo((338 / TOTAL_BASE) * 100, 6);
  });

  it("renvoie 0 pour une grille vide", () => {
    expect(rendement9S([])).toBe(0);
  });
});

describe("rendementTexte", () => {
  it("renvoie 100 % pour 50/50", () => {
    expect(rendementTexte(50)).toBe(100);
  });

  it("calcule un ratio sur base 50", () => {
    expect(rendementTexte(44)).toBeCloseTo(88, 6);
  });
});

describe("rendementGlobal (BR-14)", () => {
  it("pondère 70/30 le rendement 9S et le rendement texte", () => {
    const semaines = [40, 40, 40, 40, 40, 40, 40, 40, 40];
    const global = rendementGlobal(semaines, 50);
    expect(global).toBe(100);
    expect(global).toBeCloseTo(rendement9S(semaines) * 0.7 + rendementTexte(50) * 0.3, 6);
  });

  it("reproduit l'exemple de l'UI (338/360 et 44/50)", () => {
    const semaines = [36, 38, 40, 34, 39, 37, 38, 36, 40];
    const global = rendementGlobal(semaines, 44);
    expect(global).toBeCloseTo(93.88888888888889 * 0.7 + 88 * 0.3, 6);
  });
});
