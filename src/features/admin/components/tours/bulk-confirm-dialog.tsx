import * as React from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TourStatusBadge } from "./tour-status-badge";
import type { AdminServiceStatus } from "../../types/admin";

export interface BulkConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  targetStatus: AdminServiceStatus;
  isLoading?: boolean;
}

export function BulkConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  targetStatus,
  isLoading = false,
}: BulkConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Bulk Status Update"
      description="Update the lifecycle status for multiple selected tour listings."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs sm:text-sm text-[#18282A]">
          <p>
            You are about to update{" "}
            <span className="font-bold text-[#176779]">
              {selectedCount} selected {selectedCount === 1 ? "tour" : "tours"}
            </span>{" "}
            to:
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <TourStatusBadge status={targetStatus} />
          </div>
          <p className="mt-2 text-xs text-[#74818A]">
            This change will immediately affect their visibility in search results and the live catalogue.
          </p>
        </div>

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
            onClick={onConfirm}
            data-testid="confirm-bulk-status-button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Confirm & Apply</span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
