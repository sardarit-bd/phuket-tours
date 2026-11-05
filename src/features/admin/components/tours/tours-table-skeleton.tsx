import * as React from "react";

export interface ToursTableSkeletonProps {
  rowCount?: number;
}

export function ToursTableSkeleton({ rowCount = 6 }: ToursTableSkeletonProps) {
  return (
    <div
      data-testid="tours-table-skeleton"
      aria-label="Loading tours"
      aria-busy="true"
      className="divide-y divide-[#E5EAED] overflow-hidden"
    >
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 px-6 py-4 animate-pulse bg-white"
        >
          {/* Checkbox skeleton */}
          <div className="h-4 w-4 rounded bg-[#E5EAED] shrink-0" />

          {/* Tour info skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-[#E5EAED]" />
            <div className="h-3 w-72 rounded bg-[#F1F4F6]" />
          </div>

          {/* Destination */}
          <div className="hidden md:block w-28">
            <div className="h-3.5 w-20 rounded bg-[#E5EAED]" />
          </div>

          {/* Provider */}
          <div className="hidden lg:block w-28">
            <div className="h-3.5 w-24 rounded bg-[#E5EAED]" />
          </div>

          {/* Pricing */}
          <div className="hidden sm:block w-24">
            <div className="h-4 w-16 rounded bg-[#E5EAED]" />
          </div>

          {/* Availability */}
          <div className="hidden xl:block w-24">
            <div className="h-3.5 w-20 rounded bg-[#E5EAED]" />
          </div>

          {/* Status Badge */}
          <div className="w-24">
            <div className="h-6 w-20 rounded-full bg-[#E5EAED]" />
          </div>

          {/* Updated date */}
          <div className="hidden lg:block w-20">
            <div className="h-3 w-16 rounded bg-[#E5EAED]" />
          </div>

          {/* Actions */}
          <div className="w-8 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#E5EAED]" />
          </div>
        </div>
      ))}
    </div>
  );
}
