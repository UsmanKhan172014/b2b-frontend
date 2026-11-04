"use client";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard, Input } from "@/components/ui";
import {
  applyCampaignLeadFilters,
  getCampaignFilterCategories,
  type CampaignAudienceFilters,
  type CampaignLead,
  type ResearchSessionOption,
} from "@/lib/campaigns/filterLeads";
import { leadHasEmail } from "@/lib/campaigns/mapLeadToEmailVariables";
import { cn } from "@/lib/cn";

interface CampaignTargetingStepProps {
  leads: CampaignLead[];
  researchSessions: ResearchSessionOption[];
  filters: CampaignAudienceFilters;
  selectedLeadIds: string[];
  estimatedReach: number;
  audienceTags: string[];
  onFiltersChange: (filters: CampaignAudienceFilters) => void;
  onToggleLead: (leadId: string) => void;
  onSelectFilteredWithEmail: () => void;
  onClearSelection: () => void;
}

const FIT_SCORE_OPTIONS = [
  { value: 0, label: "Any fit score" },
  { value: 50, label: "50+" },
  { value: 70, label: "70+" },
  { value: 85, label: "85+" },
];

export function CampaignTargetingStep({
  leads,
  researchSessions,
  filters,
  selectedLeadIds,
  estimatedReach,
  audienceTags,
  onFiltersChange,
  onToggleLead,
  onSelectFilteredWithEmail,
  onClearSelection,
}: CampaignTargetingStepProps) {
  const { industries, companies } = getCampaignFilterCategories(leads);
  const filteredLeads = applyCampaignLeadFilters(leads, filters);
  const filteredWithEmail = filteredLeads.filter(leadHasEmail);

  function updateFilter<K extends keyof CampaignAudienceFilters>(
    key: K,
    value: CampaignAudienceFilters[K],
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard radius="section" className="flex flex-col p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="person_search" className="text-primary" />
            Select Audience
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onSelectFilteredWithEmail}>
              Select filtered
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="font-mono text-label-mono uppercase text-on-surface-variant">
              Research session
            </span>
            <select
              value={filters.sessionId}
              onChange={(event) => updateFilter("sessionId", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">All research sessions</option>
              {researchSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.label} ({session.leadCount})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-label-mono uppercase text-on-surface-variant">
              Title / role
            </span>
            <select
              value={filters.industry}
              onChange={(event) => updateFilter("industry", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">All titles</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-label-mono uppercase text-on-surface-variant">
              Company
            </span>
            <select
              value={filters.company}
              onChange={(event) => updateFilter("company", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">All companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-label-mono uppercase text-on-surface-variant">
              Min fit score
            </span>
            <select
              value={filters.minFitScore}
              onChange={(event) =>
                updateFilter("minFitScore", Number(event.target.value))
              }
              className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
            >
              {FIT_SCORE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="font-mono text-label-mono uppercase text-on-surface-variant">
              Search
            </span>
            <Input
              value={filters.search}
              placeholder="Name, company, email, rationale..."
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={filters.emailOnly}
              onChange={(event) => updateFilter("emailOnly", event.target.checked)}
            />
            <span className="text-body-sm text-on-surface-variant">
              Only show leads with email
            </span>
          </label>
        </div>

        <p className="mb-4 text-body-sm text-on-surface-variant">
          Showing {filteredLeads.length} of {leads.length} leads
          {filters.emailOnly ? ` (${filteredWithEmail.length} with email)` : ""}.
        </p>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {leads.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-surface/30 p-4 text-body-sm text-on-surface-variant">
              No research leads found. Run a research session first, then return here to
              build a campaign.
            </p>
          ) : null}

          {filteredLeads.length === 0 && leads.length > 0 ? (
            <p className="rounded-lg border border-white/10 bg-surface/30 p-4 text-body-sm text-on-surface-variant">
              No leads match the current filters. Try clearing a category filter.
            </p>
          ) : null}

          {filteredLeads.map((lead) => {
            const hasEmail = leadHasEmail(lead);
            const isSelected = selectedLeadIds.includes(lead.id);
            const email = lead.contactEmail || lead.companyEmail || "No email";
            const sessionLabel = researchSessions.find(
              (session) => session.id === lead.sessionId,
            )?.label;

            return (
              <label
                key={lead.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-white/10 bg-surface/20 hover:bg-surface/30",
                  !hasEmail && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!hasEmail}
                  className="mt-1"
                  onChange={() => onToggleLead(lead.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-body-sm font-medium text-on-surface">
                      {lead.contactName || lead.companyName}
                    </p>
                    <span className="font-mono text-label-mono text-secondary">
                      {lead.fitScore}
                    </span>
                  </div>
                  <p className="truncate text-body-sm text-on-surface-variant">
                    {lead.contactTitle || lead.industry} · {lead.size}
                  </p>
                  <p className="truncate text-body-sm text-on-surface-variant/80">{email}</p>
                  {sessionLabel ? (
                    <p className="mt-1 truncate text-label-sm text-on-surface-variant/70">
                      {sessionLabel}
                    </p>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard radius="section" className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <p className="font-mono text-label-mono uppercase text-on-surface-variant">
          Preview
        </p>
        <div className="flex flex-wrap gap-2">
          {audienceTags.length > 0 ? (
            audienceTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-surface-variant px-3 py-1 font-mono text-label-mono text-on-surface-variant"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-body-sm text-on-surface-variant">
              Select leads to preview audience tags.
            </span>
          )}
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <MaterialIcon name="groups" className="text-primary" />
          <div>
            <p className="text-body-sm text-on-surface-variant">Selected Recipients</p>
            <p className="text-headline-md text-on-surface">
              {estimatedReach.toLocaleString()} contacts
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
