"use client";

import * as React from "react";
import type { AgentOverviewMetrics } from "../../types/agent";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  CheckCheck,
  Coins,
  Hourglass,
  BadgeCheck,
  XCircle,
} from "lucide-react";
import { formatAgentCurrency } from "../../utils/agent-formatters";

interface AgentMetricsCardsProps {
  metrics?: AgentOverviewMetrics;
  isLoading?: boolean;
  isError?: boolean;
  currency?: string;
}

export function AgentMetricsCards({
  metrics,
  isLoading,
  isError,
  currency,
}: AgentMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="agent-metrics-skeleton">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-8 w-8 rounded-full bg-slate-200" />
            </div>
            <div className="mt-4 h-8 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (isError && !metrics) {
    return null;
  }

  const items = [
    {
      id: "total-bookings",
      title: "Total Bookings",
      value: metrics?.totalBookings ?? 0,
      description: "All partner reservations",
      icon: CalendarCheck,
      iconColor: "text-teal-600 bg-teal-50",
      testId: "metric-total-bookings",
    },
    {
      id: "pending-bookings",
      title: "Pending Bookings",
      value: metrics?.pendingBookings ?? 0,
      description: "Awaiting approval or payment",
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50",
      testId: "metric-pending-bookings",
    },
    {
      id: "confirmed-bookings",
      title: "Confirmed Bookings",
      value: metrics?.confirmedBookings ?? 0,
      description: "Ready for tour fulfillment",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50",
      testId: "metric-confirmed-bookings",
    },
    {
      id: "completed-bookings",
      title: "Completed Bookings",
      value: metrics?.completedBookings ?? 0,
      description: "Tours concluded successfully",
      icon: CheckCheck,
      iconColor: "text-sky-600 bg-sky-50",
      testId: "metric-completed-bookings",
    },
    {
      id: "total-commission",
      title: "Total Commission",
      value: formatAgentCurrency(metrics?.totalCommission ?? 0, currency, 2),
      description: "Cumulative partner earnings",
      icon: Coins,
      iconColor: "text-emerald-700 bg-emerald-50",
      isHighlight: true,
      testId: "metric-total-commission",
    },
    {
      id: "pending-commission",
      title: "Pending Commission",
      value: formatAgentCurrency(metrics?.pendingCommission ?? 0, currency, 2),
      description: "In verification or awaiting payout",
      icon: Hourglass,
      iconColor: "text-amber-700 bg-amber-50",
      testId: "metric-pending-commission",
    },
    {
      id: "paid-commission",
      title: "Paid Commission",
      value: formatAgentCurrency(metrics?.paidCommission ?? 0, currency, 2),
      description: "Verified paid booking commissions",
      icon: BadgeCheck,
      iconColor: "text-blue-700 bg-blue-50",
      testId: "metric-paid-commission",
    },
    {
      id: "cancelled-bookings",
      title: "Cancelled Bookings",
      value: metrics?.cancelledBookings ?? 0,
      description: "Withdrawn or expired bookings",
      icon: XCircle,
      iconColor: "text-rose-600 bg-rose-50",
      testId: "metric-cancelled-bookings",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="agent-metrics-cards">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            data-testid={item.testId}
            className="group relative overflow-hidden rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs transition-all hover:border-[#176779]/30 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                {item.title}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconColor}`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
                {item.value}
              </div>
              <p className="mt-1 text-xs text-[#74818A]">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
