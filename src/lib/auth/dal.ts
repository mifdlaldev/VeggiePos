import "server-only";

import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import type { SessionUser } from "@/lib/auth/session";

export async function authenticateUser(
  username: string,
  password: string,
): Promise<SessionUser | null> {
  const db = getDb();
  const normalizedUsername = username.trim().toLowerCase();

  const user = await db.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
}
