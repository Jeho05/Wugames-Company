import type {
  ChantierStatut,
  Commande,
  Devis,
  Facture,
  FactureStatut,
  Fidelite,
  Mission,
  MissionStatut,
  Notification,
  ClientProjet,
  DemandeDevis,
} from "@/app/lib/contracts";
import { getCommandes, getDemandes, getDevis, getFactures, getFidelite, getMissions, getProjets } from "@/app/lib/api/client-space";
import { listNotifications } from "@/app/lib/api/notifications";

export type ClientGlobalState = "ok" | "action" | "critical";

export type DevisStatut = "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "EXPIRE";

export type CommandeStatut = "EN_ATTENTE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";

export type ClientMissionView = {
  id: string;
  titre: string;
  statut: MissionStatut;
  progression: number;
  date: string;
  equipe: string;
  dernierPointage: string | null;
};

export type ClientDevisView = {
  id: string;
  numero: string;
  objet: string;
  montant: number;
  date: string;
  validite: string;
  statut: DevisStatut;
};

export type ClientCommandeView = {
  id: string;
  numero: string;
  date: string;
  statut: CommandeStatut;
  nbArticles: number;
  montant: number;
  articles: string[];
};

export type NotificationKind = "mission" | "facture" | "devis" | "commande" | "paiement" | "cleans";

export type DemandeType = "DEVIS" | "SERVICE" | "RECLAMATION";

export type DemandeStatut = "ENVOYEE" | "ETUDIEE" | "DEVIS_PROPOSE" | "ACCEPTEE" | "REFUSEE";

export type ClientDemandeView = {
  id: string;
  type: DemandeType;
  objet: string;
  detail: string;
  date: string;
  statut: DemandeStatut;
  piecesJointes: number;
};

export type ClientProjetPhoto = {
  url: string;
  legende: string;
};

export type ClientProjetView = {
  id: string;
  titre: string;
  filiale: string;
  statut: MissionStatut;
  progression: number;
  debut: string;
  fin: string | null;
  equipe: string;
  galerie: ClientProjetPhoto[];
  rapport: string | null;
};

export type ClientNotificationView = {
  id: string;
  kind: NotificationKind;
  titre: string;
  detail: string;
  time: string;
  lu: boolean;
};

export type ClientPortalData = {
  live: boolean;
  missions: ClientMissionView[];
  factures: Facture[];
  devis: ClientDevisView[];
  commandes: ClientCommandeView[];
  notifications: ClientNotificationView[];
  demandes: ClientDemandeView[];
  projets: ClientProjetView[];
  fidelite: Fidelite | null;
};

/* ------------------------------------------------------------------ */
/* Étiquettes & tonalités                                              */
/* ------------------------------------------------------------------ */

export type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export const missionStatutMeta: Record<MissionStatut, { label: string; tone: StatusTone; progression: number }> = {
  PLANIFIE: { label: "Planifiée", tone: "neutral", progression: 5 },
  NOTIFIE: { label: "Notifiée", tone: "info", progression: 15 },
  ACCEPTE: { label: "Acceptée", tone: "info", progression: 30 },
  EN_COURS: { label: "En cours", tone: "warning", progression: 60 },
  RAPPORT_SOUMIS: { label: "Rapport soumis", tone: "info", progression: 80 },
  VALIDE: { label: "Validée", tone: "success", progression: 95 },
  TERMINE: { label: "Terminée", tone: "success", progression: 100 },
  POINTAGE_A_VERIFIER: { label: "Pointage à vérifier", tone: "danger", progression: 45 },
};

export const factureStatutMeta: Record<FactureStatut, { label: string; tone: StatusTone }> = {
  BROUILLON: { label: "Brouillon", tone: "neutral" },
  EMISE: { label: "Émise", tone: "warning" },
  PAYEE: { label: "Payée", tone: "success" },
  EN_RETARD: { label: "En retard", tone: "danger" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
};

export const devisStatutMeta: Record<DevisStatut, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  ACCEPTE: { label: "Accepté", tone: "success" },
  REFUSE: { label: "Refusé", tone: "danger" },
  EXPIRE: { label: "Expiré", tone: "neutral" },
};

