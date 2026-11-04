import type { NextRequest } from "next/server";

import { clientIp, isSameOrigin, json, logServerError, parseEmail, readJson } from "@/lib/security/http";
import { rateLimit } from "@/lib/security/rateLimit";
import { createRouteClient } from "@/lib/supabase/route";

/** The same answer whether or not the address has an account, so this cannot be used to find customers. */
const GENERIC = { ok: true, message: "If an account exists for that email, a reset link is on its way." };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);

  const ip = await rateLimit(`forgot:ip:${clientIp(request)}`, 8, 15 * 60);
  if (!ip.ok) {
    return json({ error: "Too many requests. Please try again later." }, 429, {
      "Retry-After": String(ip.retryAfter),
    });
  }

  const body = await readJson(request, 2 * 1024);
  const email = parseEmail(body?.email);
  if (!email) return json({ error: "Enter a valid email address." }, 400);

  // A per-address limit stops someone mail-bombing one person; it still answers with the generic reply.
  const perEmail = await rateLimit(`forgot:email:${email}`, 3, 60 * 60);
  if (!perEmail.ok) return json(GENERIC);

  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  const response = json(GENERIC);
  try {
    const supabase = createRouteClient(request, response);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${base.replace(/\/$/, "")}/auth/confirm?next=/reset-password`,
    });
    if (error) logServerError("forgot-password", error);
  } catch (error) {
    logServerError("forgot-password", error);
  }
  return response;
}
