import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/connexion", "/connexion-travailleur", "/inscription", "/blog", "/realisations", "/boutique", "/vitrine", "/horizon", "/cinematic-hero"]);
const PUBLIC_PREFIXES = ["/_next", "/api/session", "/favicon.ico"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith("/blog/")) return true;
  // allow static assets
  if (pathname.match(/\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|woff2?)$/)) return true;
  // API is handled separately (rate-limit), not as public for auth gate
  return false;
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  try {
    return atob(base64);
  } catch {
    return "";
  }
}

function decodeJwtPayload(token: string): { exp?: number; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

// Rate limit: 5 req / 60s per IP for auth endpoints
const authRateLimit = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;
  const hits = authRateLimit.get(ip) ?? [];
  const recent = hits.filter((t) => now - t < windowMs);
  recent.push(now);
  authRateLimit.set(ip, recent);
  // Cleanup old entries occasionally
  if (authRateLimit.size > 1000) {
    for (const [k, v] of authRateLimit.entries()) {
      if (v.every((t) => now - t >= windowMs)) authRateLimit.delete(k);
    }
  }
  return recent.length > max;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security headers (defense in depth, also in next.config)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Rate limit auth endpoints
  if (pathname.startsWith("/api/v1/auth/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": "60" } });
    }
    return response;
  }

  // Skip public paths
  if (isPublicPath(pathname)) return response;

  // Only guard /espace/* (workspace)
  if (!pathname.startsWith("/espace")) return response;

  // Try to read session from httpOnly cookie (preferred) or Authorization header
  const cookieToken = request.cookies.get("wugams_session")?.value ?? null;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp || payload.exp * 1000 < Date.now()) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete("wugams_session");
    return res;
  }

  // Role-based gate for ultra-sensitive routes
  const role = payload.role as string | undefined;
  if (pathname.startsWith("/espace/administration") || pathname.startsWith("/espace/vitrine")) {
    const allowed = role === "ROLE_GERANT" || role === "ROLE_DEV_DIGITAL";
    // For vitrine, delegated users are checked client-side via API; middleware allows through if any valid session
    // but we still block obvious non-admin for /administration
    if (pathname.startsWith("/espace/administration") && !allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/espace";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/espace/:path*", "/api/:path*"],
};
