import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, BarChart3, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  formatReportCount,
  formatReportPercentage,
} from "../../utils/format";
import type { AdminServicesReportData } from "../../types/admin";

export interface ServiceLevelPerformanceProps {
  servicesData?: AdminServicesReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Maximum number of services to display. Default 5. */
  maxItems?: number;
  /** Optional "View All" link target. Omit to hide the link. */
  viewAllHref?: string;
}

/**
 * Horizontal progress bars for top services by booking volume.
 * Shows max `maxItems` services with a "View All" link.
 */
export function ServiceLevelPerformance({
  servicesData,
  isLoading = false,
  error,
  onRetry,
  maxItems = 5,
  viewAllHref = "/dashboard/admin/tours",
}: ServiceLevelPerformanceProps) {
  if (error) {
    return (
      <div
        role="alert"
        data-testid="service-performance-error"
        className="flex h-full items-center rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs"
      >
        <div className="flex w-full items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h4 className="font-outfit text-sm font-semibold">Service performance unavailable</h4>
            <p className="mt-1 text-xs text-red-700">
              The services report endpoint could not be reached.
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

  const rawItems = servicesData?.items ?? [];
  const sorted = [...rawItems].sort((a, b) => b.totalBookings - a.totalBookings);
  const top = sorted.slice(0, maxItems);
  const hasData = rawItems.length > 0;
  const maxTotal = Math.max(...sorted.map((i) => i.totalBookings), 1);

  return (
    <div
      data-testid="service-performance-card"
      className="flex h-full flex-col rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2B9BA8]" />
            <h3 id="service-performance-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Service-Level Performance
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">Bookings by service.</p>
        </div>
        {hasData && viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs font-medium text-[#176779] hover:bg-[#E8F6F8]">
            <Link href={viewAllHref}>
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-[#F5F8F9]" />
          ))}
        </div>
      ) : !hasData ? (
        <div className="mt-4 flex flex-1 items-center">
          <EmptyState
            compact
            icon={<Compass className="h-5 w-5 text-[#2B9BA8]" />}
            title="No service records found"
            description="No service bookings recorded for the selected period."
          />
        </div>
      ) : (
        <div className="mt-4 flex-1 space-y-3">
          {top.map((svc) => {
            const displayName = svc.name || `Service ${svc.serviceId.slice(0, 8)}`;
            const totalPct = Math.max((svc.totalBookings / maxTotal) * 100, 2);
            const rateStr = formatReportPercentage(svc.completedBookings, svc.totalBookings);

            return (
              <div
                key={svc.serviceId}
                data-testid={`service-bar-${svc.serviceId}`}
                className="group"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8F6F8] text-[#176779]">
                      <Compass className="h-3.5 w-3.5" />
                    </div>
                    <span
                      title={displayName}
                      className="truncate text-xs font-semibold text-[#18282A]"
                    >
                      {displayName}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[11px]">
                    <span className="font-semibold text-[#74818A]">{rateStr}</span>
                    <span className="font-outfit text-xs font-bold text-[#18282A]">
                      {formatReportCount(svc.totalBookings)}
                    </span>
                  </div>
                </div>

                {/* Progress bar: completed vs total */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#E5EAED]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(svc.completedBookings / maxTotal) * 100}%` }}
                    title={`Completed: ${svc.completedBookings}`}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#2B9BA8]/40 transition-all duration-300"
                    style={{ width: `${totalPct}%` }}
                    title={`Total: ${svc.totalBookings}`}
                  />
                </div>
              </div>
            );
          })}

          {sorted.length > top.length && (
            <p className="pt-1 text-[11px] text-[#74818A]">
              Showing top {top.length} of {formatReportCount(sorted.length)} services
            </p>
          )}
        </div>
      )}
    </div>
  );
}
