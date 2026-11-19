"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReviewAdminDiscountMutation } from "@/features/admin/api/admin-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import type { StaffDiscountRequestRecord } from "@/features/admin/types/admin-discounts";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  User,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

export interface DiscountReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: StaffDiscountRequestRecord | null;
  onSuccess?: () => void;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function DiscountReviewDialog({
  isOpen,
  onClose,
  request,
  onSuccess,
}: DiscountReviewDialogProps) {
  const [decision, setDecision] = React.useState<"APPROVE" | "REJECT">("APPROVE");
  const [isPartialApproval, setIsPartialApproval] = React.useState(false);
  const [approvedDiscountValue, setApprovedDiscountValue] = React.useState<string>("");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [reviewDiscount, { isLoading: isSubmitting }] =
    useReviewAdminDiscountMutation();

  // Reset state when dialog opens with a request
  React.useEffect(() => {
    if (isOpen && request) {
      setDecision("APPROVE");
      setIsPartialApproval(false);
      setApprovedDiscountValue(String(request.discountValue));
      setAdminNotes("");
      setRejectionReason("");
      setErrorMsg(null);
    }
  }, [isOpen, request]);

  const originalPrice = request ? Number(request.originalPrice) || 0 : 0;
  const currency = request?.booking?.currency || "USD";
  const requestedValue = request ? Number(request.discountValue) || 0 : 0;

  // Partial approval calculations preview
  const partialValueNum = parseFloat(approvedDiscountValue) || 0;

  const partialPreview = React.useMemo(() => {
    if (!request || !isPartialApproval) {
      return {
        discountAmount: request ? Number(request.discountAmount) || 0 : 0,
        finalPrice: request ? Number(request.proposedFinalPrice) || 0 : 0,
        isValid: true,
      };
    }

    if (partialValueNum <= 0) {
      return {
        discountAmount: 0,
        finalPrice: originalPrice,
        isValid: false,
        error: "Approved discount value must be greater than 0.",
      };
    }

    if (partialValueNum > requestedValue) {
      return {
        discountAmount: 0,
        finalPrice: originalPrice,
        isValid: false,
        error: `Partial approval value cannot exceed the requested discount (${requestedValue}${request.discountType === "PERCENTAGE" ? "%" : ""}).`,
      };
    }

    if (request.discountType === "PERCENTAGE") {
      const discountAmount = Math.round(((originalPrice * partialValueNum) / 100) * 100) / 100;
      const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
      return { discountAmount, finalPrice, isValid: true };
    } else {
      const discountAmount = Math.round(partialValueNum * 100) / 100;
      const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
      return { discountAmount, finalPrice, isValid: true };
    }
  }, [isPartialApproval, partialValueNum, originalPrice, requestedValue, request]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (decision === "REJECT" && !rejectionReason.trim()) {
      setErrorMsg("A rejection reason is mandatory when declining a discount request.");
      return;
    }

    if (decision === "APPROVE" && isPartialApproval) {
      if (!partialPreview.isValid || partialPreview.error) {
        setErrorMsg(partialPreview.error || "Please enter a valid partial discount value.");
        return;
      }
    }

    try {
      await reviewDiscount({
        requestId: request.id,
        decision,
        approvedDiscountValue:
          decision === "APPROVE" && isPartialApproval ? partialValueNum : undefined,
        adminNotes: adminNotes.trim() ? adminNotes.trim() : undefined,
        rejectionReason:
          decision === "REJECT" ? rejectionReason.trim() : undefined,
      }).unwrap();

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        formatErrorMessage(
          err,
          "Failed to submit discount review. Please verify your permissions and try again."
        )
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Review Staff Discount Request"
      description={`Request #${request.id.slice(0, 8)} for Booking #${request.bookingId.slice(0, 8)}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1" data-testid="discount-review-form">
        {/* Booking & Requester Information */}
        <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#E5EAED]">
            <div>
              <span className="text-[#74818A] block">Customer</span>
              <span className="font-semibold text-[#18282A] text-sm">
                {request.booking?.customer?.name || "Customer"}
              </span>
              <span className="text-[11px] text-[#74818A] block">
                {request.booking?.customer?.email || ""}
              </span>
            </div>
            <div>
              <span className="text-[#74818A] block">Tour Package</span>
              <span className="font-semibold text-[#18282A] text-sm">
                {request.booking?.service?.name || "Tour Package"}
              </span>
              <span className="text-[11px] text-[#74818A] block">
                Type: {request.booking?.service?.type || "TOUR"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[#74818A] block">Requested By</span>
              <span className="font-semibold text-[#18282A]">
                {request.requestedBy?.name || "Staff Member"}
              </span>
              <span className="text-[10px] text-[#74818A] block">
                ({request.requestedBy?.role || "staff"})
              </span>
            </div>
            <div>
              <span className="text-[#74818A] block">Original Price</span>
              <span className="font-semibold text-[#18282A]">
                {formatCurrency(originalPrice, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#74818A] block">Requested Discount</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(request.discountAmount, currency)} (
                {request.discountType === "PERCENTAGE"
                  ? `${request.discountValue}%`
                  : `Fixed ${currency}`}
                )
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
            <span className="font-semibold text-[#18282A] block text-[11px]">
              Staff Justification:
            </span>
            <p className="text-[#556972] leading-relaxed italic">
              &ldquo;{request.reason}&rdquo;
            </p>
          </div>
        </div>

        {/* Decision Toggle */}
        <div>
          <label className="block text-xs font-semibold text-[#18282A] mb-2">
            Admin Decision
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("APPROVE")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                decision === "APPROVE"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
              }`}
              data-testid="discount-decision-approve"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Approve Discount</span>
            </button>
            <button
              type="button"
              onClick={() => setDecision("REJECT")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                decision === "REJECT"
                  ? "border-rose-600 bg-rose-50 text-rose-800"
                  : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
              }`}
              data-testid="discount-decision-reject"
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              <span>Reject Request</span>
            </button>
          </div>
        </div>

        {/* Approve Options */}
        {decision === "APPROVE" && (
          <div className="rounded-2xl border border-emerald-200 bg-[#F5FBFA] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Approval Options
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#18282A]">
                <input
                  type="checkbox"
                  checked={isPartialApproval}
                  onChange={(e) => setIsPartialApproval(e.target.checked)}
                  className="rounded border-[#E5EAED] text-[#176779] focus:ring-[#176779]"
                  data-testid="discount-partial-checkbox"
                />
                <span>Partially Approve Lower Amount</span>
              </label>
            </div>

            {isPartialApproval ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label htmlFor="approved-value" className="block text-xs font-semibold text-[#18282A] mb-1">
                    Approved {request.discountType === "PERCENTAGE" ? "Percentage (%)" : `Amount (${currency})`}
                  </label>
                  <div className="relative flex items-center max-w-xs">
                    <Input
                      id="approved-value"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={String(request.discountValue)}
                      value={approvedDiscountValue}
                      onChange={(e) => setApprovedDiscountValue(e.target.value)}
                      className="h-9 text-xs border-[#E5EAED] rounded-xl pl-3 pr-8 bg-white"
                      data-testid="approved-discount-value-input"
                    />
                    <span className="absolute right-3 text-xs font-semibold text-[#74818A] pointer-events-none">
                      {request.discountType === "PERCENTAGE" ? "%" : currency}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-300 bg-white p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#74818A]">Approved Discount Amount:</span>
                    <span className="font-semibold text-rose-600" data-testid="partial-preview-amount">
                      -{formatCurrency(partialPreview.discountAmount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#18282A] pt-1 border-t border-[#EEF2F3]">
                    <span>Settled Final Price:</span>
                    <span className="text-emerald-700 font-outfit" data-testid="partial-preview-final-price">
                      {formatCurrency(partialPreview.finalPrice, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#74818A]">Full Approved Discount:</span>
                  <span className="font-semibold text-rose-600">
                    -{formatCurrency(request.discountAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#18282A] pt-1 border-t border-[#EEF2F3]">
                  <span>New Booking Final Price:</span>
                  <span className="text-emerald-700 font-outfit text-sm">
                    {formatCurrency(request.proposedFinalPrice, currency)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="admin-notes-approve" className="block text-xs font-semibold text-[#18282A] mb-1">
                Admin Notes (Optional)
              </label>
              <textarea
                id="admin-notes-approve"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Approved per seasonal group promotion."
                className="w-full rounded-xl border border-[#E5EAED] bg-white p-2.5 text-xs font-outfit text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:outline-none"
                data-testid="admin-notes-input"
              />
            </div>
          </div>
        )}

        {/* Reject Options */}
        {decision === "REJECT" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-3">
            <div className="text-xs text-rose-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Booking Price Impact:</span>
              Rejection preserves the original booking at the standard retail price (
              <strong>{formatCurrency(originalPrice, currency)}</strong>). The booking is NOT cancelled.
            </div>

            <div>
              <label htmlFor="rejection-reason" className="block text-xs font-semibold text-rose-950 mb-1">
                Rejection Reason <span className="text-rose-600">* Mandatory</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Peak season capacity constraint; maximum allowable discount exceeded."
                className="w-full rounded-xl border border-rose-200 bg-white p-2.5 text-xs font-outfit text-[#18282A] placeholder-[#74818A] focus:border-rose-500 focus:outline-none"
                data-testid="rejection-reason-input"
                required
              />
            </div>

            <div>
              <label htmlFor="admin-notes-reject" className="block text-xs font-semibold text-[#18282A] mb-1">
                Internal Admin Notes (Optional)
              </label>
              <textarea
                id="admin-notes-reject"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional internal remarks for audit record."
                className="w-full rounded-xl border border-[#E5EAED] bg-white p-2.5 text-xs font-outfit text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="review-submit-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              isSubmitting ||
              (decision === "REJECT" && !rejectionReason.trim()) ||
              (decision === "APPROVE" && isPartialApproval && !partialPreview.isValid)
            }
            className={`text-xs font-semibold text-white cursor-pointer inline-flex items-center gap-1.5 ${
              decision === "APPROVE"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
            data-testid="discount-review-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Recording Decision...</span>
              </>
            ) : decision === "APPROVE" ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Confirm Approval</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                <span>Confirm Rejection</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
