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
  Users,
  UserCheck,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  FileText,
} from "lucide-react";
import { StripePaymentButton } from "../payments/stripe-payment-button";
import { formatPrice } from "@/lib/utils";

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

      // Extract Name and (email, phone)
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
      <div
        className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-xs"
        data-testid="customer-booking-detail-loading"
      >
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div
        className="rounded-2xl border border-[#E5EAED] bg-white p-8 text-center shadow-xs"
        data-testid="customer-booking-detail-error"
      >
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
            className="h-8 border-[#E5EAED] bg-white px-3 text-xs text-[#18282A] hover:bg-[#F5F8F9]"
          >
            Retry
          </Button>
          <Link href="/dashboard/bookings">
            <Button
              size="sm"
              className="h-8 bg-[#176779] px-3 text-xs text-white hover:bg-[#135664]"
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

  const parsedNotes = parseStructuredNotes(booking.notes);
  const travelDateValue = booking.availability?.date || parsedNotes.travelDate;
  const currency = booking.currency || "USD";

  const isPayable =
    booking.paymentStatus === "UNPAID" &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED");
  const isPaid = booking.paymentStatus === "PAID";

  const amountPaid = isPaid ? booking.finalPrice : 0;
  const outstandingBalance = isPaid ? 0 : booking.finalPrice;

  const verifiedPayments = (booking.payments || []).filter(
    (p) => p.status === "VERIFIED" || p.status === "PAID"
  );
  const latestPayment =
    verifiedPayments.length > 0
      ? verifiedPayments[0]
      : (booking.payments || [])[0];

  return (
    <div className="space-y-6" data-testid="customer-booking-detail">
      {/* Back navigation */}
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#74818A] transition-colors hover:text-[#176779]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to My Bookings</span>
      </Link>

      {/* Main Reservation Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EAED] bg-white shadow-xs">
        {/* A. Booking Header */}
        <div className="border-b border-[#E5EAED] bg-[#F8FAFB] px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-outfit text-lg font-bold text-[#18282A] sm:text-xl">
                  {booking.service?.name || "Tour Reservation"}
                </h2>
                <span className="rounded-md border border-[#E5EAED] bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-[#74818A]">
                  ID: {booking.id.slice(0, 8)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#74818A]">
                Booked on {formatDate(booking.createdAt)} • Ref: {booking.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AgentBookingStatusBadge status={booking.status} />
              <AgentPaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* B & C. Tour Info & Travel Schedule Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Tour Information */}
            <div className="rounded-xl border border-[#E5EAED] bg-[#FAFCFD] p-5">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-wider text-[#176779] flex items-center gap-1.5 mb-3.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Tour Information</span>
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Tour Name</dt>
                  <dd className="font-semibold text-[#18282A] max-w-[240px] truncate text-right">
                    {booking.service?.name || "Phuket Tour"}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Category / Type</dt>
                  <dd className="font-medium text-[#18282A]">
                    {booking.service?.type || "Excursion / Island Tour"}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Destination</dt>
                  <dd className="font-medium text-[#18282A]">Phuket, Thailand</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#74818A]">Booking ID</dt>
                  <dd className="font-mono text-[11px] text-[#74818A]">{booking.id}</dd>
                </div>
              </dl>
            </div>

            {/* Travel Schedule */}
            <div className="rounded-xl border border-[#E5EAED] bg-[#FAFCFD] p-5">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-wider text-[#176779] flex items-center gap-1.5 mb-3.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Travel Schedule</span>
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Selected Travel Date</dt>
                  <dd className="font-bold text-[#18282A]" data-testid="detail-travel-date">
                    {formatDate(travelDateValue)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Fulfillment Status</dt>
                  <dd className="font-medium capitalize text-[#18282A]">
                    {booking.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-2">
                  <dt className="text-[#74818A]">Reservation Status</dt>
                  <dd className="font-medium text-[#18282A]">
                    {booking.status === "CONFIRMED"
                      ? "Confirmed & Guaranteed"
                      : "Pending Confirmation"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#74818A]">Cancellation Terms</dt>
                  <dd className="text-emerald-700 font-medium">Free cancel up to 24h before</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* D. Guest Information Breakdown */}
          <div className="rounded-xl border border-[#E5EAED] bg-white p-5">
            <h3 className="font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A] flex items-center gap-1.5 mb-3">
              <Users className="h-3.5 w-3.5 text-[#176779]" />
              <span>Guest Counts</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                <span className="text-[11px] font-semibold text-[#74818A] block">Adults (12+)</span>
                <span className="font-outfit text-lg font-bold text-[#18282A] block mt-0.5">
                  {parsedNotes.guests.adults}
                </span>
              </div>
              <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                <span className="text-[11px] font-semibold text-[#74818A] block">Children (4-12)</span>
                <span className="font-outfit text-lg font-bold text-[#18282A] block mt-0.5">
                  {parsedNotes.guests.children}
                </span>
              </div>
              <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                <span className="text-[11px] font-semibold text-[#74818A] block">Infants (0-3)</span>
                <span className="font-outfit text-lg font-bold text-[#18282A] block mt-0.5">
                  {parsedNotes.guests.infants}
                </span>
              </div>
            </div>
          </div>

          {/* E & F. Lead Traveler & Special Requests */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Lead Traveler */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-5">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A] flex items-center gap-1.5 mb-3">
                <UserCheck className="h-3.5 w-3.5 text-[#176779]" />
                <span>Lead Traveler Information</span>
              </h3>
              <dl className="space-y-2 text-xs">
                {parsedNotes.contact.name && (
                  <div>
                    <dt className="text-[#74818A]">Full Name</dt>
                    <dd className="font-semibold text-[#18282A] mt-0.5">{parsedNotes.contact.name}</dd>
                  </div>
                )}
                {parsedNotes.contact.email && (
                  <div>
                    <dt className="text-[#74818A]">Email Address</dt>
                    <dd className="font-medium text-[#18282A] mt-0.5">{parsedNotes.contact.email}</dd>
                  </div>
                )}
                {parsedNotes.contact.phone && (
                  <div>
                    <dt className="text-[#74818A]">Phone / WhatsApp</dt>
                    <dd className="font-medium text-[#18282A] mt-0.5">{parsedNotes.contact.phone}</dd>
                  </div>
                )}
                {!parsedNotes.contact.name && !parsedNotes.contact.email && (
                  <p className="text-xs text-[#74818A]">Customer account details verified on file.</p>
                )}
              </dl>
            </div>

            {/* Special Requests */}
            <div className="rounded-xl border border-[#E5EAED] bg-white p-5">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-wider text-[#18282A] flex items-center gap-1.5 mb-3">
                <MessageSquare className="h-3.5 w-3.5 text-[#176779]" />
                <span>Hotel Pickup & Special Requests</span>
              </h3>
              {parsedNotes.specialRequests ? (
                <div className="rounded-lg bg-[#F8FAFB] p-3 text-xs text-[#18282A] border border-[#EEF2F3] whitespace-pre-wrap">
                  {parsedNotes.specialRequests}
                </div>
              ) : (
                <p className="text-xs text-[#74818A] italic">
                  No special requests or custom pickup notes provided.
                </p>
              )}
            </div>
          </div>

          {/* G. Payment Summary */}
          <div className="rounded-xl border border-[#E5EAED] bg-[#FAFCFD] p-6">
            <h3 className="font-outfit text-sm font-bold text-[#18282A] flex items-center justify-between border-b border-[#EEF2F3] pb-3">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#176779]" />
                <span>Payment Summary</span>
              </span>
              <span className="text-xs font-medium text-[#74818A]">
                Currency: <strong className="text-[#18282A]">{currency}</strong>
              </span>
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4 border border-[#EEF2F3]">
                <span className="text-xs text-[#74818A] block">Total Amount</span>
                <span className="font-outfit text-xl font-bold text-[#18282A] block mt-1" data-testid="detail-total-amount">
                  {formatPrice(booking.finalPrice, currency)}
                </span>
                {booking.basePrice !== booking.finalPrice && (
                  <span className="text-[11px] text-[#74818A] line-through block mt-0.5">
                    Original: {formatPrice(booking.basePrice, currency)}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#EEF2F3]">
                <span className="text-xs text-[#74818A] block">Amount Paid</span>
                <span className="font-outfit text-xl font-bold text-emerald-700 block mt-1" data-testid="detail-paid-amount">
                  {formatPrice(amountPaid, currency)}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                  {isPaid ? "Fully Settled" : "Awaiting Settlement"}
                </span>
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#EEF2F3]">
                <span className="text-xs text-[#74818A] block">Outstanding Balance</span>
                <span className="font-outfit text-xl font-bold text-[#18282A] block mt-1" data-testid="detail-balance-amount">
                  {formatPrice(outstandingBalance, currency)}
                </span>
                <span className="text-[10px] text-[#74818A] block mt-0.5">
                  Due before tour departure
                </span>
              </div>
            </div>

            {/* Payment Method & Reference when present */}
            {latestPayment && (
              <div className="mt-4 rounded-lg bg-white p-3 border border-[#EEF2F3] text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[#74818A]">Payment Method: </span>
                  <strong className="text-[#18282A] capitalize">
                    {latestPayment.method.replace(/_/g, " ").toLowerCase()}
                  </strong>
                </div>
                {latestPayment.reference && (
                  <div>
                    <span className="text-[#74818A]">Ref Slip: </span>
                    <strong className="font-mono text-[#18282A]">{latestPayment.reference}</strong>
                  </div>
                )}
                {latestPayment.stripeSessionId && (
                  <div>
                    <span className="text-[#74818A]">Stripe Session: </span>
                    <strong className="font-mono text-[#18282A]">
                      {latestPayment.stripeSessionId.slice(0, 16)}…
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Pay CTA / Completion message */}
            <div className="mt-5 pt-4 border-t border-[#EEF2F3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#74818A]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>SSL Secured Transaction • Authenticated Phuket Travel Platform</span>
              </div>

              {isPayable && (
                <div className="flex items-center gap-2">
                  <StripePaymentButton
                    bookingId={booking.id}
                    amount={booking.finalPrice}
                    currency={currency}
                  />
                </div>
              )}

              {isPaid && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Payment Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
