"use client";

import * as React from "react";
import {
  useGetAdminDiscountsQuery,
  useGetAdminDiscountsSummaryQuery,
} from "@/features/admin/api/admin-api";
import { usePermissions } from "@/features/admin/hooks/use-permissions";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { DiscountApprovalStatusBadge } from "@/features/staff/components/bookings/discount-approval-status-badge";
import { DiscountReviewDialog } from "./discount-review-dialog";
import { DiscountDetailsDialog } from "./discount-details-dialog";
import type {
  StaffDiscountRequestRecord,
  DiscountApprovalStatus,
} from "@/features/admin/types/admin-discounts";
import {
  Tag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function AdminDiscountsView() {
  const { hasPermission, isAdmin } = usePermissions();
  const canReview = isAdmin || hasPermission("bookings.approve_price");

  // Query & pagination state
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);
  const [statusFilter, setStatusFilter] = React.useState<DiscountApprovalStatus | "ALL">("ALL");
  const [search, setSearch] = React.useState("");
  const [staffFilter, setStaffFilter] = React.useState<string>("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  // Dialog state
  const [reviewTarget, setReviewTarget] = React.useState<StaffDiscountRequestRecord | null>(null);
  const [detailsTarget, setDetailsTarget] = React.useState<StaffDiscountRequestRecord | null>(null);

  // Queries
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: search.trim() ? search.trim() : undefined,
      requestedById: staffFilter !== "ALL" ? staffFilter : undefined,
      startDate: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
    };
  }, [page, limit, statusFilter, search, staffFilter, startDate, endDate]);

  const {
    data: listResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    refetch: refetchList,
  } = useGetAdminDiscountsQuery(queryParams);

  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetAdminDiscountsSummaryQuery();

  const items = listResponse?.data?.items || [];
  const totalItems = listResponse?.data?.total || 0;
  const totalPages = listResponse?.data?.totalPages || 1;
  const summary = summaryResponse?.data;

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setSearch("");
    setStaffFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const isFiltered =
    statusFilter !== "ALL" ||
    Boolean(search.trim()) ||
    staffFilter !== "ALL" ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="space-y-6" data-testid="admin-discounts-dashboard">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#18282A] font-outfit">
              Staff Discount Requests &amp; Approvals
            </h1>
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 sm:inline-block">
              Financial Approvals
            </span>
          </div>
          <p className="text-xs text-[#74818A] mt-1">
            Review, approve, or reject custom price adjustment requests submitted by Staff for direct bookings.
          </p>
        </div>
      </div>

      {/* 1. Summary Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#74818A]">
            <span className="text-xs font-medium">Total Requests</span>
            <Tag className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-outfit text-[#18282A]" data-testid="summary-total-requests">
            {summary?.totalRequests ?? 0}
          </div>
          <span className="text-[11px] text-[#74818A]">All time submitted</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-outfit text-amber-900" data-testid="summary-pending-requests">
            {summary?.pendingRequests ?? 0}
          </div>
          <span className="text-[11px] text-amber-700">Awaiting Admin decision</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-outfit text-emerald-900" data-testid="summary-approved-requests">
            {summary?.approvedRequests ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700">Discounts granted</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-outfit text-rose-900" data-testid="summary-rejected-requests">
            {summary?.rejectedRequests ?? 0}
          </div>
          <span className="text-[11px] text-rose-700">Standard rate retained</span>
        </div>

        <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl border border-[#176779]/20 bg-[#E8F8F5]/60 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#176779]">
            <span className="text-xs font-semibold">Total Discounted</span>
            <TrendingDown className="h-4 w-4 text-[#176779]" />
          </div>
          <div className="mt-2 text-xl font-bold font-outfit text-[#176779]" data-testid="summary-total-discounted">
            {formatCurrency(summary?.totalApprovedDiscountAmount ?? 0, "USD")}
          </div>
          <span className="text-[11px] text-[#176779]/80">Approved margin reduction</span>
        </div>
      </div>

      {/* Staff Statistics Breakdown (if available) */}
      {summary?.staffStats && summary.staffStats.length > 0 && (
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-[#18282A] uppercase tracking-wider mb-3">
            Staff Request Activity Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {summary.staffStats.map((s) => (
              <div
                key={s.staffId}
                className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-xs space-y-1.5"
                data-testid={`staff-stat-card-${s.staffId}`}
              >
                <div className="font-semibold text-[#18282A] truncate" title={s.staffName}>
                  {s.staffName}
                </div>
                <div className="text-[11px] text-[#74818A] flex justify-between">
                  <span>Total: <strong>{s.totalRequests}</strong></span>
                  <span className="text-amber-700">Pending: <strong>{s.pendingRequests}</strong></span>
                  <span className="text-emerald-700">Approved: <strong>{s.approvedRequests}</strong></span>
                </div>
                <div className="text-[11px] text-[#176779] font-medium pt-1 border-t border-[#EEF2F3]">
                  Discount Granted: {formatCurrency(s.totalApprovedDiscountAmount, "USD")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-outfit text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#18282A] text-white shadow-xs"
                    : "border border-[#E5EAED] bg-[#FAFCFC] text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A]"
                }`}
                data-testid={`status-tab-${st.toLowerCase()}`}
              >
                <span>{st === "ALL" ? "All Requests" : st.charAt(0) + st.slice(1).toLowerCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Input Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-3.5 w-3.5 text-[#74818A] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference, customer, or reason..."
              className="h-9 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-9 pr-3 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:outline-none"
              data-testid="discount-search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              aria-label="Start date"
              className="h-9 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] px-3 text-xs text-[#18282A] focus:border-[#176779] focus:outline-none"
              data-testid="discount-start-date"
            />
            <span className="text-xs text-[#74818A]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              aria-label="End date"
              className="h-9 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] px-3 text-xs text-[#18282A] focus:border-[#176779] focus:outline-none"
              data-testid="discount-end-date"
            />
          </div>

          {summary?.staffStats && (
            <select
              value={staffFilter}
              onChange={(e) => {
                setStaffFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by staff member"
              className="h-9 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] px-3 text-xs text-[#18282A] focus:border-[#176779] focus:outline-none cursor-pointer"
              data-testid="discount-staff-filter"
            >
              <option value="ALL">All Staff Members</option>
              {summary.staffStats.map((s) => (
                <option key={s.staffId} value={s.staffId}>
                  {s.staffName}
                </option>
              ))}
            </select>
          )}

          <div className="flex justify-end">
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs font-semibold text-[#74818A] hover:text-[#18282A]"
                data-testid="discount-reset-filters-btn"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Requests Table */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs overflow-hidden">
        {isListLoading ? (
          <div className="p-12 text-center text-xs text-[#74818A]">
            Loading discount requests...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Tag className="h-8 w-8 text-[#B0BCC2] mx-auto" />
            <h3 className="text-sm font-semibold text-[#18282A]">No Discount Requests Found</h3>
            <p className="text-xs text-[#74818A]">
              {isFiltered
                ? "No discount requests match the active filters. Try adjusting or resetting filters."
                : "No staff discount requests have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs border-collapse" data-testid="discount-requests-table">
              <thead>
                <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
                  <th className="w-[110px] px-3 py-3 font-semibold">Booking Ref</th>
                  <th className="w-[140px] px-3 py-3 font-semibold">Customer</th>
                  <th className="w-[150px] px-3 py-3 font-semibold">Tour Service</th>
                  <th className="w-[100px] px-3 py-3 font-semibold">Original Price</th>
                  <th className="w-[120px] px-3 py-3 font-semibold">Requested Discount</th>
                  <th className="w-[105px] px-3 py-3 font-semibold">Proposed Price</th>
                  <th className="w-[115px] px-3 py-3 font-semibold">Staff Requester</th>
                  <th className="w-[100px] px-3 py-3 font-semibold">Status</th>
                  <th className="w-[95px] px-3 py-3 font-semibold">Date</th>
                  <th className="w-[105px] px-2 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {items.map((r) => {
                  const currency = r.booking?.currency || "USD";
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#F9FBFC] transition-colors cursor-pointer"
                      onClick={() => setDetailsTarget(r)}
                      data-testid={`discount-row-${r.id}`}
                    >
                      {/* Booking Reference */}
                      <td className="px-3 py-3 align-middle font-mono font-semibold text-[#176779]">
                        #{r.bookingId.slice(0, 8)}…
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3 align-middle">
                        <span className="font-semibold text-[#18282A] truncate block">
                          {r.booking?.customer?.name || "Customer"}
                        </span>
                      </td>

                      {/* Tour */}
                      <td className="px-3 py-3 align-middle">
                        <span className="truncate block text-[#18282A]" title={r.booking?.service?.name}>
                          {r.booking?.service?.name || "Tour Service"}
                        </span>
                      </td>

                      {/* Original Price */}
                      <td className="px-3 py-3 align-middle text-[#18282A]">
                        {formatCurrency(r.originalPrice, currency)}
                      </td>

                      {/* Requested Discount */}
                      <td className="px-3 py-3 align-middle font-semibold text-rose-600">
                        -{formatCurrency(r.discountAmount, currency)}
                        <span className="text-[10px] text-[#74818A] block font-normal">
                          {r.discountType === "PERCENTAGE" ? `(${r.discountValue}%)` : `(Fixed)`}
                        </span>
                      </td>

                      {/* Proposed Price */}
                      <td className="px-3 py-3 align-middle font-bold text-[#176779]">
                        {formatCurrency(r.proposedFinalPrice, currency)}
                      </td>

                      {/* Requester */}
                      <td className="px-3 py-3 align-middle text-[#18282A]">
                        <span className="truncate block font-medium">
                          {r.requestedBy?.name || "Staff"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 align-middle">
                        <DiscountApprovalStatusBadge status={r.status} />
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 align-middle text-[#74818A] whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setDetailsTarget(r)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAED] bg-white px-2 py-1 text-xs font-semibold text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
                            data-testid={`view-discount-details-${r.id}`}
                            title="View details"
                          >
                            <Eye className="h-3 w-3 text-[#74818A]" />
                            <span>Details</span>
                          </button>

                          {canReview && r.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => setReviewTarget(r)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#176779] px-2 py-1 text-xs font-semibold text-white hover:bg-[#135664] transition-colors cursor-pointer"
                              data-testid={`review-discount-btn-${r.id}`}
                              title="Review and approve or reject"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>Review</span>
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
        {totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] px-4 py-3 text-xs text-[#74818A]">
            <span>
              Showing {items.length} of {totalItems} discount requests
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

      {/* Review Dialog */}
      {reviewTarget && (
        <DiscountReviewDialog
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          request={reviewTarget}
          onSuccess={() => {
            refetchList();
            refetchSummary();
          }}
        />
      )}

      {/* Details Dialog */}
      {detailsTarget && (
        <DiscountDetailsDialog
          isOpen={Boolean(detailsTarget)}
          onClose={() => setDetailsTarget(null)}
          request={detailsTarget}
          canReview={canReview}
          onOpenReview={(req) => {
            setReviewTarget(req);
          }}
        />
      )}
    </div>
  );
}
