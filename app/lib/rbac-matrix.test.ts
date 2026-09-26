import { describe, expect, it } from "vitest";

import type { AuthUser } from "@/app/lib/auth-context";
import {
  ALL_ROLES,
  canAssignMission,
  canConvertDevis,
  canCreate,
  canDelete,
  canSeeConsolidation,
  canUpdate,
  canVerifyPointage,
  filialeScopeOf,
  quickActionsFor,
} from "@/app/lib/rbac-matrix";

function user(role: AuthUser["role"]): AuthUser {
  return {
    id: "u-1",
    email: "test@wugams.test",
    filiale: "Siège",
    filialeId: "f-1",
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

describe("rbac-matrix — périmètre filiale (SPEC-BACKEND §3)", () => {
  it("réserve la consolidation au Gérant, Dev Digital et Comptable", () => {
    expect(canSeeConsolidation("ROLE_GERANT")).toBe(true);
    expect(canSeeConsolidation("ROLE_DEV_DIGITAL")).toBe(true);
    expect(canSeeConsolidation("ROLE_COMPTABLE")).toBe(true);
    expect(canSeeConsolidation("ROLE_MGR_FILIALE")).toBe(false);
    expect(canSeeConsolidation("ROLE_RESP_OUVRIERS")).toBe(false);
    expect(canSeeConsolidation("ROLE_OUVRIER")).toBe(false);
    expect(canSeeConsolidation("ROLE_SECRETAIRE")).toBe(false);
    expect(canSeeConsolidation("ROLE_MGR_OPS")).toBe(false);
  });

  it("verrouille Manager Filiale / Ouvrier / Fournisseur / Clients sur leur périmètre", () => {
    expect(filialeScopeOf("ROLE_MGR_FILIALE")).toBe("own");
    expect(filialeScopeOf("ROLE_RESP_OUVRIERS")).toBe("own");
    expect(filialeScopeOf("ROLE_OUVRIER")).toBe("own");
    expect(filialeScopeOf("ROLE_FOURNISSEUR")).toBe("own");
    expect(filialeScopeOf("ROLE_CLIENT_STD")).toBe("none");
    expect(filialeScopeOf("ROLE_CLIENT_MEMBRE")).toBe("none");
  });

  it("couvre les 12 rôles métier", () => {
    expect(ALL_ROLES).toHaveLength(12);
  });
});

describe("rbac-matrix — quick actions (jamais affichées sans droit réel)", () => {
  it("ne propose rien aux clients, fournisseurs et ouvriers", () => {
    expect(quickActionsFor(user("ROLE_CLIENT_STD"))).toEqual([]);
    expect(quickActionsFor(user("ROLE_CLIENT_MEMBRE"))).toEqual([]);
    expect(quickActionsFor(user("ROLE_FOURNISSEUR"))).toEqual([]);
    expect(quickActionsFor(user("ROLE_OUVRIER"))).toEqual([]);
  });

  it("ne propose la facture qu'aux rôles autorisés", () => {
    const gerant = quickActionsFor(user("ROLE_GERANT")).map((a) => a.href);
    expect(gerant).toContain("/espace/factures?creer=1");
    const comptable = quickActionsFor(user("ROLE_COMPTABLE")).map((a) => a.href);
    expect(comptable).toContain("/espace/factures?creer=1");
    expect(comptable).not.toContain("/espace/missions?creer=1");
    const resp = quickActionsFor(user("ROLE_RESP_OUVRIERS")).map((a) => a.href);
    expect(resp).not.toContain("/espace/factures?creer=1");
    expect(resp).not.toContain("/espace/devis?creer=1");
  });

  it("ne propose l'administration qu'au Gérant", () => {
    expect(quickActionsFor(user("ROLE_GERANT")).map((a) => a.href)).toContain("/espace/administration?creer=1");
    expect(quickActionsFor(user("ROLE_SECRETAIRE")).map((a) => a.href)).not.toContain("/espace/administration?creer=1");
    expect(quickActionsFor(user("ROLE_MGR_OPS")).map((a) => a.href)).not.toContain("/espace/administration?creer=1");
  });
});

describe("rbac-matrix — actions par module (lecture ≠ création)", () => {
  it("réserve l'affectation des missions aux rôles terrain autorisés", () => {
    expect(canAssignMission("ROLE_GERANT")).toBe(true);
    expect(canAssignMission("ROLE_MGR_OPS")).toBe(true);
    expect(canAssignMission("ROLE_MGR_FILIALE")).toBe(true);
    expect(canAssignMission("ROLE_RESP_OUVRIERS")).toBe(true);
    expect(canAssignMission("ROLE_OUVRIER")).toBe(false);
    expect(canAssignMission("ROLE_CLIENT_STD")).toBe(false);
    expect(canAssignMission("ROLE_FOURNISSEUR")).toBe(false);
    expect(canAssignMission("ROLE_COMPTABLE")).toBe(false);
    expect(canAssignMission("ROLE_SECRETAIRE")).toBe(false);
  });

  it("réserve la vérification des pointages (SPEC §3)", () => {
    expect(canVerifyPointage("ROLE_RESP_OUVRIERS")).toBe(true);
    expect(canVerifyPointage("ROLE_MGR_FILIALE")).toBe(true);
    expect(canVerifyPointage("ROLE_OUVRIER")).toBe(false);
    expect(canVerifyPointage("ROLE_CLIENT_MEMBRE")).toBe(false);
  });

  it("réserve la conversion devis → facture", () => {
    expect(canConvertDevis("ROLE_COMPTABLE")).toBe(true);
    expect(canConvertDevis("ROLE_SECRETAIRE")).toBe(true);
    expect(canConvertDevis("ROLE_MGR_OPS")).toBe(false);
    expect(canConvertDevis("ROLE_OUVRIER")).toBe(false);
  });

  it("distingue création et suppression (ex. devis supprimé par Gérant seul)", () => {
    expect(canCreate("devis", "ROLE_SECRETAIRE")).toBe(true);
    expect(canDelete("devis", "ROLE_SECRETAIRE")).toBe(false);
    expect(canDelete("devis", "ROLE_GERANT")).toBe(true);
    expect(canCreate("stocks", "ROLE_COMPTABLE")).toBe(false);
    expect(canUpdate("stocks", "ROLE_MGR_FILIALE")).toBe(true);
    expect(canCreate("filiales", "ROLE_MGR_FILIALE")).toBe(false);
  });
});
