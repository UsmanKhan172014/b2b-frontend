import type { User } from "@supabase/supabase-js";

import type { SettingsUserProfile } from "./types";

/**
 * Maps a Supabase Auth user into the settings profile shape used by the UI.
 */
export function parseUserProfile(user: User): SettingsUserProfile {
  const fullName = String(
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
  ).trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return {
    id: user.id,
    email: user.email ?? "",
    firstName,
    lastName,
    role: String(user.user_metadata?.role ?? "Lead AI Researcher"),
    avatarUrl: user.user_metadata?.avatar_url as string | undefined,
  };
}
