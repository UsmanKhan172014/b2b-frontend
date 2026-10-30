"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ResearchBriefPayload } from "@/components/research/ResearchBriefForm";
import { getAgentStreamUrl } from "@/lib/env";
import {
  getLeadsForSession,
  replaceLeadsForSession,
  updateResearchSessionStatus,
} from "@/lib/queries";
import {
  type ResearchFinalResultPayload,
  ResearchStreamError,
  streamResearchPipeline,
} from "@/lib/research/streamClient";
import { sanitizeSourceUrls } from "@/lib/research/urls";
import { createClient } from "@/lib/supabase/client";

export type StageStatus = "pending" | "active" | "done";

export type ProgressConnectionState =
  | "idle"
  | "connecting"
  | "streaming"
  | "persisting"
  | "complete"
  | "error";

export type ProgressErrorReason =
  | "connection"
  | "quota"
  | "pipeline"
  | "no_contacts"
  | "persist"
  | "session";

export interface ResearchStage {
  id: string;
  label: string;
  status: StageStatus;
  elapsedSeconds?: number;
}

export interface ResearchProgressState {
  stages: ResearchStage[];
  activeStageId: string | null;
  isComplete: boolean;
  progressPercent: number;
  activeLogs: string[];
  connectionState: ProgressConnectionState;
  errorReason: ProgressErrorReason | null;
  retry: () => void;
  cancel: () => void;
}

const STAGE_DEFINITIONS = [
  { id: "planning", label: "Discovering market and planning research" },
  { id: "discovering", label: "Finding buyer companies" },
  { id: "person_search", label: "Finding decision-makers" },
  { id: "enriching", label: "Getting emails and phone numbers" },
  { id: "finalizing", label: "Finalizing actionable contacts" },
] as const;

const STAGE_INDEX: Record<string, number> = Object.fromEntries(
  STAGE_DEFINITIONS.map((stage, index) => [stage.id, index]),
);

function createInitialStages(): ResearchStage[] {
  return STAGE_DEFINITIONS.map((stage) => ({
    id: stage.id,
    label: stage.label,
    status: "pending",
  }));
}

function applyStageStart(stages: ResearchStage[], stageId: string): ResearchStage[] {
  const targetIndex = STAGE_INDEX[stageId];
  if (targetIndex === undefined) return stages;

  return stages.map((stage, index) => {
    if (index < targetIndex) return { ...stage, status: "done" as const };
    if (index === targetIndex) return { ...stage, status: "active" as const };
    return { ...stage, status: "pending" as const };
  });
}

function applyStageComplete(
  stages: ResearchStage[],
  stageId: string,
  elapsedSeconds?: number,
): ResearchStage[] {
  return stages.map((stage) =>
    stage.id === stageId
      ? { ...stage, status: "done" as const, elapsedSeconds }
      : stage,
  );
}

function markAllStagesDone(stages: ResearchStage[]): ResearchStage[] {
  return stages.map((stage) => ({ ...stage, status: "done" as const }));
}

function isResearchBriefPayload(value: unknown): value is ResearchBriefPayload {
  if (!value || typeof value !== "object") return false;
  const brief = value as Record<string, unknown>;
  if (typeof brief.offer === "string" && typeof brief.targetLocation === "string") {
    return brief.offer.length > 0 && brief.targetLocation.length > 0;
  }
  return (
    typeof brief.industry === "string" &&
    Array.isArray(brief.companySizes) &&
    Array.isArray(brief.regions) &&
    typeof brief.buyingSignals === "string"
  );
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("linkedin.com") || trimmed.startsWith("http")) {
    return false;
  }
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7;
}

function isActionableContact(row: {
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  is_primary_contact?: boolean | null;
  full_name?: string;
  email?: string;
  phone?: string;
  company_email_field?: string;
  company_phone_field?: string;
}): boolean {
  const name = (row.contact_name ?? row.full_name ?? "").trim();
  const email = (row.contact_email ?? row.email ?? "").trim();
  const phone = (row.contact_phone ?? row.phone ?? "").trim();
  const companyEmail = (row.company_email ?? row.company_email_field ?? "").trim();
  const companyPhone = (row.company_phone ?? row.company_phone_field ?? "").trim();
  if (name.length <= 2) return false;

  // Additional decision-makers (typically sourced from a company's own team
  // page) are still worth keeping even without a direct email/phone yet —
  // unlike a random web-search guess, a named person from the company's own
  // site is real, useful context. Only the primary contact per company must
  // clear the full actionable bar (name + a real email or phone).
  if (row.is_primary_contact === false) return true;

  return (
    isValidEmail(email) ||
    isValidPhone(phone) ||
    isValidEmail(companyEmail) ||
    isValidPhone(companyPhone)
  );
}