export const commandeStatutMeta: Record<CommandeStatut, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "info" },
  EN_PREPARATION: { label: "En préparation", tone: "info" },
  EXPEDIEE: { label: "Expédiée", tone: "info" },
  LIVREE: { label: "Livrée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

/** Correspondance des statuts devis de l'API vers les statuts de l'UI client. */
const devisStatutFromApi: Record<string, DevisStatut> = {
  BROUILLON: "EN_ATTENTE",
  ENVOYE: "EN_ATTENTE",
  SIGNE: "ACCEPTE",
  REFUSE: "REFUSE",
  EXPIRE: "EXPIRE",
};

/** Correspondance des statuts demandes de l'API vers les statuts de l'UI client. */
const demandeStatutFromApi: Record<string, DemandeStatut> = {
  RECUE: "ENVOYEE",
  EN_COURS: "ETUDIEE",
  A_CONFIRMER: "DEVIS_PROPOSE",
  TERMINEE: "ACCEPTEE",
};

/** Correspondance des statuts chantiers de l'API vers les statuts de l'UI client (missions). */
const projetStatutFromApi: Record<ChantierStatut, MissionStatut> = {
  PLANIFIE: "PLANIFIE",
  EN_COURS: "EN_COURS",
  SUSPENDU: "ACCEPTE",
  TERMINE: "TERMINE",
  ANNULE: "TERMINE",
};

export const demandeTypeMeta: Record<DemandeType, { label: string; tone: StatusTone }> = {
  DEVIS: { label: "Demande de devis", tone: "info" },
  SERVICE: { label: "Demande de service", tone: "warning" },
  RECLAMATION: { label: "Réclamation", tone: "danger" },
};

export const demandeStatutMeta: Record<DemandeStatut, { label: string; tone: StatusTone }> = {
  ENVOYEE: { label: "Envoyée", tone: "neutral" },
  ETUDIEE: { label: "À l'étude", tone: "info" },
  DEVIS_PROPOSE: { label: "Devis proposé", tone: "warning" },
  ACCEPTEE: { label: "Acceptée", tone: "success" },
  REFUSEE: { label: "Refusée", tone: "danger" },
};

export function globalStateFrom(missions: ClientMissionView[], factures: Facture[], devis: ClientDevisView[]): ClientGlobalState {
  const hasCritical =
    factures.some((f) => f.statut === "EN_RETARD") ||
    missions.some((m) => m.statut === "POINTAGE_A_VERIFIER");
  if (hasCritical) return "critical";
  const hasAction =
    factures.some((f) => f.statut === "EMISE") ||
    devis.some((d) => d.statut === "EN_ATTENTE") ||
    missions.some((m) => m.statut === "ACCEPTE" || m.statut === "EN_COURS" || m.statut === "RAPPORT_SOUMIS");
  if (hasAction) return "action";
  return "ok";
}

export const globalStateMeta: Record<ClientGlobalState, { label: string; detail: string; tone: StatusTone }> = {
  ok: { label: "Tout est sous contrôle", detail: "Aucune action requise de votre part", tone: "success" },
  action: { label: "Action requise", detail: "Quelques éléments méritent votre attention", tone: "warning" },
  critical: { label: "Intervention nécessaire", detail: "Un élément demande votre intervention", tone: "danger" },
};

/* ------------------------------------------------------------------ */
/* Formatage                                                           */
/* ------------------------------------------------------------------ */

export const formatFcfaCompact = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000) return `${Math.round(amount / 1_000).toLocaleString("fr-FR")} k`;
  return amount.toLocaleString("fr-FR");
};

