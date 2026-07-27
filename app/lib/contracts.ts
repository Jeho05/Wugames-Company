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

export type AuthSession = {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
  scope: WorkspaceScope;
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
