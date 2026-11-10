import * as React from "react";
import { Compass, CheckCircle2, FileEdit, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatReportCount } from "../../utils/format";
import { Skeleton } from "@/components/shared/loading-skeleton";
import type { AdminServiceStatus } from "../../types/admin";

export interface ToursSummaryCounts {
  total?: number;
  published?: number;
  draft?: number;
  unpublished?: number;
}

export interface ToursSummaryCardsProps {
  counts: ToursSummaryCounts;
  isLoading?: boolean;
  activeStatus?: AdminServiceStatus | "ALL";
  onSelectStatus?: (status: AdminServiceStatus | "ALL") => void;
}

export function ToursSummaryCards({
  counts,
  isLoading = false,
  activeStatus = "ALL",
  onSelectStatus,
}: ToursSummaryCardsProps) {
  const cards: Array<{
    id: AdminServiceStatus | "ALL";
    title: string;
    count?: number;
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
    iconBg: string;
    iconColor: string;
    badgeTone: string;
  }> = [
    {
      id: "ALL",
      title: "Total Tours",
      count: counts.total,
      icon: Compass,
      accentClass: "hover:border-[#176779]/40",
      iconBg: "bg-[#E8F6F8]",
      iconColor: "text-[#176779]",
      badgeTone: "bg-[#F5F8F9] text-[#18282A]",
    },
    {
      id: "PUBLISHED",
      title: "Published",
      count: counts.published,
      icon: CheckCircle2,
      accentClass: "hover:border-emerald-300",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      badgeTone: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "DRAFT",
      title: "Drafts",
      count: counts.draft,
      icon: FileEdit,
      accentClass: "hover:border-amber-300",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      badgeTone: "bg-amber-50 text-amber-700",
    },
    {
      id: "UNPUBLISHED",
      title: "Unpublished",
      count: counts.unpublished,
      icon: EyeOff,
      accentClass: "hover:border-slate-300",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      badgeTone: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus?.(card.id)}
            data-testid={`summary-card-${card.id.toLowerCase()}`}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border bg-white p-4 text-left transition-all duration-150 cursor-pointer shadow-2xs",
              isActive
                ? "border-[#176779] ring-2 ring-[#176779]/15 shadow-xs"
                : "border-[#E5EAED] hover:shadow-xs",
              card.accentClass
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#74818A] group-hover:text-[#18282A] transition-colors">
                {card.title}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                  card.iconBg,
                  card.iconColor
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="font-outfit text-xl font-bold tracking-tight text-[#18282A]">
                  {formatReportCount(card.count)}
                </span>
              )}

              {isActive && (
                <span className="text-[10px] font-semibold text-[#176779] bg-[#E8F6F8] px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
