import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminBookingsView } from "./admin-bookings-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type {
  OperationalBookingRecord,
  AdminStaffMember,
} from "../../types/admin-bookings";

const MOCK_BOOKING_1: OperationalBookingRecord = {
  id: "bkg-101-uuid",
  status: "CONFIRMED",
  fulfillmentStatus: "NOT_STARTED",
  paymentStatus: "PAID",
  assignedStaffId: "staff-1",
  currency: "USD",
  finalPrice: 200,
  basePrice: 200,
  notes: "Travel Date: 2026-11-20 | Guests: 2 Adults | Notes: Customer notes",
  internalNotes: "Internal note",
  createdAt: "2026-10-15T08:00:00.000Z",
  updatedAt: "2026-10-16T10:00:00.000Z",
  service: {
    id: "srv-1",
    name: "Similan Islands Day Trip",
    type: "TOUR",
  },
  availability: {
    id: "avail-1",
    date: "2026-11-20T00:00:00.000Z",
  },
  customer: {
    id: "cust-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+66 81 111 2222",
  },
  assignedStaff: {
    id: "staff-1",
    name: "Somchai Staff",
  },
};

const MOCK_BOOKING_2: OperationalBookingRecord = {
  id: "bkg-102-uuid",
  status: "IN_PROGRESS",
  fulfillmentStatus: "IN_PROGRESS",
  paymentStatus: "UNPAID",
  assignedStaffId: null,
  currency: "USD",
  finalPrice: 150,
  basePrice: 150,
  notes: null,
  internalNotes: null,
  createdAt: "2026-10-16T08:00:00.000Z",
  updatedAt: "2026-10-16T10:00:00.000Z",
  service: {
    id: "srv-2",
    name: "James Bond Island Cruise",
    type: "TOUR",
  },
  availability: null,
  customer: {
    id: "cust-2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+66 82 333 4444",
  },
  assignedStaff: null,
};

const MOCK_PENDING_BOOKING: any = {
  id: "bkg-103-uuid",
  status: "PENDING",
  fulfillmentStatus: "NOT_STARTED",
  paymentStatus: "PAID",
  currency: "USD",
  basePrice: 300,
  finalPrice: 300,
  requiresApproval: false,
  notes: "Travel Date: 2026-12-01 | Guests: 1 Adult",
  internalNotes: null,
  createdAt: "2026-10-17T08:00:00.000Z",
  updatedAt: "2026-10-17T08:00:00.000Z",
  customer: {
    id: "cust-3",
    name: "Bob Traveler",
    email: "bob@example.com",
    phone: "+66 83 555 6666",
  },
  service: {
    id: "srv-3",
    name: "Phi Phi Early Bird Tour",
    type: "TOUR",
  },
  availability: {
    id: "avail-3",
    date: "2026-12-01T00:00:00.000Z",
  },
};

const MOCK_STAFF: AdminStaffMember[] = [
  {
    id: "staff-1",
    name: "Somchai Staff",
    email: "somchai@qbictravel.com",
    phone: "+66 81 999 8888",
    role: "staff",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminOperationsBookingsQuery: vi.fn(),
    useGetAdminStaffQuery: vi.fn(),
    useGetAdminAgentsQuery: vi.fn(),
    useAssignBookingStaffMutation: vi.fn(),
    useUpdateBookingFulfillmentStatusMutation: vi.fn(),
    useReviewBookingPriceApprovalMutation: vi.fn(),
    useGetAdminPendingReservationsQuery: vi.fn(),
    useReviewAdminPendingReservationMutation: vi.fn(),
    useGetAdminBookingsReportQuery: vi.fn(),
    useGetAdminBookingHistoryQuery: vi.fn(),
    useGetStaffBookingHistoryQuery: vi.fn(),
  };
});