function sanitizeContactEmail(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return isValidEmail(trimmed) ? trimmed : null;
}

function sanitizeContactPhone(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return isValidPhone(trimmed) ? trimmed : null;
}

function extractFromSignalText(signal: string | null | undefined): {
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
} {
  if (!signal?.trim()) return {};

  const emailMatch = signal.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  );
  const phoneMatch = signal.match(
    /(?:\+971[\s-]?|0)?(?:5[0-9]{8}|[2-9][0-9]{7,8})|\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
  );
  const nameMatch = signal.match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){1,3})\s+is\s+(?:the|a|an|identified|confirmed)/,
  );

  return {
    contact_name: nameMatch?.[1],
    contact_email: sanitizeContactEmail(emailMatch?.[0]) ?? undefined,
    contact_phone: sanitizeContactPhone(phoneMatch?.[0]) ?? undefined,
  };
}

function mapContactsForInsert(
  result: ResearchFinalResultPayload,
): import("@/lib/queries").InsertLeadInput[] {
  const contacts = result.contacts ?? [];
  const mapped =
    contacts.length > 0
      ? contacts.map((contact) => {
          const fromSignal = extractFromSignalText(
            contact.source_snippet || contact.rationale,
          );
          return {
            company_name: contact.company_name || contact.full_name,
            website: contact.company_website ?? "",
            industry: contact.title ?? "",
            size_estimate: contact.company_city ?? "",
            region: contact.company_country ?? "",
            signal: contact.source_snippet || contact.rationale,
            confidence_score: contact.fit_score,
            source_urls: sanitizeSourceUrls(contact.source_urls ?? []),
            contact_name: contact.full_name || fromSignal.contact_name || null,
            contact_title: contact.title ?? null,
            contact_linkedin: contact.linkedin_url ?? null,
            contact_email:
              sanitizeContactEmail(contact.email || fromSignal.contact_email) ??
              null,
            contact_phone:
              sanitizeContactPhone(contact.phone || fromSignal.contact_phone) ??
              null,
            contact_whatsapp: contact.whatsapp ?? null,
            contact_confidence: contact.contact_confidence ?? null,
            rationale: contact.rationale ?? null,
            contact_page_url: contact.contact_page_url ?? null,
            contact_type: contact.contact_type ?? null,
            company_email: sanitizeContactEmail(contact.company_email) ?? null,
            company_phone: sanitizeContactPhone(contact.company_phone) ?? null,
            email_source_url: contact.email_source_url ?? null,
            phone_source_url: contact.phone_source_url ?? null,
            resolution_channel: contact.resolution_channel ?? null,
            company_group_id: contact.company_group_id ?? null,
            is_primary_contact: contact.is_primary_contact ?? true,
            contact_rank: contact.contact_rank ?? 1,
            linkedin_status: contact.linkedin_status ?? null,
          };
        })
      : (result.leads ?? []).map((lead) => {
          const fromSignal = extractFromSignalText(lead.signal ?? lead.rationale);
          return {
            company_name: lead.company_name,
            website: lead.website,
            industry: lead.industry,
            size_estimate: lead.size_estimate,
            region: lead.region,
            signal: lead.signal,
            confidence_score: lead.fit_score,
            source_urls: sanitizeSourceUrls(lead.source_urls ?? []),
            contact_name: lead.contact_name ?? fromSignal.contact_name ?? null,
            contact_title: lead.contact_title ?? null,
            contact_linkedin: lead.contact_linkedin ?? null,
            contact_email: sanitizeContactEmail(fromSignal.contact_email),
            contact_phone: sanitizeContactPhone(fromSignal.contact_phone),
            company_email: sanitizeContactEmail(fromSignal.contact_email),
            company_phone: sanitizeContactPhone(fromSignal.contact_phone),
            rationale: lead.rationale ?? null,
            is_primary_contact: true,
            contact_rank: 1,
          };
        });

  return mapped.filter((row) =>
    isActionableContact({
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      company_email: row.company_email,
      company_phone: row.company_phone,
      is_primary_contact: row.is_primary_contact,
    }),
  );
}

