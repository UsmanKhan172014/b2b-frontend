/**
 * Browser-side error logging that cannot leak. Error objects from Supabase, fetch or the research stream can
 * carry request bodies, row data (lead names, e-mail addresses) or URLs with tokens, so only the scope, the
 * error's class and a short machine code are ever printed. Nothing is printed in production builds.
 */
export function logClientError(scope: string, error?: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  const name = error instanceof Error ? error.name : typeof error;
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof (error as { code: unknown }).code === "string"
      ? ` ${(error as { code: string }).code}`
      : "";
  console.error(`[${scope}] ${name}${code}`);
}
