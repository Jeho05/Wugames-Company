import * as clientsApi from "@/app/lib/api/clients";
import * as facturesApi from "@/app/lib/api/factures";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as filialesApi from "@/app/lib/api/filiales";
import * as missionsApi from "@/app/lib/api/missions";
import * as stocksApi from "@/app/lib/api/stocks";
import {
  clientRow,
  factureRow,
  fournisseurRow,
  missionRow,
  produitRow,
} from "@/app/lib/module-data";
import type { ModuleRow } from "@/app/lib/demo-data";

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
      { name: "date_planifiee", label: "Date planifiée", type: "date" },
    ],
    submit: async (values) =>
      missionsApi.createMission({
        titre: values.titre.trim(),
        description: values.description?.trim() || undefined,
        filiale_id: values.filiale_id,
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
};

export function getModuleCreateConfig(slug: string): ModuleCreateConfig | null {
  return moduleCreateConfigs[slug] ?? null;
}
