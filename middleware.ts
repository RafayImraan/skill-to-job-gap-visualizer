import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "skill_gap_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/sign-in", request.url);
  signInUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
