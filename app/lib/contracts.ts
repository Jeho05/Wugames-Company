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
  devis_id: string | null;
  montant_ht: string | number;
  montant_ttc: string | number;
  statut: FactureStatut;
  date_emission: string | null;
  date_echeance: string | null;
  date_paiement: string | null;
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
  devis_id?: string | null;
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

/* ------------------------------------------------------------------ */
/* Alertes stock                                                       */
/* ------------------------------------------------------------------ */

export type StockAlerteNiveau = "RUPTURE" | "SOUS_SEUIL" | "SOUS_20PCT";

export type StockAlerte = {
  produit_id: string;
  reference: string;
  nom: string;
  filiale: FilialeLite;
  quantite_actuelle: number;
  stock_minimum: number;
  seuil_alerte_20pct: number;
  niveau: StockAlerteNiveau;
  statut: "RUPTURE" | "REAPPROVISIONNEMENT_REQUIS" | "COMMANDE_EN_COURS";
  fournisseur_id: string | null;
};

/* ------------------------------------------------------------------ */
/* Devis                                                               */
/* ------------------------------------------------------------------ */

export type DevisStatut = "BROUILLON" | "ENVOYE" | "SIGNE" | "REFUSE" | "EXPIRE";

export type DevisLigne = {
  id: string;
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
  montant_ht: number;
};

export type Devis = {
  id: string;
  numero: string;
  filiale_id: string;
  client_id: string | null;
  lignes: DevisLigne[];
  montant_ht: number;
  montant_ttc: number;
  statut: DevisStatut;
  date_validite: string | null;
  devis_sequence: number;
  exercice_comptable: number;
  created_at: string;
  updated_at: string;
  filiale?: FilialeLite;
  client?: UserLite | null;
  facture?: { id: string; numero: string } | null;
};

export type CreateDevisLignePayload = {
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
};

export type CreateDevisPayload = {
  filiale_id: string;
  client_id?: string | null;
  description?: string;
  date_validite?: string;
  lignes: CreateDevisLignePayload[];
};

export type UpdateDevisPayload = Partial<{
  client_id: string;
  description: string;
  date_validite: string;
  lignes: CreateDevisLignePayload[];
}>;

export type DevisConversion = { devis: Devis; facture: Facture };

/* ------------------------------------------------------------------ */
/* Chantiers                                                           */
/* ------------------------------------------------------------------ */

export type ChantierStatut = "PLANIFIE" | "EN_COURS" | "SUSPENDU" | "TERMINE" | "ANNULE";

export type ChantierPhoto = { id: string; storage_url: string; uploaded_at: string };

export type Chantier = {
  id: string;
  titre: string;
  adresse: string | null;
  adresse_lat: number | null;
  adresse_lng: number | null;
  filiale_id: string;
  client_id: string | null;
  budget_previsionnel: number;
  depenses_engagees: number;
  recettes: number;
  avancement_pct: number;
  statut: ChantierStatut;
  date_debut: string | null;
  date_fin_prevue: string | null;
  photos?: ChantierPhoto[];
  created_at: string;
  updated_at: string;
  filiale?: FilialeLite;
  client?: UserLite | null;
  _missions?: number;
  _pointages?: number;
};

export type CreateChantierPayload = {
  titre: string;
  adresse?: string;
  adresse_lat?: number;
  adresse_lng?: number;
  filiale_id: string;
  client_id?: string | null;
  budget_previsionnel?: number;
  date_debut?: string;
  date_fin_prevue?: string;
};

export type UpdateChantierPayload = Partial<{
  titre: string;
  adresse: string;
  adresse_lat: number;
  adresse_lng: number;
  budget_previsionnel: number;
  depenses_engagees: number;
  recettes: number;
  avancement_pct: number;
  statut: ChantierStatut;
  date_debut: string;
  date_fin_prevue: string;
}>;

/* ------------------------------------------------------------------ */
/* Commandes boutique                                                  */
/* ------------------------------------------------------------------ */

export type CommandeStatut = "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";

export type CommandeStatutTransition =
  | CommandeStatut
  | "EN_ATTENTE"
  | "CONFIRMEE";

export type ModePaiement = "MTN_MOMO" | "MOOV_MONEY" | "CARTE" | "A_LA_LIVRAISON";

export type ArticleCommande = {
  produit_id: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
};

export type PaiementCommande = {
  mode: ModePaiement;
  statut: "EN_ATTENTE" | "PAYE" | "ECHOUE";
  reference: string | null;
};

export type LivraisonCommande = {
  adresse: string;
  date_prevue: string | null;
  date_livree: string | null;
};

export type Commande = {
  id: string;
  numero: string;
  client_id: string;
  filiale_id: string;
  articles: ArticleCommande[];
  montant_total: number;
  statut: CommandeStatut;
  paiement: PaiementCommande;
  livraison: LivraisonCommande;
  created_at: string;
  updated_at: string;
  client?: UserLite | null;
};

export type CreateLigneCommandePayload = {
  produit_id: string;
  quantite: number;
  prix_unitaire?: number;
};

export type CreateCommandePayload = {
  filiale_id: string;
  client_id?: string;
  adresse_livraison?: string;
  date_prevue_livraison?: string;
  lignes: CreateLigneCommandePayload[];
};

