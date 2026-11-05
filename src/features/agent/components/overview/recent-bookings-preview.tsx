"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User, Compass } from "lucide-react";
import type { AgentBookingRecord } from "../../types/agent";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
} from "../common/agent-status-badges";
import { Button } from "@/components/ui/button";

interface RecentBookingsPreviewProps {
  bookings?: AgentBookingRecord[];
  isLoading?: boolean;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatPrice(amount?: number): string {
  if (typeof amount !== "number") return "฿0";
  return `฿${amount.toLocaleString("en-US")}`;
}

export function RecentBookingsPreview({
  bookings,
  isLoading,
}: RecentBookingsPreviewProps) {
  return (
    <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5EAED]">
        <div>
          <h3 className="font-outfit text-base font-bold text-[#18282A]">
            Recent Bookings
          </h3>
          <p className="text-xs text-[#74818A]">
            Latest tour reservations booked under your agency
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-[#176779] hover:bg-teal-50 hover:text-[#135664]"
        >
          <Link href="/dashboard/agent/bookings">
            <span>View All</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="py-8 text-center" data-testid="recent-bookings-empty">
            <Compass className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-[#18282A]">
              No bookings created yet
            </p>
            <p className="text-[11px] text-[#74818A]">
              Book tours for your customers to see reservation activity here.
            </p>
            <div className="mt-4">
              <Button asChild size="sm" className="bg-[#176779] text-xs text-white">
                <Link href="/tours">Browse Available Tours</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EAED] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="pb-2.5">Reference</th>
                  <th className="pb-2.5">Tour / Service</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Travel Date</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[#F8FAFB] transition-colors"
                    data-testid={`recent-booking-row-${booking.id}`}
                  >
                    <td className="py-3 font-mono font-medium text-[#18282A]">
                      {booking.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 font-medium text-[#18282A]">
                      <div className="truncate max-w-[200px]" title={booking.service?.name}>
                        {booking.service?.name || "Tour Service"}
                      </div>
                    </td>
                    <td className="py-3 text-[#74818A]">
                      <div className="truncate max-w-[150px]">
                        {booking.customer?.name || "Customer"}
                      </div>
                    </td>
                    <td className="py-3 text-[#74818A]">
                      {formatDate(booking.availability?.date)}
                    </td>
                    <td className="py-3">
                      <AgentBookingStatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 text-right font-semibold text-[#18282A]">
                      {formatPrice(booking.finalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
