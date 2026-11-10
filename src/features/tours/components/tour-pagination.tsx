"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TourPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: TourPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);

    // Smoothly scroll to the top of the tour grid for better usability
    if (typeof window !== "undefined") {
      const mainContent = document.getElementById("tours-results-section");
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const getPageNumbers = (): (number | "ellipsis-left" | "ellipsis-right")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Tours pagination navigation"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-6 sm:pt-8",
        className
      )}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl border border-[#E5EAEB] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#18282A] shadow-2xs transition-all",
          currentPage <= 1
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer hover:border-primary/50 hover:bg-[#F5F8F9] hover:text-primary active:scale-95"
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Numbered Page Buttons & Ellipses */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pages.map((item, idx) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span
                key={`${item}-${idx}`}
                aria-hidden="true"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-[#8A9A9C]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const pageNum = item as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageClick(pageNum)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-white shadow-2xs ring-2 ring-primary/20 pointer-events-none"
                  : "border border-[#E5EAEB] bg-white text-[#18282A] shadow-2xs hover:border-primary/50 hover:bg-[#F5F8F9] hover:text-primary active:scale-95"
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Go to next page"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl border border-[#E5EAEB] bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#18282A] shadow-2xs transition-all",
          currentPage >= totalPages
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer hover:border-primary/50 hover:bg-[#F5F8F9] hover:text-primary active:scale-95"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
