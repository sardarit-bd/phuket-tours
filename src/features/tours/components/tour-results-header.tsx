"use client";

import * as React from "react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { sortOptions } from "../data/tours-data";
import { TourSortOption } from "../types/tour";

interface TourResultsHeaderProps {
  count: number;
  page?: number;
  limit?: number;
  sortBy: TourSortOption;
  onSortChange: (sortBy: TourSortOption) => void;
  mobileFilterSlot?: React.ReactNode;
}

export function TourResultsHeader({
  count,
  page,
  limit,
  sortBy,
  onSortChange,
  mobileFilterSlot,
}: TourResultsHeaderProps) {
  let resultLabel = `${count} ${count === 1 ? "tour found" : "tours found"}`;

  if (page !== undefined && limit !== undefined && count > 0) {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, count);
    resultLabel = `${start}–${end} of ${count} tours`;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
      {/* Left: Result Count / Range */}
      <div className="flex items-center gap-3">
        {mobileFilterSlot}
        <p className="text-sm sm:text-[15px] font-semibold text-[#18282A]">
          {resultLabel}
        </p>
      </div>

      {/* Right: Sort by Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <label
          id="tour-sort-label"
          htmlFor="tour-sort-select"
          className="text-xs sm:text-sm font-medium text-[#5C6C6E]"
        >
          Sort by:
        </label>
        <CustomDropdown<TourSortOption>
          id="tour-sort-select"
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          aria-labelledby="tour-sort-label"
          align="right"
        />
      </div>
    </div>
  );
}
