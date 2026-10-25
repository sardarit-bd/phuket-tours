"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourFilterState } from "../types/tour";
import { TourFiltersSidebar } from "./tour-filters-sidebar";

interface TourMobileFilterDrawerProps {
  filters: TourFilterState;
  activeFilterCount: number;
  toggleDestination: (id: string) => void;
  toggleTourType: (id: string) => void;
  toggleDuration: (id: string) => void;
  setPriceRange: (min: number, max: number) => void;
  clearAllFilters: () => void;
  totalFound: number;
}

export function TourMobileFilterDrawer({
  filters,
  activeFilterCount,
  toggleDestination,
  toggleTourType,
  toggleDuration,
  setPriceRange,
  clearAllFilters,
  totalFound,
}: TourMobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close drawer on escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile / Tablet Filter Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 rounded-full border-[#C9D6D8] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#18282A] shadow-2xs hover:bg-[#F5F8F9] cursor-pointer"
        aria-label="Open filter options"
      >
        <Filter className="h-4 w-4 text-primary" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter tours modal"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 lg:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EEF2F3] px-5 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-[#18282A]">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-[#5C6C6E] hover:bg-[#F5F8F9] hover:text-[#18282A] transition-colors"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <TourFiltersSidebar
              filters={filters}
              toggleDestination={toggleDestination}
              toggleTourType={toggleTourType}
              toggleDuration={toggleDuration}
              setPriceRange={setPriceRange}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Footer with Apply button */}
          <div className="border-t border-[#EEF2F3] bg-white p-4">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 text-sm shadow-sm"
            >
              Show {totalFound} {totalFound === 1 ? "Tour" : "Tours"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
