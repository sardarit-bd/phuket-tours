import { DollarSign, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { formatReportMoney } from "../../utils/format";
import type { AdminRevenueReportData } from "../../types/admin";

export interface FinancialKpiCardsProps {
  revenueData?: AdminRevenueReportData | null;
  currency?: string | null;
  /** When true, every card shows a pulsing value skeleton. */
  isLoading?: boolean;
}

/**
 * Four equal-width KPI cards: Completed Revenue, Booked Pipeline Value,
 * Collected Payments, Outstanding Balance.
 *
 * Trend indicators are omitted when historical comparison data is
 * unavailable (the current report API returns single-period totals only).
 */
export function FinancialKpiCards({
  revenueData,
  currency,
  isLoading = false,
}: FinancialKpiCardsProps) {
  const outstanding = revenueData?.outstandingBalance;
  const hasOutstanding = Boolean(outstanding && outstanding > 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        testId="metric-revenue"
        title="Completed Revenue"
        value={formatReportMoney(revenueData?.revenue, currency)}
        icon={DollarSign}
        tone="emerald"
        contextLabel="Completed bookings"
        isLoading={isLoading}
      />
      <KpiCard
        testId="metric-booked-value"
        title="Booked Pipeline Value"
        value={formatReportMoney(revenueData?.bookedValue, currency)}
        icon={TrendingUp}
        tone="brand"
        contextLabel="Active pipeline"
        isLoading={isLoading}
      />
      <KpiCard
        testId="metric-collected"
        title="Collected Payments"
        value={formatReportMoney(revenueData?.collectedPayments, currency)}
        icon={CreditCard}
        tone="brand"
        contextLabel="Verified payments"
        isLoading={isLoading}
      />
      <KpiCard
        testId="metric-outstanding"
        title="Outstanding Balance"
        value={formatReportMoney(revenueData?.outstandingBalance, currency)}
        icon={AlertCircle}
        tone={hasOutstanding ? "amber" : "neutral"}
        contextLabel={hasOutstanding ? "Unpaid balance" : "No unpaid balance"}
        isLoading={isLoading}
      />
    </div>
  );
}