export function formatDateFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTimeFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
    " · " +
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Données de démonstration (repli si l'API est indisponible)          */
/* ------------------------------------------------------------------ */

const demoMissions: ClientMissionView[] = [
  {
    id: "dm1",
    titre: "Rénovation intérieure · Résidence Traoré",
    statut: "EN_COURS",
    progression: 68,
    date: "Aujourd'hui, 08:00",
    equipe: "Équipe Rénovation",
    dernierPointage: "07:58 · arrivée sur site",
  },
  {
    id: "dm2",
    titre: "Peinture façade · Villa Cocody",
    statut: "RAPPORT_SOUMIS",
    progression: 85,
    date: "Hier, 10:00",
    equipe: "Équipe Peinture",
    dernierPointage: "16:02 · sortie du chantier",
  },
  {
    id: "dm3",
    titre: "Étanchéité toiture · Résidence Traoré",
    statut: "ACCEPTE",
    progression: 30,
    date: "Lundi 10 août, 07:30",
    equipe: "Équipe Couverture",
    dernierPointage: null,
  },
  {
    id: "dm4",
    titre: "Installation cuisine équipée",
    statut: "PLANIFIE",
    progression: 5,
    date: "Jeudi 13 août, 09:00",
    equipe: "Équipe Agencement",
    dernierPointage: null,
  },
];

const demoFactures: Facture[] = [
  {
    id: "df1",
    numero: "FAC-2026-0184",
    filiale_id: "f1",
    client_id: "c1",
    mission_id: "dm1",
    devis_id: null,
    montant_ht: "4 245 763",
    montant_ttc: "5 010 000",
    statut: "EMISE",
    date_emission: "2026-07-28",
    date_echeance: "2026-08-15",
    date_paiement: null,
    exercice_comptable: 2026,
    numero_sequence: 184,
    created_at: "2026-07-28T10:00:00.000Z",
    updated_at: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "df2",
    numero: "FAC-2026-0181",
    filiale_id: "f1",
    client_id: "c1",
    mission_id: "dm2",
    devis_id: null,
    montant_ht: "1 900 000",
    montant_ttc: "2 242 000",
    statut: "PAYEE",
    date_emission: "2026-06-02",
    date_echeance: "2026-06-17",
    date_paiement: "2026-06-16",
    exercice_comptable: 2026,
    numero_sequence: 181,
    created_at: "2026-06-02T10:00:00.000Z",
    updated_at: "2026-06-17T10:00:00.000Z",
  },
  {
    id: "df3",
    numero: "FAC-2026-0179",
    filiale_id: "f1",
    client_id: "c1",
    mission_id: "dm3",
    devis_id: null,
    montant_ht: "980 000",
    montant_ttc: "1 156 400",
    statut: "PAYEE",
    date_emission: "2026-05-28",
    date_echeance: "2026-06-12",
    date_paiement: "2026-06-11",
    exercice_comptable: 2026,
    numero_sequence: 179,
    created_at: "2026-05-28T10:00:00.000Z",
    updated_at: "2026-06-12T10:00:00.000Z",
  },
];

const demoDevis: ClientDevisView[] = [
  {
    id: "dd1",
    numero: "DEV-2026-095",
    objet: "Aménagement jardin & clôture",
    montant: 1_850_000,
    date: "3 août 2026",
    validite: "30 jours",
    statut: "EN_ATTENTE",
  },
  {
    id: "dd2",
    numero: "DEV-2026-092",
    objet: "Menuiserie extérieure · portail et grilles",
    montant: 2_480_000,
    date: "24 juillet 2026",
    validite: "30 jours",
    statut: "ACCEPTE",
  },
  {
    id: "dd3",
    numero: "DEV-2026-088",
    objet: "Étanchéité toiture · terrasse",
    montant: 1_150_000,
    date: "10 juillet 2026",
    validite: "15 jours",
    statut: "EXPIRE",
  },
];

const demoCommandes: ClientCommandeView[] = [
  {
    id: "dc1",
    numero: "CMD-2026-031",
    date: "4 août 2026",
    statut: "EN_PREPARATION",
    nbArticles: 5,
    montant: 486_500,
    articles: ["Carrelage grès cérame 60×60 — 24 m²", "Colle carrelage 25 kg — 6 sacs", "Joint époxy gris — 3 kg", "Croisillons 2 mm — 2 paquets", "Socle céramique — 12 unités"],
  },
  {
    id: "dc2",
    numero: "CMD-2026-029",
    date: "28 juillet 2026",
    statut: "LIVREE",
    nbArticles: 3,
    montant: 214_800,
    articles: ["Peinture acrylique blanche — 15 L", "Peinture acrylique gris perle — 10 L", "Gesso d'accrochage — 2,5 L"],
  },
  {
    id: "dc3",
    numero: "CMD-2026-027",
    date: "15 juillet 2026",
    statut: "LIVREE",
    nbArticles: 1,
    montant: 89_900,
    articles: ["Kit quincaillerie porte d'entrée"],
  },
];

const demoNotifications: ClientNotificationView[] = [
  {
    id: "dn1",
    kind: "mission",
    titre: "Rapport mission soumis",
    detail: "Peinture façade · Villa Cocody — rapport disponible",
    time: "Il y a 2 h",
    lu: false,
  },
  {
    id: "dn2",
    kind: "commande",
    titre: "Commande mise à jour",
    detail: "CMD-2026-031 passe en préparation",
    time: "Il y a 6 h",
    lu: false,
  },
  {
    id: "dn3",
    kind: "facture",
    titre: "Nouvelle facture",
    detail: "FAC-2026-0184 · 5 010 000 FCFA — échéance le 15 août",
    time: "Hier",
    lu: false,
  },
  {
    id: "dn4",
    kind: "devis",
    titre: "Nouveau devis",
    detail: "DEV-2026-095 · Aménagement jardin & clôture",
    time: "Hier",
    lu: true,
  },
  {
    id: "dn5",
    kind: "paiement",
    titre: "Paiement reçu",
    detail: "FAC-2026-0181 · 2 242 000 FCFA encaissés",
    time: "17 juin",
    lu: true,
  },
  {
    id: "dn6",
    kind: "cleans",
    titre: "Abonnement Wugams Cleans actif",
    detail: "Plan B Premium · prochain passage le 13 août à 08:00",
    time: "Aujourd'hui",
    lu: false,
  },
];

const demoDemandes: ClientDemandeView[] = [
  {
    id: "ddm1",
    type: "DEVIS",
    objet: "Aménagement jardin & clôture",
    detail: "Clôture en parpaings sur 45 m et aménagement d'un jardin carrelé avec allée.",
    date: "3 août 2026",
    statut: "ETUDIEE",
    piecesJointes: 3,
  },
  {
    id: "ddm2",
    type: "SERVICE",
    objet: "Entretien complet du carrelage de la terrasse",
    detail: "Nettoyage en profondeur et traitement anti-taches de la terrasse extérieure.",
    date: "26 juillet 2026",
    statut: "ACCEPTEE",
    piecesJointes: 1,
  },
  {
    id: "ddm3",
    type: "RECLAMATION",
    objet: "Finitions peinture salon",
    detail: "Quelques traces visibles à reprendre après livraison de la peinture intérieure.",
    date: "18 juillet 2026",
    statut: "DEVIS_PROPOSE",
    piecesJointes: 2,
  },
];

const demoProjets: ClientProjetView[] = [
  {
    id: "dp1",
    titre: "Rénovation intérieure · Résidence Traoré",
    filiale: "WUGAMS Rénovation",
    statut: "EN_COURS",
    progression: 68,
    debut: "20 juillet 2026",
    fin: null,
    equipe: "Équipe Rénovation",
    galerie: [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80", legende: "Salon après rénovation" },
      { url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=80", legende: "Cuisine équipée" },
      { url: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1400&q=80", legende: "Salle de bain" },
    ],
    rapport:
      "Les travaux avancent conformément au calendrier : reprise des peintures du salon et des chambres terminée, pose du carrelage en cours. La cuisine équipée sera installée en fin de semaine. Aucun dépassement budgétaire.",
  },
  {
    id: "dp2",
    titre: "Peinture façade · Villa Cocody",
    filiale: "WUGAMS Rénovation",
    statut: "RAPPORT_SOUMIS",
    progression: 85,
    debut: "28 juillet 2026",
    fin: null,
    equipe: "Équipe Peinture",
    galerie: [
      { url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80", legende: "Façade avant" },
      { url: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=1400&q=80", legende: "Peinture extérieure" },
    ],
    rapport:
      "Façade peinte sur les quatre faces, deux couches d'acrylique gris perle. Réserves : reprise d'un angle côté garage après séchage complet. Rapport photos joint au dossier.",
  },
  {
    id: "dp3",
    titre: "Étanchéité toiture · Résidence Traoré",
    filiale: "WUGAMS Rénovation",
    statut: "ACCEPTE",
    progression: 30,
    debut: "10 août 2026",
    fin: null,
    equipe: "Équipe Couverture",
    galerie: [
      { url: "https://images.unsplash.com/photo-1632260260864-caf7fde5ec36?w=1400&q=80", legende: "Toiture avant travaux" },
    ],
    rapport: null,
  },
  {
    id: "dp4",
    titre: "Installation cuisine équipée",
    filiale: "WUGAMS Mobilier",
    statut: "PLANIFIE",
    progression: 5,
    debut: "13 août 2026",
    fin: null,
    equipe: "Équipe Agencement",
    galerie: [
      { url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1400&q=80", legende: "Modèle de référence" },
    ],
    rapport: null,
  },
];

/* ------------------------------------------------------------------ */
/* Conversion API → vues                                               */
/* ------------------------------------------------------------------ */

function missionView(mission: Mission): ClientMissionView {
  const meta = missionStatutMeta[mission.statut];
  const equipe = mission.ouvrier
    ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}`.trim()
    : "Équipe WUGAMS";
  const dernierPointage = mission.pointages && mission.pointages.length > 0
    ? formatDateTimeFr(mission.pointages[mission.pointages.length - 1].horodatage)
    : null;
  return {
    id: mission.id,
    titre: mission.titre,
    statut: mission.statut,
    progression: meta.progression,
    date: mission.date_planifiee ? formatDateFr(mission.date_planifiee) : "—",
    equipe,
    dernierPointage,
  };
}

function notificationView(notification: Notification): ClientNotificationView | null {
  const message = notification.message ?? null;
  if (!message) return null;
  const raw = String(notification.type ?? "").toLowerCase();
  const kind: NotificationKind = raw.includes("cleans") || raw.includes("abonnement")
    ? "cleans"
    : raw.includes("facture") || raw.includes("paiement")
      ? raw.includes("paiement") ? "paiement" : "facture"
      : raw.includes("devis")
        ? "devis"
        : raw.includes("commande")
          ? "commande"
          : "mission";
  return {
    id: notification.id,
    kind,
    titre: message.split("\n")[0] ?? "Notification",
    detail: message,
    time: notification.created_at ? formatDateTimeFr(notification.created_at) : "—",
    lu: notification.lu ?? false,
  };
}

function devisView(devis: Devis): ClientDevisView {
  const objet = devis.lignes && devis.lignes.length > 0
    ? devis.lignes.map((ligne) => ligne.designation).join(" · ")
    : devis.client
      ? `Devis pour ${[devis.client.first_name, devis.client.last_name].filter(Boolean).join(" ") || devis.client.email}`
      : "Devis WUGAMS";
  return {
    id: devis.id,
    numero: devis.numero,
    objet: objet.slice(0, 64),
    montant: Number(devis.montant_ttc ?? devis.montant_ht ?? 0),
    date: formatDateFr(devis.created_at),
    validite: devis.date_validite ? formatDateFr(devis.date_validite) : "30 jours",
    statut: devisStatutFromApi[devis.statut] ?? "EN_ATTENTE",
  };
}

function commandeView(commande: Commande): ClientCommandeView {
  return {
    id: commande.id,
    numero: commande.numero,
    date: formatDateFr(commande.created_at),
    statut: commande.statut,
    nbArticles: commande.articles.reduce((sum, article) => sum + article.quantite, 0),
    montant: Number(commande.montant_total ?? 0),
    articles: commande.articles.map((article) => `${article.designation} — ${article.quantite} × ${formatFcfaCompact(article.prix_unitaire)}`),
  };
}

function demandeView(demande: DemandeDevis): ClientDemandeView {
  return {
    id: demande.id,
    type: "DEVIS",
    objet: demande.libelle,
    detail: demande.service,
    date: formatDateFr(demande.created_at),
    statut: demandeStatutFromApi[demande.statut] ?? "ENVOYEE",
    piecesJointes: 0,
  };
}

function projetView(projet: ClientProjet): ClientProjetView {
  return {
    id: projet.id,
    titre: projet.titre,
    filiale: "—",
    statut: projetStatutFromApi[projet.statut] ?? "PLANIFIE",
    progression: projet.avancement_pct ?? 0,
    debut: "—",
    fin: projet.prochaine_visite ? formatDateFr(projet.prochaine_visite) : null,
    equipe: projet.photos_count > 0 ? `${projet.photos_count} photo${projet.photos_count > 1 ? "s" : ""}` : "—",
    galerie: [],
    rapport: null,
  };
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export const demoClientPortalData: ClientPortalData = {
  live: false,
  missions: demoMissions,
  factures: demoFactures,
  devis: demoDevis,
  commandes: demoCommandes,
  notifications: demoNotifications,
  demandes: demoDemandes,
  projets: demoProjets,
  fidelite: null,
};

export async function loadClientPortalData(): Promise<ClientPortalData> {
  const [facturesRes, devisRes, commandesRes, missionsRes, notificationsRes, demandesRes, projetsRes, fideliteRes] =
    await Promise.allSettled([
      getFactures(),
      getDevis(),
      getCommandes(),
      getMissions(),
      listNotifications(),
      getDemandes(),
      getProjets(),
      getFidelite(),
    ]);

  const live =
    facturesRes.status === "fulfilled" ||
    devisRes.status === "fulfilled" ||
    commandesRes.status === "fulfilled" ||
    missionsRes.status === "fulfilled";

  /* API injoignable : repli complet sur la démonstration (badge « Aperçu démo »). */
  if (!live) return demoClientPortalData;

  /* API joignable : les listes réelles sont affichées, même vides.
     Une section en échec ponctuel (ex. /client-space/factures → 403 pour ROLE_CLIENT_STD)
     est montrée vide plutôt que remplacée par des données fictives. */
  const apiFactures = facturesRes.status === "fulfilled" ? facturesRes.value : [];

  const apiMissions = missionsRes.status === "fulfilled" ? missionsRes.value.map(missionView) : [];

  const apiDevis = devisRes.status === "fulfilled" ? devisRes.value.map(devisView) : [];

  const apiCommandes = commandesRes.status === "fulfilled" ? commandesRes.value.map(commandeView) : [];

  const apiNotifications = notificationsRes.status === "fulfilled"
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientNotificationView => n !== null)
    : [];

  const apiDemandes = demandesRes.status === "fulfilled" ? demandesRes.value.map(demandeView) : [];

  const apiProjets = projetsRes.status === "fulfilled" ? projetsRes.value.map(projetView) : [];

  const apiFidelite = fideliteRes.status === "fulfilled" ? fideliteRes.value : null;

  return {
    live: true,
    missions: apiMissions,
    factures: apiFactures,
    devis: apiDevis,
    commandes: apiCommandes,
    notifications: apiNotifications,
    demandes: apiDemandes,
    projets: apiProjets,
    fidelite: apiFidelite,
  };
}
