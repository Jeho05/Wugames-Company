import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as notificationsApi from "@/app/lib/api/notifications";
import * as usersApi from "@/app/lib/api/users";
import type { ClientProfile, FournisseurProfile, User } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SecretaryKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
};

export type TaskPriority = "high" | "medium" | "low";

export type SecretaryTask = {
  id: string;
  title: string;
  detail: string;
  time: string;
  priority: TaskPriority;
  category: "dossier" | "validation" | "rdv" | "rappel";
};

export type SecretaryActivityItem = {
  id: string;
  type: "client" | "fournisseur" | "utilisateur" | "audit";
  title: string;
  detail: string;
  time: string;
};

export type SecretaryNotificationItem = {
  id: string;
  kind: "client" | "fournisseur" | "demande" | "validation";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export type AgendaEventType = "rdv" | "rappel" | "echeance" | "anniversaire";

export type AgendaEvent = {
  id: string;
  day: number;
  type: AgendaEventType;
  label: string;
  time?: string;
};

export type SearchEntry = {
  id: string;
  kind: "client" | "fournisseur" | "utilisateur";
  title: string;
  subtitle: string;
  href: string;
};

export type SecretaryOverview = {
  source: "api";
  updatedAt: number;
  firstName: string;
  kpis: SecretaryKpi[];
  tasks: SecretaryTask[];
  activity: SecretaryActivityItem[];
  notifications: SecretaryNotificationItem[];
  agenda: AgendaEvent[];
  searchIndex: SearchEntry[];
  clients: ClientProfile[];
  fournisseurs: FournisseurProfile[];
  users: User[];
  unread: number;
  /** true si au moins une source API a échoué (panne ≠ "0"). */
  partial: boolean;
  loadErrors: string[];
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonthKeys(count: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKeyOf(d), label: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d) });
  }
  return out;
}

function bucketByMonth(items: { date: string | null | undefined; value: number }[], keys: string[]): number[] {
  const buckets = new Array(keys.length).fill(0) as number[];
  for (const item of items) {
    if (!item.date) continue;
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = keys.indexOf(monthKeyOf(parsed));
    if (index !== -1) buckets[index] += item.value;
  }
  return buckets;
}

