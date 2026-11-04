"use client";

import { Fragment, type FormEvent, useCallback, useEffect, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

type Plan = "demo" | "standard";
type Status = "active" | "invited" | "disabled";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: Status;
  plan: Plan | null;
  role: string;
  monthlyLimit: number | null;
  lifetimeRunLimit: number | null;
  maxLeadsPerRun: number | null;
  monthlyUsed: number;
  runsUsed: number;
  totalRuns: number;
  totalLeads: number;
  lastRunAt: string | null;
  periodStartedAt: string | null;
  lastSignInAt: string | null;
}

interface MonthRow {
  month: string;
  runs: number;
  leads: number;
}

const PLAN_OPTIONS: { value: Plan; label: string; hint: string }[] = [
  { value: "demo", label: "Demo", hint: "1 free run, up to 5 leads, no export or phones" },
  { value: "standard", label: "Standard", hint: "100 leads quota, up to 25 per run" },
];

const STATUS_STYLES: Record<Status, string> = {
  active: "border-secondary/30 bg-secondary/10 text-secondary",
  invited: "border-primary/30 bg-primary/10 text-primary",
  disabled: "border-error/30 bg-error-container/10 text-error",
};

function quotaLabel(user: AdminUser): string {
  if (user.lifetimeRunLimit !== null) return `${user.runsUsed} / ${user.lifetimeRunLimit} runs`;
  if (user.monthlyLimit !== null) return `${user.monthlyUsed} / ${user.monthlyLimit} leads`;
  return `${user.monthlyUsed} leads (no limit)`;
}

