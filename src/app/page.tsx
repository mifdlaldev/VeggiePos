import { redirect } from "next/navigation";
import { getDashboardPath, getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();

  redirect(session ? getDashboardPath(session.role) : "/login");
}
