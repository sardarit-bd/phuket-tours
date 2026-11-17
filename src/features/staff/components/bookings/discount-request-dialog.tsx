"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStaffDiscountRequestMutation } from "@/features/admin/api/admin-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import type { DiscountType } from "@/features/admin/types/admin-discounts";
import {
  Tag,
  Percent,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

export interface DiscountRequestBookingTarget {
  id: string;
  customerName?: string;
  tourName?: string;
  originalPrice: number;
  currency?: string;
}

export interface DiscountRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: DiscountRequestBookingTarget | null;
  onSuccess?: (requestId: string) => void;
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

export function DiscountRequestDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: DiscountRequestDialogProps) {
  const [discountType, setDiscountType] = React.useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const [createDiscountRequest, { isLoading: isSubmitting }] =
    useCreateStaffDiscountRequestMutation();

  // Reset state on open or booking change
  React.useEffect(() => {
    if (isOpen) {
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setReason("");
      setErrorMsg(null);
      setIsSubmitted(false);
    }
  }, [isOpen, booking?.id]);

  const originalPrice = booking ? Number(booking.originalPrice) || 0 : 0;
  const currency = booking?.currency || "USD";

  // Client-side preview calculations
  const parsedValue = parseFloat(discountValue) || 0;

  const calculatedDiscount = React.useMemo(() => {
    if (parsedValue <= 0 || originalPrice <= 0) {
      return { discountAmount: 0, proposedFinalPrice: originalPrice, isValid: false };
    }

    if (discountType === "PERCENTAGE") {
      if (parsedValue > 100) {
        return { discountAmount: 0, proposedFinalPrice: originalPrice, isValid: false, error: "Percentage cannot exceed 100%" };
      }
      const discountAmount = Math.round(((originalPrice * parsedValue) / 100) * 100) / 100;
      const proposedFinalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
      return { discountAmount, proposedFinalPrice, isValid: true };
    } else {
      if (parsedValue > originalPrice) {
        return { discountAmount: 0, proposedFinalPrice: originalPrice, isValid: false, error: "Fixed discount cannot exceed original price" };
      }
      const discountAmount = Math.round(parsedValue * 100) / 100;
      const proposedFinalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
      return { discountAmount, proposedFinalPrice, isValid: true };
    }
  }, [discountType, parsedValue, originalPrice]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim()) {
      setErrorMsg("Please provide a business reason for the discount request.");
      return;
    }

    if (parsedValue <= 0) {
      setErrorMsg("Please enter a valid discount value greater than 0.");
      return;
    }

    if (calculatedDiscount.error) {
      setErrorMsg(calculatedDiscount.error);
      return;
    }

    try {
      const response = await createDiscountRequest({
        bookingId: booking.id,
        discountType,
        discountValue: parsedValue,
        reason: reason.trim(),
      }).unwrap();

      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(response.data.id);
      }
    } catch (err) {
      setErrorMsg(
        formatErrorMessage(
          err,
          "Failed to submit discount request. Please check booking status and try again."
        )
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isSubmitted ? "Discount Request Submitted" : "Request Booking Discount"}
      description={
        isSubmitted
          ? "Your request is pending Admin review and approval."
          : `Submit a custom price adjustment request for Booking #${booking.id.slice(0, 8)}.`
      }
      size="md"
    >
      {isSubmitted ? (
        <div className="space-y-5 py-3" data-testid="discount-request-success">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-emerald-900">Request Sent for Approval</h4>
              <p className="text-emerald-700 mt-0.5">
                The discount request has been recorded. Once approved by an Admin, the booking price will update and a new payment link can be generated.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#74818A]">Original Price:</span>
              <span className="font-semibold text-[#18282A]">{formatCurrency(originalPrice, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#74818A]">Requested Discount:</span>
              <span className="font-semibold text-rose-600">
                -{formatCurrency(calculatedDiscount.discountAmount, currency)} ({discountType === "PERCENTAGE" ? `${parsedValue}%` : "Fixed"})
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E5EAED]">
              <span className="font-bold text-[#18282A]">Proposed Final Price:</span>
              <span className="font-bold text-[#176779] text-sm">
                {formatCurrency(calculatedDiscount.proposedFinalPrice, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> Payment link generation is disabled until an Admin reviews this request.
            </span>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E5EAED]">
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
              data-testid="discount-success-close-btn"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1" data-testid="discount-request-form">
          {/* Booking Context Preview */}
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#74818A]">Customer / Tour</span>
              <span className="font-semibold text-[#18282A]">
                {booking.customerName || "Customer"} • {booking.tourName || "Tour Package"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#EEF2F3]">
              <span className="text-[#74818A]">Current Standard Price</span>
              <span className="font-bold text-[#18282A] font-outfit" data-testid="discount-original-price">
                {formatCurrency(originalPrice, currency)}
              </span>
            </div>
          </div>

          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#18282A] mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "border-[#176779] bg-[#E8F8F5] text-[#176779]"
                    : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
                }`}
                data-testid="discount-type-percentage"
              >
                <Percent className="h-4 w-4" />
                <span>Percentage (%)</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("FIXED_AMOUNT")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  discountType === "FIXED_AMOUNT"
                    ? "border-[#176779] bg-[#E8F8F5] text-[#176779]"
                    : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9]"
                }`}
                data-testid="discount-type-fixed"
              >
                <DollarSign className="h-4 w-4" />
                <span>Fixed Amount ({currency})</span>
              </button>
            </div>
          </div>

          {/* Discount Value Input */}
          <div>
            <label htmlFor="discount-value" className="block text-xs font-semibold text-[#18282A] mb-1">
              {discountType === "PERCENTAGE" ? "Discount Percentage (%)" : `Discount Amount (${currency})`}
            </label>
            <div className="relative flex items-center">
              <Input
                id="discount-value"
                type="number"
                step="0.01"
                min="0.01"
                max={discountType === "PERCENTAGE" ? "100" : String(originalPrice)}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 50.00"}
                className="h-10 text-xs border-[#E5EAED] rounded-xl pl-3 pr-8"
                data-testid="discount-value-input"
                required
              />
              <span className="absolute right-3 text-xs font-semibold text-[#74818A] pointer-events-none">
                {discountType === "PERCENTAGE" ? "%" : currency}
              </span>
            </div>
          </div>

          {/* Live Price Preview Box */}
          <div className="rounded-xl border border-dashed border-[#176779]/30 bg-[#F5FBFA] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#74818A]">Estimated Discount:</span>
              <span className="font-semibold text-rose-600" data-testid="discount-preview-amount">
                -{formatCurrency(calculatedDiscount.discountAmount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#176779]/15">
              <span className="font-bold text-[#18282A]">Proposed Final Price (Preview):</span>
              <span className="font-bold text-[#176779] text-sm" data-testid="discount-preview-final-price">
                {formatCurrency(calculatedDiscount.proposedFinalPrice, currency)}
              </span>
            </div>
            <span className="block text-[10px] text-[#74818A] text-right italic">
              * Client preview only. Backend calculations remain authoritative.
            </span>
          </div>

          {/* Reason for Discount */}
          <div>
            <label htmlFor="discount-reason" className="block text-xs font-semibold text-[#18282A] mb-1">
              Business Justification / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="discount-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Group booking discount for repeat customer family / promotional code match."
              className="w-full rounded-xl border border-[#E5EAED] p-2.5 text-xs font-outfit text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:outline-none"
              data-testid="discount-reason-input"
              required
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
              data-testid="discount-submit-error"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Actions */}
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
              disabled={isSubmitting || !reason.trim() || parsedValue <= 0}
              className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer inline-flex items-center gap-1.5"
              data-testid="discount-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5" />
                  <span>Submit for Admin Approval</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
