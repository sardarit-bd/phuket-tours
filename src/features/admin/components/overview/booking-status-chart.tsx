import * as React from "react";
import {
  formatReportCount,
  formatReportMoney,
  getAllBookingStatusesBreakdown,
  type CompleteBookingStatusItem,
} from "../../utils/format";
import type { AdminBookingsReportData, AdminBookingStatus } from "../../types/admin";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, CalendarCheck, PieChart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingStatusChartProps {
  bookingsData?: AdminBookingsReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function computeSlicesWithOffsets(
  activeSlices: CompleteBookingStatusItem[],
  totalBookings: number,
  circumference: number
) {
  let runningOffset = 0;
  return activeSlices.map((slice) => {
    const sliceLength = (slice.count / totalBookings) * circumference;
    const offset = runningOffset;
    runningOffset += sliceLength;
    return {
      ...slice,
      sliceLength,
      offset,
    };
  });
}

export function BookingStatusChart({
  bookingsData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: BookingStatusChartProps) {
  const [hoveredStatus, setHoveredStatus] = React.useState<AdminBookingStatus | null>(null);

  if (error) {
    return (
      <div
        role="alert"
        data-testid="booking-status-chart-error"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-xs"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h4 className="font-outfit text-base font-semibold text-red-900">
                Failed to load booking status breakdown
              </h4>
              <p className="mt-1 text-sm text-red-700">
                The bookings report endpoint could not be reached or returned an error.
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
        data-testid="booking-status-chart-loading"
        className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="my-6 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
          <div className="flex justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalBookings = bookingsData?.totalBookings ?? 0;
  const rawByStatus = bookingsData?.byStatus ?? [];
  const allStatuses: CompleteBookingStatusItem[] = getAllBookingStatusesBreakdown(
    rawByStatus,
    totalBookings
  );

  // SVG Donut geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const activeSlices = allStatuses.filter((s) => s.count > 0);

  const slicesWithOffsets = computeSlicesWithOffsets(
    activeSlices,
    totalBookings,
    circumference
  );

  const activeHoveredItem = hoveredStatus
    ? allStatuses.find((s) => s.status === hoveredStatus)
    : null;

  return (
    <section
      aria-labelledby="booking-status-heading"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5EAED] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#2B9BA8]" />
            <h3
              id="booking-status-heading"
              className="font-outfit text-lg font-bold text-[#18282A]"
            >
              Booking Status Distribution
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">
            Comprehensive breakdown of all seven booking statuses across platform pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-testid="total-bookings-badge"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAED] bg-[#F5F8F9] px-3 py-1 text-xs font-semibold text-[#18282A]"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-primary" />
            Total Bookings: {formatReportCount(totalBookings)}
          </span>
        </div>
      </div>

      {totalBookings === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No bookings recorded"
            description="There are currently no bookings recorded for the selected filter criteria."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Top Analytics Panel: Interactive Donut Chart + Legend */}
          <div className="grid grid-cols-1 items-center gap-6 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 sm:p-6 lg:grid-cols-12">
            {/* SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center lg:col-span-5">
              <div className="relative flex h-52 w-52 items-center justify-center">
                <svg
                  viewBox="0 0 180 180"
                  className="h-full w-full transform overflow-visible"
                  role="img"
                  aria-label={`Donut chart showing booking distribution for ${totalBookings} total bookings`}
                >
                  {/* Subtle track background */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="#E5EAED"
                    strokeWidth="22"
                  />

                  {/* Dynamic Donut Segments */}
                  {slicesWithOffsets.map((slice) => {
                    const isHovered = hoveredStatus === slice.status;
                    return (
                      <circle
                        key={slice.status}
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="transparent"
                        stroke={slice.hexColor}
                        strokeWidth={isHovered ? 26 : 22}
                        strokeDasharray={`${slice.sliceLength} ${circumference - slice.sliceLength}`}
                        strokeDashoffset={-slice.offset}
                        transform="rotate(-90 90 90)"
                        className="cursor-pointer transition-all duration-200 focus:outline-none"
                        style={{
                          opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                          filter: isHovered ? "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" : "none",
                        }}
                        tabIndex={0}
                        role="graphics-symbol"
                        aria-label={`${slice.label}: ${slice.count} bookings (${slice.percentageString})`}
                        onMouseEnter={() => setHoveredStatus(slice.status)}
                        onMouseLeave={() => setHoveredStatus(null)}
                        onFocus={() => setHoveredStatus(slice.status)}
                        onBlur={() => setHoveredStatus(null)}
                      >
                        <title>
                          {`${slice.label}: ${formatReportCount(slice.count)} (${slice.percentageString})`}
                        </title>
                      </circle>
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div
                  data-testid="donut-center-display"
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
                >
                  {activeHoveredItem ? (
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                      <span
                        data-testid="donut-hovered-label"
                        className="text-[11px] font-medium uppercase tracking-wider text-[#74818A]"
                      >
                        {activeHoveredItem.label}
                      </span>
                      <p
                        data-testid="donut-hovered-count"
                        className="font-outfit text-xl font-bold text-[#18282A]"
                      >
                        {formatReportCount(activeHoveredItem.count)}
                      </p>
                      <span
                        data-testid="donut-hovered-percentage"
                        className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#2B9BA8] shadow-xs"
                      >
                        {activeHoveredItem.percentageString}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#74818A]">
                        Total
                      </span>
                      <p
                        data-testid="donut-total-count"
                        className="font-outfit text-2xl font-bold text-[#18282A]"
                      >
                        {formatReportCount(totalBookings)}
                      </p>
                      <span className="text-[10px] font-medium text-[#74818A]">Bookings</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-[#74818A]">
                Hover or focus on chart segments or legend items to inspect proportions.
              </p>
            </div>

            {/* Clear Legend & Status Distribution Overview */}
            <div className="space-y-3 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
                  Status Legend ({allStatuses.length} Categories)
                </span>
                <span className="text-xs font-medium text-[#74818A]">
                  Volume &amp; Share of Total
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {allStatuses.map((item) => {
                  const isHovered = hoveredStatus === item.status;
                  return (
                    <button
                      type="button"
                      key={item.status}
                      onClick={() => setHoveredStatus(hoveredStatus === item.status ? null : item.status)}
                      onMouseEnter={() => setHoveredStatus(item.status)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      onFocus={() => setHoveredStatus(item.status)}
                      onBlur={() => setHoveredStatus(null)}
                      className={`flex items-center justify-between rounded-lg border p-2 text-left transition-all ${
                        isHovered
                          ? "border-[#2B9BA8] bg-white shadow-xs ring-1 ring-[#2B9BA8]/30"
                          : "border-transparent bg-white/70 hover:border-[#E5EAED] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.hexColor }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium text-[#18282A]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-outfit text-xs font-bold text-[#18282A]">
                          {formatReportCount(item.count)}
                        </span>
                        <span className="w-12 text-right text-[11px] font-semibold text-[#74818A]">
                          {item.percentageString}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cards for all 7 statuses with count, gross value, and percentage */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#74818A]">
              Detailed Status Metrics
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allStatuses.map((item) => {
                const isHovered = hoveredStatus === item.status;
                return (
                  <div
                    key={item.status}
                    data-testid={`status-card-${item.status}`}
                    onMouseEnter={() => setHoveredStatus(item.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`flex flex-col justify-between rounded-lg border p-3.5 transition-all ${
                      isHovered
                        ? "border-[#2B9BA8] bg-white shadow-xs ring-1 ring-[#2B9BA8]/30"
                        : "border-[#E5EAED] bg-[#F8FAFB] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          item.badgeClass || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-[#74818A]">
                        {item.percentageString}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-[#74818A]">Bookings</span>
                        <p className="font-outfit text-xl font-bold text-[#18282A]">
                          {formatReportCount(item.count)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#74818A]">Total Value</span>
                        <p className="font-outfit text-sm font-semibold text-[#18282A]">
                          {formatReportMoney(item.totalValue, currency)}
                        </p>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: item.hexColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
