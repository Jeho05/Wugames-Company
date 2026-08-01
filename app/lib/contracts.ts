export type RoleCode =
  | "ROLE_CLIENT_STD"
  | "ROLE_CLIENT_MEMBRE"
  | "ROLE_OUVRIER"
  | "ROLE_RESP_OUVRIERS"
  | "ROLE_FOURNISSEUR"
  | "ROLE_SECRETAIRE"
  | "ROLE_COMPTABLE"
  | "ROLE_MGR_OPS"
  | "ROLE_MGR_PARTENAIRE"
  | "ROLE_MGR_FILIALE"
  | "ROLE_DEV_DIGITAL"
  | "ROLE_GERANT";

export type WorkspaceScope = {
  filialeId: string | null;
  role: RoleCode;
  userId: string;
};

export type ApiList<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type ListQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
};

export type ApiEntity = {
  createdAt: string;
  filialeId: string;
  id: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export type AuthUserDto = {
  id: string;
  email: string;
  role: RoleCode;
  filiale_id: string | null;
  two_factor_enabled: boolean;
  profile_id: string | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: string | number;
  user: AuthUserDto;
};

export type Requires2fa = {
  requires_2fa: true;
  user_id: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: RoleCode;
  filiale_id: string | null;
  two_factor_enabled: boolean;
  two_factor_verified: boolean;
  profile_id: string | null;
  iat: number;
  exp: number;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: string | number;
};

export type MessageResponse = {
  message: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: RoleCode;
  filiale_id?: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUserDto;
};

/* ------------------------------------------------------------------ */
/* Entités                                                             */
/* ------------------------------------------------------------------ */

export type FilialeLite = { id: string; nom: string; code: string };

export type Filiale = {
  id: string;
  nom: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FilialeSummary = FilialeLite & {
  _count: { users: number; produits: number; missions: number; factures: number; commandes: number };
};

export type FilialeConsolidation = {
  filiales: FilialeSummary[];
  summary: {
    total_filiales: number;
    total_users: number;
    total_produits: number;
    total_missions: number;
    total_factures: number;
    total_commandes: number;
  };
};

export type UserLite = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active?: boolean;
};

export type OuvrierProfileLite = { id: string; specialite: string | null; matricule: string | null };
export type FournisseurProfileLite = { id: string; raison_sociale: string | null };
export type ClientProfileLite = { id: string; type_client: string | null };

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: RoleCode;
  filiale_id: string | null;
  is_active: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at?: string;
  filiale?: FilialeLite | null;
  ouvrier_profile: OuvrierProfileLite | null;
  fournisseur_profile: FournisseurProfileLite | null;
  client_profile: ClientProfileLite | null;
};

export type ClientType = "MEMBRE" | "STANDARD";

export type ClientProfile = {
  id: string;
  user_id: string;
  adresse: string | null;
  type_client: string | null;
  created_at: string;
  updated_at: string;
  user?: UserLite;
};

export type CreateClientPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  adresse?: string;
  type_client?: ClientType;
};

export type FournisseurProfile = {
  id: string;
  user_id: string;
  raison_sociale: string | null;
  siret: string | null;
  adresse: string | null;
  created_at: string;
  updated_at: string;
  user?: UserLite;
};

export type CreateFournisseurPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  raison_sociale: string;
  siret?: string;
  adresse?: string;
};

export type ProduitStatut =
  | "DISPONIBLE"
  | "REAPPROVISIONNEMENT_REQUIS"
  | "COMMANDE_EN_COURS"
  | "RUPTURE"
  | "ARCHIVE";

export type MouvementType = "ENTREE" | "SORTIE_VENTE" | "SORTIE_CHANTIER" | "AJUSTEMENT";

export type Produit = {
  id: string;
  nom: string;
  description: string | null;
  reference: string;
  prix_unitaire: string | number;
  quantite_actuelle: number;
  stock_minimum: number;
  statut: ProduitStatut;
  adresse_reference_lat: number | null;
  adresse_reference_lng: number | null;
  filiale_id: string;
  fournisseur_id: string | null;
  created_at: string;
  updated_at: string;
  filiale?: FilialeLite;
  fournisseur?: FournisseurLite | null;
  mouvements?: MouvementStock[];
};

export type FournisseurLite = { id: string; raison_sociale: string | null };

export type MouvementStock = {
  id: string;
  produit_id: string;
  type: MouvementType;
  quantite: number;
  motif: string;
  reference_externe?: string | null;
  created_at: string;
};

