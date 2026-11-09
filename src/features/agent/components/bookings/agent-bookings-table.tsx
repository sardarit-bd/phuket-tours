"use client";

import * as React from "react";
import { useGetAgentBookingsQuery } from "../../api/agent-api";
import type { AgentBookingRecord } from "../../types/agent";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
  AgentPriceApprovalBadge,
  AgentFulfillmentStatusBadge,
} from "../common/agent-status-badges";
import { AgentBookingDetailsDialog } from "./agent-booking-details-dialog";
import { CreateAgentBookingDialog } from "./create-agent-booking-dialog";
import {
  formatAgentCurrency,
  extractTravelDateRaw,
  extractGuestsFromNotes,
  formatAgentDate,
} from "../../utils/agent-formatters";
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
  PlusCircle,
  Users,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const STATUS_TABS = [
  { label: "All Bookings", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Awaiting Approval", value: "AWAITING_APPROVAL" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function AgentBookingsTable() {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedBooking, setSelectedBooking] = React.useState<AgentBookingRecord | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] = React.useState<"DETAILS" | "HISTORY" | "PAYMENT">("DETAILS");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAgentBookingsQuery({
    page,
    limit: 10,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: debouncedSearch.trim() || undefined,
  });

  const bookings = response?.data?.items || [];
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

  const handleOpenDetails = (booking: AgentBookingRecord, tab: "DETAILS" | "HISTORY" | "PAYMENT" = "DETAILS") => {
    setSelectedBooking(booking);
    setDetailsInitialTab(tab);
  };

  return (
    <div className="space-y-4" data-testid="agent-bookings-module">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74818A]" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search booking ref, customer, or tour..."
            className="pl-9 text-xs rounded-xl border-[#E5EAED] bg-white h-9 focus-visible:ring-1 focus-visible:ring-[#176779]"
            data-testid="agent-bookings-search-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="h-9 bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]"
            data-testid="agent-create-booking-btn"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            <span>Create Booking</span>
          </Button>

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="h-9 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
            aria-label="Refresh bookings"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                isFetching ? "animate-spin text-[#176779]" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
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
              data-testid={`filter-tab-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Failed to load bookings. Please check connection and retry.</span>
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

      {/* Bookings Table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-14 text-center" data-testid="agent-bookings-empty">
            <Compass className="mx-auto h-10 w-10 text-slate-300" />
            <h4 className="mt-3 font-outfit text-base font-bold text-[#18282A]">
              No reservations found
            </h4>
            <p className="mt-1 text-xs text-[#74818A] max-w-sm mx-auto">
              {debouncedSearch || statusFilter !== "ALL"
                ? "No bookings match the specified filter criteria. Try resetting filters."
                : "You haven't booked any tours yet. Explore available tours or create a partner reservation."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="agent-bookings-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Tour Details</th>
                  <th className="px-4 py-3">Customer &amp; Guests</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {bookings.map((booking) => {
                  const effectiveTravelDate = extractTravelDateRaw(
                    booking.availability?.date,
                    booking.notes,
                  );
                  const guests = extractGuestsFromNotes(booking.notes);

                  // Payment eligibility logic
                  const isAwaitingPriceApproval =
                    booking.requiresApproval || booking.status === "AWAITING_APPROVAL";
                  const isUnpaid = booking.paymentStatus === "UNPAID";
                  const isPartial = booking.paymentStatus === "PARTIALLY_PAID";
                  const isPaid = booking.paymentStatus === "PAID";
                  const isCancelled =
                    booking.status === "CANCELLED" || booking.status === "FAILED";

                  const canCompletePayment =
                    (isUnpaid || isPartial) &&
                    !isAwaitingPriceApproval &&
                    !isCancelled;

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#F8FAFB] transition-colors"
                      data-testid={`booking-row-${booking.id}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-medium text-[#18282A] select-all">
                          {booking.id.slice(0, 8)}...
                        </div>
                        <span className="text-[10px] text-[#74818A]">
                          {formatAgentDate(booking.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div
                          className="font-semibold text-[#18282A] max-w-[190px] truncate"
                          title={booking.service?.name}
                        >
                          {booking.service?.name || "Tour Service"}
                        </div>
                        <div className="text-[10px] text-[#74818A]">
                          {booking.service?.type || "Tour"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#18282A] max-w-[140px] truncate">
                          {booking.customer?.name || "Customer"}
                        </div>
                        <div className="text-[10px] text-[#74818A] flex items-center gap-1">
                          {guests ? (
                            <>
                              <Users className="h-3 w-3 text-[#176779]" />
                              <span>
                                {guests.adults}A
                                {guests.children > 0 ? `/${guests.children}C` : ""}
                                {guests.infants > 0 ? `/${guests.infants}I` : ""}
                              </span>
                            </>
                          ) : (
                            <span className="truncate max-w-[130px]">{booking.customer?.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#18282A]">
                        <div className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3 text-[#176779]" />
                          <span>{formatAgentDate(effectiveTravelDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <AgentBookingStatusBadge status={booking.status} />
                          {booking.fulfillmentStatus && (
                            <AgentFulfillmentStatusBadge status={booking.fulfillmentStatus} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {/* Payment status badge */}
                          {isAwaitingPriceApproval ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800 border border-purple-200"
                              data-testid={`badge-awaiting-approval-${booking.id}`}
                            >
                              <Clock className="h-3 w-3 text-purple-600" />
                              <span>Awaiting Price Review</span>
                            </span>
                          ) : isPaid ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200"
                              data-testid={`badge-paid-${booking.id}`}
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          ) : isUnpaid ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-200"
                              data-testid={`badge-payment-required-${booking.id}`}
                            >
                              <CreditCard className="h-3 w-3 text-rose-600" />
                              <span>Payment Required</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200"
                              data-testid={`badge-partial-paid-${booking.id}`}
                            >
                              <CreditCard className="h-3 w-3 text-amber-600" />
                              <span>Partially Paid</span>
                            </span>
                          )}

                          {/* Outstanding Balance Note if unpaid */}
                          {!isPaid && !isCancelled && !isAwaitingPriceApproval && (
                            <span className="text-[10px] text-rose-600 font-medium">
                              Due: {formatAgentCurrency(booking.finalPrice, booking.currency)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-[#18282A]">
                        {formatAgentCurrency(booking.finalPrice, booking.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY PAYMENT ACTION IF UNPAID & CONFIRMED */}
                          {canCompletePayment ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenDetails(booking, "PAYMENT")}
                              className="h-8 px-2.5 text-xs bg-[#176779] hover:bg-[#135664] text-white font-semibold shadow-3xs cursor-pointer flex items-center gap-1"
                              data-testid={`pay-booking-${booking.id}`}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>{isPartial ? "Pay Balance" : "Pay"}</span>
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(booking, "DETAILS")}
                            className="h-8 px-2 text-xs text-[#74818A] hover:text-[#18282A] hover:bg-slate-100 cursor-pointer"
                            data-testid={`view-booking-${booking.id}`}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            <span>Details</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs text-[#74818A]">
            <div>
              Showing Page{" "}
              <span className="font-semibold text-[#18282A]">{pagination.page}</span> of{" "}
              <span className="font-semibold text-[#18282A]">
                {pagination.totalPages}
              </span>{" "}
              ({pagination.total} total bookings)
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="h-8 px-2.5 text-xs cursor-pointer"
                data-testid="pagination-prev"
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
                className="h-8 px-2.5 text-xs cursor-pointer"
                data-testid="pagination-next"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details & Payment Modal */}
      <AgentBookingDetailsDialog
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        initialTab={detailsInitialTab}
        onBookingUpdated={() => refetch()}
      />

      {/* Create Agent Booking Modal */}
      <CreateAgentBookingDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
        onProceedToPayment={(bookingId) => {
          refetch().then((res) => {
            const target = res.data?.data?.items?.find((b) => b.id === bookingId);
            if (target) {
              handleOpenDetails(target, "PAYMENT");
            }
          });
        }}
        onViewBookingDetails={(bookingId) => {
          refetch().then((res) => {
            const target = res.data?.data?.items?.find((b) => b.id === bookingId);
            if (target) {
              handleOpenDetails(target, "DETAILS");
            }
          });
        }}
      />
    </div>
  );
}