function formatDate(iso: string | null, withTime = false): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime
    ? date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") return body.error;
  } catch {
    // not JSON
  }
  return "Something went wrong. Please try again.";
}

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<Plan>("demo");
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [history, setHistory] = useState<MonthRow[] | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) {
        setLoadError(await readError(response));
        return;
      }
      const body = (await response.json()) as { users: AdminUser[] };
      setUsers(body.users);
      setLoadError(null);
    } catch {
      setLoadError("Could not reach the server.");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      if (response.ok) {
        setNotice({ ok: true, text: `Invitation sent to ${email.trim()}.` });
        setEmail("");
        await load();
      } else {
        setNotice({ ok: false, text: await readError(response) });
      }
    } catch {
      setNotice({ ok: false, text: "Could not reach the server." });
    } finally {
      setInviting(false);
    }
  }

  async function update(
    user: AdminUser,
    change: { plan?: Plan; isActive?: boolean; monthlyLeadLimit?: number | null; resetUsage?: boolean },
    success?: string,
  ) {
    setBusyId(user.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
      });
      if (!response.ok) setNotice({ ok: false, text: await readError(response) });
      else if (success) setNotice({ ok: true, text: success });
      await load();
    } catch {
      setNotice({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleHistory(user: AdminUser) {
    if (openId === user.id) {
      setOpenId(null);
      return;
    }
    setOpenId(user.id);
    setHistory(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { cache: "no-store" });
      setHistory(response.ok ? ((await response.json()) as { months: MonthRow[] }).months : []);
    } catch {
      setHistory([]);
    }
  }

  function saveLimit(user: AdminUser) {
    const raw = (limitDrafts[user.id] ?? "").trim();
    const value = raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      setNotice({ ok: false, text: "Enter a whole number, or leave it empty for no limit." });
      return;
    }
    void update(user, { monthlyLeadLimit: value }, `Quota updated for ${user.email}.`);
    setLimitDrafts((d) => {
      const next = { ...d };
      delete next[user.id];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard radius="section" className="p-6 sm:p-8">
        <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="person_add" className="text-primary" />
          Invite someone
        </h3>
        <form className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_20rem_auto]" onSubmit={invite} noValidate>
          <div className="space-y-2">
            <label htmlFor="invite-email" className="font-mono text-label-mono uppercase text-on-surface-variant">
              Email
            </label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={inviting}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-plan" className="font-mono text-label-mono uppercase text-on-surface-variant">
              Plan
            </label>
            <select
              id="invite-plan"
              value={plan}
              onChange={(event) => setPlan(event.target.value as Plan)}
              disabled={inviting}
              className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none"
            >
              {PLAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={inviting || email.trim().length === 0} className="md:mb-px">
            {inviting ? "Sending..." : "Send invitation"}
          </Button>
        </form>
        <p className="mt-3 text-body-sm text-on-surface-variant/70">
          Invitations need email sending set up in Supabase. People can also sign up themselves; they start on Demo.
        </p>
      </GlassCard>

      {notice ? (
        <p className={cn("text-body-sm", notice.ok ? "text-secondary" : "text-error")} role="status">
          {notice.text}
        </p>
      ) : null}

      <GlassCard radius="section" className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="groups" className="text-primary" />
            People
          </h3>
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>

        {loadError ? <p className="px-6 py-6 text-body-sm text-error">{loadError}</p> : null}
        {!loadError && users === null ? <p className="px-6 py-6 text-body-sm text-on-surface-variant">Loading...</p> : null}

        {users ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-body-sm">
              <thead>
                <tr className="border-b border-white/10 font-mono text-label-mono uppercase text-on-surface-variant">
                  <th className="px-6 py-3 font-normal">Person</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Plan</th>
                  <th className="px-3 py-3 font-normal">Quota used</th>
                  <th className="px-3 py-3 font-normal">Total runs</th>
                  <th className="px-3 py-3 font-normal">Total leads</th>
                  <th className="px-3 py-3 font-normal">Last run</th>
                  <th className="px-6 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const self = user.id === currentUserId;
                  const busy = busyId === user.id;
                  const draft = limitDrafts[user.id];
                  const hasQuota = user.plan === "standard" || user.monthlyLimit !== null;
                  return (
                    <Fragment key={user.id}>
                      <tr className="border-b border-white/5">
                        <td className="px-6 py-4">
                          <p className="font-medium text-on-surface">
                            {user.name || user.email}
                            {user.role === "admin" ? (
                              <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-on-surface-variant">
                                Admin
                              </span>
                            ) : null}
                          </p>
                          {user.name ? <p className="text-on-surface-variant">{user.email}</p> : null}
                        </td>
                        <td className="px-3 py-4">
                          <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase", STATUS_STYLES[user.status])}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <select
                            aria-label={`Plan for ${user.email}`}
                            value={user.plan ?? ""}
                            disabled={busy || !user.plan}
                            onChange={(event) => {
                              const next = event.target.value as Plan;
                              if (next !== user.plan) void update(user, { plan: next, resetUsage: true }, `Plan changed for ${user.email}; usage restarted.`);
                            }}
                            className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-on-surface focus:border-primary focus:outline-none"
                          >
                            {!user.plan ? <option value="">—</option> : null}
                            {PLAN_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-on-surface">{user.plan ? quotaLabel(user) : "—"}</p>
                          {user.periodStartedAt ? (
                            <p className="text-[11px] text-on-surface-variant/70">since {formatDate(user.periodStartedAt)}</p>
                          ) : null}
                          {hasQuota && user.plan ? (
                            <div className="mt-2 flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                aria-label={`Lead quota for ${user.email}`}
                                placeholder={user.monthlyLimit === null ? "no limit" : String(user.monthlyLimit)}
                                value={draft ?? ""}
                                onChange={(event) => setLimitDrafts((d) => ({ ...d, [user.id]: event.target.value }))}
                                className="w-24 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-2 py-1 text-on-surface focus:border-primary focus:outline-none"
                              />
                              <Button variant="ghost" size="sm" disabled={busy || draft === undefined} onClick={() => saveLimit(user)}>
                                Set
                              </Button>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 text-on-surface">{user.totalRuns}</td>
                        <td className="px-3 py-4 text-on-surface">{user.totalLeads}</td>
                        <td className="px-3 py-4 text-on-surface-variant">{formatDate(user.lastRunAt, true)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => void toggleHistory(user)}>
                              {openId === user.id ? "Hide history" : "History"}
                            </Button>
                            {user.plan ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => {
                                  if (window.confirm(`Start a new quota period for ${user.email}? Their usage count returns to 0.`)) {
                                    void update(user, { resetUsage: true }, `Usage reset for ${user.email}.`);
                                  }
                                }}
                              >
                                Reset usage
                              </Button>
                            ) : null}
                            {user.plan && !self ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => {
                                  if (user.status === "disabled") {
                                    void update(user, { isActive: true }, `${user.email} can use the platform again.`);
                                  } else if (window.confirm(`Disable ${user.email}? They will be signed out and cannot run research.`)) {
                                    void update(user, { isActive: false }, `${user.email} is disabled.`);
                                  }
                                }}
                              >
                                {user.status === "disabled" ? "Enable" : "Disable"}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                      {openId === user.id ? (
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <td colSpan={8} className="px-6 py-4">
                            {history === null ? (
                              <p className="text-on-surface-variant">Loading history...</p>
                            ) : history.length === 0 ? (
                              <p className="text-on-surface-variant">No completed runs yet.</p>
                            ) : (
                              <table className="w-full max-w-md text-left">
                                <thead>
                                  <tr className="font-mono text-label-mono uppercase text-on-surface-variant">
                                    <th className="py-1 font-normal">Month</th>
                                    <th className="py-1 font-normal">Runs</th>
                                    <th className="py-1 font-normal">Leads</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {history.map((row) => (
                                    <tr key={row.month}>
                                      <td className="py-1 text-on-surface">
                                        {new Date(row.month + "T00:00:00Z").toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" })}
                                      </td>
                                      <td className="py-1 text-on-surface">{row.runs}</td>
                                      <td className="py-1 text-on-surface">{row.leads}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-on-surface-variant">
                      No users yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
