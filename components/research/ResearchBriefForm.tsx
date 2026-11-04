"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import {
  ExampleBriefsPanel,
  type ExampleBrief,
} from "@/components/research/ExampleBriefsPanel";
import {
  FieldError,
  FieldHint,
  FieldLabel,
} from "@/components/research/ResearchFormFields";
import { Textarea } from "@/components/ui";
import { createResearchSession } from "@/lib/queries";
import {
  getUserResearchUsage,
  isResearchLimitError,
  limitMessage,
  PLAN_LABELS,
  type ResearchUsage,
} from "@/lib/research/usageLimits";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const DEFAULT_ROLES = [
  "Owner",
  "CEO",
  "General Manager",
  "Procurement Manager",
] as const;

const CONTACT_CHANNELS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

export interface ResearchBriefPayload {
  offer: string;
  targetLocation: string;
  leadGoal: number;
  decisionMakerRoles: string[];
  requiredContactFields: string[];
  researchDepth: "basic" | "medium" | "advanced";
  buyingSignals?: string;
  enrichLinkedin?: boolean;
  userId?: string;
  /** Companies this user already received in earlier runs; the backend never returns them again. */
  excludeCompanies?: string[];
}

interface FormErrors {
  offer?: string;
  targetLocation?: string;
  leadGoal?: string;
  decisionMakerRoles?: string;
  requiredContactFields?: string;
}

// Keep in step with MAX_LEAD_GOAL on the backend.
const MAX_LEAD_GOAL = 25;

function validateForm(values: ResearchBriefPayload, maxLeads: number): FormErrors {
  const errors: FormErrors = {};

  if (!values.offer.trim()) {
    errors.offer = "Describe what you sell or offer.";
  }

  if (!values.targetLocation.trim()) {
    errors.targetLocation = "Add a target city, country, or region.";
  }

  if (!Number.isInteger(values.leadGoal) || values.leadGoal < 1 || values.leadGoal > maxLeads) {
    errors.leadGoal = `Lead goal must be between 1 and ${maxLeads}.`;
  }

  if (values.decisionMakerRoles.length === 0) {
    errors.decisionMakerRoles = "Select at least one decision-maker role.";
  }

  if (values.requiredContactFields.length === 0) {
    errors.requiredContactFields = "Select at least one contact channel.";
  }

  return errors;
}

/**
 * Universal research brief form — any product, any market.
 */
