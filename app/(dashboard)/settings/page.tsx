import { SettingsView } from "@/components/settings/SettingsView";
import { parseUserProfile } from "@/lib/settings/parseUserProfile";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? parseUserProfile(user)
    : {
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "Lead AI Researcher",
      };

  return <SettingsView profile={profile} />;
}
