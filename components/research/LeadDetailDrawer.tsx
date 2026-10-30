"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button } from "@/components/ui";
import type { ConfidenceLevel, ResearchLead } from "@/lib/research/types";
import { linkedinStatusLabel } from "@/lib/research/mapLeadRow";
import { normalizeWebsiteUrl } from "@/lib/research/urls";
import { cn } from "@/lib/cn";

interface LeadDetailDrawerProps {
  lead: ResearchLead | null;
  additionalContacts?: ResearchLead[];
  onClose: () => void;
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: "High Confidence Match",
  strong: "Strong Match",
  moderate: "Moderate Match",
};

function contactTypeLabel(value?: string): string {
  switch (value) {
    case "corporate":
      return "Corporate office";
    case "sales":
      return "Sales office";
    case "role":
      return "Role inbox";
    case "general":
      return "General line";
    case "person":
      return "Direct person";
    default:
      return value ? value.replace(/_/g, " ") : "Contact";
  }
}

const signalIconTone: Record<NonNullable<ResearchLead["signals"][0]["iconTone"]>, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};

function FitScoreGauge({ score }: { score: number }) {
  const strokeDasharray = `${score}, 100`;

  return (
    <div className="relative flex size-16 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
        <path
          className="text-surface-container-high"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray="100, 100"
          strokeWidth="3"
        />
        <path
          className="text-primary"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          strokeWidth="3"
          style={{ filter: "drop-shadow(0 0 4px rgba(192,193,255,0.6))" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-on-surface">
        {score}%
      </span>
    </div>
  );
}

export function LeadDetailDrawer({
  lead,
  additionalContacts = [],
  onClose,
}: LeadDetailDrawerProps) {
  return (
    <AnimatePresence>
      {lead ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-canvas/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close lead details"
            onClick={onClose}
          />

          <motion.aside
            className={cn(
              "fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden",
              "border-l border-white/10 bg-surface-container-highest/80 shadow-elevated backdrop-blur-panel",
              "lg:static lg:z-auto lg:h-full lg:max-w-none lg:w-96 lg:shrink-0 lg:rounded-xl lg:border lg:border-white/15",
            )}
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <button
              type="button"
              className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full border border-white/10 bg-surface-container/50 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              aria-label="Close"
              onClick={onClose}
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>

            <div className="flex-1 overflow-y-auto pb-6">
              <div className="relative border-b border-white/10 p-6">
                <div className="absolute top-6 left-6 size-16 rounded-full bg-primary/20 blur-xl" />
                <div className="relative mb-4 flex size-16 items-center justify-center rounded-xl border border-white/10 bg-surface shadow-lg">
                  <MaterialIcon name={lead.icon} className="text-[32px] text-primary" />
                </div>
                <h3 className="text-headline-md text-on-surface">
                  {lead.contactName ?? lead.companyName}
                </h3>
                {lead.size ? (
                  <p className="mt-1 mb-4 text-body-sm text-on-surface-variant">
                    {lead.size}
                    {lead.contactTitle || lead.industry
                      ? ` · ${lead.contactTitle ?? lead.industry}`
                      : ""}
                  </p>
                ) : null}
                {lead.website ? (
                  <div className="mt-1 mb-4 flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <MaterialIcon name="link" className="text-base" />
                    <a
                      href={normalizeWebsiteUrl(lead.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-primary"
                    >
                      {lead.website}
                    </a>
                  </div>
                ) : (
                  <p className="mt-1 mb-4 text-body-sm text-on-surface-variant/70">
                    Website not verified
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-mono text-label-mono text-secondary shadow-glow-secondary-sm">
                  <MaterialIcon name="verified" className="text-sm" />
                  {confidenceLabels[lead.confidenceLevel]}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h4 className="text-body-sm font-semibold text-on-surface">AI Fit Score</h4>
                  <p className="text-xs text-on-surface-variant">Based on ICP parameters</p>
                </div>
                <FitScoreGauge score={lead.fitScore} />
              </div>

              {lead.summary ? (
                <div className="border-b border-white/10 p-6">
                  <h4 className="mb-2 font-mono text-label-mono uppercase text-on-surface-variant">
                    AI Summary
                  </h4>
                  <p className="text-body-sm leading-relaxed text-on-surface-variant">
                    {lead.summary}
                  </p>
                </div>
              ) : null}

              {lead.contactName || lead.contactTitle || lead.contactLinkedin || lead.contactEmail || lead.contactPhone || lead.companyEmail || lead.companyPhone ? (
                <div className="border-b border-white/10 p-6">
                  <h4 className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-on-surface">
                    <MaterialIcon name="person" className="text-lg text-secondary" />
                    Contact Details
                  </h4>
                  {lead.contactType ? (
                    <span className="mb-3 inline-flex rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-label-sm text-primary">
                      {contactTypeLabel(lead.contactType)}
                    </span>
                  ) : null}
                  {lead.contactName ? (
                    <p className="text-body-sm font-medium text-on-surface">{lead.contactName}</p>
                  ) : null}
                  {lead.contactTitle ? (
                    <p className="mt-1 text-body-sm text-on-surface-variant">{lead.contactTitle}</p>
                  ) : null}
                  {lead.size ? (
                    <p className="mt-1 text-body-sm text-on-surface-variant">{lead.size}</p>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-2">
                    {lead.contactEmail ? (
                      <div>
                        <a
                          href={`mailto:${lead.contactEmail}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface-variant transition-colors hover:bg-white/10"
                        >
                          <MaterialIcon name="mail" className="text-base" />
                          {lead.contactEmail}
                        </a>
                        {lead.emailSourceUrl ? (
                          <a
                            href={lead.emailSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block text-xs text-primary hover:underline"
                          >
                            View email source
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant/60">
                        Person email not found in public sources
                      </p>
                    )}
                    {lead.contactPhone ? (
                      <div>
                        <a
                          href={`tel:${lead.contactPhone}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface-variant transition-colors hover:bg-white/10"
                        >
                          <MaterialIcon name="phone" className="text-base" />
                          {lead.contactPhone}
                        </a>
                        {lead.phoneSourceUrl ? (
                          <a
                            href={lead.phoneSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block text-xs text-primary hover:underline"
                          >
                            View phone source
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant/60">
                        Person phone not found in public sources
                      </p>
                    )}
                    {lead.companyEmail || lead.companyPhone ? (
                      <div className="mt-2 rounded-lg border border-white/10 bg-surface-container/40 p-3">
                        <p className="mb-2 text-label-sm font-semibold uppercase text-on-surface-variant">
                          Company contact
                        </p>
                        {lead.companyEmail ? (
                          <a
                            href={`mailto:${lead.companyEmail}`}
                            className="mb-2 inline-flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary"
                          >
                            <MaterialIcon name="business" className="text-base" />
                            {lead.companyEmail}
                          </a>
                        ) : null}
                        {lead.companyPhone ? (
                          <a
                            href={`tel:${lead.companyPhone}`}
                            className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary"
                          >
                            <MaterialIcon name="call" className="text-base" />
                            {lead.companyPhone}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {lead.contactWhatsapp ? (
                      <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface-variant">
                        <MaterialIcon name="chat" className="text-base" />
                        {lead.contactWhatsapp}
                      </span>
                    ) : null}
                    {lead.contactLinkedin ? (
                      <div>
                        <a
                          href={lead.contactLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface-variant transition-colors hover:bg-white/10"
                        >
                          <MaterialIcon name="work" className="text-base" />
                          LinkedIn Profile
                        </a>
                        {linkedinStatusLabel(lead.linkedinStatus) ? (
                          <span className="mt-1 block text-xs text-on-surface-variant/70">
                            {linkedinStatusLabel(lead.linkedinStatus)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {additionalContacts.length > 0 ? (
                <div className="border-b border-white/10 p-6">
                  <h4 className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-on-surface">
                    <MaterialIcon name="group" className="text-lg text-secondary" />
                    Other decision-makers at {lead.companyName}
                  </h4>
                  <ul className="space-y-3">
                    {additionalContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="rounded-lg border border-white/10 bg-surface-container/40 p-3"
                      >
                        <p className="text-body-sm font-medium text-on-surface">
                          {contact.contactName ?? "Unnamed contact"}
                        </p>
                        {contact.contactTitle ? (
                          <p className="mt-0.5 text-body-sm text-on-surface-variant">
                            {contact.contactTitle}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {contact.contactEmail ? (
                            <a
                              href={`mailto:${contact.contactEmail}`}
                              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface-container px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-white/10"
                            >
                              <MaterialIcon name="mail" className="text-sm" />
                              {contact.contactEmail}
                            </a>
                          ) : null}
                          {contact.contactPhone ? (
                            <a
                              href={`tel:${contact.contactPhone}`}
                              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface-container px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-white/10"
                            >
                              <MaterialIcon name="phone" className="text-sm" />
                              {contact.contactPhone}
                            </a>
                          ) : null}
                          {contact.contactLinkedin ? (
                            <a
                              href={contact.contactLinkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface-container px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-white/10"
                            >
                              <MaterialIcon name="work" className="text-sm" />
                              LinkedIn
                            </a>
                          ) : null}
                          {!contact.contactEmail && !contact.contactPhone ? (
                            <span className="text-xs text-on-surface-variant/60">
                              No public email or phone found yet
                            </span>
                          ) : null}
                        </div>
                        {linkedinStatusLabel(contact.linkedinStatus) ? (
                          <span className="mt-1.5 block text-xs text-on-surface-variant/70">
                            {linkedinStatusLabel(contact.linkedinStatus)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="border-b border-white/10 p-6">
                <h4 className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-on-surface">
                  <MaterialIcon name="radar" className="text-lg text-primary" />
                  Research Signals
                </h4>
                <ul className="space-y-4">
                  {lead.signals.map((signal) => (
                    <li key={signal.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-container">
                        <MaterialIcon
                          name={signal.icon}
                          className={cn(
                            "text-sm",
                            signal.iconTone
                              ? signalIconTone[signal.iconTone]
                              : "text-on-surface-variant",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-body-sm text-on-surface">{signal.title}</p>
                        <p className="mt-1 font-mono text-label-mono text-on-surface-variant">
                          {signal.source}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6">
                <h4 className="mb-3 text-body-sm font-semibold text-on-surface">Quick Links</h4>
                {lead.sourceLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.sourceLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container px-3 py-1.5 text-[13px] text-on-surface-variant transition-colors hover:bg-white/10"
                      >
                        <MaterialIcon name={link.icon} className="text-base" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant/70">
                    No direct source links available for this lead.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 bg-surface/50 p-4 backdrop-blur-md">
              <Link href="/campaigns/new" className="block">
                <Button fullWidth className="shadow-glow-primary-sm">
                  <MaterialIcon name="add_circle" className="text-lg" />
                  Add to Campaign
                </Button>
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}