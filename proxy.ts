import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/bills") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/settings");

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isSetupRoute = pathname.startsWith("/setup");

  // Redirect to login if accessing dashboard without session
  if (isDashboardRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if already logged in and visiting auth pages
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to setup if logged in but no shop (will be checked on setup page)
  if (isSetupRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bills/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/setup",
  ],
};
