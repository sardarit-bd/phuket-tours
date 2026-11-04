import * as React from "react";
import { Skeleton } from "@/components/shared/loading-skeleton";

function CardShell({
  titleWidth,
  badgeWidth,
  children,
}: {
  titleWidth: string;
  badgeWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
        <Skeleton className={`h-5 ${titleWidth}`} />
        {badgeWidth && <Skeleton className={`h-6 ${badgeWidth} rounded-full`} />}
      </div>
      {children}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading admin overview analytics"
      data-testid="overview-skeleton"
      className="space-y-6"
    >
      {/* Header + filter bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      {/* KPI cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-2 h-3.5 w-40" />
          </div>
        ))}
      </div>

      {/* Two-column chart row: Revenue Trend + Booking Volume */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardShell titleWidth="w-40" badgeWidth="w-16">
          <div className="mt-5 flex h-[200px] items-end justify-between gap-2 pb-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-full rounded-t-md"
                style={{ height: `${40 + ((idx * 37) % 60)}%` }}
              />
            ))}
          </div>
          <Skeleton className="mt-3 h-3.5 w-3/4 rounded" />
        </CardShell>
        <CardShell titleWidth="w-36" badgeWidth="w-20">
          <div className="mt-5 grid h-[200px] grid-cols-7 items-end gap-2 pb-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="mx-auto w-full max-w-[44px] rounded-t-md"
                style={{ height: `${30 + ((idx * 53) % 70)}%` }}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="h-3 w-full rounded" />
            ))}
          </div>
        </CardShell>
      </div>

      {/* Two-column secondary analytics row: donut + service-level bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardShell titleWidth="w-56">
          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="mx-auto h-44 w-44">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 7 }).map((_, idx) => (
                <Skeleton key={idx} className="h-7 w-full rounded-md" />
              ))}
            </div>
          </div>
        </CardShell>
        <CardShell titleWidth="w-52" badgeWidth="w-20">
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardShell>
      </div>

      {/* Payment reconciliation summary */}
      <CardShell titleWidth="w-56" badgeWidth="w-28">
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </CardShell>

      {/* Recent bookings table */}
      <CardShell titleWidth="w-40" badgeWidth="w-24">
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}
