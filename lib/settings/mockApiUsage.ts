import type { ApiUsagePoint } from "./types";

/**
 * Mock API usage series for the settings chart. Replace with a Supabase or
 * analytics query without changing the chart component.
 */
export const MOCK_API_USAGE_DATA: ApiUsagePoint[] = [
  { label: "Jun 7", sessions: 3200 },
  { label: "Jun 10", sessions: 4100 },
  { label: "Jun 13", sessions: 3800 },
  { label: "Jun 16", sessions: 5200 },
  { label: "Jun 19", sessions: 4900 },
  { label: "Jun 22", sessions: 6100 },
  { label: "Jun 25", sessions: 5800 },
  { label: "Jun 28", sessions: 7200 },
  { label: "Jul 1", sessions: 6800 },
  { label: "Jul 4", sessions: 8100 },
  { label: "Jul 6", sessions: 7600 },
];

export const MOCK_API_KEY = "ls_prod_8f92j3k4l5m6n7o8p9q0";
