"use client";

import * as React from "react";
import {
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetAdminPaymentsReportQuery,
  useGetAdminServicesReportQuery,
  type AdminReportFiltersQuery,
} from "@/features/admin/api/admin-api";
import { RevenueSummary } from "@/features/admin/components/overview/revenue-summary";
import { BookingStatusChart } from "@/features/admin/components/overview/booking-status-chart";
import { ServicePerformanceTable } from "@/features/admin/components/overview/service-performance-table";
import { OverviewSkeleton } from "@/features/admin/components/overview/overview-skeleton";
import { ReportFiltersBar } from "@/features/admin/components/overview/report-filters-bar";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";

export default function AdminOverviewPage() {
  const [filters, setFilters] = React.useState<AdminReportFiltersQuery>({});

  const {
    data: revenueResponse,
    isLoading: isRevenueLoading,
    isFetching: isRevenueFetching,
    error: revenueError,
    refetch: refetchRevenue,
  } = useGetAdminRevenueReportQuery(filters);

  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAdminBookingsReportQuery(filters);

  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetAdminPaymentsReportQuery(filters);

  const {
    data: servicesResponse,
    isLoading: isServicesLoading,
    isFetching: isServicesFetching,
    error: servicesError,
    refetch: refetchServices,
  } = useGetAdminServicesReportQuery({ ...filters, page: 1, limit: 10 });

  const isInitialLoading =
    isRevenueLoading || isBookingsLoading || isPaymentsLoading || isServicesLoading;

  const isRefreshing =
    isRevenueFetching || isBookingsFetching || isPaymentsFetching || isServicesFetching;

  const handleRefreshAll = () => {
    refetchRevenue();
    refetchBookings();
    refetchPayments();
    refetchServices();
  };

  const handleApplyFilters = (newFilters: AdminReportFiltersQuery) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const hasAnyError = Boolean(revenueError || bookingsError || paymentsError || servicesError);

  if (isInitialLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Admin Overview Analytics
            </h1>
            <span className="rounded-full border border-[#E5EAED] bg-[#F5F8F9] px-2.5 py-0.5 text-xs font-medium text-[#74818A]">
              Report Overview
            </span>
          </div>
          <p className="mt-1 text-sm text-[#74818A]">
            Aggregated platform financial performance, booking volume distribution, and service metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
            aria-label="Refresh all dashboard analytics"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
            {isRefreshing ? "Updating..." : "Refresh Analytics"}
          </Button>
        </div>
      </div>

      {/* Global Error Banner if any endpoint failed */}
      {hasAnyError && (
        <div
          role="alert"
          data-testid="admin-overview-global-error"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span>
                One or more report queries encountered an issue. Metrics below show available data.
              </span>
            </div>
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              size="sm"
              className="border-red-300 bg-white text-xs text-red-700 hover:bg-red-100"
            >
              Retry All
            </Button>
          </div>
        </div>
      )}

      {/* Report Date Window Filter */}
      <ReportFiltersBar
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isLoading={isRefreshing}
      />

      {/* Financial Totals & Payment Reconciliation */}
      <RevenueSummary
        revenueData={revenueResponse?.data}
        paymentsData={paymentsResponse?.data}
        currency={null}
        isLoading={isRevenueFetching}
        error={revenueError}
        onRetry={refetchRevenue}
      />

      {/* Booking Status Distribution */}
      <BookingStatusChart
        bookingsData={bookingsResponse?.data}
        currency={null}
        isLoading={isBookingsFetching}
        error={bookingsError}
        onRetry={refetchBookings}
      />

      {/* Service-Level Booking Performance */}
      <ServicePerformanceTable
        servicesData={servicesResponse?.data}
        currency={null}
        isLoading={isServicesFetching}
        error={servicesError}
        onRetry={refetchServices}
      />
    </div>
  );
}
