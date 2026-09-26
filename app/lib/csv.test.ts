import { describe, expect, it } from "vitest";

import { buildCsv, csvEscapeCell } from "@/app/lib/csv";

describe("csvEscapeCell", () => {
  it("laisse les cellules simples sans guillemets", () => {
    expect(csvEscapeCell("Bonjour")).toBe("Bonjour");
    expect(csvEscapeCell(42)).toBe("42");
  });

  it("entoure de guillemets les cellules avec séparateur", () => {
    expect(csvEscapeCell("a;b")).toBe('"a;b"');
  });

  it("double les guillemets internes", () => {
    expect(csvEscapeCell('dit "bonjour"')).toBe('"dit ""bonjour"""');
  });

  it("protège les retours ligne et JSON", () => {
    expect(csvEscapeCell("ligne1\nligne2")).toBe('"ligne1\nligne2"');
    expect(csvEscapeCell({ a: 1 })).toBe('"{""a"":1}"');
  });

  it("vide pour null/undefined", () => {
    expect(csvEscapeCell(null)).toBe("");
    expect(csvEscapeCell(undefined)).toBe("");
  });
});

describe("buildCsv", () => {
  it("préfixe BOM + CRLF et échappe chaque cellule", () => {
    const csv = buildCsv(["Nom", "Note"], [["Koffi; Jr", 'dit "ok"']]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Nom;Note\r\n");
    expect(csv).toContain('"Koffi; Jr";"dit ""ok"""');
  });
});
