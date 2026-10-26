"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { filterGroups } from "../data/tours-data";
import { TourFilterGroup } from "./tour-filter-group";
import { TourPriceFilter } from "./tour-price-filter";
import { TourFilterState } from "../types/tour";

interface TourFiltersSidebarProps {
  filters: TourFilterState;
  toggleDestination: (id: string) => void;
  toggleTourType: (id: string) => void;
  toggleDuration: (id: string) => void;
  setPriceRange: (min: number, max: number) => void;
  clearAllFilters: () => void;
  className?: string;
}

export function TourFiltersSidebar({
  filters,
  toggleDestination,
  toggleTourType,
  toggleDuration,
  setPriceRange,
  clearAllFilters,
  className = "",
}: TourFiltersSidebarProps) {
  const destinationGroup = filterGroups.find((g) => g.id === "destination");
  const tourTypeGroup = filterGroups.find((g) => g.id === "tour-type");
  const durationGroup = filterGroups.find((g) => g.id === "duration");

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

      {/* Destination Group */}
      {destinationGroup && (
        <TourFilterGroup
          title={destinationGroup.title}
          options={destinationGroup.options}
          selectedIds={filters.destinations}
          onToggle={toggleDestination}
          defaultOpen={true}
          initialVisibleCount={5}
        />
      )}

      {/* Tour Type Group */}
      {tourTypeGroup && (
        <TourFilterGroup
          title={tourTypeGroup.title}
          options={tourTypeGroup.options}
          selectedIds={filters.tourTypes}
          onToggle={toggleTourType}
          defaultOpen={true}
          initialVisibleCount={5}
        />
      )}

      {/* Duration Group */}
      {durationGroup && (
        <TourFilterGroup
          title={durationGroup.title}
          options={durationGroup.options}
          selectedIds={filters.durations}
          onToggle={toggleDuration}
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
      />
    </aside>
  );
}
