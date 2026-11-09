"use client";

import * as React from "react";
import {
  useGetAgentCommissionsQuery,
  useGetAgentOverviewQuery,
} from "../../api/agent-api";
import { AgentCommissionStatusBadge } from "../common/agent-status-badges";
import { formatAgentCurrency, formatAgentDate } from "../../utils/agent-formatters";
import { Button } from "@/components/ui/button";
import {
  Coins,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Hourglass,
  BadgeCheck,
  Calendar,
  Lock,
} from "lucide-react";

const STATUS_TABS = [
  { label: "All Commissions", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function AgentCommissionsTable() {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const {
    data: overviewResponse,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetAgentOverviewQuery();

  const {
    data: commissionsResponse,
    isLoading: isCommissionsLoading,
    isFetching,
    error,
    refetch: refetchCommissions,
  } = useGetAgentCommissionsQuery({
    page,
    limit: 10,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const overview = overviewResponse?.data;
  const commissions = commissionsResponse?.data?.items || [];
  const rawTotal = commissionsResponse?.data?.total ?? 0;
  const rawLimit = commissionsResponse?.data?.limit ?? 10;
  const rawPage = commissionsResponse?.data?.page ?? page;
  const pagination = commissionsResponse?.data?.pagination || {
    page: rawPage,
    limit: rawLimit,
    total: rawTotal,
    totalPages: Math.max(1, Math.ceil(rawTotal / rawLimit)),
  };

  const hasOverviewError = Boolean(overviewError && !overview);
  const sampleCurrency = commissions[0]?.booking?.currency || "THB";

  const handleTabChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleRefreshAll = () => {
    refetchOverview();
    refetchCommissions();
  };

  return (
    <div className="space-y-6" data-testid="agent-commissions-module">
      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Total Commission
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-outfit text-2xl font-bold tracking-tight text-emerald-950" data-testid="commissions-summary-total">
              {isOverviewLoading
                ? "..."
                : hasOverviewError
                ? "—"
                : formatAgentCurrency(overview?.totalCommission, sampleCurrency)}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Earned across {hasOverviewError ? "—" : overview?.activeCommissionsCount ?? 0} active bookings
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Paid Commission
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-outfit text-2xl font-bold tracking-tight text-blue-950" data-testid="commissions-summary-paid">
              {isOverviewLoading
                ? "..."
                : hasOverviewError
                ? "—"
                : formatAgentCurrency(overview?.paidCommission, sampleCurrency)}
            </p>
            <p className="mt-1 text-xs text-blue-700">Disbursed partner funds</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Pending Commission
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-outfit text-2xl font-bold tracking-tight text-amber-950" data-testid="commissions-summary-pending">
              {isOverviewLoading
                ? "..."
                : hasOverviewError
                ? "—"
                : formatAgentCurrency(overview?.pendingCommission, sampleCurrency)}
            </p>
            <p className="mt-1 text-xs text-amber-700">Scheduled for settlement</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
              Active Records
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]" data-testid="commissions-summary-active">
              {isOverviewLoading ? "..." : hasOverviewError ? "—" : overview?.activeCommissionsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#74818A]">Audited ledger entries</p>
          </div>
        </div>
      </div>

      {/* Read-Only Policy Disclosure Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 text-xs text-sky-900 shadow-xs">
        <Lock className="h-4 w-4 shrink-0 text-sky-700" />
        <div className="flex-1">
          <span className="font-semibold">Audited Financial Ledger: </span>
          Commissions are strictly read-only and automatically computed from authorized partner rules upon payment verification. Commission disputes or payout reconciliations are handled via your partner account representative.
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#E5EAED] sm:border-b-0">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? "border-[#176779] text-[#176779]"
                    : "border-transparent text-[#74818A] hover:text-[#18282A] hover:border-slate-300"
                }`}
                data-testid={`commission-filter-${tab.value.toLowerCase()}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleRefreshAll}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="h-9 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${
              isFetching ? "animate-spin text-[#176779]" : ""
            }`}
          />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Failed to load commission ledger. Please retry.</span>
          </div>
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            className="border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Ledger Table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {isCommissionsLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-14 text-center" data-testid="agent-commissions-empty">
            <Coins className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 font-outfit text-base font-bold text-[#18282A]">
              No commission records found
            </h4>
            <p className="mt-1 text-xs text-[#74818A] max-w-sm mx-auto">
              {statusFilter !== "ALL"
                ? "No commission records match the active filter status."
                : "Commissions will be posted here as your tour bookings are fulfilled."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="agent-commissions-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="px-4 py-3">Commission ID</th>
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Tour Details</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Base Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-right">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {commissions.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F8FAFB] transition-colors"
                    data-testid={`commission-row-${c.id}`}
                  >
                    <td className="px-4 py-3.5 font-mono text-[#74818A]">
                      {c.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-[#18282A]">
                      {c.bookingId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#18282A] max-w-[200px] truncate">
                        {c.booking?.service?.name || "Tour Service"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#18282A]">
                      <div className="truncate max-w-[140px]">
                        {c.booking?.customer?.name || "Customer"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#74818A]">
                      <span className="font-medium text-[#18282A]">
                        {c.rateType === "PERCENTAGE"
                          ? `${c.rateValue}%`
                          : formatAgentCurrency(c.rateValue, c.booking?.currency)}
                      </span>
                      <span className="text-[10px] block text-[#74818A]">
                        {c.rateType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#18282A]">
                      {formatAgentCurrency(c.baseAmount, c.booking?.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <AgentCommissionStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                      {formatAgentCurrency(c.amount, c.booking?.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#74818A]">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{formatAgentDate(c.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs text-[#74818A]">
            <div>
              Showing Page{" "}
              <span className="font-semibold text-[#18282A]">{pagination.page}</span> of{" "}
              <span className="font-semibold text-[#18282A]">
                {pagination.totalPages}
              </span>{" "}
              ({pagination.total} total records)
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="h-8 px-2.5 text-xs cursor-pointer"
                data-testid="pagination-prev"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="h-8 px-2.5 text-xs cursor-pointer"
                data-testid="pagination-next"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
