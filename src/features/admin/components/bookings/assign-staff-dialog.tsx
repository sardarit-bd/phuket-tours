"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { useAssignBookingStaffMutation } from "../../api/admin-api";
import type { OperationalBookingRecord, AdminStaffMember } from "../../types/admin-bookings";
import { Loader2 } from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";

export interface AssignStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
  staffMembers: AdminStaffMember[];
  onSuccess?: () => void;
}

interface AssignStaffFormProps {
  booking: OperationalBookingRecord;
  staffMembers: AdminStaffMember[];
  onClose: () => void;
  onSuccess?: () => void;
}

function AssignStaffForm({
  booking,
  staffMembers,
  onClose,
  onSuccess,
}: AssignStaffFormProps) {
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>(
    booking.assignedStaffId || "unassigned"
  );
  const [notes, setNotes] = React.useState<string>("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [assignStaff, { isLoading }] = useAssignBookingStaffMutation();

  const staffOptions: SelectOption<string>[] = React.useMemo(() => {
    const list: SelectOption<string>[] = [
      {
        value: "unassigned",
        label: "Unassigned (No staff assigned)",
      },
    ];

    for (const s of staffMembers) {
      if (s.status === "active") {
        list.push({
          value: s.id,
          label: `${s.name} (${s.email})`,
        });
      }
    }

    return list;
  }, [staffMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const targetStaffId = selectedStaffId === "unassigned" ? null : selectedStaffId;
      await assignStaff({
        bookingId: booking.id,
        staffId: targetStaffId,
        notes: notes.trim() ? notes.trim() : undefined,
      }).unwrap();

      // Immediately notify parent so background refetch and state sync trigger without delay
      onSuccess?.();
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update staff assignment. Please try again.",
        })
      );
    }
  };

  const selectedStaffMember = React.useMemo(() => {
    if (!selectedStaffId || selectedStaffId === "unassigned") return null;
    return staffMembers.find((s) => s.id === selectedStaffId) || null;
  }, [selectedStaffId, staffMembers]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Status Messages */}
      {errorMessage && (
        <ErrorAlert
          data-testid="assign-staff-error"
          description={errorMessage}
        />
      )}

      {isSuccess && (
        <SuccessAlert
          data-testid="assign-staff-success"
          description="Staff assignment updated successfully."
        />
      )}

      {/* Staff Selection Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Responsible Staff Member
        </label>
        <CustomSelect
          options={staffOptions}
          value={selectedStaffId}
          onChange={(val) => setSelectedStaffId(val)}
          aria-label="Select staff member"
          usePortal={true}
          data-testid="select-staff-dropdown"
        />
        <p className="text-[11px] text-[#74818A]">
          Staff member responsible for guest greeting and tour delivery.
        </p>
      </div>

      {/* Selected Staff Card Preview */}
      {selectedStaffMember && (
        <div className="flex items-center gap-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#176779] text-xs font-bold text-white">
            {selectedStaffMember.name
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#18282A] truncate">
                {selectedStaffMember.name}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                Active Staff
              </span>
            </div>
            <p className="text-[11px] text-[#74818A] truncate">{selectedStaffMember.email}</p>
          </div>
        </div>
      )}

      {/* Optional Notes Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Assignment Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Add handover notes or special guest requirements..."
          className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
          data-testid="assign-staff-notes"
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
          disabled={isLoading || isSuccess}
          className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
          data-testid="assign-staff-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Assignment"
          )}
        </Button>
      </div>
    </form>
  );
}

export function AssignStaffDialog({
  isOpen,
  onClose,
  booking,
  staffMembers,
  onSuccess,
}: AssignStaffDialogProps) {
  if (!booking) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Responsible Staff"
      description={`Assign or change the operational staff member for booking #${booking.id.slice(0, 8)}.`}
      size="sm"
    >
      <AssignStaffForm
        key={booking.id}
        booking={booking}
        staffMembers={staffMembers}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
