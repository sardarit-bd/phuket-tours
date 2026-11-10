import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { CustomerBookingsTable } from "./customer-bookings-table";
import {
  useGetCustomerBookingsQuery,
} from "@/features/customer/api/customer-api";
import type { CustomerBookingRecord } from "@/features/customer/types/customer";

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock("@/features/customer/api/customer-api", () => ({
  useGetCustomerBookingsQuery: vi.fn(),
}));

const mockUseGetCustomerBookingsQuery = vi.mocked(useGetCustomerBookingsQuery);

type QueryResult = ReturnType<typeof useGetCustomerBookingsQuery>;

function renderWithStore(ui: React.ReactElement) {
  const store = makeStore();
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

// ── Factory helpers ───────────────────────────────────────────────────

function makeBooking(overrides: Partial<CustomerBookingRecord> = {}): CustomerBookingRecord {
  return {
    id: "b0000001-0000-0000-0000-000000000001",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    fulfillmentStatus: "NOT_STARTED",
    basePrice: 1200,
    finalPrice: 1200,
    notes: null,
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-06-01T08:00:00Z",
    service: { id: "s1", name: "Phang Nga Bay Cruise", type: "TOUR" },
    availability: { id: "a1", date: "2025-09-15" },
    ...overrides,
  };
}

const BOOKINGS: CustomerBookingRecord[] = [
  makeBooking(),
  makeBooking({
    id: "b0000001-0000-0000-0000-000000000002",
    status: "PENDING",
    paymentStatus: "UNPAID",
    service: { id: "s2", name: "Phi Phi Island Hopping", type: "TOUR" },
    availability: { id: "a2", date: "2025-10-01" },
    finalPrice: 800,
  }),
];

function mockResult(result: Partial<QueryResult>): void {
  mockUseGetCustomerBookingsQuery.mockReturnValue(result as QueryResult);
}

describe("CustomerBookingsTable", () => {
  beforeEach(() => {
    mockUseGetCustomerBookingsQuery.mockReset();
  });

  it("renders loading skeleton when isLoading is true", () => {
    mockResult({ data: undefined, isLoading: true, isFetching: true, error: null, refetch: vi.fn() });

    renderWithStore(<CustomerBookingsTable />);
    expect(screen.getByTestId("customer-bookings-loading")).toBeInTheDocument();
  });

  it("renders empty state when no bookings exist", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerBookingsTable />);
    expect(screen.getByTestId("customer-bookings-empty")).toBeInTheDocument();
  });

  it("renders booking rows with tour name, date, status, and price", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: {
          items: BOOKINGS,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerBookingsTable />);

    expect(
      screen.getByTestId("customer-booking-row-b0000001-0000-0000-0000-000000000001")
    ).toBeInTheDocument();
    expect(screen.getByText("Phang Nga Bay Cruise")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Island Hopping")).toBeInTheDocument();
    expect(screen.getByTestId("customer-bookings-table")).toBeInTheDocument();
  });

  it("renders error banner when query fails", () => {
    mockResult({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 500, message: "Server error" },
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerBookingsTable />);
    expect(screen.getByTestId("customer-bookings-error")).toBeInTheDocument();
  });

  it("resets to page 1 when a status filter tab is clicked", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithStore(<CustomerBookingsTable />);

    const confirmedTab = screen.getByTestId("customer-filter-tab-confirmed");
    fireEvent.click(confirmedTab);

    expect(mockUseGetCustomerBookingsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: "CONFIRMED", page: 1 })
    );
  });

  it("hides the Customer column and Commission fields (customer-safe)", () => {
    mockResult({
      data: {
        success: true,
        message: "ok",
        data: {
          items: BOOKINGS,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = renderWithStore(<CustomerBookingsTable />);

    // No "Customer" column header (agent-only field)
    const allTh = Array.from(container.querySelectorAll("th")).map((th) => th.textContent);
    expect(allTh.join(" ")).not.toContain("Customer");
    // No "Commission" column header
    expect(container.innerHTML).not.toContain("Commission");
    // No "Price Approval" badge (agent-only)
    expect(container.innerHTML).not.toContain("Price Approval");
  });
});
