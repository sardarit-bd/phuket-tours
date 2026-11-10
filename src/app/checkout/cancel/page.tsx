"use client";

import * as React from "react";
import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetCustomerBookingByIdQuery,
  useGetCustomerPaymentsQuery,
  useReconcileCustomerPaymentMutation,
} from "@/features/customer/api/customer-api";
import {
  useGetAgentBookingByIdQuery,
  useGetAgentPaymentsQuery,
  useReconcileAgentPaymentMutation,
} from "@/features/agent/api/agent-api";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/slices/auth-slice";

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const currentUser = useAppSelector(selectCurrentUser);
  const isAgent = currentUser?.role === "agent";

  // Query booking to see if it was actually already verified
  const { data: custBookingRes } = useGetCustomerBookingByIdQuery(bookingId, {
    skip: !bookingId || isAgent,
  });
  const { data: custPaymentsRes } = useGetCustomerPaymentsQuery(
    { bookingId },
    { skip: !bookingId || isAgent },
  );
  const [reconcileCustomerPayment] = useReconcileCustomerPaymentMutation();

  const { data: agentBookingRes } = useGetAgentBookingByIdQuery(bookingId, {
    skip: !bookingId || !isAgent,
  });
  const { data: agentPaymentsRes } = useGetAgentPaymentsQuery(
    { bookingId },
    { skip: !bookingId || !isAgent },
  );
  const [reconcileAgentPayment] = useReconcileAgentPaymentMutation();

  const reconciledRef = useRef(false);

  const booking = isAgent ? agentBookingRes?.data : custBookingRes?.data;
  const isPaid = booking?.paymentStatus === "PAID";
  const payments = isAgent ? agentPaymentsRes?.data?.items : custPaymentsRes?.data?.items;
  const triggerReconcile = isAgent ? reconcileAgentPayment : reconcileCustomerPayment;

  // Reconcile once upon arriving on cancel if there is an active Stripe payment
  // (guards against the rare edge-case where customer paid, but hit back/cancel or was redirected to cancel)
  useEffect(() => {
    if (!isPaid && !reconciledRef.current && payments?.length) {
      const stripePayment = payments.find(
        (p) => p.method === "STRIPE" && p.status !== "VERIFIED",
      );
      if (stripePayment) {
        reconciledRef.current = true;
        triggerReconcile(stripePayment.id).catch(() => {});
      }
    }
  }, [isPaid, payments, triggerReconcile]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#E5EAED] bg-white p-6 sm:p-8 shadow-xs text-center">
      {isPaid ? (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Payment Confirmed
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            Your payment for this booking has already been verified and confirmed.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href={`/dashboard/bookings/${bookingId}`} className="flex-1">
              <Button className="w-full h-9 bg-[#176779] text-white hover:bg-[#135664] text-xs font-semibold">
                View Booking
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
            <XCircle className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Checkout Cancelled
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            The Stripe checkout session was not completed. If your card was not charged, your booking reservation remains saved and awaiting payment. You can return to try again whenever you are ready.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {bookingId ? (
              <Link
                href={isAgent ? "/dashboard/agent/bookings" : `/dashboard/bookings/${bookingId}`}
                className="flex-1"
              >
                <Button className="w-full h-9 bg-[#176779] text-white hover:bg-[#135664] text-xs font-semibold gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isAgent ? "Agency Bookings" : "Return to Booking"}</span>
                </Button>
              </Link>
            ) : null}
            <Link
              href={isAgent ? "/dashboard/agent/bookings" : "/dashboard/bookings"}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full h-9 border-[#E5EAED] text-xs font-semibold text-[#18282A] gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isAgent ? "My Bookings" : "My Bookings"}</span>
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4 py-12"
      data-testid="checkout-cancel-view"
    >
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAED] bg-white p-8 shadow-xs text-center">
            <Clock className="mx-auto h-8 w-8 text-[#176779] animate-pulse" />
            <p className="mt-3 text-xs text-[#74818A]">Loading cancellation status...</p>
          </div>
        }
      >
        <CheckoutCancelContent />
      </Suspense>
    </div>
  );
}
