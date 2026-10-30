import * as React from "react";
import { Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatReportCount } from "../../utils/format";

export interface ToursHeaderProps {
  totalCount?: number;
  isLoading?: boolean;
  onAddNewTour?: () => void;
}

export function ToursHeader({
  totalCount,
  isLoading = false,
  onAddNewTour,
}: ToursHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F6F8] text-[#176779]">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
              Tours Management
            </h1>
            {totalCount !== undefined && (
              <span
                data-testid="tours-total-count-badge"
                className="inline-flex items-center rounded-full bg-[#E8F6F8] px-2.5 py-0.5 text-xs font-semibold text-[#176779] border border-[#C9D6D8]/50"
              >
                {isLoading ? "..." : `${formatReportCount(totalCount)} Tours`}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#74818A]">
          Manage tour packages, schedule availability, pricing tiers, and live catalogue inventory.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={onAddNewTour}
          className="inline-flex items-center gap-2 rounded-xl bg-[#176779] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#125261] transition-colors cursor-pointer"
          data-testid="add-new-tour-button"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add New Tour</span>
        </Button>
      </div>
    </div>
  );
}
