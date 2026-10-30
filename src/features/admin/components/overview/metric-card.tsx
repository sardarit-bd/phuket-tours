import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";

export type MetricCardTone = "teal" | "emerald" | "amber" | "blue" | "purple" | "neutral";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: MetricCardTone;
  badge?: string;
  badgeTone?: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
  className?: string;
  testId?: string;
}

const TONE_CLASSES: Record<
  MetricCardTone,
  {
    iconBg: string;
    iconColor: string;
    accentBorder?: string;
  }
> = {
  teal: {
    iconBg: "bg-[#E8F6F8]",
    iconColor: "text-[#176779]",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  blue: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-700",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
  },
  neutral: {
    iconBg: "bg-[#F5F8F9]",
    iconColor: "text-[#74818A]",
  },
};

const BADGE_TONE_CLASSES: Record<
  "default" | "success" | "warning" | "info",
  string
> = {
  default: "bg-[#F5F8F9] text-[#74818A] border-[#E5EAED]",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "teal",
  badge,
  badgeTone = "default",
  isLoading = false,
  className,
  testId,
}: MetricCardProps) {
  const toneStyle = TONE_CLASSES[tone];

  if (isLoading) {
    return (
      <div
        data-testid={testId ? `${testId}-loading` : "metric-card-loading"}
        className={cn(
          "rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-8 w-36" />
        {subtitle && <Skeleton className="mt-2 h-3.5 w-48" />}
      </div>
    );
  }

  return (
    <article
      data-testid={testId || "metric-card"}
      aria-label={title}
      className={cn(
        "relative flex flex-col justify-between rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#74818A]">
            {title}
          </p>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                BADGE_TONE_CLASSES[badgeTone]
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform",
            toneStyle.iconBg,
            toneStyle.iconColor
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <div
          data-testid={testId ? `${testId}-value` : "metric-card-value"}
          className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl"
        >
          {value}
        </div>
        {subtitle && (
          <p
            data-testid={testId ? `${testId}-subtitle` : "metric-card-subtitle"}
            className="mt-1 text-xs text-[#74818A] leading-relaxed"
          >
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
}
