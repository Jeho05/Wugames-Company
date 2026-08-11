import { apiFetch, apiFetchPublic } from "@/app/lib/api-client";
import type {
  AuthTokens,
  AuthUserDto,
  JwtPayload,
  MessageResponse,
  RefreshResponse,
  RegisterPayload,
  Requires2fa,
} from "@/app/lib/contracts";

export type LoginResult = AuthTokens | Requires2fa;

export type AuthTokensLike = AuthTokens;

export async function login(email: string, password: string): Promise<LoginResult> {
  return apiFetchPublic<LoginResult>("/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
  });
}

export async function verify2fa(userId: string, token: string): Promise<AuthTokens> {
  return apiFetchPublic<AuthTokens>("/auth/2fa/verify", {
    method: "POST",
    body: { user_id: userId, token: token.trim() },
  });
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  return apiFetchPublic<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function me(): Promise<JwtPayload> {
  return apiFetch<JwtPayload>("/auth/me", { method: "POST" });
}

export async function logout(): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/logout", { method: "POST", retry: false });
}

export async function register(payload: RegisterPayload): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>("/auth/register", { method: "POST", body: payload });
}

export type TwoFaSetup = {
  secret: string;
  qr_code: string;
};

export async function setup2fa(): Promise<TwoFaSetup> {
  return apiFetch<TwoFaSetup>("/auth/2fa/setup", { method: "POST" });
}

export async function enable2fa(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/2fa/enable", { method: "POST", body: { token: token.trim() } });
}

export async function disable2fa(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/2fa/disable", { method: "POST", body: { token: token.trim() } });
}

export async function requestPasswordReset(email: string): Promise<MessageResponse> {
  return apiFetchPublic<MessageResponse>("/auth/password-reset", {
    method: "POST",
    body: { email: email.trim() },
  });
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
  return apiFetchPublic<MessageResponse>("/auth/password-reset", {
    method: "POST",
    body: { token: token.trim(), new_password: newPassword },
  });
}
