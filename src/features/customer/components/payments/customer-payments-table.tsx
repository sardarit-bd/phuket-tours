"use client";

import * as React from "react";
import Link from "next/link";
import { useGetCustomerPaymentsQuery } from "../../api/customer-api";
import type { CustomerPaymentRecord, CustomerPaymentStatus } from "../../types/customer";
import { AgentPaymentStatusBadge } from "@/features/agent/components/common/agent-status-badges";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertCircle,
  Wallet,
  ArrowLeft,
} from "lucide-react";

const STATUS_TABS: { label: string; value: CustomerPaymentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Initiated", value: "INITIATED" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatAmount(amount?: number): string {
  if (typeof amount !== "number") return "฿0";
  return `฿${amount.toLocaleString("en-US")}`;
}

function methodLabel(method: string): string {
  switch (method) {
    case "BANK_TRANSFER": return "Bank Transfer";
    case "CASH": return "Cash";
    case "OTHER": return "Other";
    default: return method;
  }
}

export function CustomerPaymentsTable({
  bookingId,
}: {
  bookingId?: string;
}) {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<CustomerPaymentStatus | "ALL">("ALL");
  const [selectedPayment, setSelectedPayment] =
    React.useState<CustomerPaymentRecord | null>(null);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: 10,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      ...(bookingId ? { bookingId } : {}),
    }),
    [page, statusFilter, bookingId]
  );

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCustomerPaymentsQuery(queryParams);

  const payments: CustomerPaymentRecord[] = response?.data?.items || [];
  const total = response?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const currentPage = response?.data?.page ?? page;

  const handleTabChange = (status: CustomerPaymentStatus | "ALL") => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-4" data-testid="customer-payments-module">
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#E5EAED]">
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
              data-testid={`customer-payment-filter-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          );
        })}

        <div className="ml-auto">
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="h-8 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
            aria-label="Refresh payments"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                isFetching ? "animate-spin text-[#176779]" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
          data-testid="customer-payments-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Failed to load payments. Please check your connection and retry.</span>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Payments list */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6" data-testid="customer-payments-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-14 text-center" data-testid="customer-payments-empty">
            <Wallet className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 font-outfit text-base font-bold text-[#18282A]">
              No payment records
            </h4>
            <p className="mt-1 text-xs text-[#74818A] max-w-sm mx-auto">
              {statusFilter !== "ALL"
                ? "No payments match this status filter. Try another filter."
                : bookingId
                  ? "No payments have been made for this booking yet."
                  : "You haven't made any payments yet. Payment records will appear here once you pay for a booking."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="customer-payments-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="px-4 py-3">Payment Ref</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-[#F8FAFB] transition-colors"
                    data-testid={`customer-payment-row-${payment.id}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-medium text-[#18282A] select-all">
                        {payment.id.slice(0, 8)}…
                      </div>
                      {payment.reference && (
                        <div className="text-[10px] text-[#74818A]">
                          Ref: {payment.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[#18282A] font-medium">
                      {methodLabel(payment.method)}
                    </td>
                    <td className="px-4 py-3.5">
                      <AgentPaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[#18282A]">
                      {formatDate(payment.submittedAt ?? payment.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-[#18282A]">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="h-8 px-2.5 text-xs text-[#176779] hover:bg-teal-50 hover:text-[#135664]"
                        data-testid={`view-payment-${payment.id}`}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        <span>Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs text-[#74818A]">
            <div>
              Showing page{" "}
              <span className="font-semibold text-[#18282A]">{currentPage}</span> of{" "}
              <span className="font-semibold text-[#18282A]">{totalPages}</span>{" "}
              ({total} total payments)
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                className="h-8 px-2.5 text-xs"
                data-testid="customer-payment-pagination-prev"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isFetching}
                className="h-8 px-2.5 text-xs"
                data-testid="customer-payment-pagination-next"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment detail dialog */}
      {selectedPayment && (
        <CustomerPaymentDetailDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

/* ── Payment detail dialog ─────────────────────────────────────────── */

function CustomerPaymentDetailDialog({
  payment,
  onClose,
}: {
  payment: CustomerPaymentRecord;
  onClose: () => void;
}) {
  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      data-testid="customer-payment-detail-dialog"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E5EAED] bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-[#E5EAED] bg-[#F8FAFB] px-5 py-4">
          <div className="flex items-center justify-between">
            <h4 className="font-outfit text-sm font-bold text-[#18282A]">
              Payment Details
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="text-[#74818A] hover:text-[#18282A] cursor-pointer"
              aria-label="Close payment details"
            >
              ✕
            </button>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#74818A]">
            {payment.id.slice(0, 8)}…
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Status + amount */}
          <div className="flex items-center justify-between">
            <AgentPaymentStatusBadge status={payment.status} />
            <span className="text-xl font-bold text-[#18282A]">
              {formatAmount(payment.amount)}
            </span>
          </div>

          {/* Details grid */}
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-[#74818A]">Method</dt>
              <dd className="mt-0.5 font-medium text-[#18282A]">{methodLabel(payment.method)}</dd>
            </div>
            <div>
              <dt className="text-[#74818A]">Reference</dt>
              <dd className="mt-0.5 font-medium text-[#18282A] break-all">
                {payment.reference || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[#74818A]">Created</dt>
              <dd className="mt-0.5 font-medium text-[#18282A]">
                {formatDate(payment.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[#74818A]">Submitted</dt>
              <dd className="mt-0.5 font-medium text-[#18282A]">
                {formatDate(payment.submittedAt)}
              </dd>
            </div>
            {payment.receiptNote && (
              <div className="col-span-2">
                <dt className="text-[#74818A]">Receipt note</dt>
                <dd className="mt-0.5 font-medium text-[#18282A]">{payment.receiptNote}</dd>
              </div>
            )}
            {payment.reviewNotes && (
              <div className="col-span-2">
                <dt className="text-[#74818A]">Review notes</dt>
                <dd className="mt-0.5 font-medium text-[#18282A]">{payment.reviewNotes}</dd>
              </div>
            )}
          </dl>

          {/* Booking link */}
          {payment.bookingId && (
            <div className="border-t border-[#E5EAED] pt-3">
              <Link
                href={`/dashboard/bookings/${payment.bookingId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#176779] hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                View related booking
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
