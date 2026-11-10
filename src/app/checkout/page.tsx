"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Building,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Banknote,
  Lock,
  Coins,
} from "lucide-react";
import {
  StripeLogo,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  UnionPayLogo,
  PayPalLogo,
} from "@/components/ui/payment-provider-logos";
import { useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "@/features/auth/slices/auth-slice";
import { useGetTourByIdQuery } from "@/features/tours/api/tours-api";
import {
  useCreateCustomerBookingMutation,
  useCreateCustomerPaymentMutation,
  useCreateStripeSessionMutation,
} from "@/features/customer/api/customer-api";
import {
  useCreateAgentBookingMutation,
  useCreateAgentCustomerMutation,
  useCreateAgentPaymentMutation,
  useCreateAgentStripeSessionMutation,
  useGetAgentCustomersQuery,
  useGetAgentPricingLimitsQuery,
} from "@/features/agent/api/agent-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

type PaymentMethodType = "STRIPE" | "BANK_TRANSFER" | "CASH" | "PAYPAL";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId") || "";

  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
  const isAgent = currentUser?.role === "agent";

  // Tour data query
  const {
    data: tour,
    isLoading: isTourLoading,
    isError: isTourError,
  } = useGetTourByIdQuery(tourId, {
    skip: !tourId,
  });

  // Customer Booking & payment mutations
  const [createCustomerBooking, { isLoading: isCustomerBookingLoading }] =
    useCreateCustomerBookingMutation();
  const [createCustomerStripeSession, { isLoading: isCustomerStripeLoading }] =
    useCreateStripeSessionMutation();
  const [createCustomerManualPayment, { isLoading: isCustomerManualPaymentLoading }] =
    useCreateCustomerPaymentMutation();

  // Agent Booking & payment mutations
  const [createAgentCustomer, { isLoading: isCreatingAgentCustomer }] =
    useCreateAgentCustomerMutation();
  const [createAgentBooking, { isLoading: isAgentBookingLoading }] =
    useCreateAgentBookingMutation();
  const [createAgentStripeSession, { isLoading: isAgentStripeLoading }] =
    useCreateAgentStripeSessionMutation();
  const [createAgentManualPayment, { isLoading: isAgentManualPaymentLoading }] =
    useCreateAgentPaymentMutation();

  const { data: agentCustomersRes } = useGetAgentCustomersQuery(
    { limit: 50 },
    { skip: !isAgent },
  );
  const { data: agentPricingLimitsRes } = useGetAgentPricingLimitsQuery(
    { serviceId: tourId || undefined },
    { skip: !isAgent || !tourId },
  );

  // Booking details form state
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [travelDate, setTravelDate] = useState(tomorrow);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [fullName, setFullName] = useState(!isAgent ? (currentUser?.name || "") : "");
  const [email, setEmail] = useState(!isAgent ? (currentUser?.email || "") : "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Agent Custom Rate state
  const [useAgentRate, setUseAgentRate] = useState(false);
  const [agentProposedPrice, setAgentProposedPrice] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("STRIPE");
  const [transferReference, setTransferReference] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  // Submission & feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualSuccessBookingId, setManualSuccessBookingId] = useState<string | null>(null);
  const [awaitingApprovalBookingId, setAwaitingApprovalBookingId] = useState<string | null>(null);

  // Sync user info if loaded after mount (only for customer)
  React.useEffect(() => {
    if (currentUser && !isAgent) {
      if (!fullName && currentUser.name) setFullName(currentUser.name);
      if (!email && currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser, fullName, email, isAgent]);

  // Auth redirection check
  React.useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      const returnUrl = `/checkout${tourId ? `?tourId=${encodeURIComponent(tourId)}` : ""}`;
      router.replace(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthInitialized, isAuthenticated, tourId, router]);

  // Unit pricing calculations
  const currency = tour?.price?.currency || "USD";
  const unitAdultPrice = tour?.price?.amount ?? 0;

  const tiers = tour?.pricingTiers ?? [];
  const childTier = tiers.find((t) => /child/i.test(t.tierName));
  const infantTier = tiers.find((t) => /infant/i.test(t.tierName));

  const unitChildPrice =
    childTier && childTier.price >= 0
      ? childTier.price
      : Math.round(unitAdultPrice * 0.7 * 100) / 100;
  const unitInfantPrice =
    infantTier && infantTier.price >= 0 ? infantTier.price : 0;

  const totalCalculatedPrice = useMemo(() => {
    return Math.round(
      (adults * unitAdultPrice +
        children * unitChildPrice +
        infants * unitInfantPrice) *
        100
    ) / 100;
  }, [adults, children, infants, unitAdultPrice, unitChildPrice, unitInfantPrice]);

  // Agent pricing limit logic
  const pricingLimit = agentPricingLimitsRes?.data;
  const maxDiscountPercentage = pricingLimit?.maxDiscountPercentage ?? 0;

  const minAutoApprovePrice = useMemo(() => {
    if (totalCalculatedPrice <= 0) return totalCalculatedPrice;
    return (
      Math.round(totalCalculatedPrice * (1 - maxDiscountPercentage / 100) * 100) / 100
    );
  }, [maxDiscountPercentage, totalCalculatedPrice]);

  const effectiveAgentPrice = useMemo(() => {
    if (!isAgent || !useAgentRate || !agentProposedPrice.trim()) {
      return totalCalculatedPrice;
    }
    const parsed = Number(agentProposedPrice);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : totalCalculatedPrice;
  }, [isAgent, useAgentRate, agentProposedPrice, totalCalculatedPrice]);

  const willRequirePriceApproval =
    isAgent &&
    useAgentRate &&
    effectiveAgentPrice < totalCalculatedPrice &&
    effectiveAgentPrice < minAutoApprovePrice;

  const effectiveFinalPrice = isAgent && useAgentRate ? effectiveAgentPrice : totalCalculatedPrice;

  const isBusy =
    isSubmitting ||
    isCustomerBookingLoading ||
    isCustomerStripeLoading ||
    isCustomerManualPaymentLoading ||
    isCreatingAgentCustomer ||
    isAgentBookingLoading ||
    isAgentStripeLoading ||
    isAgentManualPaymentLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) {
      return;
    }
    setErrorMsg(null);

    if (!tourId) {
      setErrorMsg("Please select a tour to book.");
      return;
    }

    if (!travelDate) {
      setErrorMsg("Please select a valid travel date.");
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg(
        isAgent
          ? "Please provide the client traveler's full name and email."
          : "Please fill in contact name and email."
      );
      return;
    }

    if (paymentMethod === "PAYPAL") {
      setErrorMsg("PayPal payments are currently unavailable. Please choose Card or Bank Transfer.");
      return;
    }

    if (paymentMethod === "BANK_TRANSFER" && !transferReference.trim()) {
      setErrorMsg("Please provide your bank transfer transaction reference.");
      return;
    }

    setIsSubmitting(true);

    try {
      let createdBookingId = "";
      let requiresApproval = false;

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const contactSummary = `Contact: ${fullName.trim()} (${email.trim()}${phone.trim() ? `, ${phone.trim()}` : ""})`;
      const combinedNotes = notes.trim()
        ? `${contactSummary} | Notes: ${notes.trim()}`
        : contactSummary;

      if (isAgent) {
        // Step A: Resolve or create customer account for the client
        const custRes = await createAgentCustomer({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        }).unwrap();

        const resolvedCustomerId = custRes.data.id;

        // Step B: Create agent booking
        const agentBookingRes = await createAgentBooking({
          customerId: resolvedCustomerId,
          serviceId: tour!.id,
          travelDate,
          adults,
          children,
          infants,
          proposedPrice: effectiveAgentPrice,
          notes: combinedNotes,
        }).unwrap();

        createdBookingId = agentBookingRes.data?.id;
        requiresApproval = Boolean(
          agentBookingRes.data?.requiresApproval ||
          agentBookingRes.data?.status === "AWAITING_APPROVAL"
        );

        if (!createdBookingId) {
          throw new Error("Failed to receive agent booking confirmation from server.");
        }

        // If price approval is needed, stop payment step and direct to confirmation screen
        if (requiresApproval) {
          setAwaitingApprovalBookingId(createdBookingId);
          return;
        }

        // Step C: Initiate agent payment
        if (paymentMethod === "STRIPE") {
          const successUrl = `${origin}/checkout/success?bookingId=${createdBookingId}&session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${origin}/checkout/cancel?bookingId=${createdBookingId}`;

          const stripeRes = await createAgentStripeSession({
            bookingId: createdBookingId,
            successUrl,
            cancelUrl,
          }).unwrap();

          if (stripeRes.data?.sessionUrl) {
            window.location.href = stripeRes.data.sessionUrl;
            return;
          } else {
            throw new Error("Unable to initialize Stripe Checkout session.");
          }
        } else {
          await createAgentManualPayment({
            bookingId: createdBookingId,
            method: paymentMethod,
            reference: transferReference.trim() || undefined,
            receiptNote: receiptNote.trim() || undefined,
          }).unwrap();

          setManualSuccessBookingId(createdBookingId);
        }
      } else {
        // Customer Booking Flow
        const bookingRes = await createCustomerBooking({
          customerId: currentUser!.id,
          serviceId: tour!.id,
          travelDate,
          adults,
          children,
          infants,
          notes: combinedNotes,
        }).unwrap();

        createdBookingId = bookingRes.data?.id;
        if (!createdBookingId) {
          throw new Error("Failed to receive booking confirmation from server.");
        }

        if (paymentMethod === "STRIPE") {
          const successUrl = `${origin}/checkout/success?bookingId=${createdBookingId}&session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${origin}/checkout/cancel?bookingId=${createdBookingId}`;

          const stripeRes = await createCustomerStripeSession({
            bookingId: createdBookingId,
            successUrl,
            cancelUrl,
          }).unwrap();

          if (stripeRes.data?.sessionUrl) {
            window.location.href = stripeRes.data.sessionUrl;
            return;
          } else {
            throw new Error("Unable to initialize Stripe Checkout session.");
          }
        } else {
          await createCustomerManualPayment({
            bookingId: createdBookingId,
            method: paymentMethod,
            reference: transferReference.trim() || undefined,
            receiptNote: receiptNote.trim() || undefined,
          }).unwrap();

          setManualSuccessBookingId(createdBookingId);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const message =
        errorObj?.data?.message ||
        errorObj?.message ||
        "An unexpected error occurred while processing your booking. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthInitialized || isTourLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-16" data-testid="checkout-loading">
          <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
          <p className="text-sm font-medium text-[#74818A]">Loading tour checkout details...</p>
        </div>
      </div>
    );
  }

  if (isTourError || !tour) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E5EAED] bg-white p-8 text-center" data-testid="checkout-tour-error">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="mt-3 font-outfit text-xl font-bold text-[#18282A]">Tour Not Found</h2>
          <p className="mt-2 text-xs text-[#74818A]">
            The tour you selected is not available or has expired. Please select a tour from our catalog.
          </p>
          <div className="mt-6">
            <Link href="/tours">
              <Button className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Browse All Tours
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Price Approval required screen
  if (awaitingApprovalBookingId) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div
          className="mx-auto max-w-md rounded-2xl border border-[#E5EAED] bg-white p-8 text-center shadow-xs"
          data-testid="awaiting-approval-success"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 border border-purple-200">
            <ShieldCheck className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="mt-4 font-outfit text-2xl font-bold text-[#18282A]">
            Submitted for Price Review
          </h2>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            Your custom partner rate request has been submitted to management for price approval. You will be notified once reviewed.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/dashboard/agent/bookings" className="block">
              <Button className="w-full bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]">
                Go to Agency Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Manual payment submitted success state
  if (manualSuccessBookingId) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E5EAED] bg-white p-8 text-center shadow-xs" data-testid="manual-payment-success">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-4 font-outfit text-2xl font-bold text-[#18282A]">Booking Request Submitted</h2>
          <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
            Your tour reservation has been received. Your payment record is now awaiting verification by our reservations team.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href={isAgent ? "/dashboard/agent/bookings" : `/dashboard/bookings/${manualSuccessBookingId}`}
              className="block"
            >
              <Button className="w-full bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]">
                {isAgent ? "View Agency Bookings" : "View Booking Details"}
              </Button>
            </Link>
            {!isAgent && (
              <Link href="/dashboard/bookings" className="block">
                <Button variant="outline" className="w-full border-[#E5EAED] text-xs font-medium text-[#18282A]">
                  Go to My Bookings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-8 sm:py-12" data-testid="checkout-page">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href={`/tours/${tour.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#74818A] hover:text-[#176779] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Tour Details</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            Confirm &amp; Book Tour
          </h1>
          <p className="mt-1 text-sm text-[#74818A]">
            Review your trip details, customize guest counts, and secure your reservation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Form Fields */}
          <div className="space-y-6 lg:col-span-7">
            {/* Travel Date & Guests Card */}
            <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-2xs">
              <h2 className="font-outfit text-base font-bold text-[#18282A] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#176779]" />
                <span>1. Travel Schedule &amp; Guests</span>
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="travelDate" className="block text-xs font-semibold text-[#18282A] mb-1.5">
                    Selected Travel Date
                  </label>
                  <Input
                    id="travelDate"
                    type="date"
                    min={tomorrow}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    required
                    className="h-10 text-xs border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                    data-testid="checkout-date-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                    <span className="text-[11px] font-semibold text-[#74818A] block">Adults (12+)</span>
                    <span className="text-xs text-[#176779] font-bold block mb-2">
                      {formatPrice(unitAdultPrice, currency)}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults((a) => Math.max(1, a - 1))}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="adults-decrement"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#18282A] min-w-[20px]" data-testid="adults-count">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults((a) => a + 1)}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="adults-increment"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                    <span className="text-[11px] font-semibold text-[#74818A] block">Children (4-11)</span>
                    <span className="text-xs text-[#176779] font-bold block mb-2">
                      {formatPrice(unitChildPrice, currency)}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren((c) => Math.max(0, c - 1))}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="children-decrement"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#18282A] min-w-[20px]" data-testid="children-count">
                        {children}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildren((c) => c + 1)}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="children-increment"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-center">
                    <span className="text-[11px] font-semibold text-[#74818A] block">Infants (0-3)</span>
                    <span className="text-xs text-[#0E7A67] font-bold block mb-2">
                      {unitInfantPrice === 0 ? "Free" : formatPrice(unitInfantPrice, currency)}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInfants((i) => Math.max(0, i - 1))}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="infants-decrement"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#18282A] min-w-[20px]" data-testid="infants-count">
                        {infants}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInfants((i) => i + 1)}
                        className="h-7 w-7 rounded-lg border border-[#E5EAED] bg-white font-bold text-xs text-[#18282A] hover:bg-slate-100"
                        data-testid="infants-increment"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-2xs">
              <h2 className="font-outfit text-base font-bold text-[#18282A] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#176779]" />
                <span>
                  {isAgent
                    ? "2. Customer / Lead Traveler Details (Agency Client)"
                    : "2. Lead Traveler Contact Details"}
                </span>
              </h2>

              {isAgent && (
                <p className="mt-1 text-xs text-[#74818A]">
                  Enter the details of your agency customer. Do not enter your own agent credentials.
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-[#18282A] mb-1.5">
                    {isAgent ? "Client Full Name *" : "Full Name"}
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    className="h-10 text-xs border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                    data-testid="checkout-name-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#18282A] mb-1.5">
                    {isAgent ? "Client Email Address *" : "Email Address"}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="h-10 text-xs border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                    data-testid="checkout-email-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-xs font-semibold text-[#18282A] mb-1.5">
                    {isAgent ? "Client Phone / WhatsApp" : "Phone Number / WhatsApp (Optional)"}
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+66 81 234 5678"
                    className="h-10 text-xs border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                    data-testid="checkout-phone-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-xs font-semibold text-[#18282A] mb-1.5">
                    Hotel Pickup &amp; Special Requests (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Hotel name for pickup, dietary requirements, or flight timing..."
                    className="w-full text-xs border border-[#E5EAED] rounded-xl p-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#176779]"
                    data-testid="checkout-notes-input"
                  />
                </div>
              </div>
            </div>

            {/* Agent Partner Pricing Card (Agents only) */}
            {isAgent && (
              <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-outfit text-base font-bold text-[#18282A] flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#176779]" />
                    <span>Partner Pricing &amp; Custom Discount</span>
                  </h2>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#18282A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAgentRate}
                      onChange={(e) => {
                        setUseAgentRate(e.target.checked);
                        if (e.target.checked && !agentProposedPrice) {
                          setAgentProposedPrice(String(totalCalculatedPrice));
                        }
                      }}
                      className="rounded border-[#E5EAED] text-[#176779] focus:ring-[#176779]"
                      data-testid="agent-toggle-custom-rate"
                    />
                    <span>Propose Partner Rate</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
                    <span className="text-[11px] text-[#74818A] block">Retail Amount</span>
                    <span className="mt-0.5 font-outfit text-base font-bold text-[#18282A] block">
                      {formatPrice(totalCalculatedPrice, currency)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
                    <span className="text-[11px] text-[#74818A] block">Instant Floor</span>
                    <span className="mt-0.5 font-outfit text-base font-bold text-emerald-700 block">
                      {formatPrice(minAutoApprovePrice, currency)}
                    </span>
                    <span className="text-[10px] text-[#74818A]">
                      {maxDiscountPercentage > 0
                        ? `Up to ${maxDiscountPercentage}% discount`
                        : "Standard rate"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
                    <span className="text-[11px] text-[#74818A] block">Approval Status</span>
                    {willRequirePriceApproval ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Requires Review
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Instant Confirm
                      </span>
                    )}
                  </div>
                </div>

                {useAgentRate && (
                  <div>
                    <label
                      htmlFor="agentProposedPrice"
                      className="block text-xs font-semibold text-[#18282A] mb-1"
                    >
                      Proposed Final Price ({currency}) *
                    </label>
                    <Input
                      id="agentProposedPrice"
                      type="number"
                      step="0.01"
                      min="1"
                      value={agentProposedPrice}
                      onChange={(e) => setAgentProposedPrice(e.target.value)}
                      className="h-9 text-xs border-[#E5EAED] rounded-xl"
                      data-testid="agent-proposed-price-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selection Card */}
            <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#EEF2F3] pb-3">
                <h2 className="font-outfit text-base font-bold text-[#18282A] flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#176779]" />
                  <span>3. Payment Method Selection</span>
                </h2>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#74818A]">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                {/* Stripe Card Option */}
                <label
                  className={`block rounded-xl border p-4.5 cursor-pointer transition-all ${
                    paymentMethod === "STRIPE"
                      ? "border-[#176779] bg-[#F3F9FA] shadow-xs ring-1 ring-[#176779]/20"
                      : "border-[#E5EAED] bg-white hover:bg-[#FAFCFD] hover:border-[#D0DBDE]"
                  }`}
                  data-testid="payment-method-stripe"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="STRIPE"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="mt-1 text-[#176779] focus:ring-[#176779]"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Top Header Row with Title, Badge, and Card Network Logos */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#18282A]">Credit / Debit Card</span>
                          <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                            Instant Confirmation
                          </span>
                        </div>

                        {/* Supported Card Network Logos */}
                        <div className="flex items-center gap-1.5 flex-wrap" aria-label="Accepted card networks">
                          <div className="h-5.5 px-1.5 rounded border border-[#E5EAED] bg-white flex items-center shadow-3xs" title="Visa">
                            <VisaLogo className="h-2.5 w-auto" />
                          </div>
                          <div className="h-5.5 px-1.5 rounded border border-[#E5EAED] bg-white flex items-center shadow-3xs" title="Mastercard">
                            <MastercardLogo className="h-3 w-auto" />
                          </div>
                          <div className="h-5.5 px-1 rounded border border-[#E5EAED] bg-white flex items-center shadow-3xs" title="American Express">
                            <AmexLogo className="h-3 w-auto" />
                          </div>
                          <div className="h-5.5 px-1 rounded border border-[#E5EAED] bg-white flex items-center shadow-3xs" title="UnionPay">
                            <UnionPayLogo className="h-3 w-auto" />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-1.5 text-[11px] text-[#74818A] leading-relaxed">
                        Pay securely with Visa, Mastercard, American Express, or UnionPay. Direct transaction processed via Stripe Hosted Checkout.
                      </p>

                      {/* Official Stripe Subtitle & Trust Note */}
                      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#556972] border-t border-[#E5EAED]/60 pt-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Secure payment powered by</span>
                        <StripeLogo className="h-5 w-auto shrink-0 object-contain ml-0.5" />
                      </div>
                    </div>
                  </div>
                </label>

                {/* Bank Transfer Manual Option */}
                <label
                  className={`block rounded-xl border p-4.5 cursor-pointer transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-[#176779] bg-[#F3F9FA] shadow-xs ring-1 ring-[#176779]/20"
                      : "border-[#E5EAED] bg-white hover:bg-[#FAFCFD] hover:border-[#D0DBDE]"
                  }`}
                  data-testid="payment-method-bank"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="mt-1 text-[#176779] focus:ring-[#176779]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-[#176779]" />
                          <span className="text-xs font-bold text-[#18282A]">Direct Bank Transfer</span>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          Manual Verification
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#74818A]">
                        Transfer to our verified company bank account and submit your transaction slip reference.
                      </p>

                      {paymentMethod === "BANK_TRANSFER" && (
                        <div className="mt-3.5 space-y-2.5 border-t border-[#E5EAED] pt-3 text-xs">
                          {/* Configured Receiving Bank Details */}
                          <div className="rounded-xl bg-amber-50/80 p-3 text-[11px] text-amber-950 border border-amber-200/60 leading-relaxed shadow-3xs">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                              <Building className="h-3.5 w-3.5" />
                              <span>Verified Receiving Bank: Bangkok Bank (Phuket Branch)</span>
                            </div>
                            <div><strong>Account Name:</strong> Phuket Tours Co., Ltd.</div>
                            <div><strong>Account Number:</strong> 123-4-56789-0</div>
                            <div><strong>Swift Code:</strong> BKKTHBK</div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                              Transfer Reference / Slip ID *
                            </label>
                            <Input
                              value={transferReference}
                              onChange={(e) => setTransferReference(e.target.value)}
                              placeholder="e.g. TXN-987654321"
                              className="h-8 text-xs border-[#E5EAED] bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-[#176779]"
                              data-testid="checkout-bank-ref"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                              Receipt Notes (Optional)
                            </label>
                            <Input
                              value={receiptNote}
                              onChange={(e) => setReceiptNote(e.target.value)}
                              placeholder="e.g. Transferred from SCB Mobile App"
                              className="h-8 text-xs border-[#E5EAED] bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-[#176779]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Cash on Departure Option */}
                <label
                  className={`block rounded-xl border p-4.5 cursor-pointer transition-all ${
                    paymentMethod === "CASH"
                      ? "border-[#176779] bg-[#F3F9FA] shadow-xs ring-1 ring-[#176779]/20"
                      : "border-[#E5EAED] bg-white hover:bg-[#FAFCFD] hover:border-[#D0DBDE]"
                  }`}
                  data-testid="payment-method-cash"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === "CASH"}
                      onChange={() => setPaymentMethod("CASH")}
                      className="mt-1 text-[#176779] focus:ring-[#176779]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-[#0E7A67]" />
                          <span className="text-xs font-bold text-[#18282A]">Cash at Pier / Hotel Pickup</span>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          Pay on Arrival
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#74818A]">
                        Pay in cash directly to your tour guide or coordinator on the morning of departure.
                      </p>
                    </div>
                  </div>
                </label>

                {/* PayPal (Architecture ready, currently unavailable) */}
                <div
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4.5 opacity-65 cursor-not-allowed"
                  data-testid="payment-method-paypal-disabled"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled
                      className="mt-1 text-slate-400 cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <PayPalLogo className="h-3.5 w-auto opacity-60" />
                          <span className="text-xs font-semibold text-slate-500">PayPal</span>
                        </div>
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          Coming Soon
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        PayPal wallet checkout will be supported in an upcoming release.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Action */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-xs lg:sticky lg:top-6">
              <h3 className="font-outfit text-base font-bold text-[#18282A] border-b border-[#EEF2F3] pb-3">
                Booking Summary
              </h3>

              {/* Tour Snapshot */}
              <div className="mt-4 flex gap-3.5">
                {tour.featuredImage || tour.images?.[0] ? (
                  <div className="relative h-18 w-22 shrink-0 overflow-hidden rounded-xl border border-[#EEF2F3]">
                    <Image
                      src={tour.featuredImage || tour.images[0]}
                      alt={tour.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h4 className="font-outfit text-sm font-bold text-[#18282A] line-clamp-2">
                    {tour.title}
                  </h4>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#74818A]">
                    {tour.destination && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#176779]" />
                        <span>{tour.destination}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#176779]" />
                      <span>{tour.duration}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Line items pricing breakdown */}
              <div className="mt-5 space-y-2.5 border-t border-[#EEF2F3] pt-4 text-xs">
                <div className="flex items-center justify-between text-[#74818A]">
                  <span>
                    Adult ({adults} × {formatPrice(unitAdultPrice, currency)})
                  </span>
                  <span className="font-medium text-[#18282A]">
                    {formatPrice(adults * unitAdultPrice, currency)}
                  </span>
                </div>

                {children > 0 && (
                  <div className="flex items-center justify-between text-[#74818A]">
                    <span>
                      Child ({children} × {formatPrice(unitChildPrice, currency)})
                    </span>
                    <span className="font-medium text-[#18282A]">
                      {formatPrice(children * unitChildPrice, currency)}
                    </span>
                  </div>
                )}

                {infants > 0 && (
                  <div className="flex items-center justify-between text-[#74818A]">
                    <span>Infant ({infants} × Free)</span>
                    <span className="font-medium text-[#0E7A67]">Free</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#74818A]">
                  <span>National Park Fees &amp; Taxes</span>
                  <span className="font-medium text-[#0E7A67]">Included</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-[#EEF2F3] pt-3">
                  <div>
                    <span className="text-sm font-bold text-[#18282A] block">Total Amount</span>
                    <span className="text-[10px] text-[#74818A]">
                      {isAgent && useAgentRate
                        ? "Partner proposed pricing applied"
                        : "Verified & calculated by server"}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[#176779]" data-testid="checkout-total-price">
                    {formatPrice(effectiveFinalPrice, currency)}
                  </span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200"
                  role="alert"
                  data-testid="checkout-error-alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isBusy}
                className="mt-5 w-full h-11 rounded-full bg-[#176779] hover:bg-[#135664] text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                data-testid="checkout-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Processing Reservation...</span>
                  </>
                ) : willRequirePriceApproval ? (
                  <span>Submit for Price Approval</span>
                ) : paymentMethod === "STRIPE" ? (
                  <span>Proceed to Stripe Payment</span>
                ) : (
                  <span>Submit Booking Request</span>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#74818A]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>SSL Encrypted • Trusted Phuket Travel Agency</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
            <p className="text-sm font-medium text-[#74818A]">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}
