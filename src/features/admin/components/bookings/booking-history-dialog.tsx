"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useGetAdminBookingHistoryQuery,
  useGetStaffBookingHistoryQuery,
} from "../../api/admin-api";
import type {
  OperationalBookingRecord,
  BookingHistoryRecord,
} from "../../types/admin-bookings";
import { formatReportMoney } from "../../utils/format";
import {
  History,
  RefreshCw,
  UserCheck,
  UserMinus,
  CheckCircle2,
  XCircle,
  Activity,
  CreditCard,
  DollarSign,
  PlusCircle,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";

export interface BookingHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
  portalMode?: "admin" | "staff";
}

interface FormattedHistoryEvent {
  title: string;
  category: "booking" | "assignment" | "fulfillment" | "payment" | "pricing";
  actorLabel: string;
  roleBadgeLabel: string;
  roleBadgeClass: string;
  previousValue: string | null;
  newValue: string | null;
  notes: string | null;
  extraMeta: string | null;
}

function formatStatusLabel(val?: string | null): string {
  if (!val) return "";
  return val
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getRoleDisplay(
  actorRole: string,
  action: string,
  actorName: string | null
): {
  actorLabel: string;
  roleBadgeLabel: string;
  roleBadgeClass: string;
} {
  const isSystem =
    action.startsWith("STRIPE_") ||
    action === "BOOKING_AUTO_CONFIRMED" ||
    actorRole.toLowerCase() === "system";

  if (isSystem) {
    return {
      actorLabel: actorName || "Automated System",
      roleBadgeLabel: "System",
      roleBadgeClass:
        "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  const normalizedRole = actorRole.toLowerCase();
  if (normalizedRole === "admin") {
    return {
      actorLabel: actorName || "Administrator",
      roleBadgeLabel: "Admin",
      roleBadgeClass:
        "bg-purple-50 text-purple-700 border-purple-200",
    };
  }
  if (normalizedRole === "staff") {
    return {
      actorLabel: actorName || "Staff Member",
      roleBadgeLabel: "Staff",
      roleBadgeClass:
        "bg-teal-50 text-teal-700 border-teal-200",
    };
  }
  if (normalizedRole === "agent") {
    return {
      actorLabel: actorName || "Travel Agent",
      roleBadgeLabel: "Agent",
      roleBadgeClass:
        "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    actorLabel: actorName || "Customer",
    roleBadgeLabel: "Customer",
    roleBadgeClass:
      "bg-sky-50 text-sky-700 border-sky-200",
  };
}

function formatHistoryRecord(record: BookingHistoryRecord): FormattedHistoryEvent {
  const { action, changes = {}, actorRole, actorName } = record;
  const roleInfo = getRoleDisplay(actorRole, action, actorName);

  let title = formatStatusLabel(action);
  let category: FormattedHistoryEvent["category"] = "booking";
  let previousValue: string | null = null;
  let newValue: string | null = null;
  let notes: string | null =
    typeof changes.notes === "string" && changes.notes.trim()
      ? changes.notes.trim()
      : typeof changes.reason === "string" && changes.reason.trim()
      ? changes.reason.trim()
      : null;
  let extraMeta: string | null = null;

  switch (action) {
    case "BOOKING_CREATED": {
      title = "Booking Created";
      category = "booking";
      newValue = changes.status ? formatStatusLabel(String(changes.status)) : "Pending";
      if (changes.finalPrice !== undefined && changes.currency) {
        extraMeta = `Total: ${formatReportMoney(
          Number(changes.finalPrice),
          String(changes.currency)
        )}`;
      }
      break;
    }

    case "BOOKING_CONFIRMED": {
      title = "Booking Confirmed";
      category = "booking";
      previousValue = formatStatusLabel(String(changes.previousStatus || "PENDING"));
      newValue = formatStatusLabel(String(changes.newStatus || "CONFIRMED"));
      break;
    }

    case "BOOKING_AUTO_CONFIRMED": {
      title = "Booking Automatically Confirmed";
      category = "booking";
      previousValue = formatStatusLabel(String(changes.fromStatus || "PENDING"));
      newValue = formatStatusLabel(String(changes.toStatus || "CONFIRMED"));
      if (changes.trigger) {
        extraMeta = `Trigger: ${formatStatusLabel(String(changes.trigger))}`;
      }
      break;
    }

    case "BOOKING_REJECTED": {
      title = "Booking Rejected / Cancelled";
      category = "booking";
      previousValue = formatStatusLabel(String(changes.previousStatus || "PENDING"));
      newValue = formatStatusLabel(String(changes.newStatus || "CANCELLED"));
      break;
    }

    case "OPERATIONS_ASSIGNED": {
      const hadPrevious = Boolean(changes.previousStaffId || changes.previousStaffName);
      title = hadPrevious ? "Staff Member Reassigned" : "Staff Member Assigned";
      category = "assignment";
      previousValue = changes.previousStaffName
        ? String(changes.previousStaffName)
        : changes.previousStaffId
        ? `Staff (${String(changes.previousStaffId).slice(0, 8)})`
        : "Unassigned";
      newValue = changes.newStaffName
        ? String(changes.newStaffName)
        : changes.newStaffId
        ? `Staff (${String(changes.newStaffId).slice(0, 8)})`
        : "Assigned";
      break;
    }

    case "OPERATIONS_UNASSIGNED": {
      title = "Staff Member Unassigned";
      category = "assignment";
      previousValue = changes.previousStaffName
        ? String(changes.previousStaffName)
        : changes.previousStaffId
        ? `Staff (${String(changes.previousStaffId).slice(0, 8)})`
        : "Assigned Staff";
      newValue = "Unassigned";
      break;
    }

    case "OPERATIONS_STATUS_UPDATED":
    case "OPERATIONS_STATUS_CORRECTED": {
      const toStatus = String(changes.newFulfillmentStatus || "");
      if (action === "OPERATIONS_STATUS_CORRECTED") {
        title = "Fulfillment Status Corrected";
      } else if (toStatus === "IN_PROGRESS") {
        title = "Fulfillment Changed to In Progress";
      } else if (toStatus === "FULFILLED") {
        title = "Fulfillment Marked as Completed";
      } else if (toStatus === "NOT_STARTED") {
        title = "Fulfillment Marked as Not Started";
      } else {
        title = "Fulfillment Status Updated";
      }
      category = "fulfillment";
      previousValue = changes.previousFulfillmentStatus
        ? formatStatusLabel(String(changes.previousFulfillmentStatus))
        : null;
      newValue = changes.newFulfillmentStatus
        ? formatStatusLabel(String(changes.newFulfillmentStatus))
        : null;
      if (changes.previousBookingStatus && changes.newBookingStatus) {
        extraMeta = `Booking Status: ${formatStatusLabel(
          String(changes.previousBookingStatus)
        )} → ${formatStatusLabel(String(changes.newBookingStatus))}`;
      }
      break;
    }

    case "PAYMENT_INITIATED":
    case "STRIPE_PAYMENT_INITIATED": {
      title =
        action === "STRIPE_PAYMENT_INITIATED"
          ? "Stripe Payment Initiated"
          : "Payment Initiated";
      category = "payment";
      newValue = "Initiated";
      if (changes.amount !== undefined && changes.currency) {
        extraMeta = `Amount: ${formatReportMoney(
          Number(changes.amount),
          String(changes.currency)
        )}`;
      }
      break;
    }

    case "PAYMENT_SUBMITTED": {
      title = "Payment Proof Submitted";
      category = "payment";
      previousValue = "Unpaid";
      newValue = "Submitted";
      if (changes.amount !== undefined && changes.currency) {
        extraMeta = `Amount: ${formatReportMoney(
          Number(changes.amount),
          String(changes.currency)
        )}${changes.method ? ` (${formatStatusLabel(String(changes.method))})` : ""}`;
      }
      break;
    }

    case "PAYMENT_VERIFIED":
    case "STRIPE_PAYMENT_VERIFIED": {
      title =
        action === "STRIPE_PAYMENT_VERIFIED"
          ? "Stripe Payment Verified"
          : "Payment Verified";
      category = "payment";
      previousValue = changes.previousStatus
        ? formatStatusLabel(String(changes.previousStatus))
        : "Pending Verification";
      newValue = "Verified (Paid)";
      if (changes.amount !== undefined && changes.currency) {
        extraMeta = `Amount: ${formatReportMoney(
          Number(changes.amount),
          String(changes.currency)
        )}`;
      }
      break;
    }

    case "PAYMENT_REJECTED":
    case "STRIPE_PAYMENT_FAILED":
    case "STRIPE_PAYMENT_CANCELLED": {
      title =
        action === "PAYMENT_REJECTED"
          ? "Payment Rejected"
          : action === "STRIPE_PAYMENT_FAILED"
          ? "Stripe Payment Failed"
          : "Stripe Payment Cancelled";
      category = "payment";
      previousValue = changes.previousStatus
        ? formatStatusLabel(String(changes.previousStatus))
        : "Initiated";
      newValue = changes.newStatus
        ? formatStatusLabel(String(changes.newStatus))
        : "Rejected";
      if (typeof changes.failureReason === "string" && changes.failureReason) {
        notes = changes.failureReason;
      }
      break;
    }

    case "PRICE_APPROVAL_REQUESTED":
    case "PRICE_UPDATED": {
      title =
        action === "PRICE_APPROVAL_REQUESTED"
          ? "Price Approval Requested"
          : "Booking Price Updated";
      category = "pricing";
      if (changes.previousPrice !== undefined) {
        previousValue = String(changes.previousPrice);
      }
      if (changes.proposedPrice !== undefined) {
        newValue = String(changes.proposedPrice);
      }
      break;
    }

    case "PRICE_APPROVED": {
      title = "Proposed Price Approved";
      category = "pricing";
      previousValue =
        changes.previousPrice !== undefined && changes.previousPrice !== null
          ? String(changes.previousPrice)
          : "Awaiting Approval";
      newValue =
        changes.approvedPrice !== undefined && changes.approvedPrice !== null
          ? String(changes.approvedPrice)
          : "Approved";
      break;
    }

    case "PRICE_REJECTED": {
      title = "Proposed Price Rejected";
      category = "pricing";
      previousValue = formatStatusLabel(String(changes.previousStatus || "AWAITING_APPROVAL"));
      newValue = formatStatusLabel(String(changes.newStatus || "CANCELLED"));
      break;
    }

    case "COMMISSION_ADJUSTED": {
      title = "Agent Commission Adjusted";
      category = "pricing";
      if (changes.previousAmount !== undefined) {
        previousValue = String(changes.previousAmount);
      }
      if (changes.newAmount !== undefined) {
        newValue = String(changes.newAmount);
      }
      break;
    }

    default: {
      title = formatStatusLabel(action);
      if (changes.previousStatus || changes.fromStatus) {
        previousValue = formatStatusLabel(
          String(changes.previousStatus || changes.fromStatus)
        );
      }
      if (changes.newStatus || changes.toStatus) {
        newValue = formatStatusLabel(String(changes.newStatus || changes.toStatus));
      }
      break;
    }
  }

  return {
    title,
    category,
    ...roleInfo,
    previousValue,
    newValue,
    notes,
    extraMeta,
  };
}

function getEventIcon(action: string, category: FormattedHistoryEvent["category"]) {
  if (action === "BOOKING_CREATED") {
    return <PlusCircle className="h-4 w-4 text-teal-600" />;
  }
  if (action === "BOOKING_CONFIRMED" || action === "BOOKING_AUTO_CONFIRMED") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }
  if (action === "BOOKING_REJECTED" || action === "PAYMENT_REJECTED" || action === "PRICE_REJECTED") {
    return <XCircle className="h-4 w-4 text-rose-600" />;
  }
  if (action === "OPERATIONS_UNASSIGNED") {
    return <UserMinus className="h-4 w-4 text-amber-600" />;
  }
  if (category === "assignment") {
    return <UserCheck className="h-4 w-4 text-[#176779]" />;
  }
  if (category === "fulfillment") {
    return <Activity className="h-4 w-4 text-indigo-600" />;
  }
  if (category === "payment") {
    return <CreditCard className="h-4 w-4 text-emerald-600" />;
  }
  if (category === "pricing") {
    return <DollarSign className="h-4 w-4 text-purple-600" />;
  }
  return <History className="h-4 w-4 text-[#74818A]" />;
}

export function BookingHistoryDialog({
  isOpen,
  onClose,
  booking,
  portalMode = "admin",
}: BookingHistoryDialogProps) {
  const bookingId = booking?.id || "";

  const adminQuery = useGetAdminBookingHistoryQuery(
    { bookingId, page: 1, limit: 50 },
    { skip: !isOpen || !bookingId || portalMode !== "admin" }
  );

  const staffQuery = useGetStaffBookingHistoryQuery(
    { bookingId, page: 1, limit: 50 },
    { skip: !isOpen || !bookingId || portalMode !== "staff" }
  );

  const activeQuery = portalMode === "staff" ? staffQuery : adminQuery;
  const { data, isLoading, isFetching, isError, refetch } = activeQuery;

  if (!booking) return null;

  const historyItems: BookingHistoryRecord[] = data?.data?.items || [];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Activity History"
      description="Track every important action and change made to this booking."
      size="lg"
    >
      <div className="space-y-4" data-testid="booking-history-dialog">
        {/* Booking Context Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[#18282A]">
              #{booking.id.slice(0, 8)}
            </span>
            <span className="text-[#B0BCC2]">•</span>
            <span className="font-medium text-[#18282A] truncate max-w-[220px]">
              {booking.service?.name || "Tour Booking"}
            </span>
            {booking.customer?.name && (
              <>
                <span className="text-[#B0BCC2]">•</span>
                <span className="text-[#556972]">{booking.customer.name}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5DFE4] bg-white px-2.5 py-1 text-[11px] font-medium text-[#18282A] hover:bg-[#F5F8F9] disabled:opacity-50 transition-colors cursor-pointer"
            data-testid="booking-history-refresh"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            className="space-y-4 py-6"
            data-testid="booking-history-loading"
          >
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2 rounded-xl border border-[#E5EAED] p-3.5">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-28 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center"
            data-testid="booking-history-error"
          >
            <AlertCircle className="h-8 w-8 text-rose-600 mb-2" />
            <h4 className="text-sm font-semibold text-rose-950">
              Unable to load activity history
            </h4>
            <p className="mt-1 text-xs text-rose-700 max-w-sm">
              An error occurred while retrieving the audit timeline for this booking.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 text-xs"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && historyItems.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-10 text-center"
            data-testid="booking-history-empty"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F7F8] text-[#176779] mb-3">
              <History className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#18282A]">
              No recorded activity yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-[#74818A]">
              No historical audit events were found for this booking. Future status updates, staff assignments, and payment verifications will appear here automatically.
            </p>
          </div>
        )}

        {/* Timeline List */}
        {!isLoading && !isError && historyItems.length > 0 && (
          <div
            className="relative max-h-[420px] overflow-y-auto pr-1 space-y-0"
            data-testid="booking-history-timeline"
          >
            {historyItems.map((record, index) => {
              const formatted = formatHistoryRecord(record);
              const isLast = index === historyItems.length - 1;
              const formattedTimestamp = new Date(record.createdAt).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={record.id}
                  className="relative flex gap-3.5 pb-5"
                  data-testid={`history-event-${record.id}`}
                >
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div
                      className="absolute left-4 top-8 -bottom-1 w-0.5 bg-[#E5EAED]"
                      aria-hidden="true"
                    />
                  )}

                  {/* Timeline Node Icon */}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5EAED] bg-white shadow-2xs">
                    {getEventIcon(record.action, formatted.category)}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 rounded-xl border border-[#E5EAED] bg-white p-3.5 shadow-2xs text-xs">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h5 className="font-semibold text-[#18282A] text-xs">
                          {formatted.title}
                        </h5>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[#74818A]">
                          <span className="inline-flex items-center gap-1 font-medium text-[#18282A]">
                            <User className="h-3 w-3 text-[#74818A]" />
                            {formatted.actorLabel}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold ${formatted.roleBadgeClass}`}
                          >
                            {formatted.roleBadgeLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#74818A] whitespace-nowrap">
                        <Clock className="h-3 w-3 text-[#96A4AB]" />
                        <time dateTime={record.createdAt}>{formattedTimestamp}</time>
                      </div>
                    </div>

                    {/* Value Transition Box */}
                    {(formatted.previousValue || formatted.newValue) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg bg-[#F8FAFB] px-3 py-2 border border-[#E5EAED]/80 text-[11px]">
                        {formatted.previousValue && (
                          <>
                            <span className="text-[#74818A] line-through">
                              {formatted.previousValue}
                            </span>
                            <ArrowRight className="h-3 w-3 text-[#96A4AB] shrink-0" />
                          </>
                        )}
                        {formatted.newValue && (
                          <span className="font-semibold text-[#176779]">
                            {formatted.newValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Extra Metadata */}
                    {formatted.extraMeta && (
                      <p className="mt-2 text-[11px] font-medium text-[#556972]">
                        {formatted.extraMeta}
                      </p>
                    )}

                    {/* Notes / Reason */}
                    {formatted.notes && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#FAFCFC] p-2 text-[11px] text-[#556972] border border-[#E5EAED]/60">
                        <FileText className="h-3.5 w-3.5 text-[#74818A] shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{formatted.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5EAED] pt-4 text-xs">
          <span className="text-[11px] text-[#74818A] flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#176779]" />
            {historyItems.length > 0
              ? `Showing ${historyItems.length} recorded audit event${
                  historyItems.length === 1 ? "" : "s"
                }`
              : "Audit log verified"}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

