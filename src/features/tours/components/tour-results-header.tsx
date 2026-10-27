"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
          htmlFor="tour-sort-select"
          className="text-xs sm:text-sm font-medium text-[#5C6C6E]"
        >
          Sort by:
        </label>
        <div className="relative inline-flex items-center">
          <select
            id="tour-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as TourSortOption)}
            className="appearance-none rounded-xl border border-[#E5EAEB] bg-white py-1.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-[#18282A] shadow-2xs hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#5C6C6E]"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
