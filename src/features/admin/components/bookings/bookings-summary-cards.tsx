"use client";

import * as React from "react";
import { ClipboardList, Clock, Activity, CheckCircle2 } from "lucide-react";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

export interface BookingsSummaryCardsProps {
  items?: OperationalBookingRecord[];
  totalCount?: number;
  isLoading?: boolean;
}

export function BookingsSummaryCards({
  items = [],
  totalCount = 0,
  isLoading = false,
}: BookingsSummaryCardsProps) {
  const notStartedCount = items.filter((b) => b.fulfillmentStatus === "NOT_STARTED").length;
  const inProgressCount = items.filter((b) => b.fulfillmentStatus === "IN_PROGRESS").length;
  const fulfilledCount = items.filter((b) => b.fulfillmentStatus === "FULFILLED").length;

  const cards = [
    {
      title: "Active in Queue",
      value: totalCount,
      subtitle: "Operational reservations",
      icon: ClipboardList,
      color: "text-[#176779]",
      bg: "bg-[#176779]/10",
      testId: "summary-total-bookings",
    },
    {
      title: "Not Started",
      value: notStartedCount,
      subtitle: "Awaiting fulfillment",
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-100/60",
      testId: "summary-not-started",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      subtitle: "Currently on tour",
      icon: Activity,
      color: "text-sky-700",
      bg: "bg-sky-100/60",
      testId: "summary-in-progress",
    },
    {
      title: "Fulfilled",
      value: fulfilledCount,
      subtitle: "Completed deliveries",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-100/60",
      testId: "summary-fulfilled",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            data-testid={card.testId}
            className="flex flex-col justify-between rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs transition-all hover:border-[#176779]/30 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                {card.title}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
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
