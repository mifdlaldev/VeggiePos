import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";

export default async function CashierLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("KASIR");

  return children;
}
