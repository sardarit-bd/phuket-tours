"use client";

import * as React from "react";
import {
  TrendingUp,
  Percent,
  XCircle,
  ShieldCheck,
  Info,
} from "lucide-react";
import type {
  AdminCommissionsReportData,
  AdminCommissionRule,
} from "../../types/admin-commissions";

interface CommissionsSummaryCardsProps {
  reportData?: AdminCommissionsReportData | null;
  activeRule?: AdminCommissionRule | null;
  isLoading?: boolean;
}

const formatTHB = (value?: number | null): string => {
  if (value === null || value === undefined || isNaN(value)) return "฿0.00";
  return `฿${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function CommissionsSummaryCards({
  reportData,
  activeRule,
  isLoading = false,
}: CommissionsSummaryCardsProps) {
  const activeStats = React.useMemo(() => {
    const activeRow = reportData?.byStatus?.find(
      (s) => s.status.toUpperCase() === "ACTIVE"
    );
    return {
      amount: reportData?.totalActiveAmount ?? activeRow?.totalAmount ?? 0,
      count: activeRow?.count ?? 0,
    };
  }, [reportData]);

  const cancelledStats = React.useMemo(() => {
    const cancelledRow = reportData?.byStatus?.find(
      (s) => s.status.toUpperCase() === "CANCELLED"
    );
    return {
      amount: cancelledRow?.totalAmount ?? 0,
      count: cancelledRow?.count ?? 0,
    };
  }, [reportData]);

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Loading commission overview metrics"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-9 w-9 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-7 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-44 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const ruleDisplay = activeRule
    ? activeRule.rateType === "PERCENTAGE"
      ? `${Number(activeRule.rateValue).toFixed(2)}%`
      : `฿${Number(activeRule.rateValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Not Set";

  const ruleSubtext = activeRule
    ? `${activeRule.rateType === "PERCENTAGE" ? "Percentage rate" : "Fixed amount"} policy`
    : "No active rule";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Commissions Total */}
        <div
          data-testid="metric-active-commissions"
          className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Active Commissions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900">
              {formatTHB(activeStats.amount)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Across <strong className="text-slate-700 font-semibold">{activeStats.count}</strong> active partner records
            </p>
          </div>
        </div>

        {/* Card 2: Active Commission Policy Rate */}
        <div
          data-testid="metric-commission-policy"
          className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Active Partner Policy
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3297A3]/10 text-[#3297A3]">
              <Percent className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900">
              {ruleDisplay}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {ruleSubtext}
            </p>
          </div>
        </div>

        {/* Card 3: Cancelled Commissions Total */}
        <div
          data-testid="metric-cancelled-commissions"
          className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Cancelled Volume
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900">
              {formatTHB(cancelledStats.amount)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              <strong className="text-slate-700 font-semibold">{cancelledStats.count}</strong> cancelled booking records
            </p>
          </div>
        </div>

        {/* Card 4: Audit & Ledger Governance */}
        <div
          data-testid="metric-audit-governance"
          className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Audit Governance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-outfit text-lg font-bold tracking-tight text-slate-900">
              Full Audit Trail
            </span>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Every adjustment requires reason & author logging
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Ledger Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong>Database Ledger Scope:</strong> Metrics reflect active and cancelled commission records generated upon payment verification. Payout disbursement and settlement tracking are omitted as they are not supported in the current backend schema.
        </p>
      </div>
    </div>
  );
}
