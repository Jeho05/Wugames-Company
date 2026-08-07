import type {
  Facture,
  FactureStatut,
  Mission,
  MissionStatut,
  Notification,
} from "@/app/lib/contracts";
import { getCommandes, getDevis, getFactures, getMissions } from "@/app/lib/api/client-space";
import { listNotifications } from "@/app/lib/api/notifications";

export type ClientGlobalState = "ok" | "action" | "critical";

export type DevisStatut = "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | "EXPIRE";

export type CommandeStatut = "EN_PREPARATION" | "LIVREE" | "ANNULEE";

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

export type NotificationKind = "mission" | "facture" | "devis" | "commande" | "paiement";

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
  EN_PREPARATION: { label: "En préparation", tone: "info" },
  LIVREE: { label: "Livrée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
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
    montant_ht: "4 245 763",
    montant_ttc: "5 010 000",
    statut: "EMISE",
    date_emission: "2026-07-28",
    date_echeance: "2026-08-15",
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
    montant_ht: "1 900 000",
    montant_ttc: "2 242 000",
    statut: "PAYEE",
    date_emission: "2026-06-02",
    date_echeance: "2026-06-17",
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
    montant_ht: "980 000",
    montant_ttc: "1 156 400",
    statut: "PAYEE",
    date_emission: "2026-05-28",
    date_echeance: "2026-06-12",
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
  const kind: NotificationKind = raw.includes("facture") || raw.includes("paiement")
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
};

export async function loadClientPortalData(): Promise<ClientPortalData> {
  const [facturesRes, devisRes, commandesRes, missionsRes, notificationsRes] = await Promise.allSettled([
    getFactures(),
    getDevis(),
    getCommandes(),
    getMissions(),
    listNotifications(),
  ]);

  const live =
    facturesRes.status === "fulfilled" ||
    devisRes.status === "fulfilled" ||
    commandesRes.status === "fulfilled" ||
    missionsRes.status === "fulfilled";

  const apiFactures = facturesRes.status === "fulfilled" && facturesRes.value.length > 0
    ? facturesRes.value
    : demoFactures;

  const apiMissions = missionsRes.status === "fulfilled" && missionsRes.value.length > 0
    ? missionsRes.value.map(missionView)
    : demoMissions;

  const apiDevis = devisRes.status === "fulfilled" && devisRes.value.length > 0
    ? (devisRes.value as unknown[]).map((raw, index) => {
        const entry = raw as Record<string, unknown>;
        const numero = String(entry.numero ?? entry.reference ?? `DEV-2026-${String(100 + index)}`);
        return {
          id: String(entry.id ?? numero),
          numero,
          objet: String(entry.objet ?? entry.titre ?? "Devis WUGAMS"),
          montant: Number(entry.montant ?? entry.montant_ttc ?? 0),
          date: formatDateFr(String(entry.date ?? entry.created_at ?? "")),
          validite: String(entry.validite ?? "30 jours"),
          statut: (String(entry.statut ?? "EN_ATTENTE") as DevisStatut) in devisStatutMeta
            ? (String(entry.statut) as DevisStatut)
            : "EN_ATTENTE",
        } satisfies ClientDevisView;
      })
    : demoDevis;

  const apiCommandes = commandesRes.status === "fulfilled" && commandesRes.value.length > 0
    ? (commandesRes.value as unknown[]).map((raw, index) => {
        const entry = raw as Record<string, unknown>;
        const numero = String(entry.numero ?? entry.reference ?? `CMD-2026-${String(100 + index)}`);
        const rawStatut = String(entry.statut ?? "EN_PREPARATION");
        return {
          id: String(entry.id ?? numero),
          numero,
          date: formatDateFr(String(entry.date ?? entry.created_at ?? "")),
          statut: (rawStatut as CommandeStatut) in commandeStatutMeta
            ? (rawStatut as CommandeStatut)
            : "EN_PREPARATION",
          nbArticles: Number(entry.nb_articles ?? (Array.isArray(entry.articles) ? entry.articles.length : 0)),
          montant: Number(entry.montant ?? entry.montant_ttc ?? 0),
          articles: Array.isArray(entry.articles)
            ? (entry.articles as unknown[]).map((article) => String(article))
            : [],
        } satisfies ClientCommandeView;
      })
    : demoCommandes;

  const apiNotifications = notificationsRes.status === "fulfilled" && notificationsRes.value.length > 0
    ? notificationsRes.value.map(notificationView).filter((n): n is ClientNotificationView => n !== null)
    : demoNotifications;

  return {
    live,
    missions: apiMissions,
    factures: apiFactures,
    devis: apiDevis,
    commandes: apiCommandes,
    notifications: apiNotifications,
  };
}
