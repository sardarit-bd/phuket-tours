"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { useUpdateStaffBookingFulfillmentStatusMutation } from "@/features/admin/api/admin-api";
import type {
  StaffBookingRecord,
  FulfillmentStatusValue,
} from "@/features/admin/types/admin-bookings";
import { Loader2, AlertTriangle } from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";

export interface StaffFulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: StaffBookingRecord | null;
  onSuccess?: () => void;
}

interface StaffFulfillmentFormProps {
  booking: StaffBookingRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

function getInitialStatus(currentStatus: FulfillmentStatusValue): FulfillmentStatusValue {
  if (currentStatus === "NOT_STARTED") return "IN_PROGRESS";
  if (currentStatus === "IN_PROGRESS") return "FULFILLED";
  return "IN_PROGRESS";
}

function StaffFulfillmentForm({
  booking,
  onClose,
  onSuccess,
}: StaffFulfillmentFormProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<FulfillmentStatusValue>(
    getInitialStatus(booking.fulfillmentStatus)
  );
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [updateFulfillment, { isLoading }] = useUpdateStaffBookingFulfillmentStatusMutation();

  const currentStatus = booking.fulfillmentStatus;
  const isPaid = booking.paymentStatus === "PAID";

  const permittedOptions: SelectOption<FulfillmentStatusValue>[] = React.useMemo(() => {
    const list: SelectOption<FulfillmentStatusValue>[] = [];
    if (currentStatus === "NOT_STARTED") {
      list.push({ value: "IN_PROGRESS", label: "In Progress (Begin tour delivery)" });
    } else if (currentStatus === "IN_PROGRESS") {
      list.push({
        value: "FULFILLED",
        label: isPaid ? "Fulfilled (Complete tour)" : "Fulfilled (Requires Paid Payment)",
      });
    }
    return list;
  }, [currentStatus, isPaid]);

  const cannotCompleteDueToUnpaid = selectedStatus === "FULFILLED" && !isPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cannotCompleteDueToUnpaid) {
      setErrorMessage("Cannot mark tour as Fulfilled because payment has not been verified.");
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
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update fulfillment status. Please try again.",
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {errorMessage && (
        <ErrorAlert
          data-testid="staff-fulfillment-error"
          description={errorMessage}
        />
      )}

      {isSuccess && (
        <SuccessAlert
          data-testid="staff-fulfillment-success"
          description="Tour fulfillment status updated successfully."
        />
      )}

      {/* Target Status Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Target Operational Status
        </label>
        {permittedOptions.length > 0 ? (
          <CustomSelect
            options={permittedOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            aria-label="Select next fulfillment status"
            usePortal={true}
            data-testid="select-staff-fulfillment-status"
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            This booking has already been marked as <strong>Fulfilled</strong>. No further operational transitions are allowed.
          </div>
        )}
      </div>

      {cannotCompleteDueToUnpaid && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Payment Incomplete</p>
            <p className="text-[11px] mt-0.5">
              Tour completion requires booking payment status to be PAID. Contact Admin if the customer paid on-site.
            </p>
          </div>
        </div>
      )}

      {/* Handover / Operational Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Operational Note (Required for logs)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          required
          placeholder="e.g. Guests met at hotel lobby, tour departed on time..."
          className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
          data-testid="staff-fulfillment-notes"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || isSuccess || permittedOptions.length === 0 || !notes.trim() || cannotCompleteDueToUnpaid}
          className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
          data-testid="staff-fulfillment-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </Button>
      </div>
    </form>
  );
}

export function StaffFulfillmentDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: StaffFulfillmentDialogProps) {
  if (!booking) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Tour Fulfillment"
      description={`Update operational status for booking #${booking.id.slice(0, 8)} (${booking.service?.name || "Tour"}).`}
      size="sm"
    >
      <StaffFulfillmentForm
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
