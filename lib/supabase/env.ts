/**
 * Supabase public client configuration (publishable key — replaces legacy anon key).
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 *
 * Use static process.env.NEXT_PUBLIC_* access so Next.js can inline values in the browser bundle.
 */

function requirePublicEnv(
  value: string | undefined,
  name: string,
): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Missing ${name}. Set it in Frontend/.env.local and restart the dev server.`,
    );
  }
  return trimmed;
}

export function getSupabaseUrl(): string {
  return requirePublicEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
}

export function getSupabasePublishableKey(): string {
  return requirePublicEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}
