import { NextResponse } from "next/server";

import { CAMPAIGNS_ENABLED, CAMPAIGNS_SOON_MESSAGE } from "@/lib/config/features";
import { logServerError } from "@/lib/security/http";
import { getEmailTemplateBySlug } from "@/lib/campaigns/queries";
import { sendDynamicEmail } from "@/lib/email/sendDynamicEmail";
import type { SendDynamicEmailPayload } from "@/lib/email/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (!CAMPAIGNS_ENABLED) {
    return NextResponse.json({ error: CAMPAIGNS_SOON_MESSAGE }, { status: 403 });
  }
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<SendDynamicEmailPayload>;
    const { templateSlug, recipientEmail, variables } = body;

    if (!templateSlug || !recipientEmail || !variables) {
      return NextResponse.json(
        {
          error: "Missing required payload: templateSlug, recipientEmail, variables",
        },
        { status: 400 },
      );
    }

    const template = await getEmailTemplateBySlug(authClient, templateSlug);

    if (!template) {
      return NextResponse.json(
        { error: "Email template not found in database." },
        { status: 404 },
      );
    }

    const result = await sendDynamicEmail(template, recipientEmail, variables);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    logServerError("email-send", error);
    return NextResponse.json({ error: "Could not send the email." }, { status: 500 });
  }
}
