import { type NextRequest, NextResponse } from "next/server";

import { CAMPAIGNS_ENABLED } from "@/lib/config/features";
import { createClient } from "@/lib/supabase/middleware";

const protectedPaths = ["/dashboard", "/research", "/leads", "/campaigns", "/settings", "/admin"];

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Campaigns are not released: the pages are unreachable, not just hidden from the menu.
  if (!CAMPAIGNS_ENABLED && pathname.startsWith("/campaigns")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/research/:path*",
    "/leads",
    "/leads/:path*",
    "/campaigns",
    "/campaigns/:path*",
    "/settings",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
