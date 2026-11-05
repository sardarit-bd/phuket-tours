"use client";

import * as React from "react";
import Link from "next/link";
import { useGetCustomerBookingsQuery } from "../../api/customer-api";
import type { CustomerBookingRecord } from "../../types/customer";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
} from "@/features/agent/components/common/agent-status-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Compass,
  AlertCircle,
} from "lucide-react";

const STATUS_TABS = [
  { label: "All Bookings", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Awaiting Approval", value: "AWAITING_APPROVAL" },
  { label: "Cancelled", value: "CANCELLED" },
];

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

function formatPrice(amount?: number): string {
  if (typeof amount !== "number") return "฿0";
  return `฿${amount.toLocaleString("en-US")}`;
}

export function CustomerBookingsTable() {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCustomerBookingsQuery({
    page,
    limit: 10,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: debouncedSearch.trim() || undefined,
  });

  const bookings: CustomerBookingRecord[] = response?.data?.items || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const handleTabChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-4" data-testid="customer-bookings-module">
      {/* Search + Refresh toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74818A]" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search booking ref or tour…"
            className="pl-9 text-xs rounded-xl border-[#E5EAED] bg-white h-9 focus-visible:ring-1 focus-visible:ring-[#176779]"
            data-testid="customer-bookings-search-input"
          />
        </div>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="h-9 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
          aria-label="Refresh bookings"
          data-testid="customer-refresh-btn"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${
              isFetching ? "animate-spin text-[#176779]" : ""
            }`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-[#E5EAED]">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#176779] text-[#176779]"
                  : "border-transparent text-[#74818A] hover:text-[#18282A] hover:border-slate-300"
              }`}
              data-testid={`customer-filter-tab-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
          data-testid="customer-bookings-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Failed to load bookings. Please check your connection and retry.</span>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Bookings table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6" data-testid="customer-bookings-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-14 text-center" data-testid="customer-bookings-empty">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 font-outfit text-base font-bold text-[#18282A]">
              No reservations found
            </h4>
            <p className="mt-1 text-xs text-[#74818A] max-w-sm mx-auto">
              {debouncedSearch || statusFilter !== "ALL"
                ? "No bookings match your current filters. Try resetting them."
                : "You haven't booked any tours yet. Browse available tours to get started."}
            </p>
            <Link href="/tours" className="mt-4 inline-block">
              <Button
                size="sm"
                className="bg-[#176779] text-white text-xs hover:bg-[#135664]"
              >
                <Compass className="mr-1.5 h-3.5 w-3.5" />
                Browse Tours
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="customer-bookings-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[#F8FAFB] transition-colors"
                    data-testid={`customer-booking-row-${booking.id}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-medium text-[#18282A] select-all">
                        {booking.id.slice(0, 8)}…
                      </div>
                      <span className="text-[10px] text-[#74818A]">
                        {formatDate(booking.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#18282A] max-w-[200px] truncate" title={booking.service?.name}>
                        {booking.service?.name || "Tour Service"}
                      </div>
                      <div className="text-[10px] text-[#74818A]">
                        {booking.service?.type || "Tour"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#18282A]">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 text-[#176779]" />
                        <span>{formatDate(booking.availability?.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <AgentBookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <AgentPaymentStatusBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-[#18282A]">
                      {formatPrice(booking.finalPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-[#176779] hover:bg-teal-50 hover:text-[#135664]"
                          data-testid={`view-booking-${booking.id}`}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          <span>Details</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs text-[#74818A]">
            <div>
              Showing Page{" "}
              <span className="font-semibold text-[#18282A]">{pagination.page}</span> of{" "}
              <span className="font-semibold text-[#18282A]">{pagination.totalPages}</span>{" "}
              ({pagination.total} total bookings)
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="h-8 px-2.5 text-xs"
                data-testid="customer-pagination-prev"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="h-8 px-2.5 text-xs"
                data-testid="customer-pagination-next"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
