import { NextResponse } from "next/server";

/** JSON response that is never cached and never sniffed. */
export function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

/** The caller's address, for rate limiting. Vercel and nginx (with `proxy_set_header X-Real-IP $remote_addr`) set X-Real-IP. */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || "unknown").slice(0, 64);
}

/**
 * CSRF guard for state-changing routes that rely on cookies: a browser always sends `Origin` on a
 * cross-site POST, so a different host means the request did not come from this app.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; no ambient cookies to abuse
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Reads a JSON body of bounded size; returns null when it is missing, too big or not an object. */
export async function readJson(request: Request, maxBytes = 8 * 1024): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A normalised e-mail address, or null. */
export function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

/**
 * Server-side log line that cannot leak: the error's class and a short code only. Error messages and objects
 * from SMTP, Supabase or the AI provider can contain addresses, tokens or request bodies.
 */
export function logServerError(scope: string, error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error;
  console.error(`[${scope}] ${name}`);
}
