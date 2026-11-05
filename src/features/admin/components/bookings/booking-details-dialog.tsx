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
import {
  Info,
  Calendar,
  User,
  Phone,
  Compass,
  FileText,
  UserCheck,
  Clock,
} from "lucide-react";

export interface BookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: OperationalBookingRecord | null;
}

export function BookingDetailsDialog({
  isOpen,
  onClose,
  booking,
}: BookingDetailsDialogProps) {
  if (!booking) return null;

  const travelDateFormatted = booking.availability?.date
    ? new Date(booking.availability.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      description="Operational record overview"
      size="lg"
    >
      <div className="space-y-5" data-testid="booking-details-dialog">
        {/* Verification Alert Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
          <p className="leading-relaxed">
            <span className="font-semibold">Operational Record:</span> Displays verified fields retrieved from the operational delivery queue. Billing invoices and payment receipts are tracked in the platform Payments section.
          </p>
        </div>

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
              Fulfillment Status
            </span>
            <div>
              <FulfillmentStatusBadge status={booking.fulfillmentStatus} />
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
        </div>

        {/* Section 1: Reservation & Tour */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Compass className="h-4 w-4 text-[#176779]" />
            Tour & Reservation Information
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-[#74818A]">Booking ID:</span>
              <p className="font-mono font-medium text-[#18282A] mt-0.5 select-all">
                {booking.id}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Tour Name:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.service.name}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Tour Type:</span>
              <p className="font-medium text-[#18282A] mt-0.5 uppercase tracking-wider">
                {booking.service.type}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Travel Date:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                {travelDateFormatted}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Created At:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#74818A]" />
                {createdAtFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Customer & Assignment */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <User className="h-4 w-4 text-[#176779]" />
            Customer & Assignment
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E5EAED] bg-white p-3.5 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-[#74818A]">Customer Name:</span>
              <p className="font-semibold text-[#18282A] mt-0.5">
                {booking.customer.name}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Customer Phone:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#74818A]" />
                {booking.customer.phone || "Not provided"}
              </p>
            </div>
            <div>
              <span className="text-[#74818A]">Assigned Staff:</span>
              <p className="font-medium text-[#18282A] mt-0.5 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-[#176779]" />
                {booking.assignedStaff ? booking.assignedStaff.name : "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Instructions */}
        {(booking.notes || booking.internalNotes) && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <FileText className="h-4 w-4 text-[#176779]" />
              Notes & Comments
            </h4>
            <div className="space-y-2 rounded-xl border border-[#E5EAED] bg-[#FAFCFC] p-3.5 text-xs">
              {booking.notes && (
                <div>
                  <span className="font-semibold text-[#18282A]">Customer Notes:</span>
                  <p className="mt-0.5 text-[#74818A] whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}
              {booking.internalNotes && (
                <div className={booking.notes ? "border-t border-[#E5EAED] pt-2" : ""}>
                  <span className="font-semibold text-[#18282A]">Internal Staff Notes:</span>
                  <p className="mt-0.5 text-[#74818A] whitespace-pre-wrap">
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
