import * as clientsApi from "@/app/lib/api/clients";
import * as commandesApi from "@/app/lib/api/commandes";
import * as chantiersApi from "@/app/lib/api/chantiers";
import * as devisApi from "@/app/lib/api/devis";
import * as facturesApi from "@/app/lib/api/factures";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as filialesApi from "@/app/lib/api/filiales";
import * as missionsApi from "@/app/lib/api/missions";
import * as stocksApi from "@/app/lib/api/stocks";
import * as usersApi from "@/app/lib/api/users";
import * as clientSpaceApi from "@/app/lib/api/client-space";
import * as messagerieApi from "@/app/lib/api/messagerie";
import {
  chantierRow,
  clientRow,
  commandeRow,
  devisRow,
  factureRow,
  fournisseurRow,
  missionRow,
  produitRow,
} from "@/app/lib/module-data";
import type { ModuleRow } from "@/app/lib/demo-data";

const CLIENT_CREATE_ROLES = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

export type CreateFieldOption = { value: string; label: string };

export type CreateField = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: number;
  help?: string;
  options?: CreateFieldOption[];
  /** Options chargées depuis l'API à l'ouverture du formulaire. */
  optionsLoader?: () => Promise<CreateFieldOption[]>;
};

export type ModuleCreateConfig = {
  title: string;
  eyebrow: string;
  fields: CreateField[];
  submit: (values: Record<string, string>) => Promise<unknown>;
  /** Convertit l'entité créée en ligne de module pour mise à jour instantanée de la liste. */
  rowMapper?: (entity: unknown) => ModuleRow | null;
};

