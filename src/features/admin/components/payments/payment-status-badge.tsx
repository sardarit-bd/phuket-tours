"use client";

import * as React from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, Landmark, Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentRecordStatus, PaymentMethod } from "../../types/admin-payments";

interface PaymentStatusBadgeProps {
  status: PaymentRecordStatus;
  className?: string;
  showIcon?: boolean;
}

export function PaymentStatusBadge({
  status,
  className,
  showIcon = true,
}: PaymentStatusBadgeProps) {
  switch (status) {
    case "VERIFIED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200",
            className
          )}
          data-testid="payment-status-verified"
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />}
          <span>Verified</span>
        </span>
      );
    case "SUBMITTED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200",
            className
          )}
          data-testid="payment-status-submitted"
        >
          {showIcon && <Clock className="h-3 w-3 shrink-0 text-blue-600 animate-pulse" aria-hidden="true" />}
          <span>Awaiting Verification</span>
        </span>
      );
    case "INITIATED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200",
            className
          )}
          data-testid="payment-status-initiated"
        >
          {showIcon && <Clock className="h-3 w-3 shrink-0 text-amber-600" aria-hidden="true" />}
          <span>Initiated</span>
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200",
            className
          )}
          data-testid="payment-status-rejected"
        >
          {showIcon && <XCircle className="h-3 w-3 shrink-0 text-rose-600" aria-hidden="true" />}
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200",
            className
          )}
        >
          {showIcon && <AlertCircle className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />}
          <span>{status}</span>
        </span>
      );
  }
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
  showIcon?: boolean;
}

export function PaymentMethodBadge({
  method,
  className,
  showIcon = true,
}: PaymentMethodBadgeProps) {
  switch (method) {
    case "BANK_TRANSFER":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium border bg-slate-50 text-slate-700 border-slate-200",
            className
          )}
          data-testid="payment-method-bank"
        >
          {showIcon && <Landmark className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />}
          <span>Bank Transfer</span>
        </span>
      );
    case "CASH":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium border bg-emerald-50 text-emerald-800 border-emerald-200/60",
            className
          )}
          data-testid="payment-method-cash"
        >
          {showIcon && <Banknote className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />}
          <span>Cash</span>
        </span>
      );
    case "OTHER":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200",
            className
          )}
          data-testid="payment-method-other"
        >
          {showIcon && <CreditCard className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />}
          <span>Other</span>
        </span>
      );
  }
}