describe("AdminBookingsView component", () => {
  const mockRefetchOperations = vi.fn();
  const mockRefetchPending = vi.fn();
  const mockRefetchReport = vi.fn();
  const mockAssignStaff = vi.fn();
  const mockUpdateFulfillment = vi.fn();
  const mockReviewApproval = vi.fn();
  const mockReviewPending = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockAssignStaff.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockUpdateFulfillment.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockReviewApproval.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockReviewPending.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });

    vi.mocked(adminApiModule.useAssignBookingStaffMutation).mockReturnValue([
      mockAssignStaff,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useUpdateBookingFulfillmentStatusMutation).mockReturnValue([
      mockUpdateFulfillment,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useReviewBookingPriceApprovalMutation).mockReturnValue([
      mockReviewApproval,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useReviewAdminPendingReservationMutation).mockReturnValue([
      mockReviewPending,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useGetAdminBookingsReportQuery).mockReturnValue({
      data: {
        success: true,
        data: {
          totalBookings: 3,
          byStatus: [
            { status: "CONFIRMED", count: 1, totalValue: 200 },
            { status: "IN_PROGRESS", count: 1, totalValue: 150 },
            { status: "PENDING", count: 1, totalValue: 300 },
          ],
        },
      },
      isLoading: false,
      refetch: mockRefetchReport,
    } as any);

    vi.mocked(adminApiModule.useGetAdminPendingReservationsQuery).mockReturnValue({
      data: {
        success: true,
        data: {
          items: [MOCK_PENDING_BOOKING],
          page: 1,
          limit: 100,
          total: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetchPending,
    } as any);

    vi.mocked(adminApiModule.useGetAdminStaffQuery).mockReturnValue({
      data: { success: true, message: "OK", data: { items: MOCK_STAFF, page: 1, limit: 10, total: 1 } },
      isLoading: false,
    } as any);

    vi.mocked(adminApiModule.useGetAdminAgentsQuery).mockReturnValue({
      data: { success: true, message: "OK", data: { items: [], page: 1, limit: 100, total: 0 } },
      isLoading: false,
    } as any);

    vi.mocked(adminApiModule.useGetAdminOperationsBookingsQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: [MOCK_BOOKING_1, MOCK_BOOKING_2],
          page: 1,
          limit: 100,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mockRefetchOperations,
    } as any);

    vi.mocked(adminApiModule.useGetAdminBookingHistoryQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: [
            {
              id: "hist-101",
              bookingId: "bkg-101-uuid",
              actorId: "admin-1",
              actorName: "Admin User",
              actorRole: "admin",
              action: "OPERATIONS_ASSIGNED",
              changes: {
                previousStaffId: null,
                newStaffId: "staff-1",
                newStaffName: "Somchai Staff",
                notes: "Assigned to morning boat",
              },
              createdAt: "2026-10-16T09:00:00.000Z",
            },
          ],
          page: 1,
          limit: 50,
          total: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(adminApiModule.useGetStaffBookingHistoryQuery).mockReturnValue({
      data: { success: true, data: { items: [], page: 1, limit: 50, total: 0 } },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders unified header, summary cards, and status filter tabs", () => {
    render(<AdminBookingsView />);

    expect(screen.getByText("Bookings Management")).toBeInTheDocument();

    // Summary cards
    expect(screen.getByTestId("summary-total-bookings")).toBeInTheDocument();
    expect(screen.getByTestId("summary-pending-review")).toBeInTheDocument();
    expect(screen.getByTestId("summary-confirmed")).toBeInTheDocument();
    expect(screen.getByTestId("summary-in-progress")).toBeInTheDocument();
    expect(screen.getByTestId("summary-completed")).toBeInTheDocument();

    // Status filter tabs
    expect(screen.getByTestId("status-filter-all")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter-pending")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter-confirmed")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter-in_progress")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter-completed")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter-cancelled")).toBeInTheDocument();
  });

  it("renders both operational bookings and pending reservations in unified table", () => {
    render(<AdminBookingsView />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands Day Trip")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Cruise")).toBeInTheDocument();
    expect(screen.getByText("Bob Traveler")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Early Bird Tour")).toBeInTheDocument();
  });

  it("filters bookings when clicking a status tab", () => {
    render(<AdminBookingsView />);

    const pendingFilterTab = screen.getByTestId("status-filter-pending");
    fireEvent.click(pendingFilterTab);

    // Only pending booking should appear
    expect(screen.getByText("Bob Traveler")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("filters unified items via search input", () => {
    render(<AdminBookingsView />);

    const searchInput = screen.getByTestId("bookings-search-input");
    fireEvent.change(searchInput, { target: { value: "Similan" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Traveler")).not.toBeInTheDocument();
  });

  it("opens booking details modal on click", () => {
    render(<AdminBookingsView />);

    const bookingIdBtn = screen.getByText("#bkg-101-…");
    fireEvent.click(bookingIdBtn);

    expect(screen.getByTestId("booking-details-dialog")).toBeInTheDocument();
    expect(screen.getByText("Customer notes")).toBeInTheDocument();
    expect(screen.getByText("Internal note")).toBeInTheDocument();
  });

  it("opens assign staff dialog for confirmed booking and submits assignment", async () => {
    render(<AdminBookingsView />);

    const menuTrigger = screen.getByTestId("booking-actions-trigger-bkg-101-uuid");
    fireEvent.click(menuTrigger);

    const assignBtn = screen.getByText("Assign Staff");
    fireEvent.click(assignBtn);

    expect(screen.getByText("Assign Responsible Staff")).toBeInTheDocument();

    const notesInput = screen.getByTestId("assign-staff-notes");
    fireEvent.change(notesInput, { target: { value: "Handover to Somchai at pier" } });

    const submitBtn = screen.getByTestId("assign-staff-submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAssignStaff).toHaveBeenCalledWith({
        bookingId: "bkg-101-uuid",
        staffId: "staff-1",
        notes: "Handover to Somchai at pier",
      });
    });
  });

  it("opens confirm modal for pending reservation and calls mutation", async () => {
    render(<AdminBookingsView />);

    const menuTrigger = screen.getByTestId("booking-actions-trigger-bkg-103-uuid");
    fireEvent.click(menuTrigger);

    const confirmBtn = screen.getByTestId("action-confirm-booking-bkg-103-uuid");
    fireEvent.click(confirmBtn);

    expect(screen.getByText(/Confirm Reservation #bkg-103-/i)).toBeInTheDocument();

    const submitBtn = screen.getByTestId("confirm-dialog-submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockReviewPending).toHaveBeenCalledWith({
        bookingId: "bkg-103-uuid",
        action: "CONFIRM",
        notes: undefined,
      });
    });
  });

  it("opens only BookingDetailsDialog when clicking View Details and only BookingHistoryDialog when clicking View History", () => {
    render(<AdminBookingsView />);

    // 1. Open menu and click View Details
    const menuTrigger1 = screen.getByTestId("booking-actions-trigger-bkg-101-uuid");
    fireEvent.click(menuTrigger1);

    const viewDetailsBtn = screen.getByTestId("action-view-details-bkg-101-uuid");
    fireEvent.click(viewDetailsBtn);

    expect(screen.getByTestId("booking-details-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-history-dialog")).not.toBeInTheDocument();

    // Close Details modal
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("booking-details-dialog")).not.toBeInTheDocument();

    // 2. Open menu and click View History
    fireEvent.click(menuTrigger1);
    const viewHistoryBtn = screen.getByTestId("action-view-history-bkg-101-uuid");
    fireEvent.click(viewHistoryBtn);

    expect(screen.getByTestId("booking-history-dialog")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-details-dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Booking Activity History")).toBeInTheDocument();
    expect(screen.getByText("Staff Member Assigned")).toBeInTheDocument();
    expect(screen.getByText("Assigned to morning boat")).toBeInTheDocument();
  });
});
