import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { CustomerPaymentsTable } from "./customer-payments-table";
import { useGetCustomerPaymentsQuery } from "@/features/customer/api/customer-api";
import type { CustomerPaymentRecord } from "@/features/customer/types/customer";

vi.mock("@/features/customer/api/customer-api", () => ({
  useGetCustomerPaymentsQuery: vi.fn(),
}));

const mockUseGetCustomerPaymentsQuery = vi.mocked(useGetCustomerPaymentsQuery);

type QueryResult = ReturnType<typeof useGetCustomerPaymentsQuery>;

function renderWithStore(ui: React.ReactElement) {
  const store = makeStore();
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

function makePayment(overrides: Partial<CustomerPaymentRecord> = {}): CustomerPaymentRecord {
  return {
    id: "p0000001-0000-0000-0000-000000000001",
    bookingId: "b0000001-0000-0000-0000-000000000001",
    customerId: "c0000001-0000-0000-0000-000000000001",
    amount: 1200,
    method: "BANK_TRANSFER",
    status: "VERIFIED",
    reference: "TXN-2025-001",
    receiptNote: null,
    submittedAt: "2025-06-01T10:00:00Z",
    receivedAt: "2025-06-01T10:05:00Z",
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-06-01T10:05:00Z",
    ...overrides,
  };
}

const PAYMENTS: CustomerPaymentRecord[] = [
  makePayment(),
  makePayment({
    id: "p0000001-0000-0000-0000-000000000002",
    status: "SUBMITTED",
    method: "CASH",
    amount: 800,
  }),
];

function mockResult(result: Partial<QueryResult>): void {
  mockUseGetCustomerPaymentsQuery.mockReturnValue(result as QueryResult);
}

describe("CustomerPaymentsTable", () => {
  beforeEach(() => {
    mockUseGetCustomerPaymentsQuery.mockReset();
  });

  it("renders loading state when isLoading is true", () => {
    mockResult({ data: undefined, isLoading: true, isFetching: true, error: null, refetch: vi.fn() });

    renderWithStore(<CustomerPaymentsTable />);
    expect(screen.getByTestId("customer-payments-loading")).toBeInTheDocument();
  });

  it("renders empty state when no payments exist", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: { items: [], page: 1, limit: 10, total: 0 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerPaymentsTable />);
    expect(screen.getByTestId("customer-payments-empty")).toBeInTheDocument();
  });

  it("renders payment rows with method, status, amount, and reference", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: {
          items: PAYMENTS,
          page: 1,
          limit: 10,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerPaymentsTable />);

    expect(
      screen.getByTestId("customer-payment-row-p0000001-0000-0000-0000-000000000001")
    ).toBeInTheDocument();
    expect(screen.getByText("Bank Transfer")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getAllByText(/TXN-2025-001/).length).toBeGreaterThan(0);
  });

  it("opens payment detail dialog when Details button is clicked", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: {
          items: PAYMENTS,
          page: 1,
          limit: 10,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerPaymentsTable />);

    const detailBtn = screen.getByTestId(
      "view-payment-p0000001-0000-0000-0000-000000000001"
    );
    fireEvent.click(detailBtn);

    expect(screen.getByTestId("customer-payment-detail-dialog")).toBeInTheDocument();
    expect(screen.getByText("Payment Details")).toBeInTheDocument();
  });

  it("renders error banner when query fails", () => {
    mockResult({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 500, message: "Server error" },
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerPaymentsTable />);
    expect(screen.getByTestId("customer-payments-error")).toBeInTheDocument();
  });

  it("filters by status when a status tab is clicked", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: { items: [], page: 1, limit: 10, total: 0 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerPaymentsTable />);

    const verifiedTab = screen.getByTestId("customer-payment-filter-verified");
    fireEvent.click(verifiedTab);

    expect(mockUseGetCustomerPaymentsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: "VERIFIED" })
    );
  });
});
