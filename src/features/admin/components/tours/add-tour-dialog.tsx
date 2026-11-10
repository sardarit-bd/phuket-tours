import * as React from "react";
import { TourEditorModal } from "./tour-editor/tour-editor-modal";
import type { AdminServiceRecord } from "../../types/admin";

export interface AddTourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  tourName?: string;
  tour?: AdminServiceRecord | null;
  onSuccess?: (savedTour: AdminServiceRecord) => void;
}

export function AddTourDialog({
  isOpen,
  onClose,
  mode = "create",
  tour,
  onSuccess,
}: AddTourDialogProps) {
  return (
    <TourEditorModal
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      tour={tour}
      onSuccess={onSuccess}
    />
  );
}

export { TourEditorModal };
