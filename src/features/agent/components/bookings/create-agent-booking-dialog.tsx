"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetToursQuery } from "@/features/tours/api/tours-api";
import {
  useGetAgentCustomersQuery,
  useCreateAgentCustomerMutation,
  useGetAgentPricingLimitsQuery,
  useCreateAgentBookingMutation,
} from "../../api/agent-api";
import { formatAgentCurrency } from "../../utils/agent-formatters";
import {
  Calendar,
  Compass,
  Users,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

interface CreateAgentBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

export function CreateAgentBookingDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateAgentBookingDialogProps) {
  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [customerMode, setCustomerMode] = React.useState<"NEW" | "EXISTING">("NEW");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");

  const [selectedTourId, setSelectedTourId] = React.useState("");
  const [travelDate, setTravelDate] = React.useState(tomorrow);
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [infants, setInfants] = React.useState(0);

  const [useCustomPrice, setUseCustomPrice] = React.useState(false);
  const [customProposedPrice, setCustomProposedPrice] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { data: toursData, isLoading: isToursLoading } = useGetToursQuery(
    { page: 1, limit: 50 },
    { skip: !isOpen },
  );

  const { data: customersRes, isLoading: isCustomersLoading } =
    useGetAgentCustomersQuery({ limit: 50 }, { skip: !isOpen });

  const { data: pricingLimitsRes } = useGetAgentPricingLimitsQuery(
    { serviceId: selectedTourId || undefined },
    { skip: !isOpen || !selectedTourId },
  );

  const [createAgentCustomer, { isLoading: isCreatingCustomer }] =
    useCreateAgentCustomerMutation();
  const [createAgentBooking, { isLoading: isCreatingBooking }] =
    useCreateAgentBookingMutation();

  const tours = toursData?.data || [];
  const customers = customersRes?.data?.items || [];
  // Auto-select first tour when loaded
  React.useEffect(() => {
    if (!selectedTourId && tours.length > 0) {
      setSelectedTourId(tours[0].id);
    }
  }, [selectedTourId, tours]);

  const selectedTour = React.useMemo(
    () => tours.find((t) => t.id === selectedTourId) || null,
    [tours, selectedTourId],
  );

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

  const calculatedBasePrice = React.useMemo(() => {
    return (
      Math.round(
        (adults * unitAdultPrice +
          children * unitChildPrice +
          infants * unitInfantPrice) *
          100,
      ) / 100
    );
  }, [adults, children, infants, unitAdultPrice, unitChildPrice, unitInfantPrice]);

  const pricingLimit = pricingLimitsRes?.data;
  const maxDiscountPercentage = pricingLimit?.maxDiscountPercentage ?? 0;

  const minAutoApprovePrice = React.useMemo(() => {
    if (calculatedBasePrice <= 0) return calculatedBasePrice;
    return (
      Math.round(calculatedBasePrice * (1 - maxDiscountPercentage / 100) * 100) / 100
    );
  }, [maxDiscountPercentage, calculatedBasePrice]);

  const effectiveProposedPrice = React.useMemo(() => {
    if (!useCustomPrice || !customProposedPrice.trim()) {
      return calculatedBasePrice;
    }
    const parsed = Number(customProposedPrice);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : calculatedBasePrice;
  }, [useCustomPrice, customProposedPrice, calculatedBasePrice]);

  const willRequireApproval =
    useCustomPrice &&
    effectiveProposedPrice < calculatedBasePrice &&
    effectiveProposedPrice < minAutoApprovePrice;

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      let resolvedCustomerId = selectedCustomerId;
      let resolvedCustomerLabel = "";

      if (customerMode === "EXISTING") {
        if (!selectedCustomerId) {
          setErrorMsg("Please select an existing customer or switch to New Customer.");
          return;
        }
        const existingCust = customers.find((c) => c.id === selectedCustomerId);
        resolvedCustomerLabel = existingCust
          ? `${existingCust.name} (${existingCust.email})`
          : "";
      } else {
        if (!customerName.trim() || !customerEmail.trim()) {
          setErrorMsg("Please provide the customer's full name and email address.");
          return;
        }
        const custRes = await createAgentCustomer({
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim() || null,
        }).unwrap();
        resolvedCustomerId = custRes.data.id;
        resolvedCustomerLabel = `${custRes.data.name} (${custRes.data.email})`;
      }

      if (useCustomPrice) {
        const parsed = Number(customProposedPrice);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          setErrorMsg("Please enter a valid proposed price greater than 0.");
          return;
        }
      }

      const combinedNotes = [
        resolvedCustomerLabel ? `Customer: ${resolvedCustomerLabel}` : null,
        notes.trim() ? notes.trim() : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const bookingRes = await createAgentBooking({
        customerId: resolvedCustomerId,
        serviceId: selectedTourId,
        travelDate,
        adults,
        children,
        infants,
        proposedPrice: effectiveProposedPrice,
        notes: combinedNotes || undefined,
      }).unwrap();

      if (onSuccess && bookingRes.data?.id) {
        onSuccess(bookingRes.data.id);
      }
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMsg(
        errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to create booking. Please verify inputs and try again.",
      );
    }
  };

  const isBusy = isCreatingCustomer || isCreatingBooking;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Partner Booking"
      description="Create a tour reservation on behalf of your agency client."
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 pt-1"
        data-testid="create-agent-booking-dialog"
      >
        {/* 1. Customer Selection / Creation */}
        <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <UserPlus className="h-4 w-4 text-[#176779]" />
              <span>1. Client / Lead Traveler</span>
            </div>
            {customers.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-[#E5EAED] bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerMode("NEW")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    customerMode === "NEW"
                      ? "bg-[#176779] text-white"
                      : "text-[#74818A] hover:text-[#18282A]"
                  }`}
                  data-testid="agent-customer-mode-new"
                >
                  New Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("EXISTING");
                    if (!selectedCustomerId && customers[0]) {
                      setSelectedCustomerId(customers[0].id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    customerMode === "EXISTING"
                      ? "bg-[#176779] text-white"
                      : "text-[#74818A] hover:text-[#18282A]"
                  }`}
                  data-testid="agent-customer-mode-existing"
                >
                  Past Clients ({customers.length})
                </button>
              </div>
            )}
          </div>

          {customerMode === "EXISTING" && customers.length > 0 ? (
            <div>
              <label
                htmlFor="agent-existing-customer"
                className="block text-xs font-semibold text-[#18282A] mb-1"
              >
                Select Client
              </label>
              <select
                id="agent-existing-customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                disabled={isCustomersLoading}
                className="h-9 w-full rounded-xl border border-[#E5EAED] bg-white px-3 text-xs text-[#18282A] focus:outline-none focus:ring-1 focus:ring-[#176779]"
                data-testid="agent-existing-customer-select"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.email} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="agent-cust-name"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Client Full Name *
                </label>
                <Input
                  id="agent-cust-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="agent-booking-customer-name"
                />
              </div>
              <div>
                <label
                  htmlFor="agent-cust-email"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Client Email *
                </label>
                <Input
                  id="agent-cust-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="agent-booking-customer-email"
                />
              </div>
              <div>
                <label
                  htmlFor="agent-cust-phone"
                  className="block text-[11px] font-semibold text-[#18282A] mb-1"
                >
                  Phone / WhatsApp
                </label>
                <Input
                  id="agent-cust-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+66 81 234 5678"
                  className="h-9 text-xs bg-white border-[#E5EAED] rounded-xl"
                  data-testid="agent-booking-customer-phone"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Tour, Date & Guests */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
            <Compass className="h-4 w-4 text-[#176779]" />
            <span>2. Tour Package &amp; Guest Schedule</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="agent-tour-select"
                className="block text-[11px] font-semibold text-[#18282A] mb-1"
              >
                Select Tour *
              </label>
              <select
                id="agent-tour-select"
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
                disabled={isToursLoading}
                className="h-9 w-full rounded-xl border border-[#E5EAED] bg-white px-3 text-xs text-[#18282A] focus:outline-none focus:ring-1 focus:ring-[#176779]"
                data-testid="agent-booking-tour-select"
              >
                {tours.length === 0 ? (
                  <option value="">Loading tours...</option>
                ) : (
                  tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({formatAgentCurrency(t.price?.amount ?? 0, t.price?.currency || "USD")})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="agent-travel-date"
                className="block text-[11px] font-semibold text-[#18282A] mb-1"
              >
                Travel Date *
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" />
                <Input
                  id="agent-travel-date"
                  type="date"
                  min={tomorrow}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="h-9 pl-9 text-xs border-[#E5EAED] rounded-xl"
                  data-testid="agent-booking-date-input"
                />
              </div>
            </div>
          </div>

          {/* Guest Counters */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-2.5 text-center">
              <span className="text-[11px] font-semibold text-[#74818A] block">
                Adults (12+)
              </span>
              <span className="text-[11px] text-[#176779] font-bold block mb-1.5">
                {formatAgentCurrency(unitAdultPrice, currency)}
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
                  data-testid="agent-booking-adults-count"
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
                {formatAgentCurrency(unitChildPrice, currency)}
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
                  data-testid="agent-booking-children-count"
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
                {unitInfantPrice === 0
                  ? "Free"
                  : formatAgentCurrency(unitInfantPrice, currency)}
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
                  data-testid="agent-booking-infants-count"
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

        {/* 3. Partner Pricing & Discount Control */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
              <Coins className="h-4 w-4 text-[#176779]" />
              <span>3. Partner Pricing &amp; Rate</span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#18282A] cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomPrice}
                onChange={(e) => {
                  setUseCustomPrice(e.target.checked);
                  if (e.target.checked && !customProposedPrice) {
                    setCustomProposedPrice(String(calculatedBasePrice));
                  }
                }}
                className="rounded border-[#E5EAED] text-[#176779] focus:ring-[#176779]"
                data-testid="agent-booking-custom-price-toggle"
              />
              <span>Propose Custom Partner Rate</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
              <span className="text-[11px] text-[#74818A] block">
                Standard Retail Total
              </span>
              <span
                className="mt-0.5 font-outfit text-base font-bold text-[#18282A] block"
                data-testid="agent-booking-base-price"
              >
                {formatAgentCurrency(calculatedBasePrice, currency)}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
              <span className="text-[11px] text-[#74818A] block">
                Instant Approval Floor
              </span>
              <span className="mt-0.5 font-outfit text-base font-bold text-emerald-700 block">
                {formatAgentCurrency(minAutoApprovePrice, currency)}
              </span>
              <span className="text-[10px] text-[#74818A]">
                {maxDiscountPercentage > 0
                  ? `Up to ${maxDiscountPercentage}% partner discount`
                  : "Standard rate"}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3">
              <span className="text-[11px] text-[#74818A] block">
                Booking Rate Status
              </span>
              {willRequireApproval ? (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Requires Admin Approval
                </span>
              ) : (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Instant Confirmation
                </span>
              )}
            </div>
          </div>

          {useCustomPrice && (
            <div>
              <label
                htmlFor="agent-proposed-price"
                className="block text-[11px] font-semibold text-[#18282A] mb-1"
              >
                Proposed Final Price ({currency}) *
              </label>
              <Input
                id="agent-proposed-price"
                type="number"
                step="0.01"
                min="1"
                value={customProposedPrice}
                onChange={(e) => setCustomProposedPrice(e.target.value)}
                className="h-9 text-xs border-[#E5EAED] rounded-xl"
                data-testid="agent-booking-proposed-price-input"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="agent-booking-notes"
              className="block text-[11px] font-semibold text-[#18282A] mb-1"
            >
              Hotel Pickup &amp; Operational Notes (Optional)
            </label>
            <Input
              id="agent-booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pickup at Patong Resort Lobby, vegetarian meal..."
              className="h-9 text-xs border-[#E5EAED] rounded-xl"
              data-testid="agent-booking-notes-input"
            />
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="agent-booking-create-error"
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
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
            data-testid="agent-booking-submit-btn"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Creating Reservation...</span>
              </>
            ) : willRequireApproval ? (
              <span>Submit for Price Approval</span>
            ) : (
              <span>Create Confirmed Booking</span>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

