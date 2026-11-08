"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AgentBookingRecord } from "../../types/agent";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
  AgentPriceApprovalBadge,
  AgentCommissionStatusBadge,
} from "../common/agent-status-badges";
import {
  Calendar,
  Compass,
  User,
  Mail,
  Phone,
  FileText,
  Coins,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface AgentBookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AgentBookingRecord | null;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount?: number | null): string {
  if (typeof amount !== "number") return "N/A";
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AgentBookingDetailsDialog({
  isOpen,
  onClose,
  booking,
}: AgentBookingDetailsDialogProps) {
  if (!booking) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Reservation Details"
      description={`Reference: ${booking.id}`}
      size="lg"
    >
      <div className="space-y-5 pt-1" data-testid="agent-booking-details-dialog">
        {/* Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Booking Status & Reconciliation
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <AgentBookingStatusBadge status={booking.status} />
              <AgentPaymentStatusBadge status={booking.paymentStatus} />
              {booking.priceApproval && (
                <AgentPriceApprovalBadge status={booking.priceApproval.status} />
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Final Amount
            </span>
            <p className="font-outfit text-xl font-bold text-[#18282A]">
              {formatCurrency(booking.finalPrice)}
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Tour Info & Customer Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Tour Information */}
          <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <Compass className="h-4 w-4 text-[#176779]" />
              <span>Tour Details</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#74818A]">Tour Name</span>
                <p className="font-semibold text-[#18282A]">
                  {booking.service?.name || "Tour Service"}
                </p>
              </div>
              <div>
                <span className="text-[#74818A]">Tour Category / Type</span>
                <p className="font-medium text-[#18282A]">
                  {booking.service?.type || "Standard Tour"}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-[#E5EAED]">
                <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                <span className="text-[#74818A]">Travel Date:</span>
                <span className="font-semibold text-[#18282A]">
                  {formatDate(booking.availability?.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <User className="h-4 w-4 text-[#176779]" />
              <span>Customer Contact</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#74818A]">Full Name</span>
                <p className="font-semibold text-[#18282A]">
                  {booking.customer?.name || "Customer"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span className="text-[#18282A] truncate">
                  {booking.customer?.email || "No email"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span className="text-[#18282A]">
                  {booking.customer?.phone || "No phone specified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Price Approval Breakdown */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <Coins className="h-4 w-4 text-[#176779]" />
              <span>Pricing Breakdown</span>
            </div>
            {booking.requiresApproval && (
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Custom Agent Rate
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] text-[11px]">Base Price</span>
              <p className="mt-0.5 font-semibold text-[#18282A]">
                {formatCurrency(booking.basePrice)}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] text-[11px]">Proposed Price</span>
              <p className="mt-0.5 font-semibold text-[#18282A]">
                {booking.proposedPrice != null ? formatCurrency(booking.proposedPrice) : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] text-[11px]">Final Price</span>
              <p className="mt-0.5 font-bold text-[#176779]">
                {formatCurrency(booking.finalPrice)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5">
              <span className="text-emerald-800 text-[11px] font-semibold">Commission</span>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="font-bold text-emerald-900">
                  {booking.commission ? formatCurrency(booking.commission.amount) : "฿0.00"}
                </span>
                {booking.commission && (
                  <AgentCommissionStatusBadge status={booking.commission.status} className="text-[10px] py-0 px-2" />
                )}
              </div>
            </div>
          </div>

          {/* Price Approval Detail Note if any */}
          {booking.priceApproval && (
            <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-purple-950">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  Admin Price Review
                </span>
                <span className="text-[11px] font-normal text-purple-700">
                  Reviewed: {formatDate(booking.priceApproval.reviewedAt)}
                </span>
              </div>
              {booking.priceApproval.notes && (
                <p className="text-[11px] text-purple-900">
                  Notes: {booking.priceApproval.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notes & Special Requests */}
        {booking.notes && (
          <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs space-y-1">
            <span className="font-semibold text-[#18282A] flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#176779]" />
              Special Notes & Requests
            </span>
            <p className="text-[#74818A] leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {/* Timestamps & Dialog Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#E5EAED]">
          <span className="text-[11px] text-[#74818A] flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Created {formatDate(booking.createdAt)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-[#18282A] cursor-pointer"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
