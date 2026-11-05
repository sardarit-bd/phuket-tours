import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { AgentMetricsCards } from "./overview/agent-metrics-cards";
import {
  AgentBookingStatusBadge,
  AgentPaymentStatusBadge,
  AgentCommissionStatusBadge,
  AgentPriceApprovalBadge,
} from "./common/agent-status-badges";
import { RecentBookingsPreview } from "./overview/recent-bookings-preview";
import { RecentCommissionsPreview } from "./overview/recent-commissions-preview";
import { AgentBookingDetailsDialog } from "./bookings/agent-booking-details-dialog";
import type { AgentBookingRecord, AgentCommissionRecord } from "../types/agent";

describe("AgentMetricsCards Component", () => {
  it("renders loading skeleton when isLoading is true", () => {
    render(<AgentMetricsCards isLoading={true} />);
    expect(screen.getByTestId("agent-metrics-skeleton")).toBeInTheDocument();
  });

  it("renders all 7 supported overview metrics with accurate numbers and currency", () => {
    const mockMetrics = {
      totalBookings: 42,
      pendingBookings: 8,
      confirmedBookings: 25,
      completedBookings: 7,
      cancelledBookings: 2,
      totalCommission: 35400,
      paidCommission: 20000,
      pendingCommission: 15400,
      activeCommissionsCount: 32,
    };

    render(<AgentMetricsCards metrics={mockMetrics} isLoading={false} />);

    // Metric titles and values
    expect(screen.getByTestId("metric-total-bookings")).toHaveTextContent("42");
    expect(screen.getByTestId("metric-pending-bookings")).toHaveTextContent("8");
    expect(screen.getByTestId("metric-confirmed-bookings")).toHaveTextContent("25");
    expect(screen.getByTestId("metric-completed-bookings")).toHaveTextContent("7");
    expect(screen.getByTestId("metric-total-commission")).toHaveTextContent("฿35,400.00");
    expect(screen.getByTestId("metric-pending-commission")).toHaveTextContent("฿15,400.00");
    expect(screen.getByTestId("metric-paid-commission")).toHaveTextContent("฿20,000.00");
    expect(screen.getByTestId("metric-cancelled-bookings")).toHaveTextContent("2");
  });
});

describe("Agent Status Badges", () => {
  it("renders booking status badges with proper labels and testids", () => {
    const { rerender } = render(<AgentBookingStatusBadge status="CONFIRMED" />);
    expect(screen.getByTestId("booking-status-confirmed")).toHaveTextContent("Confirmed");

    rerender(<AgentBookingStatusBadge status="PENDING" />);
    expect(screen.getByTestId("booking-status-pending")).toHaveTextContent("Pending");

    rerender(<AgentBookingStatusBadge status="AWAITING_APPROVAL" />);
    expect(screen.getByTestId("booking-status-awaiting_approval")).toHaveTextContent("Awaiting Approval");

    rerender(<AgentBookingStatusBadge status="CANCELLED" />);
    expect(screen.getByTestId("booking-status-cancelled")).toHaveTextContent("Cancelled");
  });

  it("renders payment and commission status badges correctly", () => {
    render(
      <div>
        <AgentPaymentStatusBadge status="PAID" />
        <AgentPaymentStatusBadge status="UNPAID" />
        <AgentCommissionStatusBadge status="ACTIVE" />
        <AgentCommissionStatusBadge status="CANCELLED" />
        <AgentPriceApprovalBadge status="APPROVED" />
      </div>
    );

    expect(screen.getByTestId("payment-status-paid")).toHaveTextContent("Paid");
    expect(screen.getByTestId("payment-status-unpaid")).toHaveTextContent("Unpaid");
    expect(screen.getByTestId("commission-status-active")).toHaveTextContent("Active");
    expect(screen.getByTestId("commission-status-cancelled")).toHaveTextContent("Cancelled");
    expect(screen.getByText("Price Approved")).toBeInTheDocument();
  });
});

