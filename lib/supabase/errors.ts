export function formatSupabaseError(error: unknown): Error {
  if (error instanceof Error && error.message && error.message !== "[object Object]") {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const code = typeof record.code === "string" ? record.code : null;
    const message = typeof record.message === "string" ? record.message : null;

    if (code === "PGRST205" || message?.includes("Could not find the table")) {
      return new Error(
        "Campaign tables are missing. Run frontend-app/supabase/migrations/006_email_campaigns.sql in the Supabase SQL editor, then refresh.",
      );
    }

    const parts = [
      message,
      typeof record.details === "string" ? record.details : null,
      typeof record.hint === "string" ? record.hint : null,
      code ? `code=${code}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return new Error(parts.join(" | "));
    }
  }

  return new Error(typeof error === "string" ? error : "Unknown Supabase error");
}

export function throwSupabaseError(error: unknown): never {
  throw formatSupabaseError(error);
}
