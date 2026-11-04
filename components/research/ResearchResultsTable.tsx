"use client";

import { motion } from "framer-motion";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { FitScoreBadge } from "@/components/research/FitScoreBadge";
import { leadHasEmail } from "@/lib/campaigns/mapLeadToEmailVariables";
import type { ResearchLead } from "@/lib/research/types";
import { cn } from "@/lib/cn";

interface ResearchResultsTableProps {
  leads: ResearchLead[];
  totalCount: number;
  isLoading?: boolean;
  selectedLeadId: string | null;
  selectedCampaignLeadIds?: string[];
  onToggleCampaignLead?: (leadId: string) => void;
  onViewLead: (leadId: string) => void;
}

export function ResearchResultsTable({
  leads,
  totalCount,
  isLoading = false,
  selectedLeadId,
  selectedCampaignLeadIds = [],
  onToggleCampaignLead,
  onViewLead,
}: ResearchResultsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg border border-white/5 bg-surface-container-low/50"
          />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
        <MaterialIcon
          name={totalCount === 0 ? "hourglass_empty" : "search_off"}
          className="text-4xl text-on-surface-variant/50"
        />
        <p className="text-body-sm text-on-surface-variant">
          {totalCount === 0
            ? "No contacts stored for this session yet. Results will appear when the research completes."
            : "No contacts match your current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="hidden grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-label-mono text-on-surface-variant uppercase sm:grid sm:gap-4 sm:px-6">
        {onToggleCampaignLead ? <div className="col-span-1">Pick</div> : null}
        <div className={onToggleCampaignLead ? "col-span-3" : "col-span-3"}>Name</div>
        <div className="col-span-2">Title</div>
        <div className="col-span-2">Company</div>
        <div className="col-span-2">Email / Phone</div>
        <div className="col-span-2 text-center">Fit</div>
        <div className="col-span-1" />
      </div>

      {leads.map((lead, index) => {
        const isSelected = lead.id === selectedLeadId;
        const isCampaignSelected = selectedCampaignLeadIds.includes(lead.id);
        const hasEmail = leadHasEmail(lead);

        return (
          <motion.div
            key={lead.id}
            role="row"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            className={cn(
              "group grid cursor-pointer grid-cols-12 items-center gap-2 border-b border-white/5 px-4 py-4 transition-colors sm:gap-4 sm:px-6",
              isSelected && "bg-primary/5",
            )}
            onClick={() => onViewLead(lead.id)}
          >
            {onToggleCampaignLead ? (
              <div className="col-span-2 sm:col-span-1">
                <input
                  type="checkbox"
                  checked={isCampaignSelected}
                  disabled={!hasEmail}
                  aria-label={`Select ${lead.contactName ?? lead.companyName} for campaign`}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleCampaignLead(lead.id)}
                />
              </div>
            ) : null}

            <div
              className={cn(
                "col-span-12 flex items-center gap-3 sm:col-span-3",
                onToggleCampaignLead && "sm:col-span-3",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded border bg-surface-container",
                  isSelected
                    ? "border-primary/30 text-primary"
                    : "border-white/10 text-on-surface-variant",
                )}
              >
                <MaterialIcon name={lead.icon} className="text-base" />
              </div>
              <span
                className={cn(
                  "truncate text-body-base text-on-surface",
                  isSelected ? "font-semibold" : "font-medium",
                )}
              >
                {lead.contactName ?? lead.companyName}
              </span>
              {lead.additionalContactCount ? (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-label-sm text-primary"
                  title={`${lead.additionalContactCount} more named decision-maker${lead.additionalContactCount === 1 ? "" : "s"} found at ${lead.companyName}`}
                >
                  <MaterialIcon name="group" className="text-sm" />
                  +{lead.additionalContactCount}
                </span>
              ) : null}
            </div>

            <div className="col-span-6 truncate text-body-sm text-on-surface-variant sm:col-span-2">
              {lead.contactTitle ?? lead.industry}
            </div>

            <div className="col-span-6 truncate text-body-sm text-on-surface-variant sm:col-span-2">
              {lead.size}
            </div>

            <div className="col-span-6 truncate text-body-sm text-on-surface-variant sm:col-span-2">
              {lead.contactEmail ??
                lead.contactPhone ??
                lead.companyEmail ??
                lead.companyPhone ??
                "—"}
            </div>

            <div className="col-span-4 flex justify-start sm:col-span-2 sm:justify-center">
              <FitScoreBadge score={lead.fitScore} />
            </div>

            <div className="col-span-4 text-right sm:col-span-1">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center text-primary transition-colors hover:text-secondary",
                  !isSelected && "opacity-0 group-hover:opacity-100",
                )}
                aria-label={`View ${lead.companyName}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewLead(lead.id);
                }}
              >
                <MaterialIcon name="chevron_right" className="text-xl" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
