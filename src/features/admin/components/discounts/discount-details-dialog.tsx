"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StaffDiscountRequestRecord } from "@/features/admin/types/admin-discounts";
import { DiscountApprovalStatusBadge } from "@/features/staff/components/bookings/discount-approval-status-badge";
import {
  Tag,
  Percent,
  DollarSign,
  User,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
} from "lucide-react";

export interface DiscountDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: StaffDiscountRequestRecord | null;
  onOpenReview?: (request: StaffDiscountRequestRecord) => void;
  canReview?: boolean;
}

function formatCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  if (amount === null || amount === undefined) return "-";
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function DiscountDetailsDialog({
  isOpen,
  onClose,
  request,
  onOpenReview,
  canReview = false,
}: DiscountDetailsDialogProps) {
  if (!request) return null;

  const originalPrice = Number(request.originalPrice) || 0;
  const currency = request.booking?.currency || "USD";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Discount Request Details"
      description={`Request #${request.id.slice(0, 8)} • Booking #${request.bookingId.slice(0, 8)}`}
      size="lg"
    >
      <div className="space-y-5 text-xs pt-1" data-testid="discount-details-dialog">
        {/* Status Header */}
        <div className="flex items-center justify-between rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18282A]">Status:</span>
            <DiscountApprovalStatusBadge status={request.status} />
          </div>
          <span className="text-[11px] text-[#74818A]">
            Requested: {formatDate(request.createdAt)}
          </span>
        </div>

        {/* Booking & Customer Info */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <h4 className="font-bold text-[#18282A] text-xs uppercase tracking-wider">
            Booking & Customer Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[#74818A] block">Lead Customer</span>
              <span className="font-semibold text-[#18282A] text-sm">
                {request.booking?.customer?.name || "Customer"}
              </span>
              <span className="text-[11px] text-[#74818A] block">
                {request.booking?.customer?.email || ""}
                {request.booking?.customer?.phone ? ` • ${request.booking.customer.phone}` : ""}
              </span>
            </div>
            <div>
              <span className="text-[#74818A] block">Tour Experience</span>
              <span className="font-semibold text-[#18282A] text-sm">
                {request.booking?.service?.name || "Tour Service"}
              </span>
              <span className="text-[11px] text-[#74818A] block">
                Type: {request.booking?.service?.type || "TOUR"} • Payment: {request.booking?.paymentStatus || "UNPAID"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Discount Financial Breakdown */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <h4 className="font-bold text-[#18282A] text-xs uppercase tracking-wider">
            Financial Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#F8FAFB] p-2.5 border border-[#EEF2F3]">
              <span className="text-[#74818A] block text-[10px] uppercase font-medium">Standard Price</span>
              <span className="font-bold text-[#18282A] text-sm">
                {formatCurrency(originalPrice, currency)}
              </span>
            </div>
            <div className="rounded-lg bg-rose-50/50 p-2.5 border border-rose-100">
              <span className="text-rose-700 block text-[10px] uppercase font-medium">Requested Discount</span>
              <span className="font-bold text-rose-700 text-sm">
                -{formatCurrency(request.discountAmount, currency)}
              </span>
              <span className="text-[10px] text-rose-600 block">
                ({request.discountType === "PERCENTAGE" ? `${request.discountValue}%` : `Fixed ${currency}`})
              </span>
            </div>
            <div className="rounded-lg bg-[#E8F8F5]/60 p-2.5 border border-[#176779]/20">
              <span className="text-[#176779] block text-[10px] uppercase font-medium">Proposed Price</span>
              <span className="font-bold text-[#176779] text-sm">
                {formatCurrency(request.proposedFinalPrice, currency)}
              </span>
            </div>
            <div className="rounded-lg bg-[#F8FAFB] p-2.5 border border-[#EEF2F3]">
              <span className="text-[#74818A] block text-[10px] uppercase font-medium">Approved Final Price</span>
              <span className="font-bold text-emerald-700 text-sm">
                {formatCurrency(request.approvedFinalPrice, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Justification & Staff Information */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#18282A]">Staff Requester:</span>
            <span className="font-medium text-[#18282A]">
              {request.requestedBy?.name || "Staff"} ({request.requestedBy?.email || ""})
            </span>
          </div>
          <div>
            <span className="font-semibold text-[#18282A] block mb-1">Reason / Justification:</span>
            <div className="rounded-lg bg-[#F8FAFB] p-3 border border-[#E5EAED] text-[#556972] italic leading-relaxed">
              &ldquo;{request.reason}&rdquo;
            </div>
          </div>
        </div>

        {/* Review Outcome Details (if reviewed) */}
        {request.status !== "PENDING" && (
          <div
            className={`rounded-xl border p-4 space-y-2.5 ${
              request.status === "APPROVED"
                ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                : "border-rose-200 bg-rose-50/40 text-rose-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">
                Review Decision: {request.status}
              </span>
              <span className="text-[11px] text-[#74818A]">
                Reviewed: {formatDate(request.reviewedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#74818A]">Reviewer:</span>
              <span className="font-medium text-[#18282A]">
                {request.reviewedBy?.name || "Admin"} ({request.reviewedBy?.email || ""})
              </span>
            </div>
            {request.rejectionReason && (
              <div>
                <span className="font-semibold block mb-0.5 text-rose-900">Rejection Reason:</span>
                <p className="text-rose-800 leading-relaxed">{request.rejectionReason}</p>
              </div>
            )}
            {request.adminNotes && (
              <div>
                <span className="font-semibold block mb-0.5">Admin Remarks:</span>
                <p className="text-[#556972] leading-relaxed">{request.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-medium cursor-pointer"
          >
            Close
          </Button>

          {canReview && request.status === "PENDING" && onOpenReview && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onOpenReview(request);
              }}
              className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer inline-flex items-center gap-1.5"
              data-testid="details-open-review-btn"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Review Request</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
