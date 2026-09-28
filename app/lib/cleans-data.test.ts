import { afterEach, describe, expect, it, vi } from "vitest";

import { cleansApiErrorOverview, emptyCleansOverview, loadCleansOverview } from "@/app/lib/cleans-data";

/**
 * Wugams Clean : une erreur API ne doit JAMAIS être présentée comme
 * "Aucun abonnement". Trois états distincts : success / no_subscription /
 * api_error.
 */

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadCleansOverview — vide ≠ erreur", () => {
  it("retourne success quand l'API confirme un abonnement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          abonnement: { ...emptyCleansOverview.abonnement, statut: "ACTIF", planId: "plan-a" },
          services: [],
        }),
      ),
    );
    const result = await loadCleansOverview();
    expect(result.source).toBe("api");
    expect(result.status).toBe("success");
    expect(result.errorMessage).toBeNull();
  });

  it("retourne no_subscription quand l'API confirme l'absence d'abonnement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          abonnement: { ...emptyCleansOverview.abonnement, statut: "AUCUN" },
          services: [],
        }),
      ),
    );
    const result = await loadCleansOverview();
    expect(result.source).toBe("api");
    expect(result.status).toBe("no_subscription");
  });

  it("retourne api_error (jamais 'aucun abonnement') quand l'API est en erreur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    const result = await loadCleansOverview();
    expect(result.source).toBe("error");
    expect(result.status).toBe("api_error");
    expect(result.abonnement.statut).toBe("AUCUN");
    expect(result.errorMessage).toBeTruthy();
  });

  it("retourne api_error quand l'API répond 500", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ message: "boom" }, 500)));
    const result = await loadCleansOverview();
    expect(result.status).toBe("api_error");
  });

  it("cleansApiErrorOverview marque explicitement l'erreur", () => {
    const result = cleansApiErrorOverview("HS");
    expect(result.status).toBe("api_error");
    expect(result.source).toBe("error");
    expect(result.errorMessage).toBe("HS");
  });
});
