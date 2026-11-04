import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client for a Route Handler that returns its own response: session cookies are written onto
 * that response, so a redirect returned after sign-in carries the new session.
 */
export function createRouteClient(request: NextRequest | Request, response: NextResponse) {
  const incoming = (request as NextRequest).cookies;
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return incoming ? incoming.getAll() : [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
}
