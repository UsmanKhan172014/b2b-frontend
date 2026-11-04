import { requireAdmin } from "@/lib/auth/requireAdmin";
import { isSameOrigin, json } from "@/lib/security/http";
import { rateLimit } from "@/lib/security/rateLimit";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Everything an admin route must settle before it does any work: same-origin (for writes), an active admin,
 * a rate limit per admin, and a configured service role. Returns a response to send, or the admin's id.
 */
export async function guardAdmin(
  request: Request,
  scope: string,
  max: number,
  windowSeconds: number,
  write: boolean,
) {
  if (write && !isSameOrigin(request)) return { response: json({ error: "Forbidden" }, 403) } as const;

  const auth = await requireAdmin();
  // 404 rather than 403 for non-admins: the admin area should not advertise that it exists
  if (!auth.ok) return { response: json({ error: auth.status === 401 ? "Unauthorized" : "Not found" }, auth.status === 401 ? 401 : 404) } as const;

  const limit = await rateLimit(`admin:${scope}:${auth.admin.user.id}`, max, windowSeconds);
  if (!limit.ok) {
    return {
      response: json({ error: "Too many requests. Please slow down." }, 429, { "Retry-After": String(limit.retryAfter) }),
    } as const;
  }
  if (!hasServiceRole()) {
    return { response: json({ error: "The admin service is not configured." }, 503) } as const;
  }
  return { adminId: auth.admin.user.id, db: createAdminClient() } as const;
}

/** Records an admin action. A failure here must never undo or block the action itself. */
export async function audit(
  db: ReturnType<typeof createAdminClient>,
  actor: string,
  action: string,
  target: string | null,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.from("admin_audit_log").insert({ actor, action, target, details });
  } catch {
    // intentionally ignored
  }
}
