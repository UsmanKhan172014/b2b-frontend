import type { SupabaseClient } from "@supabase/supabase-js";

export type UserPlanType = "demo" | "standard";

export type BlockedReason = "inactive" | "run_limit" | "monthly_limit" | "no_profile";

/** What the signed-in person may still do. Computed by the database (get_my_usage); the browser never decides. */
export interface ResearchUsage {
  planType: UserPlanType;
  monthlyLimit: number | null;
  monthlyUsed: number;
  monthlyRemaining: number | null;
  runLimit: number | null;
  runsUsed: number;
  runsRemaining: number | null;
  maxLeadsPerRun: number;
  /** Most leads the next run may ask for (0 when blocked). */
  allowedNow: number;
  blockedReason: BlockedReason | null;
  resetsAt: string | null;
  canStart: boolean;
}

export const PLAN_LABELS: Record<UserPlanType, string> = {
  demo: "Demo",
  standard: "Standard",
};

function formatDate(iso: string | null): string {
  if (!iso) return "next month";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "next month"
    : date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

/** The sentence shown when a person cannot start another run. */
export function limitMessage(usage: Pick<ResearchUsage, "blockedReason" | "monthlyLimit" | "resetsAt">): string {
  switch (usage.blockedReason) {
    case "run_limit":
      return "You have used your free demo run. Please contact your administrator or support to upgrade your plan.";
    case "monthly_limit":
      return `You have used all ${usage.monthlyLimit ?? "your"} leads in your quota. Please contact your administrator or support to add more.`;
    case "inactive":
      return "Your account is not active. Contact your administrator.";
    case "no_profile":
      return "Your account is not set up for research yet. Contact your administrator.";
    default:
      return "You cannot start another research run right now.";
  }
}

export class ResearchLimitReachedError extends Error {
  readonly reason: BlockedReason | null;

  constructor(message: string, reason: BlockedReason | null = null) {
    super(message);
    this.name = "ResearchLimitReachedError";
    this.reason = reason;
  }
}

export function isResearchLimitError(error: unknown): boolean {
  if (error instanceof ResearchLimitReachedError) return true;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  return message.toLowerCase().includes("research_limit_reached");
}

interface UsageRow {
  plan_type?: string;
  monthly_limit?: number | null;
  monthly_used?: number;
  monthly_remaining?: number | null;
  run_limit?: number | null;
  runs_used?: number;
  runs_remaining?: number | null;
  max_leads_per_run?: number;
  allowed_now?: number;
  blocked_reason?: string | null;
  resets_at?: string | null;
}

/** The signed-in user's plan and what is left of it. Throws when it cannot be read (fail closed). */
export async function getUserResearchUsage(supabase: SupabaseClient): Promise<ResearchUsage> {
  const { data, error } = await supabase.rpc("get_my_usage");
  if (error) throw error;

  const row = (data ?? {}) as UsageRow;
  const allowedNow = Math.max(0, Number(row.allowed_now ?? 0));
  const blockedReason = (row.blocked_reason ?? null) as BlockedReason | null;

  return {
    planType: row.plan_type === "demo" ? "demo" : "standard",
    monthlyLimit: row.monthly_limit ?? null,
    monthlyUsed: Number(row.monthly_used ?? 0),
    monthlyRemaining: row.monthly_remaining ?? null,
    runLimit: row.run_limit ?? null,
    runsUsed: Number(row.runs_used ?? 0),
    runsRemaining: row.runs_remaining ?? null,
    maxLeadsPerRun: Number(row.max_leads_per_run ?? 25),
    allowedNow,
    blockedReason,
    resetsAt: row.resets_at ?? null,
    canStart: allowedNow > 0 && !blockedReason,
  };
}

/** Throws a readable error when the user cannot start another run. */
export async function assertCanStartResearch(supabase: SupabaseClient): Promise<ResearchUsage> {
  const usage = await getUserResearchUsage(supabase);
  if (!usage.canStart) {
    throw new ResearchLimitReachedError(limitMessage(usage), usage.blockedReason);
  }
  return usage;
}
