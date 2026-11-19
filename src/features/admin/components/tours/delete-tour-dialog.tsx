"use client";

import * as React from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { useDeleteAdminServiceMutation } from "../../api/admin-api";
import type { AdminServiceRecord } from "../../types/admin";

export interface DeleteTourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tour: AdminServiceRecord | null;
  onSuccess?: (deletedTour: { id: string; name: string }) => void;
  onMoveToDraft?: (tour: AdminServiceRecord) => void;
}

export function DeleteTourDialog({
  isOpen,
  onClose,
  tour,
  onSuccess,
  onMoveToDraft,
}: DeleteTourDialogProps) {
  if (!tour) return null;

  return (
    <DeleteTourForm
      key={tour.id}
      isOpen={isOpen}
      onClose={onClose}
      tour={tour}
      onSuccess={onSuccess}
      onMoveToDraft={onMoveToDraft}
    />
  );
}

function DeleteTourForm({
  isOpen,
  onClose,
  tour,
  onSuccess,
  onMoveToDraft,
}: {
  isOpen: boolean;
  onClose: () => void;
  tour: AdminServiceRecord;
  onSuccess?: (deletedTour: { id: string; name: string }) => void;
  onMoveToDraft?: (tour: AdminServiceRecord) => void;
}) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [deleteTour, { isLoading }] = useDeleteAdminServiceMutation();

  const isBookingRestricted = Boolean(
    errorMessage && /booking/i.test(errorMessage)
  );

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      const res = await deleteTour(tour.id).unwrap();
      const deletedData = res.data || { id: tour.id, name: tour.name };
      onSuccess?.(deletedData);
      onClose();
    } catch (err: unknown) {
      const sanitized = formatErrorMessage(err, {
        context: "admin",
        fallback: "Unable to delete tour package.",
      });
      setErrorMessage(sanitized);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Tour Package"
      description="Permanently remove this tour listing and all related configuration."
      size="sm"
    >
      <div className="space-y-4">
        {errorMessage && (
          <FeedbackAlert
            type="error"
            title="Deletion Restricted"
            message={errorMessage}
            data-testid="delete-tour-error-alert"
          />
        )}

        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs sm:text-sm text-[#18282A]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-red-900">
                Are you sure you want to delete this tour?
              </p>
              <p className="text-xs text-red-700">
                You are about to delete{" "}
                <span className="font-bold text-red-950">&quot;{tour.name}&quot;</span>.
              </p>
              <p className="text-[11px] text-[#74818A] pt-1">
                Tours with past or active booking records cannot be deleted. If bookings exist, you will be prompted to move the tour to Draft or Unpublished status instead to preserve historical records.
              </p>
            </div>
          </div>
        </div>

        {isBookingRestricted && onMoveToDraft && tour.status !== "DRAFT" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
            <span>Preserve historical bookings by unpublishing or drafting this tour.</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                onMoveToDraft(tour);
                onClose();
              }}
              data-testid="move-to-draft-recommendation-button"
              className="shrink-0 rounded-lg border-amber-300 bg-white text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Move to Draft
            </Button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl text-xs font-semibold text-[#74818A] hover:bg-[#F8FAFB] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            data-testid="confirm-delete-tour-button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Tour</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
