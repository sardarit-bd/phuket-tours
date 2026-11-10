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
} from "lucide-react";
import { formatDate, formatReportMoney } from "../../utils/format";
import type { OperationalBookingRecord, AdminStaffMember } from "../../types/admin-bookings";
import {
  BookingStatusBadge,
  FulfillmentStatusBadge,
  PaymentStatusBadge,
  BookingSourceBadge,
} from "./booking-status-badges";
import { BookingActionsMenu } from "./booking-actions-menu";

export interface BookingsTableProps {
  bookings: OperationalBookingRecord[];
  staffMembers?: AdminStaffMember[];
  isLoading?: boolean;
  onViewDetails: (booking: OperationalBookingRecord) => void;
  onViewHistory?: (booking: OperationalBookingRecord) => void;
  onAssignStaff: (booking: OperationalBookingRecord) => void;
  onUpdateFulfillment: (booking: OperationalBookingRecord) => void;
  onReviewPriceApproval?: (booking: OperationalBookingRecord) => void;
  onConfirmPending?: (booking: OperationalBookingRecord) => void;
  onRejectPending?: (booking: OperationalBookingRecord) => void;
}

function getStaffInitials(name?: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  staffMembers = [],
  isLoading = false,
  onViewDetails,
  onViewHistory,
  onAssignStaff,
  onUpdateFulfillment,
  onReviewPriceApproval,
  onConfirmPending,
  onRejectPending,
}: BookingsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Map staffMembers by id for fallback resolution
  const staffMemberMap = React.useMemo(() => {
    const map = new Map<string, AdminStaffMember>();
    for (const s of staffMembers) {
      map.set(s.id, s);
    }
    return map;
  }, [staffMembers]);

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
          className="w-full table-fixed text-left border-collapse text-xs"
          data-testid="admin-bookings-table-loading"
        >
          <thead>
            <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
              <th scope="col" className="w-[110px] px-3 py-3 font-semibold">Booking Reference</th>
              <th scope="col" className="w-[155px] px-3 py-3 font-semibold">Customer</th>
              <th scope="col" className="w-[170px] px-3 py-3 font-semibold">Tour</th>
              <th scope="col" className="w-[130px] px-3 py-3 font-semibold">Agent / Source</th>
              <th scope="col" className="w-[105px] px-3 py-3 font-semibold">Travel Date</th>
              <th scope="col" className="w-[95px] px-3 py-3 font-semibold">Amount</th>
              <th scope="col" className="w-[105px] px-3 py-3 font-semibold">Payment Status</th>
              <th scope="col" className="w-[105px] px-3 py-3 font-semibold">Booking Status</th>
              <th scope="col" className="w-[130px] px-3 py-3 font-semibold">Staff Assignment</th>
              <th scope="col" className="w-[45px] px-2 py-3 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAED] bg-white">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-3 py-3"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-18 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-5 w-16 rounded-full bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-5 w-18 rounded-full bg-slate-200" /></td>
                <td className="px-3 py-3"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                <td className="px-2 py-3 text-right"><div className="h-7 w-7 rounded bg-slate-200 ml-auto" /></td>
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
        className="w-full table-fixed text-left border-collapse text-xs"
      >
        <thead>
          <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
            <th scope="col" className="w-[110px] px-3 py-3 font-semibold">
              Booking Reference
            </th>
            <th scope="col" className="w-[155px] px-3 py-3 font-semibold">
              Customer
            </th>
            <th scope="col" className="w-[170px] px-3 py-3 font-semibold">
              Tour
            </th>
            <th scope="col" className="w-[130px] px-3 py-3 font-semibold">
              Agent / Source
            </th>
            <th scope="col" className="w-[105px] px-3 py-3 font-semibold">
              Travel Date
            </th>
            <th scope="col" className="w-[95px] px-3 py-3 font-semibold">
              Amount
            </th>
            <th scope="col" className="w-[105px] px-3 py-3 font-semibold">
              Payment Status
            </th>
            <th scope="col" className="w-[105px] px-3 py-3 font-semibold">
              Booking Status
            </th>
            <th scope="col" className="w-[130px] px-3 py-3 font-semibold">
              Staff Assignment
            </th>
            <th scope="col" className="w-[45px] px-2 py-3 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAED] bg-white">
          {bookings.map((booking) => {
            const isCopied = copiedId === booking.id;
            const shortId = booking.id.length > 8 ? `${booking.id.slice(0, 8)}…` : booking.id;
            const amountNum = Number(booking.finalPrice ?? booking.basePrice ?? 0);
            const formattedPrice = formatReportMoney(amountNum, booking.currency || "USD");

            // Resolve assigned staff from relation or fallback to staffMemberMap by ID
            const assignedStaffName =
              booking.assignedStaff?.name ||
              (booking.assignedStaffId ? staffMemberMap.get(booking.assignedStaffId)?.name : null);
            const isAssigned = Boolean(booking.assignedStaffId || assignedStaffName);

            return (
              <tr
                key={booking.id}
                data-testid={`booking-row-${booking.id}`}
                className="transition-colors hover:bg-[#F8FAFB]/80"
              >
                {/* 1. Booking Reference */}
                <td className="px-3 py-3 align-middle">
                  <div className="flex items-center gap-1 font-mono text-[11px] font-medium text-[#18282A]">
                    <button
                      type="button"
                      onClick={() => onViewDetails(booking)}
                      className="hover:text-[#176779] transition-colors cursor-pointer text-left font-semibold truncate max-w-[70px]"
                      title={`Click to view details for ${booking.id}`}
                    >
                      #{shortId}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, booking.id)}
                      className="text-[#96A4AB] hover:text-[#176779] transition-colors p-0.5 rounded cursor-pointer shrink-0"
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

                {/* 2. Customer */}
                <td className="px-3 py-3 align-middle">
                  <div className="min-w-0 pr-1">
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
                        <span className="truncate">{booking.customer.phone}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#B0BCC2] italic mt-0.5">No phone</p>
                    )}
                  </div>
                </td>

                {/* 3. Tour */}
                <td className="px-3 py-3 align-middle">
                  <div className="min-w-0 pr-1">
                    <p
                      className="font-medium text-[#18282A] truncate"
                      title={booking.service?.name || "Unknown Service"}
                    >
                      {booking.service?.name || "Unknown Service"}
                    </p>
                    {booking.service?.type && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-[#176779] bg-[#E8F8F5] px-1.5 py-0.2 rounded mt-0.5 shrink-0">
                        <Compass className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{booking.service.type}</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Agent / Source */}
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                    <div className="flex items-center gap-1">
                      <BookingSourceBadge source={booking.source || (booking.agentId ? "AGENT" : "DIRECT")} />
                    </div>
                    {booking.agent ? (
                      <div className="text-[11px] leading-tight min-w-0 mt-0.5">
                        <span className="font-medium text-[#18282A] truncate block" title={booking.agent.name}>
                          {booking.agent.name}
                        </span>
                        {booking.agent.agentProfile?.agencyName && (
                          <span
                            className="inline-block text-[10px] text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-semibold truncate max-w-full mt-0.5"
                            title={booking.agent.agentProfile.agencyName}
                          >
                            {booking.agent.agentProfile.agencyName}
                          </span>
                        )}
                      </div>
                    ) : booking.createdBy && booking.source !== "CUSTOMER" ? (
                      <span className="text-[11px] text-[#74818A] truncate mt-0.5" title={`Created by ${booking.createdBy.name} (${booking.createdBy.role})`}>
                        By: {booking.createdBy.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#96A4AB] italic mt-0.5">Direct Booking</span>
                    )}
                  </div>
                </td>

                {/* 5. Travel Date */}
                <td className="px-3 py-3 align-middle">
                  <div className="flex items-center gap-1 text-[#18282A] whitespace-nowrap">
                    <Calendar className="h-3 w-3 text-[#74818A] shrink-0" />
                    <span className="text-[11px]">
                      {booking.availability?.date
                        ? formatDate(booking.availability.date)
                        : "Open Date"}
                    </span>
                  </div>
                </td>

                {/* 6. Amount */}
                <td className="px-3 py-3 align-middle">
                  <span className="font-semibold text-[#18282A] whitespace-nowrap text-xs">
                    {formattedPrice}
                  </span>
                </td>

                {/* 7. Payment Status */}
                <td className="px-3 py-3 align-middle">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </td>

                {/* 8. Booking Status */}
                <td className="px-3 py-3 align-middle">
                  <BookingStatusBadge status={booking.status} />
                </td>

                {/* 9. Staff Assignment */}
                <td className="px-3 py-3 align-middle">
                  {isAssigned ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#176779]/10 text-[10px] font-bold text-[#176779]"
                        title={assignedStaffName || "Assigned Staff"}
                      >
                        {getStaffInitials(assignedStaffName)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="truncate text-xs font-medium text-[#18282A]"
                          title={assignedStaffName || "Assigned Staff"}
                          data-testid={`assigned-staff-name-${booking.id}`}
                        >
                          {assignedStaffName || "Staff Member"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignStaff(booking);
                          }}
                          className="text-[10px] font-medium text-[#176779] hover:underline cursor-pointer text-left"
                          title="Reassign staff member"
                          data-testid={`reassign-staff-${booking.id}`}
                        >
                          Reassign
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#B0BCC2] italic text-xs">Unassigned</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignStaff(booking);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#B0BCC2] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#74818A] hover:border-[#176779] hover:text-[#176779] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
                        title="Assign a staff member"
                        data-testid={`quick-assign-staff-${booking.id}`}
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>Assign</span>
                      </button>
                    </div>
                  )}
                </td>

                {/* 10. Actions */}
                <td className="px-2 py-3 align-middle text-right">
                  <BookingActionsMenu
                    booking={booking}
                    onViewDetails={onViewDetails}
                    onViewHistory={onViewHistory}
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