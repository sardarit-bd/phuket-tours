"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import {
  useGetAdminOperationsBookingsQuery,
  useGetAdminStaffQuery,
  useGetAdminAgentsQuery,
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
import { BookingHistoryDialog } from "./booking-history-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { UpdateFulfillmentDialog } from "./update-fulfillment-dialog";
import { PriceApprovalDialog } from "./price-approval-dialog";
import { BookingReviewDialog } from "./admin-booking-review-dialog";
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

export interface AdminBookingsViewProps {
  sourceFilter?: "all" | "staff" | "agent" | "direct";
}

export function AdminBookingsView({ sourceFilter = "all" }: AdminBookingsViewProps) {
  // 1. Navigation view tab state: 'all' | 'pending' | 'staff' | 'agent' | 'customer'
  const [activeTab, setActiveTab] = React.useState<"all" | "pending" | "staff" | "agent" | "customer">(
    sourceFilter === "staff"
      ? "staff"
      : sourceFilter === "agent"
      ? "agent"
      : sourceFilter === "direct"
      ? "customer"
      : "all"
  );

  // Pagination & filter state
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [bookingStatus, setBookingStatus] = React.useState<string>("ALL");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("ALL");
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState<string>("ALL");
  const [assignedStaffId, setAssignedStaffId] = React.useState<string>("ALL");
  const [createdById, setCreatedById] = React.useState<string>("ALL");
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("ALL");
  const [selectedSource, setSelectedSource] = React.useState<string>("ALL");
  const [travelDate, setTravelDate] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");

  // 2. Active modal states
  const [activeBookingForDetails, setActiveBookingForDetails] =
    React.useState<OperationalBookingRecord | null>(null);
  const [activeBookingForHistory, setActiveBookingForHistory] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForStaffAssign, setBookingForStaffAssign] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForFulfillment, setBookingForFulfillment] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForPriceApproval, setBookingForPriceApproval] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForReview, setBookingForReview] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingToConfirm, setBookingToConfirm] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingToReject, setBookingToReject] =
    React.useState<OperationalBookingRecord | null>(null);
  const [bookingForRejectionReason, setBookingForRejectionReason] =
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
      agentId:
        selectedAgentId !== "ALL" ? selectedAgentId : undefined,
      source:
        selectedSource !== "ALL" ? (selectedSource as any) : undefined,
    };
  }, [fulfillmentStatus, assignedStaffId, selectedAgentId, selectedSource]);

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

  // Agents query for attribution filtering
  const {
    data: agentsData,
    isLoading: isAgentsLoading,
  } = useGetAdminAgentsQuery();

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
      source: p.source || (p.agent ? "AGENT" : "DIRECT"),
      agentId: p.agent?.id || null,
      createdById: p.createdById || p.createdBy?.id || null,
      createdBy: p.createdBy || null,
      agent: p.agent || null,
      assignedStaffId: p.assignedStaffId || null,
      currency: p.currency,
      finalPrice: p.finalPrice,
      basePrice: p.basePrice,
      proposedPrice: p.proposedPrice,
      requiresApproval: p.requiresApproval,
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
      assignedStaff: p.assignedStaff || null,
      payments: p.payments,
      priceApproval: p.priceApproval,
      discountRequests: p.discountRequests,
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

    // Staff creator filter
    if (createdById !== "ALL") {
      list = list.filter((b) => b.createdById === createdById || b.createdBy?.id === createdById);
    }

    // Sub-navigation view tab filter
    if (activeTab === "pending") {
      list = list.filter((b) => {
        const s = b.status as string;
        return s === "PENDING" || s === "AWAITING_APPROVAL" || b.requiresApproval;
      });
    } else if (activeTab === "staff") {
      list = list.filter((b) => {
        const role = b.createdBy?.role?.toLowerCase();
        return role === "staff" || (b.source === "DIRECT" && !b.agentId);
      });
    } else if (activeTab === "agent") {
      list = list.filter((b) => Boolean(b.agentId || b.agent || b.source === "AGENT"));
    } else if (activeTab === "customer") {
      list = list.filter((b) => b.source === "CUSTOMER" || (b.createdBy?.role?.toLowerCase() === "customer"));
    }

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

    // Agent filter
    if (selectedAgentId !== "ALL") {
      list = list.filter((b) => b.agentId === selectedAgentId || b.agent?.id === selectedAgentId);
    }

    // Booking Source filter
    if (selectedSource !== "ALL") {
      list = list.filter((b) => {
        const src = (b.source || (b.agentId ? "AGENT" : "DIRECT")).toUpperCase();
        return src === selectedSource.toUpperCase();
      });
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
        const agentNameMatch = b.agent?.name?.toLowerCase().includes(q) || false;
        const agencyNameMatch = b.agent?.agentProfile?.agencyName?.toLowerCase().includes(q) || false;
        const creatorNameMatch = b.createdBy?.name?.toLowerCase().includes(q) || false;
        const notesMatch = b.notes?.toLowerCase().includes(q) || false;
        return (
          idMatch ||
          customerNameMatch ||
          customerEmailMatch ||
          customerPhoneMatch ||
          serviceMatch ||
          staffMatch ||
          agentNameMatch ||
          agencyNameMatch ||
          creatorNameMatch ||
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
    selectedAgentId,
    selectedSource,
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

  const agentsList = React.useMemo(
    () => agentsData?.data?.items || [],
    [agentsData?.data?.items]
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

  const handleCreatedByIdChange = React.useCallback((creatorId: string) => {
    setCreatedById(creatorId);
    setPage(1);
  }, []);

  const handleAgentIdChange = React.useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
    setPage(1);
  }, []);

  const handleSourceChange = React.useCallback((source: string) => {
    setSelectedSource(source);
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
    setCreatedById("ALL");
    setSelectedAgentId("ALL");
    setSelectedSource("ALL");
    setTravelDate("");
    setSearch("");
    setPage(1);
  }, []);

  const isFiltered =
    bookingStatus !== "ALL" ||
    paymentStatus !== "ALL" ||
    fulfillmentStatus !== "ALL" ||
    assignedStaffId !== "ALL" ||
    createdById !== "ALL" ||
    selectedAgentId !== "ALL" ||
    selectedSource !== "ALL" ||
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
    refetchPending();
  }, [refetchOperations, refetchPending]);

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
        title={
          sourceFilter === "staff"
            ? "Staff Bookings Management"
            : sourceFilter === "agent"
            ? "Agent Bookings Management"
            : sourceFilter === "direct"
            ? "Direct & Customer Bookings"
            : "Bookings Management"
        }
        description={
          sourceFilter === "staff"
            ? "Review staff-created client reservations, evaluate requested discounts, and approve or reject booking proposals."
            : sourceFilter === "agent"
            ? "Track agent-created partner bookings, review commission performance, and monitor operational fulfillment."
            : sourceFilter === "direct"
            ? "Manage direct reservations booked online by travelers and walk-in customers."
            : "Review customer reservations, confirm new bookings, assign staff, and track tour fulfillment in one place."
        }
      />

      {/* Unified Summary Cards */}
      <BookingsSummaryCards
        reportData={reportData?.data}
        pendingCount={pendingRecords.length}
        isLoading={isReportLoading && isLoading}
      />

      {/* Sub-Navigation View Tabs - Only shown in consolidated All Bookings view or when not fixed by source route */}
      {sourceFilter === "all" && (
        <div className="flex items-center gap-2 border-b border-[#E5EAED] pb-2 text-xs font-semibold" data-testid="admin-bookings-nav-tabs">
          {[
            { key: "all", label: "All Bookings" },
            { key: "pending", label: "Pending Approval", count: pendingRecords.length },
            { key: "staff", label: "Staff Bookings" },
            { key: "agent", label: "Agent Bookings" },
            { key: "customer", label: "Direct / Customer" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setPage(1);
                }}
                data-testid={`admin-nav-tab-${tab.key}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#176779] text-white shadow-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

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
        createdById={createdById}
        onCreatedByIdChange={handleCreatedByIdChange}
        agentId={selectedAgentId}
        onAgentIdChange={handleAgentIdChange}
        source={selectedSource}
        onSourceChange={handleSourceChange}
        travelDate={travelDate}
        onTravelDateChange={handleTravelDateChange}
        staffMembers={staffMembers}
        agents={agentsList}
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
            staffMembers={staffMembers}
            isLoading={isLoading}
            onViewDetails={(booking) => setActiveBookingForDetails(booking)}
            onViewHistory={(booking) => setActiveBookingForHistory(booking)}
            onAssignStaff={(booking) => setBookingForStaffAssign(booking)}
            onUpdateFulfillment={(booking) => setBookingForFulfillment(booking)}
            onReviewBooking={(booking) => setBookingForReview(booking)}
            onConfirmBooking={(booking) => {
              setReviewActionError(null);
              setReviewNotes("");
              setBookingToConfirm(booking);
            }}
            onCancelBooking={(booking) => {
              setReviewActionError(null);
              setReviewNotes("");
              setBookingToReject(booking);
            }}
            onViewRejectionReason={(booking) => setBookingForRejectionReason(booking)}
            onReviewPriceApproval={(booking) => setBookingForReview(booking)}
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

      {/* Booking History Modal */}
      <BookingHistoryDialog
        isOpen={activeBookingForHistory !== null}
        onClose={() => setActiveBookingForHistory(null)}
        booking={activeBookingForHistory}
        portalMode="admin"
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

      {/* Consolidated Booking Review Modal */}
      <BookingReviewDialog
        isOpen={bookingForReview !== null}
        onClose={() => setBookingForReview(null)}
        booking={bookingForReview}
        onSuccess={() => {
          setBookingForReview(null);
          setFeedback({
            type: "success",
            message: "Booking review decision submitted successfully.",
          });
          refetchPending();
          refetchOperations();
        }}
      />

      {/* View Rejection Reason Modal */}
      {bookingForRejectionReason && (
        <Dialog
          isOpen={true}
          onClose={() => setBookingForRejectionReason(null)}
          title={`Rejection Reason — Booking #${bookingForRejectionReason.id.slice(0, 8)}`}
          description="Administrative rejection details"
        >
          <div className="space-y-4 p-4 text-xs font-outfit" data-testid="rejection-reason-dialog">
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 space-y-2">
              <span className="font-semibold text-rose-950 block">Official Rejection Reason:</span>
              <p className="text-rose-900 leading-relaxed italic">
                &ldquo;
                {bookingForRejectionReason.discountRequests?.[0]?.rejectionReason ||
                  bookingForRejectionReason.discountRequests?.[0]?.adminNotes ||
                  bookingForRejectionReason.internalNotes ||
                  "Booking proposal rejected by administrator."}
                &rdquo;
              </p>
            </div>
            {bookingForRejectionReason.discountRequests?.[0]?.reason && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-[#74818A]">
                <span className="font-medium text-[#18282A] block">Original Staff Request Justification:</span>
                <p className="mt-0.5">{bookingForRejectionReason.discountRequests[0].reason}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookingForRejectionReason(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

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