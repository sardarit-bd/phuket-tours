"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  useGetAdminOperationsBookingsQuery,
  useGetAdminStaffQuery,
} from "../../api/admin-api";
import { BookingsHeader } from "./bookings-header";
import { BookingsSummaryCards } from "./bookings-summary-cards";
import { BookingsToolbar } from "./bookings-toolbar";
import { BookingsTable } from "./bookings-table";
import { BookingsPagination } from "./bookings-pagination";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { UpdateFulfillmentDialog } from "./update-fulfillment-dialog";
import { PriceApprovalDialog } from "./price-approval-dialog";
import type {
  OperationalBookingRecord,
  FulfillmentStatusValue,
  AdminStaffMember,
} from "../../types/admin-bookings";

interface ActionFeedback {
  type: "success" | "error" | "warning";
  message: string;
}

export function AdminBookingsView() {
  // 1. Pagination & filter state
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState<string>("ALL");
  const [assignedStaffId, setAssignedStaffId] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState<string>("");

  // 2. Active modal states
  const [activeBookingForDetails, setActiveBookingForDetails] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForStaffAssign, setBookingForStaffAssign] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForFulfillment, setBookingForFulfillment] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForPriceApproval, setBookingForPriceApproval] =
    React.useState<OperationalBookingRecord | null>(null);

  // 3. Feedback alerts
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  // Auto-dismiss feedback after 6 seconds
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 4. API Queries
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      fulfillmentStatus:
        fulfillmentStatus !== "ALL"
          ? (fulfillmentStatus as FulfillmentStatusValue)
          : undefined,
      assignedStaffId:
        assignedStaffId !== "ALL" ? assignedStaffId : undefined,
    };
  }, [page, limit, fulfillmentStatus, assignedStaffId]);

  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    isFetching: isBookingsFetching,
    isError: isBookingsError,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAdminOperationsBookingsQuery(queryParams);

  const {
    data: staffData,
    isLoading: isStaffLoading,
  } = useGetAdminStaffQuery();

  const bookingsList: OperationalBookingRecord[] = React.useMemo(
    () => bookingsData?.data?.items || [],
    [bookingsData?.data?.items]
  );

  const pagination = React.useMemo(() => {
    const total = bookingsData?.data?.total || 0;
    const lim = bookingsData?.data?.limit || 10;
    return {
      page: bookingsData?.data?.page || 1,
      limit: lim,
      total,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    };
  }, [bookingsData?.data?.page, bookingsData?.data?.limit, bookingsData?.data?.total]);

  const staffMembers: AdminStaffMember[] = React.useMemo(
    () => staffData?.data?.items || [],
    [staffData?.data?.items]
  );

  // 5. Client-side search filtering across current page records
  const filteredBookings = React.useMemo(() => {
    if (!search.trim()) return bookingsList;
    const q = search.trim().toLowerCase();
    return bookingsList.filter((b: OperationalBookingRecord) => {
      const idMatch = b.id.toLowerCase().includes(q);
      const customerMatch = b.customer?.name?.toLowerCase().includes(q) || false;
      const phoneMatch = b.customer?.phone?.toLowerCase().includes(q) || false;
      const serviceMatch = b.service?.name?.toLowerCase().includes(q) || false;
      const staffMatch = b.assignedStaff?.name?.toLowerCase().includes(q) || false;
      return idMatch || customerMatch || phoneMatch || serviceMatch || staffMatch;
    });
  }, [bookingsList, search]);

  // 6. Filter change handlers
  const handleFulfillmentStatusChange = React.useCallback((status: string) => {
    setFulfillmentStatus(status);
    setPage(1);
  }, []);

  const handleAssignedStaffIdChange = React.useCallback((staffId: string) => {
    setAssignedStaffId(staffId);
    setPage(1);
  }, []);

  const handleLimitChange = React.useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setFulfillmentStatus("ALL");
    setAssignedStaffId("ALL");
    setSearch("");
    setPage(1);
  }, []);

  const isFiltered =
    fulfillmentStatus !== "ALL" || assignedStaffId !== "ALL" || search.trim().length > 0;

  // 7. Modal action handlers
  const handleStaffAssignSuccess = React.useCallback(() => {
    setBookingForStaffAssign(null);
    setFeedback({
      type: "success",
      message: "Staff member assignment updated successfully.",
    });
    refetchBookings();
  }, [refetchBookings]);

  const handleFulfillmentSuccess = React.useCallback(() => {
    setBookingForFulfillment(null);
    setFeedback({
      type: "success",
      message: "Fulfillment status updated successfully.",
    });
    refetchBookings();
  }, [refetchBookings]);

  const handlePriceApprovalSuccess = React.useCallback(() => {
    setBookingForPriceApproval(null);
    setFeedback({
      type: "success",
      message: "Price proposal reviewed successfully.",
    });
    refetchBookings();
  }, [refetchBookings]);

  return (
    <div className="space-y-6" data-testid="admin-bookings-container">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          data-testid="admin-bookings-feedback-banner"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-medium shadow-xs transition-all ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : feedback.type === "warning"
              ? "border-amber-200 bg-amber-50/90 text-amber-900"
              : "border-rose-200 bg-rose-50/90 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-lg p-1 text-slate-500 hover:bg-black/5 hover:text-slate-800 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <BookingsHeader
        onRefresh={() => {
          refetchBookings();
          setFeedback({
            type: "success",
            message: "Refreshed operational bookings queue.",
          });
        }}
        isRefreshing={isBookingsFetching}
      />

      {/* Summary Cards */}
      <BookingsSummaryCards
        items={bookingsList}
        totalCount={pagination.total}
        isLoading={isBookingsLoading}
      />

      {/* Toolbar */}
      <BookingsToolbar
        search={search}
        onSearchChange={setSearch}
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentStatusChange={handleFulfillmentStatusChange}
        assignedStaffId={assignedStaffId}
        onAssignedStaffIdChange={handleAssignedStaffIdChange}
        staffMembers={staffMembers}
        isStaffLoading={isStaffLoading}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Error state */}
      {isBookingsError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center"
          data-testid="admin-bookings-error"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <h3 className="mt-2 text-sm font-semibold text-rose-900">
            Failed to load operational bookings
          </h3>
          <p className="mt-1 text-xs text-rose-700">
            {typeof bookingsError === "object" && bookingsError && "data" in bookingsError
              ? String(
                  (bookingsError as { data?: { message?: string } }).data?.message ||
                    "An unexpected error occurred while contacting the server."
                )
              : "Unable to retrieve operational bookings queue."}
          </p>
          <button
            type="button"
            onClick={() => refetchBookings()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table Container */}
      {!isBookingsError && (
        <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
          <BookingsTable
            bookings={filteredBookings}
            isLoading={isBookingsLoading}
            onViewDetails={(booking) => setActiveBookingForDetails(booking)}
            onAssignStaff={(booking) => setBookingForStaffAssign(booking)}
            onUpdateFulfillment={(booking) => setBookingForFulfillment(booking)}
            onReviewPriceApproval={(booking) => setBookingForPriceApproval(booking)}
          />

          {/* Pagination */}
          {!isBookingsLoading && pagination.total > 0 && (
            <div className="border-t border-[#E5EAED]">
              <BookingsPagination
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
                onLimitChange={handleLimitChange}
                isFetching={isBookingsFetching}
              />
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsDialog
        isOpen={activeBookingForDetails !== null}
        onClose={() => setActiveBookingForDetails(null)}
        booking={activeBookingForDetails}
      />

      {/* Staff Assignment Modal */}
      <AssignStaffDialog
        isOpen={bookingForStaffAssign !== null}
        onClose={() => setBookingForStaffAssign(null)}
        booking={bookingForStaffAssign}
        staffMembers={staffMembers}
        onSuccess={handleStaffAssignSuccess}
      />

      {/* Fulfillment Status Modal */}
      <UpdateFulfillmentDialog
        isOpen={bookingForFulfillment !== null}
        onClose={() => setBookingForFulfillment(null)}
        booking={bookingForFulfillment}
        onSuccess={handleFulfillmentSuccess}
      />

      {/* Price Approval Modal */}
      <PriceApprovalDialog
        isOpen={bookingForPriceApproval !== null}
        onClose={() => setBookingForPriceApproval(null)}
        booking={bookingForPriceApproval}
        onSuccess={handlePriceApprovalSuccess}
      />
    </div>
  );
}
