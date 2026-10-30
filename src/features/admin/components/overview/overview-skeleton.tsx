import * as React from "react";
import { Skeleton } from "@/components/shared/loading-skeleton";

export function OverviewSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading admin overview analytics"
      data-testid="overview-skeleton"
      className="space-y-6"
    >
      {/* Header and Filter Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* 4 Core Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-8 w-36" />
            <Skeleton className="mt-2 h-3.5 w-48" />
          </div>
        ))}
      </div>

      {/* Reconciliation Panel Skeleton */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Booking Status Chart Skeleton */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="my-6 h-4 w-full rounded-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Service Performance Table Skeleton */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
