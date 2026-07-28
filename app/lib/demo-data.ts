import type { IconName } from "@/app/components/ui/app-icon";

export type StatusTone = "danger" | "info" | "neutral" | "success" | "warning";

export type ModuleStatus = {
  label: string;
  tone: StatusTone;
};

export type ModuleColumn = {
  id: string;
  label: string;
};

export type ModuleRow = Record<string, string | ModuleStatus>;

export type ModuleDefinition = {
  actionLabel: string;
  columns: ModuleColumn[];
  description: string;
  icon: IconName;
  insights: {
    label: string;
    value: string;
  }[];
  eyebrow: string;
  rows: ModuleRow[];
  stats: {
    label: string;
    value: string;
  }[];
  tabs: string[];
  title: string;
};

export const navigationGroups: {
  label: string;
  items: {
    href: string;
    icon: IconName;
    label: string;
  }[];
}[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/espace", icon: "dashboard", label: "Vue d'ensemble" },
      { href: "/espace/rapports", icon: "chart", label: "Rapports" },
      { href: "/espace/filiales", icon: "building", label: "Filiales" },
    ],
  },
  {
    label: "Opérations",
    items: [
      { href: "/espace/clients", icon: "users", label: "Clients" },
      { href: "/espace/chantiers", icon: "folder", label: "Chantiers" },
      { href: "/espace/missions", icon: "clipboard", label: "Missions" },
      { href: "/espace/ouvriers", icon: "hardhat", label: "Ouvriers" },
      { href: "/espace/devis", icon: "file-text", label: "Devis & factures" },
    ],
  },
  {
    label: "Ressources",
    items: [
      { href: "/espace/stocks", icon: "boxes", label: "Stocks" },
      { href: "/espace/fournisseurs", icon: "truck", label: "Fournisseurs" },
      { href: "/espace/messagerie", icon: "message", label: "Messagerie" },
      { href: "/espace/notifications", icon: "bell", label: "Notifications" },
    ],
  },
];

export const clientNavigationGroups: {
  label: string;
  items: {
    href: string;
    icon: IconName;
    label: string;
  }[];
}[] = [
  {
    label: "Mon espace",
    items: [
      { href: "/espace", icon: "dashboard", label: "Vue d'ensemble" },
      { href: "/espace/projets", icon: "folder", label: "Mes projets" },
      { href: "/espace/demandes", icon: "clipboard", label: "Mes demandes" },
    ],
  },
  {
    label: "Suivi",
    items: [
      { href: "/espace/documents", icon: "file-text", label: "Documents" },
      { href: "/espace/factures", icon: "chart", label: "Factures & paiements" },
      { href: "/espace/messages", icon: "message", label: "Messages" },
      { href: "/espace/notifications", icon: "bell", label: "Notifications" },
    ],
  },
];

export const dashboardMetrics = [
  {
    caption: "vs. mois précédent",
    change: "+12,8 %",
    icon: "chart" as IconName,
    label: "Chiffre d'affaires",
    tone: "success" as StatusTone,
    value: "41,8 M",
  },
  {
    caption: "3 démarrent cette semaine",
    change: "12 actifs",
    icon: "folder" as IconName,
    label: "Chantiers",
    tone: "info" as StatusTone,
    value: "18",
  },
  {
    caption: "sur les missions planifiées",
    change: "94 %",
    icon: "hardhat" as IconName,
    label: "Présence équipes",
    tone: "success" as StatusTone,
    value: "76 / 81",
  },
  {
    caption: "à traiter aujourd'hui",
    change: "8 alertes",
    icon: "warning" as IconName,
    label: "Points d'attention",
    tone: "warning" as StatusTone,
    value: "08",
  },
];

