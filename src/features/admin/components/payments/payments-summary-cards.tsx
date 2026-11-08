"use client";

import * as React from "react";
import { CheckCircle2, Clock, XCircle, CreditCard } from "lucide-react";
import type { AdminPaymentsReportData } from "../../types/admin";
import { formatReportMoney, formatReportCount } from "../../utils/format";

export interface PaymentsSummaryCardsProps {
  reportData?: AdminPaymentsReportData | null;
  totalPaymentsCount?: number;
  isLoading?: boolean;
}

export function PaymentsSummaryCards({
  reportData,
  totalPaymentsCount,
  isLoading = false,
}: PaymentsSummaryCardsProps) {
  const verifiedStats = React.useMemo(() => {
    const item = reportData?.byStatus?.find((s) => s.status === "VERIFIED");
    return {
      count: item?.count ?? null,
      amount: item?.totalAmount ?? (reportData?.reconciliation?.verifiedPaymentsValue ?? null),
    };
  }, [reportData]);

  const pendingStats = React.useMemo(() => {
    const item = reportData?.byStatus?.find((s) => s.status === "SUBMITTED");
    return {
      count: item?.count ?? (reportData?.reconciliation?.pendingVerificationCount ?? null),
      amount: item?.totalAmount ?? (reportData?.reconciliation?.pendingVerificationValue ?? null),
    };
  }, [reportData]);

  const rejectedStats = React.useMemo(() => {
    const item = reportData?.byStatus?.find((s) => s.status === "REJECTED");
    return {
      count: item?.count ?? null,
      amount: item?.totalAmount ?? null,
    };
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="payments-metrics-loading">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-8 w-8 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-4 h-7 w-28 rounded bg-slate-200" />
            <div className="mt-2 h-3.5 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Payments */}
      <div
        className="flex flex-col rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs transition-all hover:border-[#176779]/30"
        data-testid="metric-total-payments"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
            Total Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CreditCard className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
            {formatReportCount(totalPaymentsCount)}
          </span>
          <span className="text-xs text-[#74818A]">transactions</span>
        </div>
        <p className="mt-1 text-[11px] text-[#74818A]">
          Total payment records registered
        </p>
      </div>

      {/* 2. Successful / Verified Payments */}
      <div
        className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition-all hover:border-emerald-300"
        data-testid="metric-verified-payments"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Verified Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-outfit text-2xl font-bold tracking-tight text-emerald-900">
            {verifiedStats.amount !== null ? `฿${formatReportMoney(verifiedStats.amount)}` : "—"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[#74818A]">
          {verifiedStats.count !== null
            ? `${formatReportCount(verifiedStats.count)} confirmed transaction${verifiedStats.count === 1 ? "" : "s"}`
            : "Aggregated verified volume"}
        </p>
      </div>

      {/* 3. Pending / Awaiting Review */}
      <div
        className="flex flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-xs transition-all hover:border-blue-300"
        data-testid="metric-pending-payments"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
            Awaiting Review
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Clock className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-outfit text-2xl font-bold tracking-tight text-blue-900">
            {pendingStats.count !== null ? formatReportCount(pendingStats.count) : "—"}
          </span>
          <span className="text-xs text-[#74818A]">submitted</span>
        </div>
        <p className="mt-1 text-[11px] text-[#74818A]">
          {pendingStats.amount !== null
            ? `฿${formatReportMoney(pendingStats.amount)} awaiting verification`
            : "Requires staff verification"}
        </p>
      </div>

      {/* 4. Rejected Payments */}
      <div
        className="flex flex-col rounded-2xl border border-rose-100 bg-white p-5 shadow-xs transition-all hover:border-rose-300"
        data-testid="metric-rejected-payments"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
            Rejected Payments
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <XCircle className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-outfit text-2xl font-bold tracking-tight text-rose-900">
            {rejectedStats.count !== null ? formatReportCount(rejectedStats.count) : "0"}
          </span>
          <span className="text-xs text-[#74818A]">declined</span>
        </div>
        <p className="mt-1 text-[11px] text-[#74818A]">
          {rejectedStats.amount !== null && rejectedStats.amount > 0
            ? `฿${formatReportMoney(rejectedStats.amount)} rejected`
            : "Invalid or declined submissions"}
        </p>
      </div>
    </div>
  );
}