describe("RecentBookingsPreview Component", () => {
  it("renders empty state when no bookings exist", () => {
    render(<RecentBookingsPreview bookings={[]} isLoading={false} />);
    expect(screen.getByTestId("recent-bookings-empty")).toBeInTheDocument();
    expect(screen.getByText("No bookings created yet")).toBeInTheDocument();
  });

  it("renders booking rows when records exist", () => {
    const mockBookings: AgentBookingRecord[] = [
      {
        id: "bkg-12345678",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        fulfillmentStatus: "NOT_STARTED",
        basePrice: 5000,
        proposedPrice: null,
        finalPrice: 5000,
        requiresApproval: false,
        notes: "Allergies to shellfish",
        createdAt: "2026-11-01T10:00:00Z",
        updatedAt: "2026-11-01T10:00:00Z",
        service: {
          id: "srv-1",
          name: "Phi Phi Island Luxury Catamaran Tour",
          type: "DAY_TRIP",
        },
        availability: {
          id: "av-1",
          date: "2026-11-15T00:00:00Z",
        },
        customer: {
          id: "cust-1",
          name: "Alice Johnson",
          email: "alice@example.com",
          phone: "+66810000001",
        },
      },
    ];

    render(<RecentBookingsPreview bookings={mockBookings} isLoading={false} />);
    expect(screen.getByTestId("recent-booking-row-bkg-12345678")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Island Luxury Catamaran Tour")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("฿5,000")).toBeInTheDocument();
  });
});

describe("RecentCommissionsPreview Component", () => {
  it("renders empty state when no commissions exist", () => {
    render(<RecentCommissionsPreview commissions={[]} isLoading={false} />);
    expect(screen.getByTestId("recent-commissions-empty")).toBeInTheDocument();
    expect(screen.getByText("No commissions recorded yet")).toBeInTheDocument();
  });

  it("renders commission ledger rows when records exist", () => {
    const mockCommissions: AgentCommissionRecord[] = [
      {
        id: "comm-12345678",
        bookingId: "bkg-87654321",
        agentId: "agent-1",
        ruleId: "rule-1",
        rateType: "PERCENTAGE",
        rateValue: 10,
        baseAmount: 10000,
        amount: 1000,
        status: "ACTIVE",
        createdAt: "2026-11-01T12:00:00Z",
        updatedAt: "2026-11-01T12:00:00Z",
        booking: {
          id: "bkg-87654321",
          serviceId: "srv-2",
          status: "CONFIRMED",
          paymentStatus: "PAID",
          finalPrice: 10000,
          service: { id: "srv-2", name: "Phang Nga Bay Sunset Cruise" },
        },
      },
    ];

    render(<RecentCommissionsPreview commissions={mockCommissions} isLoading={false} />);
    expect(screen.getByTestId("recent-commission-row-comm-12345678")).toBeInTheDocument();
    expect(screen.getByText("Phang Nga Bay Sunset Cruise")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("฿1,000.00")).toBeInTheDocument();
  });
});

describe("AgentBookingDetailsDialog Component", () => {
  it("renders full booking information, pricing breakdown, and customer details", () => {
    const mockBooking: AgentBookingRecord = {
      id: "bkg-99988877",
      status: "AWAITING_APPROVAL",
      paymentStatus: "UNPAID",
      fulfillmentStatus: "NOT_STARTED",
      basePrice: 8000,
      proposedPrice: 7200,
      finalPrice: 7200,
      requiresApproval: true,
      notes: "VIP group requires vegetarian lunch options",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T08:00:00Z",
      service: {
        id: "srv-3",
        name: "Similan Islands Speedboat Adventure",
        type: "SPEEDBOAT",
      },
      availability: {
        id: "av-3",
        date: "2026-12-05T00:00:00Z",
      },
      customer: {
        id: "cust-2",
        name: "David Smith",
        email: "david.smith@example.com",
        phone: "+66899998888",
      },
      priceApproval: {
        id: "pa-1",
        status: "PENDING",
        requestedPrice: 7200,
        approvedPrice: null,
        notes: "Requested 10% volume discount for corporate retreat",
        reviewedAt: null,
      },
      commission: {
        id: "c-1",
        amount: 720,
        status: "ACTIVE",
      },
    };

    const handleClose = vi.fn();

    render(
      <AgentBookingDetailsDialog
        isOpen={true}
        onClose={handleClose}
        booking={mockBooking}
      />
    );

    expect(screen.getByTestId("agent-booking-details-dialog")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands Speedboat Adventure")).toBeInTheDocument();
    expect(screen.getByText("David Smith")).toBeInTheDocument();
    expect(screen.getByText("david.smith@example.com")).toBeInTheDocument();
    expect(screen.getByText("+66899998888")).toBeInTheDocument();
    expect(screen.getByText("฿8,000.00")).toBeInTheDocument();
    expect(screen.getAllByText("฿7,200.00").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("฿720.00")).toBeInTheDocument();
    expect(screen.getByText("VIP group requires vegetarian lunch options")).toBeInTheDocument();
    expect(screen.getByText("Custom Agent Rate")).toBeInTheDocument();

    // Close button
    fireEvent.click(screen.getByRole("button", { name: /close details/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
