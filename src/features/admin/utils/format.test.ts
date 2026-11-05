import { describe, it, expect } from "vitest";
import {
  formatReportMoney,
  formatReportCount,
  formatReportPercentage,
  BOOKING_STATUS_CONFIG,
  getAllBookingStatusesBreakdown,
} from "./format";

describe("Admin Overview Formatting Utilities", () => {
  describe("formatReportMoney", () => {
    it("returns '—' when amount is null, undefined, or NaN", () => {
      expect(formatReportMoney(null)).toBe("—");
      expect(formatReportMoney(undefined)).toBe("—");
      expect(formatReportMoney(Number.NaN)).toBe("—");
    });

    it("formats raw numeric value without inventing currency when currency is omitted or null", () => {
      // Strictly follows the rule: Never silently mix currencies or assume all amounts are USD or THB
      const result = formatReportMoney(12345.67);
      expect(result).toBe("12,345.67");
      expect(result).not.toContain("$");
      expect(result).not.toContain("THB");
      expect(result).not.toContain("฿");
    });

    it("formats with specified currency when backend returns currency code", () => {
      const usdResult = formatReportMoney(12345.67, "USD");
      expect(usdResult).toContain("12,345.67");

      const thbResult = formatReportMoney(12345.67, "THB");
      expect(thbResult).toContain("12,345.67");
    });

    it("formats 0 amounts properly", () => {
      expect(formatReportMoney(0)).toBe("0.00");
      expect(formatReportMoney(0, "USD")).toContain("0.00");
    });
  });

  describe("formatReportCount", () => {
    it("returns '—' for missing values and formatted count for valid numbers", () => {
      expect(formatReportCount(null)).toBe("—");
      expect(formatReportCount(undefined)).toBe("—");
      expect(formatReportCount(0)).toBe("0");
      expect(formatReportCount(1500)).toBe("1,500");
    });
  });

  describe("formatReportPercentage", () => {
    it("handles zero total gracefully without throwing or NaN", () => {
      expect(formatReportPercentage(10, 0)).toBe("0.0%");
      expect(formatReportPercentage(0, 0)).toBe("0.0%");
    });

    it("calculates correct rounded percentage string", () => {
      expect(formatReportPercentage(25, 100)).toBe("25.0%");
      expect(formatReportPercentage(1, 3)).toBe("33.3%");
    });
  });

  describe("BOOKING_STATUS_CONFIG", () => {
    it("has configurations for all 7 verified booking statuses", () => {
      const statuses = [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "AWAITING_APPROVAL",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
      ] as const;

      statuses.forEach((status) => {
        expect(BOOKING_STATUS_CONFIG[status]).toBeDefined();
        expect(BOOKING_STATUS_CONFIG[status].label).toBeTruthy();
        expect(BOOKING_STATUS_CONFIG[status].badgeClass).toBeTruthy();
        expect(BOOKING_STATUS_CONFIG[status].barColor).toBeTruthy();
        expect(BOOKING_STATUS_CONFIG[status].hexColor).toBeTruthy();
      });
    });
  });

  describe("getAllBookingStatusesBreakdown", () => {
    it("ensures all 7 backend booking statuses are always returned even with partial backend rows", () => {
      const partialData = [
        { status: "COMPLETED" as const, count: 20, totalValue: 60000 },
        { status: "CONFIRMED" as const, count: 10, totalValue: 30000 },
      ];
      const result = getAllBookingStatusesBreakdown(partialData, 30);

      expect(result).toHaveLength(7);

      const completed = result.find((item) => item.status === "COMPLETED");
      expect(completed?.count).toBe(20);
      expect(completed?.percentageString).toBe("66.7%");

      const confirmed = result.find((item) => item.status === "CONFIRMED");
      expect(confirmed?.count).toBe(10);
      expect(confirmed?.percentageString).toBe("33.3%");

      // Missing categories from backend must be safely filled with 0s without throwing
      const failed = result.find((item) => item.status === "FAILED");
      expect(failed?.count).toBe(0);
      expect(failed?.totalValue).toBe(0);
      expect(failed?.percentageString).toBe("0.0%");

      const awaiting = result.find((item) => item.status === "AWAITING_APPROVAL");
      expect(awaiting?.count).toBe(0);
      expect(awaiting?.percentageString).toBe("0.0%");
    });
  });
});
