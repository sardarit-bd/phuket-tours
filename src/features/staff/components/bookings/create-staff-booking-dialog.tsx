"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { useGetToursQuery } from "@/features/tours/api/tours-api";
import {
  useGetAdminUsersQuery,
  useCreateStaffBookingMutation,
  useGenerateStaffPaymentLinkMutation,
} from "@/features/admin/api/admin-api";
import {
  Calendar,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  ArrowRight,
  Eye,
  Link as LinkIcon,
  Copy,
  Share2,
  Check,
} from "lucide-react";

export interface StaffBookingSuccessSummary {
  bookingId: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  tourName: string;
  travelDate: string;
  guestSummary: string;
  finalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

interface CreateStaffBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
  onViewBookingDetails?: (bookingId: string) => void;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CreateStaffBookingDialog({
  isOpen,
  onClose,
  onSuccess,
  onViewBookingDetails,
}: CreateStaffBookingDialogProps) {
  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Customer state
  const [customerMode, setCustomerMode] = React.useState<"NEW" | "EXISTING">("NEW");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");

  // Tour and Schedule state
  const [selectedTourId, setSelectedTourId] = React.useState("");
  const [travelDate, setTravelDate] = React.useState(tomorrow);
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [infants, setInfants] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  // UI status state
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = React.useState<StaffBookingSuccessSummary | null>(null);
  const [generatedPaymentUrl, setGeneratedPaymentUrl] = React.useState<string | null>(null);
  const [paymentExpiry, setPaymentExpiry] = React.useState<string | null>(null);
  const [paymentLinkError, setPaymentLinkError] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  // Queries
  const {
    data: toursData,
    isLoading: isToursLoading,
    isError: isToursError,
  } = useGetToursQuery({ page: 1, limit: 50 }, { skip: !isOpen });

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useGetAdminUsersQuery(
    { role: "customer", limit: 50 },
    { skip: !isOpen }
  );

  // Mutations
  const [createStaffBooking, { isLoading: isCreatingBooking }] =
    useCreateStaffBookingMutation();
  const [generateStaffPaymentLink, { isLoading: isGeneratingPaymentLink }] =
    useGenerateStaffPaymentLinkMutation();

  const tours = toursData?.data || [];
  const existingCustomers = customersData?.data?.items || [];

  const tourOptions = React.useMemo(() => {
    return tours.map((t) => ({
      value: t.id,
      label: `${t.title} (${formatCurrency(t.price?.amount ?? 0, t.price?.currency || "USD")})`,
    }));
  }, [tours]);

  const customerOptions = React.useMemo(() => {
    return existingCustomers.map((c) => ({
      value: c.id,
      label: `${c.name} — ${c.email}${c.phone ? ` (${c.phone})` : ""}`,
    }));
  }, [existingCustomers]);

  const toursErrorMessage = isToursError
    ? "Failed to load tours. Please retry."
    : null;

  const customersErrorMessage = isCustomersError
    ? "Failed to load existing customers."
    : null;

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setCreatedSummary(null);
      setGeneratedPaymentUrl(null);
      setPaymentExpiry(null);
      setPaymentLinkError(null);
      setIsCopied(false);
    }
  }, [isOpen]);

  // Auto-select first tour if none selected
  React.useEffect(() => {
    if (!selectedTourId && tours.length > 0) {
      setSelectedTourId(tours[0].id);
    }
  }, [selectedTourId, tours]);

  const selectedTour = React.useMemo(
    () => tours.find((t) => t.id === selectedTourId) || null,
    [tours, selectedTourId]
  );

  // Standard Pricing Preview (Server remains authoritative)
  const currency = selectedTour?.price?.currency || "USD";
  const unitAdultPrice = selectedTour?.price?.amount ?? 0;
  const tiers = selectedTour?.pricingTiers ?? [];
  const childTier = tiers.find((t) => /child/i.test(t.tierName));
  const infantTier = tiers.find((t) => /infant/i.test(t.tierName));
  const unitChildPrice =
    childTier && childTier.price >= 0
      ? childTier.price
      : Math.round(unitAdultPrice * 0.7 * 100) / 100;
  const unitInfantPrice =
    infantTier && infantTier.price >= 0 ? infantTier.price : 0;

  const estimatedStandardPrice = React.useMemo(() => {
    return (
      Math.round(
        (adults * unitAdultPrice +
          children * unitChildPrice +
          infants * unitInfantPrice) *
          100
      ) / 100
    );
  }, [adults, children, infants, unitAdultPrice, unitChildPrice, unitInfantPrice]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedTourId) {
      setErrorMsg("Please select a tour package.");
      return;
    }
    if (!travelDate) {
      setErrorMsg("Please select a travel date.");
      return;
    }
    if (adults < 1) {
      setErrorMsg("At least 1 adult guest is required.");
      return;
    }

    let payload: Parameters<typeof createStaffBooking>[0];
    let resolvedCustomerName = "";
    let resolvedCustomerEmail = "";
    let resolvedCustomerPhone: string | null = null;

    if (customerMode === "EXISTING") {
      if (!selectedCustomerId) {
        setErrorMsg("Please select an existing customer or switch to New Customer.");
        return;
      }
      const existingCust = existingCustomers.find((c) => c.id === selectedCustomerId);
      if (existingCust) {
        resolvedCustomerName = existingCust.name;
        resolvedCustomerEmail = existingCust.email;
        resolvedCustomerPhone = existingCust.phone || null;
      }
      payload = {
        customerId: selectedCustomerId,
        serviceId: selectedTourId,
        travelDate,
        adults,
        children,
        infants,
        notes: notes.trim() || undefined,
      };
    } else {
      if (!customerName.trim() || !customerEmail.trim()) {
        setErrorMsg("Please provide the customer's full name and email address.");
        return;
      }
      resolvedCustomerName = customerName.trim();
      resolvedCustomerEmail = customerEmail.trim();
      resolvedCustomerPhone = customerPhone.trim() || null;

      payload = {
        customer: {
          name: resolvedCustomerName,
          email: resolvedCustomerEmail,
          phone: resolvedCustomerPhone,
        },
        serviceId: selectedTourId,
        travelDate,
        adults,
        children,
        infants,
        notes: notes.trim() || undefined,
      };
    }

    try {
      const res = await createStaffBooking(payload).unwrap();
      const booking = res.data;

      if (!booking?.id) {
        throw new Error("Missing booking confirmation from server.");
      }

      const guestSummaryText = `${adults} Adults${
        children > 0 ? `, ${children} Children` : ""
      }${infants > 0 ? `, ${infants} Infants` : ""}`;

      const summary: StaffBookingSuccessSummary = {
        bookingId: booking.id,
        reference: booking.id,
        customerName: booking.customer?.name || resolvedCustomerName,
        customerEmail: booking.customer?.email || resolvedCustomerEmail,
        customerPhone: booking.customer?.phone ?? resolvedCustomerPhone,
        tourName: booking.service?.name || selectedTour?.title || "Tour Experience",
        travelDate,
        guestSummary: guestSummaryText,
        finalPrice: booking.finalPrice,
        currency: booking.currency || currency,
        status: booking.status || "PENDING",
        paymentStatus: booking.paymentStatus || "UNPAID",
      };

      setCreatedSummary(summary);

      if (onSuccess) {
        onSuccess(booking.id);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMsg(
        errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to create staff booking. Please verify inputs and try again."
      );
    }
  };

  const handleGeneratePaymentLink = async () => {
    if (!createdSummary?.bookingId) return;
    setPaymentLinkError(null);

    try {
      const res = await generateStaffPaymentLink({
        bookingId: createdSummary.bookingId,
      }).unwrap();

      if (res.data?.paymentUrl) {
        setGeneratedPaymentUrl(res.data.paymentUrl);
        setPaymentExpiry(res.data.expiresAt);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setPaymentLinkError(
        errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to generate payment link. Please check permissions or booking status."
      );
    }
  };

  const isBusy = isCreatingBooking || isGeneratingPaymentLink;

  // ── SUCCESS CONFIRMATION STATE ─────────────────────────────────────────
  if (createdSummary) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Staff Booking Created"
        description={`Reference: ${createdSummary.bookingId.slice(0, 8)}...`}
        size="lg"
      >
        <div className="space-y-5 pt-1" data-testid="staff-booking-created-success">
          {/* Header Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-outfit text-base font-bold text-[#18282A]">
                Booking Confirmed &amp; Saved
              </h3>
              <p className="text-xs text-[#5C6C6E] mt-0.5 leading-relaxed">
                The tour reservation has been persisted at standard retail rates. You can now generate a secure customer payment link to send directly to the traveler.
              </p>
            </div>
          </div>

          {/* Structured Booking Summary Details */}
          <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#E5EAED]">
              <div>
                <span className="text-[11px] text-[#74818A] block">Tour Experience</span>
                <span className="font-semibold text-[#18282A] text-sm line-clamp-1">
                  {createdSummary.tourName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74818A] block">Customer / Traveler</span>
                <span className="font-semibold text-[#18282A] text-sm">
                  {createdSummary.customerName}
                </span>
                <span className="text-[11px] text-[#74818A] block">
                  {createdSummary.customerEmail}
                  {createdSummary.customerPhone ? ` • ${createdSummary.customerPhone}` : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-[#74818A] block">Travel Date</span>
                <span className="font-semibold text-[#18282A]">
                  {formatDate(createdSummary.travelDate)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74818A] block">Guests</span>
                <span className="font-semibold text-[#18282A]">
                  {createdSummary.guestSummary}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74818A] block">Booking Status</span>
                <span className="inline-block font-semibold rounded-md px-2 py-0.5 text-[10px] bg-sky-100 text-sky-800">
                  {createdSummary.status}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74818A] block">Calculated Price</span>
                <span className="font-bold text-sm text-[#176779]">
                  {formatCurrency(createdSummary.finalPrice, createdSummary.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Link Section */}
          {generatedPaymentUrl ? (
            <div className="rounded-2xl border border-[#176779]/30 bg-[#F0F7F8] p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#176779]">
                  <LinkIcon className="h-4 w-4" />
                  <span>Customer Payment Link</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#465D61]">
                Share this secure link with the customer to complete payment online.
                {paymentExpiry && ` Valid until ${formatDate(paymentExpiry)}.`}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={generatedPaymentUrl}
                  className="text-xs bg-white border-[#E5EAED] text-[#18282A] font-mono h-8"
                  data-testid="staff-payment-url-input"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedPaymentUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="h-8 px-2.5 bg-white text-xs font-medium text-[#18282A] border-[#E5EAED] hover:bg-[#F8FAFB] shrink-0"
                  data-testid="staff-copy-link-btn"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello ${createdSummary.customerName}, here is your secure booking payment link for ${createdSummary.tourName}: ${generatedPaymentUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shrink-0"
                  data-testid="staff-share-whatsapp-btn"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-center space-y-2">
              <p className="text-xs text-[#64748B]">
                This booking is unpaid. Generate a secure payment link for the customer.
              </p>
              {paymentLinkError && (
                <div className="text-xs text-rose-600 font-medium">
                  {paymentLinkError}
                </div>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleGeneratePaymentLink}
                disabled={isGeneratingPaymentLink}
                className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer inline-flex items-center gap-1.5"
                data-testid="staff-generate-payment-link-btn"
              >
                {isGeneratingPaymentLink ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generating Link...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Generate Payment Link</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-[#E5EAED]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (onViewBookingDetails) {
                  onViewBookingDetails(createdSummary.bookingId);
                }
                onClose();
              }}
              className="w-full sm:w-auto text-xs font-semibold text-[#18282A] border-[#E5EAED] cursor-pointer"
              data-testid="staff-success-view-details-btn"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              <span>View Booking Details</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto bg-[#18282A] text-xs font-semibold text-white hover:bg-[#25393B] cursor-pointer"
              data-testid="staff-success-done-btn"
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  // ── ACTIVE BOOKING FORM STATE ──────────────────────────────────────────
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Staff Direct Booking"
      description="Create a tour reservation for a customer using standard pricing."
      size="lg"
    >
      <form
        onSubmit={handleBookingSubmit}
        className="space-y-5 pt-1"
        data-testid="create-staff-booking-dialog"
      >
        {/* 1. Customer Selection / Creation */}
        <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <UserPlus className="h-4 w-4 text-[#176779]" />
              <span>1. Customer / Lead Traveler</span>
            </div>
            {existingCustomers.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-[#E5EAED] bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerMode("NEW")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    customerMode === "NEW"
                      ? "bg-[#176779] text-white"
                      : "text-[#74818A] hover:text-[#18282A]"
                  }`}
                  data-testid="staff-customer-mode-new"
                >
                  New Guest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("EXISTING");
                    if (!selectedCustomerId && existingCustomers[0]) {
                      setSelectedCustomerId(existingCustomers[0].id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    customerMode === "EXISTING"
                      ? "bg-[#176779] text-white"
                      : "text-[#74818A] hover:text-[#18282A]"
                  }`}
                  data-testid="staff-customer-mode-existing"
                >
                  Existing Customer ({existingCustomers.length})
                </button>
              </div>
            )}
          </div>

          {customerMode === "EXISTING" && (
            <div>
              <label
                htmlFor="staff-existing-customer"
                className="block text-xs font-semibold text-[#18282A] mb-1"
              >
                Select Existing Customer
              </label>
              <CreatableSelect
                id="staff-existing-customer"
                value={selectedCustomerId}
                options={customerOptions}
                onChange={(val) => setSelectedCustomerId(val)}
                creatable={false}
                isLoading={isCustomersLoading}
                errorMessage={customersErrorMessage}
                placeholder="Select an existing customer"
                searchPlaceholder="Search customers by name or email..."
                emptyMessage="No matching customers found."
                triggerClassName="h-9 rounded-xl text-xs"
                data-testid="staff-existing-customer-select"
              />
            </div>
          )}

          {customerMode === "NEW" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="staff-cust-name"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Customer Full Name *
                </label>
                <Input
                  id="staff-cust-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="staff-booking-customer-name"
                />
              </div>
              <div>
                <label
                  htmlFor="staff-cust-email"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Customer Email *
                </label>
                <Input
                  id="staff-cust-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="staff-booking-customer-email"
                />
              </div>
              <div>
                <label
                  htmlFor="staff-cust-phone"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Phone / WhatsApp
                </label>
                <Input
                  id="staff-cust-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+66 81 234 5678"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="staff-booking-customer-phone"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Tour Package, Travel Date & Guests */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Compass className="h-4 w-4 text-[#176779]" />
            <span>2. Tour Package &amp; Guest Manifest</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="staff-tour-select"
                className="block text-[11px] font-semibold text-[#18282A] mb-1"
              >
                Select Published Tour *
              </label>
              <CreatableSelect
                id="staff-tour-select"
                value={selectedTourId}
                options={tourOptions}
                onChange={(val) => setSelectedTourId(val)}
                creatable={false}
                isLoading={isToursLoading}
                errorMessage={toursErrorMessage}
                placeholder="Select a tour package"
                searchPlaceholder="Search tours by name..."
                emptyMessage="No tours available."
                triggerClassName="h-9 rounded-xl text-xs"
                data-testid="staff-booking-tour-select"
              />
            </div>

            <div>
              <label
                htmlFor="staff-travel-date"
                className="block text-[11px] font-semibold text-[#18282A] mb-1"
              >
                Travel Date *
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" />
                <Input
                  id="staff-travel-date"
                  type="date"
                  min={tomorrow}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="h-9 pl-9 text-xs border-[#E5EAED] rounded-xl"
                  data-testid="staff-booking-date-input"
                />
              </div>
            </div>
          </div>

          {/* Passenger Counters */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-2.5 text-center">
              <span className="text-[11px] font-semibold text-[#74818A] block">
                Adults (12+)
              </span>
              <span className="text-[11px] text-[#176779] font-bold block mb-1.5">
                {formatCurrency(unitAdultPrice, currency)}
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <span
                  className="text-xs font-bold text-[#18282A] min-w-[18px]"
                  data-testid="staff-booking-adults-count"
                >
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults((a) => a + 1)}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-2.5 text-center">
              <span className="text-[11px] font-semibold text-[#74818A] block">
                Children (4-11)
              </span>
              <span className="text-[11px] text-[#176779] font-bold block mb-1.5">
                {formatCurrency(unitChildPrice, currency)}
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <span
                  className="text-xs font-bold text-[#18282A] min-w-[18px]"
                  data-testid="staff-booking-children-count"
                >
                  {children}
                </span>
                <button
                  type="button"
                  onClick={() => setChildren((c) => c + 1)}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-2.5 text-center">
              <span className="text-[11px] font-semibold text-[#74818A] block">
                Infants (0-3)
              </span>
              <span className="text-[11px] text-[#0E7A67] font-bold block mb-1.5">
                {unitInfantPrice === 0 ? "Free" : formatCurrency(unitInfantPrice, currency)}
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfants((i) => Math.max(0, i - 1))}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  -
                </button>
                <span
                  className="text-xs font-bold text-[#18282A] min-w-[18px]"
                  data-testid="staff-booking-infants-count"
                >
                  {infants}
                </span>
                <button
                  type="button"
                  onClick={() => setInfants((i) => i + 1)}
                  className="h-6 w-6 rounded border border-[#E5EAED] bg-white font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Standard Pricing Preview & Operational Notes */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#18282A]">
              3. Standard Pricing Preview
            </span>
            <span className="text-[11px] text-[#74818A]">
              Server calculates final price
            </span>
          </div>

          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#74818A] block">
                Estimated Total (Standard Rates)
              </span>
              <span
                className="font-outfit text-base font-bold text-[#176779] block mt-0.5"
                data-testid="staff-booking-estimated-price"
              >
                {formatCurrency(estimatedStandardPrice, currency)}
              </span>
            </div>
            <div className="text-right text-[11px] text-[#74818A]">
              <span>Direct Booking</span>
              <span className="block text-[10px] text-emerald-700 font-medium">No Commission Applied</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="staff-booking-notes"
              className="block text-[11px] font-semibold text-[#18282A] mb-1"
            >
              Operational Notes (Optional)
            </label>
            <Input
              id="staff-booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hotel pickup details, special customer requests..."
              className="h-9 text-xs border-[#E5EAED] rounded-xl"
              data-testid="staff-booking-notes-input"
            />
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="staff-booking-create-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isBusy}
            className="text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isBusy || isToursLoading}
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer inline-flex items-center gap-1.5"
            data-testid="staff-booking-submit-btn"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating Booking...</span>
              </>
            ) : (
              <>
                <span>Create Booking</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
