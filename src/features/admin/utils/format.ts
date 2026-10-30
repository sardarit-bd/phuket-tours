/**
 * Admin Overview Formatting Utilities
 *
 * Rules:
 * 1. Format monetary amounts using the currency returned by the backend.
 * 2. Never silently mix currencies or assume all amounts are USD or THB.
 * 3. Never fabricate percentages or trends when data is unavailable.
 */

import type { AdminBookingStatus, BookingStatusBreakdownItem } from "../types/admin";

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
  hexColor: string;
}

export const BOOKING_STATUS_CONFIG: Record<AdminBookingStatus, StatusDisplayMeta> = {
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
    hexColor: "#10B981",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    barColor: "bg-teal-500",
    hexColor: "#2B9BA8",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    barColor: "bg-sky-500",
    hexColor: "#0EA5E9",
  },
  PENDING: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
    hexColor: "#F59E0B",
  },
  AWAITING_APPROVAL: {
    label: "Awaiting Approval",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    barColor: "bg-purple-500",
    hexColor: "#A855F7",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    barColor: "bg-rose-400",
    hexColor: "#FB7185",
  },
  FAILED: {
    label: "Failed",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    barColor: "bg-red-600",
    hexColor: "#DC2626",
  },
};

export interface CompleteBookingStatusItem {
  status: AdminBookingStatus;
  count: number;
  totalValue: number;
  percentage: number;
  percentageString: string;
  label: string;
  badgeClass: string;
  barColor: string;
  hexColor: string;
}

/**
 * Returns a complete breakdown list ensuring all seven backend booking statuses
 * are always represented, preserving data integrity and avoiding missing categories.
 */
export function getAllBookingStatusesBreakdown(
  byStatus: BookingStatusBreakdownItem[] = [],
  totalBookings: number = 0
): CompleteBookingStatusItem[] {
  const byStatusMap = new Map<AdminBookingStatus, { count: number; totalValue: number }>();
  for (const item of byStatus) {
    byStatusMap.set(item.status, {
      count: item.count,
      totalValue: item.totalValue,
    });
  }

  const ORDERED_STATUSES: AdminBookingStatus[] = [
    "COMPLETED",
    "CONFIRMED",
    "IN_PROGRESS",
    "PENDING",
    "AWAITING_APPROVAL",
    "CANCELLED",
    "FAILED",
  ];

  return ORDERED_STATUSES.map((status) => {
    const data = byStatusMap.get(status);
    const count = data?.count ?? 0;
    const totalValue = data?.totalValue ?? 0;
    const percentage = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
    const percentageString = formatReportPercentage(count, totalBookings);
    const config = BOOKING_STATUS_CONFIG[status];

    return {
      status,
      count,
      totalValue,
      percentage,
      percentageString,
      label: config.label,
      badgeClass: config.badgeClass,
      barColor: config.barColor,
      hexColor: config.hexColor,
    };
  });
}

/**
 * Formats an ISO date string into a consistent, readable format (e.g., "Oct 30, 2026").
 * Returns "—" if invalid or missing.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}


