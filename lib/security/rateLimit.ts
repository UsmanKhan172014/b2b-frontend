import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
}

/** Fallback when the shared store is unavailable: per server instance only, so a best effort. */
const memory = new Map<string, { count: number; resetAt: number }>();

function memoryHit(key: string, max: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    if (memory.size > 5000) memory.clear();
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return entry.count <= max
    ? { ok: true, retryAfter: 0 }
    : { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}

/**
 * Counts one hit for `key` and says whether the caller is still within `max` hits per `windowSeconds`.
 * Uses a Postgres counter (shared by every serverless instance) when the service role is configured and
 * falls back to in-memory counting otherwise, so a database hiccup never turns into an open door.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<RateLimitResult> {
  if (hasServiceRole()) {
    try {
      const { data, error } = await createAdminClient().rpc("rate_limit_hit", {
        p_key: key.slice(0, 200),
        p_window_seconds: windowSeconds,
        p_max: max,
      });
      if (!error && typeof data === "boolean") {
        return data ? { ok: true, retryAfter: 0 } : { ok: false, retryAfter: windowSeconds };
      }
    } catch {
      // fall through to the in-memory limiter
    }
  }
  return memoryHit(key, max, windowSeconds);
}
