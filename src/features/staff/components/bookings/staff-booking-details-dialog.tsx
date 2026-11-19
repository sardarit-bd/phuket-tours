"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StaffBookingRecord } from "@/features/admin/types/admin-bookings";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
  BookingSourceBadge,
} from "@/features/admin/components/bookings/booking-status-badges";
import { DiscountApprovalStatusBadge } from "./discount-approval-status-badge";
import { formatReportMoney, formatDate } from "@/features/admin/utils/format";
import { useGetStaffBookingHistoryQuery } from "@/features/admin/api/admin-api";
import {
  Calendar,
  User,
  Phone,
  Mail,
  Compass,
  FileText,
  Clock,
  Users,
  MapPin,
  Activity,
  Tag,
  BadgePercent,
  CheckCircle2,
  DollarSign,
  Briefcase,
  History,
} from "lucide-react";

export interface StaffBookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: StaffBookingRecord | null;
  onUpdateStatus?: (booking: StaffBookingRecord) => void;
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
  pickupLocation: string | null;
  specialRequests: string | null;
}

function parseStaffNotes(rawNotes?: string | null): ParsedNotes {
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
    pickupLocation: null,
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
    } else if (/^Pickup:\s*/i.test(trimmed) || /^Hotel:\s*/i.test(trimmed)) {
      result.pickupLocation = trimmed.replace(/^(Pickup|Hotel):\s*/i, "").trim();
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

export function StaffBookingDetailsDialog({
  isOpen,
  onClose,
  booking,
  onUpdateStatus,
}: StaffBookingDetailsDialogProps) {
  const { data: historyResponse } = useGetStaffBookingHistoryQuery(
    { bookingId: booking?.id || "" },
    { skip: !booking?.id || !isOpen }
  );

  if (!booking) return null;

  const parsedNotes = parseStaffNotes(booking.notes);
  const discountReq = booking.discountRequests?.[0];
  const auditTimeline = historyResponse?.data?.items || [];

  const basePriceNum =
    booking.basePrice !== null && booking.basePrice !== undefined && booking.basePrice !== ""
      ? Number(booking.basePrice)
      : null;
  const finalPriceNum =
    booking.finalPrice !== null && booking.finalPrice !== undefined && booking.finalPrice !== ""
      ? Number(booking.finalPrice)
      : basePriceNum;

  const formattedBasePrice = formatReportMoney(basePriceNum, booking.currency);
  const formattedFinalPrice = formatReportMoney(finalPriceNum, booking.currency);

  const travelDateFormatted = booking.availability?.date
    ? new Date(booking.availability.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : parsedNotes.travelDate
    ? parsedNotes.travelDate
    : "Open Date";

  const createdAtFormatted = new Date(booking.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const guestCountSummary = parsedNotes.guests.rawText || "1 Adult";
  const contactName = parsedNotes.contact.name || booking.customer?.name || "Customer";
  const contactPhone = parsedNotes.contact.phone || booking.customer?.phone || null;
  const contactEmail = parsedNotes.contact.email || booking.customer?.email || null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking Details #${booking.id.slice(0, 8)}`}
      description="Tour fulfillment and operational delivery sheet."
      size="lg"
    >
      <div className="space-y-6 pt-2" data-testid="staff-booking-details-modal">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5EAED] bg-[#F5F8F9] p-4">
          <div>
            <span className="text-xs text-[#74818A]">Booking Reference</span>
            <p className="font-mono text-sm font-bold text-[#18282A]">{booking.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <FulfillmentStatusBadge status={booking.fulfillmentStatus} />
            <PaymentStatusBadge status={booking.paymentStatus} />
            {booking.requiresApproval && (
              <DiscountApprovalStatusBadge status="PENDING" />
            )}
          </div>
        </div>

        {/* Section 1: Tour Information & Schedule */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
            <Compass className="h-4 w-4 text-[#176779]" />
            <span>Tour & Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-[#74818A]">Tour Name</span>
              <p className="font-semibold text-[#18282A] text-sm mt-0.5">
                {booking.service?.name || "Tour Service"}
              </p>
              {booking.service?.type && (
                <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-[#176779] bg-[#E8F8F5] px-2 py-0.5 rounded">
                  {booking.service.type}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[#74818A] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                  <span>Travel Date</span>
                </span>
                <p className="font-semibold text-[#18282A] mt-0.5">{travelDateFormatted}</p>
              </div>

              <div>
                <span className="text-[#74818A] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#176779]" />
                  <span>Booked On</span>
                </span>
                <p className="text-[#18282A] mt-0.5">{createdAtFormatted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Guest Information & Lead Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guest Count Breakdown */}
          <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
              <Users className="h-4 w-4 text-[#176779]" />
              <span>Guest Information</span>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between border-b border-[#F0F3F4] pb-2">
                <span className="text-[#74818A]">Total Party:</span>
                <span className="font-semibold text-[#18282A]">{guestCountSummary}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#F8FAFB] p-2 rounded-lg border border-[#E5EAED]">
                  <p className="text-[10px] text-[#74818A] uppercase">Adults</p>
                  <p className="text-sm font-bold text-[#18282A]">{parsedNotes.guests.adults}</p>
                </div>
                <div className="bg-[#F8FAFB] p-2 rounded-lg border border-[#E5EAED]">
                  <p className="text-[10px] text-[#74818A] uppercase">Children</p>
                  <p className="text-sm font-bold text-[#18282A]">{parsedNotes.guests.children}</p>
                </div>
                <div className="bg-[#F8FAFB] p-2 rounded-lg border border-[#E5EAED]">
                  <p className="text-[10px] text-[#74818A] uppercase">Infants</p>
                  <p className="text-sm font-bold text-[#18282A]">{parsedNotes.guests.infants}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Traveler Contact */}
          <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
              <User className="h-4 w-4 text-[#176779]" />
              <span>Lead Guest Contact</span>
            </div>

            <div className="space-y-2.5 text-xs pt-1">
              <div>
                <span className="text-[#74818A]">Lead Name</span>
                <p className="font-semibold text-[#18282A] mt-0.5">{contactName}</p>
              </div>

              <div>
                <span className="text-[#74818A]">Contact Phone</span>
                {contactPhone ? (
                  <p className="flex items-center gap-1.5 font-medium text-[#18282A] mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-[#176779]" />
                    <a href={`tel:${contactPhone}`} className="hover:underline text-[#176779]">
                      {contactPhone}
                    </a>
                  </p>
                ) : (
                  <p className="text-[#B0BCC2] italic mt-0.5">Not provided</p>
                )}
              </div>

              {contactEmail && (
                <div>
                  <span className="text-[#74818A]">Email</span>
                  <p className="flex items-center gap-1.5 text-[#18282A] mt-0.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-[#74818A]" />
                    <span>{contactEmail}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Discount Breakdown */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3" data-testid="staff-pricing-breakdown-section">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-[#176779]" />
            <span>Pricing & Discount Breakdown</span>
          </div>

          <div className="space-y-3 text-xs pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F8FAFB] p-3 rounded-xl border border-[#E5EAED]">
              <div>
                <span className="text-[#74818A] block text-[11px]">1. Standard Retail Price:</span>
                <p className="font-semibold text-[#18282A] mt-0.5" data-testid="detail-standard-price">
                  {formattedBasePrice}
                </p>
              </div>

              <div>
                <span className="text-[#74818A] block text-[11px]">Payment Status:</span>
                <div className="mt-1">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>

              <div>
                <span className="text-[#74818A] block text-[11px] font-semibold">Final Payable Price:</span>
                <p className="font-bold text-sm text-[#18282A] mt-0.5" data-testid="detail-final-price">
                  {formattedFinalPrice}
                </p>
              </div>
            </div>

            {/* Discount Breakdown (when present) */}
            {discountReq ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-3" data-testid="detail-discount-breakdown">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Tag className="h-3.5 w-3.5 text-amber-700" />
                    <span>Discount Authorization Breakdown</span>
                  </div>
                  <DiscountApprovalStatusBadge status={discountReq.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Requested Discount */}
                  <div className="rounded-lg bg-white p-3 border border-amber-200/80 space-y-1.5" data-testid="detail-requested-discount-box">
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                      Staff Requested Discount
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74818A]">Type:</span>
                      <span className="font-medium text-[#18282A]">{discountReq.discountType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74818A]">Value:</span>
                      <span className="font-semibold text-amber-900" data-testid="detail-requested-value">
                        {discountReq.discountType === "PERCENTAGE"
                          ? `${discountReq.discountValue}%`
                          : formatReportMoney(Number(discountReq.discountValue), booking.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-[#F0F3F4] pt-1">
                      <span className="text-[#74818A]">Deduction Amount:</span>
                      <span className="font-bold text-rose-700" data-testid="detail-requested-amount">
                        -{formatReportMoney(Number(discountReq.discountAmount), booking.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74818A]">Proposed Final Price:</span>
                      <span className="font-medium text-[#18282A]" data-testid="detail-proposed-final-price">
                        {formatReportMoney(Number(discountReq.proposedFinalPrice), booking.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Approved Discount */}
                  <div className="rounded-lg bg-white p-3 border border-emerald-200 space-y-1.5" data-testid="detail-approved-discount-box">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                      Admin Approved Discount
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74818A]">Approval Status:</span>
                      <span className="font-bold text-xs text-emerald-700">
                        {discountReq.status}
                      </span>
                    </div>
                    {discountReq.status === "APPROVED" ? (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#74818A]">Approved Type:</span>
                          <span className="font-medium text-[#18282A]">{discountReq.discountType}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#74818A]">Approved Value:</span>
                          <span className="font-semibold text-emerald-800" data-testid="detail-approved-value">
                            {(() => {
                              const approvedAmount =
                                discountReq.approvedDiscountAmount !== null && discountReq.approvedDiscountAmount !== undefined
                                  ? Number(discountReq.approvedDiscountAmount)
                                  : Number(discountReq.discountAmount);
                              const basePriceVal = Number(booking.basePrice) || 0;
                              if (discountReq.discountType === "PERCENTAGE" && basePriceVal > 0) {
                                const computedPct = Math.round((approvedAmount / basePriceVal) * 10000) / 100;
                                return `${computedPct}%`;
                              }
                              return formatReportMoney(approvedAmount, booking.currency);
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#74818A]">Approved Deduction:</span>
                          <span className="font-bold text-emerald-700" data-testid="detail-approved-amount">
                            {(() => {
                              const approvedAmount =
                                discountReq.approvedDiscountAmount !== null && discountReq.approvedDiscountAmount !== undefined
                                  ? Number(discountReq.approvedDiscountAmount)
                                  : Number(discountReq.discountAmount);
                              const basePriceVal = Number(booking.basePrice) || 0;
                              if (discountReq.discountType === "PERCENTAGE" && basePriceVal > 0) {
                                const computedPct = Math.round((approvedAmount / basePriceVal) * 10000) / 100;
                                return `-${computedPct}% (${formatReportMoney(approvedAmount, booking.currency)})`;
                              }
                              return `-${formatReportMoney(approvedAmount, booking.currency)}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-[#F0F3F4] pt-1">
                          <span className="text-[#74818A] font-semibold">Authoritative Final Price:</span>
                          <span className="font-bold text-sm text-[#18282A]" data-testid="detail-approved-final-price">
                            {formatReportMoney(
                              discountReq.approvedFinalPrice !== null && discountReq.approvedFinalPrice !== undefined
                                ? Number(discountReq.approvedFinalPrice)
                                : finalPriceNum,
                              booking.currency
                            )}
                          </span>
                        </div>
                      </>
                    ) : discountReq.status === "REJECTED" ? (
                      <div className="text-xs text-rose-700 font-medium py-2">
                        {discountReq.rejectionReason || "Discount request was declined by administrator. Retail standard price applies."}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 italic py-2">
                        Awaiting Admin review and decision.
                      </div>
                    )}
                  </div>
                </div>

                {/* Justification and Admin Review Notes */}
                {(discountReq.reason || discountReq.adminNotes) && (
                  <div className="space-y-2 pt-1">
                    {discountReq.reason && (
                      <div className="rounded-lg bg-white/80 p-2.5 border border-amber-200/60 text-xs">
                        <span className="text-[#74818A] font-semibold block text-[11px]">Staff Discount Reason:</span>
                        <p className="text-[#18282A] mt-0.5 whitespace-pre-wrap">{discountReq.reason}</p>
                      </div>
                    )}
                    {discountReq.adminNotes && (
                      <div className="rounded-lg bg-white/80 p-2.5 border border-amber-200/60 text-xs">
                        <span className="text-[#74818A] font-semibold block text-[11px]">Admin Review Notes:</span>
                        <p className="text-[#18282A] mt-0.5 whitespace-pre-wrap">{discountReq.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5EAED] bg-[#FAFCFC] p-3 text-center text-xs text-[#74818A]">
                Standard booking rate applied. No custom discount was requested or attached.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Attribution & Ownership */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
            <Briefcase className="h-4 w-4 text-[#176779]" />
            <span>Attribution & Operations Assignment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <span className="text-[#74818A] block">Booking Creator:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.createdBy?.name || "Staff / Direct Portal"}
              </p>
              {booking.createdBy?.role && (
                <span className="inline-block text-[10px] uppercase font-bold text-[#176779] bg-[#E8F8F5] px-1.5 py-0.2 rounded mt-0.5">
                  {booking.createdBy.role}
                </span>
              )}
            </div>

            <div>
              <span className="text-[#74818A] block">Assigned Operational Staff:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.assignedStaff?.name || "Unassigned"}
              </p>
            </div>

            <div>
              <span className="text-[#74818A] block">Originating Source:</span>
              <div className="mt-1">
                <BookingSourceBadge source={booking.source || "DIRECT"} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Pickup Location & Special Instructions */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-[#176779]" />
            <span>Pickup & Special Instructions</span>
          </div>

          <div className="space-y-3 text-xs pt-1">
            {parsedNotes.pickupLocation && (
              <div className="bg-[#E8F8F5]/60 border border-[#176779]/20 rounded-lg p-3">
                <span className="font-semibold text-[#176779] block mb-0.5">Hotel / Pickup Point:</span>
                <p className="text-[#18282A]">{parsedNotes.pickupLocation}</p>
              </div>
            )}

            {parsedNotes.specialRequests ? (
              <div className="bg-[#F8FAFB] border border-[#E5EAED] rounded-lg p-3">
                <span className="font-semibold text-[#18282A] block mb-0.5">Special Requests / Dietary:</span>
                <p className="text-[#74818A] leading-relaxed">{parsedNotes.specialRequests}</p>
              </div>
            ) : (
              <p className="text-[#B0BCC2] italic">No special instructions or dietary requests specified.</p>
            )}

            {booking.internalNotes && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
                <span className="font-semibold text-amber-900 block mb-0.5">Admin Internal Handover Note:</span>
                <p className="text-amber-800 leading-relaxed">{booking.internalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Audit & Activity History */}
        {auditTimeline.length > 0 && (
          <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18282A] uppercase tracking-wider">
              <History className="h-4 w-4 text-[#176779]" />
              <span>Activity & Audit History</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pt-1">
              {auditTimeline.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between text-[11px] border-b border-[#F0F3F4] pb-1.5 last:border-0">
                  <div>
                    <span className="font-semibold text-[#18282A]">{item.action}</span>
                    <p className="text-[#74818A]">
                      By: {item.actorName || "User"} ({item.actorRole})
                    </p>
                  </div>
                  <span className="text-[#96A4AB] text-[10px]">{formatDate(item.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E5EAED] pt-4">
          <span className="text-[11px] text-[#74818A]">
            Staff Operations View • Confidential Customer Data
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
            {onUpdateStatus && booking.fulfillmentStatus !== "FULFILLED" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onUpdateStatus(booking);
                }}
                className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
                data-testid="staff-details-update-status-btn"
              >
                <Activity className="h-3.5 w-3.5 mr-1.5" />
                Update Fulfillment Status
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
