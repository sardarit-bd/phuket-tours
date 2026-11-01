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
  notes: "Customer notes",
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
    phone: "+66 82 333 4444",
  },
  assignedStaff: null,
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
    useAssignBookingStaffMutation: vi.fn(),
    useUpdateBookingFulfillmentStatusMutation: vi.fn(),
    useReviewBookingPriceApprovalMutation: vi.fn(),
  };
});

describe("AdminBookingsView component", () => {
  const mockRefetch = vi.fn();
  const mockAssignStaff = vi.fn();
  const mockUpdateFulfillment = vi.fn();
  const mockReviewApproval = vi.fn();

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

    vi.mocked(adminApiModule.useGetAdminStaffQuery).mockReturnValue({
      data: { success: true, message: "OK", data: { items: MOCK_STAFF, page: 1, limit: 10, total: 1 } },
      isLoading: false,
    } as any);

    vi.mocked(adminApiModule.useGetAdminOperationsBookingsQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: [MOCK_BOOKING_1, MOCK_BOOKING_2],
          page: 1,
          limit: 10,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  it("renders header, operational queue badge, and summary metrics", () => {
    render(<AdminBookingsView />);

    expect(screen.getByText("Bookings Management")).toBeInTheDocument();
    expect(screen.getByText("Operational Queue")).toBeInTheDocument();
    expect(screen.getByText(/Operational Scope:/i)).toBeInTheDocument();

    // Summary cards
    expect(screen.getByTestId("summary-total-bookings")).toBeInTheDocument();
    expect(screen.getByTestId("summary-not-started")).toBeInTheDocument();
    expect(screen.getByTestId("summary-in-progress")).toBeInTheDocument();
    expect(screen.getByTestId("summary-fulfilled")).toBeInTheDocument();
  });

  it("renders operational bookings in table", () => {
    render(<AdminBookingsView />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands Day Trip")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Cruise")).toBeInTheDocument();
  });

  it("forwards query arguments to useGetAdminOperationsBookingsQuery", () => {
    render(<AdminBookingsView />);

    expect(adminApiModule.useGetAdminOperationsBookingsQuery).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      fulfillmentStatus: undefined,
      assignedStaffId: undefined,
    });
  });

  it("filters current view items via search input", () => {
    render(<AdminBookingsView />);

    const searchInput = screen.getByTestId("bookings-search-input");
    fireEvent.change(searchInput, { target: { value: "Similan" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("renders error state with retry button when query fails", () => {
    vi.mocked(adminApiModule.useGetAdminOperationsBookingsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { data: { message: "Database connection failed" } },
      refetch: mockRefetch,
    } as any);

    render(<AdminBookingsView />);

    expect(screen.getByTestId("admin-bookings-error")).toBeInTheDocument();
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();

    const retryBtn = screen.getByText("Try Again");
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("opens booking details modal on click", () => {
    render(<AdminBookingsView />);

    const bookingIdBtn = screen.getByText("#bkg-101-…");
    fireEvent.click(bookingIdBtn);

    expect(screen.getByTestId("booking-details-dialog")).toBeInTheDocument();
    expect(screen.getByText("Customer notes")).toBeInTheDocument();
    expect(screen.getByText("Internal note")).toBeInTheDocument();
  });

  it("opens assign staff dialog and submits assignment", async () => {
    render(<AdminBookingsView />);

    // Open action menu for booking 1
    const menuTrigger = screen.getByTestId("booking-actions-trigger-bkg-101-uuid");
    fireEvent.click(menuTrigger);

    // Click Assign Staff
    const assignBtn = screen.getByText("Assign Staff");
    fireEvent.click(assignBtn);

    expect(screen.getByText("Assign Responsible Staff")).toBeInTheDocument();

    // Type optional notes
    const notesInput = screen.getByTestId("assign-staff-notes");
    fireEvent.change(notesInput, { target: { value: "Handover to Somchai at pier" } });

    // Submit assignment
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

  it("shows payment constraint warning in fulfillment dialog for UNPAID booking", () => {
    render(<AdminBookingsView />);

    // Open action menu for unpaid booking 2
    const menuTrigger = screen.getByTestId("booking-actions-trigger-bkg-102-uuid");
    fireEvent.click(menuTrigger);

    // Click Update Fulfillment
    const fulfillmentBtn = screen.getByText("Update Fulfillment");
    fireEvent.click(fulfillmentBtn);

    expect(screen.getByText("Update Fulfillment Status")).toBeInTheDocument();
    expect(screen.getByText(/Backend Constraint: Unpaid Booking/i)).toBeInTheDocument();

    // Submit button should be disabled for unpaid booking attempting fulfillment
    const submitBtn = screen.getByTestId("confirm-fulfillment-status-btn");
    expect(submitBtn).toBeDisabled();
  });
});
