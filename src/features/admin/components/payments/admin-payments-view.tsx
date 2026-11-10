"use client";

import * as React from "react";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import {
  useGetAdminPaymentsQuery,
  useGetAdminPaymentsReportQuery,
  useGetAdminAgentsQuery,
} from "../../api/admin-api";
import { usePermissions } from "../../hooks/use-permissions";
import { PaymentsHeader } from "./payments-header";
import { PaymentsSummaryCards } from "./payments-summary-cards";
import { PaymentsToolbar } from "./payments-toolbar";
import { PaymentsTable } from "./payments-table";
import { PaymentsPagination } from "./payments-pagination";
import { PaymentDetailsDialog } from "./payment-details-dialog";
import { VerifyPaymentDialog } from "./verify-payment-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import type {
  AdminPaymentRecord,
  PaymentRecordStatus,
  PaymentMethod,
} from "../../types/admin-payments";

interface ActionFeedback {
  type: "success" | "error";
  message: string;
}

export function AdminPaymentsView() {
  // 1. Permission checks
  const { hasPermission, isAdmin } = usePermissions();
  const canVerify = isAdmin || hasPermission("payments.verify");
  const canRecord = isAdmin || hasPermission("payments.record");
  const canViewReports = isAdmin || hasPermission("reports.view");

  // 2. Pagination & Filter State
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");
  const [bookingIdFilter, setBookingIdFilter] = React.useState<string>("");
  const [agentIdFilter, setAgentIdFilter] = React.useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = React.useState<string>("ALL");

  // 3. Modal Dialog States
  const [paymentForDetails, setPaymentForDetails] = React.useState<AdminPaymentRecord | null>(null);
  const [paymentForVerify, setPaymentForVerify] = React.useState<AdminPaymentRecord | null>(null);
  const [paymentForRecord, setPaymentForRecord] = React.useState<AdminPaymentRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState<boolean>(false);

  // 4. Feedback Alert State
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 5. Query Parameters for Payments List
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      status:
        statusFilter !== "ALL"
          ? (statusFilter as PaymentRecordStatus)
          : undefined,
      method:
        methodFilter !== "ALL"
          ? (methodFilter as PaymentMethod)
          : undefined,
      bookingId:
        bookingIdFilter.trim().length > 0
          ? bookingIdFilter.trim()
          : undefined,
      agentId:
        agentIdFilter !== "ALL"
          ? agentIdFilter
          : undefined,
      source:
        sourceFilter !== "ALL"
          ? (sourceFilter as any)
          : undefined,
    };
  }, [page, limit, statusFilter, methodFilter, bookingIdFilter, agentIdFilter, sourceFilter]);

  // 6. RTK Query Hooks
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    isError: isPaymentsError,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetAdminPaymentsQuery(queryParams);

  const {
    data: reportResponse,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useGetAdminPaymentsReportQuery(undefined, {
    skip: !canViewReports,
  });

  const {
    data: agentsResponse,
  } = useGetAdminAgentsQuery();

  const agentsList = React.useMemo(
    () => agentsResponse?.data?.items || [],
    [agentsResponse?.data?.items]
  );

  const paymentsList: AdminPaymentRecord[] = React.useMemo(
    () => paymentsResponse?.data?.items || [],
    [paymentsResponse?.data?.items]
  );

  const totalPayments = paymentsResponse?.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalPayments / limit));

  // Find all initiated payments in current view to pass as options in Record Payment modal
  const initiatedPayments = React.useMemo(
    () => paymentsList.filter((p) => p.status === "INITIATED"),
    [paymentsList]
  );

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    methodFilter !== "ALL" ||
    bookingIdFilter.trim().length > 0 ||
    agentIdFilter !== "ALL" ||
    sourceFilter !== "ALL";

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setBookingIdFilter("");
    setAgentIdFilter("ALL");
    setSourceFilter("ALL");
    setPage(1);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleMethodFilterChange = (newMethod: string) => {
    setMethodFilter(newMethod);
    setPage(1);
  };

  const handleBookingIdFilterChange = (newBookingId: string) => {
    setBookingIdFilter(newBookingId);
    setPage(1);
  };

  const handleAgentIdFilterChange = (newAgentId: string) => {
    setAgentIdFilter(newAgentId);
    setPage(1);
  };

  const handleSourceFilterChange = (newSource: string) => {
    setSourceFilter(newSource);
    setPage(1);
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchPayments(),
      canViewReports ? refetchReport() : Promise.resolve(),
    ]);
  };

  const handleOpenRecordPayment = (payment?: AdminPaymentRecord) => {
    if (payment) {
      setPaymentForRecord(payment);
    } else {
      setPaymentForRecord(null);
    }
    setIsRecordModalOpen(true);
  };

  const handleSuccessAction = (message: string) => {
    setFeedback({
      type: "success",
      message,
    });
    handleRefresh();
  };

  const errorMessage = paymentsError
    ? formatErrorMessage(paymentsError, "Failed to load payment records.")
    : undefined;

  return (
    <div className="space-y-6" data-testid="admin-payments-view">
      {/* 1. Page Header */}
      <PaymentsHeader
        onRefresh={handleRefresh}
        onRecordPayment={() => handleOpenRecordPayment()}
        isRefreshing={isPaymentsFetching}
        canRecord={canRecord}
      />

      {/* 2. Feedback Notification */}
      {feedback && (
        <div data-testid="payments-feedback-banner">
          {feedback.type === "success" ? (
            <SuccessAlert
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          ) : (
            <ErrorAlert
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}
        </div>
      )}

      {/* 3. Summary Cards */}
      <PaymentsSummaryCards
        reportData={reportResponse?.data}
        totalPaymentsCount={totalPayments}
        isLoading={isPaymentsLoading || (canViewReports && isReportLoading)}
      />

      {/* 4. Toolbar: Status Tabs, Method Select, Search */}
      <PaymentsToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        methodFilter={methodFilter}
        onMethodFilterChange={handleMethodFilterChange}
        bookingIdFilter={bookingIdFilter}
        onBookingIdFilterChange={handleBookingIdFilterChange}
        agentIdFilter={agentIdFilter}
        onAgentIdFilterChange={handleAgentIdFilterChange}
        sourceFilter={sourceFilter}
        onSourceFilterChange={handleSourceFilterChange}
        agents={agentsList}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Payments Table Container */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs">
        <PaymentsTable
          payments={paymentsList}
          isLoading={isPaymentsLoading}
          isError={isPaymentsError}
          errorMessage={errorMessage}
          onRetry={handleRefresh}
          onViewDetails={(payment) => setPaymentForDetails(payment)}
          onVerifyPayment={(payment) => setPaymentForVerify(payment)}
          onRecordPayment={(payment) => handleOpenRecordPayment(payment)}
          canVerify={canVerify}
          canRecord={canRecord}
        />

        {/* 6. Server-Side Pagination */}
        {!isPaymentsLoading && !isPaymentsError && paymentsList.length > 0 && (
          <div className="border-t border-[#E5EAED] px-4 py-3 sm:px-6">
            <PaymentsPagination
              page={page}
              totalPages={totalPages}
              total={totalPayments}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              isFetching={isPaymentsFetching}
            />
          </div>
        )}
      </div>

      {/* 7. Payment Details Modal */}
      <PaymentDetailsDialog
        paymentId={paymentForDetails?.id || null}
        isOpen={!!paymentForDetails}
        onClose={() => setPaymentForDetails(null)}
        onVerify={(payment) => {
          setPaymentForDetails(null);
          setPaymentForVerify(payment);
        }}
        onRecord={(payment) => {
          setPaymentForDetails(null);
          handleOpenRecordPayment(payment);
        }}
        canVerify={canVerify}
        canRecord={canRecord}
      />

      {/* 8. Verify Payment Modal */}
      <VerifyPaymentDialog
        payment={paymentForVerify}
        isOpen={!!paymentForVerify}
        onClose={() => setPaymentForVerify(null)}
        onSuccess={handleSuccessAction}
      />

      {/* 9. Record Manual Payment Modal */}
      <RecordPaymentDialog
        payment={paymentForRecord}
        initiatedPayments={initiatedPayments}
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setPaymentForRecord(null);
        }}
        onSuccess={handleSuccessAction}
      />
    </div>
  );
}
