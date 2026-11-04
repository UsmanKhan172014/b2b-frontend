import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client with the SERVICE-ROLE key. It bypasses row-level security, so it is only for server code
 * that has already checked who is calling (admin routes, rate limiting). The key has no NEXT_PUBLIC_ prefix,
 * so Next.js never ships it to the browser; the guard below makes any accidental client import fail loudly.
 */
let cached: SupabaseClient | null = null;

export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("The admin client must not be used in the browser.");
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  cached ??= createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
