"use client";

import * as React from "react";
import {
  Calendar,
  Phone,
  Compass,
  UserCheck,
  CalendarX,
  Copy,
  Check,
  Users,
} from "lucide-react";
import { formatDate, formatReportMoney } from "../../utils/format";
import type { OperationalBookingRecord } from "../../types/admin-bookings";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
} from "./booking-status-badges";
import { BookingActionsMenu } from "./booking-actions-menu";

export interface BookingsTableProps {
  bookings: OperationalBookingRecord[];
  isLoading?: boolean;
  onViewDetails: (booking: OperationalBookingRecord) => void;
  onAssignStaff: (booking: OperationalBookingRecord) => void;
  onUpdateFulfillment: (booking: OperationalBookingRecord) => void;
  onReviewPriceApproval?: (booking: OperationalBookingRecord) => void;
  onConfirmPending?: (booking: OperationalBookingRecord) => void;
  onRejectPending?: (booking: OperationalBookingRecord) => void;
}

function parseGuestsSummary(notes?: string | null): string {
  if (!notes) return "1 Guest";
  const match = notes.match(/Guests:\s*([^|]+)/i);
  if (match) {
    return match[1].trim();
  }
  return "1 Guest";
}

export function BookingsTable({
  bookings,
  isLoading = false,
  onViewDetails,
  onAssignStaff,
  onUpdateFulfillment,
  onReviewPriceApproval,
  onConfirmPending,
  onRejectPending,
}: BookingsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-t-2xl">
        <table
          className="w-full text-left border-collapse text-xs"
          data-testid="admin-bookings-table-loading"
        >
          <thead>
            <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
              <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">Booking ID</th>
              <th scope="col" className="min-w-[170px] px-4 py-3.5 font-semibold">Customer</th>
              <th scope="col" className="min-w-[180px] px-4 py-3.5 font-semibold">Tour / Service</th>
              <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">Travel Date</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Guests</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Amount</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Payment Status</th>
              <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">Booking Status</th>
              <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">Staff Assignment</th>
              <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAED] bg-white">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3.5"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-36 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-slate-200" /></td>
                <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                <td className="px-4 py-3.5 text-right"><div className="h-7 w-7 rounded bg-slate-200 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-t-2xl border-b border-[#E5EAED]"
        data-testid="admin-bookings-empty"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F7F8] text-[#176779] shadow-inner mb-4">
          <CalendarX className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-semibold text-[#18282A]">No bookings found</h3>
        <p className="mt-1 max-w-sm text-xs text-[#74818A]">
          No customer bookings match the selected status or filters. Try adjusting your search query or status selection.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-t-2xl">
      <table
        data-testid="admin-bookings-table"
        className="w-full text-left border-collapse text-xs"
      >
        <thead>
          <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">
              Booking Reference
            </th>
            <th scope="col" className="min-w-[170px] px-4 py-3.5 font-semibold">
              Customer
            </th>
            <th scope="col" className="min-w-[180px] px-4 py-3.5 font-semibold">
              Tour
            </th>
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">
              Travel Date
            </th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">
              Guest Count
            </th>
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">
              Amount
            </th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">
              Payment Status
            </th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">
              Booking Status
            </th>
            <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">
              Staff Assignment
            </th>
            <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAED] bg-white">
          {bookings.map((booking) => {
            const isCopied = copiedId === booking.id;
            const shortId = booking.id.length > 8 ? `${booking.id.slice(0, 8)}…` : booking.id;
            const guestText = parseGuestsSummary(booking.notes);
            const amountNum = Number(booking.finalPrice ?? booking.basePrice ?? 0);
            const formattedPrice = formatReportMoney(amountNum, booking.currency || "USD");

            return (
              <tr
                key={booking.id}
                data-testid={`booking-row-${booking.id}`}
                className="transition-colors hover:bg-[#F8FAFB]/80"
              >
                {/* Booking Reference */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#18282A]">
                    <button
                      type="button"
                      onClick={() => onViewDetails(booking)}
                      className="hover:text-[#176779] transition-colors cursor-pointer text-left font-semibold"
                      title={`Click to view details for ${booking.id}`}
                    >
                      #{shortId}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, booking.id)}
                      className="text-[#96A4AB] hover:text-[#176779] transition-colors p-0.5 rounded cursor-pointer"
                      title="Copy full Booking ID"
                      aria-label="Copy full Booking ID"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="max-w-[160px]">
                    <p
                      className="font-medium text-[#18282A] truncate"
                      title={booking.customer?.name || "Unknown Customer"}
                    >
                      {booking.customer?.name || "Unknown Customer"}
                    </p>
                    {booking.customer?.email && (
                      <p className="text-[11px] text-[#74818A] truncate mt-0.5" title={booking.customer.email}>
                        {booking.customer.email}
                      </p>
                    )}
                    {booking.customer?.phone ? (
                      <p className="flex items-center gap-1 text-[11px] text-[#74818A] truncate mt-0.5">
                        <Phone className="h-3 w-3 shrink-0 text-[#96A4AB]" />
                        <span>{booking.customer.phone}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#B0BCC2] italic mt-0.5">No phone</p>
                    )}
                  </div>
                </td>

                {/* Tour */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="max-w-[180px]">
                    <p
                      className="font-medium text-[#18282A] truncate"
                      title={booking.service?.name || "Unknown Service"}
                    >
                      {booking.service?.name || "Unknown Service"}
                    </p>
                    {booking.service?.type && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-[#176779] bg-[#E8F8F5] px-1.5 py-0.5 rounded mt-0.5">
                        <Compass className="h-2.5 w-2.5" />
                        {booking.service.type}
                      </span>
                    )}
                  </div>
                </td>

                {/* Travel Date */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-1.5 text-[#18282A] whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                    <span>
                      {booking.availability?.date
                        ? formatDate(booking.availability.date)
                        : "Open Date"}
                    </span>
                  </div>
                </td>

                {/* Guest Count */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-1.5 text-[#18282A] whitespace-nowrap">
                    <Users className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                    <span className="truncate max-w-[100px]" title={guestText}>
                      {guestText}
                    </span>
                  </div>
                </td>

                {/* Booking Amount and Currency */}
                <td className="px-4 py-3.5 align-middle">
                  <span className="font-semibold text-[#18282A] whitespace-nowrap">
                    {formattedPrice}
                  </span>
                </td>

                {/* Payment Status */}
                <td className="px-4 py-3.5 align-middle">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </td>

                {/* Booking Status */}
                <td className="px-4 py-3.5 align-middle">
                  <BookingStatusBadge status={booking.status} />
                </td>

                {/* Staff Assignment */}
                <td className="px-4 py-3.5 align-middle">
                  {booking.assignedStaff?.name ? (
                    <div className="flex items-center gap-1.5 text-[#18282A]">
                      <UserCheck className="h-3.5 w-3.5 text-[#176779] shrink-0" />
                      <span className="truncate max-w-[120px]" title={booking.assignedStaff.name}>
                        {booking.assignedStaff.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#B0BCC2] italic">Unassigned</span>
                  )}
                </td>

                {/* Actions Dropdown */}
                <td className="px-4 py-3.5 align-middle text-right">
                  <BookingActionsMenu
                    booking={booking}
                    onViewDetails={onViewDetails}
                    onAssignStaff={onAssignStaff}
                    onUpdateFulfillment={onUpdateFulfillment}
                    onReviewPriceApproval={onReviewPriceApproval}
                    onConfirmPending={onConfirmPending}
                    onRejectPending={onRejectPending}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}