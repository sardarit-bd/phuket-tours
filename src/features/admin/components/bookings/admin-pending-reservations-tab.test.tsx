import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminPendingReservationsTab } from "./admin-pending-reservations-tab";
import * as adminApiModule from "../../api/admin-api";
import type { PendingReservationRecord } from "../../types/admin-bookings";

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminPendingReservationsQuery: vi.fn(),
    useReviewAdminPendingReservationMutation: vi.fn(),
  };
});

const MOCK_PENDING_1: PendingReservationRecord = {
  id: "bkg-pending-1",
  status: "PENDING",
  paymentStatus: "PAID",
  fulfillmentStatus: "NOT_STARTED",
  currency: "USD",
  basePrice: 200,
  finalPrice: 200,
  requiresApproval: false,
  notes: "Travel Date: 2026-11-20 | Guests: 2 Adults",
  internalNotes: null,
  createdAt: "2026-11-09T08:00:00.000Z",
  updatedAt: "2026-11-09T08:05:00.000Z",
  customer: {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+66812345678",
  },
  service: {
    id: "srv-1",
    name: "Phi Phi Island Day Trip",
    type: "TOUR",
  },
};

const MOCK_PENDING_2: PendingReservationRecord = {
  id: "bkg-pending-2",
  status: "PENDING",
  paymentStatus: "UNPAID",
  fulfillmentStatus: "NOT_STARTED",
  currency: "THB",
  basePrice: 5500,
  finalPrice: 5500,
  requiresApproval: false,
  notes: null,
  internalNotes: null,
  createdAt: "2026-11-09T09:00:00.000Z",
  updatedAt: "2026-11-09T09:00:00.000Z",
  customer: {
    id: "cust-2",
    name: "Bob Williams",
    email: "bob@example.com",
    phone: null,
  },
  service: {
    id: "srv-2",
    name: "James Bond Kayaking",
    type: "TOUR",
  },
};

describe("AdminPendingReservationsTab component", () => {
  const mockRefetch = vi.fn();
  const mockReviewReservation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockReviewReservation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });

    vi.mocked(adminApiModule.useReviewAdminPendingReservationMutation).mockReturnValue([
      mockReviewReservation,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useGetAdminPendingReservationsQuery).mockReturnValue({
      data: {
        success: true,
        data: {
          items: [MOCK_PENDING_1, MOCK_PENDING_2],
          page: 1,
          limit: 10,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  it("renders pending reservations list and toolbar", () => {
    render(<AdminPendingReservationsTab />);

    expect(screen.getByTestId("admin-pending-reservations-tab")).toBeInTheDocument();
    expect(screen.getByTestId("pending-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("pending-payment-status-filter")).toBeInTheDocument();

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Island Day Trip")).toBeInTheDocument();
    expect(screen.getByText("Bob Williams")).toBeInTheDocument();
    expect(screen.getByText("James Bond Kayaking")).toBeInTheDocument();
  });

  it("opens confirmation dialog and submits confirmation", async () => {
    render(<AdminPendingReservationsTab />);

    const confirmBtn = screen.getByTestId("confirm-pending-bkg-pending-1");
    fireEvent.click(confirmBtn);

    expect(screen.getByText("Confirm Tour Reservation")).toBeInTheDocument();
    const submitBtn = screen.getByTestId("confirm-dialog-submit");
    fireEvent.click(submitBtn);

    expect(mockReviewReservation).toHaveBeenCalledWith({
      bookingId: "bkg-pending-1",
      action: "CONFIRM",
      notes: undefined,
    });
  });

  it("opens reject dialog and submits rejection", async () => {
    render(<AdminPendingReservationsTab />);

    const rejectBtn = screen.getByTestId("reject-pending-bkg-pending-2");
    fireEvent.click(rejectBtn);

    expect(screen.getByText("Reject / Cancel Reservation")).toBeInTheDocument();
    const submitBtn = screen.getByTestId("reject-dialog-submit");
    fireEvent.click(submitBtn);

    expect(mockReviewReservation).toHaveBeenCalledWith({
      bookingId: "bkg-pending-2",
      action: "REJECT",
      notes: undefined,
    });
  });
});