function num(values: Record<string, string>, key: string): number | undefined {
  const raw = values[key]?.trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const filialeOptions: () => Promise<CreateFieldOption[]> = async () => {
  const filiales = await filialesApi.listFiliales();
  return filiales.map((f) => ({ value: f.id, label: `${f.nom} (${f.code})` }));
};

const fournisseurOptions: () => Promise<CreateFieldOption[]> = async () => {
  const fournisseurs = await fournisseursApi.listFournisseurs();
  return fournisseurs.map((f) => ({
    value: f.id,
    label: f.raison_sociale ?? f.user?.email ?? f.id.slice(0, 8),
  }));
};

const ouvrierOptions: () => Promise<CreateFieldOption[]> = async () => {
  const users = await usersApi.listUsers();
  return users
    .filter((u) => u.role === "ROLE_OUVRIER")
    .map((u) => ({
      value: u.ouvrier_profile?.id ?? u.id,
      label: `${[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}${u.ouvrier_profile?.specialite ? ` · ${u.ouvrier_profile.specialite}` : ""}`,
    }));
};

const clientOptions: () => Promise<CreateFieldOption[]> = async () => {
  const clients = await clientsApi.listClients();
  return clients.map((c) => ({
    value: c.id,
    label: `${[c.user?.first_name, c.user?.last_name].filter(Boolean).join(" ") || c.user?.email || c.id.slice(0, 8)}${c.type_client === "MEMBRE" ? " · membre" : ""}`,
  }));
};

const produitOptions: () => Promise<CreateFieldOption[]> = async () => {
  const produits = await stocksApi.listProduits();
  return produits.map((p) => ({
    value: p.id,
    label: `${p.nom} · ${p.reference}`,
  }));
};

export const moduleCreateConfigs: Record<string, ModuleCreateConfig> = {
  clients: {
    title: "Nouveau client",
    eyebrow: "Relation client",
    fields: [
      { name: "first_name", label: "Prénom", type: "text", required: true, placeholder: "Jean" },
      { name: "last_name", label: "Nom", type: "text", required: true, placeholder: "Client" },
      { name: "email", label: "Adresse e-mail", type: "email", required: true, placeholder: "client@exemple.ci" },
      { name: "password", label: "Mot de passe", type: "password", required: true, placeholder: "8 caractères minimum" },
      { name: "phone", label: "Téléphone", type: "text", placeholder: "+225 07 00 00 00 00" },
      { name: "adresse", label: "Adresse", type: "text", placeholder: "Cocody, Abidjan" },
      {
        name: "type_client",
        label: "Profil client",
        type: "select",
        options: [
          { value: "MEMBRE", label: "Client membre" },
          { value: "STANDARD", label: "Client standard" },
        ],
      },
    ],
    submit: async (values) =>
      clientsApi.createClient({
        email: values.email.trim(),
        password: values.password,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone?.trim() || undefined,
        adresse: values.adresse?.trim() || undefined,
        type_client: (values.type_client || "STANDARD") as "MEMBRE" | "STANDARD",
      }),
    rowMapper: (entity) => clientRow(entity as Parameters<typeof clientRow>[0]),
  },
  fournisseurs: {
    title: "Nouveau fournisseur",
    eyebrow: "Partenariats",
    fields: [
      { name: "first_name", label: "Prénom", type: "text", required: true, placeholder: "Fournisseur" },
      { name: "last_name", label: "Nom", type: "text", required: true, placeholder: "SARL" },
      { name: "email", label: "Adresse e-mail", type: "email", required: true, placeholder: "fournisseur@exemple.ci" },
      { name: "password", label: "Mot de passe", type: "password", required: true, placeholder: "8 caractères minimum" },
      { name: "raison_sociale", label: "Raison sociale", type: "text", required: true, placeholder: "Matériaux Pro SARL" },
      { name: "siret", label: "SIRET", type: "text", placeholder: "14 chiffres" },
      { name: "phone", label: "Téléphone", type: "text", placeholder: "+225 07 00 00 00 00" },
      { name: "adresse", label: "Adresse", type: "text", placeholder: "Zone industrielle, Abidjan" },
    ],
    submit: async (values) =>
      fournisseursApi.createFournisseur({
        email: values.email.trim(),
        password: values.password,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        raison_sociale: values.raison_sociale.trim(),
        siret: values.siret?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        adresse: values.adresse?.trim() || undefined,
      }),
    rowMapper: (entity) => fournisseurRow(entity as Parameters<typeof fournisseurRow>[0]),
  },
  stocks: {
    title: "Ajouter un produit",
    eyebrow: "Approvisionnement",
    fields: [
      { name: "nom", label: "Nom du produit", type: "text", required: true, placeholder: "Ciment 35 kg" },
      { name: "reference", label: "Référence", type: "text", required: true, placeholder: "CIM-001" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optionnel" },
      { name: "prix_unitaire", label: "Prix unitaire", type: "number", required: true, min: 0, step: 0.01, placeholder: "6250" },
      { name: "quantite_actuelle", label: "Quantité actuelle", type: "number", min: 0, step: 1, placeholder: "100" },
      { name: "stock_minimum", label: "Seuil minimum", type: "number", min: 0, step: 1, placeholder: "10" },
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "fournisseur_id", label: "Fournisseur", type: "select", optionsLoader: fournisseurOptions, help: "Optionnel" },
    ],
    submit: async (values) =>
      stocksApi.createProduit({
        nom: values.nom.trim(),
        reference: values.reference.trim(),
        description: values.description?.trim() || undefined,
        prix_unitaire: num(values, "prix_unitaire") ?? 0,
        quantite_actuelle: num(values, "quantite_actuelle"),
        stock_minimum: num(values, "stock_minimum"),
        filiale_id: values.filiale_id,
        fournisseur_id: values.fournisseur_id || null,
      }),
    rowMapper: (entity) => produitRow(entity as Parameters<typeof produitRow>[0]),
  },
  missions: {
    title: "Affecter une mission",
    eyebrow: "Planning des équipes",
    fields: [
      { name: "titre", label: "Titre de la mission", type: "text", required: true, placeholder: "Nettoyage Chantier A" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Détails de l'intervention" },
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "ouvrier_id", label: "Ouvrier affecté", type: "select", optionsLoader: ouvrierOptions, help: "Optionnel au départ" },
      { name: "date_planifiee", label: "Date planifiée", type: "date" },
    ],
    submit: async (values) =>
      missionsApi.createMission({
        titre: values.titre.trim(),
        description: values.description?.trim() || undefined,
        filiale_id: values.filiale_id,
        ouvrier_id: values.ouvrier_id || null,
        date_planifiee: values.date_planifiee ? new Date(values.date_planifiee).toISOString() : undefined,
      }),
    rowMapper: (entity) => missionRow(entity as Parameters<typeof missionRow>[0]),
  },
  factures: {
    title: "Créer une facture",
    eyebrow: "Facturation",
    fields: [
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "montant_ht", label: "Montant HT", type: "number", required: true, min: 0, step: 0.01, placeholder: "100000" },
      { name: "montant_ttc", label: "Montant TTC", type: "number", required: true, min: 0, step: 0.01, placeholder: "120000" },
      { name: "date_echeance", label: "Date d'échéance", type: "date" },
    ],
    submit: async (values) =>
      facturesApi.createFacture({
        filiale_id: values.filiale_id,
        montant_ht: num(values, "montant_ht") ?? 0,
        montant_ttc: num(values, "montant_ttc") ?? 0,
        date_echeance: values.date_echeance || undefined,
      }),
    rowMapper: (entity) => factureRow(entity as Parameters<typeof factureRow>[0]),
  },
  devis: {
    title: "Nouveau devis",
    eyebrow: "Relation client",
    fields: [
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "client_id", label: "Client", type: "select", optionsLoader: clientOptions, help: "Optionnel" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Objet du devis" },
      { name: "designation", label: "Désignation", type: "text", required: true, placeholder: "Prestation ou matériau" },
      { name: "quantite", label: "Quantité", type: "number", required: true, min: 1, step: 1, placeholder: "1" },
      { name: "prix_unitaire_ht", label: "Prix unitaire HT", type: "number", required: true, min: 0, step: 0.01, placeholder: "50000" },
      { name: "date_validite", label: "Date de validité", type: "date" },
    ],
    submit: async (values) =>
      devisApi.createDevis({
        filiale_id: values.filiale_id,
        client_id: values.client_id || null,
        description: values.description?.trim() || undefined,
        date_validite: values.date_validite || undefined,
        lignes: [
          {
            designation: values.designation.trim(),
            quantite: num(values, "quantite") ?? 1,
            prix_unitaire_ht: num(values, "prix_unitaire_ht") ?? 0,
          },
        ],
      }),
    rowMapper: (entity) => devisRow(entity as Parameters<typeof devisRow>[0]),
  },
  chantiers: {
    title: "Nouveau chantier",
    eyebrow: "Réalisation",
    fields: [
      { name: "titre", label: "Titre du chantier", type: "text", required: true, placeholder: "Villa B, Cocody" },
      { name: "adresse", label: "Adresse", type: "text", placeholder: "Cocody, Abidjan" },
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "client_id", label: "Client", type: "select", optionsLoader: clientOptions, help: "Optionnel" },
      { name: "budget_previsionnel", label: "Budget prévisionnel", type: "number", min: 0, step: 0.01, placeholder: "5000000" },
      { name: "date_debut", label: "Date de début", type: "date" },
      { name: "date_fin_prevue", label: "Date de fin prévue", type: "date" },
    ],
    submit: async (values) =>
      chantiersApi.createChantier({
        titre: values.titre.trim(),
        adresse: values.adresse?.trim() || undefined,
        filiale_id: values.filiale_id,
        client_id: values.client_id || null,
        budget_previsionnel: num(values, "budget_previsionnel"),
        date_debut: values.date_debut || undefined,
        date_fin_prevue: values.date_fin_prevue || undefined,
      }),
    rowMapper: (entity) => chantierRow(entity as Parameters<typeof chantierRow>[0]),
  },
  commandes: {
    title: "Nouvelle commande",
    eyebrow: "Espace Wu · Boutique",
    fields: [
      { name: "filiale_id", label: "Filiale", type: "select", required: true, optionsLoader: filialeOptions },
      { name: "client_id", label: "Client", type: "select", optionsLoader: clientOptions, help: "Optionnel" },
      { name: "produit_id", label: "Produit", type: "select", required: true, optionsLoader: produitOptions },
      { name: "quantite", label: "Quantité", type: "number", required: true, min: 1, step: 1, placeholder: "1" },
      { name: "adresse_livraison", label: "Adresse de livraison", type: "text", placeholder: "Livraison à domicile" },
      { name: "date_prevue_livraison", label: "Date prévue de livraison", type: "date" },
    ],
    submit: async (values) =>
      commandesApi.createCommande({
        filiale_id: values.filiale_id,
        client_id: values.client_id || undefined,
        adresse_livraison: values.adresse_livraison?.trim() || undefined,
        date_prevue_livraison: values.date_prevue_livraison || undefined,
        lignes: [{ produit_id: values.produit_id, quantite: num(values, "quantite") ?? 1 }],
      }),
    rowMapper: (entity) => commandeRow(entity as Parameters<typeof commandeRow>[0]),
  },
  demandes: {
    title: "Nouvelle demande",
    eyebrow: "Espace client",
    fields: [
      { name: "libelle", label: "Objet de la demande", type: "text", required: true, placeholder: "Rénovation intérieure" },
      { name: "service", label: "Service souhaité", type: "select", required: true, options: [
        { value: "Rénovation", label: "Rénovation" },
        { value: "Dépannage", label: "Dépannage" },
        { value: "Devis travaux", label: "Devis travaux" },
        { value: "Entretien", label: "Entretien" },
        { value: "Autre", label: "Autre" },
      ]},
      { name: "type", label: "Type", type: "select", options: [
        { value: "TRAVAUX", label: "Travaux" },
        { value: "DEVIS", label: "Devis" },
        { value: "INTERVENTION", label: "Intervention" },
      ]},
    ],
    submit: async (values) =>
      clientSpaceApi.createDemande({
        libelle: values.libelle.trim(),
        service: values.service,
        type: values.type || undefined,
      }),
  },
  projets: {
    title: "Demander un devis",
    eyebrow: "Espace client",
    fields: [
      { name: "libelle", label: "Objet du devis", type: "text", required: true, placeholder: "Rénovation résidence" },
      { name: "service", label: "Service souhaité", type: "select", required: true, options: [
        { value: "Rénovation", label: "Rénovation" },
        { value: "Dépannage", label: "Dépannage" },
        { value: "Devis travaux", label: "Devis travaux" },
        { value: "Entretien", label: "Entretien" },
        { value: "Autre", label: "Autre" },
      ]},
    ],
    submit: async (values) =>
      clientSpaceApi.createDemande({
        libelle: values.libelle.trim(),
        service: values.service,
        type: "DEVIS",
      }),
  },
  messages: {
    title: "Nouvelle conversation",
    eyebrow: "Messagerie",
    fields: [
      { name: "sujet", label: "Sujet", type: "text", required: true, placeholder: "Suivi de chantier" },
      { name: "projet", label: "Projet associé", type: "text", placeholder: "Optionnel" },
      { name: "premier_message", label: "Votre message", type: "textarea", required: true, placeholder: "Décrivez votre demande..." },
    ],
    submit: async (values) =>
      messagerieApi.createConversation({
        sujet: values.sujet.trim(),
        projet: values.projet?.trim() || undefined,
        premier_message: values.premier_message?.trim() || undefined,
      }),
  },
};

export function getModuleCreateConfig(slug: string, role?: string): ModuleCreateConfig | null {
  if (role && CLIENT_CREATE_ROLES.has(role)) {
    if (slug === "factures" || slug === "commandes" || slug === "documents") return null;
  }
  return moduleCreateConfigs[slug] ?? null;
}
