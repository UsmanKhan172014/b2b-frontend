"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard } from "@/components/ui";
import { LeadDetailDrawer } from "@/components/research/LeadDetailDrawer";
import { ResearchResultsTable } from "@/components/research/ResearchResultsTable";
import { useResearchResults } from "@/hooks/useResearchResults";
import type { ResearchLead, SortField } from "@/lib/research/types";
import { cn } from "@/lib/cn";

interface ResearchResultsViewProps {
  sessionId?: string;
  initialLeads: ResearchLead[];
  title?: string;
  subtitle?: string;
  estimatedCostUsd?: number | null;
  costNote?: string | null;
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "fitScore", label: "Fit Score" },
  { field: "contactName", label: "Name" },
  { field: "industry", label: "Title" },
  { field: "size", label: "Company" },
];

export function ResearchResultsView({
  sessionId = "",
  initialLeads,
  title = "Lead Finder Results",
  subtitle,
  estimatedCostUsd = null,
  costNote = null,
}: ResearchResultsViewProps) {
  const {
    leads,
    totalCount,
    filteredCount,
    filters,
    sort,
    industries,
    sizes,
    selectedLeadId,
    selectedLead,
    selectedLeadAdditionalContacts,
    isLoading,
    setSearch,
    setIndustryFilter,
    setSizeFilter,
    setSortField,
    selectLead,
    clearSelection,
    exportCsv,
    exportXlsx,
  } = useResearchResults(sessionId, initialLeads);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.field === sort.field)?.label ?? "Fit Score";

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-panel-gap lg:flex-row lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 flex shrink-0 flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-headline-md text-on-surface">
              <MaterialIcon name="data_table" className="text-primary" />
              {title}
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {subtitle ??
                `Showing ${filteredCount} of ${totalCount} ranked prospects based on ICP criteria`}
            </p>
            {typeof estimatedCostUsd === "number" ? (
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Estimated AI cost this run:{" "}
                <span className="font-medium text-on-surface">
                  ${estimatedCostUsd.toFixed(2)} USD
                </span>
                {costNote ? (
                  <span className="ml-1 text-label-sm text-on-surface-variant/80">
                    ({costNote})
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-variant sm:px-4",
                  filtersOpen && "border-primary/40 text-on-surface",
                )}
                onClick={() => {
                  setFiltersOpen((open) => !open);
                  setSortOpen(false);
                }}
              >
                <MaterialIcon name="filter_list" className="text-lg" />
                Filters
              </button>

              {filtersOpen ? (
                <div className="absolute top-full right-0 z-30 mt-2 w-72 rounded-xl border border-white/10 bg-surface-container-high p-4 shadow-elevated backdrop-blur-panel">
                  <label className="mb-3 block">
                    <span className="mb-1.5 block font-mono text-label-mono uppercase text-on-surface-variant">
                      Search
                    </span>
                    <input
                      type="search"
                      value={filters.search}
                      placeholder="Company or website..."
                      className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <label className="mb-3 block">
                    <span className="mb-1.5 block font-mono text-label-mono uppercase text-on-surface-variant">
                      Industry
                    </span>
                    <select
                      value={filters.industry}
                      className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                      onChange={(event) => setIndustryFilter(event.target.value)}
                    >
                      <option value="">All industries</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-label-mono uppercase text-on-surface-variant">
                      Company size
                    </span>
                    <select
                      value={filters.size}
                      className="w-full rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                      onChange={(event) => setSizeFilter(event.target.value)}
                    >
                      <option value="">All sizes</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-variant sm:px-4",
                  sortOpen && "border-primary/40 text-on-surface",
                )}
                onClick={() => {
                  setSortOpen((open) => !open);
                  setFiltersOpen(false);
                }}
              >
                <MaterialIcon name="sort" className="text-lg" />
                <span className="hidden sm:inline">Sort:</span> {activeSortLabel}
                <MaterialIcon
                  name={sort.direction === "desc" ? "arrow_downward" : "arrow_upward"}
                  className="text-sm"
                />
              </button>

              {sortOpen ? (
                <div className="absolute top-full right-0 z-30 mt-2 w-48 rounded-xl border border-white/10 bg-surface-container-high py-1 shadow-elevated backdrop-blur-panel">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.field}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-left text-body-sm transition-colors hover:bg-white/5",
                        sort.field === option.field
                          ? "text-primary"
                          : "text-on-surface-variant",
                      )}
                      onClick={() => {
                        setSortField(option.field);
                        setSortOpen(false);
                      }}
                    >
                      {option.label}
                      {sort.field === option.field ? (
                        <MaterialIcon
                          name={sort.direction === "desc" ? "arrow_downward" : "arrow_upward"}
                          className="text-sm"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <Button variant="ghost" size="sm" onClick={exportCsv}>
              <MaterialIcon name="download" className="text-lg" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={exportXlsx}>
              <MaterialIcon name="table" className="text-lg" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">XLS</span>
            </Button>
          </div>
        </div>

        <GlassCard
          radius="section"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border-white/10 bg-surface-container/60"
        >
          <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <ResearchResultsTable
            leads={leads}
            totalCount={totalCount}
            isLoading={isLoading}
            selectedLeadId={selectedLeadId}
            onViewLead={selectLead}
          />
        </GlassCard>
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        additionalContacts={selectedLeadAdditionalContacts}
        onClose={clearSelection}
      />
    </div>
  );
}