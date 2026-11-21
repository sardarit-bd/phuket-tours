"use client";

import * as React from "react";
import {
  CalendarDays,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Clock,
  AlertCircle,
  Search,
  RotateCcw,
  Tag,
  ShieldCheck,
} from "lucide-react";
import {
  useGetAdminPendingReservationsQuery,
  useReviewAdminPendingReservationMutation,
} from "../../api/admin-api";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { Dialog } from "@/components/ui/dialog";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type { PendingReservationRecord } from "../../types/admin-bookings";

const PAYMENT_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Payment Statuses" },
  { value: "PAID", label: "Paid (Ready to Confirm)" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
];

export function AdminPendingReservationsTab() {
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(10);
  const [search, setSearch] = React.useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");

  // Dialog state
  const [selectedReservation, setSelectedReservation] =
    React.useState<PendingReservationRecord | null>(null);
  const [actionConfirmReservation, setActionConfirmReservation] =
    React.useState<PendingReservationRecord | null>(null);
  const [actionRejectReservation, setActionRejectReservation] =
    React.useState<PendingReservationRecord | null>(null);
  const [notes, setNotes] = React.useState<string>("");
  const [rejectionReason, setRejectionReason] = React.useState<string>("");
  const [isPartialApproval, setIsPartialApproval] = React.useState<boolean>(false);
  const [approvedDiscountValue, setApprovedDiscountValue] = React.useState<string>("");
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Queries & Mutations
  const queryParams = React.useMemo(() => {
    return {
      page,
      limit,
      search: search.trim() ? search.trim() : undefined,
      paymentStatus: paymentStatusFilter !== "ALL" ? paymentStatusFilter : undefined,
    };
  }, [page, limit, search, paymentStatusFilter]);

  const {
    data: pendingData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAdminPendingReservationsQuery(queryParams);

  const [reviewReservation, { isLoading: isSubmittingAction }] =
    useReviewAdminPendingReservationMutation();

  const reservations = pendingData?.data?.items || [];
  const total = pendingData?.data?.total || 0;

  // Active discount on confirmation reservation
  const activeDiscount = actionConfirmReservation?.discountRequests?.[0];
  const origPriceNum = actionConfirmReservation ? Number(actionConfirmReservation.basePrice) || 0 : 0;
  const partialValNum = parseFloat(approvedDiscountValue) || 0;

  const partialPreview = React.useMemo(() => {
    if (!activeDiscount || !isPartialApproval) {
      return {
        discountAmount: activeDiscount ? Number(activeDiscount.discountAmount) || 0 : 0,
        finalPrice: activeDiscount ? Number(activeDiscount.proposedFinalPrice) || 0 : origPriceNum,
        isValid: true,
      };
    }

    if (partialValNum <= 0) {
      return {
        discountAmount: 0,
        finalPrice: origPriceNum,
        isValid: false,
        error: "Approved discount value must be greater than zero.",
      };
    }

    const requestedVal = Number(activeDiscount.discountValue);
    if (partialValNum > requestedVal) {
      return {
        discountAmount: 0,
        finalPrice: origPriceNum,
        isValid: false,
        error: `Partial approval cannot exceed requested discount (${requestedVal}${
          activeDiscount.discountType === "PERCENTAGE" ? "%" : ""
        }).`,
      };
    }

    if (activeDiscount.discountType === "PERCENTAGE") {
      const amount = Math.round(origPriceNum * (partialValNum / 100) * 100) / 100;
      const finalP = Math.max(0, Math.round((origPriceNum - amount) * 100) / 100);
      return { discountAmount: amount, finalPrice: finalP, isValid: true };
    } else {
      const amount = Math.round(partialValNum * 100) / 100;
      const finalP = Math.max(0, Math.round((origPriceNum - amount) * 100) / 100);
      return { discountAmount: amount, finalPrice: finalP, isValid: true };
    }
  }, [activeDiscount, isPartialApproval, partialValNum, origPriceNum]);

  const handleConfirm = async () => {
    if (!actionConfirmReservation) return;
    setActionError(null);

    if (activeDiscount && isPartialApproval && (!partialPreview.isValid || partialPreview.error)) {
      setActionError(partialPreview.error || "Please enter a valid partial discount value.");
      return;
    }

    try {
      await reviewReservation({
        bookingId: actionConfirmReservation.id,
        action: "CONFIRM",
        notes: notes.trim() ? notes.trim() : undefined,
        approvedDiscountValue:
          activeDiscount && isPartialApproval ? partialValNum : undefined,
      }).unwrap();
      setActionConfirmReservation(null);
      setNotes("");
      setIsPartialApproval(false);
      setApprovedDiscountValue("");
      refetch();
    } catch (err: any) {
      setActionError(formatErrorMessage(err, "Failed to confirm reservation"));
    }
  };

  const handleReject = async () => {
    if (!actionRejectReservation) return;
    setActionError(null);

    const hasDiscount = Boolean(actionRejectReservation.discountRequests?.length);
    if (hasDiscount && !rejectionReason.trim()) {
      setActionError("A rejection reason is mandatory when declining a booking with discount request.");
      return;
    }

    try {
      await reviewReservation({
        bookingId: actionRejectReservation.id,
        action: "REJECT",
        notes: notes.trim() ? notes.trim() : undefined,
        rejectionReason: rejectionReason.trim() ? rejectionReason.trim() : undefined,
      }).unwrap();
      setActionRejectReservation(null);
      setNotes("");
      setRejectionReason("");
      refetch();
    } catch (err: any) {
      setActionError(formatErrorMessage(err, "Failed to reject reservation"));
    }
  };

  return (
    <div className="space-y-4" data-testid="admin-pending-reservations-tab">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1 min-w-[240px] w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74818A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search pending reservations by customer, tour or reference..."
            className="h-9 w-full rounded-lg border border-[#E5EAED] bg-white pl-9.5 pr-3 font-outfit text-xs text-[#18282A] placeholder-[#74818A] transition-colors focus:border-[#176779] focus:outline-none"
            data-testid="pending-search-input"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-[200px]">
            <CustomSelect
              options={PAYMENT_STATUS_OPTIONS}
              value={paymentStatusFilter}
              onChange={(val) => {
                setPaymentStatusFilter(val);
                setPage(1);
              }}
              size="sm"
              usePortal={true}
              aria-label="Filter by payment status"
              data-testid="pending-payment-status-filter"
            />
          </div>

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="border-[#E5EAED] text-xs font-medium cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table or Loading/Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAED] bg-white p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
          <p className="mt-2 text-xs font-medium text-[#74818A]">Loading pending reservations...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
          <p className="mt-2 text-xs font-semibold text-rose-900">Failed to load pending reservations</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3 text-xs">
            Retry
          </Button>
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8 text-[#74818A]" />}
          title="No pending reservations found"
          description={
            search || paymentStatusFilter !== "ALL"
              ? "No reservations matched your current filter criteria."
              : "All customer reservations are currently confirmed and in the operational schedule."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-outfit text-xs" data-testid="pending-reservations-table">
              <thead className="border-b border-[#E5EAED] bg-[#F5F8F9] text-[11px] font-semibold text-[#74818A]">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tour / Service</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {reservations.map((booking) => {
                  const isPaid = booking.paymentStatus === "PAID";
                  const hasDiscount = Boolean(booking.discountRequests && booking.discountRequests.length > 0);
                  const isAgentPriceApproval = Boolean(booking.priceApproval && booking.priceApproval.status === "PENDING");
                  const canConfirm = !isAgentPriceApproval && (booking.status === "PENDING" || booking.status === "AWAITING_APPROVAL");
                  return (
                    <tr key={booking.id} className="hover:bg-[#FAFCFD] transition-colors">
                      {/* Ref & Date */}
                      <td className="py-3 px-4 font-mono font-medium text-[#18282A]">
                        <div>{booking.id.slice(0, 8)}...</div>
                        <div className="text-[10px] text-[#74818A] font-sans">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#18282A]">{booking.customer.name}</div>
                        <div className="text-[10px] text-[#74818A]">{booking.customer.email}</div>
                      </td>

                      {/* Service / Tour */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#18282A] line-clamp-1">{booking.service.name}</div>
                        <div className="text-[10px] text-[#74818A]">
                          {booking.availability?.date
                            ? `Date: ${new Date(booking.availability.date).toLocaleDateString()}`
                            : booking.notes?.includes("Travel Date")
                            ? booking.notes.split("|")[0].trim()
                            : "Flexible Date"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-semibold text-[#18282A]">
                        <div>{booking.currency} {Number(booking.finalPrice).toFixed(2)}</div>
                        {hasDiscount && (
                          <div className="text-[10px] font-normal text-amber-700 flex items-center gap-1 mt-0.5">
                            <Tag className="h-2.5 w-2.5" />
                            <span>Req: {booking.currency} {Number(booking.discountRequests![0].proposedFinalPrice).toFixed(2)}</span>
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            booking.requiresApproval || booking.status === "AWAITING_APPROVAL"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-sky-50 text-sky-800 border border-sky-200"
                          }`}
                        >
                          {booking.requiresApproval || booking.status === "AWAITING_APPROVAL"
                            ? "AWAITING_APPROVAL"
                            : booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReservation(booking)}
                            className="rounded-lg p-1.5 text-[#74818A] hover:bg-[#F0F4F5] hover:text-[#18282A] cursor-pointer"
                            title="View Details"
                            data-testid={`view-pending-${booking.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canConfirm && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setNotes("");
                                setIsPartialApproval(false);
                                setApprovedDiscountValue(
                                  booking.discountRequests?.[0]
                                    ? String(booking.discountRequests[0].discountValue)
                                    : ""
                                );
                                setActionConfirmReservation(booking);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                              title={hasDiscount ? "Approve Booking & Discount" : "Confirm Reservation"}
                              data-testid={`confirm-pending-${booking.id}`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{hasDiscount ? "Approve" : "Confirm"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null);
                              setNotes("");
                              setRejectionReason("");
                              setActionRejectReservation(booking);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Reject / Cancel Reservation"
                            data-testid={`reject-pending-${booking.id}`}
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer stats */}
          <div className="border-t border-[#E5EAED] bg-[#FAFDFD] px-4 py-2.5 text-xs text-[#74818A] flex items-center justify-between">
            <span>Showing {reservations.length} of {total} pending reservation{total !== 1 ? "s" : ""}</span>
            <span className="text-[11px]">Confirmed reservations move immediately to the Operational Queue</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionConfirmReservation && (
        <Dialog
          isOpen={true}
          onClose={() => setActionConfirmReservation(null)}
          title={activeDiscount ? "Approve Booking & Discount" : "Confirm Tour Reservation"}
        >
          <div className="space-y-4 p-4 text-xs font-outfit max-h-[85vh] overflow-y-auto">
            <p className="text-[#556972] leading-relaxed">
              {activeDiscount
                ? "Review and approve this staff-created booking and its requested discount. Confirming finalizes the discount and moves the booking into the operational queue."
                : "Confirming this reservation will move it to the Operational Queue as Not Started, making it eligible for staff dispatch and guide assignment."}
            </p>

            <div className="rounded-xl border border-[#E5EAED] bg-[#F5F8F9] p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#74818A]">Customer:</span>
                <span className="font-semibold text-[#18282A]">{actionConfirmReservation.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74818A]">Tour:</span>
                <span className="font-semibold text-[#18282A]">{actionConfirmReservation.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74818A]">Standard Price:</span>
                <span className="font-semibold text-[#18282A]">
                  {actionConfirmReservation.currency} {origPriceNum.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74818A]">Payment Status:</span>
                <span className={`font-semibold ${actionConfirmReservation.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-700"}`}>
                  {actionConfirmReservation.paymentStatus}
                </span>
              </div>
            </div>

            {/* Discount Details & Review Controls */}
            {activeDiscount && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Tag className="h-4 w-4 text-amber-700" />
                  <span>Requested Discount Information</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-amber-800 block text-[11px]">Discount Type:</span>
                    <span className="font-semibold text-[#18282A]">
                      {activeDiscount.discountType === "PERCENTAGE" ? "Percentage (%)" : "Fixed Amount"}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[11px]">Requested Value:</span>
                    <span className="font-semibold text-[#18282A]">
                      {activeDiscount.discountValue}
                      {activeDiscount.discountType === "PERCENTAGE" ? "%" : ` ${actionConfirmReservation.currency}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[11px]">Discount Amount:</span>
                    <span className="font-semibold text-rose-600">
                      -{actionConfirmReservation.currency} {Number(activeDiscount.discountAmount).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[11px]">Proposed Final Price:</span>
                    <span className="font-bold text-emerald-800">
                      {actionConfirmReservation.currency} {Number(activeDiscount.proposedFinalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200/60 text-xs">
                  <span className="text-amber-900 font-semibold block mb-0.5">Staff Reason:</span>
                  <p className="text-[#18282A] italic">&ldquo;{activeDiscount.reason}&rdquo;</p>
                  {activeDiscount.requestedBy && (
                    <span className="text-[10px] text-[#74818A] block mt-1">
                      Requested by: {activeDiscount.requestedBy.name} ({activeDiscount.requestedBy.email})
                    </span>
                  )}
                </div>

                {/* Partial Approval Toggle */}
                <div className="pt-2 border-t border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-950">
                    <input
                      type="checkbox"
                      checked={isPartialApproval}
                      onChange={(e) => setIsPartialApproval(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-amber-300 text-[#176779] focus:ring-[#176779]"
                      data-testid="partial-approval-toggle"
                    />
                    <span>Approve lower partial discount instead of full request</span>
                  </label>

                  {isPartialApproval && (
                    <div className="mt-2.5 space-y-2 bg-white/90 p-2.5 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                          Approved Discount Value ({activeDiscount.discountType === "PERCENTAGE" ? "%" : actionConfirmReservation.currency})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={Number(activeDiscount.discountValue)}
                          value={approvedDiscountValue}
                          onChange={(e) => setApprovedDiscountValue(e.target.value)}
                          className="w-full h-8 rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                          data-testid="partial-discount-value-input"
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-[#F0F3F4]">
                        <span className="text-[#74818A]">Adjusted Final Price:</span>
                        <span className="font-bold text-emerald-700" data-testid="partial-adjusted-price">
                          {actionConfirmReservation.currency} {partialPreview.finalPrice.toFixed(2)}
                        </span>
                      </div>
                      {partialPreview.error && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {partialPreview.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {actionError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#18282A] mb-1">
                {activeDiscount ? "Admin Decision Notes (Optional)" : "Internal Notes (Optional)"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  activeDiscount
                    ? "e.g., Approved as authorized under standard VIP policy"
                    : "e.g., Verified availability with boat operator"
                }
                className="w-full rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
                data-testid="confirm-dialog-notes"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionConfirmReservation(null)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={
                  isSubmittingAction ||
                  (Boolean(activeDiscount) && isPartialApproval && !partialPreview.isValid)
                }
                className="bg-[#176779] hover:bg-[#135463] text-white"
                data-testid="confirm-dialog-submit"
              >
                {isSubmittingAction ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Confirming...
                  </>
                ) : activeDiscount ? (
                  <>
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    <span>Approve Booking &amp; Price</span>
                  </>
                ) : (
                  "Confirm Reservation"
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Reject Modal */}
      {actionRejectReservation && (
        <Dialog
          isOpen={true}
          onClose={() => setActionRejectReservation(null)}
          title="Reject / Cancel Reservation"
        >
          <div className="space-y-4 p-4 text-xs font-outfit">
            <p className="text-[#556972] leading-relaxed">
              Are you sure you want to cancel or reject this reservation? This transitions the booking to <strong className="text-rose-700">CANCELLED</strong>
              {actionRejectReservation.discountRequests?.length ? " and rejects the associated discount request." : "."}
            </p>

            {actionRejectReservation.discountRequests?.[0] && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 space-y-1">
                <span className="font-bold text-rose-900 block">Contains Pending Discount Request:</span>
                <span className="text-rose-800">
                  {actionRejectReservation.discountRequests[0].discountValue}
                  {actionRejectReservation.discountRequests[0].discountType === "PERCENTAGE" ? "%" : ` ${actionRejectReservation.currency}`} discount (
                  &ldquo;{actionRejectReservation.discountRequests[0].reason}&rdquo;)
                </span>
              </div>
            )}

            {actionError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#18282A] mb-1">
                Rejection Reason{" "}
                {actionRejectReservation.discountRequests?.length ? (
                  <span className="text-rose-600">* Mandatory</span>
                ) : (
                  "(Optional)"
                )}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Maximum allowable discount exceeded or operator capacity unavailable"
                className="w-full rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
                data-testid="reject-dialog-reason"
              />
            </div>

            <div>
              <label className="block font-medium text-[#18282A] mb-1">Internal Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Operator fully booked or customer requested cancellation"
                className="w-full rounded-lg border border-[#E5EAED] p-2 text-xs focus:border-[#176779] focus:outline-none"
                rows={2}
                data-testid="reject-dialog-notes"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionRejectReservation(null)}
                disabled={isSubmittingAction}
              >
                Go Back
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={
                  isSubmittingAction ||
                  (Boolean(actionRejectReservation.discountRequests?.length) && !rejectionReason.trim())
                }
                className="bg-rose-600 hover:bg-rose-700 text-white"
                data-testid="reject-dialog-submit"
              >
                {isSubmittingAction ? (
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

      {/* Details Modal */}
      {selectedReservation && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedReservation(null)}
          title={`Reservation Details: ${selectedReservation.id}`}
        >
          <div className="space-y-3 p-4 text-xs font-outfit max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#74818A] block">Customer Name</span>
                <span className="font-semibold text-[#18282A]">{selectedReservation.customer.name}</span>
              </div>
              <div>
                <span className="text-[#74818A] block">Customer Email</span>
                <span className="font-semibold text-[#18282A]">{selectedReservation.customer.email}</span>
              </div>
              <div>
                <span className="text-[#74818A] block">Tour</span>
                <span className="font-semibold text-[#18282A]">{selectedReservation.service.name}</span>
              </div>
              <div>
                <span className="text-[#74818A] block">Standard Price</span>
                <span className="font-semibold text-[#18282A]">
                  {selectedReservation.currency} {Number(selectedReservation.basePrice).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#74818A] block">Final Price</span>
                <span className="font-semibold text-[#18282A]">
                  {selectedReservation.currency} {Number(selectedReservation.finalPrice).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#74818A] block">Payment Status</span>
                <span className="font-semibold text-[#18282A]">{selectedReservation.paymentStatus}</span>
              </div>
              <div>
                <span className="text-[#74818A] block">Booking Status</span>
                <span className="font-semibold text-[#18282A]">{selectedReservation.status}</span>
              </div>
            </div>

            {/* Discount Details if Present */}
            {selectedReservation.discountRequests?.[0] && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Tag className="h-3.5 w-3.5 text-amber-700" />
                  <span>Requested Discount</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-800">Value:</span>{" "}
                    <span className="font-semibold text-[#18282A]">
                      {selectedReservation.discountRequests[0].discountValue}
                      {selectedReservation.discountRequests[0].discountType === "PERCENTAGE" ? "%" : ` ${selectedReservation.currency}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800">Discount Amount:</span>{" "}
                    <span className="font-semibold text-rose-600">
                      -{selectedReservation.currency} {Number(selectedReservation.discountRequests[0].discountAmount).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800">Proposed Price:</span>{" "}
                    <span className="font-semibold text-emerald-800">
                      {selectedReservation.currency} {Number(selectedReservation.discountRequests[0].proposedFinalPrice).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800">Status:</span>{" "}
                    <span className="font-semibold text-amber-900">
                      {selectedReservation.discountRequests[0].status}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] pt-1 border-t border-amber-200/60">
                  <span className="text-amber-900 font-semibold">Reason:</span>{" "}
                  <span className="italic text-[#18282A]">&ldquo;{selectedReservation.discountRequests[0].reason}&rdquo;</span>
                </div>
              </div>
            )}

            {selectedReservation.notes && (
              <div className="rounded-lg bg-[#F5F8F9] p-2.5 border border-[#E5EAED]">
                <span className="text-[#74818A] block mb-1 font-medium">Traveler & Guest Notes:</span>
                <p className="text-[#18282A]">{selectedReservation.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedReservation(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

