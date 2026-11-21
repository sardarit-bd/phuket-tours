import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "brand" | "emerald" | "amber" | "neutral";

export interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: KpiTone;
  /** Optional supporting indicator. Omit when no historical comparison is available. */
  trend?: {
    direction: "up" | "down" | "flat";
    /** Human-readable change, e.g. "+12.4%" or "No change". */
    label: string;
    /** When true, an upward direction is good (green). When false, an upward direction is bad (red). */
    upIsGood?: boolean;
  };
  /** Optional small contextual line, e.g. "This period". Omit when empty. */
  contextLabel?: string;
  /** When true, the value renders as a pulsing skeleton block. */
  isLoading?: boolean;
  testId?: string;
  className?: string;
}

const TONE_STYLES: Record<
  KpiTone,
  { iconBg: string; iconColor: string; ring: string }
> = {
  brand: {
    iconBg: "bg-[#E8F6F8]",
    iconColor: "text-[#176779]",
    ring: "ring-[#2B9BA8]/20",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    ring: "ring-emerald-500/20",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    ring: "ring-amber-500/20",
  },
  neutral: {
    iconBg: "bg-[#F5F8F9]",
    iconColor: "text-[#74818A]",
    ring: "ring-[#74818A]/20",
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  tone = "brand",
  trend,
  contextLabel,
  isLoading = false,
  testId,
  className,
}: KpiCardProps) {
  const toneStyle = TONE_STYLES[tone];
  const trendIcon =
    trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const TrendIcon = trend ? trendIcon : null;
  const trendIsGood =
    trend ? (trend.upIsGood ?? true) === (trend.direction === "up") || trend.direction === "flat" : true;

  return (
    <article
      data-testid={testId}
      aria-busy={isLoading || undefined}
      className={cn(
        "rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#74818A]">{title}</p>
          {isLoading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-md bg-[#F5F8F9]" aria-hidden="true" />
          ) : (
            <p className="mt-2 font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              {value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-4",
            toneStyle.iconBg,
            toneStyle.iconColor,
            toneStyle.ring
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend || contextLabel) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E5EAED] pt-3">
          {trend && TrendIcon ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                trendIsGood ? "text-emerald-700" : "text-amber-700"
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trend.label}
            </span>
          ) : (
            <span className="text-xs text-[#74818A]">—</span>
          )}
          {contextLabel && (
            <span className="text-xs text-[#74818A]">{contextLabel}</span>
          )}
        </div>
      )}
    </article>
  );
}
