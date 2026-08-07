import type { IconName } from "@/app/components/ui/app-icon";
import * as missionsApi from "@/app/lib/api/missions";
import * as notificationsApi from "@/app/lib/api/notifications";
import * as usersApi from "@/app/lib/api/users";
import type { Mission, MissionStatut, Notification } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FieldStatus = "operational" | "attention" | "action-required";
export type FieldLevel = "normal" | "attention" | "critical";

export type FieldPointage = {
  id: string;
  type: "ARRIVEE" | "SORTIE";
  latitude: number;
  longitude: number;
  horodatage: string;
  distanceMetres: number | null;
  horsRayon: boolean;
  rayonMetres: number;
};

export type FieldMission = {
  id: string;
  numero: string;
  titre: string;
  description: string | null;
  client: string;
  adresse: string;
  filiere: string;
  statut: MissionStatut;
  statutLabel: string;
  progression: number;
  workerId: string | null;
  workerNom: string;
  heurePlanifiee: string;
  photos: number;
  rapportTexte: string | null;
  rapportAuteur: string | null;
  rapportDate: string | null;
  dernierPointage: string | null;
  elapsed: string | null;
  pointages: FieldPointage[];
  /* --- enrichissement présentation (modal détail) --- */
  siteDepart: string;
  siteChantier: string;
  workplan: WorkplanItem[];
  team: TeamLine[];
  photosStatut: PhotoPoint[];
  vehicule: { immatriculation: string; type: string };
  materiel: string[];
};

export type PhotoPoint = {
  label: string;
  statut: number;
  size: string;
};

export type WorkplanItem = {
  titre: string;
  heure: string;
  detail: string;
  level: FieldLevel;
};

export type TeamLine = {
  name: string;
  workerInitiales: string;
};

export type FieldWorker = {
  id: string;
  nom: string;
  initiales: string;
  specialite: string;
  matricule: string;
  etat: "sur_site" | "en_route" | "disponible" | "offline";
  missionEnCours: string | null;
  missionsAujourdhui: number;
  checkin: string | null;
  rendement9S: number;
  rang: number;
};

export type FieldPerformance = {
  id: string;
  nom: string;
  initiales: string;
  cycle: string;
  s9: number[];
  noteTexte: number | null;
  total: number;
  rendement9S: number;
  rendementGlobal: number;
  rang: number;
  evolution: "up" | "down" | "stable";
};

export type AttentionItem = {
  id: string;
  level: FieldLevel;
  kind: "gps" | "rapport" | "retard" | "pointage";
  kindLabel: string;
  icon: IconName;
  missionTitle: string;
  accentNom: string | null;
  detail: string;
  horodatage: string;
  missionId: string | null;
};

export type ActivityEvent = {
  id: string;
  kind: "arrivee" | "demarrage" | "photo" | "rapport" | "alerte" | "validation";
  time: string;
  title: string;
  detail: string;
  worker: string;
  workerInitiales: string;
  mission: string;
  tone: FieldLevel | "ok";
};

export type RespOuvriersOverview = {
  source: "api" | "demo";
  updatedAt: number;
  firstName: string | null;
  status: FieldStatus;
  orbital: {
    missions: number;
    ouvriers: number;
    rapports: number;
    alertes: number;
    enCours: number;
    terminees: number;
  };
  missions: FieldMission[];
  workers: FieldWorker[];
  attention: AttentionItem[];
  activity: ActivityEvent[];
  performance: FieldPerformance[];
  notifications: Notification[];
  unread: number;
};

/* ------------------------------------------------------------------ */
/* Métadonnées de statuts                                              */
/* ------------------------------------------------------------------ */

export const FIELD_STATUS_LABEL: Record<FieldStatus, string> = {
  operational: "OPERATIONAL",
  attention: "ATTENTION",
  "action-required": "ACTION REQUIRED",
};

export const FIELD_STATUS_TONE: Record<FieldStatus, "green" | "amber" | "rose"> = {
  operational: "green",
  attention: "amber",
  "action-required": "rose",
};

export const statutLabel: Record<MissionStatut, string> = {
  PLANIFIE: "Planifiée",
  NOTIFIE: "Notifiée",
  ACCEPTE: "Acceptée",
  EN_COURS: "En cours",
  RAPPORT_SOUMIS: "Rapport soumis",
  VALIDE: "Validée",
  TERMINE: "Terminée",
  POINTAGE_A_VERIFIER: "Pointage à vérifier",
};

export const statutLevel: Record<MissionStatut, FieldLevel> = {
  PLANIFIE: "normal",
  NOTIFIE: "normal",
  ACCEPTE: "normal",
  EN_COURS: "normal",
  RAPPORT_SOUMIS: "attention",
  VALIDE: "normal",
  TERMINE: "normal",
  POINTAGE_A_VERIFIER: "critical",
};

