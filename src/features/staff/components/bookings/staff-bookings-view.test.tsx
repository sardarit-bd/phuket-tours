import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffBookingsView } from "./staff-bookings-view";
import * as adminApi from "@/features/admin/api/admin-api";
import type { StaffBookingRecord } from "@/features/admin/types/admin-bookings";

const MOCK_ASSIGNED_BOOKINGS: StaffBookingRecord[] = [
  {
    id: "bkg-staff-1",
    status: "CONFIRMED",
    fulfillmentStatus: "NOT_STARTED",
    paymentStatus: "PAID",
    assignedStaffId: "staff-me",
    notes: "Travel Date: 2026-12-01 | Guests: 2 Adults, 1 Child | Contact: Alice Wonderland (+66 89 123 4567) | Hotel: Katathani Resort",
    internalNotes: "VIP repeat customer from Australia",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    service: {
      id: "srv-phi-phi",
      name: "Phi Phi Islands Luxury Speedboat",
      type: "TOUR",
    },
    availability: {
      id: "avail-1",
      date: "2026-12-01T08:00:00.000Z",
    },
    customer: {
      id: "cust-1",
      name: "Alice Wonderland",
      phone: "+66 89 123 4567",
    },
    assignedStaff: {
      id: "staff-me",
      name: "Somchai Staff",
    },
  },
  {
    id: "bkg-staff-2",
    status: "IN_PROGRESS",
    fulfillmentStatus: "IN_PROGRESS",
    paymentStatus: "PAID",
    assignedStaffId: "staff-me",
    notes: "Travel Date: 2026-11-15 | Guests: 1 Adult | Contact: Bob Builder (+66 81 999 8888)",
    internalNotes: null,
    createdAt: "2026-11-02T11:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z",
    service: {
      id: "srv-james-bond",
      name: "James Bond Island Explorer",
      type: "TOUR",
    },
    availability: {
      id: "avail-2",
      date: "2026-11-15T09:00:00.000Z",
    },
    customer: {
      id: "cust-2",
      name: "Bob Builder",
      phone: "+66 81 999 8888",
    },
    assignedStaff: {
      id: "staff-me",
      name: "Somchai Staff",
    },
  },
];

describe("StaffBookingsView component", () => {
  const mockRefetch = vi.fn();
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminApi, "useGetStaffOperationsBookingsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved staff bookings",
        data: {
          items: MOCK_ASSIGNED_BOOKINGS,
          total: 2,
          page: 1,
          limit: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(adminApi, "useUpdateStaffBookingFulfillmentStatusMutation").mockReturnValue([
      mockUpdateStatus,
      { isLoading: false } as any,
    ]);
  });

  it("renders staff dashboard summary metrics and assigned queue", () => {
    render(<StaffBookingsView />);

    expect(screen.getByTestId("staff-bookings-dashboard")).toBeInTheDocument();
    expect(screen.getByText("Staff Operations Workspace")).toBeInTheDocument();

    // Summary counts
    expect(screen.getByText("Total Assigned")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);

    // Check table rows
    expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands Luxury Speedboat")).toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Explorer")).toBeInTheDocument();
  });

  it("opens booking details dialog with operational manifests", () => {
    render(<StaffBookingsView />);

    const detailsBtn = screen.getByTestId("staff-view-details-bkg-staff-1");
    fireEvent.click(detailsBtn);

    expect(screen.getByTestId("staff-booking-details-modal")).toBeInTheDocument();
    expect(screen.getByText("Tour & Schedule")).toBeInTheDocument();
    expect(screen.getByText("Katathani Resort")).toBeInTheDocument();
    expect(screen.getByText("VIP repeat customer from Australia")).toBeInTheDocument();
  });

  it("filters assigned tours using the search box", () => {
    render(<StaffBookingsView />);

    const searchInput = screen.getByTestId("staff-bookings-search");
    fireEvent.change(searchInput, { target: { value: "James Bond" } });

    expect(screen.queryByText("Alice Wonderland")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
  });
});
