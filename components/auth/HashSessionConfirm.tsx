"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthShared";
import { createClient } from "@/lib/supabase/client";

/**
 * Finishes a reset / invitation link that Supabase sent in its default form: the session arrives in the URL
 * fragment (#access_token=...&refresh_token=...), which only the browser can see. It is stored as the
 * signed-in session and the person is sent on to choose a password.
 */
export function HashSessionConfirm({ next }: { next: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return; // React strict mode runs effects twice in development
    started.current = true;

    // Read the fragment before anything else (including creating the client) can touch it.
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    window.history.replaceState(null, "", window.location.pathname + window.location.search); // drop tokens from the address bar

    const invalid = () => {
      setFailed(true);
      router.replace("/login?error=link_invalid");
    };

    if (params.get("error") || !accessToken || !refreshToken || (type !== "recovery" && type !== "invite")) {
      invalid();
      return;
    }

    createClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) invalid();
        else router.replace(type === "invite" && next === "/reset-password" ? "/reset-password?invited=1" : next);
      })
      .catch(invalid);
  }, [next, router]);

  return (
    <AuthCard>
      <AuthHeader
        title="Checking your link"
        subtitle={failed ? "This link is not valid. Redirecting…" : "One moment while we verify your link."}
        variant="signup"
      />
    </AuthCard>
  );
}