export const dashboardProjects = [
  {
    client: "Résidence Koffi",
    lead: "Équipe Atlas",
    location: "Cocody, Abidjan",
    progress: 78,
    status: { label: "En cours", tone: "info" as StatusTone },
    value: "8,4 M FCFA",
  },
  {
    client: "Immeuble Ahoua",
    lead: "Équipe Horizon",
    location: "Marcory, Abidjan",
    progress: 52,
    status: { label: "Rapport soumis", tone: "warning" as StatusTone },
    value: "12,6 M FCFA",
  },
  {
    client: "Villa Koné",
    lead: "Équipe Sirocco",
    location: "Bingerville",
    progress: 28,
    status: { label: "Planifié", tone: "neutral" as StatusTone },
    value: "5,1 M FCFA",
  },
];

export const stockAlerts = [
  { stock: "12 unités", title: "Peinture blanc mat 25L", tone: "warning" as StatusTone },
  { stock: "04 unités", title: "Ciment 50 kg", tone: "danger" as StatusTone },
  { stock: "09 unités", title: "Câble électrique 2,5 mm", tone: "warning" as StatusTone },
];

export const schedule = [
  { time: "08:30", title: "Brief chantier — Résidence Koffi", type: "Opérations" },
  { time: "11:00", title: "Validation devis — Villa Koné", type: "Commerce" },
  { time: "15:30", title: "Réception commande — Dépôt Treichville", type: "Stocks" },
];

