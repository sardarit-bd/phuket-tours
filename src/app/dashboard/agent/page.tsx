"use client";

import * as React from "react";
import Link from "next/link";
import {
  useGetAgentOverviewQuery,
  useGetAgentBookingsQuery,
  useGetAgentCommissionsQuery,
  useGetAgentProfileQuery,
} from "@/features/agent/api/agent-api";
import { AgentMetricsCards } from "@/features/agent/components/overview/agent-metrics-cards";
import { RecentBookingsPreview } from "@/features/agent/components/overview/recent-bookings-preview";
import { RecentCommissionsPreview } from "@/features/agent/components/overview/recent-commissions-preview";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Compass,
  AlertCircle,
  Building2,
  CalendarCheck,
  Percent,
} from "lucide-react";

export default function AgentOverviewPage() {
  const {
    data: overviewResponse,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetAgentOverviewQuery();

  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    refetch: refetchBookings,
  } = useGetAgentBookingsQuery({ page: 1, limit: 5 });

  const {
    data: commissionsResponse,
    isLoading: isCommissionsLoading,
    isFetching: isCommissionsFetching,
    refetch: refetchCommissions,
  } = useGetAgentCommissionsQuery({ page: 1, limit: 5 });

  const { data: profileResponse } = useGetAgentProfileQuery();

  const isRefreshing =
    isOverviewFetching || isBookingsFetching || isCommissionsFetching;

  const handleRefreshAll = () => {
    refetchOverview();
    refetchBookings();
    refetchCommissions();
  };

  const metrics = overviewResponse?.data;
  const recentBookings = bookingsResponse?.data?.items || [];
  const recentCommissions = commissionsResponse?.data?.items || [];
  const profile = profileResponse?.data;

  return (
    <div className="space-y-6" data-testid="agent-overview-page">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Partner Agent Dashboard
            </h1>
            <span
              className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800"
              data-testid="agent-portal-badge"
            >
              AGENT PORTAL
            </span>
          </div>
          <p className="mt-1 text-sm text-[#74818A]">
            {profile?.agencyName
              ? `Connected as ${profile.agencyName} — manage reservations and commission records.`
              : "Track your booking volume, customer reservations, and commission settlements in real time."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
          >
            <Link href="/tours">
              <Compass className="mr-1.5 h-3.5 w-3.5 text-[#176779]" />
              <span>Browse Tours</span>
            </Link>
          </Button>

          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
            aria-label="Refresh dashboard metrics"
            data-testid="agent-refresh-btn"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                isRefreshing ? "animate-spin text-[#176779]" : ""
              }`}
            />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Error Banner if overview fails */}
      {overviewError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-xs"
          data-testid="agent-overview-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>
              Unable to load current overview metrics. Please check your network and retry.
            </span>
          </div>
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            className="border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 7 Supported Overview Metrics */}
      <AgentMetricsCards
        metrics={metrics}
        isLoading={isOverviewLoading}
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/agent/bookings"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#176779] group-hover:scale-105 transition-transform">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-[#176779] transition-colors">
              Manage Bookings
            </h4>
            <p className="text-xs text-[#74818A]">View customer trips & schedules</p>
          </div>
        </Link>

        <Link
          href="/dashboard/agent/commissions"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-emerald-700 transition-colors">
              Commission Ledger
            </h4>
            <p className="text-xs text-[#74818A]">Audited partner earnings</p>
          </div>
        </Link>

        <Link
          href="/dashboard/agent/profile"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-sky-700 transition-colors">
              Agency Settings
            </h4>
            <p className="text-xs text-[#74818A]">Manage business profile</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentBookingsPreview
          bookings={recentBookings}
          isLoading={isBookingsLoading}
        />
        <RecentCommissionsPreview
          commissions={recentCommissions}
          isLoading={isCommissionsLoading}
        />
      </div>
    </div>
  );
}
