import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionRole = "ADMIN" | "KASIR";

export type SessionUser = {
  userId: number;
  username: string;
  fullName: string;
  role: SessionRole;
};

export type SessionPayload = SessionUser & {
  expiresAt: string;
};

export const SESSION_COOKIE_NAME = "veggiepos_session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SessionPayload>;

  return (
    typeof payload.userId === "number" &&
    typeof payload.username === "string" &&
    typeof payload.fullName === "string" &&
    (payload.role === "ADMIN" || payload.role === "KASIR") &&
    typeof payload.expiresAt === "string"
  );
}

export function getDashboardPath(role: SessionRole) {
  return role === "ADMIN" ? "/admin/dashboard" : "/kasir/dashboard";
}

export async function decryptSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (!isSessionPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return decryptSessionToken(token);
}

export async function createSession(user: SessionUser) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await new SignJWT({
    ...user,
    expiresAt: expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function requireRole(role: SessionRole) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== role) {
    redirect(getDashboardPath(session.role));
  }

  return session;
}
