"use client";

import * as React from "react";
import {
  useGetStaffOperationsBookingsQuery,
} from "@/features/admin/api/admin-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from "@/features/admin/components/bookings/booking-status-badges";
import { formatDate } from "@/features/admin/utils/format";
import { StaffFulfillmentDialog } from "./staff-fulfillment-dialog";
import { StaffBookingDetailsDialog } from "./staff-booking-details-dialog";
import type {
  StaffBookingRecord,
  FulfillmentStatusValue,
} from "@/features/admin/types/admin-bookings";
import {
  ClipboardList,
  Calendar,
  Compass,
  Search,
  Users,
  Activity,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function StaffBookingsView() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Dialog states
  const [activeDetailsBooking, setActiveDetailsBooking] =
    React.useState<StaffBookingRecord | null>(null);
  const [activeFulfillmentBooking, setActiveFulfillmentBooking] =
    React.useState<StaffBookingRecord | null>(null);

  // Query staff assigned bookings
  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStaffOperationsBookingsQuery({
    page,
    limit,
    fulfillmentStatus: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const allBookings = response?.data?.items || [];
  const totalCount = response?.data?.total ?? 0;

  // Filter client-side by search query (booking ID, tour name, customer name)
  const filteredBookings = React.useMemo(() => {
    if (!search.trim()) return allBookings;
    const q = search.toLowerCase().trim();
    return allBookings.filter((b) => {
      const matchId = b.id.toLowerCase().includes(q);
      const matchTour = b.service?.name?.toLowerCase().includes(q);
      const matchCust = b.customer?.name?.toLowerCase().includes(q);
      return matchId || matchTour || matchCust;
    });
  }, [allBookings, search]);

  // Compute summary card stats from the active list
  const stats = React.useMemo(() => {
    let notStarted = 0;
    let inProgress = 0;
    let fulfilled = 0;
    let upcoming = 0;

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const b of allBookings) {
      if (b.fulfillmentStatus === "NOT_STARTED") notStarted++;
      if (b.fulfillmentStatus === "IN_PROGRESS") inProgress++;
      if (b.fulfillmentStatus === "FULFILLED") fulfilled++;

      const tourDate = b.availability?.date ? b.availability.date.slice(0, 10) : null;
      if (tourDate && tourDate >= todayStr && b.fulfillmentStatus !== "FULFILLED") {
        upcoming++;
      }
    }

    return {
      total: totalCount,
      notStarted,
      inProgress,
      fulfilled,
      upcoming,
    };
  }, [allBookings, totalCount]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="space-y-6" data-testid="staff-bookings-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18282A]">
            Staff Operations Workspace
          </h1>
          <p className="text-xs text-[#74818A] mt-1">
            Manage and fulfill tours assigned to you. Review guest manifests, schedules, and operational status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAED] bg-white px-3 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#176779]" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Total Assigned
          </span>
          <p className="mt-1 text-2xl font-bold text-[#18282A]">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Upcoming Tours
          </span>
          <p className="mt-1 text-2xl font-bold text-sky-700">{stats.upcoming}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Not Started
          </span>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.notStarted}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            In Progress
          </span>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.inProgress}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Fulfilled
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.fulfilled}</p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="inline-flex rounded-xl bg-[#F5F8F9] p-1 text-xs">
            {(
              [
                { id: "ALL", label: "All Assigned" },
                { id: "NOT_STARTED", label: "Not Started" },
                { id: "IN_PROGRESS", label: "In Progress" },
                { id: "FULFILLED", label: "Fulfilled" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-[#176779] shadow-sm"
                    : "text-[#74818A] hover:text-[#18282A]"
                }`}
                data-testid={`staff-filter-${tab.id.toLowerCase()}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#96A4AB]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tour, guest, or ID..."
              className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-9 pr-3 py-1.5 text-xs text-[#18282A] placeholder-[#96A4AB] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
              data-testid="staff-bookings-search"
            />
          </div>
        </div>
      </div>

      {/* Bookings Queue Table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" data-testid="staff-bookings-loading">
            <Clock className="h-8 w-8 text-[#176779] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#74818A]">Loading your assigned tour queue...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center" data-testid="staff-bookings-error">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-rose-700">Failed to load assigned bookings</p>
            <p className="text-[11px] text-[#74818A] mt-1">
              {formatErrorMessage(error, { fallback: "Please check your network and session." })}
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center" data-testid="staff-bookings-empty">
            <ClipboardList className="h-10 w-10 text-[#96A4AB] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#18282A]">No Assigned Tours Found</h3>
            <p className="text-xs text-[#74818A] mt-1 max-w-sm mx-auto">
              {search
                ? "No assigned bookings match your search query."
                : "You do not have any bookings assigned for this operational queue filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs" data-testid="staff-bookings-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Lead Guest</th>
                  <th className="px-4 py-3">Tour Service</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {filteredBookings.map((b) => {
                  const isCopied = copiedId === b.id;
                  const travelDateStr = b.availability?.date
                    ? formatDate(b.availability.date)
                    : "Open Date";

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F9FBFC] transition-colors cursor-pointer"
                      onClick={() => setActiveDetailsBooking(b)}
                    >
                      {/* Booking ID */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-semibold text-[#176779]">
                            #{b.id.slice(0, 8)}…
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, b.id)}
                            className="text-[#96A4AB] hover:text-[#176779] transition-colors p-0.5 rounded cursor-pointer"
                            title="Copy full Booking ID"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Lead Guest */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="max-w-[160px]">
                          <p className="font-medium text-[#18282A] truncate">
                            {b.customer?.name || "Guest"}
                          </p>
                          {b.customer?.phone ? (
                            <p className="text-[11px] text-[#74818A] truncate mt-0.5">
                              {b.customer.phone}
                            </p>
                          ) : (
                            <p className="text-[11px] text-[#B0BCC2] italic mt-0.5">No phone</p>
                          )}
                        </div>
                      </td>

                      {/* Tour Service */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="max-w-[180px]">
                          <p className="font-medium text-[#18282A] truncate" title={b.service?.name}>
                            {b.service?.name || "Tour Service"}
                          </p>
                          {b.service?.type && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-[#176779] bg-[#E8F8F5] px-1.5 py-0.5 rounded mt-0.5">
                              <Compass className="h-2.5 w-2.5" />
                              {b.service.type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Travel Date */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 text-[#18282A] whitespace-nowrap">
                          <Calendar className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                          <span>{travelDateStr}</span>
                        </div>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <FulfillmentStatusBadge status={b.fulfillmentStatus} />
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <PaymentStatusBadge status={b.paymentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveDetailsBooking(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAED] bg-white px-2.5 py-1 text-xs font-semibold text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
                            data-testid={`staff-view-details-${b.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-[#74818A]" />
                            <span>Details</span>
                          </button>

                          {b.fulfillmentStatus !== "FULFILLED" && (
                            <button
                              type="button"
                              onClick={() => setActiveFulfillmentBooking(b)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#176779] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#135664] transition-colors cursor-pointer"
                              data-testid={`staff-update-status-${b.id}`}
                            >
                              <Activity className="h-3.5 w-3.5" />
                              <span>Update</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] px-4 py-3 text-xs text-[#74818A]">
            <span>
              Showing {filteredBookings.length} of {totalCount} assigned bookings
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-[#E5EAED] p-1.5 hover:bg-[#F5F8F9] disabled:opacity-50 transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-medium text-[#18282A]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-[#E5EAED] p-1.5 hover:bg-[#F5F8F9] disabled:opacity-50 transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Booking Details Dialog */}
      <StaffBookingDetailsDialog
        isOpen={Boolean(activeDetailsBooking)}
        onClose={() => setActiveDetailsBooking(null)}
        booking={activeDetailsBooking}
        onUpdateStatus={(b) => {
          setActiveDetailsBooking(null);
          setActiveFulfillmentBooking(b);
        }}
      />

      {/* Staff Fulfillment Status Update Dialog */}
      <StaffFulfillmentDialog
        isOpen={Boolean(activeFulfillmentBooking)}
        onClose={() => setActiveFulfillmentBooking(null)}
        booking={activeFulfillmentBooking}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}

