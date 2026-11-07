"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewBookingPriceApprovalMutation } from "../../api/admin-api";
import type { OperationalBookingRecord } from "../../types/admin-bookings";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";

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
  const [approvedPrice, setApprovedPrice] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

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
