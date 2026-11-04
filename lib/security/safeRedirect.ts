/**
 * A post-login destination taken from the URL (`?redirect=` / `?next=`) is attacker-controlled. Only a
 * path on this site is allowed; anything else (another host, `//host`, `/\host`, `javascript:`) falls back.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || value.length > 500) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  // control characters or whitespace tricks that some browsers strip before parsing
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