export type CreateProduitPayload = {
  nom: string;
  reference: string;
  description?: string;
  prix_unitaire: number;
  quantite_actuelle?: number;
  stock_minimum?: number;
  filiale_id: string;
  fournisseur_id?: string | null;
};

export type CreateMouvementPayload = {
  produit_id: string;
  type: MouvementType;
  quantite: number;
  motif: string;
  reference_externe?: string;
};

export type MissionStatut =
  | "PLANIFIE"
  | "NOTIFIE"
  | "ACCEPTE"
  | "EN_COURS"
  | "RAPPORT_SOUMIS"
  | "VALIDE"
  | "TERMINE"
  | "POINTAGE_A_VERIFIER";

export type PointageType = "ARRIVEE" | "SORTIE";

export type Pointage = {
  id: string;
  mission_id: string;
  ouvrier_id: string;
  type: PointageType;
  latitude: string | number;
  longitude: string | number;
  horodatage: string;
  distance_calculee_m: number | null;
  hors_rayon: boolean;
};

export type MissionPhoto = {
  id: string;
  mission_id: string;
  storage_url: string;
  uploaded_at: string;
};

export type Mission = {
  id: string;
  titre: string;
  description: string | null;
  statut: MissionStatut;
  filiale_id: string;
  client_id: string | null;
  ouvrier_id: string | null;
  rapport_texte: string | null;
  date_planifiee: string | null;
  adresse_lat: number | null;
  adresse_lng: number | null;
  rayon_tolerance_metres: number;
  validateur_id: string | null;
  created_at: string;
  updated_at: string;
  filiale?: FilialeLite;
  ouvrier?: { id: string; user: { first_name: string; last_name: string } } | null;
  client?: ClientProfileLite | null;
  pointages?: Pointage[];
  photos?: MissionPhoto[];
};

export type CreateMissionPayload = {
  titre: string;
  description?: string;
  filiale_id: string;
  client_id?: string | null;
  ouvrier_id?: string | null;
  date_planifiee?: string;
  adresse_lat?: number;
  adresse_lng?: number;
  rayon_tolerance_metres?: number;
};

export type FactureStatut = "BROUILLON" | "EMISE" | "PAYEE" | "EN_RETARD" | "ANNULEE";

export type Facture = {
  id: string;
  numero: string;
  filiale_id: string;
  client_id: string | null;
  mission_id: string | null;
  montant_ht: string | number;
  montant_ttc: string | number;
  statut: FactureStatut;
  date_emission: string | null;
  date_echeance: string | null;
  exercice_comptable: number;
  numero_sequence: number;
  created_at: string;
  updated_at: string;
  filiale?: FilialeLite;
  client?: UserLite | null;
};

export type CreateFacturePayload = {
  filiale_id: string;
  client_id?: string | null;
  mission_id?: string | null;
  montant_ht: number;
  montant_ttc: number;
  date_echeance?: string;
};

export type FactureConsolidation = {
  filiales: { nom: string; code: string; total_ht: number; total_ttc: number; count: number }[];
  totals: { total_ht: number; total_ttc: number; total_factures: number };
};

export type Evaluation = {
  id: string;
  personne_id: string;
  personne_nom: string;
  cycle_label: string;
  s1: string | number;
  s2: string | number;
  s3: string | number;
  s4: string | number;
  s5: string | number;
  s6: string | number;
  s7: string | number;
  s8: string | number;
  s9: string | number;
  note_texte: string | number | null;
  total: string | number;
  rendement_9s: string | number;
  rendement_texte?: string | number;
  rendement_global?: string | number;
  rang: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateEvaluationPayload = {
  personne_id: string;
  personne_nom: string;
  cycle_label: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
  s7: number;
  s8: number;
  s9: number;
  note_texte?: number;
};

export type EvaluationRanking = {
  cycles: { label: string; count: number }[];
  evaluations: { id: string; personne_nom: string; total: number; rendement_9s: number; rang: number }[];
  total: number;
};

export type Notification = {
  id: string;
  lu?: boolean | null;
  type?: string | null;
  message?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: AuditAction;
  table_cible: string;
  entite_id: string;
  valeur_avant: unknown | null;
  valeur_apres: unknown | null;
  ip: string | null;
  created_at: string;
  user: { id: string; first_name: string; last_name: string; email: string } | null;
};
