"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateUser } from "@/lib/auth/dal";
import {
  createSession,
  deleteSession,
  getDashboardPath,
} from "@/lib/auth/session";

export type LoginActionState = {
  error?: string;
};

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter."),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter."),
});

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Input login tidak valid.",
    };
  }

  try {
    const user = await authenticateUser(parsed.data.username, parsed.data.password);

    if (!user) {
      return {
        error: "Username atau password tidak cocok.",
      };
    }

    await createSession(user);
    redirect(getDashboardPath(user.role));
  } catch {
    return {
      error:
        "Koneksi database atau konfigurasi autentikasi belum siap. Periksa env Supabase Anda.",
    };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
