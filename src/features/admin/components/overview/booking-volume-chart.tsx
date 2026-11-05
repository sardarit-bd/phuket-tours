import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatReportCount, getAllBookingStatusesBreakdown } from "../../utils/format";
import type { AdminBookingsReportData } from "../../types/admin";

export interface BookingVolumeChartProps {
  bookingsData?: AdminBookingsReportData | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

/**
 * Vertical bar chart of booking counts per status.
 * Uses the real /admin/reports/bookings `byStatus` data.
 */
export function BookingVolumeChart({
  bookingsData,
  isLoading = false,
  error,
  onRetry,
}: BookingVolumeChartProps) {
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);

  if (error) {
    return (
      <div
        role="alert"
        data-testid="booking-volume-error"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-outfit text-sm font-semibold">Booking volume unavailable</h4>
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
  const hasData = totalBookings > 0;

  // Only show statuses that actually have data, in the canonical order.
  const visible = allStatuses.filter((s) => s.count > 0);
  const maxCount = Math.max(...visible.map((s) => s.count), 1);

  return (
    <div
      data-testid="booking-volume-card"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2B9BA8]" />
            <h3 id="booking-volume-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Booking Volume
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">Number of bookings per status.</p>
        </div>
        <span
          data-testid="total-bookings-badge"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAED] bg-[#F5F8F9] px-3 py-1 text-xs font-semibold text-[#18282A]"
        >
          Total: {formatReportCount(totalBookings)}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 grid h-[200px] grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-[#F5F8F9]"
              style={{ minHeight: 120 }}
            />
          ))}
        </div>
      ) : !hasData ? (
        <div className="mt-5">
          <EmptyState
            compact
            icon={<BarChart3 className="h-5 w-5 text-[#2B9BA8]" />}
            title="No bookings recorded"
            description="No bookings recorded for the selected period."
          />
        </div>
      ) : (
        <div className="mt-5">
          {/* Vertical bars */}
          <div className="relative">
            <div className="flex h-[180px] items-end justify-between gap-2 border-b border-[#E5EAED] pb-2">
              {allStatuses.map((s) => {
                const isHovered = hoveredStatus === s.status;
                const barH = maxCount > 0 ? Math.max((s.count / maxCount) * 100, s.count > 0 ? 3 : 0) : 0;
                return (
                  <div
                    key={s.status}
                    className="group flex h-full flex-1 flex-col items-center justify-end"
                    onMouseEnter={() => setHoveredStatus(s.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    <div className="relative w-full">
                      <div
                        data-testid={`volume-bar-${s.status}`}
                        className="mx-auto w-full max-w-[44px] rounded-t-md transition-all duration-300"
                        style={{
                          height: `${barH}%`,
                          minHeight: s.count > 0 ? 4 : 0,
                          backgroundColor: s.count > 0 ? s.hexColor : "#E5EAED",
                          opacity: isHovered ? 1 : s.count > 0 ? 0.9 : 0.4,
                        }}
                        aria-label={`${s.label}: ${formatReportCount(s.count)} bookings`}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-[#74818A]">
                      {s.percentageString}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend with status names */}
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
            {allStatuses.map((s) => (
              <div
                key={s.status}
                className="flex items-center gap-1.5 text-[11px]"
                onMouseEnter={() => setHoveredStatus(s.status)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.count > 0 ? s.hexColor : "#D5DFE3" }}
                  aria-hidden="true"
                />
                <span className="truncate text-[#18282A]">{s.label}</span>
                <span className="ml-auto font-semibold text-[#74818A]">
                  {formatReportCount(s.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
