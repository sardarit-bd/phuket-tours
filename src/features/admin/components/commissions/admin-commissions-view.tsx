"use client";

import * as React from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Percent,
} from "lucide-react";
import {
  useGetAdminCommissionsQuery,
  useGetAdminCommissionRulesQuery,
  useGetAdminCommissionsReportQuery,
} from "../../api/admin-api";
import { CommissionsSummaryCards } from "./commissions-summary-cards";
import { CommissionsToolbar } from "./commissions-toolbar";
import { CommissionsTable } from "./commissions-table";
import { CommissionsPagination } from "./commissions-pagination";
import { CommissionDetailsDialog } from "./commission-details-dialog";
import { AdjustCommissionDialog } from "./adjust-commission-dialog";
import { CommissionRulesTab } from "./commission-rules-tab";
import type {
  AdminCommissionRecord,
  CommissionStatus,
} from "../../types/admin-commissions";

interface ActionFeedback {
  type: "success" | "error";
  message: string;
}

export function AdminCommissionsView() {
  // 1. Tab State: "ledger" | "rules"
  const [activeTab, setActiveTab] = React.useState<"ledger" | "rules">("ledger");

  // 2. Ledger Pagination & Filter State
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [agentFilter, setAgentFilter] = React.useState<string>("ALL");
  const [bookingIdFilter, setBookingIdFilter] = React.useState<string>("");

  // 3. Modal Dialog States
  const [selectedCommissionForDetails, setSelectedCommissionForDetails] =
    React.useState<AdminCommissionRecord | null>(null);
  const [selectedCommissionForAdjust, setSelectedCommissionForAdjust] =
    React.useState<AdminCommissionRecord | null>(null);

  // 4. Feedback State
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 5. Query parameters for commissions list
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      status:
        statusFilter !== "ALL"
          ? (statusFilter as CommissionStatus)
          : undefined,
      agentId:
        agentFilter !== "ALL" && agentFilter.trim().length > 0
          ? agentFilter.trim()
          : undefined,
      bookingId:
        bookingIdFilter.trim().length > 0
          ? bookingIdFilter.trim()
          : undefined,
    };
  }, [page, limit, statusFilter, agentFilter, bookingIdFilter]);

  // 6. RTK Query Hooks
  const {
    data: commissionsResponse,
    isLoading: isCommissionsLoading,
    isFetching: isCommissionsFetching,
    isError: isCommissionsError,
    refetch: refetchCommissions,
  } = useGetAdminCommissionsQuery(queryParams);

  const {
    data: reportResponse,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useGetAdminCommissionsReportQuery();

  const {
    data: rulesResponse,
    refetch: refetchRules,
  } = useGetAdminCommissionRulesQuery({ limit: 1 });

  const activeRule = rulesResponse?.data?.activeRule ?? null;
  const reportData = reportResponse?.data ?? null;

  const commissionsList: AdminCommissionRecord[] = React.useMemo(
    () => commissionsResponse?.data?.items || [],
    [commissionsResponse?.data?.items]
  );

  const totalCommissions = commissionsResponse?.data?.total || 0;

  const isFiltered =
    statusFilter !== "ALL" ||
    agentFilter !== "ALL" ||
    bookingIdFilter.trim().length > 0;

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setAgentFilter("ALL");
    setBookingIdFilter("");
    setPage(1);
  };

  const handleRefreshAll = () => {
    refetchCommissions();
    refetchReport();
    refetchRules();
  };

  return (
    <div className="space-y-6" data-testid="admin-commissions-view">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-slate-900">
            Commissions Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
            Audit partner agent commissions, adjust verified earnings with mandatory compliance reasons, and configure the platform-wide commission policy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isCommissionsFetching}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh all commissions data"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isCommissionsFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          data-testid="commissions-action-feedback"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-medium shadow-2xs transition-all ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>{feedback.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Dismiss feedback alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation Switcher */}
      <div className="flex border-b border-slate-200/80">
        <button
          type="button"
          data-testid="tab-commission-ledger"
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "ledger"
              ? "border-[#3297A3] text-[#3297A3]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Commission Ledger</span>
          {totalCommissions > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {totalCommissions}
            </span>
          )}
        </button>

        <button
          type="button"
          data-testid="tab-commission-rules"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "rules"
              ? "border-[#3297A3] text-[#3297A3]"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Commission Policy & Rules</span>
        </button>
      </div>

      {/* Tab 1: Commission Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Overview Summary Cards */}
          <CommissionsSummaryCards
            reportData={reportData}
            activeRule={activeRule}
            isLoading={isReportLoading}
          />

          {/* Ledger Toolbar */}
          <CommissionsToolbar
            statusFilter={statusFilter}
            onStatusChange={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
            agentFilter={agentFilter}
            onAgentChange={(agentId) => {
              setAgentFilter(agentId);
              setPage(1);
            }}
            bookingIdFilter={bookingIdFilter}
            onBookingIdChange={(id) => {
              setBookingIdFilter(id);
              setPage(1);
            }}
            limit={limit}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onReset={handleResetFilters}
            isFiltered={isFiltered}
          />

          {/* Ledger Table */}
          <CommissionsTable
            commissions={commissionsList}
            isLoading={isCommissionsLoading}
            isFetching={isCommissionsFetching}
            isError={isCommissionsError}
            onRetry={refetchCommissions}
            onViewDetails={(commission) => setSelectedCommissionForDetails(commission)}
            onAdjustCommission={(commission) => setSelectedCommissionForAdjust(commission)}
            onResetFilters={isFiltered ? handleResetFilters : undefined}
          />

          {/* Ledger Server Pagination */}
          <CommissionsPagination
            page={page}
            limit={limit}
            total={totalCommissions}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Tab 2: Commission Rules Management */}
      {activeTab === "rules" && <CommissionRulesTab />}

      {/* Modal Dialog: Commission Details & Audit History */}
      <CommissionDetailsDialog
        commissionId={selectedCommissionForDetails?.id ?? null}
        isOpen={Boolean(selectedCommissionForDetails)}
        onClose={() => setSelectedCommissionForDetails(null)}
        onAdjust={(commission) => {
          setSelectedCommissionForDetails(null);
          setSelectedCommissionForAdjust(commission);
        }}
      />

      {/* Modal Dialog: Adjust Commission Amount */}
      <AdjustCommissionDialog
        commission={selectedCommissionForAdjust}
        isOpen={Boolean(selectedCommissionForAdjust)}
        onClose={() => setSelectedCommissionForAdjust(null)}
        onSuccess={(message) => {
          setFeedback({ type: "success", message });
          refetchCommissions();
          refetchReport();
        }}
      />
    </div>
  );
}
