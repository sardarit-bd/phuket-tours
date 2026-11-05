import * as React from "react";
import { CheckCircle2, EyeOff, FileEdit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminServiceStatus } from "../../types/admin";

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onInitiateBulkAction: (status: AdminServiceStatus) => void;
  isUpdating?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onInitiateBulkAction,
  isUpdating = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions toolbar"
      data-testid="bulk-action-bar"
      className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#176779]/20 bg-white/95 px-5 py-3.5 shadow-xl backdrop-blur-md transition-all sm:flex-nowrap"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-7 items-center rounded-lg bg-[#176779]/10 px-2.5 text-xs font-bold text-[#176779]">
          {selectedCount} selected
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          disabled={isUpdating}
          className="flex items-center gap-1 text-xs text-[#74818A] hover:text-[#18282A] transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
          <span>Clear selection</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onInitiateBulkAction("PUBLISHED")}
          className="inline-flex items-center gap-1.5 rounded-xl border-[#A3E5D9] bg-[#E8F8F5] text-xs font-semibold text-[#0E7A67] hover:bg-[#D1F2EB] transition-colors cursor-pointer disabled:opacity-50"
          data-testid="bulk-publish-button"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Publish Selected</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onInitiateBulkAction("UNPUBLISHED")}
          className="inline-flex items-center gap-1.5 rounded-xl border-[#FCD2CD] bg-[#FDF0EE] text-xs font-semibold text-[#C0392B] hover:bg-[#FADBD8] transition-colors cursor-pointer disabled:opacity-50"
          data-testid="bulk-unpublish-button"
        >
          <EyeOff className="h-3.5 w-3.5" />
          <span>Unpublish Selected</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onInitiateBulkAction("DRAFT")}
          className="inline-flex items-center gap-1.5 rounded-xl border-[#FCE8B2] bg-[#FEF9E7] text-xs font-semibold text-[#B7791F] hover:bg-[#FCF3CF] transition-colors cursor-pointer disabled:opacity-50"
          data-testid="bulk-draft-button"
        >
          <FileEdit className="h-3.5 w-3.5" />
          <span>Move to Draft</span>
        </Button>
      </div>
    </div>
  );
}
