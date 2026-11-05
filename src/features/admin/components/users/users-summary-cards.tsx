"use client";

import * as React from "react";
import { Users, UserCheck, Briefcase, ShieldAlert, UserX } from "lucide-react";

export interface UsersSummaryCardsProps {
  totalUsers?: number;
  totalCustomers?: number;
  totalAgents?: number;
  totalStaff?: number;
  totalActive?: number;
  totalDeactivated?: number;
  isLoading?: boolean;
}

export function UsersSummaryCards({
  totalUsers = 0,
  totalCustomers = 0,
  totalAgents = 0,
  totalStaff = 0,
  totalActive = 0,
  totalDeactivated = 0,
  isLoading = false,
}: UsersSummaryCardsProps) {
  const cards = [
    {
      title: "Total Accounts",
      value: totalUsers,
      subtitle: `${totalActive} active accounts`,
      icon: Users,
      color: "text-[#176779]",
      bg: "bg-[#176779]/10",
      testId: "summary-total-users",
    },
    {
      title: "Customers",
      value: totalCustomers,
      subtitle: "Direct travellers",
      icon: UserCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-100/60",
      testId: "summary-customers",
    },
    {
      title: "Agents",
      value: totalAgents,
      subtitle: "Partner travel agencies",
      icon: Briefcase,
      color: "text-sky-700",
      bg: "bg-sky-100/60",
      testId: "summary-agents",
    },
    {
      title: "Staff Members",
      value: totalStaff,
      subtitle: "Operations & guides",
      icon: ShieldAlert,
      color: "text-amber-700",
      bg: "bg-amber-100/60",
      testId: "summary-staff",
    },
    {
      title: "Deactivated",
      value: totalDeactivated,
      subtitle: "Suspended / inactive",
      icon: UserX,
      color: "text-rose-700",
      bg: "bg-rose-100/60",
      testId: "summary-deactivated",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
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
