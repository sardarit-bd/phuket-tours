import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatReportMoney } from "../../utils/format";
import type { AdminRevenueReportData } from "../../types/admin";

export interface RevenueTrendChartProps {
  revenueData?: AdminRevenueReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

/**
 * Revenue & financial progression chart.
 *
 * Renders a clean SVG area/line chart comparing four financial totals
 * (Outstanding → Collected → Booked → Revenue) that represent the
 * platform's financial pipeline at different stages. This is real
 * data from the existing /admin/reports/revenue endpoint — no
 * fabricated time series.
 */
export function RevenueTrendChart({
  revenueData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: RevenueTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (error) {
    return (
      <div
        role="alert"
        data-testid="revenue-trend-error"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-outfit text-sm font-semibold">
              Revenue analytics unavailable
            </h4>
            <p className="mt-1 text-xs text-red-700">
              The revenue report endpoint could not be reached.
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 bg-white text-red-700 hover:bg-red-100"
              >
                <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const points = [
    { label: "Outstanding", value: revenueData?.outstandingBalance ?? 0, color: "#F59E0B" },
    { label: "Collected", value: revenueData?.collectedPayments ?? 0, color: "#10B981" },
    { label: "Booked", value: revenueData?.bookedValue ?? 0, color: "#2B9BA8" },
    { label: "Revenue", value: revenueData?.revenue ?? 0, color: "#176779" },
  ];

  const isAllZero = points.every((p) => p.value === 0);
  const maxVal = Math.max(...points.map((p) => p.value), 1);

  // SVG geometry (16:9 aspect, responsive)
  const W = 560;
  const H = 200;
  const PAD = { l: 8, r: 8, t: 16, b: 28 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const stepX = innerW / (points.length - 1);

  const xAt = (i: number) => PAD.l + i * stepX;
  const yAt = (v: number) => PAD.t + innerH - (v / maxVal) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xAt(points.length - 1).toFixed(1)} ${H - PAD.b} L ${xAt(0).toFixed(1)} ${H - PAD.b} Z`;

  return (
    <div
      data-testid="revenue-trend-card"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2B9BA8]" />
            <h3 id="revenue-trend-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Revenue Trend
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">Completed revenue over time.</p>
        </div>
        <div className="flex items-center gap-2">
          {currency && (
            <span className="rounded-md border border-[#E5EAED] bg-[#F5F8F9] px-2 py-0.5 text-[11px] font-medium text-[#74818A]">
              {currency}
            </span>
          )}
        </div>
      </div>

      {/* Chart body */}
      {isLoading ? (
        <div className="mt-5 flex h-[200px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded-lg bg-[#F5F8F9]" />
        </div>
      ) : isAllZero ? (
        <div className="mt-5">
          <EmptyState
            compact
            icon={<LineChartIcon className="h-5 w-5 text-[#2B9BA8]" />}
            title="No revenue activity"
            description="No financial totals recorded for the selected period."
          />
        </div>
      ) : (
        <div className="mt-5">
          <div className="relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Revenue progression: ${points.map((p) => `${p.label} ${formatReportMoney(p.value, currency)}`).join(", ")}`}
            >
              {/* Subtle horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={PAD.t + innerH * (1 - t)}
                  y2={PAD.t + innerH * (1 - t)}
                  stroke="#E5EAED"
                  strokeWidth={t === 0 ? 1 : 0.5}
                  strokeDasharray={t === 0 ? undefined : "2 3"}
                />
              ))}

              {/* Area fill */}
              <defs>
                <linearGradient id="revenue-trend-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2B9BA8" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2B9BA8" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#revenue-trend-area)" stroke="none" />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2B9BA8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points + value labels */}
              {points.map((p, i) => {
                const x = xAt(i);
                const y = yAt(p.value);
                const isHovered = hoveredIndex === i;
                return (
                  <g key={p.label}>
                    {/* Hover target (wider column) */}
                    <rect
                      x={x - stepX / 2}
                      y={PAD.t}
                      width={stepX}
                      height={innerH}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill="#fff"
                      stroke={p.color}
                      strokeWidth="2"
                    />
                    {/* X-axis label */}
                    <text
                      x={x}
                      y={H - PAD.b + 14}
                      textAnchor="middle"
                      className="fill-[#74818A] text-[9px] font-medium"
                    >
                      {p.label}
                    </text>
                    {/* Value label (always visible for clarity) */}
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className={`fill-[#18282A] text-[9px] font-semibold ${isHovered ? "font-bold" : ""}`}
                    >
                      {formatReportMoney(p.value, currency)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredIndex !== null && (
              <div
                className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-lg bg-[#18282A] px-3 py-1.5 text-xs text-white shadow-lg"
                aria-hidden="true"
              >
                <span className="font-semibold">{points[hoveredIndex].label}:</span>{" "}
                {formatReportMoney(points[hoveredIndex].value, currency)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
