"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { useCreateStripeSessionMutation } from "../../api/customer-api";

interface StripePaymentButtonProps {
  bookingId: string;
  amount: number;
  currency?: string;
  disabled?: boolean;
  className?: string;
}

export function StripePaymentButton({
  bookingId,
  amount,
  currency = "THB",
  disabled = false,
  className,
}: StripePaymentButtonProps) {
  const [createStripeSession, { isLoading }] = useCreateStripeSessionMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formattedAmount = `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handlePay = async () => {
    if (isLoading || disabled) return;
    setErrorMsg(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/checkout/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout/cancel?bookingId=${bookingId}`;

      const res = await createStripeSession({
        bookingId,
        successUrl,
        cancelUrl,
      }).unwrap();

      if (res.data?.sessionUrl) {
        // Redirect customer to Stripe Checkout
        window.location.href = res.data.sessionUrl;
      } else {
        setErrorMsg("Unable to initialize Stripe Checkout. Please try again.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const message =
        errorObj?.data?.message ||
        errorObj?.message ||
        "Payment initiation failed. Please check your connection and try again.";
      setErrorMsg(message);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        onClick={handlePay}
        disabled={isLoading || disabled}
        className={className || "bg-[#176779] text-white hover:bg-[#135664] h-9 px-4 text-xs font-semibold gap-2"}
        data-testid="pay-with-stripe-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Redirecting to Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-3.5 w-3.5" />
            <span>Pay {formattedAmount} with Card</span>
          </>
        )}
      </Button>

      {errorMsg && (
        <div
          className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium"
          data-testid="stripe-payment-error"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

