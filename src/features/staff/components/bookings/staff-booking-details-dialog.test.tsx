import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaffBookingDetailsDialog } from "./staff-booking-details-dialog";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type { StaffBookingRecord } from "@/features/admin/types/admin-bookings";

vi.mock("@/features/admin/api/admin-api", async (importOriginal) => {
  const actual = await importOriginal<typeof adminApiModule>();
  return {
    ...actual,
    useGetStaffBookingHistoryQuery: vi.fn().mockReturnValue({
      data: {
        success: true,
        data: {
          items: [
            {
              id: "hist-1",
              action: "BOOKING_CONFIRMED",
              actorName: "General Admin",
              actorRole: "admin",
              createdAt: "2026-11-18T10:30:00.000Z",
            },
          ],
        },
      },
      isLoading: false,
    }),
  };
});

describe("StaffBookingDetailsDialog Component", () => {
  const baseBooking: StaffBookingRecord = {
    id: "bkg-13240-uuid",
    status: "CONFIRMED",
    fulfillmentStatus: "NOT_STARTED",
    paymentStatus: "UNPAID",
    currency: "THB",
    basePrice: 13240,
    finalPrice: 12578,
    assignedStaffId: "staff-op-1",
    notes: "Travel Date: 2026-12-05 | Guests: 2 Adults | Contact: Test Guest (+66 89 000 1111) | Hotel: Marriott",
    internalNotes: "Special VIP arrangements",
    createdAt: "2026-11-18T09:00:00.000Z",
    updatedAt: "2026-11-18T10:30:00.000Z",
    service: {
      id: "srv-similan",
      name: "Similan Islands Full Day Tour",
      type: "TOUR",
    },
    availability: {
      id: "avail-1",
      date: "2026-12-05T08:00:00.000Z",
    },
    customer: {
      id: "cust-1",
      name: "Test Guest",
      phone: "+66 89 000 1111",
    },
    assignedStaff: {
      id: "staff-op",
      name: "Somsak Operations",
    },
    createdBy: {
      id: "staff-creator",
      name: "Waleed Staff",
      role: "staff",
    },
  };

  it("renders standard retail price and no discount breakdown when no discount is requested", () => {
    render(
      <StaffBookingDetailsDialog
        isOpen={true}
        onClose={vi.fn()}
        booking={{ ...baseBooking, finalPrice: 13240, discountRequests: [] }}
      />
    );

    expect(screen.getByTestId("staff-pricing-breakdown-section")).toBeInTheDocument();
    expect(screen.getByTestId("detail-standard-price")).toHaveTextContent("13,240.00");
    expect(screen.getByTestId("detail-final-price")).toHaveTextContent("13,240.00");
    expect(
      screen.getByText("Standard booking rate applied. No custom discount was requested or attached.")
    ).toBeInTheDocument();
  });

  it("renders requested and approved discounts separately with correct calculations for partial approval (10% requested, 5% approved)", () => {
    // 13,240 retail price
    // Requested: 10% (1,324 deduction -> 11,916 proposed)
    // Approved: 5% (662 deduction -> 12,578 final)
    const partialBooking: StaffBookingRecord = {
      ...baseBooking,
      discountRequests: [
        {
          id: "dr-partial-1",
          discountType: "PERCENTAGE",
          discountValue: 10,
          originalPrice: 13240,
          discountAmount: 1324,
          proposedFinalPrice: 11916,
          status: "APPROVED",
          approvedDiscountAmount: 662,
          approvedFinalPrice: 12578,
          reason: "Loyal customer returning with family",
          rejectionReason: null,
          adminNotes: "Approved 5% partial discount as compromise",
          requestedById: "staff-creator",
          reviewedById: "admin-1",
          reviewedAt: "2026-11-18T10:30:00.000Z",
          createdAt: "2026-11-18T09:00:00.000Z",
        },
      ],
    };

    render(
      <StaffBookingDetailsDialog
        isOpen={true}
        onClose={vi.fn()}
        booking={partialBooking}
      />
    );

    // 1. Standard Retail Price
    expect(screen.getByTestId("detail-standard-price")).toHaveTextContent("13,240.00");

    // 2. Staff Requested Discount Box
    expect(screen.getByTestId("detail-requested-discount-box")).toBeInTheDocument();
    expect(screen.getByTestId("detail-requested-value")).toHaveTextContent("10%");
    expect(screen.getByTestId("detail-requested-amount")).toHaveTextContent("-THB 1,324.00");
    expect(screen.getByTestId("detail-proposed-final-price")).toHaveTextContent("11,916.00");

    // 3. Admin Approved Discount Box
    expect(screen.getByTestId("detail-approved-discount-box")).toBeInTheDocument();
    expect(screen.getByTestId("detail-approved-amount")).toHaveTextContent("-5% (THB 662.00)");
    expect(screen.getByTestId("detail-approved-final-price")).toHaveTextContent("12,578.00");

    // 4. Final Authoritative Price in Main Header
    expect(screen.getByTestId("detail-final-price")).toHaveTextContent("12,578.00");

    // 5. Staff reason and Admin Notes
    expect(screen.getByText("Loyal customer returning with family")).toBeInTheDocument();
    expect(screen.getByText("Approved 5% partial discount as compromise")).toBeInTheDocument();

    // 6. Creator attribution and assigned operations staff
    expect(screen.getByText("Waleed Staff")).toBeInTheDocument();
    expect(screen.getByText("Somsak Operations")).toBeInTheDocument();
  });

  it("renders full discount approval correctly when Admin accepts 10% requested discount", () => {
    const fullBooking: StaffBookingRecord = {
      ...baseBooking,
      finalPrice: 11916,
      discountRequests: [
        {
          id: "dr-full-1",
          discountType: "PERCENTAGE",
          discountValue: 10,
          originalPrice: 13240,
          discountAmount: 1324,
          proposedFinalPrice: 11916,
          status: "APPROVED",
          approvedDiscountAmount: 1324,
          approvedFinalPrice: 11916,
          reason: "Direct group VIP booking",
          rejectionReason: null,
          adminNotes: "Approved in full",
          requestedById: "staff-creator",
          reviewedById: "admin-1",
          reviewedAt: "2026-11-18T10:30:00.000Z",
          createdAt: "2026-11-18T09:00:00.000Z",
        },
      ],
    };

    render(
      <StaffBookingDetailsDialog
        isOpen={true}
        onClose={vi.fn()}
        booking={fullBooking}
      />
    );

    expect(screen.getByTestId("detail-standard-price")).toHaveTextContent("13,240.00");
    expect(screen.getByTestId("detail-requested-value")).toHaveTextContent("10%");
    expect(screen.getByTestId("detail-requested-amount")).toHaveTextContent("-THB 1,324.00");
    expect(screen.getByTestId("detail-approved-amount")).toHaveTextContent("-10% (THB 1,324.00)");
    expect(screen.getByTestId("detail-final-price")).toHaveTextContent("11,916.00");
  });
});
