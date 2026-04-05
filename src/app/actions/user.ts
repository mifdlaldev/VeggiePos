"use server";

import type { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { createSession, requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export type UserActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<"username" | "password" | "fullName" | "role", string>
  >;
};

const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

const roleSchema = z.string().refine(
  (value): value is UserRole => value === "ADMIN" || value === "KASIR",
  "Pilih level user yang valid.",
);

const baseUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(30, "Username maksimal 30 karakter.")
    .regex(
      USERNAME_REGEX,
      "Username hanya boleh berisi huruf, angka, titik, strip, dan underscore.",
    )
    .transform((value) => value.toLowerCase()),
  fullName: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter.")
    .max(100, "Nama lengkap terlalu panjang."),
  role: roleSchema,
});

const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(6, "Password minimal 6 karakter.")
    .max(72, "Password maksimal 72 karakter."),
});

const updateUserSchema = baseUserSchema.extend({
  password: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmedValue = value.trim();
      return trimmedValue ? trimmedValue : undefined;
    },
    z
      .string()
      .min(6, "Password minimal 6 karakter.")
      .max(72, "Password maksimal 72 karakter.")
      .optional(),
  ),
});

function redirectToUsers(status: string, query?: string): never {
  const searchParams = new URLSearchParams();

  searchParams.set("status", status);

  if (query?.trim()) {
    searchParams.set("q", query.trim());
  }

  redirect(`/admin/users?${searchParams.toString()}`);
}

function revalidateUserViews() {
  revalidatePath("/admin/users");
}

async function ensureUniqueUsername(username: string, ignoreId?: number) {
  const db = getDb();

  const existingUser = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
  });

  return !existingUser;
}

async function getAdminCount() {
  const db = getDb();

  return db.user.count({
    where: { role: "ADMIN" },
  });
}

export async function createUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireRole("ADMIN");

  const query = String(formData.get("returnQuery") ?? "");
  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Periksa kembali input user Anda.",
      fieldErrors: {
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
        fullName: fieldErrors.fullName?.[0],
        role: fieldErrors.role?.[0],
      },
    };
  }

  const isUnique = await ensureUniqueUsername(parsed.data.username);

  if (!isUnique) {
    return {
      success: false,
      message: "Username sudah dipakai. Gunakan username lain.",
      fieldErrors: {
        username: "Username sudah digunakan.",
      },
    };
  }

  const db = getDb();

  try {
    await db.user.create({
      data: {
        username: parsed.data.username,
        password: await hashPassword(parsed.data.password),
        fullName: parsed.data.fullName,
        role: parsed.data.role,
      },
    });
  } catch {
    return {
      success: false,
      message: "User gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidateUserViews();
  redirectToUsers("created", query);
}

export async function updateUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireRole("ADMIN");
  const query = String(formData.get("returnQuery") ?? "");
  const userId = Number(formData.get("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      success: false,
      message: "User yang ingin diedit tidak valid.",
    };
  }

  const parsed = updateUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Periksa kembali input user Anda.",
      fieldErrors: {
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
        fullName: fieldErrors.fullName?.[0],
        role: fieldErrors.role?.[0],
      },
    };
  }

  const db = getDb();
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "User tidak ditemukan atau sudah dihapus.",
    };
  }

  if (session.userId === userId && parsed.data.role !== session.role) {
    return {
      success: false,
      message: "Role akun Anda sendiri tidak bisa diubah dari halaman ini.",
      fieldErrors: {
        role: "Role akun aktif tidak bisa diubah.",
      },
    };
  }

  if (existingUser.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    const adminCount = await getAdminCount();

    if (adminCount <= 1) {
      return {
        success: false,
        message: "Sistem harus memiliki minimal satu admin aktif.",
        fieldErrors: {
          role: "Admin terakhir tidak bisa diturunkan menjadi kasir.",
        },
      };
    }
  }

  const isUnique = await ensureUniqueUsername(parsed.data.username, userId);

  if (!isUnique) {
    return {
      success: false,
      message: "Username sudah dipakai. Gunakan username lain.",
      fieldErrors: {
        username: "Username sudah digunakan.",
      },
    };
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        username: parsed.data.username,
        fullName: parsed.data.fullName,
        role: parsed.data.role,
        ...(parsed.data.password
          ? { password: await hashPassword(parsed.data.password) }
          : {}),
      },
    });

    if (updatedUser.id === session.userId) {
      await createSession({
        userId: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
      });
    }
  } catch {
    return {
      success: false,
      message: "User gagal diperbarui. Pastikan datanya masih tersedia.",
    };
  }

  revalidateUserViews();
  redirectToUsers("updated", query);
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const query = String(formData.get("returnQuery") ?? "");
  const userId = Number(formData.get("userId"));

  if (!Number.isInteger(userId) || userId <= 0) {
    redirectToUsers("delete-error", query);
  }

  if (session.userId === userId) {
    redirectToUsers("protected", query);
  }

  const db = getDb();
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!existingUser) {
    redirectToUsers("delete-error", query);
  }

  if (existingUser.role === "ADMIN") {
    const adminCount = await getAdminCount();

    if (adminCount <= 1) {
      redirectToUsers("protected", query);
    }
  }

  try {
    await db.user.delete({
      where: { id: userId },
    });
  } catch {
    redirectToUsers("delete-error", query);
  }

  revalidateUserViews();
  redirectToUsers("deleted", query);
}
