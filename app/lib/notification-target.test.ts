import { describe, expect, it } from "vitest";

import type { Notification } from "@/app/lib/contracts";
import { resolveNotificationHref, resolveNotificationTarget } from "@/app/lib/notification-target";

function notification(type: string, message = ""): Notification {
  return { id: "n-1", type, message };
}

describe("notification-target — garde RBAC (même matrice que sidebar)", () => {
  it("envoie le gérant vers le module concerné", () => {
    const target = resolveNotificationTarget(notification("alerte_stock", "rupture de stock"), "ROLE_GERANT");
    expect(target?.href).toBe("/espace/stocks");
  });

  it("ne dirige jamais un ouvrier vers un module interdit (repli notifications)", () => {
    const target = resolveNotificationTarget(notification("alerte_stock", "rupture de stock"), "ROLE_OUVRIER");
    expect(target?.href).toBe("/espace/notifications");
  });

  it("ne dirige jamais un fournisseur vers les missions internes", () => {
    const target = resolveNotificationTarget(notification("nouvelle_mission"), "ROLE_FOURNISSEUR");
    expect(target?.href).toBe("/espace/notifications");
  });

  it("garde les missions accessibles à l'ouvrier", () => {
    const target = resolveNotificationTarget(notification("nouvelle_mission"), "ROLE_OUVRIER");
    expect(target?.href).toBe("/espace/missions");
  });

  it("resolveNotificationHref ne retourne jamais une route interdite", () => {
    expect(resolveNotificationHref(notification("facture_en_retard"), "ROLE_OUVRIER")).toBe(
      "/espace/notifications",
    );
    expect(resolveNotificationHref(notification("facture_en_retard"), "ROLE_COMPTABLE")).toBe("/espace/devis");
  });
});
