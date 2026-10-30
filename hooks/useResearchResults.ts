"use client";

import { useCallback, useMemo, useState } from "react";

import { exportLeadsToCsv, exportLeadsToXlsx } from "@/lib/research/exportCsv";
import type {
  ResearchLead,
  ResearchResultsFilters,
  ResearchResultsSort,
  SortField,
} from "@/lib/research/types";

export interface UseResearchResultsReturn {
  leads: ResearchLead[];
  totalCount: number;
  filteredCount: number;
  filters: ResearchResultsFilters;
  sort: ResearchResultsSort;
  industries: string[];
  sizes: string[];
  selectedLeadId: string | null;
  selectedLead: ResearchLead | null;
  selectedLeadAdditionalContacts: ResearchLead[];
  isLoading: boolean;
  setSearch: (search: string) => void;
  setIndustryFilter: (industry: string) => void;
  setSizeFilter: (size: string) => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;
  selectLead: (leadId: string) => void;
  clearSelection: () => void;
  exportCsv: () => void;
  exportXlsx: () => void;
}

const DEFAULT_FILTERS: ResearchResultsFilters = {
  search: "",
  industry: "",
  size: "",
};

const DEFAULT_SORT: ResearchResultsSort = {
  field: "fitScore",
  direction: "desc",
};

function compareLeads(
  a: ResearchLead,
  b: ResearchLead,
  sort: ResearchResultsSort,
): number {
  const direction = sort.direction === "asc" ? 1 : -1;

  switch (sort.field) {
    case "fitScore":
      return (a.fitScore - b.fitScore) * direction;
    case "companyName":
    case "contactName":
      return (a.contactName ?? a.companyName).localeCompare(
        b.contactName ?? b.companyName,
      ) * direction;
    case "industry":
      return a.industry.localeCompare(b.industry) * direction;
    case "size":
      return a.size.localeCompare(b.size) * direction;
    default:
      return 0;
  }
}

function applyFilters(
  leads: ResearchLead[],
  filters: ResearchResultsFilters,
): ResearchLead[] {
  const query = filters.search.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.size && lead.size !== filters.size) return false;
    if (!query) return true;

    return (
      lead.companyName.toLowerCase().includes(query) ||
      (lead.contactName?.toLowerCase().includes(query) ?? false) ||
      (lead.contactEmail?.toLowerCase().includes(query) ?? false) ||
      (lead.contactPhone?.toLowerCase().includes(query) ?? false) ||
      (lead.companyEmail?.toLowerCase().includes(query) ?? false) ||
      (lead.companyPhone?.toLowerCase().includes(query) ?? false) ||
      lead.website.toLowerCase().includes(query) ||
      lead.industry.toLowerCase().includes(query) ||
      lead.size.toLowerCase().includes(query)
    );
  });
}

/**
 * Research results state provider. Initial leads come from Supabase via the page;
 * client-side filter/sort/export stay local.
 */
export function useResearchResults(
  _sessionId: string,
  initialLeads: ResearchLead[] = [],
): UseResearchResultsReturn {
  const [filters, setFilters] = useState<ResearchResultsFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<ResearchResultsSort>(DEFAULT_SORT);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const sourceLeads = initialLeads;
  const isLoading = false;

  const isPrimary = useCallback(
    (lead: ResearchLead) => lead.isPrimaryContact !== false,
    [],
  );

  const groupKey = useCallback(
    (lead: ResearchLead) => lead.companyGroupId ?? lead.companyName,
    [],
  );

  const primaryLeads = useMemo(
    () => sourceLeads.filter(isPrimary),
    [sourceLeads, isPrimary],
  );

  const additionalContactsByGroup = useMemo(() => {
    const map = new Map<string, ResearchLead[]>();
    for (const lead of sourceLeads) {
      if (isPrimary(lead)) continue;
      const key = groupKey(lead);
      const existing = map.get(key) ?? [];
      existing.push(lead);
      map.set(key, existing);
    }
    return map;
  }, [sourceLeads, isPrimary, groupKey]);

  const industries = useMemo(
    () => [...new Set(primaryLeads.map((lead) => lead.industry))].sort(),
    [primaryLeads],
  );

  const sizes = useMemo(
    () => [...new Set(primaryLeads.map((lead) => lead.size))].sort(),
    [primaryLeads],
  );

  const leads = useMemo(() => {
    const filtered = applyFilters(primaryLeads, filters);
    const sorted = [...filtered].sort((a, b) => compareLeads(a, b, sort));
    return sorted.map((lead) => ({
      ...lead,
      additionalContactCount: additionalContactsByGroup.get(groupKey(lead))?.length ?? 0,
    }));
  }, [primaryLeads, filters, sort, additionalContactsByGroup, groupKey]);

  const selectedLead = useMemo(
    () => sourceLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [sourceLeads, selectedLeadId],
  );

  const selectedLeadAdditionalContacts = useMemo(() => {
    if (!selectedLead) return [];
    return additionalContactsByGroup.get(groupKey(selectedLead)) ?? [];
  }, [selectedLead, additionalContactsByGroup, groupKey]);

  const setSearch = useCallback((search: string) => {
    setFilters((current) => ({ ...current, search }));
  }, []);

  const setIndustryFilter = useCallback((industry: string) => {
    setFilters((current) => ({ ...current, industry }));
  }, []);

  const setSizeFilter = useCallback((size: string) => {
    setFilters((current) => ({ ...current, size }));
  }, []);

  const setSortField = useCallback((field: SortField) => {
    setSort((current) => ({
      field,
      direction: current.field === field && current.direction === "desc" ? "asc" : "desc",
    }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSort((current) => ({
      ...current,
      direction: current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const selectLead = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLeadId(null);
  }, []);

  const exportCsv = useCallback(() => {
    exportLeadsToCsv(sourceLeads);
  }, [sourceLeads]);

  const exportXlsx = useCallback(() => {
    exportLeadsToXlsx(sourceLeads);
  }, [sourceLeads]);

  return {
    leads,
    totalCount: primaryLeads.length,
    filteredCount: leads.length,
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
    toggleSortDirection,
    selectLead,
    clearSelection,
    exportCsv,
    exportXlsx,
  };
}