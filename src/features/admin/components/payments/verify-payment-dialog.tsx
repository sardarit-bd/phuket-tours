"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVerifyAdminPaymentMutation } from "../../api/admin-api";
import type { AdminPaymentRecord } from "../../types/admin-payments";

export interface VerifyPaymentDialogProps {
  payment: AdminPaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function VerifyPaymentDialog({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: VerifyPaymentDialogProps) {
  const [decision, setDecision] = React.useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [notes, setNotes] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [prevOpen, setPrevOpen] = React.useState(isOpen);

  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setDecision("VERIFIED");
    setNotes("");
    setValidationError(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  const [verifyPayment, { isLoading }] = useVerifyAdminPaymentMutation();

  if (!payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedNotes = notes.trim();

    // Backend rule: Notes are required when rejecting
    if (decision === "REJECTED" && !trimmedNotes) {
      setValidationError("Review notes are strictly required when rejecting a payment.");
      return;
    }

    if (trimmedNotes.length > 500) {
      setValidationError("Review notes cannot exceed 500 characters.");
      return;
    }

    try {
      const response = await verifyPayment({
        paymentId: payment.id,
        input: {
          decision,
          notes: trimmedNotes || undefined,
        },
      }).unwrap();

      const message =
        decision === "VERIFIED"
          ? "Payment verified successfully. Booking and commissions updated."
          : "Payment rejected successfully.";
      onSuccess(response?.message || message);
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const apiMsg =
        errorObj?.data?.message || errorObj?.message || "Failed to submit payment verification decision.";
      setValidationError(apiMsg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Verify / Review Payment"
      description="Record an official review decision for this submitted payment receipt."
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-[#18282A]">
        {/* 1. Transaction Overview Box */}
        <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
          <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
            <span className="text-[11px] font-semibold text-[#74818A]">Payment Amount</span>
            <span className="font-outfit text-xl font-bold text-[#18282A]">
              ฿{Number(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#74818A]">Reference:</span>{" "}
              <span className="font-semibold text-[#18282A]">{payment.reference || "None"}</span>
            </div>
            <div>
              <span className="text-[#74818A]">Payment Method:</span>{" "}
              <span className="font-semibold text-[#18282A]">{payment.method}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#74818A]">Payment ID:</span>{" "}
              <span className="font-mono text-[#18282A]">{payment.id}</span>
            </div>
            {payment.receiptNote && (
              <div className="col-span-2 mt-1 rounded-lg bg-white p-2.5 border border-[#E5EAED]">
                <span className="font-semibold text-[#74818A]">Customer Receipt Note:</span>
                <p className="mt-0.5 text-xs text-[#18282A]">{payment.receiptNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Review Decision Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#18282A] mb-2">
            Verification Decision <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setDecision("VERIFIED");
                setValidationError(null);
              }}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                decision === "VERIFIED"
                  ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold"
                  : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F8FAFB]"
              }`}
              data-testid="decision-verified-btn"
            >
              <CheckCircle2
                className={`h-4 w-4 ${decision === "VERIFIED" ? "text-emerald-600" : "text-[#74818A]"}`}
                aria-hidden="true"
              />
              <div>
                <div className="text-xs font-semibold">Verify Payment</div>
                <div className="text-[10px] text-[#74818A]">Accept and mark paid</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecision("REJECTED");
                setValidationError(null);
              }}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                decision === "REJECTED"
                  ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 text-rose-950 font-semibold"
                  : "border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F8FAFB]"
              }`}
              data-testid="decision-rejected-btn"
            >
              <XCircle
                className={`h-4 w-4 ${decision === "REJECTED" ? "text-rose-600" : "text-[#74818A]"}`}
                aria-hidden="true"
              />
              <div>
                <div className="text-xs font-semibold">Reject Payment</div>
                <div className="text-[10px] text-[#74818A]">Decline receipt</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Review Notes Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="verify-notes" className="text-xs font-semibold text-[#18282A]">
              Review Notes {decision === "REJECTED" && <span className="text-rose-600">* (Required)</span>}
            </label>
            <span className="text-[10px] text-[#74818A]">{notes.length}/500</span>
          </div>
          <textarea
            id="verify-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder={
              decision === "REJECTED"
                ? "State the reason for rejecting this payment (e.g. invalid receipt reference, mismatched amount)..."
                : "Optional review or reconciliation notes..."
            }
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs placeholder:text-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none transition-colors"
            data-testid="verify-notes-input"
          />
        </div>

        {/* 4. Error Message Alert */}
        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive"
            data-testid="verify-payment-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs font-medium leading-relaxed">{validationError}</p>
          </div>
        )}

        {/* 5. Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-[#E5EAED] px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className={`rounded-xl px-4 text-xs font-semibold text-white cursor-pointer ${
              decision === "VERIFIED"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
            data-testid="submit-verify-decision-btn"
          >
            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            <span>
              {isLoading
                ? "Submitting..."
                : decision === "VERIFIED"
                ? "Confirm Verification"
                : "Confirm Rejection"}
            </span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
