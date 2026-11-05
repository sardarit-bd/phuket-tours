import * as React from "react";
import { SearchX, Compass, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToursEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onAddNewTour?: () => void;
}

export function ToursEmptyState({
  isFiltered = false,
  onResetFilters,
  onAddNewTour,
}: ToursEmptyStateProps) {
  if (isFiltered) {
    return (
      <div
        data-testid="tours-empty-search-state"
        className="flex flex-col items-center justify-center px-6 py-16 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFB] text-[#74818A] border border-[#E5EAED]">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[#18282A]">
          No matching tours found
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-[#74818A] leading-relaxed">
          No tours match your current search terms or filter criteria. Try adjusting your query or reset all filters.
        </p>
        {onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            data-testid="empty-reset-filters-btn"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border-[#E5EAED] bg-white text-xs font-semibold text-[#176779] hover:bg-[#F8FAFB] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Search & Filters</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="tours-empty-db-state"
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#176779] border border-[#A3E5D9]">
        <Compass className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#18282A]">
        No tour listings created yet
      </h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#74818A] leading-relaxed">
        Start building your tour catalogue. You can configure metadata, pricing packages, schedule availability, and publish directly to visitors.
      </p>
      {onAddNewTour && (
        <Button
          type="button"
          size="sm"
          onClick={onAddNewTour}
          data-testid="empty-add-tour-btn"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#125261] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create First Tour</span>
        </Button>
      )}
    </div>
  );
}
