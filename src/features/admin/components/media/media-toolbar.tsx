"use client";

import * as React from "react";
import { Search, X, RefreshCw, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterUnattached?: "true" | "false" | "all";
  onFilterChange: (value: "true" | "false" | "all") => void;
  filterFormat?: string;
  onFormatChange?: (value: string) => void;
  sortBy?: "newest" | "oldest" | "name";
  onSortChange?: (value: "newest" | "oldest" | "name") => void;
  onRefresh: () => void;
  isFetching?: boolean;
  selectedCount?: number;
  totalOnPage?: number;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  onBulkAttach?: () => void;
  onBulkDetach?: () => void;
}

export function MediaToolbar({
  searchQuery,
  onSearchChange,
  filterUnattached = "all",
  onFilterChange,
  filterFormat = "all",
  onFormatChange,
  sortBy = "newest",
  onSortChange,
  onRefresh,
  isFetching = false,
  selectedCount = 0,
  totalOnPage = 0,
  onToggleSelectAll,
  isAllSelected = false,
  onClearSelection,
  onBulkDelete,
  onBulkAttach,
  onBulkDetach,
}: MediaToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#74818A]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by filename or public ID..."
            data-testid="media-search-input"
            className="w-full rounded-xl border border-[#E5EAED] bg-[#F8FAFB] py-2 pl-9 pr-9 text-xs sm:text-sm text-[#18282A] placeholder-[#74818A] transition-colors focus:border-[#176779] focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              data-testid="media-search-clear-btn"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#74818A] hover:text-[#18282A] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter and Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Attachment status filter tabs */}
          <div className="inline-flex rounded-xl bg-[#F0F4F6] p-1 text-xs font-medium text-[#74818A]">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              data-testid="filter-media-all"
              className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                filterUnattached === "all"
                  ? "bg-white text-[#18282A] font-semibold shadow-2xs"
                  : "hover:text-[#18282A]"
              }`}
            >
              All Assets
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("false")}
              data-testid="filter-media-attached"
              className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                filterUnattached === "false"
                  ? "bg-white text-[#18282A] font-semibold shadow-2xs"
                  : "hover:text-[#18282A]"
              }`}
            >
              Attached
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("true")}
              data-testid="filter-media-unattached"
              className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                filterUnattached === "true"
                  ? "bg-white text-[#18282A] font-semibold shadow-2xs"
                  : "hover:text-[#18282A]"
              }`}
            >
              Unattached
            </button>
          </div>

          {/* Format Filter Dropdown */}
          {onFormatChange && (
            <select
              value={filterFormat}
              onChange={(e) => onFormatChange(e.target.value)}
              data-testid="media-format-filter"
              aria-label="Filter by image format"
              className="h-8.5 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-2.5 text-xs font-medium text-[#18282A] transition-colors focus:border-[#176779] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="jpg">JPG / JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
            </select>
          )}

          {/* Sort By Dropdown */}
          {onSortChange && (
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "newest" | "oldest" | "name")}
              data-testid="media-sort-by"
              aria-label="Sort media assets"
              className="h-8.5 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-2.5 text-xs font-medium text-[#18282A] transition-colors focus:border-[#176779] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Filename (A-Z)</option>
            </select>
          )}

          {/* Refresh button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            data-testid="media-refresh-btn"
            aria-label="Refresh media list"
            className="h-8.5 rounded-xl border-[#E5EAED] bg-white px-2.5 text-xs text-[#74818A] hover:bg-[#F8FAFB] hover:text-[#18282A] cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[#176779]" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Bulk selection bar if items are selected or page has items */}
      {totalOnPage > 0 && (
        <div className="flex flex-wrap items-center justify-between border-t border-[#E5EAED]/60 pt-2.5 text-xs text-[#74818A]">
          <div className="flex items-center gap-2">
            {onToggleSelectAll && (
              <button
                type="button"
                onClick={onToggleSelectAll}
                data-testid="media-select-all-btn"
                className="inline-flex items-center gap-1.5 font-medium text-[#18282A] hover:text-[#176779] cursor-pointer"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4 text-[#176779]" />
                ) : (
                  <Square className="h-4 w-4 text-[#74818A]" />
                )}
                <span>Select All on Page</span>
              </button>
            )}

            {selectedCount > 0 && (
              <span
                data-testid="media-selected-count-badge"
                className="ml-2 inline-flex items-center rounded-full bg-[#E8F6F8] px-2.5 py-0.5 text-xs font-semibold text-[#176779]"
              >
                {selectedCount} selected
              </span>
            )}
          </div>

          {selectedCount > 0 && onClearSelection && (
            <div className="flex flex-wrap items-center gap-3">
              {onBulkAttach && (
                <button
                  type="button"
                  onClick={onBulkAttach}
                  data-testid="media-bulk-attach-btn"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#176779] hover:text-[#125261] cursor-pointer"
                >
                  Attach to Tour ({selectedCount})
                </button>
              )}
              {onBulkDetach && (
                <button
                  type="button"
                  onClick={onBulkDetach}
                  data-testid="media-bulk-detach-btn"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#74818A] hover:text-[#18282A] cursor-pointer"
                >
                  Detach ({selectedCount})
                </button>
              )}
              {onBulkDelete && (
                <button
                  type="button"
                  onClick={onBulkDelete}
                  data-testid="media-bulk-delete-btn"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C0392B] hover:text-[#962D22] cursor-pointer"
                >
                  Delete Selected ({selectedCount})
                </button>
              )}
              <button
                type="button"
                onClick={onClearSelection}
                data-testid="media-clear-selection-btn"
                className="text-xs font-medium text-[#74818A] hover:underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
