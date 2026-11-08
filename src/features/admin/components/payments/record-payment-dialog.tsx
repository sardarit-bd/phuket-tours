"use client";

import * as React from "react";
import { Loader2, Calendar, Hash } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { ErrorAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { useRecordAdminPaymentMutation } from "../../api/admin-api";
import type { AdminPaymentRecord } from "../../types/admin-payments";

export interface RecordPaymentDialogProps {
  payment: AdminPaymentRecord | null;
  initiatedPayments?: AdminPaymentRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const EMPTY_INITIATED_PAYMENTS: AdminPaymentRecord[] = [];

export function RecordPaymentDialog({
  payment: initialPayment,
  initiatedPayments = EMPTY_INITIATED_PAYMENTS,
  isOpen,
  onClose,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<string>(
    initialPayment?.id || (initiatedPayments.length > 0 ? initiatedPayments[0].id : "")
  );
  const [reference, setReference] = React.useState<string>(initialPayment?.reference || "");
  const [receivedAt, setReceivedAt] = React.useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [prevOpen, setPrevOpen] = React.useState(isOpen);

  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    if (initialPayment) {
      setSelectedPaymentId(initialPayment.id);
      setReference(initialPayment.reference || "");
    } else if (initiatedPayments.length > 0) {
      setSelectedPaymentId(initiatedPayments[0].id);
      setReference("");
    } else {
      setSelectedPaymentId("");
      setReference("");
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setReceivedAt(now.toISOString().slice(0, 16));
    setNotes("");
    setValidationError(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  const [recordPayment, { isLoading }] = useRecordAdminPaymentMutation();

  const activePayment = React.useMemo(() => {
    if (initialPayment) return initialPayment;
    return initiatedPayments.find((p) => p.id === selectedPaymentId) || null;
  }, [initialPayment, initiatedPayments, selectedPaymentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const targetPaymentId = (initialPayment?.id || selectedPaymentId).trim();
    if (!targetPaymentId) {
      setValidationError("A valid initiated payment must be selected.");
      return;
    }

    const trimmedReference = reference.trim();
    if (trimmedReference && trimmedReference.length < 3) {
      setValidationError("Reference must be at least 3 characters long.");
      return;
    }
    if (trimmedReference.length > 100) {
      setValidationError("Reference cannot exceed 100 characters.");
      return;
    }

    const trimmedNotes = notes.trim();
    if (trimmedNotes.length > 500) {
      setValidationError("Notes cannot exceed 500 characters.");
      return;
    }

    let parsedReceivedAt: string | undefined = undefined;
    if (receivedAt) {
      const d = new Date(receivedAt);
      if (Number.isNaN(d.getTime())) {
        setValidationError("Invalid received date format.");
        return;
      }
      parsedReceivedAt = d.toISOString();
    }

    try {
      const response = await recordPayment({
        paymentId: targetPaymentId,
        input: {
          reference: trimmedReference || undefined,
          receivedAt: parsedReceivedAt,
          notes: trimmedNotes || undefined,
        },
      }).unwrap();

      onSuccess(response?.message || "Manual payment recorded successfully.");
      onClose();
    } catch (err: unknown) {
      setValidationError(
        formatErrorMessage(err, {
          context: "payment",
          fallback: "Failed to record manual payment.",
        })
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Record Manual Payment"
      description="Record an offline or manual settlement receipt for an initiated payment."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#18282A]">
        {/* 1. Payment Target Selection */}
        {initialPayment ? (
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#74818A]">Payment to Record</span>
              <span className="font-outfit text-base font-bold text-[#18282A]">
                ฿{Number(initialPayment.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[11px] text-[#74818A] flex flex-wrap gap-x-4">
              <span>ID: <strong className="font-mono text-[#18282A]">#{initialPayment.id.slice(0, 8)}</strong></span>
              <span>Booking: <strong className="font-mono text-[#18282A]">#{initialPayment.bookingId.slice(0, 8)}</strong></span>
              <span>Method: <strong className="text-[#18282A]">{initialPayment.method}</strong></span>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="select-initiated-payment" className="block text-xs font-semibold text-[#18282A] mb-1.5">
              Select Initiated Payment <span className="text-destructive">*</span>
            </label>
            {initiatedPayments.length > 0 ? (
              <CustomSelect<string>
                id="select-initiated-payment"
                options={initiatedPayments.map((p) => ({
                  value: p.id,
                  label: `#${p.id.slice(0, 8)} — ฿${Number(p.amount).toLocaleString()} (${p.method}) [Booking #${p.bookingId.slice(0, 8)}]`,
                }))}
                value={selectedPaymentId}
                onChange={(val) => {
                  setSelectedPaymentId(val);
                  if (validationError) setValidationError(null);
                }}
                className="w-full"
                usePortal={true}
                data-testid="select-initiated-payment"
                aria-label="Select Initiated Payment"
              />
            ) : (
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Enter Initiated Payment UUID..."
                  value={selectedPaymentId}
                  onChange={(e) => {
                    setSelectedPaymentId(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="rounded-xl border-[#E5EAED] bg-[#F8FAFB] text-xs font-mono"
                  data-testid="input-manual-payment-id"
                />
                <p className="text-[11px] text-[#74818A]">
                  Enter the UUID of an initiated payment to mark as received and verified.
                </p>
              </div>
            )}

            {activePayment && !initialPayment && (
              <div className="mt-2 rounded-lg bg-teal-50/60 p-2.5 text-[11px] text-teal-900 border border-teal-100 flex items-center justify-between">
                <span>Amount: <strong>฿{Number(activePayment.amount).toLocaleString()}</strong></span>
                <span>Booking ID: <strong className="font-mono">#{activePayment.bookingId.slice(0, 8)}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* 2. Transaction Reference */}
        <div>
          <label htmlFor="payment-reference" className="block text-xs font-semibold text-[#18282A] mb-1.5">
            Transaction Reference / Slip No.
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" aria-hidden="true" />
            <Input
              id="payment-reference"
              type="text"
              placeholder="e.g. TXN-9481920, Bank Slip Reference..."
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (validationError) setValidationError(null);
              }}
              minLength={3}
              maxLength={100}
              className="h-9 rounded-xl border-[#E5EAED] bg-[#F8FAFB] pl-9 text-xs focus:bg-white"
              data-testid="record-payment-reference-input"
            />
          </div>
          <span className="mt-1 block text-[10px] text-[#74818A]">
            Optional receipt or deposit slip identifier (3-100 characters).
          </span>
        </div>

        {/* 3. Date & Time Received */}
        <div>
          <label htmlFor="payment-received-at" className="block text-xs font-semibold text-[#18282A] mb-1.5">
            Date & Time Funds Received
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" aria-hidden="true" />
            <Input
              id="payment-received-at"
              type="datetime-local"
              value={receivedAt}
              onChange={(e) => {
                setReceivedAt(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="h-9 rounded-xl border-[#E5EAED] bg-[#F8FAFB] pl-9 text-xs focus:bg-white"
              data-testid="record-payment-received-at-input"
            />
          </div>
          <span className="mt-1 block text-[10px] text-[#74818A]">
            Defaults to current timestamp if not specified.
          </span>
        </div>

        {/* 4. Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="record-notes" className="text-xs font-semibold text-[#18282A]">
              Internal Notes / Receipt Comments
            </label>
            <span className="text-[10px] text-[#74818A]">{notes.length}/500</span>
          </div>
          <textarea
            id="record-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Add any relevant manual deposit or reconciliation notes..."
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs placeholder:text-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none transition-colors"
            data-testid="record-payment-notes-input"
          />
        </div>

        {/* 5. Error Alert */}
        {validationError && (
          <ErrorAlert
            data-testid="record-payment-error"
            description={validationError}
          />
        )}

        {/* 6. Footer Actions */}
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
            disabled={isLoading || !(initialPayment?.id || selectedPaymentId)}
            className="rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#135564] cursor-pointer"
            data-testid="submit-record-payment-btn"
          >
            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            <span>{isLoading ? "Recording..." : "Record Payment"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