function momPercent(current: number, previous: number): string | null {
  if (previous <= 0) return null;
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")} %`;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

function isToday(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function fullName(first?: string | null, last?: string | null, fallback = "—"): string {
  return [first, last].filter(Boolean).join(" ") || fallback;
}

const roleLabels: Record<string, string> = {
  ROLE_CLIENT_STD: "Client",
  ROLE_CLIENT_MEMBRE: "Client membre",
  ROLE_OUVRIER: "Ouvrier",
  ROLE_RESP_OUVRIERS: "Resp. ouvriers",
  ROLE_FOURNISSEUR: "Fournisseur",
  ROLE_SECRETAIRE: "Secrétaire",
  ROLE_COMPTABLE: "Comptable",
  ROLE_MGR_OPS: "Mgr Opérations",
  ROLE_MGR_PARTENAIRE: "Mgr Partenariats",
  ROLE_MGR_FILIALE: "Mgr Filiale",
  ROLE_DEV_DIGITAL: "Dev Digital",
  ROLE_GERANT: "Gérant",
};

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadSecretaryOverview(): Promise<SecretaryOverview | null> {
  const [clientsRes, fournisseursRes, usersRes, notifRes, auditRes] = await Promise.allSettled([
    clientsApi.listClients(),
    fournisseursApi.listFournisseurs(),
    usersApi.listUsers(),
    notificationsApi.listNotifications(),
    auditApi.listAuditLogs(),
  ]);

  const clients = clientsRes.status === "fulfilled" ? clientsRes.value : [];
  const fournisseurs = fournisseursRes.status === "fulfilled" ? fournisseursRes.value : [];
  const users = usersRes.status === "fulfilled" ? usersRes.value : [];
  const notifications = notifRes.status === "fulfilled" ? notifRes.value : [];
  const audits = auditRes.status === "fulfilled" ? auditRes.value : [];

  const now = Date.now();
  const months = lastMonthKeys(12);
  const monthKeys = months.map((m) => m.key);

  /* --- Séries mensuelles réelles ----------------------------------- */
  // PRODUCTION : les buckets sont les créations réelles par mois. Quand tout
  // est à zéro, on garde la série réelle (ligne plate honnête) — jamais de
  // faux historique ascendant.
  const clientBuckets = bucketByMonth(clients.map((c) => ({ date: c.created_at, value: 1 })), monthKeys);
  const fournisseurBuckets = bucketByMonth(fournisseurs.map((f) => ({ date: f.created_at, value: 1 })), monthKeys);
  const userBuckets = bucketByMonth(users.map((u) => ({ date: u.created_at, value: 1 })), monthKeys);
  const documentBuckets = bucketByMonth(
    audits.filter((a) => a.action === "CREATE").map((a) => ({ date: a.created_at, value: 1 })),
    monthKeys,
  );

  // Créations quotidiennes réelles sur 12 jours (pour le KPI "nouveaux").
  const dayKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const creationsQuotidiennes = dayKeys.map((key) => {
    const countIn = (dates: (string | null | undefined)[]) =>
      dates.filter((date) => (date ?? "").slice(0, 10) === key).length;
    return (
      countIn(clients.map((c) => c.created_at)) +
      countIn(fournisseurs.map((f) => f.created_at)) +
      countIn(users.map((u) => u.created_at))
    );
  });

  /* --- Nouveaux aujourd'hui ---------------------------------------- */
  const nouveauxClients = clients.filter((c) => isToday(c.created_at)).length;
  const nouveauxFournisseurs = fournisseurs.filter((f) => isToday(f.created_at)).length;
  const nouveauxUsers = users.filter((u) => isToday(u.created_at)).length;
  const nouveauxTotal = nouveauxClients + nouveauxFournisseurs + nouveauxUsers;

  /* --- Notifications réelles --------------------------------------- */
  const unread = notifications.filter((n) => n.lu !== true).length;
  const notificationItems: SecretaryNotificationItem[] = notifications
    .slice(0, 6)
    .map((n) => {
      const message = typeof n.message === "string" ? n.message : n.type ?? "Événement";
      const lower = `${n.type ?? ""} ${message}`.toLowerCase();
      const kind: SecretaryNotificationItem["kind"] = lower.includes("fournisseur")
        ? "fournisseur"
        : lower.includes("demande") || lower.includes("devis")
          ? "demande"
          : lower.includes("validation") || lower.includes("valider")
            ? "validation"
            : "client";
      return {
        id: n.id,
        kind,
        title: n.type ?? "Notification",
        detail: message,
        time: relativeTime(n.created_at),
        unread: n.lu !== true,
      };
    })
    .filter((n) => n.time !== "—");

  const enrichedNotifications: SecretaryNotificationItem[] = [
    ...(nouveauxClients > 0 ? [{ id: "sec-nc", kind: "client" as const, title: "Nouveaux clients", detail: `${nouveauxClients} client(s) créé(s) aujourd'hui`, time: "Aujourd'hui", unread: true }] : []),
    ...(nouveauxFournisseurs > 0 ? [{ id: "sec-nf", kind: "fournisseur" as const, title: "Nouveaux fournisseurs", detail: `${nouveauxFournisseurs} fournisseur(s) créé(s) aujourd'hui`, time: "Aujourd'hui", unread: true }] : []),
    ...notificationItems,
  ];

  /* --- KPIs --------------------------------------------------------- */
  const clientChange = momPercent(clientBuckets[clientBuckets.length - 1], clientBuckets[clientBuckets.length - 2]);
  const fournisseurChange = momPercent(fournisseurBuckets[fournisseurBuckets.length - 1], fournisseurBuckets[fournisseurBuckets.length - 2]);
  const userChange = momPercent(userBuckets[userBuckets.length - 1], userBuckets[userBuckets.length - 2]);
  const documentChange = momPercent(documentBuckets[documentBuckets.length - 1], documentBuckets[documentBuckets.length - 2]);

  const fichesIncompletes =
    clients.filter((c) => !c.adresse).length +
    fournisseurs.filter((f) => !f.adresse).length +
    users.filter((u) => !u.phone).length;

  const kpis: SecretaryKpi[] = [
    {
      key: "clients",
      label: "Clients",
      value: formatNumber(clients.length),
      change: clientChange ?? "stables",
      trend: clientChange ? (clientChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "users",
      spark: clientBuckets,
      caption: "fiches actives",
    },
    {
      key: "fournisseurs",
      label: "Fournisseurs",
      value: formatNumber(fournisseurs.length),
      change: fournisseurChange ?? "stables",
      trend: fournisseurChange ? (fournisseurChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "truck",
      spark: fournisseurBuckets,
      caption: "référencés",
    },
    {
      key: "utilisateurs",
      label: "Utilisateurs",
      value: formatNumber(users.length),
      change: userChange ?? "stables",
      trend: userChange ? (userChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "hardhat",
      spark: userBuckets,
      caption: "comptes ERP",
    },
    {
      key: "nouveaux",
      label: "Nouveaux aujourd'hui",
      value: formatNumber(nouveauxTotal),
      change: `${nouveauxClients} client(s) · ${nouveauxFournisseurs} fournisseur(s) · ${nouveauxUsers} user(s)`,
      trend: nouveauxTotal > 0 ? "up" : "flat",
      icon: "sparkles",
      spark: creationsQuotidiennes,
      caption: "créés par jour (12 derniers jours)",
    },
    {
      key: "demandes",
      label: "Notifications non lues",
      value: formatNumber(unread + fichesIncompletes),
      change: `${unread} notification(s) · ${fichesIncompletes} fiche(s) à compléter`,
      trend: unread + fichesIncompletes > 0 ? "flat" : "down",
      icon: "clipboard",
      spark: [],
      caption: "à traiter",
    },
    {
      key: "documents",
      label: "Documents créés",
      value: formatNumber(documentBuckets[documentBuckets.length - 1]),
      change: documentChange ?? "ce mois",
      trend: documentChange ? (documentChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "file-text",
      spark: documentBuckets,
      caption: "créations journalisées",
    },
  ];

  /* --- Tâches du jour ----------------------------------------------- */
  // PRODUCTION : dérivées de compteurs réels, intitulés honnêtes (une
  // notification non lue n'est PAS une "demande à valider" sans preuve).
  // Heures fixes supprimées : échéance "Aujourd'hui".
  const tasks: SecretaryTask[] = [
    ...(fichesIncompletes > 0
      ? [{
          id: "tk-fiches",
          title: "Fiches à compléter",
          detail: `${fichesIncompletes} fiche(s) sans téléphone ou adresse`,
          time: "Aujourd'hui",
          priority: "high" as const,
          category: "dossier" as const,
        }]
      : []),
    ...(unread > 0
      ? [{
          id: "tk-notif",
          title: "Traiter les notifications",
          detail: `${unread} notification(s) non lue(s)`,
          time: "Aujourd'hui",
          priority: "high" as const,
          category: "rappel" as const,
        }]
      : []),
    ...(nouveauxTotal > 0
      ? [{
          id: "tk-nouveaux",
          title: "Compléter les nouveaux profils",
          detail: `${nouveauxTotal} profil(s) créé(s) aujourd'hui`,
          time: "Aujourd'hui",
          priority: "medium" as const,
          category: "dossier" as const,
        }]
      : []),
  ];

  /* --- Activité récente --------------------------------------------- */
  const rawEvents: { time: number; id: string; type: SecretaryActivityItem["type"]; title: string; detail: string }[] = [];
  for (const c of clients) {
    const t = Date.parse(c.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({ time: t, id: `c-${c.id}`, type: "client", title: "Client créé", detail: fullName(c.user?.first_name, c.user?.last_name, c.user?.email ?? "Client") });
  }
  for (const f of fournisseurs) {
    const t = Date.parse(f.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({ time: t, id: `f-${f.id}`, type: "fournisseur", title: "Fournisseur créé", detail: f.raison_sociale ?? "Fournisseur" });
  }
  for (const u of users) {
    const t = Date.parse(u.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({ time: t, id: `u-${u.id}`, type: "utilisateur", title: "Utilisateur ajouté", detail: `${fullName(u.first_name, u.last_name)} · ${roleLabels[u.role] ?? u.role}` });
  }
  for (const a of audits) {
    const t = Date.parse(a.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({ time: t, id: `a-${a.id}`, type: "audit", title: `Fiche ${a.action === "CREATE" ? "créée" : a.action === "DELETE" ? "supprimée" : "modifiée"}`, detail: `${a.table_cible} · ${a.user ? fullName(a.user.first_name, a.user.last_name) : "système"}` });
  }

  const activity: SecretaryActivityItem[] = rawEvents
    .sort((a, b) => b.time - a.time)
    .slice(0, 6)
    .map((e) => ({ id: e.id, type: e.type, title: e.title, detail: e.detail, time: relativeTime(new Date(e.time).toISOString()) }));

  /* --- Index de recherche ------------------------------------------- */
  const searchIndex: SearchEntry[] = [
    ...clients.map((c) => ({
      id: `c-${c.id}`,
      kind: "client" as const,
      title: fullName(c.user?.first_name, c.user?.last_name, c.user?.email ?? "Client"),
      subtitle: [c.user?.email, c.user?.phone, `ID ${c.id.slice(0, 8)}`].filter(Boolean).join(" · "),
      href: "/espace/clients",
    })),
    ...fournisseurs.map((f) => ({
      id: `f-${f.id}`,
      kind: "fournisseur" as const,
      title: f.raison_sociale ?? fullName(f.user?.first_name, f.user?.last_name),
      subtitle: [f.user?.email, f.user?.phone, `ID ${f.id.slice(0, 8)}`].filter(Boolean).join(" · "),
      href: "/espace/fournisseurs",
    })),
    ...users.map((u) => ({
      id: `u-${u.id}`,
      kind: "utilisateur" as const,
      title: fullName(u.first_name, u.last_name),
      subtitle: [u.email, u.phone, `ID ${u.id.slice(0, 8)}`].filter(Boolean).join(" · "),
      href: u.role === "ROLE_OUVRIER" ? "/espace/ouvriers" : "/espace/administration",
    })),
  ];

  /* --- Agenda : anniversaires professionnels réels ------------------- */
  const nowDate = new Date();
  const agenda: AgendaEvent[] = [
    ...users
      .map((u): AgendaEvent | null => {
        const created = new Date(u.created_at ?? "");
        if (Number.isNaN(created.getTime())) return null;
        if (created.getMonth() !== nowDate.getMonth()) return null;
        return {
          id: `anniv-${u.id}`,
          day: created.getDate(),
          type: "anniversaire" as const,
          label: `${fullName(u.first_name, u.last_name)} · anniversaire`,
        };
      })
      .filter((e): e is AgendaEvent => e !== null),
  ];

  return {
    source: "api",
    updatedAt: now,
    firstName: "Secrétaire",
    kpis,
    tasks,
    activity,
    notifications: enrichedNotifications,
    agenda,
    searchIndex,
    clients,
    fournisseurs,
    users,
    unread,
    partial:
      clientsRes.status === "rejected" ||
      fournisseursRes.status === "rejected" ||
      usersRes.status === "rejected" ||
      notifRes.status === "rejected" ||
      auditRes.status === "rejected",
    loadErrors: [
      ...(clientsRes.status === "rejected" ? ["clients"] : []),
      ...(fournisseursRes.status === "rejected" ? ["fournisseurs"] : []),
      ...(usersRes.status === "rejected" ? ["users"] : []),
      ...(notifRes.status === "rejected" ? ["notifications"] : []),
      ...(auditRes.status === "rejected" ? ["audit"] : []),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Métadonnées                                                         */
/* ------------------------------------------------------------------ */

export const taskPriorityMeta: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  high: { label: "Haute", dot: "bg-red-500", badge: "border-red-200 bg-red-50 text-red-700" },
  medium: { label: "Moyenne", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  low: { label: "Basse", dot: "bg-slate-400", badge: "border-slate-200 bg-slate-100 text-slate-600" },
};

export const agendaEventMeta: Record<AgendaEventType, { label: string; dot: string }> = {
  rdv: { label: "Rendez-vous", dot: "bg-sky-500" },
  rappel: { label: "Rappel", dot: "bg-amber-500" },
  echeance: { label: "Échéance", dot: "bg-red-500" },
  anniversaire: { label: "Anniversaire", dot: "bg-emerald-500" },
};

/* ------------------------------------------------------------------ */
/* Boutiques de la filiale                                             */
/* ------------------------------------------------------------------ */

export type BoutiqueType = "entretien" | "materiaux" | "mobilier" | "outillage";

export type SecretaryBoutique = {
  id: string;
  nom: string;
  type: BoutiqueType;
  gerant: string;
  adresse: string;
  membres: number;
  commandes: number;
  chiffreAffaires: number;
  statut: "ACTIVE" | "EN_PREPARATION" | "SUSPENDUE";
  created_at: string;
};

export const boutiqueTypeMeta: Record<BoutiqueType, { label: string; icon: IconName; tile: string }> = {
  entretien: { label: "Entretien", icon: "sparkles", tile: "bg-emerald-50 text-emerald-600" },
  materiaux: { label: "Matériaux", icon: "truck", tile: "bg-sky-50 text-sky-600" },
  mobilier: { label: "Mobilier", icon: "building", tile: "bg-amber-50 text-amber-600" },
  outillage: { label: "Outillage", icon: "hardhat", tile: "bg-violet-50 text-violet-600" },
};

export const boutiqueStatutMeta: Record<SecretaryBoutique["statut"], { label: string; badge: string; dot: string }> = {
  ACTIVE: { label: "Active", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  EN_PREPARATION: { label: "En préparation", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  SUSPENDUE: { label: "Suspendue", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

export const demoSecBoutiques: SecretaryBoutique[] = [];

/* ------------------------------------------------------------------ */
/* Espace de vente (caisse)                                            */
/* ------------------------------------------------------------------ */

export type ProduitVente = {
  id: string;
  nom: string;
  categorie: BoutiqueType;
  prix: number;
  stock: number;
  unite: string;
  boutiqueId: string;
};

export type Vente = {
  id: string;
  client: string;
  items: { produitId: string; nom: string; quantite: number; prix: number }[];
  total: number;
  mode: "MOMO" | "CARTE" | "ESPECES" | "COMPTE";
  statut: "PAYEE" | "EN_ATTENTE";
  date: string;
  caisse: string;
};

export const demoSecProduits: ProduitVente[] = [];

export const demoSecVentes: Vente[] = [];

export const venteModeMeta: Record<Vente["mode"], { label: string; icon: IconName }> = {
  MOMO: { label: "Mobile Money", icon: "phone" },
  CARTE: { label: "Carte bancaire", icon: "credit-card" },
  ESPECES: { label: "Espèces", icon: "wallet" },
  COMPTE: { label: "Compte membre", icon: "users" },
};

/* ------------------------------------------------------------------ */
/* Création de comptes                                                 */
/* ------------------------------------------------------------------ */

export type CompteCreation = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REFUSE";
  demandePar: string;
  date: string;
};

export const demoSecComptes: CompteCreation[] = [];

export function formatMontantFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}
