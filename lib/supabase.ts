/**
 * Browser Supabase client — use in Client Components.
 *
 * @example
 * import { createClient } from "@/lib/supabase/client";
 *
 * Server Components / actions:
 * import { createClient } from "@/lib/supabase/server";
 *
 * Middleware:
 * import { createClient } from "@/lib/supabase/middleware";
 */
export { createClient, createClient as createBrowserClient } from "./supabase/client";
