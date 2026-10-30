import * as React from "react";
import {
  formatReportCount,
  formatReportMoney,
  formatReportPercentage,
} from "../../utils/format";
import type { AdminServicesReportData, ServicePerformanceItem } from "../../types/admin";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Compass,
  Info,
  Layers,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServicePerformanceTableProps {
  servicesData?: AdminServicesReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

type ViewMode = "both" | "chart" | "table";
type SortOption = "volume" | "revenue" | "rate";

export function ServicePerformanceTable({
  servicesData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: ServicePerformanceTableProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("both");
  const [sortBy, setSortBy] = React.useState<SortOption>("volume");

  if (error) {
    return (
      <div
        role="alert"
        data-testid="service-performance-error"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-xs"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h4 className="font-outfit text-base font-semibold text-red-900">
                Failed to load service performance analytics
              </h4>
              <p className="mt-1 text-sm text-red-700">
                The services report endpoint could not be reached or returned an error.
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-300 bg-white text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="service-performance-loading"
        className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-60" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const rawItems = servicesData?.items ?? [];

  // Sort items according to active sort option
  const sortedItems: ServicePerformanceItem[] = [...rawItems].sort((a, b) => {
    if (sortBy === "revenue") {
      return b.revenue - a.revenue;
    }
    if (sortBy === "rate") {
      const rateA = a.totalBookings > 0 ? a.completedBookings / a.totalBookings : 0;
      const rateB = b.totalBookings > 0 ? b.completedBookings / b.totalBookings : 0;
      return rateB - rateA;
    }
    // Default: volume (totalBookings descending)
    return b.totalBookings - a.totalBookings;
  });

  const maxTotalBookings = Math.max(
    ...sortedItems.map((item) => item.totalBookings),
    1
  );

  return (
    <section
      aria-labelledby="service-performance-heading"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header with Title and View / Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-[#E5EAED] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2B9BA8]" />
            <h3
              id="service-performance-heading"
              className="font-outfit text-lg font-bold text-[#18282A]"
            >
              Service-Level Booking Performance
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">
            Tour and service performance aggregated from verified booking totals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Services Count Badge */}
          <span className="rounded-full border border-[#E5EAED] bg-[#F5F8F9] px-3 py-1 text-xs font-semibold text-[#18282A]">
            {servicesData?.total ?? rawItems.length} Active Services
          </span>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
                viewMode === "both"
                  ? "bg-white text-[#18282A] shadow-xs"
                  : "text-[#74818A] hover:text-[#18282A]"
              }`}
              title="Show both Volume Chart & Ledger Table"
            >
              <Layers className="h-3.5 w-3.5" />
              All
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
                viewMode === "chart"
                  ? "bg-white text-[#18282A] shadow-xs"
                  : "text-[#74818A] hover:text-[#18282A]"
              }`}
              title="Show Volume Chart Only"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#18282A] shadow-xs"
                  : "text-[#74818A] hover:text-[#18282A]"
              }`}
              title="Show Detailed Table Only"
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {rawItems.length === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No service records found"
            description="No service bookings have been recorded yet for the selected filters."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {/* Quick Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#74818A]">
            <div className="flex items-center gap-1.5">
              <span>Sort by:</span>
              <button
                type="button"
                onClick={() => setSortBy("volume")}
                className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                  sortBy === "volume"
                    ? "bg-[#E8F6F8] text-[#176779] font-semibold"
                    : "hover:bg-[#F5F8F9] text-[#74818A]"
                }`}
              >
                Volume
              </button>
              <button
                type="button"
                onClick={() => setSortBy("revenue")}
                className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                  sortBy === "revenue"
                    ? "bg-[#E8F6F8] text-[#176779] font-semibold"
                    : "hover:bg-[#F5F8F9] text-[#74818A]"
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setSortBy("rate")}
                className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                  sortBy === "rate"
                    ? "bg-[#E8F6F8] text-[#176779] font-semibold"
                    : "hover:bg-[#F5F8F9] text-[#74818A]"
                }`}
              >
                Completion Rate
              </button>
            </div>

            {/* Legend for horizontal comparison bars */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2B9BA8]" aria-hidden="true" />
                <span className="text-[11px] font-medium text-[#18282A]">Total Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-[11px] font-medium text-[#18282A]">Completed Bookings</span>
              </div>
            </div>
          </div>

          {/* 1. Horizontal Bar Chart Comparison Section */}
          {(viewMode === "both" || viewMode === "chart") && (
            <div
              data-testid="service-volume-chart"
              className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                  Booking Volume Comparison by Service
                </h4>
                <span className="text-[11px] text-[#74818A]">
                  Comparing Completed vs Total Pipeline
                </span>
              </div>

              {/* Scrollable list to handle large datasets gracefully */}
              <div className="max-h-[460px] space-y-4 overflow-y-auto pr-2 divide-y divide-[#E5EAED]/70">
                {sortedItems.map((svc) => {
                  const displayName = svc.name || `Service ${svc.serviceId.slice(0, 8)}`;
                  const totalPct = Math.max((svc.totalBookings / maxTotalBookings) * 100, 2);
                  const completedPct = Math.max(
                    (svc.completedBookings / maxTotalBookings) * 100,
                    svc.completedBookings > 0 ? 2 : 0
                  );
                  const completionRateStr = formatReportPercentage(
                    svc.completedBookings,
                    svc.totalBookings
                  );

                  return (
                    <div
                      key={svc.serviceId}
                      data-testid={`service-bar-${svc.serviceId}`}
                      className="pt-3.5 first:pt-0"
                    >
                      {/* Service Header Row */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8F6F8] text-[#176779]">
                            <Compass className="h-3.5 w-3.5" />
                          </div>
                          {/* Truncated service name with title tooltip for long names */}
                          <span
                            title={displayName}
                            className="truncate text-xs font-semibold text-[#18282A] max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg cursor-help"
                          >
                            {displayName}
                          </span>
                          <span className="shrink-0 rounded-md border border-[#E5EAED] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#74818A]">
                            {svc.type || "TOUR"}
                          </span>
                        </div>

                        {/* Badges & Financial Info */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            {completionRateStr}
                          </span>
                          <span className="font-medium text-[#74818A]">
                            Rev:{" "}
                            <span className="font-semibold text-[#18282A]">
                              {formatReportMoney(svc.revenue, currency)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Paired Horizontal Bars: Total vs Completed */}
                      <div className="space-y-1.5">
                        {/* Total Bookings Horizontal Bar */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[11px] font-medium text-[#74818A]">
                            Total:
                          </span>
                          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                            <div
                              className="h-full rounded-full bg-[#2B9BA8] transition-all duration-300"
                              style={{ width: `${totalPct}%` }}
                              title={`Total Bookings: ${svc.totalBookings}`}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right font-outfit text-xs font-bold text-[#18282A]">
                            {formatReportCount(svc.totalBookings)}
                          </span>
                        </div>

                        {/* Completed Bookings Horizontal Bar */}
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[11px] font-medium text-emerald-700">
                            Done:
                          </span>
                          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${completedPct}%` }}
                              title={`Completed Bookings: ${svc.completedBookings}`}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right font-outfit text-xs font-bold text-emerald-700">
                            {formatReportCount(svc.completedBookings)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Detailed Tabular Breakdown */}
          {(viewMode === "both" || viewMode === "table") && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E5EAED] bg-[#F8FAFB] text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Service / Tour Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Total Bookings
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Completed
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Booked Value
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Completed Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAED]">
                  {sortedItems.map((svc) => (
                    <tr
                      key={svc.serviceId}
                      data-testid={`service-row-${svc.serviceId}`}
                      className="transition-colors hover:bg-[#F8FAFB]"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#18282A]">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8F6F8] text-[#176779]">
                            <Compass className="h-4 w-4" />
                          </div>
                          <span
                            title={svc.name || undefined}
                            className="truncate max-w-[240px] sm:max-w-xs"
                          >
                            {svc.name || `Service ${svc.serviceId.slice(0, 8)}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="inline-flex rounded-md border border-[#E5EAED] bg-[#F5F8F9] px-2 py-0.5 font-medium text-[#74818A]">
                          {svc.type || "TOUR"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-[#18282A]">
                        {formatReportCount(svc.totalBookings)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-emerald-700">
                        {formatReportCount(svc.completedBookings)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-[#18282A]">
                        {formatReportMoney(svc.bookedValue, currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-[#18282A]">
                        {formatReportMoney(svc.revenue, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contract boundary notice regarding Recent Orders */}
      <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs text-[#74818A]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2B9BA8]" />
        <div>
          <span className="font-medium text-[#18282A]">Backend Contract Boundary: </span>
          The Admin Overview Analytics Center displays aggregated reports provided by{" "}
          <code className="text-[#176779]">/api/v1/admin/reports/*</code>. Individual booking order
          item records are not part of the reporting contract and will be managed in the dedicated
          Bookings Management module.
        </div>
      </div>
    </section>
  );
}
