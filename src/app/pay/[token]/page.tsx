"use client";

import * as React from "react";
import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
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
  Receipt,
  AlertTriangle,
} from "lucide-react";
import {
  StripeLogo,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  UnionPayLogo,
  PayPalLogo,
} from "@/components/ui/payment-provider-logos";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  useGetPublicPaymentLinkDetailsQuery,
  useCreatePublicStripeSessionMutation,
  useCreatePublicPayPalOrderMutation,
  useCapturePublicPayPalOrderMutation,
} from "@/features/agent/api/agent-api";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicPaymentPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const paypalToken = searchParams.get("token"); // PayPal return query

  const [selectedMethod, setSelectedMethod] = useState<"STRIPE" | "PAYPAL">("STRIPE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const {
    data: linkResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPublicPaymentLinkDetailsQuery(token, {
    skip: !token,
  });

  const [createStripeSession, { isLoading: isStripeLoading }] =
    useCreatePublicStripeSessionMutation();
  const [createPayPalOrder, { isLoading: isPayPalLoading }] =
    useCreatePublicPayPalOrderMutation();
  const [capturePayPalOrder, { isLoading: isCapturingPayPal }] =
    useCapturePublicPayPalOrderMutation();

  const details = linkResponse?.data;

  // Handle return status from Stripe or PayPal
  React.useEffect(() => {
    if (statusParam === "success") {
      setPaymentSuccess(true);
      refetch();
    } else if (statusParam === "cancelled") {
      setErrorMessage("The payment attempt was cancelled. You may try again whenever you are ready.");
    } else if (statusParam === "paypal-success" && paypalToken) {
      // Capture the PayPal order
      capturePayPalOrder({ token, orderId: paypalToken })
        .unwrap()
        .then(() => {
          setPaymentSuccess(true);
          refetch();
        })
        .catch((err) => {
          setErrorMessage(
            err?.data?.message || "Failed to finalize PayPal payment. Please contact support or try again.",
          );
        });
    }
  }, [statusParam, paypalToken, token, capturePayPalOrder, refetch]);

  const handleProceedPayment = async () => {
    setErrorMessage(null);

    if (selectedMethod === "STRIPE") {
      try {
        const response = await createStripeSession({ token }).unwrap();
        if (response?.data?.sessionUrl) {
          window.location.href = response.data.sessionUrl;
        } else {
          setErrorMessage("Failed to initialize Stripe checkout session. Please try again.");
        }
      } catch (err: any) {
        setErrorMessage(err?.data?.message || "Failed to start Stripe checkout.");
      }
    } else if (selectedMethod === "PAYPAL") {
      try {
        const response = await createPayPalOrder({ token }).unwrap();
        if (response?.data?.approveUrl) {
          window.location.href = response.data.approveUrl;
        } else {
          setErrorMessage("PayPal approved URL not available. Please try again or use card.");
        }
      } catch (err: any) {
        setErrorMessage(err?.data?.message || "PayPal is currently unavailable.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
          <p className="text-sm font-medium text-[#465D61]">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  if (isError || !details) {
    const errObj = error as any;
    const msg =
      errObj?.data?.message || "This payment link is invalid, has expired, or is no longer available.";
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-[#18282A]">Payment Link Unavailable</h1>
          <p className="mt-2 text-sm text-[#465D61]">{msg}</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#176779] rounded-xl hover:bg-[#135664]"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = details.paymentStatus === "PAID" || paymentSuccess;
  const isExpired = details.linkStatus === "EXPIRED";
  const isRevoked = details.linkStatus === "REVOKED";

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAED] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176779] text-white font-bold text-lg shadow-xs">
              P
            </div>
            <div>
              <span className="text-base font-bold text-[#18282A]">PhuketTours</span>
              <span className="block text-[11px] font-medium text-[#465D61]">Secure Guest Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full font-medium">
            <Lock className="h-3.5 w-3.5" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* Error / Alert feedback */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Payment Notification</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {isAlreadyPaid ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#2E7D32]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#18282A]">Payment Confirmed!</h1>
              <p className="text-sm text-[#465D61]">
                Thank you for your payment. Your booking reservation is confirmed.
              </p>
            </div>

            <div className="mx-auto max-w-sm rounded-xl bg-[#F8FAFB] border border-[#E5EAED] p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#465D61]">Tour:</span>
                <span className="font-semibold text-[#18282A]">{details.tourTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#465D61]">Customer:</span>
                <span className="font-medium text-[#18282A]">{details.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#465D61]">Amount Paid:</span>
                <span className="font-bold text-[#2E7D32]">
                  {formatPrice(details.totalAmount, details.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#465D61]">Status:</span>
                <span className="font-bold text-[#2E7D32]">PAID IN FULL</span>
              </div>
            </div>

            <p className="text-xs text-[#465D61] pt-2">
              A voucher and receipt have been dispatched to your email address ({details.customerEmailMasked}).
            </p>
          </div>
        ) : isExpired || isRevoked ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-[#18282A]">
              {isExpired ? "Payment Link Expired" : "Payment Link Revoked"}
            </h2>
            <p className="text-sm text-[#465D61]">
              This payment link is no longer valid. Please contact your booking agent to generate a fresh payment link.
            </p>
          </div>
        ) : (
          /* Active Payment Link Details & Payment Selection */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left: Booking & Price Summary */}
            <div className="md:col-span-3 space-y-5">
              <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#176779]">
                    Tour Reservation
                  </span>
                  <h1 className="text-xl font-bold text-[#18282A]">{details.tourTitle}</h1>
                  {details.tourDescription && (
                    <p className="text-xs text-[#465D61] line-clamp-2">{details.tourDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5EAED] text-xs">
                  {details.travelDate && (
                    <div className="flex items-center gap-2 text-[#465D61]">
                      <Calendar className="h-4 w-4 text-[#176779]" />
                      <span>{new Date(details.travelDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#465D61]">
                    <User className="h-4 w-4 text-[#176779]" />
                    <span className="truncate">{details.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#465D61]">
                    <Mail className="h-4 w-4 text-[#176779]" />
                    <span className="truncate">{details.customerEmailMasked}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#465D61]">
                    <Receipt className="h-4 w-4 text-[#176779]" />
                    <span>ID: {details.bookingId.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F8FAFB] border border-[#E5EAED] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-[#465D61]">
                    <span>Agreed Booking Price:</span>
                    <span className="font-medium text-[#18282A]">
                      {formatPrice(details.totalAmount, details.currency)}
                    </span>
                  </div>
                  {details.paidAmount > 0 && (
                    <div className="flex justify-between text-[#465D61]">
                      <span>Amount Previously Paid:</span>
                      <span className="font-medium text-[#2E7D32]">
                        - {formatPrice(details.paidAmount, details.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#E5EAED] pt-2 text-sm font-bold">
                    <span className="text-[#18282A]">Remaining Balance Due:</span>
                    <span className="text-[#176779]">
                      {formatPrice(details.remainingBalance, details.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security assurances */}
              <div className="rounded-xl border border-[#E5EAED] bg-white p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-[#18282A]">Guaranteed Secure Transaction</p>
                  <p className="text-[#465D61]">
                    Your payment is processed directly by the payment provider using industry standard encryption. PhuketTours never stores full credit card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Payment Provider Selection & Action */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-[#18282A] uppercase tracking-wide">
                  Select Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Stripe Credit/Debit Card Option */}
                  <label
                    className={`block rounded-xl border p-3 cursor-pointer transition-all ${
                      selectedMethod === "STRIPE"
                        ? "border-[#176779] bg-[#F0F7F8] ring-1 ring-[#176779]"
                        : "border-[#E5EAED] hover:bg-[#F8FAFB]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          value="STRIPE"
                          checked={selectedMethod === "STRIPE"}
                          onChange={() => setSelectedMethod("STRIPE")}
                          className="h-4 w-4 text-[#176779] border-gray-300 focus:ring-[#176779]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#18282A]">Credit / Debit Card</span>
                          <span className="block text-[10px] text-[#465D61]">
                            Visa, Mastercard, Amex
                          </span>
                        </div>
                      </div>
                      <StripeLogo />
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 pl-6">
                      <VisaLogo />
                      <MastercardLogo />
                      <AmexLogo />
                      <UnionPayLogo />
                    </div>
                  </label>

                  {/* PayPal Option */}
                  <label
                    className={`block rounded-xl border p-3 transition-all ${
                      details.paypalAvailable
                        ? selectedMethod === "PAYPAL"
                          ? "border-[#0070BA] bg-[#F0F7FA] ring-1 ring-[#0070BA] cursor-pointer"
                          : "border-[#E5EAED] hover:bg-[#F8FAFB] cursor-pointer"
                        : "border-[#E5EAED] bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment_method"
                          value="PAYPAL"
                          disabled={!details.paypalAvailable}
                          checked={selectedMethod === "PAYPAL"}
                          onChange={() => setSelectedMethod("PAYPAL")}
                          className="h-4 w-4 text-[#0070BA] border-gray-300 focus:ring-[#0070BA]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#18282A]">PayPal</span>
                          <span className="block text-[10px] text-[#465D61]">
                            {details.paypalAvailable ? "PayPal balance or linked cards" : "Unavailable in this region"}
                          </span>
                        </div>
                      </div>
                      <PayPalLogo />
                    </div>
                  </label>
                </div>

                <Button
                  type="button"
                  onClick={handleProceedPayment}
                  disabled={isStripeLoading || isPayPalLoading || isCapturingPayPal}
                  className="w-full bg-[#176779] hover:bg-[#135664] text-white text-sm font-bold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isStripeLoading || isPayPalLoading || isCapturingPayPal ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Redirecting to Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pay {formatPrice(details.remainingBalance, details.currency)}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-[#465D61]">
                  You will be safely redirected to {selectedMethod === "STRIPE" ? "Stripe" : "PayPal"} to finalize your payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

