import "server-only";

import type { UserRole } from "@prisma/client";
import { getDb } from "@/lib/db";

export type UserFormValues = {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
};

function normalizeQuery(query?: string) {
  return query?.trim() ?? "";
}

function parseRoleFilter(query?: string): UserRole | null {
  const normalizedQuery = normalizeQuery(query).toLowerCase();

  if (normalizedQuery === "admin") {
    return "ADMIN";
  }

  if (normalizedQuery === "kasir") {
    return "KASIR";
  }

  return null;
}

function userQueryWhere(query?: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {};
  }

  const roleFilter = parseRoleFilter(query);

  return {
    OR: [
      {
        username: {
          contains: normalizedQuery,
          mode: "insensitive" as const,
        },
      },
      {
        fullName: {
          contains: normalizedQuery,
          mode: "insensitive" as const,
        },
      },
      ...(roleFilter ? [{ role: roleFilter }] : []),
    ],
  };
}

export async function getUsers(query?: string) {
  const db = getDb();

  return db.user.findMany({
    where: userQueryWhere(query),
    orderBy: [{ role: "asc" }, { fullName: "asc" }, { username: "asc" }],
  });
}

export async function getUserById(id: number) {
  const db = getDb();

  return db.user.findUnique({
    where: { id },
  });
}

export async function getUserStats(query?: string) {
  const users = await getUsers(query);

  return {
    totalUsers: users.length,
    adminCount: users.filter((user) => user.role === "ADMIN").length,
    cashierCount: users.filter((user) => user.role === "KASIR").length,
  };
}

export function formatRoleLabel(role: UserRole) {
  return role === "ADMIN" ? "Admin" : "Kasir";
}

export function getRoleTone(role: UserRole) {
  return role === "ADMIN" ? "good" : "soft";
}
