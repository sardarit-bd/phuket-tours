"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGetMeQuery } from "@/features/auth/api/auth-api";
import { useGetCustomerBookingsQuery } from "@/features/customer/api/customer-api";
import type { CustomerBookingRecord } from "@/features/customer/types/customer";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
} from "@/features/agent/components/common/agent-status-badges";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Clock,
  Heart,
  Settings,
  AlertCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function isUpcoming(booking: CustomerBookingRecord): boolean {
  if (!booking.availability?.date) return false;
  return new Date(booking.availability.date).getTime() >= Date.now() - 86400_000;
}

function isRecent(booking: CustomerBookingRecord): boolean {
  const daysAgo = (Date.now() - new Date(booking.createdAt).getTime()) / 86400_000;
  return daysAgo <= 30;
}

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("status" in error) {
    const status = (error as { status?: unknown }).status;
    return status === 401 || status === "401";
  }
  if ("originalStatus" in error) {
    const originalStatus = (error as { originalStatus?: unknown }).originalStatus;
    return originalStatus === 401 || originalStatus === "401";
  }
  return false;
}

export default function UserOverviewPage() {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/dashboard";

  const {
    data: meResponse,
    error: meError,
    refetch: refetchMe,
  } = useGetMeQuery();

  const isMeUnauthorized = isUnauthorizedError(meError);

  // If unauthenticated (401), redirect to sign-in with safe destination parameter.
  // Network failures, timeouts, and 500 errors remain on-page to display recovery controls.
  React.useEffect(() => {
    if (isMeUnauthorized) {
      const safeRedirect = pathname.startsWith("/") && !pathname.startsWith("//")
        ? pathname
        : "/dashboard";
      router.replace(`/sign-in?redirect=${encodeURIComponent(safeRedirect)}`);
    }
  }, [isMeUnauthorized, pathname, router]);

  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetCustomerBookingsQuery(
    { page: 1, limit: 20 },
    { skip: isMeUnauthorized }
  );

  const profile = meResponse?.data;
  const bookings: CustomerBookingRecord[] = bookingsResponse?.data?.items || [];

  const upcoming = bookings.filter(isUpcoming).slice(0, 3);
  const recent = bookings.filter(isRecent).slice(0, 3);

  const isRefreshing = isBookingsFetching;

  const handleRefresh = () => {
    refetchMe();
    refetchBookings();
  };

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6" data-testid="customer-overview-page">
      {/* Greeting header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Hello, {firstName}
            </h1>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              Customer Portal
            </span>
          </div>
          <p className="mt-1 text-sm text-[#74818A]">
            Welcome to your Phuket excursions dashboard. Here&apos;s what&apos;s happening with your bookings.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
          aria-label="Refresh dashboard"
          data-testid="customer-overview-refresh"
        >
          <span>{isRefreshing ? "Updating…" : "Refresh"}</span>
        </Button>
      </div>

      {/* Error banners */}
      {!isMeUnauthorized && (meError || bookingsError) && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
          data-testid="customer-overview-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Unable to load dashboard data. Please check your connection and retry.</span>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Link
          href="/dashboard/bookings"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#176779] group-hover:scale-105 transition-transform">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-[#176779] transition-colors">
              My Bookings
            </h4>
            <p className="text-xs text-[#74818A]">
              {bookings.length > 0 ? `${bookings.length} reservation${bookings.length !== 1 ? "s" : ""}` : "No bookings yet"}
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/favorites"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-rose-700 transition-colors">
              My Favorites
            </h4>
            <p className="text-xs text-[#74818A]">Saved tours wishlist</p>
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-sky-700 transition-colors">
              Profile Settings
            </h4>
            <p className="text-xs text-[#74818A]">Manage your details</p>
          </div>
        </Link>

        <Link
          href="/dashboard/payments"
          className="flex items-center gap-3.5 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs hover:border-[#176779]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18282A] group-hover:text-emerald-700 transition-colors">
              Payment History
            </h4>
            <p className="text-xs text-[#74818A]">View past payments</p>
          </div>
        </Link>
      </div>

      {/* Upcoming / Recent sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming bookings */}
        <div
          className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs"
          data-testid="customer-upcoming-bookings"
        >
          <div className="border-b border-[#E5EAED] px-5 py-3.5">
            <h3 className="font-outfit text-sm font-bold text-[#18282A]">
              Upcoming Trips
            </h3>
            <p className="text-xs text-[#74818A]">Next scheduled excursions</p>
          </div>

          {isBookingsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-[#74818A]">
                No upcoming trips scheduled.
              </p>
              <Link
                href="/tours"
                className="mt-3 inline-block text-xs font-semibold text-[#176779] hover:underline"
              >
                Browse tours →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E5EAED]">
              {upcoming.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFB] transition-colors group"
                  data-testid={`customer-upcoming-item-${booking.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#176779]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#18282A] group-hover:text-[#176779] truncate max-w-[180px]">
                        {booking.service?.name || "Tour"}
                      </div>
                      <div className="text-[10px] text-[#74818A]">
                        {formatDate(booking.availability?.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AgentBookingStatusBadge status={booking.status} />
                    <ArrowRight className="h-3.5 w-3.5 text-[#74818A]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div
          className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs"
          data-testid="customer-recent-bookings"
        >
          <div className="border-b border-[#E5EAED] px-5 py-3.5">
            <h3 className="font-outfit text-sm font-bold text-[#18282A]">
              Recent Activity
            </h3>
            <p className="text-xs text-[#74818A]">Bookings from the last 30 days</p>
          </div>

          {isBookingsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs text-[#74818A]">
                No recent booking activity.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5EAED]">
              {recent.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFB] transition-colors group"
                  data-testid={`customer-recent-item-${booking.id}`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#18282A] group-hover:text-[#176779] truncate max-w-[180px]">
                      {booking.service?.name || "Tour"}
                    </div>
                    <div className="text-[10px] text-[#74818A]">
                      Booked {formatDate(booking.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AgentPaymentStatusBadge status={booking.paymentStatus} />
                    <AgentBookingStatusBadge status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
