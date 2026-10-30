import type { ResearchBriefPayload } from "@/components/research/ResearchBriefForm";

export type ResearchStreamEventType =
  | "stage_start"
  | "stage_update"
  | "stage_complete"
  | "final_result"
  | "error";

export interface ResearchStreamEvent {
  type: ResearchStreamEventType;
  stageId?: string;
  label?: string;
  message?: string;
  progressPercent?: number;
  data?: Record<string, unknown>;
}

export interface ScoredContactPayload {
  full_name: string;
  title: string;
  company_name: string;
  company_website: string;
  company_city: string;
  company_country: string;
  email: string;
  email_status: string;
  phone: string;
  phone_status: string;
  whatsapp: string;
  whatsapp_status: string;
  linkedin_url: string;
  linkedin_status: string;
  contact_page_url: string;
  source_snippet: string;
  source_urls: string[];
  contact_confidence: string;
  fit_score: number;
  rationale: string;
  contact_type?: string;
  company_email?: string;
  company_phone?: string;
  email_source_url?: string;
  phone_source_url?: string;
  resolution_channel?: string;
  company_group_id?: string;
  is_primary_contact?: boolean;
  contact_rank?: number;
}

export interface ScoredLeadPayload {
  company_name: string;
  website: string;
  industry: string;
  size_estimate: string;
  region: string;
  signal: string;
  confidence_score: number;
  source_urls: string[];
  contact_name?: string;
  contact_title?: string;
  contact_linkedin?: string;
  fit_score: number;
  rationale: string;
}

export interface ResearchFinalResultPayload {
  brief: Record<string, unknown>;
  interaction_id?: string | null;
  research_report?: string;
  contacts?: ScoredContactPayload[];
  queries: string[];
  raw_candidate_count: number;
  leads: ScoredLeadPayload[];
  metadata?: Record<string, unknown>;
}

export class ResearchStreamError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ResearchStreamError";
    this.status = status;
  }
}

function parseSsePayload(line: string): ResearchStreamEvent | null {
  try {
    return JSON.parse(line) as ResearchStreamEvent;
  } catch {
    console.warn("Skipping malformed SSE frame");
    return null;
  }
}

/** Max wait for the initial HTTP response before treating the agent as unreachable. */
const STREAM_CONNECT_TIMEOUT_MS = 45_000;

/** Max wait for the first SSE event after headers arrive (Deep Research can be slow to start). */
const STREAM_FIRST_EVENT_TIMEOUT_MS = 120_000;

/**
 * POST-based SSE consumer (EventSource is GET-only).
 */
export async function* streamResearchPipeline(
  url: string,
  brief: ResearchBriefPayload,
  signal?: AbortSignal,
): AsyncGenerator<ResearchStreamEvent> {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }

  const connectController = new AbortController();
  const onParentAbort = () => connectController.abort();
  signal?.addEventListener("abort", onParentAbort);

  const connectTimeout = setTimeout(() => {
    connectController.abort();
  }, STREAM_CONNECT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(brief),
      signal: connectController.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (connectController.signal.aborted && !signal?.aborted) {
      throw new ResearchStreamError(
        "Could not reach the research agent within 45s. Ensure the backend is running on port 8000 and not stuck reloading, then retry.",
        0,
      );
    }
    throw error;
  } finally {
    clearTimeout(connectTimeout);
    signal?.removeEventListener("abort", onParentAbort);
  }

  if (!response.ok) {
    try {
      await response.text();
    } catch {
      // Ignore body read failures.
    }
    throw new ResearchStreamError(
      `Research stream request failed (${response.status}).`,
      response.status,
    );
  }

  if (!response.body) {
    throw new ResearchStreamError("Research stream returned an empty body.", 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedEvent = false;

  const cancelReader = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", cancelReader);

  const firstEventTimeout = setTimeout(() => {
    if (!receivedEvent) {
      cancelReader();
    }
  }, STREAM_FIRST_EVENT_TIMEOUT_MS);

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const dataLine = frame
          .split("\n")
          .find((line) => line.startsWith("data: "));

        if (!dataLine) continue;

        const payload = parseSsePayload(dataLine.slice(6));
        if (!payload) continue;

        if (!receivedEvent) {
          receivedEvent = true;
          clearTimeout(firstEventTimeout);
        }

        yield payload;

        if (payload.type === "error") {
          return;
        }
      }
    }

    if (!receivedEvent) {
      throw new ResearchStreamError(
        "Research agent connected but sent no progress events. The Gemini call may be stuck — retry in a moment.",
        504,
      );
    }

    if (buffer.trim()) {
      const dataLine = buffer
        .split("\n")
        .find((line) => line.startsWith("data: "));
      if (dataLine) {
        const payload = parseSsePayload(dataLine.slice(6));
        if (payload) yield payload;
      }
    }
  } finally {
    clearTimeout(firstEventTimeout);
    signal?.removeEventListener("abort", cancelReader);
    reader.releaseLock();
  }
}