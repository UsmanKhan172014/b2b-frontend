import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export interface AdminContext {
  user: User;
}

/**
 * Who is calling, and are they an active admin? The role is read from `user_profiles`, which the browser
 * cannot write (row-level security, no write policy). It is never taken from `user_metadata`, which every
 * signed-in user can edit.
 */
export async function getCaller(): Promise<{ user: User | null; isAdmin: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = !error && data?.role === "admin" && data?.is_active !== false;
  return { user, isAdmin };
}

/** For route handlers: the admin, or a ready-made 401/403 status to return. */
export async function requireAdmin(): Promise<
  { ok: true; admin: AdminContext } | { ok: false; status: 401 | 403 }
> {
  const { user, isAdmin } = await getCaller();
  if (!user) return { ok: false, status: 401 };
  if (!isAdmin) return { ok: false, status: 403 };
  return { ok: true, admin: { user } };
}
