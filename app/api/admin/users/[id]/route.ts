import type { NextRequest } from "next/server";

import { audit, guardAdmin, UUID_PATTERN } from "@/lib/admin/guard";
import { json, logServerError, readJson } from "@/lib/security/http";

/** The two plans and their limits. Mirrors plan_limits() in migration 011. */
const PLAN_DEFAULTS = {
  demo: { monthly_lead_limit: null, lifetime_run_limit: 1, max_leads_per_run: 5 },
  standard: { monthly_lead_limit: 100, lifetime_run_limit: null, max_leads_per_run: 25 },
} as const;

function intInRange(value: unknown, min: number, max: number): number | null | undefined {
  if (value === null) return null; // "no limit"
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) return undefined; // invalid
  return value;
}

/** One person's runs and leads, month by month. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request, "history", 60, 60, false);
  if ("response" in guard) return guard.response;
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return json({ error: "Invalid user." }, 400);
  try {
    const { data, error } = await guard.db.rpc("admin_usage_by_month", { p_user: id });
    if (error) throw error;
    return json({ months: data ?? [] });
  } catch (error) {
    logServerError("admin-history", error);
    return json({ error: "Could not load the history." }, 500);
  }
}

/**
 * Change a user's plan, limits or status. Admin roles are not changeable here on purpose: promoting an
 * admin is a deliberate, out-of-band database change.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request, "update", 60, 60, true);
  if ("response" in guard) return guard.response;
  const { db, adminId } = guard;

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return json({ error: "Invalid user." }, 400);

  const body = await readJson(request, 2 * 1024);
  if (!body) return json({ error: "Invalid request." }, 400);

  const update: Record<string, unknown> = {};

  if (body.plan !== undefined) {
    if (body.plan !== "demo" && body.plan !== "standard") return json({ error: "Choose a plan: demo or standard." }, 400);
    update.plan_type = body.plan;
    Object.assign(update, PLAN_DEFAULTS[body.plan]);
  }

  // optional per-user overrides, applied after the plan's defaults
  for (const [field, column, min, max] of [
    ["monthlyLeadLimit", "monthly_lead_limit", 0, 100000],
    ["lifetimeRunLimit", "lifetime_run_limit", 0, 1000],
    ["maxLeadsPerRun", "max_leads_per_run", 1, 25],
  ] as const) {
    if (body[field] === undefined) continue;
    const value = intInRange(body[field], min, max);
    if (value === undefined || (column === "max_leads_per_run" && value === null)) {
      return json({ error: `Invalid value for ${field}.` }, 400);
    }
    update[column] = value;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return json({ error: "Invalid status." }, 400);
    if (id === adminId && body.isActive === false) return json({ error: "You cannot disable your own account." }, 400);
    update.is_active = body.isActive;
  }

  if (body.resetUsage === true) {
    // quota never renews by itself: an admin starts a new period when they decide to
    update.quota_started_at = new Date().toISOString();
  }

  if (Object.keys(update).length === 0) return json({ error: "Nothing to change." }, 400);

  try {
    const { data, error } = await db.from("user_profiles").update(update).eq("user_id", id).select("user_id").maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "User not found." }, 404);

    if (typeof update.is_active === "boolean") {
      // a disabled account also cannot sign in or refresh its session
      await db.auth.admin.updateUserById(id, { ban_duration: update.is_active ? "none" : "876000h" });
    }

    await audit(db, adminId, "update_user", id, update);
    return json({ ok: true });
  } catch (error) {
    logServerError("admin-update", error);
    return json({ error: "Could not update the user." }, 500);
  }
}
