"use client";

import * as React from "react";
import {
  Search,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import type {
  AdminServiceStatus,
  AdminServiceSortField,
  AdminSortOrder,
} from "../../types/admin";

export interface ToursToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: AdminServiceStatus | "ALL";
  onStatusChange: (status: AdminServiceStatus | "ALL") => void;
  sortBy: AdminServiceSortField;
  onSortByChange: (field: AdminServiceSortField) => void;
  sortOrder: AdminSortOrder;
  onSortOrderToggle: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

const STATUS_OPTIONS: DropdownOption<string>[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "UNPUBLISHED", label: "Unpublished" },
];

const SORT_OPTIONS: DropdownOption<string>[] = [
  { value: "relevance", label: "Relevance" },
  { value: "updatedAt", label: "Last Updated" },
  { value: "createdAt", label: "Date Created" },
  { value: "name", label: "Tour Name" },
  { value: "status", label: "Status" },
];

const PAGE_SIZE_OPTIONS: DropdownOption<string>[] = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export function ToursToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  pageSize,
  onPageSizeChange,
  onResetFilters,
  isFiltered,
}: ToursToolbarProps) {
  // Local state for debounced search input
  const [prevSearch, setPrevSearch] = React.useState(search);
  const [localSearch, setLocalSearch] = React.useState(search);

  // Sync state when external prop changes (e.g. filter reset)
  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // 300ms Debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAED] bg-white p-3.5 sm:p-4 shadow-2xs">
      {/* Top Row: Search Input & Primary Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Input with Debounce & Clear */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74818A]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search tours by name, destination, provider, description..."
            data-testid="tours-search-input"
            className="w-full rounded-xl border border-[#E5EAED] bg-[#F8FAFB] py-2 pl-9.5 pr-9 text-xs sm:text-sm text-[#18282A] placeholder:text-[#9AA6AC] transition-all focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/15"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              data-testid="tours-search-clear-button"
              aria-label="Clear search input"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#74818A] hover:bg-[#E5EAED] hover:text-[#18282A] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="min-w-[130px]">
            <CustomDropdown
              id="status-filter-dropdown"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => onStatusChange(val as AdminServiceStatus | "ALL")}
              placeholder="Status"
              triggerClassName="h-9 text-xs font-medium rounded-xl border-[#E5EAED] bg-white hover:bg-[#F8FAFB]"
              align="left"
              aria-label="Filter by tour status"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="min-w-[140px]">
            <CustomDropdown
              id="sort-by-dropdown"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => onSortByChange(val as AdminServiceSortField)}
              placeholder="Sort by"
              triggerClassName="h-9 text-xs font-medium rounded-xl border-[#E5EAED] bg-white hover:bg-[#F8FAFB]"
              align="left"
              aria-label="Sort tours by field"
            />
          </div>

          {/* Sort Order Toggle (Asc / Desc) */}
          <button
            type="button"
            onClick={onSortOrderToggle}
            data-testid="sort-order-toggle-button"
            aria-label={`Toggle sort order (currently ${sortOrder.toUpperCase()})`}
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F8FAFB] hover:text-[#18282A] transition-colors cursor-pointer"
          >
            {sortOrder === "asc" ? (
              <ArrowUp className="h-4 w-4 stroke-[2.5] text-[#176779]" />
            ) : (
              <ArrowDown className="h-4 w-4 stroke-[2.5] text-[#176779]" />
            )}
          </button>

          {/* Page Size Selector */}
          <div className="min-w-[120px] hidden sm:block">
            <CustomDropdown
              id="page-size-dropdown"
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              placeholder="Page size"
              triggerClassName="h-9 text-xs font-medium rounded-xl border-[#E5EAED] bg-white hover:bg-[#F8FAFB]"
              align="right"
              aria-label="Select items per page"
            />
          </div>

          {/* Reset Filters Action */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              onClick={onResetFilters}
              data-testid="tours-reset-filters-button"
              className="h-9 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl cursor-pointer"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
