"use client";

import * as React from "react";
import {
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useGetAdminPaymentByIdQuery } from "../../api/admin-api";
import type { AdminPaymentRecord } from "../../types/admin-payments";
import { PaymentStatusBadge, PaymentMethodBadge } from "./payment-status-badge";
import { Button } from "@/components/ui/button";

export interface PaymentDetailsDialogProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: (payment: AdminPaymentRecord) => void;
  onRecord?: (payment: AdminPaymentRecord) => void;
  canVerify?: boolean;
  canRecord?: boolean;
}

export function PaymentDetailsDialog({
  paymentId,
  isOpen,
  onClose,
  onVerify,
  onRecord,
  canVerify = false,
  canRecord = false,
}: PaymentDetailsDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const {
    data: paymentResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminPaymentByIdQuery(paymentId as string, {
    skip: !isOpen || !paymentId,
  });

  const payment: AdminPaymentRecord | undefined = paymentResponse?.data;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isEligibleForVerify = payment?.status === "SUBMITTED" && canVerify && !!onVerify;
  const isEligibleForRecord = payment?.status === "INITIATED" && canRecord && !!onRecord;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Payment Details"
      description="Inspect transaction details, payment receipt and review history."
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#176779] border-t-transparent" />
          <p className="text-xs text-[#74818A]">Loading payment information...</p>
        </div>
      ) : isError || !payment ? (
        <div className="py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h4 className="font-outfit text-base font-bold text-[#18282A]">
            Failed to load payment
          </h4>
          <p className="mt-1 text-xs text-[#74818A]">
            Could not retrieve details for this payment. Please try again.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-[#176779] text-white hover:bg-[#135564]"
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-6 text-xs text-[#18282A]">
          {/* 1. Header Highlights Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4.5">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
                Transaction Amount
              </span>
              <div className="mt-1 font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
                ฿{Number(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentStatusBadge status={payment.status} />
              <PaymentMethodBadge method={payment.method} />
            </div>
          </div>

          {/* 2. Key Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment ID */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#74818A]">Payment ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy("paymentId", payment.id)}
                  className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  aria-label="Copy Payment ID"
                >
                  {copiedField === "paymentId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[11px] break-all font-medium text-[#18282A]">
                {payment.id}
              </p>
            </div>

            {/* Booking ID */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#74818A]">Booking ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy("bookingId", payment.bookingId)}
                  className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  aria-label="Copy Booking ID"
                >
                  {copiedField === "bookingId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[11px] break-all font-medium text-[#18282A]">
                {payment.bookingId}
              </p>
            </div>

            {/* Customer ID */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#74818A]">Customer ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy("customerId", payment.customerId)}
                  className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  aria-label="Copy Customer ID"
                >
                  {copiedField === "customerId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[11px] break-all font-medium text-[#18282A]">
                {payment.customerId}
              </p>
            </div>

            {/* Transaction Reference */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#74818A]">Transaction Reference</span>
              <p className="mt-1.5 font-mono text-[11px] break-all font-semibold text-[#18282A]">
                {payment.reference || "None provided"}
              </p>
            </div>
          </div>

          {/* 3. Booking Relationship Information (if included) */}
          {payment.booking && (
            <div className="rounded-xl border border-[#E5EAED] bg-white p-4">
              <h5 className="font-outfit text-xs font-bold text-[#18282A] mb-3">
                Associated Booking Information
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-[#74818A]">Booking Status</span>
                  <p className="font-semibold text-[#18282A] mt-0.5">{payment.booking.status}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#74818A]">Payment Status</span>
                  <p className="font-semibold text-[#18282A] mt-0.5">{payment.booking.paymentStatus}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#74818A]">Final Price</span>
                  <p className="font-semibold text-[#18282A] mt-0.5">
                    {payment.booking.finalPrice !== null
                      ? `฿${Number(payment.booking.finalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#74818A]">Service ID</span>
                  <p className="font-mono text-[10px] text-[#74818A] truncate mt-0.5" title={payment.booking.serviceId}>
                    {payment.booking.serviceId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Notes & Receipts */}
          {(payment.receiptNote || payment.reviewNotes) && (
            <div className="space-y-3">
              {payment.receiptNote && (
                <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5">
                  <span className="text-[11px] font-semibold text-[#74818A]">Customer Receipt Note</span>
                  <p className="mt-1 text-xs text-[#18282A] whitespace-pre-wrap leading-relaxed">
                    {payment.receiptNote}
                  </p>
                </div>
              )}
              {payment.reviewNotes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                  <span className="text-[11px] font-semibold text-amber-800">Admin Review Notes</span>
                  <p className="mt-1 text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">
                    {payment.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. Reviewer & Audit Information */}
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3.5 space-y-2 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#74818A]">Created Date:</span>
              <span className="font-medium text-[#18282A]">{payment.createdAt ? new Date(payment.createdAt).toLocaleString("en-US") : "—"}</span>
            </div>
            {payment.submittedAt && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#74818A]">Receipt Submitted Date:</span>
                <span className="font-medium text-[#18282A]">{new Date(payment.submittedAt).toLocaleString("en-US")}</span>
              </div>
            )}
            {payment.receivedAt && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#74818A]">Settlement Received Date:</span>
                <span className="font-medium text-[#18282A]">{new Date(payment.receivedAt).toLocaleString("en-US")}</span>
              </div>
            )}
            {payment.reviewedById && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#74818A]">Reviewed By (Staff ID):</span>
                <span className="font-mono font-medium text-[#18282A]">{payment.reviewedById}</span>
              </div>
            )}
            {payment.reviewedAt && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#74818A]">Reviewed At:</span>
                <span className="font-medium text-[#18282A]">{new Date(payment.reviewedAt).toLocaleString("en-US")}</span>
              </div>
            )}
          </div>

          {/* 6. Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5EAED]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-[#E5EAED] px-4 text-xs font-medium"
            >
              Close
            </Button>
            {isEligibleForRecord && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onRecord!(payment);
                }}
                className="rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#135564]"
              >
                Record Receipt
              </Button>
            )}
            {isEligibleForVerify && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onVerify!(payment);
                }}
                className="rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Verify / Review
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
