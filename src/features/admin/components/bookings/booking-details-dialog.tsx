"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from "./booking-status-badges";
import type { OperationalBookingRecord } from "../../types/admin-bookings";
import { formatReportMoney } from "../../utils/format";
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

  const amountNum = Number(booking.finalPrice ?? booking.basePrice ?? 0);
  const formattedAmount = formatReportMoney(amountNum, booking.currency || "USD");

  const totalGuests =
    parsedNotes.guests.adults +
    parsedNotes.guests.children +
    parsedNotes.guests.infants;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      description={`Reference #${booking.id}`}
      size="lg"
    >
      <div className="space-y-5" data-testid="booking-details-dialog">
        {/* Status Highlights */}
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-4 sm:grid-cols-3">
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
        </div>

        {/* Section 1: Customer Information */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <User className="h-4 w-4 text-[#176779]" />
            Customer Information
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-[#74818A] block">Lead Traveler:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.customer?.name || parsedNotes.contact.name || "Unknown Customer"}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Email:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span>{booking.customer?.email || parsedNotes.contact.email || "Not provided"}</span>
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Phone:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                <span>{booking.customer?.phone || parsedNotes.contact.phone || "Not provided"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Tour & Schedule */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Compass className="h-4 w-4 text-[#176779]" />
            Tour & Schedule
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-[#74818A] block">Tour Name:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.service?.name}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Travel Date:</span>
              <p className="font-semibold text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                {travelDateFormatted}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Tour Type:</span>
              <p className="font-medium text-[#18282A] mt-0.5 uppercase tracking-wider">
                {booking.service?.type || "TOUR"}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Booking Created:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#74818A]" />
                {createdAtFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Guest Quantities & Pricing */}
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Users className="h-4 w-4 text-[#176779]" />
            Guest Quantities & Payment
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-[#74818A] block">Guests:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {parsedNotes.guests.rawText || `${totalGuests} Guest${totalGuests > 1 ? "s" : ""}`}
              </p>
              <p className="text-[11px] text-[#74818A] mt-0.5">
                {parsedNotes.guests.adults} Adults, {parsedNotes.guests.children} Children, {parsedNotes.guests.infants} Infants
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Total Amount:</span>
              <p className="font-bold text-[#18282A] text-sm mt-0.5">
                {formattedAmount}
              </p>
            </div>
            <div>
              <span className="text-[#74818A] block">Staff Assignment:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-[#176779]" />
                {booking.assignedStaff?.name || "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Special Requests & Staff Notes */}
        {(parsedNotes.specialRequests || booking.internalNotes || booking.notes) && (
          <div className="space-y-2.5">
            <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <FileText className="h-4 w-4 text-[#176779]" />
              Special Requests & Notes
            </h4>
            <div className="space-y-2 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3.5 text-xs">
              {parsedNotes.specialRequests && (
                <div>
                  <span className="font-semibold text-[#18282A]">Special Requests:</span>
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
                  <span className="font-semibold text-[#18282A]">Internal Staff Notes:</span>
                  <p className="mt-0.5 text-[#556972] whitespace-pre-wrap">
                    {booking.internalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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