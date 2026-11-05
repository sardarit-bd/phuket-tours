import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommissionsTable } from "./commissions-table";
import type { AdminCommissionRecord } from "../../types/admin-commissions";

const MOCK_COMMISSIONS: AdminCommissionRecord[] = [
  {
    id: "11111111-aaaa-bbbb-cccc-111111111111",
    bookingId: "22222222-aaaa-bbbb-cccc-222222222222",
    agentId: "33333333-aaaa-bbbb-cccc-333333333333",
    ruleId: "44444444-aaaa-bbbb-cccc-444444444444",
    rateType: "PERCENTAGE",
    rateValue: 10,
    baseAmount: 15000,
    amount: 1500,
    status: "ACTIVE",
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-25T10:00:00.000Z",
    agent: {
      id: "33333333-aaaa-bbbb-cccc-333333333333",
      name: "Andaman Travels Agency",
    },
    booking: {
      id: "22222222-aaaa-bbbb-cccc-222222222222",
      serviceId: "srv-phi-phi",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      finalPrice: 15000,
      service: { id: "srv-phi-phi", name: "Phi Phi Island Day Trip" },
      customer: { id: "cust-1", name: "John Doe", email: "john@example.com" },
    },
  },
  {
    id: "55555555-aaaa-bbbb-cccc-555555555555",
    bookingId: "66666666-aaaa-bbbb-cccc-666666666666",
    agentId: "77777777-aaaa-bbbb-cccc-777777777777",
    ruleId: "88888888-aaaa-bbbb-cccc-888888888888",
    rateType: "FIXED",
    rateValue: 500,
    baseAmount: 8000,
    amount: 500,
    status: "CANCELLED",
    createdAt: "2026-10-20T12:00:00.000Z",
    updatedAt: "2026-10-21T08:00:00.000Z",
    agent: {
      id: "77777777-aaaa-bbbb-cccc-777777777777",
      name: "Phuket Luxury Concierge",
    },
    booking: {
      id: "66666666-aaaa-bbbb-cccc-666666666666",
      serviceId: "srv-sunset-cruise",
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
      finalPrice: 8000,
      service: { id: "srv-sunset-cruise", name: "Promthep Sunset Cruise" },
      customer: { id: "cust-2", name: "Jane Smith", email: "jane@example.com" },
    },
  },
];

describe("CommissionsTable component", () => {
  it("renders loading skeleton when isLoading is true", () => {
    render(
      <CommissionsTable
        commissions={[]}
        isLoading={true}
        isError={false}
        onRetry={vi.fn()}
        onViewDetails={vi.fn()}
        onAdjustCommission={vi.fn()}
      />
    );
    expect(screen.getByTestId("commissions-table-loading")).toBeInTheDocument();
  });

  it("renders empty state when commissions array is empty", () => {
    const handleReset = vi.fn();
    render(
      <CommissionsTable
        commissions={[]}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onViewDetails={vi.fn()}
        onAdjustCommission={vi.fn()}
        onResetFilters={handleReset}
      />
    );
    expect(screen.getByTestId("commissions-table-empty")).toBeInTheDocument();
    expect(screen.getByText(/no commission records found/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /clear active filters/i });
    fireEvent.click(clearBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it("renders error state and handles retry", () => {
    const handleRetry = vi.fn();
    render(
      <CommissionsTable
        commissions={[]}
        isLoading={false}
        isError={true}
        onRetry={handleRetry}
        onViewDetails={vi.fn()}
        onAdjustCommission={vi.fn()}
      />
    );
    expect(screen.getByTestId("commissions-table-error")).toBeInTheDocument();
    expect(screen.getByText(/failed to load commissions ledger/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry request/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders table rows with commission amounts, rate types, and action handlers", () => {
    const handleViewDetails = vi.fn();
    const handleAdjust = vi.fn();

    render(
      <CommissionsTable
        commissions={MOCK_COMMISSIONS}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onViewDetails={handleViewDetails}
        onAdjustCommission={handleAdjust}
      />
    );

    expect(screen.getByTestId("commissions-table")).toBeInTheDocument();

    // Verify first row (ACTIVE)
    expect(screen.getByText("Andaman Travels Agency")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Island Day Trip")).toBeInTheDocument();
    expect(screen.getByText("10.00%")).toBeInTheDocument();
    expect(screen.getByText("฿1,500.00")).toBeInTheDocument();
    expect(screen.getByTestId("commission-status-active")).toBeInTheDocument();

    // Verify second row (CANCELLED)
    expect(screen.getByText("Phuket Luxury Concierge")).toBeInTheDocument();
    expect(screen.getByText("Promthep Sunset Cruise")).toBeInTheDocument();
    expect(screen.getByText("฿500.00 Fixed")).toBeInTheDocument();
    expect(screen.getByText("฿500.00")).toBeInTheDocument();
    expect(screen.getByTestId("commission-status-cancelled")).toBeInTheDocument();

    // Clicking View Details invokes callback
    const viewBtn = screen.getByTestId("view-details-11111111-aaaa-bbbb-cccc-111111111111");
    fireEvent.click(viewBtn);
    expect(handleViewDetails).toHaveBeenCalledWith(MOCK_COMMISSIONS[0]);

    // Clicking Adjust for Active commission invokes callback
    const adjustBtnActive = screen.getByTestId("adjust-commission-11111111-aaaa-bbbb-cccc-111111111111");
    expect(adjustBtnActive).not.toBeDisabled();
    fireEvent.click(adjustBtnActive);
    expect(handleAdjust).toHaveBeenCalledWith(MOCK_COMMISSIONS[0]);

    // Adjust button for Cancelled commission is disabled
    const adjustBtnCancelled = screen.getByTestId("adjust-commission-55555555-aaaa-bbbb-cccc-555555555555");
    expect(adjustBtnCancelled).toBeDisabled();
  });
});
