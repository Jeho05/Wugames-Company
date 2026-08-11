import { describe, expect, it } from "vitest";

import type { WorkerMission } from "@/app/lib/worker-data";
import { actionForMission, missionProgression, toWorkerMission, WORKFLOW } from "@/app/lib/worker-data";
import type { Mission } from "@/app/lib/contracts";

function mission(statut: Mission["statut"]): WorkerMission {
  return {
    id: "m",
    titre: "Mission",
    description: null,
    client: "Client",
    adresse: "Chantier",
    lat: null,
    lng: null,
    rayonMetres: 100,
    datePlanifiee: "aujourd'hui",
    statut,
    statutLabel: statut,
    progression: missionProgression(statut),
    filiale: "WUGAMS",
    photos: 0,
    dernierPointage: null,
    arrivagePointee: false,
    sortiePointee: false,
    contact: null,
    pointages: [],
  };
}

describe("WORKFLOW", () => {
  it("ordonne les statuts de la planification à la clôture", () => {
    expect(WORKFLOW).toEqual([
      "PLANIFIE",
      "NOTIFIE",
      "ACCEPTE",
      "EN_COURS",
      "RAPPORT_SOUMIS",
      "VALIDE",
      "TERMINE",
    ]);
  });
});

describe("missionProgression", () => {
  it("progresse de 5 % à 100 % le long du workflow", () => {
    expect(missionProgression("PLANIFIE")).toBe(5);
    expect(missionProgression("EN_COURS")).toBe(60);
    expect(missionProgression("POINTAGE_A_VERIFIER")).toBe(65);
    expect(missionProgression("RAPPORT_SOUMIS")).toBe(80);
    expect(missionProgression("TERMINE")).toBe(100);
  });
});

describe("actionForMission", () => {
  it("demande l'acceptation d'une mission notifiée", () => {
    expect(actionForMission(mission("NOTIFIE"), false, false)).toEqual({ kind: "accepter" });
  });

  it("demande le pointage d'arrivée après acceptation", () => {
    expect(actionForMission(mission("ACCEPTE"), false, false)).toEqual({ kind: "pointer_arrivee" });
  });

  it("impose une photo avant le rapport en cours de mission", () => {
    expect(actionForMission(mission("EN_COURS"), false, true)).toEqual({ kind: "ajouter_photo" });
  });

  it("impose un brouillon avant de soumettre le rapport", () => {
    expect(actionForMission(mission("EN_COURS"), true, false)).toEqual({ kind: "rediger_rapport" });
  });

  it("propose de soumettre le rapport une fois photo et brouillon prêts", () => {
    expect(actionForMission(mission("EN_COURS"), true, true)).toEqual({ kind: "soumettre_rapport" });
  });

  it("attend la validation pour les statuts à vérifier", () => {
    expect(actionForMission(mission("POINTAGE_A_VERIFIER"), true, true)).toEqual({
      kind: "attente_validation",
    });
    expect(actionForMission(mission("RAPPORT_SOUMIS"), true, true)).toEqual({
      kind: "attente_validation",
    });
  });

  it("considère les missions validées et terminées comme closes", () => {
    expect(actionForMission(mission("VALIDE"), true, true)).toEqual({ kind: "terminee" });
    expect(actionForMission(mission("TERMINE"), true, true)).toEqual({ kind: "terminee" });
  });
});

describe("toWorkerMission", () => {
  it("mappe une mission API vers la vue ouvrier", () => {
    const api: Mission = {
      id: "m1",
      titre: "Peinture façade",
      description: "Deux couches",
      statut: "EN_COURS",
      filiale_id: "f1",
      client_id: null,
      ouvrier_id: null,
      rapport_texte: null,
      date_planifiee: new Date().toISOString(),
      adresse_lat: 5.32,
      adresse_lng: -4.01,
      rayon_tolerance_metres: 150,
      validateur_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      filiale: { id: "f1", nom: "Construction", code: "CONS" },
      pointages: [
        {
          id: "p1",
          mission_id: "m1",
          ouvrier_id: "u1",
          type: "ARRIVEE",
          latitude: 5.32,
          longitude: -4.01,
          horodatage: new Date().toISOString(),
          distance_calculee_m: 12,
          hors_rayon: false,
        },
      ],
      photos: [{ id: "ph1", mission_id: "m1", storage_url: "https://x/y.jpg", uploaded_at: new Date().toISOString() }],
    };

    const view = toWorkerMission(api);
    expect(view.arrivagePointee).toBe(true);
    expect(view.sortiePointee).toBe(false);
    expect(view.photos).toBe(1);
    expect(view.filiale).toBe("Construction");
    expect(view.rayonMetres).toBe(150);
  });
});
