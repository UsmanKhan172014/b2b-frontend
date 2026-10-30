import type { CampaignDraft } from "./types";

/**
 * Mock campaign draft for the builder UI. Replace with Supabase fetch in Phase 2.
 */
export const MOCK_CAMPAIGN_DRAFT: CampaignDraft = {
  id: "campaign-draft-001",
  name: "Q3 SaaS Executive Outreach",
  audienceTags: ["SaaS Executives", "Series A+", "US & CAN"],
  estimatedReach: 14250,
  objective: "demo",
  tone: 75,
  channels: {
    email: true,
    linkedin: false,
  },
  emailSteps: [
    {
      id: "email-1",
      dayLabel: "Day 1",
      stepLabel: "Initial Outreach",
      subject: "Quick question about {{Company Name}}'s growth strategy",
      body: `Hi {{First Name}},

Noticed that {{Company Name}} recently expanded its operations. With that kind of growth, managing outbound lead generation usually becomes a bottleneck.

We've helped companies similar to yours automate this process, resulting in a 40% increase in qualified demos booked within the first month.

Are you open to a brief chat next Tuesday to see if this aligns with your current priorities?`,
    },
    {
      id: "email-2",
      dayLabel: "Day 4",
      stepLabel: "Value Add Follow-up",
      subject: "Re: Quick question about {{Company Name}}'s growth strategy",
      isFollowUp: true,
    },
  ],
};

export const CAMPAIGN_OBJECTIVES = [
  { value: "demo" as const, label: "Book a Demo" },
  { value: "webinar" as const, label: "Webinar Registration" },
  { value: "newsletter" as const, label: "Newsletter Signup" },
];

export function toneLabel(tone: number): string {
  if (tone < 34) return "Casual";
  if (tone < 67) return "Professional";
  return "Formal";
}
