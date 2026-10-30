import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToursPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}

export function ToursPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
}: ToursPaginationProps) {
  if (total === 0) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Helper to generate page sequence with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) {
        pages.push("ellipsis");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      data-testid="tours-pagination"
      className="flex flex-col items-center justify-between gap-4 border-t border-[#E5EAED] bg-white px-6 py-4 sm:flex-row"
    >
      {/* Total and range display */}
      <div className="flex items-center gap-3 text-xs text-[#74818A]">
        <span>
          Showing{" "}
          <strong className="font-semibold text-[#18282A]">
            {startRecord}–{endRecord}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold text-[#18282A]">
            {total.toLocaleString()}
          </strong>{" "}
          tours
        </span>

        {onLimitChange && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-[#B0BCC2]">•</span>
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Rows per page"
              disabled={isFetching}
              className="rounded-lg border border-[#E5EAED] bg-white px-2 py-1 text-xs font-medium text-[#18282A] focus:border-[#176779] focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Page navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isFetching}
          aria-label="First page"
          data-testid="pagination-first"
          className="h-8 w-8 p-0 rounded-lg text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
          aria-label="Previous page"
          data-testid="pagination-prev"
          className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-xs text-[#B0BCC2]"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <Button
                key={p}
                type="button"
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                disabled={isFetching}
                data-testid={`pagination-page-${p}`}
                aria-label={`Page ${p}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`h-8 w-8 p-0 text-xs font-semibold rounded-lg ${
                  isCurrent
                    ? "bg-[#176779] text-white hover:bg-[#125261]"
                    : "text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB]"
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
          aria-label="Next page"
          data-testid="pagination-next"
          className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isFetching}
          aria-label="Last page"
          data-testid="pagination-last"
          className="h-8 w-8 p-0 rounded-lg text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
