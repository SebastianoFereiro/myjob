import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/auth",
  "/blog",
  "/jobs",
  "/categories",
  "/companies",
  "/contacts",
  "/api",
  "/_next",
  "/favicon.ico",
  "/images",
];

function getSessionCookie(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce<Record<string, string>>((acc, c) => {
    const [key, ...val] = c.trim().split("=");
    if (key) acc[key] = val.join("=");
    return acc;
  }, {});

  return cookies["__Secure-better-auth.session_token"]
    ?? cookies["better-auth.session_token"]
    ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (publicRoutes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // /resume/* is public EXCEPT /resume/submit
  if (pathname.startsWith("/resume") && pathname !== "/resume/submit") {
    return NextResponse.next();
  }

  // Check protected routes — lightweight cookie existence check
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/company") ||
    pathname === "/resume/submit"
  ) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
