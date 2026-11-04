import * as React from "react";
import { AlertCircle, CalendarDays, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useGetAdminOperationsBookingsQuery } from "../../api/admin-api";
import { getInitials } from "@/features/auth/utils/avatar";
import { formatDate } from "../../utils/format";
import { BookingStatusBadge } from "../bookings/booking-status-badges";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

export interface RecentBookingsTableProps {
  /** Number of recent bookings to display. Default 6. */
  limit?: number;
  /** Link target for the "View All Bookings" action. */
  viewAllHref?: string;
}

function CustomerAvatar({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F6F8] font-outfit text-[11px] font-bold text-[#176779]"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function TourThumb({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F8F9] text-[11px] font-bold text-[#74818A]">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")}
    </span>
  );
}

/**
 * Recent Bookings section: compact table of the latest booking activity.
 * Uses the existing /admin/operations/bookings API (most recent first).
 */
export function RecentBookingsTable({
  limit = 6,
  viewAllHref = "/dashboard/admin/bookings",
}: RecentBookingsTableProps) {
  const {
    data,
    isLoading,
    isError,
  } = useGetAdminOperationsBookingsQuery({ page: 1, limit }, { skip: false });

  const items = data?.data?.items ?? [];

  return (
    <div
      data-testid="recent-bookings-card"
      className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-[#2B9BA8]" />
            <h3 id="recent-bookings-heading" className="font-outfit text-base font-bold text-[#18282A]">
              Recent Bookings
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#74818A]">Latest booking activity.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs font-medium text-[#176779] hover:bg-[#E8F6F8]">
          <Link href={viewAllHref}>View All Bookings</Link>
        </Button>
      </div>

      {/* Body */}
      {isError ? (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>Unable to load recent bookings. Please refresh the page.</span>
        </div>
      ) : isLoading ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-[#F5F8F9]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={<CalendarDays className="h-5 w-5 text-[#2B9BA8]" />}
            title="No recent bookings"
            description="No bookings have been recorded yet."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
                <th scope="col" className="px-4 py-2.5">Booking</th>
                <th scope="col" className="px-4 py-2.5">Tour</th>
                <th scope="col" className="px-4 py-2.5">Customer</th>
                <th scope="col" className="px-4 py-2.5">Travel Date</th>
                <th scope="col" className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAED]">
              {items.map((booking: OperationalBookingRecord) => (
                <tr key={booking.id} className="transition-colors hover:bg-[#F8FAFB]">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#18282A]">
                    #{booking.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <TourThumb name={booking.service.name} />
                      <span
                        title={booking.service.name}
                        className="max-w-[180px] truncate text-xs font-medium text-[#18282A]"
                      >
                        {booking.service.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CustomerAvatar name={booking.customer.name} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[#18282A]">
                          {booking.customer.name}
                        </p>
                        {booking.customer.phone && (
                          <p className="truncate text-[11px] text-[#74818A]">{booking.customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#18282A]">
                    {booking.availability ? formatDate(booking.availability.date) : "Open Date"}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
