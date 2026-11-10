"use client";

import * as React from "react";
import {
  type OperationalBookingStatus,
  type FulfillmentStatusValue,
  type BookingPaymentStatus,
} from "../../types/admin-bookings";
import type { AdminBookingStatus } from "../../types/admin";
import { BOOKING_STATUS_CONFIG } from "../../utils/format";

export function BookingStatusBadge({ status }: { status: AdminBookingStatus | OperationalBookingStatus | string }) {
  const config = BOOKING_STATUS_CONFIG[status as AdminBookingStatus] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.badgeClass}`}
      data-testid={`booking-status-${status.toLowerCase()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}

const FULFILLMENT_CONFIG: Record<
  FulfillmentStatusValue,
  { label: string; badgeClass: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  FULFILLED: {
    label: "Fulfilled",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

export function FulfillmentStatusBadge({ status }: { status: FulfillmentStatusValue }) {
  const config = FULFILLMENT_CONFIG[status] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.badgeClass}`}
      data-testid={`fulfillment-status-${status.toLowerCase()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}

const SOURCE_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  AGENT: {
    label: "Agent",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ADMIN: {
    label: "Admin",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  CUSTOMER: {
    label: "Customer",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DIRECT: {
    label: "Direct",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

export function BookingSourceBadge({ source }: { source?: string | null }) {
  const normalized = (source || "DIRECT").toUpperCase();
  const config = SOURCE_CONFIG[normalized] || {
    label: normalized,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide ${config.badgeClass}`}
      data-testid={`booking-source-${normalized.toLowerCase()}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}

const PAYMENT_CONFIG: Record<
  BookingPaymentStatus,
  { label: string; badgeClass: string }
> = {
  UNPAID: {
    label: "Unpaid",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function PaymentStatusBadge({ status }: { status: BookingPaymentStatus }) {
  const config = PAYMENT_CONFIG[status] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.badgeClass}`}
      data-testid={`payment-status-${status.toLowerCase()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
