"use client";

import * as React from "react";
import Link from "next/link";
import { useGetCustomerBookingByIdQuery } from "../../api/customer-api";
import type { CustomerBookingRecord } from "../../types/customer";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
} from "@/features/agent/components/common/agent-status-badges";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  Wallet,
  CheckCircle2,
} from "lucide-react";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
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

export function CustomerBookingDetail({ bookingId }: { bookingId: string }) {
  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCustomerBookingByIdQuery(bookingId);

  const booking: CustomerBookingRecord | undefined = response?.data;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs p-6" data-testid="customer-booking-detail-loading">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs p-8 text-center" data-testid="customer-booking-detail-error">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-300" />
        <h4 className="mt-3 font-outfit text-base font-bold text-[#18282A]">
          {notFound ? "Booking not found" : "Failed to load booking"}
        </h4>
        <p className="mt-1 text-xs text-[#74818A]">
          {notFound
            ? "This booking may have been removed or you no longer have access."
            : "Please check your connection and try again."}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-3 text-xs border-[#E5EAED] bg-white text-[#18282A] hover:bg-[#F5F8F9]"
          >
            Retry
          </Button>
          <Link href="/dashboard/bookings">
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-[#176779] text-white hover:bg-[#135664]"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to Bookings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isPayable = booking.paymentStatus === "UNPAID";
  const isPaid = booking.paymentStatus === "PAID";

  return (
    <div className="space-y-6" data-testid="customer-booking-detail">
      {/* Back link */}
      <Link href="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#74818A] hover:text-[#176779] transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Bookings
      </Link>

      {/* Booking card */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#E5EAED] bg-[#F8FAFB] px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-outfit text-base font-bold text-[#18282A]">
                {booking.service?.name || "Tour Booking"}
              </h3>
              <span className="text-[10px] text-[#74818A]">
                Ref: {booking.id.slice(0, 8)}…
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AgentBookingStatusBadge status={booking.status} />
              <AgentPaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {/* Tour info */}
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[#74818A] mb-2">
              Tour Details
            </h5>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-[#74818A]">Type</dt>
                <dd className="font-medium text-[#18282A]">{booking.service?.type || "Tour"}</dd>
              </div>
              <div>
                <dt className="text-[#74818A]">Booked on</dt>
                <dd className="font-medium text-[#18282A]">{formatDate(booking.createdAt)}</dd>
              </div>
              {booking.notes && (
                <div>
                  <dt className="text-[#74818A]">Notes</dt>
                  <dd className="mt-0.5 text-[#18282A] whitespace-pre-wrap">{booking.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Schedule */}
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[#74818A] mb-2">
              Travel Schedule
            </h5>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#176779] shrink-0" />
                <div>
                  <dt className="text-[#74818A]">Travel date</dt>
                  <dd className="font-medium text-[#18282A]">
                    {formatDate(booking.availability?.date)}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#176779] shrink-0" />
                <div>
                  <dt className="text-[#74818A]">Fulfillment</dt>
                  <dd className="font-medium text-[#18282A]">
                    {booking.fulfillmentStatus.replace(/_/g, " ")}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Payment section */}
        <div className="border-t border-[#E5EAED] bg-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[#74818A] mb-1.5">
                Payment
              </h5>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#18282A]">
                  {formatPrice(booking.finalPrice)}
                </span>
                {booking.basePrice !== booking.finalPrice && (
                  <span className="text-xs text-[#74818A] line-through">
                    {formatPrice(booking.basePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Pay CTA — only when unpaid and booking is in a payable state */}
            {isPayable && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#176779]" />
                <Link href={`/dashboard/bookings/${booking.id}/pay`}>
                  <Button
                    size="sm"
                    className="bg-[#176779] text-white text-xs hover:bg-[#135664] h-9 px-4"
                  >
                    Make Payment
                  </Button>
                </Link>
              </div>
            )}
            {isPaid && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Payment completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
