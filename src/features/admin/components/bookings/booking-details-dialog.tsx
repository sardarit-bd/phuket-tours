"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
  BookingSourceBadge,
} from "./booking-status-badges";
import { DiscountApprovalStatusBadge } from "@/features/staff/components/bookings/discount-approval-status-badge";
import { useGetAdminBookingHistoryQuery } from "../../api/admin-api";
import type { OperationalBookingRecord, BookingHistoryRecord } from "../../types/admin-bookings";
import { formatReportMoney, formatDate } from "../../utils/format";
import {
  Calendar,
  User,
  Phone,
  Mail,
  Compass,
  FileText,
  UserCheck,
  Clock,
  Users,
  CreditCard,
  DollarSign,
  AlertCircle,
  Briefcase,
  History,
  Tag,
  CheckCircle2,
} from "lucide-react";

export interface BookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
}

interface ParsedNotes {
  travelDate: string | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
    rawText: string | null;
  };
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
    rawText: string | null;
  };
  specialRequests: string | null;
}

function parseStructuredNotes(rawNotes?: string | null): ParsedNotes {
  const result: ParsedNotes = {
    travelDate: null,
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      rawText: null,
    },
    contact: {
      name: null,
      email: null,
      phone: null,
      rawText: null,
    },
    specialRequests: null,
  };

  if (!rawNotes || typeof rawNotes !== "string") {
    return result;
  }

  const parts = rawNotes.split(" | ");
  const customRequests: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (/^Travel Date:\s*/i.test(trimmed)) {
      result.travelDate = trimmed.replace(/^Travel Date:\s*/i, "").trim();
    } else if (/^Guests:\s*/i.test(trimmed)) {
      const guestText = trimmed.replace(/^Guests:\s*/i, "").trim();
      result.guests.rawText = guestText;

      const adultsMatch = guestText.match(/(\d+)\s*Adult/i);
      const childrenMatch = guestText.match(/(\d+)\s*Child/i);
      const infantsMatch = guestText.match(/(\d+)\s*Infant/i);

      if (adultsMatch) result.guests.adults = parseInt(adultsMatch[1], 10);
      if (childrenMatch) result.guests.children = parseInt(childrenMatch[1], 10);
      if (infantsMatch) result.guests.infants = parseInt(infantsMatch[1], 10);
    } else if (/^Contact:\s*/i.test(trimmed)) {
      const contactText = trimmed.replace(/^Contact:\s*/i, "").trim();
      result.contact.rawText = contactText;

      const contactMatch = contactText.match(/^(.*?)\s*\((.*?)\)$/);
      if (contactMatch) {
        result.contact.name = contactMatch[1].trim();
        const parenParts = contactMatch[2].split(",").map((s) => s.trim());
        result.contact.email = parenParts[0] || null;
        result.contact.phone = parenParts[1] || null;
      } else {
        result.contact.name = contactText;
      }
    } else if (/^Notes:\s*/i.test(trimmed)) {
      customRequests.push(trimmed.replace(/^Notes:\s*/i, "").trim());
    } else {
      customRequests.push(trimmed);
    }
  }

  if (customRequests.length > 0) {
    result.specialRequests = customRequests.join(" • ");
  }

  return result;
}

