import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { AgentBookingsTable } from "./bookings/agent-bookings-table";
import { AgentBookingDetailsDialog } from "./bookings/agent-booking-details-dialog";
import type { AgentBookingRecord } from "../types/agent";

const mockUnpaidBooking: AgentBookingRecord = {
  id: "bkg-unpaid-001",
  status: "CONFIRMED",
  paymentStatus: "UNPAID",
  fulfillmentStatus: "NOT_STARTED",
  basePrice: 5000,
  proposedPrice: null,
  finalPrice: 5000,
  requiresApproval: false,
  notes: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
  service: {
    id: "srv-1",
    name: "Phi Phi Island Luxury Catamaran Tour",
    type: "DAY_TRIP",
  },
  availability: {
    id: "av-1",
    date: "2026-12-10T00:00:00Z",
  },
  customer: {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+66810000001",
  },
};

const mockPaidBooking: AgentBookingRecord = {
  ...mockUnpaidBooking,
  id: "bkg-paid-002",
  paymentStatus: "PAID",
};

let mockBookingsData: AgentBookingRecord[] = [mockUnpaidBooking];

vi.mock("@/features/agent/api/agent-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/agent/api/agent-api")>();
  return {
    ...actual,
    useGetAgentBookingsQuery: () => ({
      data: {
        success: true,
        data: {
          items: mockBookingsData,
          pagination: {
            page: 1,
            limit: 10,
            total: mockBookingsData.length,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    }),
    useGetTourCatalogQuery: () => ({
      data: { success: true, data: [] },
      isLoading: false,
    }),
    useGetBookingPaymentsQuery: () => ({
      data: { success: true, data: [] },
      isLoading: false,
    }),
    useGetAgentBookingHistoryQuery: () => ({
      data: { success: true, data: [] },
      isLoading: false,
    }),
  };
});

describe("Agent First Payment Workflow Components", () => {
  const store = makeStore();

  describe("AgentBookingsTable - Prominent Payment Indicators & Actions", () => {
    it("renders 'Payment Required' badge and direct 'Pay' button for unpaid confirmed booking", () => {
      mockBookingsData = [mockUnpaidBooking];

      render(
        <Provider store={store}>
          <AgentBookingsTable />
        </Provider>
      );

      // Status indicator
      expect(screen.getByTestId("badge-payment-required-bkg-unpaid-001")).toHaveTextContent("Payment Required");
      expect(screen.getByText("Due: ฿5,000.00")).toBeInTheDocument();

      // Prominent Pay button in row action
      const payButton = screen.getByTestId("pay-booking-bkg-unpaid-001");
      expect(payButton).toBeInTheDocument();
      expect(payButton).toHaveTextContent("Pay");

      // Clicking Pay opens the modal directly to PAYMENT tab
      fireEvent.click(payButton);
      expect(screen.getByText("Pay for Reservation")).toBeInTheDocument();
      expect(screen.getByTestId("agent-payment-method-stripe")).toBeInTheDocument();
    });

    it("renders 'Paid' badge and does not display Pay button for fully paid booking", () => {
      mockBookingsData = [mockPaidBooking];

      render(
        <Provider store={store}>
          <AgentBookingsTable />
        </Provider>
      );

      expect(screen.getByTestId("badge-paid-bkg-paid-002")).toHaveTextContent("Paid");
      expect(screen.queryByTestId("pay-booking-bkg-paid-002")).not.toBeInTheDocument();
    });
  });

  describe("AgentBookingDetailsDialog - Payment Summary Banner & Tab Navigation", () => {
    it("renders top payment summary banner showing Total Amount and Balance Due", () => {
      render(
        <Provider store={store}>
          <AgentBookingDetailsDialog
            isOpen={true}
            onClose={vi.fn()}
            booking={mockUnpaidBooking}
            initialTab="DETAILS"
          />
        </Provider>
      );

      expect(screen.getByText("Total Amount")).toBeInTheDocument();
      expect(screen.getByText("Paid to Date")).toBeInTheDocument();
      expect(screen.getByText("Balance Due")).toBeInTheDocument();
      expect(screen.getByTestId("agent-details-balance-due")).toHaveTextContent("฿5,000.00");

      // Top action button to jump directly to payment
      const topPayBtn = screen.getByTestId("agent-quick-pay-header-btn");
      expect(topPayBtn).toBeInTheDocument();
      expect(topPayBtn).toHaveTextContent("Complete Payment");

      // Clicking jumps to payment tab
      fireEvent.click(topPayBtn);
      expect(screen.getByText("Pay for Reservation")).toBeInTheDocument();
      expect(screen.getByText(/Outstanding balance to settle:/i)).toBeInTheDocument();
    });

    it("opens directly in PAYMENT tab when initialTab='PAYMENT'", () => {
      render(
        <Provider store={store}>
          <AgentBookingDetailsDialog
            isOpen={true}
            onClose={vi.fn()}
            booking={mockUnpaidBooking}
            initialTab="PAYMENT"
          />
        </Provider>
      );

      expect(screen.getByText("Pay for Reservation")).toBeInTheDocument();
      expect(screen.getByTestId("agent-payment-method-stripe")).toBeInTheDocument();
      expect(screen.getByTestId("agent-payment-method-bank")).toBeInTheDocument();
    });
  });
});
