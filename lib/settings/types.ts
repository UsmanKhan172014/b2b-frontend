export type SettingsTabId = "profile" | "plan" | "security" | "linkedin";

export interface SettingsUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Job title the person typed in. It is a label only: it never grants any access. */
  role: string;
  avatarUrl?: string;
}
