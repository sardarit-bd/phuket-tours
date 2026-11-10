"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgentBookingRecord } from "../../types/agent";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
  AgentPriceApprovalBadge,
  AgentCommissionStatusBadge,
  AgentFulfillmentStatusBadge,
} from "../common/agent-status-badges";
import {
  formatAgentCurrency,
  extractTravelDateRaw,
  extractGuestsFromNotes,
  formatAgentDate,
} from "../../utils/agent-formatters";
import {
  useGetAgentBookingHistoryQuery,
  useUpdateAgentBookingPriceMutation,
  useCreateAgentPaymentMutation,
  useCreateAgentStripeSessionMutation,
  useGenerateAgentPaymentLinkMutation,
} from "../../api/agent-api";
import {
  Calendar,
  Compass,
  User,
  Mail,
  Phone,
  FileText,
  Coins,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  History,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  Banknote,
  ArrowRight,
  ShieldAlert,
  Link as LinkIcon,
  Copy,
  Share2,
  Check,
} from "lucide-react";

interface AgentBookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AgentBookingRecord | null;
  onBookingUpdated?: () => void;
  initialTab?: "DETAILS" | "HISTORY" | "PAYMENT";
}

export function AgentBookingDetailsDialog({
  isOpen,
  onClose,
  booking,
  onBookingUpdated,
  initialTab = "DETAILS",
}: AgentBookingDetailsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"DETAILS" | "HISTORY" | "PAYMENT">(initialTab);
  const [isRevisingPrice, setIsRevisingPrice] = React.useState(false);
  const [proposedPriceInput, setProposedPriceInput] = React.useState("");
  const [revisionNotesInput, setRevisionNotesInput] = React.useState("");
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = React.useState<"STRIPE" | "BANK_TRANSFER" | "CASH">("STRIPE");
  const [paymentRef, setPaymentRef] = React.useState("");
  const [receiptNote, setReceiptNote] = React.useState("");

  const [updatePrice, { isLoading: isUpdatingPrice }] = useUpdateAgentBookingPriceMutation();
  const [createStripeSession, { isLoading: isCreatingStripe }] = useCreateAgentStripeSessionMutation();
  const [createManualPayment, { isLoading: isCreatingPayment }] = useCreateAgentPaymentMutation();
  const [generatePaymentLink, { isLoading: isGeneratingLink }] = useGenerateAgentPaymentLinkMutation();

  const [customerPaymentUrl, setCustomerPaymentUrl] = React.useState<string | null>(null);
  const [linkCopied, setLinkCopied] = React.useState(false);

  const bookingId = booking?.id || "";
  const {
    data: historyRes,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetAgentBookingHistoryQuery(bookingId, {
    skip: !isOpen || !bookingId,
  });

  const historyItems = historyRes?.data?.items || [];

  React.useEffect(() => {
    if (booking) {
      setProposedPriceInput(String(booking.proposedPrice ?? booking.finalPrice ?? ""));
      setRevisionNotesInput("");
      setFeedbackMsg(null);
      setIsRevisingPrice(false);
      setActiveTab(initialTab);
      setCustomerPaymentUrl(null);
      setLinkCopied(false);
    }
  }, [booking, initialTab]);

  const handleGenerateCustomerLink = async () => {
    if (!booking) return;
    try {
      setFeedbackMsg(null);
      const res = await generatePaymentLink({ bookingId: booking.id }).unwrap();
      if (res?.data?.paymentUrl) {
        setCustomerPaymentUrl(res.data.paymentUrl);
        setFeedbackMsg({
          type: "success",
          text: "Customer payment link generated! You can now copy and share it with your guest.",
        });
        refetchHistory();
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.data?.message || "Failed to generate payment link.",
      });
    }
  };

  if (!booking) return null;

  const currency = booking.currency || "THB";
  const effectiveTravelDate = extractTravelDateRaw(booking.availability?.date, booking.notes);
  const parsedGuests = extractGuestsFromNotes(booking.notes);

  // Financial calculations
  const totalAmount = booking.finalPrice ?? 0;
  // Calculate verified paid amount from attached payments
  const verifiedPaidAmount = (booking.payments || [])
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const outstandingBalance =
    booking.paymentStatus === "PAID"
      ? 0
      : Math.max(0, totalAmount - verifiedPaidAmount);

  const isAwaitingPriceApproval =
    booking.requiresApproval || booking.status === "AWAITING_APPROVAL";

  const isUnpaidOrPartial =
    booking.paymentStatus === "UNPAID" || booking.paymentStatus === "PARTIALLY_PAID";

  const isCancelledOrRejected =
    booking.status === "CANCELLED" || booking.status === "FAILED";

  const canInitiatePayment =
    isUnpaidOrPartial &&
    !isAwaitingPriceApproval &&
    !isCancelledOrRejected;

  const canRevisePrice =
    (booking.status === "PENDING" || booking.status === "AWAITING_APPROVAL") &&
    booking.paymentStatus === "UNPAID";

  const handlePriceRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    const parsed = Number(proposedPriceInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedbackMsg({ type: "error", text: "Please enter a valid price greater than 0." });
      return;
    }

    try {
      await updatePrice({
        bookingId: booking.id,
        proposedPrice: parsed,
      }).unwrap();

      setFeedbackMsg({
        type: "success",
        text: "Price revision submitted successfully.",
      });
      setIsRevisingPrice(false);
      if (onBookingUpdated) onBookingUpdated();
      refetchHistory();
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setFeedbackMsg({
        type: "error",
        text: errObj?.data?.message || errObj?.message || "Failed to update price.",
      });
    }
  };

  const handleStripePayment = async () => {
    setFeedbackMsg(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/checkout/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout/cancel?bookingId=${booking.id}`;

      const res = await createStripeSession({
        bookingId: booking.id,
        successUrl,
        cancelUrl,
      }).unwrap();

      if (res.data?.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      }
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setFeedbackMsg({
        type: "error",
        text: errObj?.data?.message || errObj?.message || "Failed to initialize Stripe checkout session.",
      });
    }
  };

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    try {
      await createManualPayment({
        bookingId: booking.id,
        method: paymentMethod,
        reference: paymentRef.trim() || undefined,
        receiptNote: receiptNote.trim() || undefined,
      }).unwrap();

      setFeedbackMsg({
        type: "success",
        text: "Payment record submitted successfully and is pending verification.",
      });
      if (onBookingUpdated) onBookingUpdated();
      refetchHistory();
      setActiveTab("DETAILS");
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setFeedbackMsg({
        type: "error",
        text: errObj?.data?.message || errObj?.message || "Failed to submit payment record.",
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Reservation Details"
      description={`Reference: ${booking.id}`}
      size="lg"
    >
      <div className="space-y-4 pt-1" data-testid="agent-booking-details-dialog">
        {/* PROMINENT PAYMENT BANNER / SUMMARY CARD AT TOP */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="grid grid-cols-3 gap-4 text-xs flex-1">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74818A] block">
                  Total Amount
                </span>
                <span className="font-outfit text-lg font-bold text-[#18282A]">
                  {formatAgentCurrency(totalAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74818A] block">
                  Paid to Date
                </span>
                <span className="font-outfit text-lg font-bold text-emerald-700">
                  {formatAgentCurrency(verifiedPaidAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#74818A] block">
                  Balance Due
                </span>
                <span
                  className={`font-outfit text-lg font-bold ${
                    outstandingBalance > 0 ? "text-rose-600" : "text-emerald-700"
                  }`}
                  data-testid="agent-details-balance-due"
                >
                  {formatAgentCurrency(outstandingBalance, currency)}
                </span>
              </div>
            </div>

            {/* Quick Action in Header */}
            <div>
              {canInitiatePayment ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTab("PAYMENT")}
                  className="w-full sm:w-auto bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  data-testid="agent-quick-pay-header-btn"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>
                    {booking.paymentStatus === "PARTIALLY_PAID"
                      ? "Pay Remaining Balance"
                      : "Complete Payment"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : isAwaitingPriceApproval ? (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-center text-xs font-semibold text-purple-900">
                  <span>Price Approval Pending</span>
                  <p className="text-[10px] font-normal text-purple-700">
                    Payment unlocks after review
                  </p>
                </div>
              ) : booking.paymentStatus === "PAID" ? (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Fully Paid</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5EAED] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("DETAILS")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "DETAILS"
                ? "bg-[#176779] text-white"
                : "text-[#74818A] hover:text-[#18282A] hover:bg-slate-100"
            }`}
            data-testid="agent-details-tab"
          >
            Reservation Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("HISTORY")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "HISTORY"
                ? "bg-[#176779] text-white"
                : "text-[#74818A] hover:text-[#18282A] hover:bg-slate-100"
            }`}
            data-testid="agent-history-tab"
          >
            <History className="h-3.5 w-3.5" />
            <span>Activity History</span>
          </button>
          {canInitiatePayment && (
            <button
              type="button"
              onClick={() => setActiveTab("PAYMENT")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "PAYMENT"
                  ? "bg-[#176779] text-white"
                  : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              }`}
              data-testid="agent-payment-tab"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Make Payment</span>
            </button>
          )}
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            role="alert"
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: DETAILS */}
        {activeTab === "DETAILS" && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
                  Booking Status &amp; Fulfillment
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <AgentBookingStatusBadge status={booking.status} />
                  <AgentPaymentStatusBadge status={booking.paymentStatus} />
                  {booking.fulfillmentStatus && (
                    <AgentFulfillmentStatusBadge status={booking.fulfillmentStatus} />
                  )}
                  {booking.priceApproval && (
                    <AgentPriceApprovalBadge status={booking.priceApproval.status} />
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
                  Final Price
                </span>
                <p className="font-outfit text-xl font-bold text-[#18282A]">
                  {formatAgentCurrency(booking.finalPrice, currency)}
                </p>
              </div>
            </div>

            {/* 2-Column Grid: Tour & Customer Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Tour Information */}
              <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
                  <Compass className="h-4 w-4 text-[#176779]" />
                  <span>Tour Details</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#74818A]">Tour Name</span>
                    <p className="font-semibold text-[#18282A]">
                      {booking.service?.name || "Tour Service"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#74818A]">Tour Category / Type</span>
                    <p className="font-medium text-[#18282A]">
                      {booking.service?.type || "Standard Tour"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#E5EAED]">
                    <Calendar className="h-3.5 w-3.5 text-[#176779]" />
                    <span className="text-[#74818A]">Travel Date:</span>
                    <span className="font-semibold text-[#18282A]">
                      {formatAgentDate(effectiveTravelDate)}
                    </span>
                  </div>
                  {parsedGuests && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5EAED]">
                      <Users className="h-3.5 w-3.5 text-[#176779]" />
                      <span className="text-[#74818A]">Guests:</span>
                      <span className="font-semibold text-[#18282A]">
                        {parsedGuests.adults} Adults
                        {parsedGuests.children > 0 ? `, ${parsedGuests.children} Children` : ""}
                        {parsedGuests.infants > 0 ? `, ${parsedGuests.infants} Infants` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Staff Information */}
              <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
                  <User className="h-4 w-4 text-[#176779]" />
                  <span>Client &amp; Operational Staff</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#74818A]">Lead Traveler</span>
                    <p className="font-semibold text-[#18282A]">
                      {booking.customer?.name || "Customer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                    <span className="text-[#18282A] truncate">
                      {booking.customer?.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#74818A] shrink-0" />
                    <span className="text-[#18282A]">
                      {booking.customer?.phone || "No phone specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-[#E5EAED]">
                    <UserCheck className="h-3.5 w-3.5 text-[#176779] shrink-0" />
                    <span className="text-[#74818A]">Assigned Guide/Staff:</span>
                    <span className="font-semibold text-[#18282A]">
                      {booking.assignedStaff?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown Card */}
            <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18282A]">
                  <Coins className="h-4 w-4 text-[#176779]" />
                  <span>Pricing Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  {booking.requiresApproval && (
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Custom Agent Rate
                    </span>
                  )}
                  {canRevisePrice && !isRevisingPrice && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRevisingPrice(true)}
                      className="h-7 text-xs border-[#176779] text-[#176779] hover:bg-teal-50"
                      data-testid="agent-revise-price-btn"
                    >
                      Revise Price
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[#74818A] text-[11px]">Base Price</span>
                  <p className="mt-0.5 font-semibold text-[#18282A]">
                    {formatAgentCurrency(booking.basePrice, currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[#74818A] text-[11px]">Proposed Price</span>
                  <p className="mt-0.5 font-semibold text-[#18282A]">
                    {booking.proposedPrice != null
                      ? formatAgentCurrency(booking.proposedPrice, currency)
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[#74818A] text-[11px]">Final Price</span>
                  <p className="mt-0.5 font-bold text-[#176779]">
                    {formatAgentCurrency(booking.finalPrice, currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5">
                  <span className="text-emerald-800 text-[11px] font-semibold">Commission</span>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      {booking.commission
                        ? formatAgentCurrency(booking.commission.amount, currency)
                        : formatAgentCurrency(0, currency)}
                    </span>
                    {booking.commission && (
                      <AgentCommissionStatusBadge
                        status={booking.commission.status}
                        className="text-[10px] py-0 px-2"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Price Revision Form */}
              {isRevisingPrice && (
                <form
                  onSubmit={handlePriceRevision}
                  className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 space-y-3 text-xs"
                >
                  <div className="font-semibold text-teal-950 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-[#176779]" />
                    <span>Submit Price Revision</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                        New Proposed Price ({currency}) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        value={proposedPriceInput}
                        onChange={(e) => setProposedPriceInput(e.target.value)}
                        className="h-8 text-xs bg-white border-[#E5EAED] rounded-lg"
                        data-testid="agent-revise-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                        Revision Justification (Optional)
                      </label>
                      <Input
                        value={revisionNotesInput}
                        onChange={(e) => setRevisionNotesInput(e.target.value)}
                        placeholder="e.g. Volume discount for corporate booking"
                        className="h-8 text-xs bg-white border-[#E5EAED] rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRevisingPrice(false)}
                      disabled={isUpdatingPrice}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdatingPrice}
                      className="h-7 bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]"
                      data-testid="agent-submit-revision-btn"
                    >
                      {isUpdatingPrice ? "Submitting..." : "Submit Revision"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Price Approval Detail Note */}
              {booking.priceApproval && (
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-purple-950">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                      Admin Price Review
                    </span>
                    <span className="text-[11px] font-normal text-purple-700">
                      Reviewed: {formatAgentDate(booking.priceApproval.reviewedAt)}
                    </span>
                  </div>
                  {booking.priceApproval.notes && (
                    <p className="text-[11px] text-purple-900">
                      Notes: {booking.priceApproval.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Notes & Special Requests */}
            {booking.notes && (
              <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs space-y-1">
                <span className="font-semibold text-[#18282A] flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#176779]" />
                  Special Notes &amp; Requests
                </span>
                <p className="text-[#74818A] leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDIT HISTORY */}
        {activeTab === "HISTORY" && (
          <div className="rounded-2xl border border-[#E5EAED] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#18282A] flex items-center gap-2">
                <History className="h-4 w-4 text-[#176779]" />
                <span>Chronological Audit Trail</span>
              </span>
              <span className="text-[11px] text-[#74818A]">
                {historyItems.length} audited events
              </span>
            </div>

            {isHistoryLoading ? (
              <div className="py-8 text-center text-xs text-[#74818A]">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#176779] mb-2" />
                <span>Loading activity history...</span>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#74818A]">
                <Info className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                <span>No audit events recorded for this reservation.</span>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-[#EEF2F3] bg-[#F8FAFB] p-3 text-xs"
                    data-testid={`history-item-${item.id}`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-[#176779]">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#18282A]">
                          {item.action}
                        </span>
                        <span className="text-[11px] text-[#74818A]">
                          {formatAgentDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#74818A]">
                        <span>Actor: </span>
                        <span className="font-medium text-[#18282A]">
                          {item.actor?.name || item.actorName || item.actorId} (
                          {item.actor?.role || item.actorRole || "user"})
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-slate-700 bg-white rounded-md p-2 border border-[#E5EAED]">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT INITIATION */}
        {activeTab === "PAYMENT" && canInitiatePayment && (
          <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 space-y-4">
            <div className="border-b border-[#E5EAED] pb-3">
              <h3 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#176779]" />
                <span>Pay for Reservation</span>
              </h3>
              <p className="text-xs text-[#74818A] mt-1">
                Outstanding balance to settle:{" "}
                <span className="font-bold text-[#176779]">
                  {formatAgentCurrency(outstandingBalance, currency)}
                </span>
              </p>
            </div>

            {/* Customer Secure Payment Link Card */}
            <div className="rounded-2xl border border-[#176779]/30 bg-[#F0F7F8] p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#176779]">
                  <LinkIcon className="h-4 w-4" />
                  <span>Send Payment Link to Client</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateCustomerLink}
                  disabled={isGeneratingLink}
                  className="h-7 text-xs bg-[#176779] text-white hover:bg-[#135664]"
                >
                  {isGeneratingLink ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span>Generating...</span>
                    </>
                  ) : customerPaymentUrl ? (
                    "Regenerate Link"
                  ) : (
                    "Generate Payment Link"
                  )}
                </Button>
              </div>

              <p className="text-[11px] text-[#465D61]">
                Recommended: Have your guest pay directly with their own Credit/Debit card (via Stripe) or PayPal without having to share card details with you.
              </p>

              {customerPaymentUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    readOnly
                    value={customerPaymentUrl}
                    className="text-xs bg-white border-[#E5EAED] text-[#18282A] font-mono h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(customerPaymentUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    className="h-8 px-2.5 bg-white text-xs font-medium text-[#18282A] border-[#E5EAED] hover:bg-[#F8FAFB] shrink-0"
                  >
                    {linkCopied ? (
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
                      `Hello ${booking.customer?.name || "Client"}, here is your secure payment link for ${booking.service?.name || "your tour"}: ${customerPaymentUrl}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shrink-0"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#74818A] block mb-2">
                Or Pay Directly on Behalf of Agency:
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Stripe Option */}
              <label
                className={`block rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === "STRIPE"
                    ? "border-[#176779] bg-[#F3F9FA] ring-1 ring-[#176779]/20"
                    : "border-[#E5EAED] hover:bg-[#FAFCFD]"
                }`}
                data-testid="agent-payment-method-stripe"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="agentPaymentMethod"
                    value="STRIPE"
                    checked={paymentMethod === "STRIPE"}
                    onChange={() => setPaymentMethod("STRIPE")}
                    className="mt-0.5 text-[#176779]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18282A]">Credit / Debit Card (Stripe)</span>
                      <span className="rounded bg-teal-100 px-1.5 py-0.2 text-[10px] font-semibold text-teal-800">
                        Instant Confirmation
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74818A] mt-0.5">
                      Pay instantly via Visa, Mastercard, AMEX, or UnionPay with automated verification.
                    </p>
                  </div>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label
                className={`block rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-[#176779] bg-[#F3F9FA] ring-1 ring-[#176779]/20"
                    : "border-[#E5EAED] hover:bg-[#FAFCFD]"
                }`}
                data-testid="agent-payment-method-bank"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="agentPaymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() => setPaymentMethod("BANK_TRANSFER")}
                    className="mt-0.5 text-[#176779]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18282A]">Bank Transfer Receipt</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                        Manual Verification
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74818A] mt-0.5">
                      Transfer to Bangkok Bank (Phuket Branch) and submit your transaction slip. Verified by admin.
                    </p>
                  </div>
                </div>
              </label>

              {/* Cash Option */}
              <label
                className={`block rounded-xl border p-3.5 cursor-pointer transition-all ${
                  paymentMethod === "CASH"
                    ? "border-[#176779] bg-[#F3F9FA] ring-1 ring-[#176779]/20"
                    : "border-[#E5EAED] hover:bg-[#FAFCFD]"
                }`}
                data-testid="agent-payment-method-cash"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="agentPaymentMethod"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                    className="mt-0.5 text-[#176779]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18282A]">Cash at Pier / Hotel Pickup</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                        Pay on Departure
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74818A] mt-0.5">
                      Client pays tour coordinator or guide on the morning of departure. Verified upon tour start.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {paymentMethod === "STRIPE" ? (
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleStripePayment}
                  disabled={isCreatingStripe}
                  className="w-full bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] h-10 shadow-xs cursor-pointer"
                  data-testid="agent-stripe-pay-btn"
                >
                  {isCreatingStripe ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      <span>Redirecting to Stripe...</span>
                    </>
                  ) : (
                    <span>Launch Stripe Checkout</span>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleManualPayment} className="space-y-3 pt-2">
                {paymentMethod === "BANK_TRANSFER" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                      Transfer Slip Reference *
                    </label>
                    <Input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. TXN-12345678"
                      required
                      className="h-8 text-xs border-[#E5EAED] rounded-lg"
                      data-testid="agent-bank-ref-input"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-[#18282A] mb-1">
                    Payment Notes (Optional)
                  </label>
                  <Input
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    placeholder="e.g. Confirmed with client coordinator"
                    className="h-8 text-xs border-[#E5EAED] rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCreatingPayment}
                  className="w-full bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] h-10 cursor-pointer"
                  data-testid="agent-submit-payment-btn"
                >
                  {isCreatingPayment ? "Submitting Payment..." : "Record Payment Request"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Timestamps & Dialog Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#E5EAED]">
          <span className="text-[11px] text-[#74818A] flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Created {formatAgentDate(booking.createdAt)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-[#18282A] cursor-pointer"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
