"use client";

import * as React from "react";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetCustomerBookingByIdQuery,
  useReconcileCustomerPaymentMutation,
  useGetCustomerPaymentsQuery,
} from "@/features/customer/api/customer-api";
import {
  useGetAgentBookingByIdQuery,
  useGetAgentPaymentsQuery,
  useReconcileAgentPaymentMutation,
} from "@/features/agent/api/agent-api";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/slices/auth-slice";

const MAX_POLL_COUNT = 6; // 6 polls * 3.5s = ~21 seconds max polling timeout
const POLL_INTERVAL_MS = 3500;

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";
  const sessionId = searchParams.get("session_id") || "";

  const currentUser = useAppSelector(selectCurrentUser);
  const isAgent = currentUser?.role === "agent";

  const [pollCount, setPollCount] = useState(0);
  const isReconcilingRef = useRef(false);
  const [reconciledOnce, setReconciledOnce] = useState(false);

  // Customer queries & mutations
  const {
    data: custBookingRes,
    isLoading: isCustBookingLoading,
    refetch: refetchCustBooking,
  } = useGetCustomerBookingByIdQuery(bookingId, {
    skip: !bookingId || isAgent,
    pollingInterval: pollCount < MAX_POLL_COUNT && !isAgent ? POLL_INTERVAL_MS : 0,
  });

  const { data: custPaymentsRes, refetch: refetchCustPayments } = useGetCustomerPaymentsQuery(
    { bookingId },
    { skip: !bookingId || isAgent },
  );

  const [reconcileCustomerPayment, { isLoading: isCustomerReconciling }] =
    useReconcileCustomerPaymentMutation();

  // Agent queries & mutations
  const {
    data: agentBookingRes,
    isLoading: isAgentBookingLoading,
    refetch: refetchAgentBooking,
  } = useGetAgentBookingByIdQuery(bookingId, {
    skip: !bookingId || !isAgent,
    pollingInterval: pollCount < MAX_POLL_COUNT && isAgent ? POLL_INTERVAL_MS : 0,
  });

  const { data: agentPaymentsRes, refetch: refetchAgentPayments } = useGetAgentPaymentsQuery(
    { bookingId },
    { skip: !bookingId || !isAgent },
  );

  const [reconcileAgentPayment, { isLoading: isAgentReconciling }] =
    useReconcileAgentPaymentMutation();

  const booking = isAgent ? agentBookingRes?.data : custBookingRes?.data;
  const isPaid = booking?.paymentStatus === "PAID";

  const payments = isAgent ? agentPaymentsRes?.data?.items : custPaymentsRes?.data?.items;
  const latestPayment = payments?.find(
    (p) => p.method === "STRIPE" || (sessionId && p.stripeSessionId === sessionId),
  );

  const isReconcileMutationLoading = isAgent ? isAgentReconciling : isCustomerReconciling;
  const isBookingLoading = isAgent ? isAgentBookingLoading : isCustBookingLoading;

  const triggerReconcile = isAgent ? reconcileAgentPayment : reconcileCustomerPayment;
  const refetchCurrentBooking = isAgent ? refetchAgentBooking : refetchCustBooking;
  const refetchCurrentPayments = isAgent ? refetchAgentPayments : refetchCustPayments;

  // Trigger server-side reconciliation only once automatically if webhook hasn't finalized status
  useEffect(() => {
    if (
      !isPaid &&
      !reconciledOnce &&
      !isReconcilingRef.current &&
      latestPayment &&
      latestPayment.status !== "VERIFIED"
    ) {
      isReconcilingRef.current = true;
      setReconciledOnce(true);

      triggerReconcile(latestPayment.id)
        .unwrap()
        .then(() => {
          refetchCurrentBooking();
          refetchCurrentPayments();
        })
        .catch(() => {
          // Failure logged or handled, polling takes over
        })
        .finally(() => {
          isReconcilingRef.current = false;
        });
    }
  }, [
    isPaid,
    reconciledOnce,
    latestPayment,
    triggerReconcile,
    refetchCurrentBooking,
    refetchCurrentPayments,
  ]);

  // Finite polling counter
  useEffect(() => {
    if (pollCount < MAX_POLL_COUNT && !isPaid) {
      const timer = setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL_MS);
      return () => clearTimeout(timer);
    }
  }, [pollCount, isPaid]);

  const handleManualRefresh = async () => {
    if (isReconcilingRef.current) return;
    isReconcilingRef.current = true;
    try {
      await refetchCurrentBooking();
      const pRes = await refetchCurrentPayments();
      const items = (pRes.data as { data?: { items?: Array<{ id: string; method: string; stripeSessionId?: string; status: string }> } })?.data?.items;
      const targetPayment = items?.find(
        (p) => p.method === "STRIPE" || (sessionId && p.stripeSessionId === sessionId),
      );
      if (targetPayment && targetPayment.status !== "VERIFIED") {
        await triggerReconcile(targetPayment.id).unwrap();
        await refetchCurrentBooking();
      }
    } finally {
      isReconcilingRef.current = false;
    }
  };

  const isTerminalFailure =
    latestPayment?.status === "FAILED" || latestPayment?.status === "CANCELLED";
  const isRequiresAction = latestPayment?.status === "REQUIRES_ACTION";
  const isPollingExceeded = pollCount >= MAX_POLL_COUNT && !isPaid;

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#E5EAED] bg-white p-6 sm:p-8 shadow-xs text-center">
      {isPaid ? (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Payment Confirmed!
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            Your payment has been successfully processed and verified by Stripe. Your tour reservation is now fully confirmed.
          </p>

          <div className="mt-6 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#74818A]">Booking Reference</span>
              <span className="font-semibold text-[#18282A]">{bookingId.slice(0, 8)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#74818A]">Tour</span>
              <span className="font-semibold text-[#18282A]">
                {booking?.service?.name || "Tour Experience"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#74818A]">Payment Status</span>
              <span className="font-semibold text-emerald-700">PAID</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={isAgent ? "/dashboard/agent/bookings" : `/dashboard/bookings/${bookingId}`}
              className="flex-1"
            >
              <Button className="w-full h-9 bg-[#176779] text-white hover:bg-[#135664] text-xs font-semibold gap-1.5">
                <span>{isAgent ? "Agency Bookings" : "View Reservation"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link
              href={isAgent ? "/dashboard/agent/commissions" : "/dashboard/payments"}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full h-9 border-[#E5EAED] text-xs font-semibold text-[#18282A]"
              >
                {isAgent ? "Commissions" : "Payment History"}
              </Button>
            </Link>
          </div>
        </>
      ) : isTerminalFailure ? (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-200">
            <XCircle className="h-8 w-8 text-rose-600" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Payment Incomplete
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            The payment attempt was not completed by Stripe. No reservation charges were finalized.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={isAgent ? "/dashboard/agent/bookings" : `/dashboard/bookings/${bookingId}`}
              className="flex-1"
            >
              <Button className="w-full h-9 bg-[#176779] text-white hover:bg-[#135664] text-xs font-semibold">
                {isAgent ? "Agency Bookings" : "Return to Booking"}
              </Button>
            </Link>
          </div>
        </>
      ) : isRequiresAction ? (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Verification Notice
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            An action is required to verify your transaction. Our operations team has been notified to confirm this payment.
          </p>

          <div className="mt-6">
            <Link href={`/dashboard/bookings/${bookingId}`}>
              <Button className="w-full h-9 bg-[#176779] text-white hover:bg-[#135664] text-xs font-semibold">
                View Booking Status
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200">
            <Clock className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>

          <h1 className="mt-4 font-outfit text-xl font-bold text-[#18282A] sm:text-2xl">
            Verifying Payment...
          </h1>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            {isPollingExceeded
              ? "We received your session, but confirmation is taking slightly longer than usual. Your payment record is safe and will update once confirmed."
              : "We received confirmation that you completed Checkout. Our server is waiting for final confirmation from Stripe."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isReconcileMutationLoading || isBookingLoading}
              className="h-8 border-[#E5EAED] text-xs gap-1.5 text-[#18282A]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isReconcileMutationLoading ? "animate-spin" : ""
                }`}
              />
              <span>Check Status Now</span>
            </Button>
          </div>

          <div className="mt-6 border-t border-[#E5EAED] pt-4">
            <Link
              href={`/dashboard/bookings/${bookingId}`}
              className="text-xs text-[#176779] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Return to Booking Details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4 py-12"
      data-testid="checkout-success-view"
    >
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAED] bg-white p-8 shadow-xs text-center">
            <Clock className="mx-auto h-8 w-8 text-[#176779] animate-pulse" />
            <p className="mt-3 text-xs text-[#74818A]">Loading checkout details...</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
