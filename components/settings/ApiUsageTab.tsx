"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { ApiUsageChart } from "@/components/settings/ApiUsageChart";
import { GlassCard } from "@/components/ui";
import { MOCK_API_KEY, MOCK_API_USAGE_DATA } from "@/lib/settings/mockApiUsage";

export function ApiUsageTab() {
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSessions = MOCK_API_USAGE_DATA.reduce(
    (sum, point) => sum + point.sessions,
    0,
  );

  async function handleCopyKey() {
    try {
      await navigator.clipboard.writeText(MOCK_API_KEY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <GlassCard radius="section" className="p-6 sm:p-8 lg:col-span-2">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
            <MaterialIcon name="monitoring" className="text-secondary" />
            Research Sessions
          </h3>
          <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-surface-container px-3 py-1 font-mono text-label-mono text-on-surface-variant">
            Last 30 Days
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-6">
          <div>
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Total sessions
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">
              {totalSessions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Daily peak
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-on-surface">
              {Math.max(...MOCK_API_USAGE_DATA.map((point) => point.sessions)).toLocaleString()}
            </p>
          </div>
        </div>

        <ApiUsageChart data={MOCK_API_USAGE_DATA} />
      </GlassCard>

      <GlassCard radius="section" className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <h3 className="mb-2 text-headline-md text-on-surface">API Key</h3>
          <p className="mb-6 text-body-sm text-on-surface-variant">
            Use this key to authenticate requests to the LeadScope AI engine.
          </p>

          <div className="mb-6 space-y-2">
            <label className="font-mono text-label-mono uppercase text-on-surface-variant">
              Production Key
            </label>
            <div className="flex">
              <input
                type={keyVisible ? "text" : "password"}
                value={MOCK_API_KEY}
                readOnly
                className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-sm text-on-surface focus:outline-none"
              />
              <button
                type="button"
                className="flex items-center justify-center rounded-r-lg border border-white/10 bg-surface-container px-4 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
                aria-label={keyVisible ? "Hide API key" : "Show API key"}
                onClick={() => setKeyVisible((visible) => !visible)}
              >
                <MaterialIcon
                  name={keyVisible ? "visibility_off" : "visibility"}
                  className="text-xl"
                />
              </button>
              <button
                type="button"
                className="ml-2 flex items-center justify-center rounded-lg border border-white/10 bg-surface-container px-4 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
                aria-label="Copy API key"
                onClick={handleCopyKey}
              >
                <MaterialIcon name="content_copy" className="text-xl" />
              </button>
            </div>
            {copied ? (
              <p className="font-mono text-label-mono text-secondary">Copied to clipboard</p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-error/50 py-3 text-body-sm text-error transition-colors hover:bg-error/10"
        >
          <MaterialIcon name="refresh" className="text-lg" />
          Roll API Key
        </button>
      </GlassCard>
    </div>
  );
}
