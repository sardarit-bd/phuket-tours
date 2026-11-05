import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatReportCount,
  getAllBookingStatusesBreakdown,
} from "../../utils/format";
import type { AdminBookingsReportData } from "../../types/admin";

export interface BookingStatusDonutProps {
  bookingsData?: AdminBookingsReportData | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function computeSlicesWithOffsets(
  slices: Array<{ status: string; count: number; hexColor: string; label: string }>,
  total: number,
  circumference: number
) {
  let runningOffset = 0;
  return slices.map((slice) => {
    const sliceLength = (slice.count / total) * circumference;
    const offset = runningOffset;
    runningOffset += sliceLength;
    return { ...slice, sliceLength, offset };
  });
}

/**
 * Donut chart showing booking status distribution with total in the center
 * and a side legend (status, percentage, count).
 */
export function BookingStatusDonut({
  bookingsData,
  isLoading = false,
  error,
  onRetry,
}: BookingStatusDonutProps) {
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);

  if (error) {
    return (
      <div
        role="alert"
        data-testid="booking-status-donut-error"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-outfit text-sm font-semibold">Status breakdown unavailable</h4>
            <p className="mt-1 text-xs text-red-700">
              The bookings report endpoint could not be reached.
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 bg-white text-red-700 hover:bg-red-100"
              >
                <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalBookings = bookingsData?.totalBookings ?? 0;
  const allStatuses = getAllBookingStatusesBreakdown(
    bookingsData?.byStatus ?? [],
    totalBookings
  );
  const activeSlices = allStatuses.filter((s) => s.count > 0);
  const hasData = totalBookings > 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const slices = computeSlicesWithOffsets(
    activeSlices,
    totalBookings,
    circumference
  );

  const hoveredItem = hoveredStatus
    ? allStatuses.find((s) => s.status === hoveredStatus)
    : null;

  return (
    <div
      data-testid="booking-status-donut-card"
      className="flex h-full flex-col rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#2B9BA8]" />
            <h3 id="booking-status-donut-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Booking Status Distribution
            </h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 flex flex-1 items-center justify-center">
          <div className="h-44 w-44 animate-pulse rounded-full bg-[#F5F8F9]" />
        </div>
      ) : !hasData ? (
        <div className="mt-4 flex flex-1 items-center justify-center">
          <EmptyState
            compact
            icon={<PieChart className="h-5 w-5 text-[#2B9BA8]" />}
            title="No bookings recorded"
            description="No bookings recorded for the selected period."
          />
        </div>
      ) : (
        <div className="mt-4 grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-2">
          {/* Donut */}
          <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
            <svg viewBox="0 0 160 160" className="h-full w-full" role="img"
              aria-label={`Donut chart showing booking distribution for ${totalBookings} total bookings`}>
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#E5EAED" strokeWidth="18" />
              {slices.map((slice) => {
                const isHovered = hoveredStatus === slice.status;
                return (
                  <circle
                    key={slice.status}
                    cx="80" cy="80" r={radius} fill="transparent"
                    stroke={slice.hexColor}
                    strokeWidth={isHovered ? 22 : 18}
                    strokeDasharray={`${slice.sliceLength} ${circumference - slice.sliceLength}`}
                    strokeDashoffset={-slice.offset}
                    transform="rotate(-90 80 80)"
                    className="cursor-pointer transition-all duration-200"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${slice.label}: ${formatReportCount(slice.count)} bookings`}
                    onMouseEnter={() => setHoveredStatus(slice.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onFocus={() => setHoveredStatus(slice.status)}
                    onBlur={() => setHoveredStatus(null)}
                    style={{ opacity: hoveredStatus && !isHovered ? 0.4 : 1 }}
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              {hoveredItem ? (
                <>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#74818A]">
                    {hoveredItem.label}
                  </span>
                  <p className="font-outfit text-xl font-bold text-[#18282A]">
                    {formatReportCount(hoveredItem.count)}
                  </p>
                  <span className="text-[10px] font-semibold text-[#2B9BA8]">
                    {hoveredItem.percentageString}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#74818A]">
                    Total
                  </span>
                  <p className="font-outfit text-2xl font-bold text-[#18282A]">
                    {formatReportCount(totalBookings)}
                  </p>
                  <span className="text-[10px] font-medium text-[#74818A]">Bookings</span>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5">
            {allStatuses.map((s) => {
              const isHovered = hoveredStatus === s.status;
              return (
                <button
                  key={s.status}
                  type="button"
                  onClick={() => setHoveredStatus(hoveredStatus === s.status ? null : s.status)}
                  onMouseEnter={() => setHoveredStatus(s.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  onFocus={() => setHoveredStatus(s.status)}
                  onBlur={() => setHoveredStatus(null)}
                  className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left transition-all ${
                    isHovered
                      ? "border-[#2B9BA8] bg-white ring-1 ring-[#2B9BA8]/30"
                      : "border-transparent hover:border-[#E5EAED]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.count > 0 ? s.hexColor : "#D5DFE3" }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-[#18282A]">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-outfit text-xs font-bold text-[#18282A]">
                      {formatReportCount(s.count)}
                    </span>
                    <span className="w-10 text-right text-[11px] font-semibold text-[#74818A]">
                      {s.percentageString}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