export type PayerCommandePayload = {
  mode: "MTN_MOMO" | "MOOV_MONEY";
  telephone: string;
};

export type PaiementMobile = { reference: string; statut: "EN_ATTENTE" };

/* ------------------------------------------------------------------ */
/* Primes                                                              */
/* ------------------------------------------------------------------ */

export type PrimeStatut = "CALCULEE" | "VALIDEE" | "PAYEE";

export type Prime = {
  id: string;
  mois: string;
  ouvrier_id: string;
  ouvrier: { id: string; nom: string; matricule: string | null };
  filiale_id: string;
  rendement_global: number;
  pointages_valides: number;
  missions_terminees: number;
  montant_base: number;
  bonus_rendement: number;
  malus_pointages: number;
  montant_total: number;
  statut: PrimeStatut;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdatePrimePayload = Partial<{
  statut: PrimeStatut;
  note: string;
  montant_total: number;
}>;

/* ------------------------------------------------------------------ */
/* Fidélité membres                                                    */
/* ------------------------------------------------------------------ */

export type FideliteTier = "BRONZE" | "ARGENT" | "OR";

export type Fidelite = {
  id: string;
  client_id: string;
  points_actuels: number;
  points_cumules: number;
  tier: FideliteTier;
  reduction_boutique_pct: number;
  updated_at: string;
};

export type FideliteMouvement = {
  id: string;
  fidelite_id: string;
  type: "GAIN" | "UTILISATION" | "EXPIRATION";
  points: number;
  libelle: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Messagerie                                                          */
/* ------------------------------------------------------------------ */

export type Conversation = {
  id: string;
  sujet: string;
  projet: string | null;
  participants: { id: string; first_name: string; last_name: string; role: RoleCode }[];
  derniere_activite: string;
  dernier_message: string;
  non_lus: number;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  auteur_id: string;
  contenu: string;
  lu: boolean;
  created_at: string;
};

export type CreateConversationPayload = {
  sujet: string;
  projet?: string;
  filiale_id?: string;
  participants_ids?: string[];
  premier_message?: string;
};

export type SendMessagePayload = {
  contenu: string;
  pieces_jointes?: string[];
};

/* ------------------------------------------------------------------ */
/* Managers                                                            */
/* ------------------------------------------------------------------ */

export type ManagerActivite = {
  missions?: number;
  controles?: number;
  commandes?: number;
};

export type Manager = {
  user: User;
  perimetre?: string | null;
  activite_du_mois?: ManagerActivite;
};

/* ------------------------------------------------------------------ */
/* Historique des pointages                                            */
/* ------------------------------------------------------------------ */

export type PointageHistorique = {
  id: string;
  mission_id: string;
  mission?: { titre: string } | null;
  ouvrier?:
    | { id: string; user?: { first_name?: string; last_name?: string }; matricule?: string | null }
    | null;
  type: PointageType;
  horodatage: string;
  lat: number;
  lng: number;
  verifie: boolean;
};

/* ------------------------------------------------------------------ */
/* Espace client — modules restants                                    */
/* ------------------------------------------------------------------ */

export type DemandeDevisStatut = "RECUE" | "EN_COURS" | "A_CONFIRMER" | "TERMINEE";

export type DemandeDevis = {
  id: string;
  libelle: string;
  service: string;
  statut: DemandeDevisStatut;
  created_at: string;
};

export type ClientProjet = {
  id: string;
  titre: string;
  adresse: string | null;
  avancement_pct: number;
  statut: ChantierStatut;
  prochaine_visite: string | null;
  photos_count: number;
};

export type ClientDocumentType = "RAPPORT" | "DEVIS" | "PHOTO" | "PLANNING";

export type ClientDocument = {
  id: string;
  titre: string;
  type: ClientDocumentType;
  projet: string | null;
  date: string;
  auteur: string | null;
};

/* ------------------------------------------------------------------ */
/* Préférences de notifications externes                               */
/* ------------------------------------------------------------------ */

export type NotificationPrefs = {
  user_id: string;
  canaux: { push: boolean; sms: boolean; whatsapp: boolean };
  types: Record<string, string[]>;
  telephone: string | null;
};

export type UpdateNotificationPrefsPayload = Partial<{
  canaux: { push?: boolean; sms?: boolean; whatsapp?: boolean };
  types: Record<string, string[]>;
  telephone: string;
}>;

/* ------------------------------------------------------------------ */
/* Missions — rapport & auto-affectation                               */
/* ------------------------------------------------------------------ */

export type MissionRapport = {
  mission: Mission;
  rapport_texte: string | null;
  photos: MissionPhoto[];
  pointages: Pointage[];
  ouvrier: { id: string; nom: string; matricule: string | null } | null;
  validateur: { id: string; nom: string } | null;
  duree_totale_minutes: number | null;
  distance_totale_m: number | null;
};

export type MissionSuggestion = {
  ouvrier_id: string;
  nom: string;
  specialite: string;
  rendement_global: number;
  missions_terminees_30j: number;
  deja_affecte_aujourdhui: boolean;
};

export type AffecterMissionResult = {
  mission: Mission;
  suggestions: MissionSuggestion[];
};

export type VerificationPointageStatut = "VALIDE" | "REJETE";

export type VerifierPointagePayload = {
  statut: VerificationPointageStatut;
  motif?: string;
};
