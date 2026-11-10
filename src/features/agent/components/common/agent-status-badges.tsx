"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  className?: string;
}

export function AgentBookingStatusBadge({
  status,
  className,
}: {
  status: string;
} & StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const config: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
    PENDING: {
      label: "Pending",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-500",
    },
    CONFIRMED: {
      label: "Confirmed",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    COMPLETED: {
      label: "Completed",
      badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
      dotClass: "bg-sky-500",
    },
    CANCELLED: {
      label: "Cancelled",
      badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
      dotClass: "bg-rose-500",
    },
    AWAITING_APPROVAL: {
      label: "Awaiting Approval",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
      dotClass: "bg-purple-500",
    },
    IN_PROGRESS: {
      label: "In Progress",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
      dotClass: "bg-blue-500",
    },
    FAILED: {
      label: "Failed",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      dotClass: "bg-slate-500",
    },
  };

  const current = config[normalized] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        current.badgeClass,
        className
      )}
      data-testid={`booking-status-${normalized.toLowerCase()}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", current.dotClass)} aria-hidden="true" />
      {current.label}
    </span>
  );
}

export function AgentPaymentStatusBadge({
  status,
  className,
}: {
  status: string;
} & StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const config: Record<string, { label: string; badgeClass: string }> = {
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

  const current = config[normalized] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        current.badgeClass,
        className
      )}
      data-testid={`payment-status-${normalized.toLowerCase()}`}
    >
      {current.label}
    </span>
  );
}

export function AgentCommissionStatusBadge({
  status,
  className,
}: {
  status: string;
} & StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const config: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
    ACTIVE: {
      label: "Active",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Cancelled",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    },
  };

  const current = config[normalized] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        current.badgeClass,
        className
      )}
      data-testid={`commission-status-${normalized.toLowerCase()}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", current.dotClass)} aria-hidden="true" />
      {current.label}
    </span>
  );
}

export function AgentPriceApprovalBadge({
  status,
  className,
}: {
  status?: "PENDING" | "APPROVED" | "REJECTED" | null;
} & StatusBadgeProps) {
  if (!status) return null;

  const config: Record<string, { label: string; badgeClass: string }> = {
    PENDING: {
      label: "Approval Pending",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
    APPROVED: {
      label: "Price Approved",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    REJECTED: {
      label: "Price Rejected",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const current = config[status] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        current.badgeClass,
        className
      )}
    >
      {current.label}
    </span>
  );
}

export function AgentFulfillmentStatusBadge({
  status,
  className,
}: {
  status?: "NOT_STARTED" | "IN_PROGRESS" | "FULFILLED" | string | null;
} & StatusBadgeProps) {
  if (!status) return null;
  const normalized = status.toUpperCase();

  const config: Record<string, { label: string; badgeClass: string }> = {
    NOT_STARTED: {
      label: "Not Started",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    },
    IN_PROGRESS: {
      label: "In Progress",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    FULFILLED: {
      label: "Fulfilled",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  const current = config[normalized] || {
    label: status,
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        current.badgeClass,
        className
      )}
      data-testid={`fulfillment-status-${normalized.toLowerCase()}`}
    >
      {current.label}
    </span>
  );
}
