import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "wugams_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7d

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string; refreshToken?: string; expiresAt?: number };
    const token = body.accessToken;
    if (!token || typeof token !== "string" || token.length < 20) {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    }
    const expiresAt = typeof body.expiresAt === "number" ? body.expiresAt : Date.now() + MAX_AGE * 1000;
    const maxAge = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    // Also set a non-httpOnly marker for client-side UX (optional)
    res.cookies.set("wugams_session_present", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete("wugams_session_present");
  return res;
}
