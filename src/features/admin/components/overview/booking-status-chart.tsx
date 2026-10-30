import * as React from "react";
import {
  BOOKING_STATUS_CONFIG,
  formatReportCount,
  formatReportMoney,
  formatReportPercentage,
} from "../../utils/format";
import type { AdminBookingsReportData } from "../../types/admin";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, CalendarCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingStatusChartProps {
  bookingsData?: AdminBookingsReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function BookingStatusChart({
  bookingsData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: BookingStatusChartProps) {
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
        <Skeleton className="my-6 h-5 w-full rounded-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalBookings = bookingsData?.totalBookings ?? 0;
  const byStatus = bookingsData?.byStatus ?? [];

  return (
    <section
      aria-labelledby="booking-status-heading"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5EAED] pb-4">
        <div>
          <h3
            id="booking-status-heading"
            className="font-outfit text-lg font-bold text-[#18282A]"
          >
            Booking Status Distribution
          </h3>
          <p className="text-xs text-[#74818A]">
            Booking volume and gross values categorized by active lifecycle status.
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

      {totalBookings === 0 || byStatus.length === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No bookings recorded"
            description="There are currently no bookings recorded for the selected filter criteria."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Multi-segment distribution visual bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#74818A]">
              <span>Volume Breakdown</span>
              <span>100% of pipeline</span>
            </div>
            <div
              className="flex h-4 w-full overflow-hidden rounded-full bg-[#E5EAED]"
              role="progressbar"
              aria-label="Booking status distribution bar"
              aria-valuenow={totalBookings}
            >
              {byStatus.map((item) => {
                const pct = (item.count / totalBookings) * 100;
                if (pct <= 0) return null;
                const config = BOOKING_STATUS_CONFIG[item.status];
                return (
                  <div
                    key={item.status}
                    style={{ width: `${pct}%` }}
                    className={`${config?.barColor || "bg-gray-400"} transition-all`}
                    title={`${config?.label || item.status}: ${item.count} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Cards for each status with count and value */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byStatus.map((item) => {
              const config = BOOKING_STATUS_CONFIG[item.status];
              const percentage = formatReportPercentage(item.count, totalBookings);

              return (
                <div
                  key={item.status}
                  data-testid={`status-card-${item.status}`}
                  className="flex flex-col justify-between rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-3.5 transition-colors hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        config?.badgeClass || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {config?.label || item.status}
                    </span>
                    <span className="text-xs font-medium text-[#74818A]">
                      {percentage}
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
