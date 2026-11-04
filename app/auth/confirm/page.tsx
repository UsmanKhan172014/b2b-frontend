
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthShared";
import { AuthShell } from "@/components/auth/AuthShell";
import { HashSessionConfirm } from "@/components/auth/HashSessionConfirm";
import { safeRedirectPath } from "@/lib/security/safeRedirect";

export const metadata = {
  title: "Confirm | Sales Copilot",
  robots: { index: false },
  referrer: "no-referrer", // the link carries a one-time token: never send it on to another site
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * Landing page for the links in invitation and password-reset e-mails. Nothing is consumed here: the
 * button posts the token to /api/auth/verify. That keeps mail-security scanners, which open every link
 * in a message, from using up the one-time token before the person clicks.
 */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tokenHash = first(params.token_hash);
  const code = first(params.code);
  const type = first(params.type) || "recovery";
    // Supabase's default e-mail link puts the session in the URL fragment, which the server never sees.
  // With no token in the query, let the browser read the fragment (it sends the person to /login if there is none).
  if (!tokenHash && !code) {
    return (
      <AuthShell>
        <HashSessionConfirm next={next} />
      </AuthShell>
    );
  }

  const invite = type === "invite";
  const next = safeRedirectPath(first(params.next), invite ? "/reset-password?invited=1" : "/reset-password");

  return (
    <AuthShell>
      <AuthCard>
        <AuthHeader
          title={invite ? "Accept your invitation" : "Reset your password"}
          subtitle={
            invite
              ? "You have been invited to Sales Copilot. Continue to set up your account."
              : "Continue to choose a new password."
          }
          variant="signup"
        />
        <form method="POST" action="/api/auth/verify" className="flex flex-col gap-4">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-cta px-5 py-3 text-body-sm font-bold text-white shadow-glow-primary transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
