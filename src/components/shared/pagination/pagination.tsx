"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  pageSizeLabel?: string;
  itemLabel?: string;
  isFetching?: boolean;
  showFirstLastButtons?: boolean;
  showNumberedPages?: boolean;
  className?: string;
  dataTestId?: string;
  buttonTestIdPrefix?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages: explicitTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  pageSizeLabel = "Per page:",
  itemLabel = "items",
  isFetching = false,
  showFirstLastButtons = true,
  showNumberedPages = true,
  className = "",
  dataTestId = "pagination",
  buttonTestIdPrefix,
}: PaginationProps) {
  const btnPrefix = buttonTestIdPrefix ?? dataTestId;
  // If no items exist, do not render pagination
  if (totalItems <= 0) {
    return null;
  }

  // Calculate total pages safely
  const computedTotalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const totalPages = explicitTotalPages !== undefined ? Math.max(1, explicitTotalPages) : computedTotalPages;

  // Safe current page clamp
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Compute record range
  const startRecord = (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems);

  // Helper to handle page change safely
  const handlePageSelect = (page: number) => {
    if (isFetching) return;
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage !== safeCurrentPage) {
      onPageChange(targetPage);
    }
  };

  // Helper to handle page size changes and reset page appropriately
  const handlePageSizeSelect = (newSize: number) => {
    if (!onPageSizeChange || isFetching) return;
    onPageSizeChange(newSize);

    // If current page would exceed the new total pages, automatically reset to page 1
    const newTotalPages = Math.max(1, Math.ceil(totalItems / newSize));
    if (safeCurrentPage > newTotalPages) {
      onPageChange(1);
    }
  };

  // Helper to generate numbered page sequences with ellipsis
  const getPageNumbers = (): (number | "ellipsis-left" | "ellipsis-right")[] => {
    const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      if (start > 2) {
        pages.push("ellipsis-left");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-right");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = safeCurrentPage <= 1;
  const isLastPage = safeCurrentPage >= totalPages;

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        "flex flex-col gap-4 border-t border-[#E5EAED] bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border shadow-xs transition-all",
        // Tablet & Desktop layout: 3-column grid ensuring the center column is visually centered
        "sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2",
        className
      )}
    >
      {/* 1. Left Section: Record Count & Page Size Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-self-start sm:gap-3 text-xs text-[#74818A]">
        <span>
          Showing{" "}
          <strong className="font-semibold text-[#18282A]">
            {startRecord}–{endRecord}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold text-[#18282A]">
            {totalItems.toLocaleString()}
          </strong>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#B0BCC2]">•</span>
            <span className="whitespace-nowrap">{pageSizeLabel}</span>
            <CustomSelect<number>
              id={`${dataTestId}-size-select`}
              options={pageSizeOptions.map((size) => ({
                value: size,
                label: String(size),
              }))}
              value={pageSize}
              onChange={handlePageSizeSelect}
              size="sm"
              disabled={isFetching}
              usePortal={true}
              aria-label={pageSizeLabel.replace(":", "") || "Items per page"}
              data-testid={`${dataTestId}-size-select`}
              className="w-auto"
              triggerClassName="min-w-[62px] font-semibold text-[#18282A] bg-[#F8FAFB]"
            />
          </div>
        )}
      </div>

      {/* 2. Center Section: Navigation Controls (Visually Centered) */}
      <div className="flex items-center justify-center gap-1 sm:justify-self-center select-none">
        {/* First Page */}
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageSelect(1)}
            disabled={isFirstPage || isFetching}
            aria-label="First page"
            data-testid={`${btnPrefix}-first`}
            className="h-8 w-8 p-0 rounded-lg border-[#E5EAED] text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous Page */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(safeCurrentPage - 1)}
          disabled={isFirstPage || isFetching}
          aria-label="Previous page"
          data-testid={`${btnPrefix}-prev`}
          className="h-8 px-2 sm:px-2.5 rounded-lg border-[#E5EAED] text-xs font-medium text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Numbered Page Buttons OR Compact Page Counter */}
        {showNumberedPages ? (
          <div className="flex items-center gap-1 px-0.5">
            {pageNumbers.map((p, idx) => {
              if (p === "ellipsis-left" || p === "ellipsis-right") {
                return (
                  <span
                    key={`${p}-${idx}`}
                    aria-hidden="true"
                    className="flex h-8 w-6 items-center justify-center text-xs text-[#B0BCC2]"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === safeCurrentPage;
              return (
                <Button
                  key={p}
                  type="button"
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageSelect(p)}
                  disabled={isFetching}
                  data-testid={`${btnPrefix}-page-${p}`}
                  aria-label={`Page ${p}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "h-8 min-w-[32px] px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                    isCurrent
                      ? "bg-[#176779] border-[#176779] text-white hover:bg-[#125261] shadow-xs"
                      : "border-[#E5EAED] bg-white text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB]"
                  )}
                >
                  {p}
                </Button>
              );
            })}
          </div>
        ) : (
          <span className="px-2.5 text-xs font-semibold text-[#18282A]">
            Page {safeCurrentPage} of {totalPages}
          </span>
        )}

        {/* Next Page */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(safeCurrentPage + 1)}
          disabled={isLastPage || isFetching}
          aria-label="Next page"
          data-testid={`${btnPrefix}-next`}
          className="h-8 px-2 sm:px-2.5 rounded-lg border-[#E5EAED] text-xs font-medium text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 sm:ml-0.5" />
        </Button>

        {/* Last Page */}
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageSelect(totalPages)}
            disabled={isLastPage || isFetching}
            aria-label="Last page"
            data-testid={`${btnPrefix}-last`}
            className="h-8 w-8 p-0 rounded-lg border-[#E5EAED] text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 3. Right Section: Layout Balancer (Ensures true visual center on desktop) */}
      <div className="hidden sm:block sm:justify-self-end text-xs text-[#8A9A9C]">
        <span className="text-[11px] font-medium">
          Page <strong className="text-[#18282A] font-semibold">{safeCurrentPage}</strong> of{" "}
          <strong className="text-[#18282A] font-semibold">{totalPages}</strong>
        </span>
      </div>
    </div>
  );
}
