"use client";

import * as React from "react";
import {
  useGetStaffCreatedBookingsQuery,
  useGetStaffOperationsBookingsQuery,
  useGenerateStaffPaymentLinkMutation,
} from "@/features/admin/api/admin-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
  BookingSourceBadge,
} from "@/features/admin/components/bookings/booking-status-badges";
import { formatDate, formatReportMoney } from "@/features/admin/utils/format";
import { usePermissions } from "@/features/admin/hooks/use-permissions";
import { StaffFulfillmentDialog } from "./staff-fulfillment-dialog";
import { StaffBookingDetailsDialog } from "./staff-booking-details-dialog";
import { CreateStaffBookingDialog } from "./create-staff-booking-dialog";
import { DiscountApprovalStatusBadge } from "./discount-approval-status-badge";
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
  Plus,
  Tag,
  Link as LinkIcon,
  UserCheck,
  Loader2,
} from "lucide-react";

export function StaffBookingsView() {
  const { hasPermission, isAdmin } = usePermissions();
  const canCreateBooking = isAdmin || hasPermission("bookings.create");

  // Tabs: "created" | "assigned"
  const [activeTab, setActiveTab] = React.useState<"created" | "assigned">("created");

  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState<boolean>(false);
  const [activeDetailsBooking, setActiveDetailsBooking] =
    React.useState<StaffBookingRecord | null>(null);
  const [activeFulfillmentBooking, setActiveFulfillmentBooking] =
    React.useState<StaffBookingRecord | null>(null);

  // Payment Link Generation
  const [generatePaymentLink, { isLoading: isGeneratingLink }] =
    useGenerateStaffPaymentLinkMutation();
  const [generatedLinkUrl, setGeneratedLinkUrl] = React.useState<{ [bookingId: string]: string }>({});
  const [linkError, setLinkError] = React.useState<string | null>(null);

  // Query 1: Bookings created by staff
  const {
    data: createdResponse,
    isLoading: isCreatedLoading,
    isFetching: isCreatedFetching,
    error: createdError,
    refetch: refetchCreated,
  } = useGetStaffCreatedBookingsQuery({
    page,
    limit,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: search.trim() || undefined,
  });

  // Query 2: Bookings assigned to staff for operations
  const {
    data: assignedResponse,
    isLoading: isAssignedLoading,
    isFetching: isAssignedFetching,
    error: assignedError,
    refetch: refetchAssigned,
  } = useGetStaffOperationsBookingsQuery({
    page,
    limit,
    fulfillmentStatus: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const isCurrentTabCreated = activeTab === "created";
  const currentResponse = isCurrentTabCreated ? createdResponse : assignedResponse;
  const isLoading = isCurrentTabCreated ? isCreatedLoading : isAssignedLoading;
  const isFetching = isCurrentTabCreated ? isCreatedFetching : isAssignedFetching;
  const currentError = isCurrentTabCreated ? createdError : assignedError;

  const allBookings = currentResponse?.data?.items || [];
  const totalCount = currentResponse?.data?.total ?? 0;

  // Filter client-side by search query if in assigned tab or created tab fallback
  const displayedBookings = React.useMemo(() => {
    if (!search.trim()) return allBookings;
    const q = search.toLowerCase().trim();
    return allBookings.filter((b) => {
      const matchId = b.id.toLowerCase().includes(q);
      const matchTour = b.service?.name?.toLowerCase().includes(q);
      const matchCust = b.customer?.name?.toLowerCase().includes(q);
      return matchId || matchTour || matchCust;
    });
  }, [allBookings, search]);

  // Compute stats
  const createdItems = createdResponse?.data?.items || [];
  const assignedItems = assignedResponse?.data?.items || [];

  const stats = React.useMemo(() => {
    let awaitingApproval = 0;
    let confirmedCreated = 0;
    let unpaidCreated = 0;
    let assignedActive = 0;

    for (const b of createdItems) {
      const s = b.status as string;
      if (s === "AWAITING_APPROVAL" || b.requiresApproval) awaitingApproval++;
      if (s === "CONFIRMED" || s === "IN_PROGRESS" || s === "COMPLETED") confirmedCreated++;
      if (b.paymentStatus === "UNPAID") unpaidCreated++;
    }

    for (const b of assignedItems) {
      if (b.fulfillmentStatus !== "FULFILLED") assignedActive++;
    }

    return {
      totalCreated: createdResponse?.data?.total ?? createdItems.length,
      awaitingApproval,
      confirmedCreated,
      unpaidCreated,
      assignedActive,
    };
  }, [createdItems, assignedItems, createdResponse?.data?.total]);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGeneratePaymentLink = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    setLinkError(null);
    try {
      const res = await generatePaymentLink({ bookingId }).unwrap();
      if (res.data?.paymentUrl) {
        setGeneratedLinkUrl((prev) => ({ ...prev, [bookingId]: res.data.paymentUrl }));
        navigator.clipboard?.writeText(res.data.paymentUrl);
        setCopiedId(`link-${bookingId}`);
        setTimeout(() => setCopiedId(null), 3000);
      }
    } catch (err: any) {
      setLinkError(formatErrorMessage(err, "Failed to generate payment link"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="space-y-6" data-testid="staff-bookings-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18282A]">
            Staff Bookings Workspace
          </h1>
          <p className="text-xs text-[#74818A] mt-1">
            Create and track direct client bookings, review discount approvals, and manage operational fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateBooking && (
            <button
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#135664] shadow-xs transition-colors cursor-pointer"
              data-testid="staff-create-booking-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Direct Booking</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              refetchCreated();
              refetchAssigned();
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAED] bg-white px-3 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#176779]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            My Created Bookings
          </span>
          <p className="mt-1 text-2xl font-bold text-[#18282A]">{stats.totalCreated}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Awaiting Approval
          </span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.awaitingApproval}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Approved & Confirmed
          </span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.confirmedCreated}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Unpaid Direct Bookings
          </span>
          <p className="mt-1 text-2xl font-bold text-sky-700">{stats.unpaidCreated}</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-[#74818A] uppercase tracking-wider">
            Assigned Operations
          </span>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.assignedActive}</p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (My Created Bookings vs Assigned Operations) */}
      <div className="flex items-center gap-3 border-b border-[#E5EAED] pb-3" data-testid="staff-view-tabs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("created");
            setPage(1);
            setStatusFilter("ALL");
          }}
          data-testid="tab-created-bookings"
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-outfit text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "created"
              ? "bg-[#176779] text-white shadow-xs"
              : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>My Created Bookings</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "created" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {stats.totalCreated}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("assigned");
            setPage(1);
            setStatusFilter("ALL");
          }}
          data-testid="tab-assigned-bookings"
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-outfit text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "assigned"
              ? "bg-[#176779] text-white shadow-xs"
              : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Assigned Operations</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "assigned" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {assignedResponse?.data?.total ?? assignedItems.length}
          </span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="inline-flex rounded-xl bg-[#F5F8F9] p-1 text-xs overflow-x-auto">
            {isCurrentTabCreated
              ? [
                  { id: "ALL", label: "All Statuses" },
                  { id: "AWAITING_APPROVAL", label: "Awaiting Approval" },
                  { id: "CONFIRMED", label: "Confirmed" },
                  { id: "PENDING", label: "Pending" },
                  { id: "CANCELLED", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === tab.id
                        ? "bg-white text-[#176779] shadow-sm"
                        : "text-[#74818A] hover:text-[#18282A]"
                    }`}
                    data-testid={`staff-filter-${tab.id.toLowerCase()}`}
                  >
                    {tab.label}
                  </button>
                ))
              : [
                  { id: "ALL", label: "All Assigned" },
                  { id: "NOT_STARTED", label: "Not Started" },
                  { id: "IN_PROGRESS", label: "In Progress" },
                  { id: "FULFILLED", label: "Fulfilled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
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
              placeholder="Search by tour, guest, or reference..."
              className="w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-9 pr-3 py-1.5 text-xs text-[#18282A] placeholder-[#96A4AB] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
              data-testid="staff-bookings-search"
            />
          </div>
        </div>

        {linkError && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{linkError}</span>
          </div>
        )}
      </div>

      {/* Bookings Queue Table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" data-testid="staff-bookings-loading">
            <Clock className="h-8 w-8 text-[#176779] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#74818A]">Loading bookings queue...</p>
          </div>
        ) : currentError ? (
          <div className="p-8 text-center" data-testid="staff-bookings-error">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-rose-700">Failed to load bookings</p>
            <p className="text-[11px] text-[#74818A] mt-1">
              {formatErrorMessage(currentError, { fallback: "Please check your network and session." })}
            </p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="p-12 text-center" data-testid="staff-bookings-empty">
            <ClipboardList className="h-10 w-10 text-[#96A4AB] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#18282A]">
              {isCurrentTabCreated ? "No Created Bookings Found" : "No Assigned Tours Found"}
            </h3>
            <p className="text-xs text-[#74818A] mt-1 max-w-sm mx-auto">
              {search
                ? "No bookings match your search query."
                : isCurrentTabCreated
                ? "You haven't created any direct bookings yet. Click 'Create Direct Booking' above to submit one."
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
                  <th className="px-4 py-3">Status / Approval</th>
                  <th className="px-4 py-3">Pricing & Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {displayedBookings.map((b) => {
                  const isCopied = copiedId === b.id;
                  const travelDateStr = b.availability?.date
                    ? formatDate(b.availability.date)
                    : "Open Date";
                  const priceFormatted = formatReportMoney(
                    b.finalPrice ? Number(b.finalPrice) : (b.basePrice ? Number(b.basePrice) : null),
                    b.currency
                  );
                  const discountReq = b.discountRequests?.[0];
                  const hasPaymentLinkCopied = copiedId === `link-${b.id}`;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F9FBFC] transition-colors cursor-pointer"
                      onClick={() => setActiveDetailsBooking(b)}
                    >
                      {/* Booking ID */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#18282A]">
                          <span>#{b.id.slice(0, 8)}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, b.id, b.id)}
                            className="text-[#96A4AB] hover:text-[#18282A] p-0.5 rounded cursor-pointer"
                            title="Copy Booking ID"
                            aria-label={`Copy Booking ID #${b.id.slice(0, 8)}`}
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <BookingSourceBadge source={b.source || "DIRECT"} />
                        </div>
                      </td>

                      {/* Lead Guest */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-semibold text-[#18282A]">{b.customer?.name || "Guest"}</div>
                        {b.customer?.phone && (
                          <div className="text-[11px] text-[#74818A]">{b.customer.phone}</div>
                        )}
                        {b.customer?.email && (
                          <div className="text-[11px] text-[#74818A] truncate max-w-[150px]">
                            {b.customer.email}
                          </div>
                        )}
                      </td>

                      {/* Tour Service */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-medium text-[#18282A] max-w-[200px] truncate">
                          {b.service?.name}
                        </div>
                        <span className="text-[10px] text-[#96A4AB] uppercase font-semibold">
                          {b.service?.type}
                        </span>
                      </td>

                      {/* Travel Date */}
                      <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[#18282A]">
                          <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                          <span>{travelDateStr}</span>
                        </div>
                        <div className="text-[11px] text-[#74818A] mt-0.5">
                          Created {formatDate(b.createdAt)}
                        </div>
                      </td>

                      {/* Status & Approval */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex flex-col items-start gap-1">
                          <BookingStatusBadge status={b.status} />
                          {b.requiresApproval && (
                            <DiscountApprovalStatusBadge status="PENDING" />
                          )}
                          {discountReq && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                              <Tag className="h-2.5 w-2.5" />
                              {discountReq.status === "APPROVED"
                                ? (discountReq.discountType === "PERCENTAGE"
                                    ? `${discountReq.discountValue}% Requested (Approved)`
                                    : `${formatReportMoney(discountReq.discountValue, b.currency)} Off (Approved)`)
                                : discountReq.status === "REJECTED"
                                ? `${discountReq.discountValue}${discountReq.discountType === "PERCENTAGE" ? "%" : ""} (Rejected)`
                                : (discountReq.discountType === "PERCENTAGE"
                                    ? `${discountReq.discountValue}% Requested`
                                    : `${formatReportMoney(discountReq.discountValue, b.currency)} Off`)}
                            </span>
                          )}
                          {!isCurrentTabCreated && (
                            <div className="mt-0.5">
                              <FulfillmentStatusBadge status={b.fulfillmentStatus} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Pricing & Payment */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-semibold text-[#18282A]">{priceFormatted}</div>
                        <div className="mt-1">
                          <PaymentStatusBadge status={b.paymentStatus} />
                        </div>
                        {b.assignedStaff && (
                          <div className="text-[10px] text-[#74818A] mt-1 flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-[#176779]" />
                            <span>Op: {b.assignedStaff.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveDetailsBooking(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAED] bg-white px-2.5 py-1 text-xs font-semibold text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
                            data-testid={`staff-view-details-${b.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-[#74818A]" />
                            <span>Details</span>
                          </button>

                          {/* Payment Link for Created Bookings: enabled only when Approved/Confirmed & Unpaid */}
                          {isCurrentTabCreated && (() => {
                            const isAwaiting =
                              b.status === "AWAITING_APPROVAL" ||
                              b.status === "PENDING" ||
                              b.requiresApproval;
                            const hasPendingDiscount = Boolean(
                              b.discountRequests?.some((dr) => dr.status === "PENDING")
                            );
                            const isCancelledOrRejected = b.status === "CANCELLED" || (b.status as any) === "REJECTED";
                            const isPaid = b.paymentStatus === "PAID";

                            let isDisabled = false;
                            let disabledTooltip = "";

                            if (isAwaiting || hasPendingDiscount) {
                              isDisabled = true;
                              disabledTooltip = "Waiting for Admin approval.";
                            } else if (isCancelledOrRejected) {
                              isDisabled = true;
                              disabledTooltip = "Booking has been rejected.";
                            } else if (isPaid) {
                              isDisabled = true;
                              disabledTooltip = "Payment has already been completed.";
                            } else if (b.status !== "CONFIRMED") {
                              isDisabled = true;
                              disabledTooltip = `Booking status ${b.status} is not eligible for payment.`;
                            }

                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (!isDisabled) {
                                    handleGeneratePaymentLink(e, b.id);
                                  }
                                }}
                                disabled={isDisabled || isGeneratingLink}
                                title={isDisabled ? disabledTooltip : "Generate or copy payment link"}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors shadow-xs ${
                                  isDisabled
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                    : "bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                                }`}
                                data-testid={`staff-payment-link-${b.id}`}
                              >
                                {hasPaymentLinkCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-white" />
                                    <span>Link Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon className="h-3.5 w-3.5" />
                                    <span>Pay Link</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}

                          {/* Operational fulfillment update button */}
                          {!isCurrentTabCreated && b.fulfillmentStatus !== "FULFILLED" && (
                            <button
                              type="button"
                              onClick={() => setActiveFulfillmentBooking(b)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#176779] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#135664] transition-colors cursor-pointer shadow-xs"
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
              Showing {displayedBookings.length} of {totalCount} bookings
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

      {/* Staff Create Booking Dialog */}
      {isCreateDialogOpen && (
        <CreateStaffBookingDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            refetchCreated();
            refetchAssigned();
          }}
        />
      )}

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
          refetchAssigned();
        }}
      />
    </div>
  );
}
