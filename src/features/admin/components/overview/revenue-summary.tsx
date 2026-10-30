import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  RefreshCw,
} from "lucide-react";
import { MetricCard } from "./metric-card";
import { formatReportMoney, formatReportCount } from "../../utils/format";
import type {
  AdminRevenueReportData,
  AdminPaymentsReportData,
} from "../../types/admin";
import { Button } from "@/components/ui/button";

export interface RevenueSummaryProps {
  revenueData?: AdminRevenueReportData | null;
  paymentsData?: AdminPaymentsReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RevenueSummary({
  revenueData,
  paymentsData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: RevenueSummaryProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-xs"
        data-testid="revenue-summary-error"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h3 className="font-outfit text-base font-semibold text-red-900">
                Failed to load financial revenue analytics
              </h3>
              <p className="mt-1 text-sm text-red-700">
                The revenue report endpoint could not be reached or returned an error.
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-300 bg-white text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const reconciliation = paymentsData?.reconciliation;
  const isReconciled = reconciliation ? reconciliation.difference === 0 : true;

  return (
    <section aria-labelledby="revenue-summary-heading" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3
            id="revenue-summary-heading"
            className="font-outfit text-lg font-bold text-[#18282A]"
          >
            Financial Totals
          </h3>
          <p className="text-xs text-[#74818A]">
            Real-time financial aggregation based on verified booking & payment transactions.
          </p>
        </div>
        {currency && (
          <span className="rounded-md border border-[#E5EAED] bg-[#F5F8F9] px-2.5 py-1 text-xs font-medium text-[#74818A]">
            Currency: {currency}
          </span>
        )}
      </div>

      {/* 4 Core Financial Totals genuinely supported by backend */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          testId="metric-revenue"
          title="Completed Revenue"
          value={formatReportMoney(revenueData?.revenue, currency)}
          subtitle="Final price sum of fully completed bookings"
          icon={DollarSign}
          tone="emerald"
          badge="Completed"
          badgeTone="success"
          isLoading={isLoading}
        />

        <MetricCard
          testId="metric-booked-value"
          title="Booked Pipeline Value"
          value={formatReportMoney(revenueData?.bookedValue, currency)}
          subtitle="Confirmed, in-progress & completed bookings"
          icon={TrendingUp}
          tone="teal"
          badge="Active Pipeline"
          badgeTone="info"
          isLoading={isLoading}
        />

        <MetricCard
          testId="metric-collected"
          title="Collected Payments"
          value={formatReportMoney(revenueData?.collectedPayments, currency)}
          subtitle="Total verified customer payments received"
          icon={CreditCard}
          tone="blue"
          badge="Verified"
          badgeTone="success"
          isLoading={isLoading}
        />

        <MetricCard
          testId="metric-outstanding"
          title="Outstanding Balance"
          value={formatReportMoney(revenueData?.outstandingBalance, currency)}
          subtitle="Unpaid amount for confirmed or active bookings"
          icon={AlertCircle}
          tone={
            revenueData?.outstandingBalance && revenueData.outstandingBalance > 0
              ? "amber"
              : "neutral"
          }
          badge={
            revenueData?.outstandingBalance && revenueData.outstandingBalance > 0
              ? "Unpaid"
              : "Settled"
          }
          badgeTone={
            revenueData?.outstandingBalance && revenueData.outstandingBalance > 0
              ? "warning"
              : "default"
          }
          isLoading={isLoading}
        />
      </div>

      {/* Payment Reconciliation Panel (supported by /api/v1/admin/reports/payments) */}
      {reconciliation && !isLoading && (
        <div
          data-testid="payment-reconciliation-panel"
          className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5EAED] pb-4">
            <div className="flex items-center gap-2.5">
              {isReconciled ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <h4 className="font-outfit text-sm font-semibold text-[#18282A]">
                  Payment Reconciliation Summary
                </h4>
                <p className="text-xs text-[#74818A]">
                  Compares value of paid bookings with verified received payments
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isReconciled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isReconciled ? "Balanced" : "Discrepancy Detected"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-[#F8FAFB] p-3.5">
              <span className="text-xs font-medium text-[#74818A]">
                Paid Bookings Value
              </span>
              <p className="mt-1 font-outfit text-lg font-bold text-[#18282A]">
                {formatReportMoney(reconciliation.paidBookingsValue, currency)}
              </p>
            </div>

            <div className="rounded-lg bg-[#F8FAFB] p-3.5">
              <span className="text-xs font-medium text-[#74818A]">
                Verified Payments Value
              </span>
              <p className="mt-1 font-outfit text-lg font-bold text-[#18282A]">
                {formatReportMoney(reconciliation.verifiedPaymentsValue, currency)}
              </p>
            </div>

            <div className="rounded-lg bg-[#F8FAFB] p-3.5">
              <span className="text-xs font-medium text-[#74818A]">
                Reconciliation Difference
              </span>
              <p
                className={`mt-1 font-outfit text-lg font-bold ${
                  reconciliation.difference === 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {formatReportMoney(reconciliation.difference, currency)}
              </p>
            </div>

            <div className="rounded-lg bg-[#F8FAFB] p-3.5">
              <span className="flex items-center gap-1 text-xs font-medium text-[#74818A]">
                <Clock className="h-3.5 w-3.5" />
                Pending Verification
              </span>
              <p className="mt-1 font-outfit text-lg font-bold text-[#18282A]">
                {formatReportCount(reconciliation.pendingVerificationCount)} items
                <span className="block text-xs font-normal text-[#74818A]">
                  ({formatReportMoney(reconciliation.pendingVerificationValue, currency)})
                </span>
              </p>
            </div>
          </div>

          {/* Compact Comparison Visualization */}
          <div
            data-testid="payment-comparison-chart"
            className="mt-5 rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-4"
          >
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                  Payment Verification Comparison
                </h5>
                <p className="text-[11px] text-[#74818A]">
                  Comparing Invoiced Paid Booking Target, Confirmed Ledger Receipts, and Unverified Submissions
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2B9BA8]" />
                  <span className="text-[#18282A]">Paid Bookings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[#18282A]">Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[#18282A]">Pending</span>
                </div>
              </div>
            </div>

            {/* 3 Metric Comparison Bars */}
            {(() => {
              const maxAmount = Math.max(
                reconciliation.paidBookingsValue,
                reconciliation.verifiedPaymentsValue,
                reconciliation.pendingVerificationValue,
                1
              );

              return (
                <div className="space-y-3">
                  {/* Paid Bookings Target Bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#18282A]">
                        Paid Booking Value (Invoiced Target)
                      </span>
                      <span className="font-outfit font-bold text-[#18282A]">
                        {formatReportMoney(reconciliation.paidBookingsValue, currency)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                      <div
                        className="h-full rounded-full bg-[#2B9BA8] transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            (reconciliation.paidBookingsValue / maxAmount) * 100,
                            reconciliation.paidBookingsValue > 0 ? 2 : 0
                          )}%`,
                        }}
                        title={`Paid Booking Value: ${formatReportMoney(reconciliation.paidBookingsValue, currency)}`}
                      />
                    </div>
                  </div>

                  {/* Verified Payments Bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-800">
                        Verified Payments (Confirmed Funds Collected)
                      </span>
                      <span className="font-outfit font-bold text-emerald-800">
                        {formatReportMoney(reconciliation.verifiedPaymentsValue, currency)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            (reconciliation.verifiedPaymentsValue / maxAmount) * 100,
                            reconciliation.verifiedPaymentsValue > 0 ? 2 : 0
                          )}%`,
                        }}
                        title={`Verified Payments Value: ${formatReportMoney(reconciliation.verifiedPaymentsValue, currency)}`}
                      />
                    </div>
                  </div>

                  {/* Pending Verification Bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-amber-800">
                        Pending Verification ({reconciliation.pendingVerificationCount} items in queue)
                      </span>
                      <span className="font-outfit font-bold text-amber-800">
                        {formatReportMoney(reconciliation.pendingVerificationValue, currency)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            (reconciliation.pendingVerificationValue / maxAmount) * 100,
                            reconciliation.pendingVerificationValue > 0 ? 2 : 0
                          )}%`,
                        }}
                        title={`Pending Verification Value: ${formatReportMoney(reconciliation.pendingVerificationValue, currency)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metric definitions callout to strictly separate incompatible metrics */}
            <div className="mt-4 flex items-start gap-2 rounded-md bg-white p-2.5 text-[11px] text-[#74818A] border border-[#E5EAED]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2B9BA8]" />
              <p>
                <strong className="font-semibold text-[#18282A]">Metric Integrity:</strong> Paid
                Booking Value is the final price of bookings marked as paid in orders. Verified
                Payments are confirmed physical funds received in bank/cash. Pending Verification
                represents unreviewed payment proof uploads awaiting verification and is not yet
                counted as collected revenue.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
