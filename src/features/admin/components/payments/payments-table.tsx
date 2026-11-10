"use client";

import * as React from "react";
import {
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "../../utils/format";
import type { AdminPaymentRecord } from "../../types/admin-payments";
import { PaymentStatusBadge, PaymentMethodBadge } from "./payment-status-badge";
import { BookingSourceBadge } from "../bookings/booking-status-badges";
import { PaymentActionsMenu } from "./payment-actions-menu";
import { Button } from "@/components/ui/button";

export interface PaymentsTableProps {
  payments: AdminPaymentRecord[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onViewDetails: (payment: AdminPaymentRecord) => void;
  onVerifyPayment?: (payment: AdminPaymentRecord) => void;
  onRecordPayment?: (payment: AdminPaymentRecord) => void;
  canVerify?: boolean;
  canRecord?: boolean;
}

export function PaymentsTable({
  payments,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onViewDetails,
  onVerifyPayment,
  onRecordPayment,
  canVerify = false,
  canRecord = false,
}: PaymentsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Loading Skeleton
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-t-2xl">
        <table
          className="w-full text-left border-collapse text-xs"
          data-testid="admin-payments-table-loading"
        >
          <thead>
            <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
              <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">Payment ID</th>
              <th scope="col" className="min-w-[140px] px-4 py-3.5 font-semibold">Booking ID</th>
              <th scope="col" className="min-w-[150px] px-4 py-3.5 font-semibold">Source / Agent</th>
              <th scope="col" className="min-w-[140px] px-4 py-3.5 font-semibold">Customer</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Amount</th>
              <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">Method</th>
              <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">Status</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Date</th>
              <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAED] bg-white">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3.5">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-20 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-16 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-5 w-20 rounded-full bg-slate-100" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-5 w-24 rounded-full bg-slate-100" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-destructive/20 shadow-xs"
        data-testid="admin-payments-table-error"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-outfit text-base font-bold text-[#18282A]">
          Failed to load payments
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[#74818A]">
          {errorMessage || "We encountered an issue communicating with the payments service. Please retry."}
        </p>
        {onRetry && (
          <Button
            type="button"
            size="sm"
            onClick={onRetry}
            className="mt-4 gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#135564] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (payments.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-[#E5EAED] shadow-xs"
        data-testid="admin-payments-table-empty"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#176779] mb-3">
          <CreditCard className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-outfit text-base font-bold text-[#18282A]">
          No payment records found
        </h3>
        <p className="mt-1 max-w-xs text-xs text-[#74818A]">
          No payments match your current filter criteria or none have been submitted yet.
        </p>
      </div>
    );
  }

  // 4. Data Table
  return (
    <div className="overflow-x-auto rounded-t-2xl">
      <table
        className="w-full text-left border-collapse text-xs"
        data-testid="admin-payments-table"
      >
        <thead>
          <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
            <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">Payment ID</th>
            <th scope="col" className="min-w-[140px] px-4 py-3.5 font-semibold">Booking ID</th>
            <th scope="col" className="min-w-[150px] px-4 py-3.5 font-semibold">Source / Agent</th>
            <th scope="col" className="min-w-[140px] px-4 py-3.5 font-semibold">Customer</th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Amount</th>
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">Method</th>
            <th scope="col" className="min-w-[140px] px-4 py-3.5 font-semibold">Status</th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Date</th>
            <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAED] bg-white">
          {payments.map((payment) => {
            const shortId = payment.id.slice(0, 8);
            const shortBookingId = payment.bookingId.slice(0, 8);
            const shortCustomerId = payment.customerId.slice(0, 8);

            return (
              <tr
                key={payment.id}
                onClick={() => onViewDetails(payment)}
                className="hover:bg-[#F8FAFB]/75 transition-colors cursor-pointer group"
                data-testid={`payment-row-${payment.id}`}
              >
                {/* 1. Payment ID */}
                <td className="px-4 py-3.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#18282A] group-hover:text-[#176779]">
                      #{shortId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, payment.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#74818A] hover:text-[#18282A] transition-opacity"
                      aria-label="Copy full payment ID"
                      title="Copy full payment ID"
                    >
                      {copiedId === payment.id ? (
                        <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </td>

                {/* 2. Booking ID */}
                <td className="px-4 py-3.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#18282A]">
                      #{shortBookingId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, payment.bookingId)}
                      className="opacity-0 group-hover:opacity-100 text-[#74818A] hover:text-[#18282A] transition-opacity"
                      aria-label="Copy full booking ID"
                      title="Copy full booking ID"
                    >
                      {copiedId === payment.bookingId ? (
                        <Check className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </td>

                {/* 3. Source / Originating Agent Attribution */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex flex-col gap-1 max-w-[150px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <BookingSourceBadge
                        source={payment.booking?.source || (payment.booking?.agentId ? "AGENT" : "DIRECT")}
                      />
                    </div>
                    {payment.booking?.agent ? (
                      <div className="text-[11px] leading-tight">
                        <span className="font-medium text-[#18282A] truncate block" title={payment.booking.agent.name}>
                          {payment.booking.agent.name}
                        </span>
                        {payment.booking.agent.agentProfile?.agencyName && (
                          <span
                            className="inline-block text-[10px] text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-semibold truncate max-w-full mt-0.5"
                            title={payment.booking.agent.agentProfile.agencyName}
                          >
                            {payment.booking.agent.agentProfile.agencyName}
                          </span>
                        )}
                      </div>
                    ) : payment.booking?.createdBy && payment.booking.source !== "CUSTOMER" ? (
                      <span className="text-[11px] text-[#74818A] truncate" title={`Created by ${payment.booking.createdBy.name} (${payment.booking.createdBy.role})`}>
                        By: {payment.booking.createdBy.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#96A4AB] italic">Direct Booking</span>
                    )}
                  </div>
                </td>

                {/* 4. Customer Details */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="max-w-[140px]">
                    <p className="font-medium text-[#18282A] truncate" title={payment.customer?.name || `Customer #${shortCustomerId}`}>
                      {payment.customer?.name || `Customer #${shortCustomerId}`}
                    </p>
                    {payment.customer?.email ? (
                      <p className="text-[11px] text-[#74818A] truncate" title={payment.customer.email}>
                        {payment.customer.email}
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-[#96A4AB]">
                        #{shortCustomerId}
                      </p>
                    )}
                  </div>
                </td>

                {/* 4. Amount */}
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-[#18282A]">
                    ฿{Number(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>

                {/* 5. Method */}
                <td className="px-4 py-3.5">
                  <PaymentMethodBadge method={payment.method} />
                </td>

                {/* 6. Status */}
                <td className="px-4 py-3.5">
                  <PaymentStatusBadge status={payment.status} />
                </td>

                {/* 7. Date */}
                <td className="px-4 py-3.5 text-[#74818A]">
                  {formatDate(payment.createdAt)}
                </td>

                {/* 8. Actions Menu */}
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <PaymentActionsMenu
                    payment={payment}
                    onViewDetails={onViewDetails}
                    onVerifyPayment={onVerifyPayment}
                    onRecordPayment={onRecordPayment}
                    canVerify={canVerify}
                    canRecord={canRecord}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
