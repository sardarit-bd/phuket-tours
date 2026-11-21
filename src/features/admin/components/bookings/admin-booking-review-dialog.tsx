"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewAdminPendingReservationMutation } from "../../api/admin-api";
import type { OperationalBookingRecord } from "../../types/admin-bookings";
import { formatReportMoney, formatDate } from "../../utils/format";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
  AlertCircle,
  Calendar,
  User,
  Compass,
  DollarSign,
  UserCheck,
  FileText,
  Sliders,
} from "lucide-react";

export interface BookingReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
  onSuccess?: () => void;
}

export function BookingReviewDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: BookingReviewDialogProps) {
  const [reviewReservation, { isLoading }] = useReviewAdminPendingReservationMutation();

  const [mode, setMode] = React.useState<"APPROVE" | "REJECT">("APPROVE");
  const [isPartialApproval, setIsPartialApproval] = React.useState<boolean>(false);
  const [approvedDiscountValue, setApprovedDiscountValue] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [rejectionReason, setRejectionReason] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const discountReq = booking?.discountRequests?.[0];
  const origPriceNum = booking ? Number(booking.basePrice) || 0 : 0;
  const partialValNum = parseFloat(approvedDiscountValue) || 0;

  // Initialize state when booking changes
  React.useEffect(() => {
    if (booking) {
      setMode("APPROVE");
      setIsPartialApproval(false);
      setApprovedDiscountValue(discountReq ? String(discountReq.discountValue) : "");
      setNotes("");
      setRejectionReason("");
      setErrorMessage(null);
    }
  }, [booking, discountReq]);

  // Calculations for partial approval
  const partialPreview = React.useMemo(() => {
    if (!discountReq) {
      return { discountAmount: 0, finalPrice: origPriceNum, isValid: true, error: null };
    }
    const requestedVal = Number(discountReq.discountValue);

    if (partialValNum <= 0) {
      return {
        discountAmount: 0,
        finalPrice: origPriceNum,
        isValid: false,
        error: "Partial discount value must be greater than 0",
      };
    }

    if (partialValNum > requestedVal) {
      return {
        discountAmount: 0,
        finalPrice: origPriceNum,
        isValid: false,
        error: `Partial value cannot exceed requested discount (${requestedVal}${discountReq.discountType === "PERCENTAGE" ? "%" : ""})`,
      };
    }

    let discountAmount = 0;
    if (discountReq.discountType === "PERCENTAGE") {
      discountAmount = (origPriceNum * partialValNum) / 100;
    } else {
      discountAmount = partialValNum;
    }

    const finalPrice = Math.max(0, origPriceNum - discountAmount);
    return { discountAmount, finalPrice, isValid: true, error: null };
  }, [discountReq, origPriceNum, partialValNum]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === "REJECT") {
      if (!rejectionReason.trim() && !notes.trim()) {
        setErrorMessage("Please provide a mandatory reason for rejecting this booking.");
        return;
      }

      try {
        await reviewReservation({
          bookingId: booking.id,
          action: "REJECT",
          rejectionReason: (rejectionReason.trim() || notes.trim()),
          notes: notes.trim() ? notes.trim() : undefined,
        }).unwrap();
        onSuccess?.();
        onClose();
      } catch (err: any) {
        setErrorMessage(formatErrorMessage(err, "Failed to reject booking"));
      }
      return;
    }

    // Mode is APPROVE
    if (discountReq && isPartialApproval && !partialPreview.isValid) {
      setErrorMessage(partialPreview.error || "Please enter a valid partial discount value.");
      return;
    }

    try {
      await reviewReservation({
        bookingId: booking.id,
        action: "CONFIRM",
        approvedDiscountValue: discountReq && isPartialApproval ? partialValNum : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(formatErrorMessage(err, "Failed to approve booking"));
    }
  };

  const travelDateFormatted = booking.availability?.date
    ? formatDate(booking.availability.date)
    : "Open Date";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Booking #${booking.id.slice(0, 8)}`}
      description="Consolidated Booking Review & Pricing Approval"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1 text-xs font-outfit" data-testid="booking-review-dialog">
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Booking & Tour Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3.5">
          <div>
            <span className="text-[#74818A] block">Lead Customer:</span>
            <p className="font-semibold text-[#18282A] text-sm mt-0.5">
              {booking.customer?.name || "Guest Customer"}
            </p>
            <p className="text-[11px] text-[#74818A]">{booking.customer?.email || "No email"}</p>
            {booking.customer?.phone && (
              <p className="text-[11px] text-[#74818A]">{booking.customer.phone}</p>
            )}
          </div>
          <div>
            <span className="text-[#74818A] block">Tour & Schedule:</span>
            <p className="font-semibold text-[#18282A] text-sm mt-0.5">
              {booking.service?.name}
            </p>
            <p className="text-[11px] text-[#176779] font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>Travel: {travelDateFormatted}</span>
            </p>
          </div>
        </div>

        {/* 2. Staff Attribution & Pricing Breakdown */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-[#176779]" />
              <span className="font-semibold text-[#18282A]">
                {booking.agent ? "Originating Agent:" : "Staff Creator:"}
              </span>
              <span className="text-[#176779] font-bold">
                {booking.agent
                  ? booking.agent.name
                  : booking.createdBy?.name || "Staff Member"}
              </span>
              {(booking.agent?.agentProfile?.agencyName || booking.createdBy?.role) && (
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  {booking.agent?.agentProfile?.agencyName || booking.createdBy?.role}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[#74818A] block text-[10px] uppercase">Standard Price</span>
              <span className="font-bold text-[#18282A] text-sm">
                {formatReportMoney(origPriceNum, booking.currency)}
              </span>
            </div>
          </div>

          {/* Discount details if requested */}
          {discountReq ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Tag className="h-4 w-4 text-amber-700" />
                  <span>Requested Staff Discount</span>
                </div>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  Status: {discountReq.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-amber-800 block text-[11px]">Requested Value:</span>
                  <span className="font-bold text-[#18282A]">
                    {discountReq.discountType === "PERCENTAGE"
                      ? `${discountReq.discountValue}%`
                      : formatReportMoney(Number(discountReq.discountValue), booking.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-amber-800 block text-[11px]">Discount Deduction:</span>
                  <span className="font-bold text-rose-700">
                    -{formatReportMoney(Number(discountReq.discountAmount), booking.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-amber-800 block text-[11px]">Proposed Final Price:</span>
                  <span className="font-bold text-emerald-800">
                    {formatReportMoney(Number(discountReq.proposedFinalPrice), booking.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/70 text-[11px]">
                <span className="font-semibold text-amber-950 block">Staff Justification / Reason:</span>
                <p className="mt-0.5 italic text-amber-900">&ldquo;{discountReq.reason}&rdquo;</p>
              </div>

              {/* Partial Approval Section */}
              {mode === "APPROVE" && (
                <div className="pt-2.5 border-t border-amber-200/70 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-950">
                    <input
                      type="checkbox"
                      checked={isPartialApproval}
                      onChange={(e) => setIsPartialApproval(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-amber-300 text-[#176779] focus:ring-[#176779]"
                      data-testid="review-partial-approval-toggle"
                    />
                    <span>Partially approve discount (grant a lower discount value)</span>
                  </label>

                  {isPartialApproval && (
                    <div className="rounded-lg bg-white p-3 border border-amber-200 space-y-2 mt-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] font-semibold text-[#18282A]">
                          Approved Value ({discountReq.discountType === "PERCENTAGE" ? "%" : booking.currency}):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={Number(discountReq.discountValue)}
                          value={approvedDiscountValue}
                          onChange={(e) => setApprovedDiscountValue(e.target.value)}
                          className="w-28 h-8 rounded-lg border border-[#E5EAED] px-2 text-right text-xs font-semibold focus:border-[#176779] focus:outline-none"
                          data-testid="review-partial-value-input"
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-[#E5EAED]">
                        <span className="text-[#74818A]">Adjusted Final Payable:</span>
                        <span className="font-bold text-emerald-700">
                          {formatReportMoney(partialPreview.finalPrice, booking.currency)}
                        </span>
                      </div>
                      {partialPreview.error && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {partialPreview.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : booking.priceApproval ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                  <Tag className="h-4 w-4 text-purple-700" />
                  <span>Agent Negotiated Price Proposal</span>
                </div>
                <span className="rounded-full bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                  Status: {booking.priceApproval.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-purple-800 block text-[11px]">Standard Retail Price:</span>
                  <span className="font-bold text-[#18282A]">
                    {formatReportMoney(origPriceNum, booking.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-purple-800 block text-[11px]">Submitted Agent Price:</span>
                  <span className="font-bold text-[#176779]">
                    {formatReportMoney(Number(booking.priceApproval.requestedPrice), booking.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-purple-800 block text-[11px]">Price Adjustment:</span>
                  <span className="font-bold text-rose-700">
                    -{formatReportMoney(Math.max(0, origPriceNum - Number(booking.priceApproval.requestedPrice)), booking.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/70 text-[11px] text-purple-950">
                <span>
                  Booking requires price review because the agent submitted a custom proposed rate below the automatic approval limit.
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[#74818A]">
              <span>No discount was requested. Standard retail pricing applies.</span>
            </div>
          )}
        </div>

        {/* 3. Decision Controls (Approve vs Reject) */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#18282A]">
            Admin Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("APPROVE")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-semibold text-xs transition-all cursor-pointer ${
                mode === "APPROVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-[#E5EAED] bg-[#FAFCFC] text-[#556972] hover:bg-slate-100"
              }`}
              data-testid="review-decision-approve"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Booking</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("REJECT")}
              className={`flex items-center justify-center gap-2 rounded-xl p-2.5 font-semibold text-xs transition-all cursor-pointer ${
                mode === "REJECT"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "border border-[#E5EAED] bg-[#FAFCFC] text-[#556972] hover:bg-slate-100"
              }`}
              data-testid="review-decision-reject"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject Booking</span>
            </button>
          </div>

          {/* Conditional Input depending on mode */}
          {mode === "REJECT" ? (
            <div>
              <label className="block font-semibold text-[#18282A] mb-1">
                Mandatory Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the reason why this booking/discount proposal cannot be accepted..."
                className="w-full rounded-xl border border-rose-300 p-2.5 text-xs focus:border-rose-600 focus:outline-none"
                rows={3}
                required
                data-testid="review-rejection-reason-input"
              />
            </div>
          ) : (
            <div>
              <label className="block font-medium text-[#18282A] mb-1">
                Admin Review Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Approved as authorized under client relations guidelines"
                className="w-full rounded-xl border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
                data-testid="review-notes-input"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t border-[#E5EAED] pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              isLoading ||
              (mode === "REJECT" && !rejectionReason.trim()) ||
              (mode === "APPROVE" && Boolean(discountReq) && isPartialApproval && !partialPreview.isValid)
            }
            className={`text-xs font-semibold text-white ${
              mode === "APPROVE"
                ? "bg-[#176779] hover:bg-[#135564]"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
            data-testid="review-dialog-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : mode === "APPROVE" ? (
              "Confirm & Approve Booking"
            ) : (
              "Reject Booking Proposal"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
