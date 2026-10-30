import * as React from "react";
import { formatReportCount, formatReportMoney } from "../../utils/format";
import type { AdminServicesReportData } from "../../types/admin";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertCircle, Compass, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServicePerformanceTableProps {
  servicesData?: AdminServicesReportData | null;
  currency?: string | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function ServicePerformanceTable({
  servicesData,
  currency,
  isLoading = false,
  error,
  onRetry,
}: ServicePerformanceTableProps) {
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
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const items = servicesData?.items ?? [];

  return (
    <section
      aria-labelledby="service-performance-heading"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5EAED] pb-4">
        <div>
          <h3
            id="service-performance-heading"
            className="font-outfit text-lg font-bold text-[#18282A]"
          >
            Service-Level Booking Performance
          </h3>
          <p className="text-xs text-[#74818A]">
            Tour and service performance aggregated from verified booking totals.
          </p>
        </div>
        <span className="rounded-full border border-[#E5EAED] bg-[#F5F8F9] px-3 py-1 text-xs font-semibold text-[#18282A]">
          {servicesData?.total ?? items.length} Active Services
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No service records found"
            description="No service bookings have been recorded yet for the selected filters."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
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
              {items.map((svc) => (
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
                      <span className="truncate max-w-[240px] sm:max-w-xs">
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
