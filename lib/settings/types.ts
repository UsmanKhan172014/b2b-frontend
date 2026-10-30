export type SettingsTabId = "profile" | "api" | "billing";

export interface SettingsUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

export interface ApiUsagePoint {
  label: string;
  sessions: number;
}