export const modules: Record<string, ModuleDefinition> = {
  clients: {
    actionLabel: "Nouveau client",
    columns: [
      { id: "client", label: "Client" },
      { id: "type", label: "Profil" },
      { id: "contact", label: "Contact" },
      { id: "activité", label: "Dernière activité" },
      { id: "statut", label: "Statut" },
    ],
    description: "Centralisez les fiches, dossiers et historiques client à travers les filiales.",
    eyebrow: "Relation client",
    icon: "users",
    insights: [
      { label: "Nouveaux ce mois", value: "+24" },
      { label: "Réclamations ouvertes", value: "05" },
      { label: "Satisfaction moyenne", value: "4,7 / 5" },
    ],
    rows: [
      { client: "Maison Kouassi", type: "Client membre", contact: "contact@kouassi.ci", activité: "Chantier actif", statut: { label: "Actif", tone: "success" } },
      { client: "Groupe Ahoua", type: "Client membre", contact: "direction@ahoua.ci", activité: "Devis validé", statut: { label: "Actif", tone: "success" } },
      { client: "David Koné", type: "Client standard", contact: "+225 07 00 92 14", activité: "Commande livrée", statut: { label: "À relancer", tone: "warning" } },
      { client: "SCI Les Palmiers", type: "Client membre", contact: "projets@palmiers.ci", activité: "Réclamation ouverte", statut: { label: "Attention", tone: "danger" } },
    ],
    stats: [
      { label: "Clients actifs", value: "1 284" },
      { label: "Membres", value: "316" },
      { label: "Prospects qualifiés", value: "84" },
    ],
    tabs: ["Tous", "Membres", "Standards", "Réclamations"],
    title: "Clients",
  },
  chantiers: {
    actionLabel: "Nouveau chantier",
    columns: [
      { id: "chantier", label: "Chantier" },
      { id: "client", label: "Client" },
      { id: "responsable", label: "Responsable" },
      { id: "échéance", label: "Échéance" },
      { id: "statut", label: "Statut" },
    ],
    description: "Suivez l'avancement, les équipes et les preuves terrain de chaque intervention.",
    eyebrow: "Exécution terrain",
    icon: "folder",
    insights: [
      { label: "Dans les délais", value: "83 %" },
      { label: "Rapports à valider", value: "07" },
      { label: "Budget engagé", value: "68 %" },
    ],
    rows: [
      { chantier: "Résidence Koffi — Rénovation", client: "Maison Kouassi", responsable: "A. Bamba", échéance: "18 août", statut: { label: "En cours", tone: "info" } },
      { chantier: "Immeuble Ahoua — Façade", client: "Groupe Ahoua", responsable: "S. Gnahoua", échéance: "24 août", statut: { label: "Rapport soumis", tone: "warning" } },
      { chantier: "Villa Koné — Aménagement", client: "David Koné", responsable: "F. Kouamé", échéance: "02 sept.", statut: { label: "Planifié", tone: "neutral" } },
      { chantier: "Bureaux N'Dri — Maintenance", client: "SCI Les Palmiers", responsable: "A. Bamba", échéance: "15 août", statut: { label: "À contrôler", tone: "danger" } },
    ],
    stats: [
      { label: "Chantiers ouverts", value: "18" },
      { label: "Terminés ce mois", value: "11" },
      { label: "Taux de conformité", value: "96 %" },
    ],
    tabs: ["Tous", "En cours", "Planifiés", "À contrôler"],
    title: "Chantiers",
  },
  missions: {
    actionLabel: "Affecter une mission",
    columns: [
      { id: "mission", label: "Mission" },
      { id: "équipe", label: "Équipe" },
      { id: "lieu", label: "Lieu" },
      { id: "créneau", label: "Créneau" },
      { id: "statut", label: "Statut" },
    ],
    description: "Planifiez les interventions, suivez les acceptations et validez les rapports terrain.",
    eyebrow: "Planning des équipes",
    icon: "clipboard",
    insights: [
      { label: "À accepter", value: "06" },
      { label: "Pointages vérifiés", value: "31" },
      { label: "Rapports soumis", value: "07" },
    ],
    rows: [
      { mission: "Pose revêtement — KOFFI-041", équipe: "Atlas · 4 ouvriers", lieu: "Cocody", créneau: "Aujourd'hui · 08:30", statut: { label: "En cours", tone: "info" } },
      { mission: "Diagnostic plomberie — AHO-012", équipe: "Horizon · 2 ouvriers", lieu: "Marcory", créneau: "Aujourd'hui · 10:00", statut: { label: "Pointé", tone: "success" } },
      { mission: "Préparation peinture — KON-005", équipe: "Sirocco · 3 ouvriers", lieu: "Bingerville", créneau: "Demain · 07:30", statut: { label: "Notifiée", tone: "neutral" } },
      { mission: "Contrôle qualité — PAL-003", équipe: "Atlas · 2 ouvriers", lieu: "Treichville", créneau: "Demain · 14:00", statut: { label: "À valider", tone: "warning" } },
    ],
    stats: [
      { label: "Missions aujourd'hui", value: "14" },
      { label: "Acceptées", value: "92 %" },
      { label: "À vérifier GPS", value: "02" },
    ],
    tabs: ["Aujourd'hui", "Planifiées", "En cours", "Rapports"],
    title: "Missions",
  },
  ouvriers: {
    actionLabel: "Nouvel ouvrier",
    columns: [
      { id: "ouvrier", label: "Ouvrier" },
      { id: "compétences", label: "Compétences" },
      { id: "équipe", label: "Équipe" },
      { id: "performance", label: "Performance" },
      { id: "statut", label: "Statut" },
    ],
    description: "Organisez les compétences, disponibilités, présences et évaluations de vos équipes.",
    eyebrow: "Ressources humaines terrain",
    icon: "hardhat",
    insights: [
      { label: "Disponibles", value: "23" },
      { label: "Taux de présence", value: "94 %" },
      { label: "Évaluations à faire", value: "08" },
    ],
    rows: [
      { ouvrier: "Kouamé Firmin", compétences: "Maçonnerie · Finition", équipe: "Atlas", performance: "4,8 / 5", statut: { label: "En mission", tone: "info" } },
      { ouvrier: "Yao Christian", compétences: "Électricité", équipe: "Horizon", performance: "4,6 / 5", statut: { label: "En mission", tone: "info" } },
      { ouvrier: "N'Dri Mireille", compétences: "Peinture · Décoration", équipe: "Sirocco", performance: "4,9 / 5", statut: { label: "Disponible", tone: "success" } },
      { ouvrier: "Kouassi Didier", compétences: "Plomberie", équipe: "—", performance: "4,1 / 5", statut: { label: "Indisponible", tone: "neutral" } },
    ],
    stats: [
      { label: "Effectif actif", value: "81" },
      { label: "Équipes terrain", value: "16" },
      { label: "Performance moyenne", value: "4,6 / 5" },
    ],
    tabs: ["Tous", "En mission", "Disponibles", "Évaluations"],
    title: "Ouvriers",
  },
  devis: {
    actionLabel: "Créer un devis",
    columns: [
      { id: "référence", label: "Référence" },
      { id: "client", label: "Client" },
      { id: "montant", label: "Montant TTC" },
      { id: "date", label: "Date limite" },
      { id: "statut", label: "Statut" },
    ],
    description: "Gérez le cycle devis, factures et paiements sans perdre la trace des validations.",
    eyebrow: "Facturation",
    icon: "file-text",
    insights: [
      { label: "À envoyer", value: "05" },
      { label: "Acceptation", value: "74 %" },
      { label: "Factures impayées", value: "09" },
    ],
    rows: [
      { référence: "DEV-2026-084", client: "Maison Kouassi", montant: "8 420 000 FCFA", date: "30 juil.", statut: { label: "Accepté", tone: "success" } },
      { référence: "DEV-2026-085", client: "Villa Koné", montant: "5 120 000 FCFA", date: "02 août", statut: { label: "Envoyé", tone: "info" } },
      { référence: "FAC-2026-071", client: "Groupe Ahoua", montant: "12 600 000 FCFA", date: "08 août", statut: { label: "À encaisser", tone: "warning" } },
      { référence: "FAC-2026-069", client: "SCI Les Palmiers", montant: "3 280 000 FCFA", date: "18 juil.", statut: { label: "En retard", tone: "danger" } },
    ],
    stats: [
      { label: "Montant facturé", value: "41,8 M" },
      { label: "En attente", value: "8,7 M" },
      { label: "Paiements reçus", value: "33,1 M" },
    ],
    tabs: ["Tous", "Devis", "Factures", "Paiements"],
    title: "Devis & factures",
  },
  stocks: {
    actionLabel: "Ajouter un produit",
    columns: [
      { id: "produit", label: "Produit" },
      { id: "dépôt", label: "Dépôt" },
      { id: "disponible", label: "Disponible" },
      { id: "seuil", label: "Seuil minimum" },
      { id: "statut", label: "Statut" },
    ],
    description: "Supervisez les dépôts, seuils d'alerte et mouvements de chaque filiale.",
    eyebrow: "Approvisionnement",
    icon: "boxes",
    insights: [
      { label: "Articles suivis", value: "1 146" },
      { label: "Alertes de rupture", value: "08" },
      { label: "Valeur du stock", value: "67,4 M" },
    ],
    rows: [
      { produit: "Peinture blanc mat 25L", dépôt: "Treichville", disponible: "12 unités", seuil: "15 unités", statut: { label: "À commander", tone: "warning" } },
      { produit: "Ciment 50 kg", dépôt: "Cocody", disponible: "04 unités", seuil: "20 unités", statut: { label: "Rupture proche", tone: "danger" } },
      { produit: "Câble électrique 2,5 mm", dépôt: "Treichville", disponible: "09 rouleaux", seuil: "12 rouleaux", statut: { label: "À commander", tone: "warning" } },
      { produit: "Carrelage grès 60x60", dépôt: "Marcory", disponible: "88 cartons", seuil: "30 cartons", statut: { label: "Disponible", tone: "success" } },
    ],
    stats: [
      { label: "Dépôts actifs", value: "06" },
      { label: "Mouvements aujourd'hui", value: "42" },
      { label: "Réceptions attendues", value: "03" },
    ],
    tabs: ["Catalogue", "Alertes", "Mouvements", "Inventaires"],
    title: "Stocks",
  },
  fournisseurs: {
    actionLabel: "Nouveau fournisseur",
    columns: [
      { id: "fournisseur", label: "Fournisseur" },
      { id: "catégorie", label: "Catégorie" },
      { id: "commande", label: "Dernière commande" },
      { id: "délai", label: "Délai moyen" },
      { id: "statut", label: "Statut" },
    ],
    description: "Pilotez les partenaires, commandes de réapprovisionnement et réceptions de marchandises.",
    eyebrow: "Partenariats",
    icon: "truck",
    insights: [
      { label: "Fournisseurs actifs", value: "86" },
      { label: "Commandes ouvertes", value: "11" },
      { label: "Livraisons à recevoir", value: "03" },
    ],
    rows: [
      { fournisseur: "BatiPro CI", catégorie: "Matériaux gros œuvre", commande: "BC-2026-120", délai: "2 jours", statut: { label: "En livraison", tone: "info" } },
      { fournisseur: "Électro Plus", catégorie: "Électricité", commande: "BC-2026-118", délai: "4 jours", statut: { label: "Confirmée", tone: "success" } },
      { fournisseur: "Déco & Maison", catégorie: "Finition", commande: "BC-2026-115", délai: "7 jours", statut: { label: "À relancer", tone: "warning" } },
      { fournisseur: "Cimaf Abidjan", catégorie: "Ciment", commande: "BC-2026-112", délai: "1 jour", statut: { label: "Retard", tone: "danger" } },
    ],
    stats: [
      { label: "Fiabilité moyenne", value: "94 %" },
      { label: "Délai moyen", value: "3,2 j" },
      { label: "Commandes ce mois", value: "38" },
    ],
    tabs: ["Partenaires", "Commandes", "Réceptions", "Portail fournisseur"],
    title: "Fournisseurs",
  },
  filiales: {
    actionLabel: "Créer une filiale",
    columns: [
      { id: "filiale", label: "Filiale" },
      { id: "domain", label: "Domaine" },
      { id: "manager", label: "Manager" },
      { id: "effectif", label: "Effectif" },
      { id: "activité", label: "Activité du mois" },
      { id: "statut", label: "Statut" },
    ],
    description: "Consolidez les résultats du groupe et gérez les périmètres de chaque filiale.",
    eyebrow: "Groupe WUGAMS",
    icon: "building",
    insights: [
      { label: "Filiales actives", value: "04" },
      { label: "Croissance groupe", value: "+12,8 %" },
      { label: "Managers rattachés", value: "14" },
    ],
    rows: [
      { filiale: "WUGAMS Construction", domain: "Construction & BTP", manager: "A. Bamba", effectif: "38", activité: "18,2 M FCFA", statut: { label: "Active", tone: "success" } },
      { filiale: "WUGAMS Entretien", domain: "Nettoyage & Entretien", manager: "F. Kouamé", effectif: "16", activité: "8,4 M FCFA", statut: { label: "Active", tone: "success" } },
      { filiale: "WUGAMS Services", domain: "Matériaux & Fournitures", manager: "S. Gnahoua", effectif: "19", activité: "9,1 M FCFA", statut: { label: "Active", tone: "success" } },
      { filiale: "WUGAMS Trading", domain: "Commerce & Distribution", manager: "C. N'Dri", effectif: "08", activité: "6,1 M FCFA", statut: { label: "À consolider", tone: "warning" } },
    ],
    stats: [
      { label: "CA consolidé", value: "41,8 M" },
      { label: "Collaborateurs", value: "81" },
      { label: "Chantiers groupe", value: "18" },
    ],
    tabs: ["Vue groupe", "Construction", "Entretien", "Services", "Trading"],
    title: "Filiales",
  },
  messagerie: {
    actionLabel: "Nouveau message",
    columns: [
      { id: "sujet", label: "Conversation" },
      { id: "liéà", label: "Liée à" },
      { id: "interlocuteurs", label: "Interlocuteurs" },
      { id: "dernièreactivité", label: "Dernière activité" },
      { id: "statut", label: "Statut" },
    ],
    description: "Gardez les échanges liés à chaque chantier, commande ou réclamation au même endroit.",
    eyebrow: "Communication interne",
    icon: "message",
    insights: [
      { label: "Non lus", value: "12" },
      { label: "Conversations actives", value: "27" },
      { label: "Temps de réponse", value: "18 min" },
    ],
    rows: [
      { sujet: "Accès chantier — Résidence Koffi", liéà: "CHANTIER KOFFI-041", interlocuteurs: "Atlas · A. Bamba", dernièreactivité: "Il y a 8 min", statut: { label: "Non lu", tone: "info" } },
      { sujet: "Bon de réception ciment", liéà: "BC-2026-112", interlocuteurs: "Cimaf · C. N'Dri", dernièreactivité: "Il y a 26 min", statut: { label: "En attente", tone: "warning" } },
      { sujet: "Retour sur devis peinture", liéà: "DEV-2026-085", interlocuteurs: "David Koné · S. Gnahoua", dernièreactivité: "Hier", statut: { label: "Répondu", tone: "success" } },
      { sujet: "Réclamation humidité", liéà: "SAV-2026-019", interlocuteurs: "SCI Les Palmiers", dernièreactivité: "Hier", statut: { label: "Prioritaire", tone: "danger" } },
    ],
    stats: [
      { label: "Messages aujourd'hui", value: "73" },
      { label: "Sujets chantier", value: "19" },
      { label: "Réclamations actives", value: "05" },
    ],
    tabs: ["Boîte de réception", "Chantiers", "Fournisseurs", "Réclamations"],
    title: "Messagerie",
  },
  notifications: {
    actionLabel: "Gérer les préférences",
    columns: [
      { id: "notification", label: "Notification" },
      { id: "module", label: "Module" },
      { id: "destinataire", label: "Destinataire" },
      { id: "reçue", label: "Reçue" },
      { id: "statut", label: "Statut" },
    ],
    description: "Centralisez les alertes persistantes et pilotez les canaux de communication.",
    eyebrow: "Centre de notifications",
    icon: "bell",
    insights: [
      { label: "Non lues", value: "08" },
      { label: "Critiques", value: "02" },
      { label: "Canaux actifs", value: "03" },
    ],
    rows: [
      { notification: "Seuil minimum atteint : Ciment 50 kg", module: "Stocks", destinataire: "C. N'Dri", reçue: "Il y a 12 min", statut: { label: "Critique", tone: "danger" } },
      { notification: "Rapport de mission soumis", module: "Missions", destinataire: "A. Bamba", reçue: "Il y a 38 min", statut: { label: "À valider", tone: "warning" } },
      { notification: "Paiement reçu — FAC-2026-068", module: "Facturation", destinataire: "Comptabilité", reçue: "Hier", statut: { label: "Traité", tone: "success" } },
      { notification: "Nouveau message de David Koné", module: "Messagerie", destinataire: "S. Gnahoua", reçue: "Hier", statut: { label: "Lu", tone: "neutral" } },
    ],
    stats: [
      { label: "Notifications cette semaine", value: "147" },
      { label: "Traitées", value: "94 %" },
      { label: "SLA critique", value: "21 min" },
    ],
    tabs: ["Toutes", "À traiter", "Critiques", "Préférences"],
    title: "Notifications",
  },
  rapports: {
    actionLabel: "Créer un rapport",
    columns: [
      { id: "rapport", label: "Rapport" },
      { id: "période", label: "Période" },
      { id: "auteur", label: "Auteur" },
      { id: "dernièreédition", label: "Dernière édition" },
      { id: "statut", label: "Statut" },
    ],
    description: "Préparez les analyses opérationnelles, financières et de performance par filiale.",
    eyebrow: "Business intelligence",
    icon: "chart",
    insights: [
      { label: "Rapports programmés", value: "16" },
      { label: "Exports ce mois", value: "84" },
      { label: "Indicateurs suivis", value: "42" },
    ],
    rows: [
      { rapport: "Synthèse financière groupe", période: "Juillet 2026", auteur: "Comptabilité", dernièreédition: "Aujourd'hui · 08:00", statut: { label: "Prêt", tone: "success" } },
      { rapport: "Performance équipes terrain", période: "S28", auteur: "A. Bamba", dernièreédition: "Hier · 17:40", statut: { label: "À valider", tone: "warning" } },
      { rapport: "Mouvements de stock consolidés", période: "Juillet 2026", auteur: "C. N'Dri", dernièreédition: "Hier · 15:10", statut: { label: "Prêt", tone: "success" } },
      { rapport: "Qualité & réclamations", période: "T3 2026", auteur: "S. Gnahoua", dernièreédition: "22 juil.", statut: { label: "Brouillon", tone: "neutral" } },
    ],
    stats: [
      { label: "Exports PDF", value: "43" },
      { label: "Exports Excel", value: "41" },
      { label: "Rapports partagés", value: "16" },
    ],
    tabs: ["Tous", "Finance", "Opérations", "Stocks", "Qualité"],
    title: "Rapports",
  },
  demandes: {
    actionLabel: "Nouvelle demande",
    columns: [
      { id: "demande", label: "Demande" },
      { id: "service", label: "Service" },
      { id: "created", label: "Créée le" },
      { id: "contact", label: "Interlocuteur" },
      { id: "status", label: "Statut" },
    ],
    description: "Retrouvez vos demandes de devis et de services, ainsi que leur avancement.",
    eyebrow: "Votre projet",
    icon: "clipboard",
    insights: [
      { label: "Demandes ouvertes", value: "02" },
      { label: "Devis à signer", value: "01" },
      { label: "Réponse moyenne", value: "24 h" },
    ],
    rows: [
      { demande: "Rénovation intérieure", service: "Rénovation", created: "10 juillet", contact: "Sarah G.", status: { label: "En cours", tone: "info" } },
      { demande: "Aménagement salle de bain", service: "Devis travaux", created: "27 juillet", contact: "À attribuer", status: { label: "Reçue", tone: "neutral" } },
      { demande: "Réparation plomberie", service: "Dépannage", created: "04 juin", contact: "Marc K.", status: { label: "Terminée", tone: "success" } },
    ],
    stats: [
      { label: "Demandes totales", value: "07" },
      { label: "En traitement", value: "02" },
      { label: "Terminées", value: "05" },
    ],
    tabs: ["Toutes", "En cours", "À confirmer", "Terminées"],
    title: "Mes demandes",
  },
  projets: {
    actionLabel: "Demander un devis",
    columns: [
      { id: "projet", label: "Projet" },
      { id: "adresse", label: "Adresse" },
      { id: "avancement", label: "Avancement" },
      { id: "updated", label: "Mise à jour" },
      { id: "status", label: "Statut" },
    ],
    description: "Suivez les grandes étapes, les rendez-vous et les livrables de vos travaux.",
    eyebrow: "Suivi de travaux",
    icon: "folder",
    insights: [
      { label: "Projet actif", value: "01" },
      { label: "Prochaine visite", value: "29 juil." },
      { label: "Photos publiées", value: "18" },
    ],
    rows: [
      { projet: "Rénovation résidence Traoré", adresse: "Cocody, Abidjan", avancement: "68 %", updated: "Aujourd'hui", status: { label: "En cours", tone: "info" } },
      { projet: "Dépannage plomberie", adresse: "Marcory, Abidjan", avancement: "100 %", updated: "04 juin", status: { label: "Terminé", tone: "success" } },
    ],
    stats: [
      { label: "Projets lancés", value: "03" },
      { label: "En cours", value: "01" },
      { label: "Satisfaction", value: "4,8 / 5" },
    ],
    tabs: ["Tous", "En cours", "Terminés", "Photos"],
    title: "Mes projets",
  },
  documents: {
    actionLabel: "Ajouter une pièce",
    columns: [
      { id: "document", label: "Document" },
      { id: "projet", label: "Projet" },
      { id: "date", label: "Date" },
      { id: "author", label: "Publié par" },
      { id: "status", label: "Statut" },
    ],
    description: "Vos devis, rapports, photos et documents importants, réunis au même endroit.",
    eyebrow: "Dossier client",
    icon: "file-text",
    insights: [
      { label: "Documents", value: "06" },
      { label: "Nouveaux", value: "02" },
      { label: "Pièces requises", value: "00" },
    ],
    rows: [
      { document: "Compte-rendu de visite", projet: "Résidence Traoré", date: "24 juillet", author: "Sarah G.", status: { label: "Nouveau", tone: "info" } },
      { document: "Devis signé DEV-2026-085", projet: "Résidence Traoré", date: "18 juillet", author: "WUGAMS", status: { label: "Disponible", tone: "success" } },
      { document: "Planning prévisionnel", projet: "Résidence Traoré", date: "12 juillet", author: "WUGAMS", status: { label: "Disponible", tone: "success" } },
    ],
    stats: [
      { label: "Rapports", value: "02" },
      { label: "Photos", value: "18" },
      { label: "Devis", value: "01" },
    ],
    tabs: ["Tous", "Rapports", "Devis", "Photos"],
    title: "Documents",
  },
  factures: {
    actionLabel: "Voir les moyens de paiement",
    columns: [
      { id: "reference", label: "Référence" },
      { id: "objet", label: "Objet" },
      { id: "montant", label: "Montant" },
      { id: "echeance", label: "Échéance" },
      { id: "status", label: "Statut" },
    ],
    description: "Consultez vos factures, échéances et paiements en toute transparence.",
    eyebrow: "Facturation",
    icon: "chart",
    insights: [
      { label: "À payer", value: "1,2 M" },
      { label: "Réglées", value: "2,8 M" },
      { label: "Prochaine échéance", value: "05 août" },
    ],
    rows: [
      { reference: "FAC-2026-091", objet: "Acompte travaux - 2e tranche", montant: "1 250 000 FCFA", echeance: "05 août", status: { label: "À payer", tone: "warning" } },
      { reference: "FAC-2026-074", objet: "Acompte travaux - 1re tranche", montant: "1 250 000 FCFA", echeance: "18 juillet", status: { label: "Payée", tone: "success" } },
      { reference: "FAC-2026-038", objet: "Dépannage plomberie", montant: "180 000 FCFA", echeance: "04 juin", status: { label: "Payée", tone: "success" } },
    ],
    stats: [
      { label: "Factures", value: "05" },
      { label: "En attente", value: "01" },
      { label: "Total réglé", value: "2,8 M" },
    ],
    tabs: ["Toutes", "À payer", "Réglées", "Historique"],
    title: "Factures & paiements",
  },
  messages: {
    actionLabel: "Nouveau message",
    columns: [
      { id: "sujet", label: "Conversation" },
      { id: "projet", label: "Projet" },
      { id: "contact", label: "Avec" },
      { id: "activity", label: "Dernière activité" },
      { id: "status", label: "Statut" },
    ],
    description: "Échangez directement avec votre interlocuteur WUGAMS sans perdre le contexte de votre projet.",
    eyebrow: "Messagerie",
    icon: "message",
    insights: [
      { label: "Non lus", value: "01" },
      { label: "Conversations", value: "04" },
      { label: "Temps de réponse", value: "18 min" },
    ],
    rows: [
      { sujet: "Visite de suivi mardi", projet: "Résidence Traoré", contact: "Sarah G.", activity: "Il y a 2 h", status: { label: "Non lu", tone: "info" } },
      { sujet: "Choix du revêtement", projet: "Résidence Traoré", contact: "Sarah G.", activity: "Hier", status: { label: "Répondu", tone: "success" } },
      { sujet: "Dépannage plomberie", projet: "Intervention Marcory", contact: "Marc K.", activity: "04 juin", status: { label: "Clôturé", tone: "neutral" } },
    ],
    stats: [
      { label: "Messages ce mois", value: "21" },
      { label: "Réponses reçues", value: "18" },
      { label: "À relire", value: "01" },
    ],
    tabs: ["Boîte de réception", "Projets", "Archivées"],
    title: "Messages",
  },
};

export function getModuleDefinition(slug: string) {
  return modules[slug];
}
