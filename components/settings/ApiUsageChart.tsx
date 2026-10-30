"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ApiUsagePoint } from "@/lib/settings/types";

interface ApiUsageChartProps {
  data: ApiUsagePoint[];
}

const MONO_FONT = "var(--font-jetbrains-mono), monospace";
const AXIS_COLOR = "#c7c4d7";
const GRID_COLOR = "rgba(255,255,255,0.08)";

interface TooltipPayload {
  value: number;
  payload: ApiUsagePoint;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0];

  return (
    <div className="rounded-lg border border-white/10 bg-surface-container-high/95 px-3 py-2 shadow-elevated backdrop-blur-panel">
      <p className="font-mono text-label-mono text-on-surface-variant">
        {point.payload.label}
      </p>
      <p className="mt-1 font-mono text-sm font-bold text-primary">
        {point.value.toLocaleString()} sessions
      </p>
    </div>
  );
}

export function ApiUsageChart({ data }: ApiUsageChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="usageLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c0c1ff" />
              <stop offset="100%" stopColor="#4cd7f6" />
            </linearGradient>
            <linearGradient id="usageAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c0c1ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#c0c1ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={GRID_COLOR}
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{
              fill: AXIS_COLOR,
              fontSize: 11,
              fontFamily: MONO_FONT,
            }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            dy={8}
          />

          <YAxis
            tick={{
              fill: AXIS_COLOR,
              fontSize: 11,
              fontFamily: MONO_FONT,
            }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
            }
            width={36}
          />

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(192,193,255,0.2)" }} />

          <Area
            type="monotone"
            dataKey="sessions"
            stroke="url(#usageLineGradient)"
            strokeWidth={2}
            fill="url(#usageAreaGradient)"
            activeDot={{
              r: 4,
              fill: "#4cd7f6",
              stroke: "#c0c1ff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