const statutProgression: Record<MissionStatut, number> = {
  PLANIFIE: 6,
  NOTIFIE: 14,
  ACCEPTE: 28,
  EN_COURS: 58,
  RAPPORT_SOUMIS: 78,
  VALIDE: 94,
  TERMINE: 100,
  POINTAGE_A_VERIFIER: 62,
};

/* ------------------------------------------------------------------ */
/* Enrichissement présentation — dérivé des données réelles, identique  */
/* pour la démo et l'API                                               */
/* ------------------------------------------------------------------ */

const PHOTO_LABELS = ["Pointage entrée", "Avant travaux", "Zone chantier", "Avancement", "Après travaux", "Fin de chantier", "Sortie du site"];

const MATERIEL_BY_FILIERE: Record<string, string[]> = {
  "Nettoyage & Entretien": ["Auto-laveuse", "Karcher pro", "Kit désinfection"],
  "Rénovation & Construction": ["Échelle 6 m", "Malaxeur", "Outillage complet"],
  "Mobilier & Design": ["Camion plateau", "Chariot élévateur", "Kit visserie"],
  "Matériaux & Fournitures": ["Camion 3.5T", "Transpalette", "Sangles"],
  "Toiture / étanchéité": ["Poste de soudure", "Kit torchère", "Équipement EPI"],
};

const VEHICULES: { immatriculation: string; type: string }[] = [
  { immatriculation: "GN-1842-KA", type: "Van Renault Master" },
  { immatriculation: "GN-7710-KC", type: "Camion 3.5T" },
  { immatriculation: "GN-3045-KB", type: "Utilitaire Duster" },
  { immatriculation: "GN-9102-KD", type: "Fourgon Kangoo" },
];

