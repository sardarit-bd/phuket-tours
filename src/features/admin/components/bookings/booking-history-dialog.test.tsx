import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingHistoryDialog } from "./booking-history-dialog";
import * as adminApiModule from "../../api/admin-api";
import type { OperationalBookingRecord, BookingHistoryRecord } from "../../types/admin-bookings";

vi.mock("../../api/admin-api", () => ({
  useGetAdminBookingHistoryQuery: vi.fn(),
  useGetStaffBookingHistoryQuery: vi.fn(),
}));

const MOCK_BOOKING: OperationalBookingRecord = {
  id: "bkg-history-001",
  status: "CONFIRMED",
  fulfillmentStatus: "IN_PROGRESS",
  paymentStatus: "PAID",
  assignedStaffId: "staff-2",
  currency: "USD",
  finalPrice: 240,
  basePrice: 240,
  notes: "Travel Date: 2026-11-25 | Guests: 2 Adults",
  internalNotes: null,
  createdAt: "2026-11-01T08:00:00.000Z",
  updatedAt: "2026-11-09T10:00:00.000Z",
  service: {
    id: "srv-10",
    name: "Phang Nga Bay Sunset Cruise",
    type: "TOUR",
  },
  availability: {
    id: "avail-10",
    date: "2026-11-25T00:00:00.000Z",
  },
  customer: {
    id: "cust-10",
    name: "Elena Rostova",
    email: "elena@example.com",
    phone: "+66 89 123 4567",
  },
  assignedStaff: {
    id: "staff-2",
    name: "Niran Chai",
  },
};

const MOCK_EVENTS: BookingHistoryRecord[] = [
  {
    id: "evt-5",
    bookingId: "bkg-history-001",
    actorId: "staff-2",
    actorName: "Niran Chai",
    actorRole: "staff",
    action: "OPERATIONS_STATUS_UPDATED",
    changes: {
      previousFulfillmentStatus: "NOT_STARTED",
      newFulfillmentStatus: "IN_PROGRESS",
      previousBookingStatus: "CONFIRMED",
      newBookingStatus: "IN_PROGRESS",
      notes: "Guests boarded luxury catamaran",
    },
    createdAt: "2026-11-09T11:30:00.000Z",
  },
  {
    id: "evt-4",
    bookingId: "bkg-history-001",
    actorId: "admin-1",
    actorName: "Chaiwat Admin",
    actorRole: "admin",
    action: "OPERATIONS_ASSIGNED",
    changes: {
      previousStaffId: "staff-1",
      previousStaffName: "Somchai Prasert",
      newStaffId: "staff-2",
      newStaffName: "Niran Chai",
      notes: "Reassigned to afternoon crew",
    },
    createdAt: "2026-11-09T10:15:00.000Z",
  },
  {
    id: "evt-3",
    bookingId: "bkg-history-001",
    actorId: "admin-1",
    actorName: "Chaiwat Admin",
    actorRole: "admin",
    action: "OPERATIONS_ASSIGNED",
    changes: {
      previousStaffId: null,
      previousStaffName: null,
      newStaffId: "staff-1",
      newStaffName: "Somchai Prasert",
      notes: "Initial assignment",
    },
    createdAt: "2026-11-09T09:00:00.000Z",
  },
  {
    id: "evt-2",
    bookingId: "bkg-history-001",
    actorId: "cust-10",
    actorName: "System (Stripe)",
    actorRole: "customer",
    action: "STRIPE_PAYMENT_VERIFIED",
    changes: {
      paymentId: "pay-1",
      amount: 240,
      currency: "USD",
      autoConfirmed: true,
    },
    createdAt: "2026-11-01T08:05:00.000Z",
  },
  {
    id: "evt-1",
    bookingId: "bkg-history-001",
    actorId: "cust-10",
    actorName: "Elena Rostova",
    actorRole: "customer",
    action: "BOOKING_CREATED",
    changes: {
      status: "PENDING",
      basePrice: 240,
      finalPrice: 240,
      currency: "USD",
    },
    createdAt: "2026-11-01T08:00:00.000Z",
  },
];

describe("BookingHistoryDialog component", () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminApiModule.useGetStaffBookingHistoryQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders chronological audit timeline with assignment, reassignment, fulfillment, payment, and creation events", () => {
    vi.mocked(adminApiModule.useGetAdminBookingHistoryQuery).mockReturnValue({
      data: {
        success: true,
        data: {
          items: MOCK_EVENTS,
          page: 1,
          limit: 50,
          total: 5,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(
      <BookingHistoryDialog
        isOpen={true}
        onClose={mockOnClose}
        booking={MOCK_BOOKING}
      />
    );

    expect(screen.getByTestId("booking-history-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("booking-history-timeline")).toBeInTheDocument();

    // Verify titles
    expect(screen.getByText("Fulfillment Changed to In Progress")).toBeInTheDocument();
    expect(screen.getByText("Staff Member Reassigned")).toBeInTheDocument();
    expect(screen.getByText("Staff Member Assigned")).toBeInTheDocument();
    expect(screen.getByText("Stripe Payment Verified")).toBeInTheDocument();
    expect(screen.getByText("Booking Created")).toBeInTheDocument();

    // Verify actors & roles
    expect(screen.getAllByText("Chaiwat Admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Niran Chai").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Staff").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("System").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Customer").length).toBeGreaterThanOrEqual(1);

    // Verify old and new values in reassignment
    expect(screen.getAllByText("Somchai Prasert").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Guests boarded luxury catamaran")).toBeInTheDocument();
    expect(screen.getByText("Reassigned to afternoon crew")).toBeInTheDocument();
  });

  it("renders empty state when booking has no history records", () => {
    vi.mocked(adminApiModule.useGetAdminBookingHistoryQuery).mockReturnValue({
      data: {
        success: true,
        data: {
          items: [],
          page: 1,
          limit: 50,
          total: 0,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(
      <BookingHistoryDialog
        isOpen={true}
        onClose={mockOnClose}
        booking={MOCK_BOOKING}
      />
    );

    expect(screen.getByTestId("booking-history-empty")).toBeInTheDocument();
    expect(screen.getByText("No recorded activity yet")).toBeInTheDocument();
  });

  it("renders error state and allows retry when API fails", () => {
    vi.mocked(adminApiModule.useGetAdminBookingHistoryQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(
      <BookingHistoryDialog
        isOpen={true}
        onClose={mockOnClose}
        booking={MOCK_BOOKING}
      />
    );

    expect(screen.getByTestId("booking-history-error")).toBeInTheDocument();
    expect(screen.getByText("Unable to load activity history")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Try Again"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders loading skeleton while fetching initial history", () => {
    vi.mocked(adminApiModule.useGetAdminBookingHistoryQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(
      <BookingHistoryDialog
        isOpen={true}
        onClose={mockOnClose}
        booking={MOCK_BOOKING}
      />
    );

    expect(screen.getByTestId("booking-history-loading")).toBeInTheDocument();
  });
});

