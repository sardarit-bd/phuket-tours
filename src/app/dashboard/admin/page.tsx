"use client";

import * as React from "react";
import {
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetAdminPaymentsReportQuery,
  useGetAdminServicesReportQuery,
  type AdminReportFiltersQuery,
} from "@/features/admin/api/admin-api";
import { FinancialKpiCards } from "@/features/admin/components/overview/financial-kpi-cards";
import { RevenueTrendChart } from "@/features/admin/components/overview/revenue-trend-chart";
import { BookingVolumeChart } from "@/features/admin/components/overview/booking-volume-chart";
import { BookingStatusDonut } from "@/features/admin/components/overview/booking-status-donut";
import { ServiceLevelPerformance } from "@/features/admin/components/overview/service-performance-table";
import { PaymentReconciliationCard } from "@/features/admin/components/overview/payment-reconciliation-card";
import { RecentBookingsTable } from "@/features/admin/components/overview/recent-bookings-table";
import { OverviewSkeleton } from "@/features/admin/components/overview/overview-skeleton";
import { ReportFiltersBar } from "@/features/admin/components/overview/report-filters-bar";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useModulePermissions } from "@/features/admin/context/module-permissions";
import { STAFF_OVERVIEW_PERMISSIONS } from "@/features/dashboard/types/dashboard-nav";

export default function AdminOverviewPage() {
  const [filters, setFilters] = React.useState<AdminReportFiltersQuery>({});
  const { isStaff, hasAll } = useModulePermissions();

  // Overview analytics require reports.view for Staff. Admins bypass all
  // permission checks. dashboard.view is no longer a mandatory entry
  // permission — module access alone is sufficient.
  const canViewOverview =
    !isStaff || hasAll(STAFF_OVERVIEW_PERMISSIONS);

  const {
    data: revenueResponse,
    isLoading: isRevenueLoading,
    isFetching: isRevenueFetching,
    error: revenueError,
    refetch: refetchRevenue,
  } = useGetAdminRevenueReportQuery(filters, { skip: !canViewOverview });

  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAdminBookingsReportQuery(filters, { skip: !canViewOverview });

  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetAdminPaymentsReportQuery(filters, { skip: !canViewOverview });

  const {
    data: servicesResponse,
    isLoading: isServicesLoading,
    isFetching: isServicesFetching,
    error: servicesError,
    refetch: refetchServices,
  } = useGetAdminServicesReportQuery(
    { ...filters, page: 1, limit: 10 },
    { skip: !canViewOverview }
  );

  const isInitialLoading =
    isRevenueLoading || isBookingsLoading || isPaymentsLoading || isServicesLoading;

  const isRefreshing =
    isRevenueFetching || isBookingsFetching || isPaymentsFetching || isServicesFetching;

  // Determine the portal prefix for internal links (View All, etc.)
  const portalPrefix = isStaff ? "/dashboard/staff" : "/dashboard/admin";

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

  if (!canViewOverview) {
    return (
      <div
        data-testid="overview-access-denied"
        className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A]">
          Overview Analytics Restricted
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#74818A] leading-relaxed">
          Your account doesn&rsquo;t have access to Overview analytics yet.
          Please contact your administrator to request access.
        </p>
      </div>
    );
  }

  if (isInitialLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              {isStaff ? "Staff Overview Analytics" : "Admin Overview Analytics"}
            </h1>
            <span className="hidden rounded-full border border-[#E5EAED] bg-[#F8FAFB] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#74818A] sm:inline-block">
              Report Overview
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[#74818A]">
            Monitor bookings, revenue and overall platform performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="h-9 border-[#E5EAED] bg-white px-4 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
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

      {/* Financial KPI Cards */}
      <FinancialKpiCards
        revenueData={revenueResponse?.data}
        currency={null}
        isLoading={isRevenueFetching}
      />

      {/* Analytics charts: Revenue Trend + Booking Volume */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueTrendChart
          revenueData={revenueResponse?.data}
          currency={null}
          isLoading={isRevenueFetching}
          error={revenueError}
          onRetry={refetchRevenue}
        />
        <BookingVolumeChart
          bookingsData={bookingsResponse?.data}
          isLoading={isBookingsFetching}
          error={bookingsError}
          onRetry={refetchBookings}
        />
      </div>

      {/* Secondary analytics: status donut + service-level performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BookingStatusDonut
          bookingsData={bookingsResponse?.data}
          isLoading={isBookingsFetching}
          error={bookingsError}
          onRetry={refetchBookings}
        />
        <ServiceLevelPerformance
          servicesData={servicesResponse?.data}
          currency={null}
          isLoading={isServicesFetching}
          error={servicesError}
          onRetry={refetchServices}
          viewAllHref={`${portalPrefix}/tours`}
        />
      </div>

      {/* Payment Reconciliation Summary */}
      <PaymentReconciliationCard
        revenueData={revenueResponse?.data}
        paymentsData={paymentsResponse?.data}
        currency={null}
        isLoading={isPaymentsFetching}
        error={paymentsError}
        onRetry={refetchPayments}
      />

      {/* Recent Bookings */}
      <RecentBookingsTable
        limit={6}
        viewAllHref={`${portalPrefix}/bookings`}
      />
    </div>
  );
}
