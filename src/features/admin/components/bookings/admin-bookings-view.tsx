"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import {
  useGetAdminOperationsBookingsQuery,
  useGetAdminStaffQuery,
  useGetAdminPendingReservationsQuery,
  useGetAdminBookingsReportQuery,
  useReviewAdminPendingReservationMutation,
} from "../../api/admin-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { BookingsHeader } from "./bookings-header";
import { BookingsSummaryCards } from "./bookings-summary-cards";
import { BookingsToolbar } from "./bookings-toolbar";
import { BookingsTable } from "./bookings-table";
import { BookingsPagination } from "./bookings-pagination";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { UpdateFulfillmentDialog } from "./update-fulfillment-dialog";
import { PriceApprovalDialog } from "./price-approval-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  OperationalBookingRecord,
  FulfillmentStatusValue,
  AdminStaffMember,
  PendingReservationRecord,
} from "../../types/admin-bookings";

interface ActionFeedback {
  type: "success" | "error" | "warning";
  message: string;
}

export function AdminBookingsView() {
  // 1. Pagination & filter state
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [bookingStatus, setBookingStatus] = React.useState<string>("ALL");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("ALL");
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState<string>("ALL");
  const [assignedStaffId, setAssignedStaffId] = React.useState<string>("ALL");
  const [travelDate, setTravelDate] = React.useState<string>("");
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
  const [bookingToConfirm, setBookingToConfirm] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingToReject, setBookingToReject] =
    React.useState<OperationalBookingRecord | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState<string>("");
  const [reviewActionError, setReviewActionError] = React.useState<string | null>(null);

  // 3. Feedback alerts
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 4. API Queries
  // Fetch operational bookings (Confirmed, In Progress, Completed)
  const operationsQueryParams = React.useMemo(() => {
    return {
      page: 1,
      limit: 100, // Fetch top 100 to unify seamlessly client-side
      fulfillmentStatus:
        fulfillmentStatus !== "ALL"
          ? (fulfillmentStatus as FulfillmentStatusValue)
          : undefined,
      assignedStaffId:
        assignedStaffId !== "ALL" ? assignedStaffId : undefined,
    };
  }, [fulfillmentStatus, assignedStaffId]);

  const {
    data: operationsData,
    isLoading: isOperationsLoading,
    isFetching: isOperationsFetching,
    isError: isOperationsError,
    error: operationsError,
    refetch: refetchOperations,
  } = useGetAdminOperationsBookingsQuery(operationsQueryParams);

  // Fetch pending reservations (Pending, Awaiting Approval)
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isFetching: isPendingFetching,
    refetch: refetchPending,
  } = useGetAdminPendingReservationsQuery({ page: 1, limit: 100 });

  // Fetch reporting metrics for summary cards
  const {
    data: reportData,
    isLoading: isReportLoading,
    refetch: refetchReport,
  } = useGetAdminBookingsReportQuery();

  // Staff members query
  const {
    data: staffData,
    isLoading: isStaffLoading,
  } = useGetAdminStaffQuery();

  // Review pending reservation mutation
  const [reviewReservation, { isLoading: isSubmittingReview }] =
    useReviewAdminPendingReservationMutation();

  // Convert pending reservations to unified OperationalBookingRecord shape
  const pendingRecords: OperationalBookingRecord[] = React.useMemo(() => {
    const rawPending = pendingData?.data?.items || [];
    return rawPending.map((p: PendingReservationRecord) => ({
      id: p.id,
      status: p.status,
      fulfillmentStatus: p.fulfillmentStatus || "NOT_STARTED",
      paymentStatus: p.paymentStatus,
      assignedStaffId: null,
      currency: p.currency,
      finalPrice: p.finalPrice,
      basePrice: p.basePrice,
      notes: p.notes,
      internalNotes: p.internalNotes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      service: p.service,
      availability: p.availability || null,
      customer: {
        id: p.customer.id,
        name: p.customer.name,
        email: p.customer.email,
        phone: p.customer.phone,
      },
      assignedStaff: null,
      payments: p.payments,
    }));
  }, [pendingData?.data?.items]);

  const operationalRecords: OperationalBookingRecord[] = React.useMemo(
    () => operationsData?.data?.items || [],
    [operationsData?.data?.items]
  );

  // Combine and deduplicate by ID
  const allUnifiedBookings: OperationalBookingRecord[] = React.useMemo(() => {
    const map = new Map<string, OperationalBookingRecord>();
    for (const b of operationalRecords) {
      map.set(b.id, b);
    }
    for (const p of pendingRecords) {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [operationalRecords, pendingRecords]);

  // Compute status counts for toolbar tabs
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allUnifiedBookings.length,
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const b of allUnifiedBookings) {
      const s = b.status as string;
      if (s === "PENDING" || s === "AWAITING_APPROVAL") {
        counts.PENDING++;
      } else if (counts[s] !== undefined) {
        counts[s]++;
      }
    }
    return counts;
  }, [allUnifiedBookings]);

  // Filter bookings based on all active filters
  const filteredBookings = React.useMemo(() => {
    let list = allUnifiedBookings;

    // Booking Status filter
    if (bookingStatus !== "ALL") {
      list = list.filter((b) => {
        const s = b.status as string;
        if (bookingStatus === "PENDING") {
          return s === "PENDING" || s === "AWAITING_APPROVAL";
        }
        return s === bookingStatus;
      });
    }

    // Payment Status filter
    if (paymentStatus !== "ALL") {
      list = list.filter((b) => b.paymentStatus === paymentStatus);
    }

    // Fulfillment Status filter
    if (fulfillmentStatus !== "ALL") {
      list = list.filter((b) => b.fulfillmentStatus === fulfillmentStatus);
    }

    // Staff filter
    if (assignedStaffId !== "ALL") {
      list = list.filter((b) => b.assignedStaffId === assignedStaffId);
    }

    // Travel Date filter
    if (travelDate) {
      list = list.filter((b) => {
        if (b.availability?.date) {
          return b.availability.date.startsWith(travelDate);
        }
        if (b.notes) {
          const match = b.notes.match(/Travel Date:\s*([\d-]+)/i);
          if (match && match[1] === travelDate) return true;
        }
        return false;
      });
    }

    // Search query filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => {
        const idMatch = b.id.toLowerCase().includes(q);
        const customerNameMatch = b.customer?.name?.toLowerCase().includes(q) || false;
        const customerEmailMatch = b.customer?.email?.toLowerCase().includes(q) || false;
        const customerPhoneMatch = b.customer?.phone?.toLowerCase().includes(q) || false;
        const serviceMatch = b.service?.name?.toLowerCase().includes(q) || false;
        const staffMatch = b.assignedStaff?.name?.toLowerCase().includes(q) || false;
        const notesMatch = b.notes?.toLowerCase().includes(q) || false;
        return (
          idMatch ||
          customerNameMatch ||
          customerEmailMatch ||
          customerPhoneMatch ||
          serviceMatch ||
          staffMatch ||
          notesMatch
        );
      });
    }

    return list;
  }, [
    allUnifiedBookings,
    bookingStatus,
    paymentStatus,
    fulfillmentStatus,
    assignedStaffId,
    travelDate,
    search,
  ]);

  // Client-side pagination over unified filtered list
  const totalFiltered = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
  const paginatedBookings = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filteredBookings.slice(start, start + limit);
  }, [filteredBookings, page, limit]);

  const staffMembers: AdminStaffMember[] = React.useMemo(
    () => staffData?.data?.items || [],
    [staffData?.data?.items]
  );

  // Handlers for filter controls
  const handleBookingStatusChange = React.useCallback((status: string) => {
    setBookingStatus(status);
    setPage(1);
  }, []);

  const handlePaymentStatusChange = React.useCallback((status: string) => {
    setPaymentStatus(status);
    setPage(1);
  }, []);

  const handleFulfillmentStatusChange = React.useCallback((status: string) => {
    setFulfillmentStatus(status);
    setPage(1);
  }, []);

  const handleAssignedStaffIdChange = React.useCallback((staffId: string) => {
    setAssignedStaffId(staffId);
    setPage(1);
  }, []);

  const handleTravelDateChange = React.useCallback((date: string) => {
    setTravelDate(date);
    setPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setBookingStatus("ALL");
    setPaymentStatus("ALL");
    setFulfillmentStatus("ALL");
    setAssignedStaffId("ALL");
    setTravelDate("");
    setSearch("");
    setPage(1);
  }, []);

  const isFiltered =
    bookingStatus !== "ALL" ||
    paymentStatus !== "ALL" ||
    fulfillmentStatus !== "ALL" ||
    assignedStaffId !== "ALL" ||
    Boolean(travelDate) ||
    search.trim().length > 0;

  // Refresh handler
  const handleRefresh = React.useCallback(() => {
    refetchOperations();
    refetchPending();
    refetchReport();
    setFeedback({
      type: "success",
      message: "Refreshed unified bookings queue.",
    });
  }, [refetchOperations, refetchPending, refetchReport]);

  // Modal action handlers
  const handleStaffAssignSuccess = React.useCallback(() => {
    setBookingForStaffAssign(null);
    setFeedback({
      type: "success",
      message: "Staff member assignment updated successfully.",
    });
    refetchOperations();
  }, [refetchOperations]);

  const handleFulfillmentSuccess = React.useCallback(() => {
    setBookingForFulfillment(null);
    setFeedback({
      type: "success",
      message: "Fulfillment status updated successfully.",
    });
    refetchOperations();
  }, [refetchOperations]);

  const handlePriceApprovalSuccess = React.useCallback(() => {
    setBookingForPriceApproval(null);
    setFeedback({
      type: "success",
      message: "Price proposal reviewed successfully.",
    });
    refetchOperations();
    refetchPending();
  }, [refetchOperations, refetchPending]);

  // Confirm pending reservation
  const handleConfirmReservation = async () => {
    if (!bookingToConfirm) return;
    setReviewActionError(null);
    try {
      await reviewReservation({
        bookingId: bookingToConfirm.id,
        action: "CONFIRM",
        notes: reviewNotes.trim() ? reviewNotes.trim() : undefined,
      }).unwrap();
      setBookingToConfirm(null);
      setReviewNotes("");
      setFeedback({
        type: "success",
        message: `Booking #${bookingToConfirm.id.slice(0, 8)} confirmed and moved to operations.`,
      });
      refetchPending();
      refetchOperations();
    } catch (err: any) {
      setReviewActionError(formatErrorMessage(err, "Failed to confirm reservation"));
    }
  };

  // Reject pending reservation
  const handleRejectReservation = async () => {
    if (!bookingToReject) return;
    setReviewActionError(null);
    try {
      await reviewReservation({
        bookingId: bookingToReject.id,
        action: "REJECT",
        notes: reviewNotes.trim() ? reviewNotes.trim() : undefined,
      }).unwrap();
      setBookingToReject(null);
      setReviewNotes("");
      setFeedback({
        type: "warning",
        message: `Reservation #${bookingToReject.id.slice(0, 8)} rejected.`,
      });
      refetchPending();
      refetchOperations();
    } catch (err: any) {
      setReviewActionError(formatErrorMessage(err, "Failed to reject reservation"));
    }
  };

  const isLoading = isOperationsLoading || isPendingLoading;
  const isFetching = isOperationsFetching || isPendingFetching;

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
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {/* Unified Summary Cards */}
      <BookingsSummaryCards
        reportData={reportData?.data}
        pendingCount={pendingRecords.length}
        isLoading={isReportLoading && isLoading}
      />

      {/* Unified Toolbar with Status Filters, Search, and Dropdowns */}
      <BookingsToolbar
        search={search}
        onSearchChange={setSearch}
        bookingStatus={bookingStatus}
        onBookingStatusChange={handleBookingStatusChange}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentStatusChange={handleFulfillmentStatusChange}
        assignedStaffId={assignedStaffId}
        onAssignedStaffIdChange={handleAssignedStaffIdChange}
        travelDate={travelDate}
        onTravelDateChange={handleTravelDateChange}
        staffMembers={staffMembers}
        isStaffLoading={isStaffLoading}
        statusCounts={statusCounts}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Error state */}
      {isOperationsError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center"
          data-testid="admin-bookings-error"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <h3 className="mt-2 text-sm font-semibold text-rose-900">
            Failed to load bookings
          </h3>
          <p className="mt-1 text-xs text-rose-700">
            {formatErrorMessage(
              operationsError,
              "Unable to retrieve bookings queue."
            )}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Unified Table Container */}
      {!isOperationsError && (
        <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
          <BookingsTable
            bookings={paginatedBookings}
            isLoading={isLoading}
            onViewDetails={(booking) => setActiveBookingForDetails(booking)}
            onAssignStaff={(booking) => setBookingForStaffAssign(booking)}
            onUpdateFulfillment={(booking) => setBookingForFulfillment(booking)}
            onReviewPriceApproval={(booking) => setBookingForPriceApproval(booking)}
            onConfirmPending={(booking) => {
              setReviewActionError(null);
              setReviewNotes("");
              setBookingToConfirm(booking);
            }}
            onRejectPending={(booking) => {
              setReviewActionError(null);
              setReviewNotes("");
              setBookingToReject(booking);
            }}
          />

          {/* Unified Pagination */}
          {!isLoading && totalFiltered > 0 && (
            <div className="border-t border-[#E5EAED]">
              <BookingsPagination
                page={page}
                limit={limit}
                total={totalFiltered}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(lim) => {
                  setLimit(lim);
                  setPage(1);
                }}
                isFetching={isFetching}
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

      {/* Confirm Reservation Modal */}
      {bookingToConfirm && (
        <Dialog
          isOpen={true}
          onClose={() => setBookingToConfirm(null)}
          title={`Confirm Reservation #${bookingToConfirm.id.slice(0, 8)}`}
          description="Promote pending reservation to confirmed status"
        >
          <div className="space-y-4 p-4 text-xs font-outfit">
            <p className="text-[#556972] leading-relaxed">
              Are you sure you want to confirm this reservation? It will transition to{" "}
              <strong className="text-teal-700">CONFIRMED</strong>, enter the operations queue, and allow staff assignment.
            </p>

            {reviewActionError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                {reviewActionError}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#18282A] mb-1">
                Internal Confirmation Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g., Verified availability with boat operator"
                className="w-full rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingToConfirm(null)}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReservation}
                disabled={isSubmittingReview}
                className="bg-[#176779] hover:bg-[#135564] text-white"
                data-testid="confirm-dialog-submit"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Reservation"
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Reject Reservation Modal */}
      {bookingToReject && (
        <Dialog
          isOpen={true}
          onClose={() => setBookingToReject(null)}
          title={`Reject Reservation #${bookingToReject.id.slice(0, 8)}`}
          description="Cancel or reject reservation"
        >
          <div className="space-y-4 p-4 text-xs font-outfit">
            <p className="text-[#556972] leading-relaxed">
              Are you sure you want to cancel or reject this reservation? This transitions the booking to{" "}
              <strong className="text-rose-700">CANCELLED</strong>.
            </p>

            {reviewActionError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                {reviewActionError}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#18282A] mb-1">
                Reason for Rejection / Cancellation
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g., Tour operator fully booked or customer requested cancellation"
                className="w-full rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingToReject(null)}
                disabled={isSubmittingReview}
              >
                Go Back
              </Button>
              <Button
                size="sm"
                onClick={handleRejectReservation}
                disabled={isSubmittingReview}
                className="bg-rose-600 hover:bg-rose-700 text-white"
                data-testid="reject-dialog-submit"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Reservation"
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}