async function persistSessionMetadata(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  result: ResearchFinalResultPayload,
): Promise<void> {
  const metadata = result.metadata ?? {};
  const costEstimate = metadata.cost_estimate;
  const pipelineMetadata: Record<string, unknown> = {
    research_depth: metadata.research_depth,
    scored_contact_count: metadata.scored_contact_count,
    lead_goal: metadata.lead_goal,
    minimum_contacts: metadata.minimum_contacts,
    minimum_met: metadata.minimum_met,
  };
  if (costEstimate && typeof costEstimate === "object") {
    pipelineMetadata.cost_estimate = costEstimate;
  }

  const { error } = await supabase
    .from("research_sessions")
    .update({
      interaction_id: result.interaction_id ?? null,
      research_report: result.research_report ?? null,
      pipeline_metadata: pipelineMetadata,
    })
    .eq("id", sessionId);

  if (error) throw error;
}

function isQuotaError(event: {
  message?: string;
  data?: Record<string, unknown>;
}): boolean {
  const category = String(event.data?.errorCategory ?? "");
  if (category === "quota") return true;

  const errorType = String(event.data?.errorType ?? "");
  const message = event.message ?? "";
  return (
    errorType.includes("ResourceExhausted") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("429")
  );
}

/**
 * Research progress via SSE from the agent service, with Supabase persistence on completion.
 */
