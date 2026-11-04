import type { NextRequest } from "next/server";

import { audit, guardAdmin } from "@/lib/admin/guard";
import { json, logServerError, parseEmail, readJson } from "@/lib/security/http";

type PlanType = "demo" | "standard";

interface ProfileRow {
  user_id: string;
  plan_type: PlanType;
  role: string;
  is_active: boolean;
  monthly_lead_limit: number | null;
  lifetime_run_limit: number | null;
  max_leads_per_run: number;
}

/** The users an admin manages, with their plan and this month's usage. */
export async function GET(request: NextRequest) {
  const guard = await guardAdmin(request, "list", 60, 60, false);
  if ("response" in guard) return guard.response;
  const { db } = guard;

  try {
    const { data: listed, error } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw error;
    const users = listed.users;

    const { data: profiles, error: profileError } = await db
      .from("user_profiles")
      .select("user_id, plan_type, role, is_active, monthly_lead_limit, lifetime_run_limit, max_leads_per_run");
    if (profileError) throw profileError;
    const byId = new Map((profiles as ProfileRow[]).map((p) => [p.user_id, p]));

    const { data: totalRows } = await db.rpc("admin_usage_totals");
    const totals = new Map(
      ((totalRows ?? []) as { user_id: string; total_runs: number; total_leads: number; last_run_at: string | null }[]).map(
        (t) => [t.user_id, t],
      ),
    );

    const usage = await Promise.all(
      users.map(async (u) => {
        const { data } = await db.rpc("usage_snapshot", { p_user: u.id });
        return (data ?? {}) as Record<string, unknown>;
      }),
    );

    const now = Date.now();
    const rows = users.map((u, index) => {
      const profile = byId.get(u.id);
      const snapshot = usage[index];
      const banned = u.banned_until ? new Date(u.banned_until).getTime() > now : false;
      const status = banned || profile?.is_active === false ? "disabled" : u.email_confirmed_at ? "active" : "invited";
      return {
        id: u.id,
        email: u.email ?? "",
        name: String(u.user_metadata?.full_name ?? ""),
        status,
        plan: profile?.plan_type ?? null,
        role: profile?.role ?? "user",
        monthlyLimit: profile?.monthly_lead_limit ?? null,
        lifetimeRunLimit: profile?.lifetime_run_limit ?? null,
        maxLeadsPerRun: profile?.max_leads_per_run ?? null,
        monthlyUsed: Number(snapshot.monthly_used ?? 0),
        runsUsed: Number(snapshot.runs_used ?? 0),
        totalRuns: totals.get(u.id)?.total_runs ?? 0,
        totalLeads: totals.get(u.id)?.total_leads ?? 0,
        lastRunAt: totals.get(u.id)?.last_run_at ?? null,
        periodStartedAt: (snapshot.period_started_at as string | undefined) ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        createdAt: u.created_at,
      };
    });

    rows.sort((a, b) => a.email.localeCompare(b.email));
    return json({ users: rows });
  } catch (error) {
    logServerError("admin-list", error);
    return json({ error: "Could not load users." }, 500);
  }
}

/** Invite someone. They get an e-mail, set a password, and start on the plan chosen here. */
export async function POST(request: NextRequest) {
  const guard = await guardAdmin(request, "invite", 20, 60 * 60, true);
  if ("response" in guard) return guard.response;
  const { db, adminId } = guard;

  const body = await readJson(request, 2 * 1024);
  const email = parseEmail(body?.email);
  const plan = body?.plan;
  if (!email) return json({ error: "Enter a valid email address." }, 400);
  if (plan !== "demo" && plan !== "standard") return json({ error: "Choose a plan: demo or standard." }, 400);

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;

  try {
    // 1. the invitation row is what lets the database accept this address as a new account
    await db.from("invitations").delete().eq("email", email).is("accepted_at", null);
    const { error: inviteRowError } = await db
      .from("invitations")
      .insert({ email, plan_type: plan, invited_by: adminId });
    if (inviteRowError) throw inviteRowError;

    // 2. send the e-mail
    const { error } = await db.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${base.replace(/\/$/, "")}/auth/confirm?next=/reset-password%3Finvited%3D1`,
      data: fullName ? { full_name: fullName } : undefined,
    });
    if (error) {
      await db.from("invitations").delete().eq("email", email).is("accepted_at", null);
      const exists = /already|registered|exists/i.test(error.message);
      return json({ error: exists ? "That email already has an account." : "Could not send the invitation." }, exists ? 409 : 502);
    }

    await audit(db, adminId, "invite", null, { email, plan });
    return json({ ok: true }, 201);
  } catch (error) {
    logServerError("admin-invite", error);
    return json({ error: "Could not send the invitation." }, 500);
  }
}
