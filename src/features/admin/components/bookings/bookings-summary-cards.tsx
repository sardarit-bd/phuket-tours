"use client";

import * as React from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Activity,
  Award,
} from "lucide-react";
import type { AdminBookingsReportData } from "../../types/admin";

export interface BookingsSummaryCardsProps {
  reportData?: AdminBookingsReportData | null;
  pendingCount?: number;
  isLoading?: boolean;
}

export function BookingsSummaryCards({
  reportData,
  pendingCount = 0,
  isLoading = false,
}: BookingsSummaryCardsProps) {
  const byStatusMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (reportData?.byStatus) {
      for (const item of reportData.byStatus) {
        map.set(item.status, item.count);
      }
    }
    return map;
  }, [reportData?.byStatus]);

  const totalBookings = reportData?.totalBookings ?? 0;
  // If pending count from pending endpoint is higher, or fallback to report data
  const pendingValue = Math.max(
    pendingCount,
    (byStatusMap.get("PENDING") || 0) + (byStatusMap.get("AWAITING_APPROVAL") || 0)
  );
  const confirmedValue = byStatusMap.get("CONFIRMED") || 0;
  const inProgressValue = byStatusMap.get("IN_PROGRESS") || 0;
  const completedValue = byStatusMap.get("COMPLETED") || 0;

  const cards = [
    {
      title: "Total Bookings",
      value: totalBookings,
      subtitle: "All customer reservations",
      icon: ClipboardList,
      color: "text-[#176779]",
      bg: "bg-[#176779]/10",
      testId: "summary-total-bookings",
    },
    {
      title: "Pending Review",
      value: pendingValue,
      subtitle: "Needs confirmation",
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-100/60",
      testId: "summary-pending-review",
    },
    {
      title: "Confirmed",
      value: confirmedValue,
      subtitle: "Scheduled departures",
      icon: CheckCircle2,
      color: "text-teal-700",
      bg: "bg-teal-100/60",
      testId: "summary-confirmed",
    },
    {
      title: "In Progress",
      value: inProgressValue,
      subtitle: "Currently on tour",
      icon: Activity,
      color: "text-sky-700",
      bg: "bg-sky-100/60",
      testId: "summary-in-progress",
    },
    {
      title: "Completed",
      value: completedValue,
      subtitle: "Fulfilled tours",
      icon: Award,
      color: "text-emerald-700",
      bg: "bg-emerald-100/60",
      testId: "summary-completed",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            data-testid={card.testId}
            className="flex flex-col justify-between rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs transition-all hover:border-[#176779]/30 sm:p-4.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                {card.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded-md bg-slate-100" />
              ) : (
                <span className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
                  {card.value.toLocaleString()}
                </span>
              )}
              <p className="mt-1 text-[11px] font-medium text-[#74818A] sm:text-xs">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
