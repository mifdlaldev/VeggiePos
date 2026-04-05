import { NextResponse, type NextRequest } from "next/server";
import {
  decryptSessionToken,
  getDashboardPath,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSessionToken(sessionToken);

  const isAdminRoute = pathname.startsWith("/admin");
  const isCashierRoute = pathname.startsWith("/kasir");
  const isProtectedRoute = isAdminRoute || isCashierRoute;
  const isLoginRoute = pathname === "/login";

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL(getDashboardPath(session.role), request.url));
  }

  if (session?.role === "ADMIN" && isCashierRoute) {
    return NextResponse.redirect(new URL(getDashboardPath("ADMIN"), request.url));
  }

  if (session?.role === "KASIR" && isAdminRoute) {
    return NextResponse.redirect(new URL(getDashboardPath("KASIR"), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
