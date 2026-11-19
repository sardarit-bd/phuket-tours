import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerBookingDetail } from "./customer-booking-detail";
import type { CustomerBookingRecord } from "../../types/customer";

const { useGetCustomerBookingByIdQuery } = vi.hoisted(() => ({
  useGetCustomerBookingByIdQuery: vi.fn(),
}));

vi.mock("../../api/customer-api", () => ({
  useGetCustomerBookingByIdQuery,
}));

vi.mock("../payments/stripe-payment-button", () => ({
  StripePaymentButton: ({ bookingId, amount, currency }: any) => (
    <button data-testid="mock-stripe-btn">Pay {currency} {amount}</button>
  ),
}));

const mockBooking: CustomerBookingRecord = {
  id: "b-11111111-2222-3333-4444-555555555555",
  status: "PENDING",
  paymentStatus: "PAID",
  fulfillmentStatus: "NOT_STARTED",
  currency: "USD",
  basePrice: 200,
  finalPrice: 200,
  notes:
    "Travel Date: 2026-11-10 | Guests: 1 Adult, 1 Child, 2 Infants | Contact: Jane Traveler (jane@example.com, +66 81 234 5678) | Notes: Hotel pickup at Patong Beach Resort",
  createdAt: "2026-11-09T08:30:00.000Z",
  updatedAt: "2026-11-09T08:35:00.000Z",
  service: {
    id: "s-1",
    name: "Phi Phi Islands Luxury Speedboat Adventure",
    type: "TOUR",
  },
  availability: null, // Test parsing fallback from structured notes
  payments: [
    {
      id: "p-1",
      amount: 200,
      currency: "USD",
      method: "STRIPE",
      status: "VERIFIED",
      stripeSessionId: "cs_test_abc1234567890",
      createdAt: "2026-11-09T08:32:00.000Z",
    },
  ],
};

describe("CustomerBookingDetail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders structured travel date, guest count cards, and lead traveler info", () => {
    useGetCustomerBookingByIdQuery.mockReturnValue({
      data: { data: mockBooking },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    render(<CustomerBookingDetail bookingId={mockBooking.id} />);

    // Travel Date
    expect(screen.getByTestId("detail-travel-date")).toHaveTextContent("Nov 10, 2026");

    // Guest Cards
    expect(screen.getByText("Adults (12+)")).toBeInTheDocument();
    expect(screen.getByText("Children (4-12)")).toBeInTheDocument();
    expect(screen.getByText("Infants (0-3)")).toBeInTheDocument();

    // Lead Traveler info
    expect(screen.getByText("Jane Traveler")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("+66 81 234 5678")).toBeInTheDocument();

    // Special Requests
    expect(
      screen.getByText("Hotel pickup at Patong Beach Resort")
    ).toBeInTheDocument();

    // Pricing & Currency consistency
    expect(screen.getByTestId("detail-total-amount")).toHaveTextContent("$200");
    expect(screen.getByTestId("detail-paid-amount")).toHaveTextContent("$200");
    expect(screen.getByTestId("detail-balance-amount")).toHaveTextContent("$0");
  });

  it("handles empty or missing optional notes gracefully without errors", () => {
    const minimalBooking: CustomerBookingRecord = {
      ...mockBooking,
      notes: null,
      availability: { id: "av-1", date: "2026-12-25T00:00:00.000Z" },
    };

    useGetCustomerBookingByIdQuery.mockReturnValue({
      data: { data: minimalBooking },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    render(<CustomerBookingDetail bookingId={minimalBooking.id} />);

    expect(screen.getByTestId("detail-travel-date")).toHaveTextContent("Dec 25, 2026");
    expect(screen.getByText("No special requests or custom pickup notes provided.")).toBeInTheDocument();
  });

  it("keeps booking status PENDING even when paymentStatus is PAID", () => {
    useGetCustomerBookingByIdQuery.mockReturnValue({
      data: { data: mockBooking },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    render(<CustomerBookingDetail bookingId={mockBooking.id} />);

    // Payment shows Paid / Complete
    expect(screen.getByText("Payment Complete")).toBeInTheDocument();
    // Reservation Status shows Pending Confirmation
    expect(screen.getByText("Pending Confirmation")).toBeInTheDocument();
  });
});

