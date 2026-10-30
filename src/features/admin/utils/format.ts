/**
 * Admin Overview Formatting Utilities
 *
 * Rules:
 * 1. Format monetary amounts using the currency returned by the backend.
 * 2. Never silently mix currencies or assume all amounts are USD or THB.
 * 3. Never fabricate percentages or trends when data is unavailable.
 */

import type { AdminBookingStatus } from "../types/admin";

/**
 * Formats a monetary amount.
 * - If amount is null/undefined/NaN, returns "—".
 * - If a currency string is provided, formats with that currency.
 * - If no currency is returned by the backend (undefined/null), formats strictly
 *   as a localized 2-decimal number without inventing USD ($) or THB (฿).
 */
export function formatReportMoney(
  amount: number | null | undefined,
  currency?: string | null
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }

  if (currency && typeof currency === "string" && currency.trim().length > 0) {
    const trimmed = currency.trim().toUpperCase();
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: trimmed,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // In case the currency string is not an ISO 4217 code (e.g. "$", "THB")
      return `${currency.trim()} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  // Currency was NOT provided by backend: format purely as numeric monetary value
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats an integer count with comma separators.
 */
export function formatReportCount(count: number | null | undefined): string {
  if (count === null || count === undefined || Number.isNaN(count)) {
    return "—";
  }
  return count.toLocaleString("en-US");
}

/**
 * Calculates and formats a safe percentage.
 */
export function formatReportPercentage(count: number, total: number): string {
  if (!total || total <= 0 || Number.isNaN(count)) {
    return "0.0%";
  }
  const pct = (count / total) * 100;
  return `${pct.toFixed(1)}%`;
}

/**
 * Human-readable labels and badge styles for Booking Statuses
 */
export interface StatusDisplayMeta {
  label: string;
  badgeClass: string;
  barColor: string;
}

export const BOOKING_STATUS_CONFIG: Record<AdminBookingStatus, StatusDisplayMeta> = {
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    barColor: "bg-teal-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    barColor: "bg-sky-500",
  },
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
  },
  AWAITING_APPROVAL: {
    label: "Awaiting Approval",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    barColor: "bg-purple-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    barColor: "bg-rose-400",
  },
  FAILED: {
    label: "Failed",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    barColor: "bg-red-600",
  },
};
