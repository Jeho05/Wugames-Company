import { describe, expect, it } from "vitest";

import { ApiError } from "@/app/lib/api-client";
import { loadModuleData, ModuleLoadError, toModuleLoadError } from "@/app/lib/module-data";

describe("toModuleLoadError", () => {
  it("classe 401/403/404/5xx/0", () => {
    expect(toModuleLoadError("stocks", new ApiError(401, "x")).kind).toBe("unauthorized");
    expect(toModuleLoadError("stocks", new ApiError(403, "x")).kind).toBe("forbidden");
    expect(toModuleLoadError("stocks", new ApiError(404, "x")).kind).toBe("not-found");
    expect(toModuleLoadError("stocks", new ApiError(500, "x")).kind).toBe("server");
    expect(toModuleLoadError("stocks", new ApiError(0, "timeout")).kind).toBe("timeout");
    expect(toModuleLoadError("stocks", new ApiError(0, "Failed to fetch")).kind).toBe("offline");
    expect(toModuleLoadError("stocks", new TypeError("fetch failed")).kind).toBe("offline");
  });
});

describe("loadModuleData (production)", () => {
  it("lève not-found sur slug inconnu (jamais null silencieux)", async () => {
    await expect(loadModuleData("inexistant", "ROLE_GERANT")).rejects.toMatchObject({
      name: "ModuleLoadError",
      kind: "not-found",
    });
  });

  it("refuse le module interdit à CE rôle sans appeler l'API (ForbiddenState immédiat)", async () => {
    await expect(loadModuleData("stocks", "ROLE_OUVRIER")).rejects.toMatchObject({
      name: "ModuleLoadError",
      kind: "forbidden",
    });
    await expect(loadModuleData("factures", "ROLE_OUVRIER")).rejects.toMatchObject({
      name: "ModuleLoadError",
      kind: "forbidden",
    });
    await expect(loadModuleData("clients", "ROLE_FOURNISSEUR")).rejects.toMatchObject({
      name: "ModuleLoadError",
      kind: "forbidden",
    });
  });

  it("ne retourne jamais source demo", async () => {
    // Seul un slug inconnu est testable sans réseau ; il doit lever, pas retomber en démo.
    const err = await loadModuleData("inexistant", "ROLE_GERANT").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ModuleLoadError);
  });
});