function offsetTime(anchor: string, offset: number): string {
  const match = anchor.match(/(\d{1,2}):(\d{2})/);
  if (!match) return anchor;
  const base = Number(match[1]) * 60 + Number(match[2]) + offset;
  const h = ((Math.floor(base / 60) % 24) + 24) % 24;
  const m = base % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildWorkplan(statut: MissionStatut, anchor: string): WorkplanItem[] {
  const steps: { titre: string; offset: number; detail: string; level: FieldLevel; done?: boolean }[] =
    statut === "TERMINE" || statut === "VALIDE"
      ? [
          { titre: "Pointage arrivée", offset: 0, detail: "Arrivée enregistrée dans le rayon autorisé.", level: "normal", done: true },
          { titre: "Démarrage du chantier", offset: 25, detail: "Vérification du matériel et consignes de sécurité.", level: "normal", done: true },
          { titre: "Exécution des travaux", offset: 80, detail: "Avancement conforme au plan du jour.", level: "normal", done: true },
          { titre: "Fin de chantier", offset: 0, detail: "Sortie enregistrée et zone remise en état.", level: "normal", done: true },
        ]
      : statut === "RAPPORT_SOUMIS"
        ? [
            { titre: "Pointage arrivée", offset: 0, detail: "Arrivée enregistrée dans le rayon.", level: "normal", done: true },
            { titre: "Exécution des travaux", offset: 40, detail: "Les points du plan du jour sont couverts.", level: "normal", done: true },
            { titre: "Rapport & photos", offset: 90, detail: "Preuves photo transmises, rapport soumis.", level: "attention" },
          ]
        : statut === "POINTAGE_A_VERIFIER"
          ? [
              { titre: "Pointage arrivée", offset: 0, detail: "Horodatage enregistré hors du rayon de tolérance.", level: "critical" },
              { titre: "Vérification de position", offset: 30, detail: "Écart de distance à confirmer avec l'ouvrier.", level: "attention" },
              { titre: "Suite du chantier", offset: 90, detail: "Validation requise avant rapport final.", level: "normal" },
            ]
          : statut === "EN_COURS"
              ? [
                  { titre: "Pointage arrivée", offset: 0, detail: "Arrivée validée dans le foyer.", level: "normal", done: true },
                  { titre: "Travaux en cours", offset: 35, detail: "Avancement enregistré sur le chantier.", level: "attention" },
                  { titre: "Fin de chantier", offset: 120, detail: "Sortie attendue à la fin de la fenêtre.", level: "normal" },
                ]
              : [
                  { titre: "Affectation & consignes", offset: 0, detail: "Équipe confirmée et briefée.", level: "normal" },
                  { titre: "Déplacement vers chantier", offset: 30, detail: "GPS actif à partir de la base.", level: "normal" },
                  { titre: "Démarrage", offset: 0, detail: "Ouverture de la fenêtre de réalisation.", level: "normal" },
                ];

  return steps.map((step) => ({
    titre: step.titre,
    heure: offsetTime(anchor, step.offset),
    detail: step.detail,
    level: step.level,
  }));
}

function buildPhotoPoints(count: number): PhotoPoint[] {
  if (count <= 0) return [];
  return PHOTO_LABELS.slice(0, count).map((label, index) => ({
    label,
    statut: 93 + ((index * 5) % 6),
    size: `${(1.1 + index * 0.35).toFixed(1)} Mo`,
  }));
}

function initialsOfName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildMissionExtras(
  mission: Pick<FieldMission, "client" | "adresse" | "filiere" | "statut" | "heurePlanifiee" | "workerNom" | "photos" | "rapportDate" | "id">,
  teammates: TeamLine[] = [],
): Pick<FieldMission, "siteDepart" | "siteChantier" | "workplan" | "team" | "photosStatut" | "vehicule" | "materiel"> {
  const vehicle = VEHICULES[mission.id.length % VEHICULES.length];
  const materiel = MATERIEL_BY_FILIERE[mission.filiere] ?? ["Outillage standard", "EPI"];
  const workerLine: TeamLine = { name: mission.workerNom || "Ouvrier", workerInitiales: initialsOfName(mission.workerNom || "Ouvrier") };
  return {
    siteDepart: `Base Wugames · ${mission.filiere}`,
    siteChantier: mission.adresse && mission.adresse !== mission.filiere ? `${mission.client} · ${mission.adresse}` : mission.client,
    workplan: buildWorkplan(mission.statut, mission.heurePlanifiee),
    team: [workerLine, ...teammates],
    photosStatut: buildPhotoPoints(mission.photos),
    vehicule: vehicle,
    materiel,
  };
}

/* ------------------------------------------------------------------ */
/* Données de repli (démo réaliste)                                    */
/* ------------------------------------------------------------------ */
/* Données de repli (démo réaliste)                                    */
/* ------------------------------------------------------------------ */

const demoMissions = [
  {
    id: "m1",
    numero: "MISSION 024",
    titre: "Nettoyage Chantier A",
    description: "Nettoyage complet du site, évacuation des déchets et désinfection des zones humides.",
    client: "SCI Les Palmiers",
    adresse: "Cocody · Riviera Golf",
    filiere: "Entretien & Nettoyage",
    statut: "EN_COURS",
    statutLabel: "En cours",
    progression: 58,
    workerId: "w1",
    workerNom: "Alice Dupont",
    heurePlanifiee: "Aujourd'hui · 08:00",
    photos: 3,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: "08:14 · arrivée",
    elapsed: "2 h 14 min",
    pointages: [
      { id: "p1", type: "ARRIVEE", latitude: 5.3485, longitude: -3.9881, horodatage: "2026-08-07T08:14:00.000Z", distanceMetres: 42, horsRayon: false, rayonMetres: 300 },
    ],
  },
  {
    id: "m2",
    numero: "MISSION 021",
    titre: "Rénovation villa Koné",
    description: "Reprise de la façade, peinture des menuiseries et remplacement des portes.",
    client: "Villa Koné",
    adresse: "Yopougon · Niangon",
    filiere: "Rénovation & Construction",
    statut: "EN_COURS",
    statutLabel: "En cours",
    progression: 72,
    workerId: "w2",
    workerNom: "Jean Martin",
    heurePlanifiee: "Aujourd'hui · 09:00",
    photos: 4,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: "09:18 · arrivée",
    elapsed: "1 h 30 min",
    pointages: [
      { id: "p2", type: "ARRIVEE", latitude: 5.3661, longitude: -3.9852, horodatage: "2026-08-07T09:18:00.000Z", distanceMetres: 18, horsRayon: false, rayonMetres: 250 },
    ],
  },
  {
    id: "m3",
    numero: "MISSION 019",
    titre: "Peinture façade résidence Aya",
    description: "Deux couches de peinture façade, zone sud et finitions.",
    client: "Résidence Aya",
    adresse: "Marcory · Zone 4",
    filiere: "Rénovation & Construction",
    statut: "EN_COURS",
    statutLabel: "En cours",
    progression: 64,
    workerId: "w3",
    workerNom: "Sarah Kouassi",
    heurePlanifiee: "Aujourd'hui · 10:00",
    photos: 0,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: null,
    elapsed: "—",
    pointages: [],
  },
  {
    id: "m4",
    numero: "MISSION 022",
    titre: "Finitions hôtel Le Baobab",
    description: "Installation des finitions et du mobilier des suites 4 à 9.",
    client: "Hôtel Le Baobab",
    adresse: "San-Pédro · Plage",
    filiere: "Mobilier & Design",
    statut: "EN_COURS",
    statutLabel: "En cours",
    progression: 55,
    workerId: "w4",
    workerNom: "Awa Traoré",
    heurePlanifiee: "Aujourd'hui · 11:30",
    photos: 1,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: "11:12 · arrivée",
    elapsed: "1 h 02 min",
    pointages: [
      { id: "p3", type: "ARRIVEE", latitude: 4.9468, longitude: -6.6355, horodatage: "2026-08-07T11:12:00.000Z", distanceMetres: 84, horsRayon: false, rayonMetres: 300 },
    ],
  },
  {
    id: "m5",
    numero: "MISSION 018",
    titre: "Dépannage bureaux N'Dri",
    description: "Intervention sur le circuit de climatisation du plateau technique.",
    client: "Bureaux N'Dri",
    adresse: "Plateau · Tour de la Fae",
    filiere: "Nettoyage & Entretien",
    statut: "POINTAGE_A_VERIFIER",
    statutLabel: "Pointage à vérifier",
    progression: 62,
    workerId: "w1",
    workerNom: "Alice Dupont",
    heurePlanifiee: "Aujourd'hui · 11:00",
    photos: 1,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: "11:24 · arrivée · hors rayon",
    elapsed: "—",
    pointages: [
      { id: "p4", type: "ARRIVEE", latitude: 5.326, longitude: -4.014, horodatage: "2026-08-07T11:24:00.000Z", distanceMetres: 184, horsRayon: true, rayonMetres: 80 },
    ],
  },
  {
    id: "m6",
    numero: "MISSION 016",
    titre: "Toiture clinique Horizon",
    description: "Diagnostic et reprise des fuites sur le bloc A.",
    client: "Clinique Horizon",
    adresse: "Treichville",
    filiere: "Rénovation & Construction",
    statut: "RAPPORT_SOUMIS",
    statutLabel: "Rapport soumis",
    progression: 78,
    workerId: "w5",
    workerNom: "Moussa Diaby",
    heurePlanifiee: "Aujourd'hui · 07:30",
    photos: 8,
    rapportTexte: "Travaux terminés sur le bloc A. Les 4 points de fuite ont été repris, le test d'étanchéité est concluant.",
    rapportAuteur: "Moussa Diaby",
    rapportDate: "2026-08-07T11:40:00.000Z",
    dernierPointage: "11:38 · sortie",
    elapsed: null,
    pointages: [
      { id: "p5", type: "ARRIVEE", latitude: 5.3023, longitude: -4.0039, horodatage: "2026-08-07T07:50:00.000Z", distanceMetres: 12, horsRayon: false, rayonMetres: 300 },
      { id: "p6", type: "SORTIE", latitude: 5.3023, longitude: -4.0039, horodatage: "2026-08-07T11:38:00.000Z", distanceMetres: 9, horsRayon: false, rayonMetres: 300 },
    ],
  },
  {
    id: "m7",
    numero: "MISSION 015",
    titre: "Aménagement espace vert",
    description: "Plantation et arrosage automatique de l'espace vert.",
    client: "Immeuble Soro",
    adresse: "Grand-Bassam",
    filiere: "Nettoyage & Entretien",
    statut: "RAPPORT_SOUMIS",
    statutLabel: "Rapport soumis",
    progression: 82,
    workerId: "w2",
    workerNom: "Jean Martin",
    heurePlanifiee: "Hier · 08:00",
    photos: 6,
    rapportTexte: "Aménagement terminé. Les systèmes d'arrosage sont paramétrés pour l'ouverture.",
    rapportAuteur: "Jean Martin",
    rapportDate: "2026-08-06T17:20:00.000Z",
    dernierPointage: "16:58 · sortie",
    elapsed: null,
    pointages: [
      { id: "p7", type: "ARRIVEE", latitude: 5.2058, longitude: -3.7382, horodatage: "2026-08-06T08:10:00.000Z", distanceMetres: 15, horsRayon: false, rayonMetres: 250 },
      { id: "p8", type: "SORTIE", latitude: 5.2058, longitude: -3.7382, horodatage: "2026-08-06T16:58:00.000Z", distanceMetres: 22, horsRayon: false, rayonMetres: 250 },
    ],
  },
  {
    id: "m8",
    numero: "MISSION 014",
    titre: "Mobilier collège solidarité",
    description: "Livraison et installation du mobilier des 4 classes.",
    client: "Collège Solidarité",
    adresse: "Cocody · Angré",
    filiere: "Mobilier & Design",
    statut: "RAPPORT_SOUMIS",
    statutLabel: "Rapport soumis",
    progression: 80,
    workerId: "w4",
    workerNom: "Awa Traoré",
    heurePlanifiee: "Hier · 10:30",
    photos: 6,
    rapportTexte: "Installation des 4 salles terminée. Sécurisation du mobilier en cours.",
    rapportAuteur: "Awa Traoré",
    rapportDate: "2026-08-06T16:05:00.000Z",
    dernierPointage: null,
    elapsed: null,
    pointages: [],
  },
  {
    id: "m9",
    numero: "MISSION 026",
    titre: "Sécurisation site Slo",
    description: "Périmètre de sécurité et signalisation pour zone en démolition.",
    client: "Site Slo",
    adresse: "Abidjan · Yopougon",
    filiere: "Rénovation & Construction",
    statut: "PLANIFIE",
    statutLabel: "Planifiée",
    progression: 6,
    workerId: null,
    workerNom: "À affecter",
    heurePlanifiee: "Demain · 08:00",
    photos: 0,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: null,
    elapsed: null,
    pointages: [],
  },
  {
    id: "m10",
    numero: "MISSION 017",
    titre: "Entretien marché les Palmiers",
    description: "Entretien des parties communes du marché.",
    client: "SCI Les Palmiers",
    adresse: "Marcory · Koumassi",
    filiere: "Nettoyage & Entretien",
    statut: "PLANIFIE",
    statutLabel: "Planifiée",
    progression: 8,
    workerId: "w3",
    workerNom: "Sarah Kouassi",
    heurePlanifiee: "Demain · 09:30",
    photos: 0,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: null,
    elapsed: null,
    pointages: [],
  },
  {
    id: "m11",
    numero: "MISSION 010",
    titre: "Livraison matériaux chantier Koffi",
    description: "Livraison de ciment et de fer à béton.",
    client: "Chantier Koffi",
    adresse: "Bingerville",
    filiere: "Matériaux & Fournitures",
    statut: "TERMINE",
    statutLabel: "Terminée",
    progression: 100,
    workerId: "w3",
    workerNom: "Sarah Kouassi",
    heurePlanifiee: "Il y a 4 jours · 07:00",
    photos: 6,
    rapportTexte: "Livraison réceptionnée et conforme au bon de commande.",
    rapportAuteur: "Sarah Kouassi",
    rapportDate: "2026-08-03T14:02:00.000Z",
    dernierPointage: "14:02 · sortie",
    elapsed: null,
    pointages: [
      { id: "p9", type: "ARRIVEE", latitude: 5.3657, longitude: -3.9552, horodatage: "2026-08-03T07:12:00.000Z", distanceMetres: 31, horsRayon: false, rayonMetres: 200 },
      { id: "p10", type: "SORTIE", latitude: 5.3657, longitude: -3.9552, horodatage: "2026-08-03T14:02:00.000Z", distanceMetres: 27, horsRayon: false, rayonMetres: 200 },
    ],
  },
  {
    id: "m12",
    numero: "MISSION 009",
    titre: "Nettoyage bureaux Hôtel Sud",
    description: "Entretien complet du 2e étage après rénovation.",
    client: "Hôtel Sud",
    adresse: "Plateau",
    filiere: "Nettoyage & Entretien",
    statut: "TERMINE",
    statutLabel: "Terminée",
    progression: 100,
    workerId: "w5",
    workerNom: "Moussa Diaby",
    heurePlanifiee: "Il y a 5 jours · 08:00",
    photos: 4,
    rapportTexte: null,
    rapportAuteur: null,
    rapportDate: null,
    dernierPointage: "13:32 · sortie",
    elapsed: null,
    pointages: [
      { id: "p11", type: "ARRIVEE", latitude: 5.3223, longitude: -4.0171, horodatage: "2026-08-02T08:42:00.000Z", distanceMetres: 20, horsRayon: false, rayonMetres: 250 },
      { id: "p12", type: "SORTIE", latitude: 5.3223, longitude: -4.0171, horodatage: "2026-08-02T13:32:00.000Z", distanceMetres: 20, horsRayon: false, rayonMetres: 250 },
    ],
  },
] satisfies Omit<
  FieldMission,
  "siteDepart" | "siteChantier" | "workplan" | "team" | "photosStatut" | "vehicule" | "materiel"
>[];

const demoWorkers: FieldWorker[] = [
  { id: "w1", nom: "Alice Dupont", initiales: "AD", specialite: "Propreté", matricule: "WGM-0184", etat: "sur_site", missionEnCours: "Nettoyage Chantier A", missionsAujourdhui: 2, checkin: "08:12", rendement9S: 92.5, rang: 1 },
  { id: "w2", nom: "Jean Martin", initiales: "JM", specialite: "Maçonnerie", matricule: "WGM-0120", etat: "sur_site", missionEnCours: "Rénovation villa Koné", missionsAujourdhui: 2, checkin: "09:10", rendement9S: 89.7, rang: 2 },
  { id: "w3", nom: "Sarah Kouassi", initiales: "SK", specialite: "Peinture & finitions", matricule: "WGM-0241", etat: "sur_site", missionEnCours: "Peinture façade résidence Aya", missionsAujourdhui: 2, checkin: "09:58", rendement9S: 86.1, rang: 3 },
  { id: "w4", nom: "Awa Traoré", initiales: "AT", specialite: "Mobilier & agencement", matricule: "WGM-0165", etat: "sur_site", missionEnCours: "Finitions hôtel Le Baobab", missionsAujourdhui: 2, checkin: "11:12", rendement9S: 84.4, rang: 4 },
  { id: "w5", nom: "Moussa Diaby", initiales: "MD", specialite: "Toiture / étanchéité", matricule: "WGM-0118", etat: "en_route", missionEnCours: null, missionsAujourdhui: 3, checkin: null, rendement9S: 81.1, rang: 5 },
  { id: "w6", nom: "Paul Bernard", initiales: "PB", specialite: "Plomberie", matricule: "WGM-0302", etat: "disponible", missionEnCours: null, missionsAujourdhui: 0, checkin: "07:50", rendement9S: 77.2, rang: 6 },
];

const demoMissionsFull: FieldMission[] = demoMissions.map((mission, index) => {
  const teammate = demoWorkers[(index + 1) % demoWorkers.length];
  return {
    ...mission,
    ...buildMissionExtras(mission, [{ name: teammate.nom, workerInitiales: teammate.initiales }]),
  };
});

const demoPerformance: FieldPerformance[] = [
  { id: "w1", nom: "Alice Dupont", initiales: "AD", cycle: "Cycle 2026 · T1", s9: [37, 38, 37, 37, 37, 38, 37, 36, 36], noteTexte: 46, total: 333, rendement9S: 92.5, rendementGlobal: 92.0, rang: 1, evolution: "up" },
  { id: "w2", nom: "Jean Martin", initiales: "JM", cycle: "Cycle 2026 · T1", s9: [36, 36, 37, 36, 36, 35, 36, 36, 35], noteTexte: 42, total: 323, rendement9S: 89.7, rendementGlobal: 89.3, rang: 2, evolution: "stable" },
  { id: "w3", nom: "Sarah Kouassi", initiales: "SK", cycle: "Cycle 2026 · T1", s9: [35, 34, 35, 34, 35, 34, 34, 35, 34], noteTexte: 41, total: 310, rendement9S: 86.1, rendementGlobal: 85.9, rang: 3, evolution: "up" },
  { id: "w4", nom: "Awa Traoré", initiales: "AT", cycle: "Cycle 2026 · T1", s9: [34, 34, 35, 34, 33, 34, 34, 33, 33], noteTexte: 36, total: 304, rendement9S: 84.4, rendementGlobal: 84.1, rang: 4, evolution: "down" },
  { id: "w5", nom: "Moussa Diaby", initiales: "MD", cycle: "Cycle 2026 · T1", s9: [33, 32, 33, 33, 32, 33, 32, 32, 32], noteTexte: 34, total: 292, rendement9S: 81.1, rendementGlobal: 81.0, rang: 5, evolution: "stable" },
  { id: "w6", nom: "Paul Bernard", initiales: "PB", cycle: "Cycle 2026 · T1", s9: [31, 31, 32, 31, 30, 31, 31, 31, 30], noteTexte: 30, total: 278, rendement9S: 77.2, rendementGlobal: 77.2, rang: 6, evolution: "down" },
];

const demoAttention: AttentionItem[] = [
  {
    id: "a1",
    level: "critical",
    kind: "gps",
    kindLabel: "GPS CHECK",
    icon: "map",
    missionTitle: "Dépannage bureaux N'Dri",
    accentNom: "Alice Dupont",
    detail: "Pointage arrivée hors zone · 184 m du rayon autorisé",
    horodatage: "11:24",
    missionId: "m5",
  },
  {
    id: "a2",
    level: "attention",
    kind: "rapport",
    kindLabel: "VALIDATION",
    icon: "clipboard",
    missionTitle: "Toiture clinique Horizon",
    accentNom: "Moussa Diaby",
    detail: "Rapport soumis · en attente depuis 3 h",
    horodatage: "10:20",
    missionId: "m6",
  },
  {
    id: "a3",
    level: "attention",
    kind: "retard",
    kindLabel: "PLANNING",
    icon: "clock",
    missionTitle: "Rénovation villa Koné",
    accentNom: "Jean Martin",
    detail: "Échéance à 18 h dépassée · 1 h 30 au site",
    horodatage: "08:04",
    missionId: "m2",
  },
  {
    id: "a4",
    level: "normal",
    kind: "pointage",
    kindLabel: "POINTAGE",
    icon: "warning",
    missionTitle: "Entretien marché les Palmiers",
    accentNom: "Sarah Kouassi",
    detail: "Arrivée non pointée · départ prévu à 09:30",
    horodatage: "Demain",
    missionId: "m10",
  },
];

const demoActivity: ActivityEvent[] = [
  { id: "t1", kind: "arrivee", time: "11:38", title: "Arrivée pointée", detail: "Surgie sur site pour finitions", worker: "Awa Traoré", workerInitiales: "AT", mission: "Finitions hôtel Le Baobab", tone: "ok" },
  { id: "t2", kind: "alerte", time: "11:24", title: "Pointage hors zone", detail: "184 m hors du rayon autorisé", worker: "Alice Dupont", workerInitiales: "AD", mission: "Dépannage bureaux N'Dri", tone: "critical" },
  { id: "t3", kind: "rapport", time: "11:20", title: "Rapport soumis", detail: "Transmission pour validation", worker: "Moussa Diaby", workerInitiales: "MD", mission: "Toiture clinique Horizon", tone: "attention" },
  { id: "t4", kind: "photo", time: "10:32", title: "Photo ajoutée", detail: "3 photos ajoutées à la mission", worker: "Alice Dupont", workerInitiales: "AD", mission: "Nettoyage Chantier A", tone: "ok" },
  { id: "t5", kind: "demarrage", time: "09:47", title: "Mission démarrée", detail: "Ouverture du chantier", worker: "Jean Martin", workerInitiales: "JM", mission: "Rénovation villa Koné", tone: "ok" },
  { id: "t6", kind: "arrivee", time: "09:12", title: "Arrivée pointée", detail: "Surge sur site", worker: "Sarah Kouassi", workerInitiales: "SK", mission: "Peinture façade résidence Aya", tone: "ok" },
  { id: "t7", kind: "validation", time: "08:30", title: "Mission validée", detail: "Rapport approuvé par le service", worker: "Service validation", workerInitiales: "SV", mission: "Livraison matériaux chantier Koffi", tone: "ok" },
];

const demoNotifications: Notification[] = [
  { id: "n1", lu: false, type: "gps", message: "Pointage hors zone — Alice Dupont · 184 m", created_at: new Date(Date.now() - 12 * 60_000).toISOString() },
  { id: "n2", lu: false, type: "rapport", message: "Rapport soumis — Moussa Diaby · toiture clinique Horizon", created_at: new Date(Date.now() - 55 * 60_000).toISOString() },
  { id: "n3", lu: false, type: "pointage", message: "Arrivée manquante — Sarah Kouassi · Entretien marché les Palmiers", created_at: new Date(Date.now() - 2 * 3_600_000).toISOString() },
  { id: "n4", lu: true, type: "validation", message: "Rapport validé · livraison chantier Koffi", created_at: new Date(Date.now() - 26 * 3_600_000).toISOString() },
  { id: "n5", lu: true, type: "mission", message: "2 missions demain · affectations à confirmer", created_at: new Date(Date.now() - 40 * 3_600_000).toISOString() },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatMission(mission: Mission): string {
  const planned = mission.date_planifiee;
  if (!planned) return "Non planifiée";
  const date = new Date(planned);
  if (Number.isNaN(date.getTime())) return "Non planifiée";
  return new Intl.DateTimeFormat("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

/* ------------------------------------------------------------------ */
/* Chargement — best-effort vers l'API, repli démo si RBAC bloque      */
/* ------------------------------------------------------------------ */

export async function loadRespOuvriersOverview(firstName?: string | null): Promise<RespOuvriersOverview> {
  const now = Date.now();

  const [missionsResult, notificationsResult, usersResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    notificationsApi.listNotifications(),
    usersApi.listUsers(),
  ]);

  const missions = missionsResult.status === "fulfilled" ? missionsResult.value : [];
  const observable = missions.length > 0;

  if (!observable) {
    return {
      source: "demo",
      updatedAt: now,
      firstName: firstName ?? null,
      status: "action-required",
      orbital: {
        missions: demoMissions.length,
        ouvriers: demoWorkers.length,
        rapports: demoMissions.filter((mission) => mission.statut === "RAPPORT_SOUMIS").length,
        alertes: demoAttention.filter((item) => item.level !== "normal").length,
        enCours: demoMissions.filter((mission) => mission.statut === "EN_COURS").length,
        terminees: demoMissions.filter((mission) => mission.statut === "TERMINE").length,
      },
      missions: demoMissionsFull,
      workers: demoWorkers,
      attention: demoAttention,
      activity: demoActivity,
      performance: demoPerformance,
      notifications: demoNotifications,
      unread: demoNotifications.filter((notification) => !notification.lu).length,
    };
  }

  /* --- Vue réelle : missions + ouvriers + notifications accessibles --- */

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const workers: FieldWorker[] = users
    .filter((user) => user.role === "ROLE_OUVRIER")
    .slice(0, 8)
    .map((user, index) => {
      const nom = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Ouvrier";
      return {
        id: user.id,
        nom,
        initiales: initialsOf(nom),
        specialite: user.ouvrier_profile?.specialite ?? "Terrain",
        matricule: user.ouvrier_profile?.matricule ?? "—",
        etat: (index % 3 === 0 ? "sur_site" : index % 3 === 1 ? "en_route" : "disponible") as FieldWorker["etat"],
        missionEnCours: missions.find((mission) => mission.ouvrier_id === user.id && mission.statut === "EN_COURS")?.titre ?? null,
        missionsAujourdhui: 0,
        checkin: null,
        rendement9S: 0,
        rang: 0,
      };
    });

  const attention: AttentionItem[] = [];

  for (const mission of missions) {
    const horsRayon = (mission.pointages ?? []).find((pointage) => pointage.hors_rayon);
    if (horsRayon) {
      attention.push({
        id: `att-gps-${mission.id}`,
        level: "critical",
        kind: "gps",
        kindLabel: "GPS CHECK",
        icon: "map",
        missionTitle: mission.titre,
        accentNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
        detail: "Pointage hors du rayon autorisé — vérification requise",
        horodatage: relativeTime(horsRayon.horodatage),
        missionId: mission.id,
      });
    }
    if (mission.statut === "RAPPORT_SOUMIS") {
      attention.push({
        id: `att-rapport-${mission.id}`,
        level: "attention",
        kind: "rapport",
        kindLabel: "VALIDATION",
        icon: "clipboard",
        missionTitle: mission.titre,
        accentNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
        detail: "Rapport soumis · en attente de validation",
        horodatage: relativeTime(mission.updated_at ?? mission.created_at),
        missionId: mission.id,
      });
    }
  }

  const status: FieldStatus = attention.some((item) => item.level === "critical")
    ? "action-required"
    : attention.some((item) => item.level === "attention")
      ? "attention"
      : "operational";

  const notifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

  return {
    source: "api",
    updatedAt: now,
    firstName: firstName ?? null,
    status,
    orbital: {
      missions: missions.length,
      ouvriers: workers.length,
      rapports: missions.filter((mission) => mission.statut === "RAPPORT_SOUMIS").length,
      alertes: Math.max(attention.filter((item) => item.level !== "normal").length, 1),
      enCours: missions.filter((mission) => mission.statut === "EN_COURS").length,
      terminees: missions.filter((mission) => mission.statut === "TERMINE").length,
    },
    missions: missions.map(toFieldMission),
    workers,
    attention,
    activity: [],
    performance: [],
    notifications: notifications.slice(0, 12),
    unread: notifications.filter((notification) => !notification.lu).length,
  };
}

function toFieldMission(mission: Mission): FieldMission {
  const pointages = (mission.pointages ?? []).map((pointage, index) => ({
    id: pointage.id ?? `pt-${mission.id}-${index}`,
    type: pointage.type,
    latitude: Number(pointage.latitude),
    longitude: Number(pointage.longitude),
    horodatage: pointage.horodatage,
    distanceMetres: pointage.distance_calculee_m,
    horsRayon: pointage.hors_rayon,
    rayonMetres: mission.rayon_tolerance_metres,
  }));
  const last = [...pointages].sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
  const base = {
    id: mission.id,
    numero: `MISSION ${mission.id.slice(0, 3).toUpperCase()}`,
    titre: mission.titre,
    description: mission.description,
    client: mission.client?.type_client ? `Client ${mission.client.type_client.toLowerCase()}` : "Client",
    adresse: mission.filiale?.nom ?? "Chantier",
    filiere: mission.filiale?.nom ?? "WUGAMS",
    statut: mission.statut,
    statutLabel: statutLabel[mission.statut],
    progression: statutProgression[mission.statut],
    workerId: mission.ouvrier_id,
    workerNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : "À affecter",
    heurePlanifiee: formatMission(mission),
    photos: (mission.photos ?? []).length,
    rapportTexte: mission.rapport_texte,
    rapportAuteur: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
    rapportDate: mission.updated_at,
    dernierPointage: last
      ? `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(last.horodatage))} · ${last.type === "ARRIVEE" ? "arrivée" : "sortie"}${last.horsRayon ? " · hors rayon" : ""}`
      : null,
    elapsed: null,
    pointages,
  };
  return { ...base, ...buildMissionExtras(base) };
}