export function BookingDetailsDialog({
  isOpen,
  onClose,
  booking,
}: BookingDetailsDialogProps) {
  const { data: historyResponse } = useGetAdminBookingHistoryQuery(
    { bookingId: booking?.id || "" },
    { skip: !isOpen || !booking?.id }
  );

  if (!booking) return null;

  const parsedNotes = parseStructuredNotes(booking.notes);

  const travelDateFormatted = booking.availability?.date
    ? new Date(booking.availability.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : parsedNotes.travelDate
    ? parsedNotes.travelDate
    : "Not specified";

  const createdAtFormatted = new Date(booking.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const rawFinalPrice = booking.finalPrice ?? booking.basePrice;
  const finalPriceNum =
    rawFinalPrice !== null && rawFinalPrice !== undefined && rawFinalPrice !== ""
      ? Number(rawFinalPrice)
      : null;
  const formattedFinalPrice = formatReportMoney(finalPriceNum, booking.currency);

  const basePriceNum =
    booking.basePrice !== null && booking.basePrice !== undefined && booking.basePrice !== ""
      ? Number(booking.basePrice)
      : null;
  const formattedBasePrice = formatReportMoney(basePriceNum, booking.currency);

  const totalGuests =
    parsedNotes.guests.adults +
    parsedNotes.guests.children +
    parsedNotes.guests.infants;

  const discountReq = booking.discountRequests?.[0];
  const auditTimeline = historyResponse?.data?.items || [];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Unified Booking Details"
      description={`Reference #${booking.id}`}
      size="lg"
    >
      <div className="space-y-6" data-testid="booking-details-dialog">
        {/* SECTION 1: Booking Overview & Status Highlights */}
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-4 sm:grid-cols-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Booking Status
            </span>
            <div>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Payment Status
            </span>
            <div>
              <PaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Fulfillment Status
            </span>
            <div>
              <FulfillmentStatusBadge status={booking.fulfillmentStatus} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
              Booking Source
            </span>
            <div className="flex flex-col gap-1 items-start">
              <BookingSourceBadge source={booking.source || (booking.agentId ? "AGENT" : "DIRECT")} />
              {booking.requiresApproval && (
                <DiscountApprovalStatusBadge status="PENDING" />
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Customer Information */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <User className="h-4 w-4 text-[#176779]" />
            1. Customer Information
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-[#74818A] block">Lead Traveler:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.customer?.name || parsedNotes.contact.name || "Unknown Customer"}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Email Address:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span>{booking.customer?.email || parsedNotes.contact.email || "Not provided"}</span>
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Phone Number:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span>{booking.customer?.phone || parsedNotes.contact.phone || "Not provided"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tour & Schedule Details */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Compass className="h-4 w-4 text-[#176779]" />
            2. Tour & Schedule
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-[#74818A] block">Tour Service:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.service?.name}
              </p>
              <span className="text-[10px] text-[#96A4AB] uppercase font-bold">
                {booking.service?.type || "TOUR"}
              </span>
            </div>
            <div>
              <span className="text-[#74818A] block">Travel Date:</span>
              <p className="font-semibold text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                {travelDateFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Guest Manifest */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Users className="h-4 w-4 text-[#176779]" />
            3. Guest Manifest & Headcount
          </h4>
          <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[#74818A] block">Total Guests:</span>
                <p className="font-bold text-sm text-[#18282A] mt-0.5">
                  {totalGuests} Guest{totalGuests > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-700">
                  <span className="font-semibold">{parsedNotes.guests.adults}</span> Adults
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-700">
                  <span className="font-semibold">{parsedNotes.guests.children}</span> Children
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-700">
                  <span className="font-semibold">{parsedNotes.guests.infants}</span> Infants
                </span>
              </div>
            </div>
            {parsedNotes.guests.rawText && (
              <p className="text-[11px] text-[#74818A] mt-2 border-t border-[#E5EAED] pt-2">
                Manifest text: {parsedNotes.guests.rawText}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 5: Pricing, Discount & Approval Breakdown */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <DollarSign className="h-4 w-4 text-[#176779]" />
            4. Pricing & Discount Breakdown
          </h4>
          <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[#74818A] block">Standard Base Price:</span>
                <p className="font-semibold text-[#18282A] mt-0.5" data-testid="admin-detail-standard-price">
                  {formattedBasePrice}
                </p>
              </div>

              {/* Requested Discount */}
              <div>
                <span className="text-[#74818A] block">Requested Discount:</span>
                {discountReq ? (
                  <div className="mt-0.5">
                    <p className="font-semibold text-amber-800" data-testid="admin-detail-requested-discount">
                      {discountReq.discountType === "PERCENTAGE"
                        ? `${discountReq.discountValue}% (${formatReportMoney(Number(discountReq.discountAmount), booking.currency)})`
                        : formatReportMoney(Number(discountReq.discountAmount), booking.currency)}
                    </p>
                    <span className="text-[10px] text-[#74818A]">Status: {discountReq.status}</span>
                  </div>
                ) : (
                  <p className="font-medium text-[#96A4AB] mt-0.5">None</p>
                )}
              </div>

              {/* Approved Discount */}
              <div>
                <span className="text-[#74818A] block">Approved Discount:</span>
                {discountReq && discountReq.status === "APPROVED" ? (
                  <div className="mt-0.5">
                    <p className="font-bold text-emerald-700" data-testid="admin-detail-approved-discount">
                      {(() => {
                        const approvedAmount =
                          discountReq.approvedDiscountAmount !== null && discountReq.approvedDiscountAmount !== undefined
                            ? Number(discountReq.approvedDiscountAmount)
                            : Number(discountReq.discountAmount);
                        const basePriceVal = Number(booking.basePrice) || 0;
                        if (discountReq.discountType === "PERCENTAGE" && basePriceVal > 0) {
                          const computedPct = Math.round((approvedAmount / basePriceVal) * 10000) / 100;
                          return `${computedPct}% (${formatReportMoney(approvedAmount, booking.currency)})`;
                        }
                        return formatReportMoney(approvedAmount, booking.currency);
                      })()}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700">APPROVED</span>
                  </div>
                ) : discountReq && discountReq.status === "REJECTED" ? (
                  <div className="mt-0.5">
                    <p className="font-semibold text-rose-600">0.00 (Declined)</p>
                    <span className="text-[10px] text-rose-600 font-medium">REJECTED</span>
                  </div>
                ) : discountReq ? (
                  <div className="mt-0.5">
                    <p className="font-medium text-amber-700 italic">Pending Review</p>
                  </div>
                ) : (
                  <p className="font-medium text-[#96A4AB] mt-0.5">None (Standard Rate)</p>
                )}
              </div>

              {/* Final Payable Amount */}
              <div>
                <span className="text-[#74818A] block font-semibold">Final Payable Amount:</span>
                <p className="font-bold text-sm text-[#18282A] mt-0.5" data-testid="admin-detail-final-price">
                  {formattedFinalPrice}
                </p>
              </div>
            </div>

            {discountReq?.reason && (
              <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-2.5 text-[11px]">
                <span className="font-semibold text-amber-900 block">Staff Justification / Reason:</span>
                <p className="text-amber-800 mt-0.5 whitespace-pre-wrap">{discountReq.reason}</p>
                {discountReq.adminNotes && (
                  <div className="mt-2 border-t border-amber-200/60 pt-1.5">
                    <span className="font-semibold text-amber-900">Admin Review Notes:</span>
                    <p className="text-amber-800 mt-0.5">{discountReq.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Creator & Assignment Attribution */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Briefcase className="h-4 w-4 text-[#176779]" />
            5. Creator & Assignment Attribution
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-[#74818A] block">Booking Creator:</span>
              <div className="mt-0.5">
                <p className="font-semibold text-[#18282A]">
                  {booking.createdBy?.name ||
                    (booking.source === "CUSTOMER"
                      ? booking.customer?.name || "Customer"
                      : "System / Direct")}
                </p>
                {booking.createdBy?.role && (
                  <span className="inline-block text-[10px] uppercase font-bold text-[#176779] bg-[#E8F8F5] px-1.5 py-0.2 rounded mt-0.5">
                    {booking.createdBy.role}
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[#74818A] block">Originating Agent:</span>
              {booking.agent ? (
                <div className="mt-0.5">
                  <p className="font-semibold text-[#18282A]">{booking.agent.name}</p>
                  <p className="text-[11px] text-purple-700 font-medium">
                    {booking.agent.agentProfile?.agencyName || "Independent Agent"}
                  </p>
                </div>
              ) : (
                <p className="font-medium text-[#96A4AB] italic mt-0.5">No Agent (Direct)</p>
              )}
            </div>
            <div>
              <span className="text-[#74818A] block">Assigned Operational Staff:</span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-[#176779]" />
                <span className="font-semibold text-[#18282A]">
                  {booking.assignedStaff?.name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: Payment & Invoice History */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <CreditCard className="h-4 w-4 text-[#176779]" />
            6. Payment Records & Invoicing
          </h4>
          <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 text-xs">
            {booking.payments && booking.payments.length > 0 ? (
              <div className="divide-y divide-[#E5EAED]">
                {booking.payments.map((p) => (
                  <div key={p.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#18282A]">{p.method} Payment</span>
                      {p.reference && (
                        <p className="text-[11px] font-mono text-[#74818A]">Ref: {p.reference}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#18282A]">
                        {formatReportMoney(Number(p.amount), p.currency)}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-semibold">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#74818A] italic">No payment transactions recorded yet.</p>
            )}
          </div>
        </div>

        {/* SECTION 8: Special Requests & Staff Notes */}
        {(parsedNotes.specialRequests || booking.internalNotes || booking.notes) && (
          <div className="space-y-2.5">
            <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <FileText className="h-4 w-4 text-[#176779]" />
              7. Special Requests & Notes
            </h4>
            <div className="space-y-2 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3.5 text-xs">
              {parsedNotes.specialRequests && (
                <div>
                  <span className="font-semibold text-[#18282A]">Client Special Requests:</span>
                  <p className="mt-0.5 text-[#556972] whitespace-pre-wrap">
                    {parsedNotes.specialRequests}
                  </p>
                </div>
              )}
              {booking.notes && !parsedNotes.specialRequests && (
                <div>
                  <span className="font-semibold text-[#18282A]">Customer Notes:</span>
                  <p className="mt-0.5 text-[#556972] whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}
              {booking.internalNotes && (
                <div className="border-t border-[#E5EAED] pt-2">
                  <span className="font-semibold text-[#18282A]">Internal Operational Notes:</span>
                  <p className="mt-0.5 text-[#556972] whitespace-pre-wrap">
                    {booking.internalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 9: Booking Audit Timeline */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <History className="h-4 w-4 text-[#176779]" />
            8. Audit & Activity Timeline
          </h4>
          <div className="rounded-xl border border-[#E5EAED] bg-white p-3.5 text-xs max-h-48 overflow-y-auto">
            {auditTimeline.length > 0 ? (
              <div className="space-y-2.5">
                {auditTimeline.map((item: BookingHistoryRecord) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-[11px]">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-[#176779] shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#18282A]">{item.action}</span>
                        <span className="text-[#96A4AB]">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="text-[#74818A]">
                        By: <span className="font-medium text-[#18282A]">{item.actorName || "System"}</span> (
                        {item.actorRole})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-[#96A4AB]">
                <Clock className="h-4 w-4 mx-auto mb-1 opacity-70" />
                <span>No audit events logged yet.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end border-t border-[#E5EAED] pt-4">
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