export function useResearchProgress(sessionId: string): ResearchProgressState {
  const router = useRouter();
  const [stages, setStages] = useState<ResearchStage[]>(createInitialStages);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [connectionState, setConnectionState] =
    useState<ProgressConnectionState>("idle");
  const [errorReason, setErrorReason] = useState<ProgressErrorReason | null>(
    null,
  );
  const [retryNonce, setRetryNonce] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const hasFinishedRef = useRef(false);
  const streamGenerationRef = useRef(0);
  const pendingLeadsRef = useRef<ResearchFinalResultPayload | null>(null);

  const activeStage = stages.find((stage) => stage.status === "active") ?? null;
  const isComplete = connectionState === "complete";

  const persistPendingLeads = useCallback(async () => {
    const result = pendingLeadsRef.current;
    if (!result) return false;

    setConnectionState("persisting");
    setErrorReason(null);

    try {
      const supabase = createClient();
      const leads = mapContactsForInsert(result);
      if (leads.length === 0) {
        setErrorReason("no_contacts");
        setConnectionState("error");
        return false;
      }
      await replaceLeadsForSession(supabase, sessionId, leads);
      await persistSessionMetadata(supabase, sessionId, result);
      await updateResearchSessionStatus(supabase, sessionId, "completed");
      pendingLeadsRef.current = null;
      hasFinishedRef.current = true;
      setConnectionState("complete");
      router.push(`/research/${sessionId}/results`);
      return true;
    } catch (persistError) {
      console.error(
        "Failed to persist research leads:",
        persistError instanceof Error
          ? persistError.message
          : JSON.stringify(persistError, null, 2),
      );
      setErrorReason("persist");
      setConnectionState("error");
      return false;
    }
  }, [router, sessionId]);

  const retry = useCallback(() => {
    if (hasFinishedRef.current) return;

    if (errorReason === "session") {
      router.push("/dashboard");
      return;
    }

    if (errorReason === "persist" && pendingLeadsRef.current) {
      void persistPendingLeads();
      return;
    }

    abortRef.current?.abort();
    hasFinishedRef.current = false;
    setStages(createInitialStages());
    setActiveLogs([]);
    setProgressPercent(0);
    setConnectionState("idle");
    setErrorReason(null);
    setRetryNonce((value) => value + 1);
  }, [errorReason, persistPendingLeads, router]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    hasFinishedRef.current = true;
    streamGenerationRef.current += 1;

    void (async () => {
      try {
        const supabase = createClient();
        await updateResearchSessionStatus(supabase, sessionId, "failed");
      } catch {
        // Best-effort.
      }
    })();

    router.push("/dashboard");
  }, [router, sessionId]);

  useEffect(() => {
    let cancelled = false;
    const generation = ++streamGenerationRef.current;

    async function runStream() {
      if (hasFinishedRef.current) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setConnectionState("connecting");
      setStages(createInitialStages());
      setActiveLogs([]);
      setProgressPercent(0);
      setErrorReason(null);

      try {
        const supabase = createClient();
        const { data: sessionRow, error: sessionError } = await supabase
          .from("research_sessions")
          .select("brief, status")
          .eq("id", sessionId)
          .single();

        if (sessionError || !sessionRow) {
          setErrorReason("session");
          setConnectionState("error");
          return;
        }

        if (sessionRow.status === "completed") {
          const existingLeads = await getLeadsForSession(supabase, sessionId);
          if (!cancelled && generation === streamGenerationRef.current) {
            hasFinishedRef.current = true;
            router.replace(`/research/${sessionId}/results`);
          }
          return;
        }

        if (sessionRow.status === "failed" && retryNonce === 0) {
          setErrorReason("pipeline");
          setConnectionState("error");
          return;
        }

        if (!isResearchBriefPayload(sessionRow.brief)) {
          setErrorReason("session");
          setConnectionState("error");
          return;
        }

        if (retryNonce > 0) {
          await updateResearchSessionStatus(supabase, sessionId, "running");
        }

        const brief = sessionRow.brief;
        setConnectionState("streaming");

        for await (const event of streamResearchPipeline(
          getAgentStreamUrl(),
          brief,
          controller.signal,
        )) {
          if (cancelled || generation !== streamGenerationRef.current) return;

          if (typeof event.progressPercent === "number") {
            setProgressPercent(event.progressPercent);
          }

          switch (event.type) {
            case "stage_start":
              if (event.stageId) {
                setStages((current) => applyStageStart(current, event.stageId!));
              }
              break;

            case "stage_update":
              if (
                (event.stageId === "planning" ||
                  event.stageId === "discovering" ||
                  event.stageId === "person_search" ||
                  event.stageId === "enriching") &&
                event.message
              ) {
                setActiveLogs((current) => {
                  const next = event.message!.trim();
                  if (!next || current.includes(next)) return current;
                  return [...current.slice(-24), next];
                });
              }
              break;

            case "stage_complete":
              if (event.stageId) {
                const elapsed =
                  typeof event.data?.elapsedSeconds === "number"
                    ? event.data.elapsedSeconds
                    : undefined;
                setStages((current) =>
                  applyStageComplete(current, event.stageId!, elapsed),
                );
              }
              break;

            case "final_result": {
              hasFinishedRef.current = true;
              setStages(markAllStagesDone);
              setProgressPercent(100);
              setConnectionState("persisting");

              const result = event.data as ResearchFinalResultPayload | undefined;
              if (!result) {
                setErrorReason("pipeline");
                setConnectionState("error");
                return;
              }
              pendingLeadsRef.current = result;
              const leads = mapContactsForInsert(result);

              if (leads.length === 0) {
                setErrorReason("no_contacts");
                setConnectionState("error");
                await updateResearchSessionStatus(supabase, sessionId, "failed");
                return;
              }

              try {
                await replaceLeadsForSession(supabase, sessionId, leads);
                await persistSessionMetadata(supabase, sessionId, result);
                await updateResearchSessionStatus(
                  supabase,
                  sessionId,
                  "completed",
                );
                pendingLeadsRef.current = null;
              } catch (persistError) {
                console.error(
                  "Failed to persist research leads:",
                  persistError instanceof Error
                    ? persistError.message
                    : JSON.stringify(persistError, null, 2),
                );
                setErrorReason("persist");
                setConnectionState("error");
                return;
              }

              setConnectionState("complete");
              router.push(`/research/${sessionId}/results`);
              return;
            }

            case "error":
              console.error("Research pipeline error:", {
                stageId: event.stageId,
                errorType: event.data?.errorType,
                errorCategory: event.data?.errorCategory,
              });
              setErrorReason(isQuotaError(event) ? "quota" : "pipeline");
              setConnectionState("error");
              await updateResearchSessionStatus(supabase, sessionId, "failed");
              return;

            default:
              break;
          }
        }

        if (
          !hasFinishedRef.current &&
          !controller.signal.aborted &&
          generation === streamGenerationRef.current
        ) {
          throw new Error("Research stream ended unexpectedly.");
        }
      } catch (error) {
        if (controller.signal.aborted || cancelled) return;
        if (generation !== streamGenerationRef.current) return;

        console.error("Research progress stream failed:", error);
        hasFinishedRef.current = false;

        if (error instanceof ResearchStreamError && error.status === 503) {
          setErrorReason("pipeline");
        } else if (error instanceof ResearchStreamError && error.status === 422) {
          setErrorReason("session");
        } else {
          setErrorReason("connection");
        }

        try {
          const supabase = createClient();
          await updateResearchSessionStatus(supabase, sessionId, "failed");
        } catch {
          // Best-effort.
        }

        setConnectionState("error");
      }
    }

    runStream();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [sessionId, router, retryNonce]);

  return {
    stages,
    activeStageId: activeStage?.id ?? null,
    isComplete,
    progressPercent,
    activeLogs,
    connectionState,
    errorReason,
    retry,
    cancel,
  };
}