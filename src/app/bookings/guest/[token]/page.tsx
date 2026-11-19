"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Clock,
  User,
  Mail,
  Phone,
  Compass,
  AlertTriangle,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useGetPublicGuestBookingQuery } from "@/features/customer/api/customer-api";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function GuestItineraryPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPublicGuestBookingQuery(token, {
    skip: !token,
  });

  const booking = response?.data;

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Loading Itinerary...</h2>
          <p className="text-sm text-slate-500">
            Please wait while we verify your secure booking link.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error / Expired / Invalid State
  if (isError || !booking) {
    const errorStatus = (error as any)?.status;
    const isExpired = errorStatus === 410;
    const isRevoked = errorStatus === 403;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            {isExpired ? (
              <Clock className="w-8 h-8" />
            ) : isRevoked ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isExpired
              ? "Access Link Expired"
              : isRevoked
                ? "Access Link Revoked"
                : "Booking Not Found"}
          </h2>
          <p className="text-slate-600 mb-6">
            {isExpired
              ? "This guest access link has expired after 30 days. For your security, please contact PhuketTours support to verify your reservation."
              : isRevoked
                ? "This guest access link has been revoked or claimed. If you believe this is in error, please reach out to our team."
                : "We could not find a booking matching this secure link. Please make sure the URL was copied completely from your confirmation email."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => refetch()}>
              Retry Access
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = booking.paymentStatus === "PAID";
  const isPartiallyPaid = booking.paymentStatus === "PARTIALLY_PAID";
  const isUnpaid = booking.paymentStatus === "UNPAID";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Notice Banner */}
        <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Guest Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Booking Itinerary
            </h1>
            <p className="text-emerald-200 text-sm">
              Booking Reference:{" "}
              <span className="font-mono font-bold text-white tracking-widest">
                {booking.bookingReference}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                booking.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-800"
                  : booking.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800"
              }`}
            >
              {booking.status}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPaid
                  ? "bg-emerald-500 text-white"
                  : isPartiallyPaid
                    ? "bg-amber-500 text-white"
                    : "bg-rose-500 text-white"
              }`}
            >
              {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Outstanding Payment Action Banner if applicable */}
        {booking.paymentAction.isPayable && booking.paymentAction.paymentUrl && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Payment Required
              </h3>
              <p className="text-sm text-amber-700">
                You have an outstanding balance of{" "}
                <span className="font-bold">
                  {formatPrice(booking.pricing.remainingBalance, booking.currency)}
                </span>
                . Complete payment to secure your reservation.
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
              <Link href={booking.paymentAction.paymentUrl}>
                Pay Balance Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Tour Experience & Party Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Experience Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Reserved Experience
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {booking.service.name}
                </h2>
                {booking.service.description && (
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {booking.service.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Travel Date</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {booking.travelDate || "Confirmed Schedule"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">Party Size</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {booking.guest.party.adults} Adult
                      {booking.guest.party.adults > 1 ? "s" : ""}
                      {booking.guest.party.children > 0
                        ? `, ${booking.guest.party.children} Child${
                            booking.guest.party.children > 1 ? "ren" : ""
                          }`
                        : ""}
                      {booking.guest.party.infants > 0
                        ? `, ${booking.guest.party.infants} Infant${
                            booking.guest.party.infants > 1 ? "s" : ""
                          }`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Contact Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Lead Guest Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Name</span>
                  <span className="font-medium text-slate-900">{booking.guest.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Email</span>
                  <span className="font-medium text-slate-900">{booking.guest.email}</span>
                </div>
                {booking.guest.phone && (
                  <div>
                    <span className="text-slate-500 block text-xs">Phone</span>
                    <span className="font-medium text-slate-900">{booking.guest.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Policy / Support Card */}
            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Modifications & Cancellation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {booking.cancellationPolicy.notice}
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`mailto:${booking.cancellationPolicy.supportEmail}`}>
                    Contact Support to Modify or Cancel
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Col: Price Breakdown & Payment Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Payment Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base Price</span>
                  <span>{formatPrice(booking.pricing.basePrice, booking.currency)}</span>
                </div>

                {booking.pricing.basePrice > booking.pricing.finalPrice && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>
                      -
                      {formatPrice(
                        booking.pricing.basePrice - booking.pricing.finalPrice,
                        booking.currency,
                      )}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span>{formatPrice(booking.pricing.finalPrice, booking.currency)}</span>
                </div>

                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Amount Paid</span>
                  <span>{formatPrice(booking.pricing.totalPaid, booking.currency)}</span>
                </div>

                {booking.pricing.remainingBalance > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold pt-2 border-t border-slate-100">
                    <span>Balance Due</span>
                    <span>
                      {formatPrice(booking.pricing.remainingBalance, booking.currency)}
                    </span>
                  </div>
                )}
              </div>

              {isPaid && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Your booking is fully paid.
                </div>
              )}
            </div>

            {/* Safe Notice */}
            <div className="text-xs text-slate-400 text-center leading-relaxed px-2">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Secure Guest Access. This page is encrypted and protected against unauthorized access.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
