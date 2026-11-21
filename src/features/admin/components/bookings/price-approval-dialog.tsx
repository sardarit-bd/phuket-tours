"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewBookingPriceApprovalMutation } from "../../api/admin-api";
import type { OperationalBookingRecord } from "../../types/admin-bookings";
import { CheckCircle, XCircle, Loader2, Tag, Calendar, UserCheck, AlertTriangle } from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { formatReportMoney, formatDate } from "../../utils/format";

export interface PriceApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
  onSuccess?: () => void;
}

interface PriceApprovalFormProps {
  booking: OperationalBookingRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

function PriceApprovalForm({
  booking,
  onClose,
  onSuccess,
}: PriceApprovalFormProps) {
  const [decision, setDecision] = React.useState<"APPROVED" | "REJECTED">("APPROVED");
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const standardRetailPrice = Number(booking.basePrice) || 0;
  const requestedAgentPrice =
    booking.priceApproval?.requestedPrice !== undefined && booking.priceApproval?.requestedPrice !== null
      ? Number(booking.priceApproval.requestedPrice)
      : booking.proposedPrice !== undefined && booking.proposedPrice !== null
      ? Number(booking.proposedPrice)
      : Number(booking.finalPrice) || 0;

  const [approvedPrice, setApprovedPrice] = React.useState<string>(
    requestedAgentPrice > 0 ? String(requestedAgentPrice) : ""
  );

  const priceDifference = standardRetailPrice - requestedAgentPrice;
  const discountPct = standardRetailPrice > 0 ? Math.round((priceDifference / standardRetailPrice) * 10000) / 100 : 0;

  const [reviewPriceApproval, { isLoading }] = useReviewBookingPriceApprovalMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const priceNum = decision === "APPROVED" ? Number(approvedPrice) : undefined;
    if (decision === "APPROVED" && (priceNum === undefined || isNaN(priceNum) || priceNum < 0)) {
      setErrorMessage("Please provide a valid approved price.");
      return;
    }

    try {
      await reviewPriceApproval({
        bookingId: booking.id,
        status: decision,
        approvedPrice: priceNum,
        notes: notes.trim() ? notes.trim() : undefined,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to process price approval review. Please retry.",
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="price-approval-dialog">
      {errorMessage && (
        <ErrorAlert
          data-testid="price-approval-error"
          description={errorMessage}
        />
      )}

      {isSuccess && (
        <SuccessAlert
          data-testid="price-approval-success"
          description={`Price proposal ${decision.toLowerCase()} successfully!`}
        />
      )}

      {/* Booking Overview & Originating Agent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs">
        <div>
          <span className="text-[#74818A] block">Lead Customer:</span>
          <p className="font-semibold text-[#18282A] text-sm mt-0.5">
            {booking.customer?.name || "Guest Customer"}
          </p>
          <p className="text-[11px] text-[#74818A]">{booking.customer?.email || "No email"}</p>
        </div>
        <div>
          <span className="text-[#74818A] block">Originating Agent / Agency:</span>
          <p className="font-semibold text-[#176779] text-sm mt-0.5 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            <span>{booking.agent?.name || "Agent"}</span>
          </p>
          <p className="text-[11px] text-[#74818A]">
            {booking.agent?.agentProfile?.agencyName || "Registered Partner Agency"}
          </p>
        </div>
      </div>

      {/* Pricing Comparison Card */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
          <div className="flex items-center gap-1.5 font-bold text-[#18282A] text-xs">
            <Tag className="h-4 w-4 text-[#176779]" />
            <span>Agent Pricing Breakdown</span>
          </div>
          <span className="rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
            Approval Required
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[#74818A] block text-[11px]">Standard Retail Price:</span>
            <span className="font-bold text-[#18282A]" data-testid="review-standard-price">
              {formatReportMoney(standardRetailPrice, booking.currency)}
            </span>
          </div>
          <div>
            <span className="text-[#74818A] block text-[11px]">Agent Submitted Price:</span>
            <span className="font-bold text-[#176779]" data-testid="review-agent-submitted-price">
              {formatReportMoney(requestedAgentPrice, booking.currency)}
            </span>
          </div>
          <div>
            <span className="text-[#74818A] block text-[11px]">Requested Adjustment:</span>
            <span className={`font-bold ${priceDifference > 0 ? "text-rose-700" : "text-[#18282A]"}`}>
              {priceDifference > 0
                ? `-${formatReportMoney(priceDifference, booking.currency)} (${discountPct}%)`
                : formatReportMoney(priceDifference, booking.currency)}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-purple-50/60 border border-purple-100 p-2.5 text-[11px] text-purple-950 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
          <span>
            <strong>Reason for Price Approval:</strong> The agent submitted a custom proposed rate of{" "}
            <strong>{formatReportMoney(requestedAgentPrice, booking.currency)}</strong>, which exceeds the agent's
            pre-approved automatic discount threshold compared to the standard retail rate of{" "}
            <strong>{formatReportMoney(standardRetailPrice, booking.currency)}</strong>.
          </span>
        </div>
      </div>

      {/* Decision Toggle */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Administrative Decision
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDecision("APPROVED")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
              decision === "APPROVED"
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
            }`}
            data-testid="decision-approve-btn"
          >
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Approve Price</span>
          </button>

          <button
            type="button"
            onClick={() => setDecision("REJECTED")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
              decision === "REJECTED"
                ? "border-rose-600 bg-rose-50 text-rose-800"
                : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
            }`}
            data-testid="decision-reject-btn"
          >
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>Reject (Cancel)</span>
          </button>
        </div>
      </div>

      {/* Approved Price Input (if approved) */}
      {decision === "APPROVED" && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#18282A]">
            Approved Final Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={approvedPrice}
            onChange={(e) => setApprovedPrice(e.target.value)}
            placeholder="e.g. 85.00"
            className="h-10 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] px-3.5 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
            data-testid="approved-price-input"
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Decision Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Add explanation for approving or rejecting this negotiated price..."
          className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
          data-testid="price-approval-notes"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-[#E5EAED] pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`${
            decision === "APPROVED"
              ? "bg-emerald-700 hover:bg-emerald-800"
              : "bg-rose-700 hover:bg-rose-800"
          } text-white text-xs px-4 font-semibold`}
          data-testid="submit-price-approval-btn"
        >
          {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {isLoading ? "Submitting..." : `Confirm ${decision === "APPROVED" ? "Approval" : "Rejection"}`}
        </Button>
      </div>
    </form>
  );
}

export function PriceApprovalDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: PriceApprovalDialogProps) {
  if (!booking) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Review Negotiated Price"
      description={`Booking ${booking.id.slice(0, 8)}... (${booking.service.name})`}
      size="md"
    >
      <PriceApprovalForm
        key={booking.id}
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
