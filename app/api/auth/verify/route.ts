import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { clientIp, isSameOrigin, logServerError } from "@/lib/security/http";
import { rateLimit } from "@/lib/security/rateLimit";
import { safeRedirectPath } from "@/lib/security/safeRedirect";
import { createRouteClient } from "@/lib/supabase/route";

const ALLOWED_TYPES = new Set<EmailOtpType>(["invite", "recovery"]);
const TOKEN_PATTERN = /^[A-Za-z0-9_.-]{8,300}$/;

function to(request: NextRequest, path: string) {
  return new URL(path, request.nextUrl.origin);
}

/**
 * Completes an invitation or password-reset link. It is a POST (from the confirm page's button) rather than
 * a GET on the e-mail link itself, because corporate mail scanners open every link in a message and would
 * use up the one-time token before the person clicks.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.redirect(to(request, "/login?error=link_invalid"), 303);

  const limit = await rateLimit(`verify:${clientIp(request)}`, 20, 10 * 60);
  if (!limit.ok) return NextResponse.redirect(to(request, "/login?error=too_many"), 303);

  const form = await request.formData().catch(() => null);
  const tokenHash = String(form?.get("token_hash") ?? "");
  const code = String(form?.get("code") ?? "");
  const type = String(form?.get("type") ?? "") as EmailOtpType;
  const fallback = type === "invite" ? "/reset-password?invited=1" : "/reset-password";
  const next = safeRedirectPath(String(form?.get("next") ?? ""), fallback);

  const failure = NextResponse.redirect(to(request, "/login?error=link_invalid"), 303);
  const success = NextResponse.redirect(to(request, next), 303);

  try {
    if (tokenHash && ALLOWED_TYPES.has(type) && TOKEN_PATTERN.test(tokenHash)) {
      const supabase = createRouteClient(request, success);
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      return error ? failure : success;
    }
    if (code && TOKEN_PATTERN.test(code)) {
      const supabase = createRouteClient(request, success);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return error ? failure : success;
    }
  } catch (error) {
    logServerError("auth-verify", error);
  }
  return failure;
}
