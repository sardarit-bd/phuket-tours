"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { useUpdateBookingFulfillmentStatusMutation } from "../../api/admin-api";
import type {
  OperationalBookingRecord,
  FulfillmentStatusValue,
} from "../../types/admin-bookings";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export interface UpdateFulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
  onSuccess?: () => void;
}

interface UpdateFulfillmentFormProps {
  booking: OperationalBookingRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

function getInitialStatus(currentStatus: FulfillmentStatusValue): FulfillmentStatusValue {
  if (currentStatus === "NOT_STARTED") return "IN_PROGRESS";
  if (currentStatus === "IN_PROGRESS") return "FULFILLED";
  return "IN_PROGRESS";
}

function UpdateFulfillmentForm({
  booking,
  onClose,
  onSuccess,
}: UpdateFulfillmentFormProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<FulfillmentStatusValue>(
    getInitialStatus(booking.fulfillmentStatus)
  );
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [updateFulfillment, { isLoading }] = useUpdateBookingFulfillmentStatusMutation();

  // Build permitted transitions based on backend state machine
  const currentStatus = booking.fulfillmentStatus;
  const isPaid = booking.paymentStatus === "PAID";

  const permittedOptions: SelectOption<FulfillmentStatusValue>[] = React.useMemo(() => {
    const list: SelectOption<FulfillmentStatusValue>[] = [];
    if (currentStatus === "NOT_STARTED") {
      list.push({ value: "IN_PROGRESS", label: "In Progress (Begin delivery)" });
    } else if (currentStatus === "IN_PROGRESS") {
      list.push({
        value: "FULFILLED",
        label: isPaid ? "Fulfilled (Complete tour)" : "Fulfilled (Requires Paid Payment)",
      });
      list.push({ value: "NOT_STARTED", label: "Not Started (Correction backward)" });
    } else if (currentStatus === "FULFILLED") {
      list.push({ value: "IN_PROGRESS", label: "In Progress (Correction backward)" });
    }
    return list;
  }, [currentStatus, isPaid]);

  // Guard: if user selected FULFILLED but booking is UNPAID
  const isBlockedByPayment = selectedStatus === "FULFILLED" && !isPaid;
  const isNoteValid = notes.trim().length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isNoteValid) {
      setErrorMessage("Administrative notes must be at least 3 characters.");
      return;
    }

    if (isBlockedByPayment) {
      setErrorMessage(
        "Payment must be verified (PAID) before the booking can be marked as Fulfilled."
      );
      return;
    }

    try {
      await updateFulfillment({
        bookingId: booking.id,
        fulfillmentStatus: selectedStatus,
        notes: notes.trim(),
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(
        apiErr?.data?.message || "Failed to update fulfillment status. Please verify permissions."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Error message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
          data-testid="fulfillment-error-banner"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success message */}
      {isSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
          data-testid="fulfillment-success-banner"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Fulfillment status updated successfully.</span>
        </div>
      )}

      {/* Backend validation notice for PAID requirement */}
      {isBlockedByPayment && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold">Backend Constraint: Unpaid Booking</p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              The backend system strictly requires payment status to be <strong>PAID</strong> before a booking can transition to <strong>FULFILLED</strong>. Current payment status is <strong>{booking.paymentStatus}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Current status info */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs">
        <span className="font-medium text-[#74818A]">Current Status:</span>
        <span className="font-semibold text-[#18282A]">
          {currentStatus.replace("_", " ")}
        </span>
      </div>

      {/* New Status Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          New Fulfillment Status
        </label>
        <CustomSelect
          options={permittedOptions}
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val as FulfillmentStatusValue)}
          aria-label="Select new fulfillment status"
          usePortal={true}
          data-testid="select-fulfillment-dropdown"
        />
      </div>

      {/* Required Notes Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Status Change Justification Note <span className="text-red-500">*</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          minLength={3}
          maxLength={500}
          rows={3}
          required
          placeholder="Explain the reason for this operational status change (required by backend)..."
          className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
          data-testid="fulfillment-notes-input"
        />
        <div className="flex justify-between text-[10px] text-[#74818A]">
          <span>Min 3 characters (required)</span>
          <span>{notes.length}/500</span>
        </div>
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
          disabled={isLoading || isSuccess || !isNoteValid || isBlockedByPayment}
          className="bg-[#176779] hover:bg-[#125261] text-white text-xs px-4 font-semibold disabled:opacity-50"
          data-testid="confirm-fulfillment-status-btn"
        >
          {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {isLoading ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </form>
  );
}

export function UpdateFulfillmentDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: UpdateFulfillmentDialogProps) {
  if (!booking) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Fulfillment Status"
      description={`Manage the operational progress for booking #${booking.id.slice(0, 8)}.`}
      size="sm"
    >
      <UpdateFulfillmentForm
        key={booking.id}
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
