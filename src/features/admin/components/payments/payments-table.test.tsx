import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentsTable } from "./payments-table";
import type { AdminPaymentRecord } from "../../types/admin-payments";

const MOCK_PAYMENTS: AdminPaymentRecord[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    bookingId: "a1111111-2222-3333-4444-555555555555",
    customerId: "c1111111-2222-3333-4444-555555555555",
    amount: 3500,
    method: "BANK_TRANSFER",
    status: "SUBMITTED",
    reference: "SLIP-998811",
    receiptNote: "Paid via KBank transfer",
    submittedAt: "2026-10-20T10:00:00.000Z",
    receivedAt: null,
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    createdAt: "2026-10-20T09:30:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
    booking: {
      id: "a1111111-2222-3333-4444-555555555555",
      serviceId: "srv-phi-phi-island",
      agentId: null,
      status: "CONFIRMED",
      paymentStatus: "PARTIALLY_PAID",
      finalPrice: 3500,
    },
  },
  {
    id: "b2222222-3333-4444-5555-666666666666",
    bookingId: "a2222222-3333-4444-5555-666666666666",
    customerId: "c2222222-3333-4444-5555-666666666666",
    amount: 1200,
    method: "CASH",
    status: "VERIFIED",
    reference: "CASH-REC-001",
    receiptNote: null,
    submittedAt: null,
    receivedAt: "2026-10-18T14:00:00.000Z",
    reviewedById: "staff-1",
    reviewedAt: "2026-10-18T14:05:00.000Z",
    reviewNotes: "Cash received in office",
    createdAt: "2026-10-18T13:50:00.000Z",
    updatedAt: "2026-10-18T14:05:00.000Z",
    booking: {
      id: "a2222222-3333-4444-5555-666666666666",
      serviceId: "srv-city-tour",
      agentId: null,
      status: "COMPLETED",
      paymentStatus: "PAID",
      finalPrice: 1200,
    },
  },
];

describe("PaymentsTable component", () => {
  it("renders loading skeleton when isLoading is true", () => {
    render(
      <PaymentsTable
        payments={[]}
        isLoading={true}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByTestId("admin-payments-table-loading")).toBeInTheDocument();
  });

  it("renders empty state when payments list is empty", () => {
    render(
      <PaymentsTable
        payments={[]}
        isLoading={false}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByTestId("admin-payments-table-empty")).toBeInTheDocument();
    expect(screen.getByText(/no payment records found/i)).toBeInTheDocument();
  });

  it("renders error state when isError is true", () => {
    const handleRetry = vi.fn();
    render(
      <PaymentsTable
        payments={[]}
        isLoading={false}
        isError={true}
        errorMessage="Network timeout"
        onRetry={handleRetry}
        onViewDetails={vi.fn()}
      />
    );
    expect(screen.getByTestId("admin-payments-table-error")).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders table rows with payment data, badges, and formats amount in THB", () => {
    const handleView = vi.fn();
    render(
      <PaymentsTable
        payments={MOCK_PAYMENTS}
        isLoading={false}
        onViewDetails={handleView}
      />
    );

    expect(screen.getByTestId("admin-payments-table")).toBeInTheDocument();
    expect(screen.getByText("#f47ac10b")).toBeInTheDocument();
    expect(screen.getByText("฿3,500.00")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Verification")).toBeInTheDocument();
    expect(screen.getByText("Bank Transfer")).toBeInTheDocument();

    expect(screen.getByText("#b2222222")).toBeInTheDocument();
    expect(screen.getByText("฿1,200.00")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();

    // Clicking row calls onViewDetails
    fireEvent.click(screen.getByTestId("payment-row-f47ac10b-58cc-4372-a567-0e02b2c3d479"));
    expect(handleView).toHaveBeenCalledWith(MOCK_PAYMENTS[0]);
  });
});
