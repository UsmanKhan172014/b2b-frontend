"use client";

import { useCallback, useEffect, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard, Input } from "@/components/ui";
import { getAgentServiceUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type ConnectStep = "idle" | "starting" | "credentials" | "otp" | "connected";

/**
 * LinkedIn session connect UI — talks to the FastAPI agent service.
 */
export function LinkedInTab() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [liAt, setLiAt] = useState("");
  const [showCookieForm, setShowCookieForm] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [step, setStep] = useState<ConnectStep>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const baseUrl = getAgentServiceUrl();

  const refreshStatus = useCallback(async (uid: string) => {
    const response = await fetch(
      `${baseUrl}/linkedin/status?userId=${encodeURIComponent(uid)}`,
    );
    if (!response.ok) return;
    const data = (await response.json()) as {
      authorized?: boolean;
      email?: string | null;
    };
    setAuthorized(Boolean(data.authorized));
    setConnectedEmail(data.email ?? null);
    if (data.authorized) setStep("connected");
  }, [baseUrl]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);
      try {
        await refreshStatus(user.id);
      } catch {
        /* agent may be offline */
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshStatus]);

  async function startBrowser() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${baseUrl}/linkedin/startBrowser`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || "Failed to start browser");
      }
      setStep("credentials");
      setMessage("Chrome opened on LinkedIn login. Enter your credentials below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start browser");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${baseUrl}/linkedin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Login failed",
        );
      }
      if (data.status === "otp_required") {
        setStep("otp");
        setMessage("Enter the verification code LinkedIn sent you.");
      } else {
        setAuthorized(true);
        setConnectedEmail(email);
        setStep("connected");
        setMessage("LinkedIn connected successfully.");
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/linkedin/submitOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "OTP failed",
        );
      }
      setAuthorized(true);
      setConnectedEmail(email);
      setStep("connected");
      setMessage("LinkedIn connected successfully.");
      setPassword("");
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP failed");
    } finally {
      setLoading(false);
    }
  }

  async function captureSession() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${baseUrl}/linkedin/captureSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email: email || undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Could not capture session",
        );
      }
      setAuthorized(true);
      setStep("connected");
      setMessage("LinkedIn session captured from the automation browser.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not capture session");
    } finally {
      setLoading(false);
    }
  }

  async function connectWithCookie() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${baseUrl}/linkedin/connectCookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          liAt: liAt.trim(),
          email: email || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Could not save cookie",
        );
      }
      setAuthorized(true);
      setConnectedEmail(email || null);
      setStep("connected");
      setLiAt("");
      setMessage("LinkedIn session saved from cookie.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save cookie");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`${baseUrl}/linkedin/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await fetch(`${baseUrl}/linkedin/closeBrowser`, { method: "POST" });
      setAuthorized(false);
      setConnectedEmail(null);
      setStep("idle");
      setMessage("LinkedIn disconnected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <MaterialIcon name="work" className="text-primary" />
        </div>
        <div>
          <h2 className="text-headline-md text-on-surface">LinkedIn enrichment</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Connect a LinkedIn session so research can scrape profile details and
            re-score fit with Gemini. Requires Chrome on the agent machine.
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-error/20 bg-error-container/10 px-4 py-3 text-body-sm text-error/90"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-3 text-body-sm text-on-surface">
          {message}
        </p>
      ) : null}

      <div className="mb-6 rounded-xl border border-white/10 bg-surface-container-lowest/40 px-4 py-3">
        <p className="font-mono text-label-mono text-on-surface-variant uppercase">
          Status
        </p>
        <p className="mt-1 text-body-base text-on-surface">
          {authorized
            ? `Connected${connectedEmail ? ` as ${connectedEmail}` : ""}`
            : "Not connected"}
        </p>
      </div>

      {authorized || step === "connected" ? (
        <Button
          variant="ghost"
          onClick={() => void disconnect()}
          disabled={loading || !userId}
        >
          Disconnect LinkedIn
        </Button>
      ) : (
        <div className="space-y-4">
          {step === "idle" || step === "starting" ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => void startBrowser()}
                disabled={loading || !userId}
                className="shadow-glow-primary"
              >
                {loading ? "Starting Chrome..." : "Connect LinkedIn"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => void captureSession()}
                disabled={loading || !userId}
              >
                I already signed in — capture session
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCookieForm((current) => !current)}
                disabled={loading || !userId}
              >
                Use li_at cookie
              </Button>
            </div>
          ) : null}

          {showCookieForm && step !== "otp" ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-surface-container-lowest/40 p-4">
              <p className="text-body-sm text-on-surface-variant">
                Signed in to LinkedIn in your own browser? Copy the{" "}
                <span className="font-mono text-on-surface">li_at</span> cookie
                (DevTools → Application → Cookies → linkedin.com) and paste it here.
              </p>
              <Input
                value={liAt}
                onChange={(e) => setLiAt(e.target.value)}
                disabled={loading}
                placeholder="li_at cookie value"
              />
              <Button
                variant="primary"
                onClick={() => void connectWithCookie()}
                disabled={loading || !liAt.trim()}
              >
                {loading ? "Saving..." : "Save LinkedIn session"}
              </Button>
            </div>
          ) : null}

          {step === "credentials" || step === "otp" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-mono text-label-mono text-on-surface-variant uppercase">
                  LinkedIn email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || step === "otp"}
                  placeholder="you@company.com"
                />
              </div>
              {step === "credentials" ? (
                <>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-mono text-label-mono text-on-surface-variant uppercase">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 sm:col-span-2">
                    <Button
                      variant="primary"
                      onClick={() => void submitLogin()}
                      disabled={loading || !email || !password}
                    >
                      {loading ? "Signing in..." : "Sign in to LinkedIn"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void captureSession()}
                      disabled={loading}
                    >
                      I signed in manually — capture session
                    </Button>
                  </div>
                </>
              ) : null}
              {step === "otp" ? (
                <>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-mono text-label-mono text-on-surface-variant uppercase">
                      Verification code
                    </label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={loading}
                      placeholder="6-digit code"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => void submitOtp()}
                    disabled={loading || !otp.trim()}
                  >
                    {loading ? "Submitting..." : "Submit OTP"}
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
}