export function ResearchBriefForm() {
  const router = useRouter();
  const [offer, setOffer] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [requestedGoal, setLeadGoal] = useState(10);
  const [decisionMakerRoles, setDecisionMakerRoles] = useState<string[]>([
    ...DEFAULT_ROLES,
  ]);
  const [roleInput, setRoleInput] = useState("");
  const [requiredContactFields, setRequiredContactFields] = useState<string[]>([
    "email",
    "phone",
    "linkedin",
  ]);
  const [researchDepth, setResearchDepth] = useState<"basic" | "medium" | "advanced">(
    "medium",
  );
  const [buyingSignals, setBuyingSignals] = useState("");
  const [enrichLinkedin] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [usage, setUsage] = useState<ResearchUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUsage() {
      setUsageLoading(true);
      try {
        const nextUsage = await getUserResearchUsage(createClient());
        if (!cancelled) setUsage(nextUsage);
      } catch {
        if (!cancelled) setUsage(null);
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    }

    void loadUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  const researchBlocked = usage !== null && !usage.canStart;
  // the plan decides how many leads one run may ask for (demo 5, standard 25, never more than what is left this month)
  const maxLeads = usage?.canStart ? Math.max(1, Math.min(MAX_LEAD_GOAL, usage.allowedNow)) : MAX_LEAD_GOAL;

  // never ask for more than the plan allows, whatever was typed or loaded from an example
  const leadGoal = Number.isFinite(requestedGoal) ? Math.min(requestedGoal, maxLeads) : requestedGoal;

  function toggleContactField(field: string) {
    setRequiredContactFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );
    setErrors((current) => ({ ...current, requiredContactFields: undefined }));
  }

  function addRole(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!decisionMakerRoles.includes(trimmed)) {
      setDecisionMakerRoles((current) => [...current, trimmed]);
    }
    setRoleInput("");
    setErrors((current) => ({ ...current, decisionMakerRoles: undefined }));
  }

  function removeRole(role: string) {
    setDecisionMakerRoles((current) => current.filter((item) => item !== role));
  }

  function applyExampleBrief(brief: ExampleBrief) {
    setOffer(brief.offer);
    setTargetLocation(brief.targetLocation);
    setLeadGoal(Math.min(brief.leadGoal, maxLeads));
    setDecisionMakerRoles(brief.decisionMakerRoles);
    setRequiredContactFields(brief.requiredContactFields);
    setResearchDepth(brief.researchDepth);
    setBuyingSignals(brief.buyingSignals);
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ResearchBriefPayload = {
      offer: offer.trim(),
      targetLocation: targetLocation.trim(),
      leadGoal,
      decisionMakerRoles,
      requiredContactFields,
      researchDepth,
      buyingSignals: buyingSignals.trim() || undefined,
      enrichLinkedin,
    };

    const nextErrors = validateForm(payload, maxLeads);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=%2Fresearch%2Fnew");
        setSubmitting(false);
        return;
      }

      const session = await createResearchSession(supabase, {
        userId: user.id,
        brief: {
          ...payload,
          userId: user.id,
        } as unknown as Record<string, unknown>,
        status: "running",
      });

      router.push(`/research/${session.id}/progress`);
    } catch (error) {
      if (isResearchLimitError(error)) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "You have reached your plan limit.",
        );
        try {
          setUsage(await getUserResearchUsage(createClient()));
        } catch {
          // keep the message already shown
        }
      } else {
        setSubmitError("Unable to start research. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col items-start gap-8 xl:flex-row">
      <div className="glass-card-main glow-border relative w-full flex-1 overflow-hidden rounded-2xl p-6 backdrop-blur-2xl sm:p-8 md:p-10">
        <div className="pointer-events-none absolute top-0 right-0 size-64 rounded-full bg-primary/5 blur-[80px]" />

        <div className="relative mb-6 sm:mb-8">
          <h2 className="mb-2 text-headline-md text-on-surface">
            Define Research Parameters
          </h2>
          <p className="max-w-2xl text-body-base text-on-surface-variant">
            Multi-agent pipeline: domain prompt polish, company discovery,
            decision-maker search, then contact enrichment.
          </p>
        </div>

        {!usageLoading && usage ? (
          <div
            className={cn(
              "relative z-10 mb-6 rounded-xl border px-4 py-3 text-body-sm sm:px-5 sm:py-4",
              researchBlocked
                ? "border-error/30 bg-error-container/10 text-error/90"
                : "border-secondary/30 bg-secondary/10 text-on-surface",
            )}
          >
            <div className="flex items-start gap-3">
              <MaterialIcon
                name={researchBlocked ? "block" : "info"}
                className={cn(
                  "mt-0.5 shrink-0 text-lg",
                  researchBlocked ? "text-error" : "text-secondary",
                )}
              />
              <div>
                <p className="font-medium">
                  {PLAN_LABELS[usage.planType]} plan
                  {usage.runLimit !== null
                    ? ` — ${usage.runsRemaining ?? 0} of ${usage.runLimit} free ${usage.runLimit === 1 ? "run" : "runs"} left, up to ${usage.maxLeadsPerRun} leads`
                    : usage.monthlyLimit !== null
                      ? ` — ${usage.monthlyRemaining ?? 0} of ${usage.monthlyLimit} leads left`
                      : ""}
                </p>
                <p className="mt-1 text-on-surface-variant">
                  {researchBlocked
                    ? limitMessage(usage)
                    : usage.runLimit === null && usage.monthlyLimit !== null
                      ? "Only the leads a run delivers count toward your quota."
                      : "Only the leads a run delivers count toward your plan."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form
          className="relative z-10 space-y-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel htmlFor="offer" icon="inventory_2">
                What do you sell or offer?
              </FieldLabel>
              <Textarea
                id="offer"
                name="offer"
                rows={2}
                value={offer}
                onChange={(e) => {
                  setOffer(e.target.value);
                  setErrors((current) => ({ ...current, offer: undefined }));
                }}
                placeholder="e.g., marketing and growth services for banks, B2B software outsourcing, industrial packaging..."
                className={errors.offer ? "border-error/50" : undefined}
                aria-invalid={Boolean(errors.offer)}
              />
              <FieldError message={errors.offer} />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="targetLocation" icon="public">
                Target market
              </FieldLabel>
              <input
                id="targetLocation"
                name="targetLocation"
                value={targetLocation}
                onChange={(e) => {
                  setTargetLocation(e.target.value);
                  setErrors((current) => ({
                    ...current,
                    targetLocation: undefined,
                  }));
                }}
                placeholder="e.g., Dubai, UAE"
                className={cn(
                  "w-full rounded-lg border bg-surface-container-lowest px-4 py-3 text-body-base text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50",
                  errors.targetLocation
                    ? "border-error/50"
                    : "border-outline-variant/50",
                )}
              />
              <FieldError message={errors.targetLocation} />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="leadGoal" icon="groups">
                How many people to find
              </FieldLabel>
              <input
                id="leadGoal"
                name="leadGoal"
                type="number"
                min={1}
                max={maxLeads}
                value={Number.isNaN(leadGoal) ? "" : leadGoal}
                onChange={(e) => {
                  setLeadGoal(e.target.value === "" ? Number.NaN : Number(e.target.value));
                  setErrors((current) => ({ ...current, leadGoal: undefined }));
                }}
                className={cn(
                  "w-full rounded-lg border bg-surface-container-lowest px-4 py-3 text-body-base text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50",
                  errors.leadGoal ? "border-error/50" : "border-outline-variant/50",
                )}
                aria-invalid={Boolean(errors.leadGoal)}
              />
              <FieldError message={errors.leadGoal} />
              <p className="text-label-sm text-on-surface-variant/70">
                Only high-quality leads are kept; you may get fewer than requested.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel icon="badge">Decision-maker roles</FieldLabel>
            <div
              className={cn(
                "flex min-h-14 flex-wrap items-center gap-2 rounded-xl border bg-surface-container-lowest/50 p-3",
                errors.decisionMakerRoles
                  ? "border-error/50"
                  : "border-outline-variant/30",
              )}
            >
              {decisionMakerRoles.map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-surface-container px-3 py-1.5"
                >
                  <span className="text-body-sm text-on-surface">{role}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="text-on-surface-variant transition-colors hover:text-error"
                    aria-label={`Remove ${role}`}
                  >
                    <MaterialIcon name="close" className="text-sm" />
                  </button>
                </div>
              ))}
              <input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addRole(roleInput);
                  }
                }}
                onBlur={() => addRole(roleInput)}
                placeholder="Add roles (Owner, CEO, Manager...)"
                className="min-w-[120px] flex-1 border-none bg-transparent text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none"
              />
            </div>
            <FieldError message={errors.decisionMakerRoles} />
          </div>

          <div className="space-y-2">
            <FieldLabel icon="contact_mail">Contact channels needed</FieldLabel>
            <div className="flex flex-wrap gap-2 pt-1">
              {CONTACT_CHANNELS.map((channel) => {
                const selected = requiredContactFields.includes(channel.value);
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => toggleContactField(channel.value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-body-sm transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-glow-primary-sm"
                        : "border-white/10 bg-surface-container-low text-on-surface-variant hover:border-primary/50 hover:text-on-surface",
                    )}
                    aria-pressed={selected}
                  >
                    {channel.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.requiredContactFields} />
          </div>

          <div className="space-y-2">
            <FieldLabel icon="tune">Research depth</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setResearchDepth("basic")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-body-sm transition-all",
                  researchDepth === "basic"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-surface-container-low text-on-surface-variant",
                )}
                aria-pressed={researchDepth === "basic"}
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => setResearchDepth("medium")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-body-sm transition-all",
                  researchDepth === "medium"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-surface-container-low text-on-surface-variant",
                )}
                aria-pressed={researchDepth === "medium"}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setResearchDepth("advanced")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-body-sm transition-all",
                  researchDepth === "advanced"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-white/10 bg-surface-container-low text-on-surface-variant",
                )}
                aria-pressed={researchDepth === "advanced"}
              >
                Advanced
              </button>
            </div>
            <FieldHint>
              Accuracy over volume. Advanced runs deepest search and double contact
              enrichment. Only contacts with a named person plus email or phone are saved.
            </FieldHint>
          </div>

          {/* "LinkedIn enrichment" option hidden for now (needs the Settings → LinkedIn connection). */}

          <div className="space-y-2">
            <FieldLabel icon="radar">Additional context (optional)</FieldLabel>
            <Textarea
              id="buyingSignals"
              name="buyingSignals"
              rows={3}
              value={buyingSignals}
              onChange={(e) => setBuyingSignals(e.target.value)}
              placeholder="e.g., include new hotel openings, prefer companies with public contact pages..."
            />
          </div>

          <hr className="my-8 border-t border-white/5" />

          {submitError ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-error/20 bg-error-container/10 px-4 py-3 text-body-sm text-error/90"
            >
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              className="px-4 py-2 text-body-base text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={submitting || researchBlocked}
              className="group relative overflow-hidden rounded-xl px-6 py-4 shadow-glow-secondary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px] hover:shadow-secondary/40 disabled:opacity-70 sm:px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-inverse-primary via-primary to-secondary opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2 text-base font-semibold text-canvas">
                {submitting ? (
                  <>
                    <MaterialIcon
                      name="progress_activity"
                      className="animate-spin text-lg"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="rocket_launch" filled />
                    Start Research
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>

      <ExampleBriefsPanel onSelect={applyExampleBrief} />
    </div>
  );
}
