import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Banknote,
  ShieldCheck,
  Scale,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatReportCount, formatReportMoney } from "../../utils/format";
import type {
  AdminPaymentsReportData,
  AdminRevenueReportData,
} from "../../types/admin";

export interface PaymentReconciliationCardProps {
  revenueData?: AdminRevenueReportData | null;
  paymentsData?: AdminPaymentsReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function SummaryBlock({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "success" | "warning";
  testId?: string;
}) {
  const toneColor =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
      ? "text-amber-700"
      : "text-[#18282A]";

  return (
    <div
      data-testid={testId}
      className="flex items-center gap-3 rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-3.5"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          tone === "success"
            ? "bg-emerald-50 text-emerald-700"
            : tone === "warning"
            ? "bg-amber-50 text-amber-700"
            : "bg-white text-[#176779]"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#74818A]">{label}</p>
        <p className={`font-outfit text-base font-bold ${toneColor}`}>
          {value}
          {sub && (
            <span className="ml-1 text-[11px] font-normal text-[#74818A]">
              {sub}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function PaymentReconciliationCard({
  revenueData,
  paymentsData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: PaymentReconciliationCardProps) {
  const reconciliation = paymentsData?.reconciliation;

  if (error) {
    return (
      <div
        role="alert"
        data-testid="reconciliation-error"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-outfit text-sm font-semibold">
              Payment reconciliation unavailable
            </h4>
            <p className="mt-1 text-xs text-red-700">
              The payments report endpoint could not be reached.
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 bg-white text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!reconciliation && !isLoading) return null;

  const isReconciled = reconciliation ? reconciliation.difference === 0 : true;
  const hasDiscrepancy = !isReconciled;

  return (
    <section
      aria-labelledby="reconciliation-heading"
      data-testid="payment-reconciliation-panel"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#E5EAED] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          {isReconciled ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          <div>
            <h3 id="reconciliation-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Payment Reconciliation Summary
            </h3>
            <p className="text-xs text-[#74818A]">
              Paid bookings compared with verified payments.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
            hasDiscrepancy
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {hasDiscrepancy ? "Discrepancy Detected" : "Balanced"}
        </span>
      </div>

      {/* Four compact summary blocks */}
      {isLoading || !reconciliation ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F5F8F9]" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryBlock
            testId="recon-paid-bookings"
            icon={Banknote}
            label="Paid Bookings Value"
            value={formatReportMoney(reconciliation.paidBookingsValue, currency)}
          />
          <SummaryBlock
            testId="recon-verified-payments"
            icon={ShieldCheck}
            label="Verified Payments Value"
            value={formatReportMoney(reconciliation.verifiedPaymentsValue, currency)}
          />
          <SummaryBlock
            testId="recon-difference"
            icon={Scale}
            label="Reconciliation Difference"
            value={formatReportMoney(reconciliation.difference, currency)}
            tone={hasDiscrepancy ? "warning" : "success"}
          />
          <SummaryBlock
            testId="recon-pending-verification"
            icon={Clock}
            label="Pending Verification"
            value={formatReportCount(reconciliation.pendingVerificationCount)}
            sub={`${formatReportMoney(reconciliation.pendingVerificationValue, currency)}`}
            tone={
              reconciliation.pendingVerificationCount > 0 ? "warning" : "neutral"
            }
          />
        </div>
      )}
    </section>
  );
}
