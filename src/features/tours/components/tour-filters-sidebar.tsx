"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { TourFilterGroup } from "./tour-filter-group";
import { TourPriceFilter } from "./tour-price-filter";
import { TourFilterState, FilterGroup } from "../types/tour";

interface TourFiltersSidebarProps {
  filters: TourFilterState;
  toggleDestination: (id: string) => void;
  toggleTourType: (id: string) => void;
  toggleDuration: (id: string) => void;
  setPriceRange: (min: number, max: number) => void;
  clearAllFilters: () => void;
  /** Dynamic destination filter group from backend data. */
  destinationGroup?: FilterGroup | null;
  /** Dynamic max price from backend data. Defaults to 500. */
  dynamicMaxPrice?: number;
  className?: string;
}

export function TourFiltersSidebar({
  filters,
  toggleDestination,
  toggleTourType,
  toggleDuration,
  setPriceRange,
  clearAllFilters,
  destinationGroup,
  dynamicMaxPrice = 500,
  className = "",
}: TourFiltersSidebarProps) {
  return (
    <aside
      aria-label="Tour Filters"
      className={`w-full flex flex-col space-y-3 ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EEF2F3]">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-[17px] font-bold text-[#18282A]">Filter Tours</h2>
        </div>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Destination Group (dynamic from backend data) */}
      {destinationGroup && destinationGroup.options.length > 0 && (
        <TourFilterGroup
          title={destinationGroup.title}
          options={destinationGroup.options}
          selectedIds={filters.destinations}
          onToggle={toggleDestination}
          defaultOpen={true}
          initialVisibleCount={5}
        />
      )}

      {/* Price Range Filter */}
      <TourPriceFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onChange={setPriceRange}
        defaultOpen={true}
        maxLimit={dynamicMaxPrice}
      />
    </aside>
  );
}
