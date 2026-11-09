import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingsTable } from "./bookings-table";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

const MOCK_BOOKING_1: OperationalBookingRecord = {
  id: "bkg-101-uuid",
  status: "CONFIRMED",
  fulfillmentStatus: "NOT_STARTED",
  paymentStatus: "PAID",
  assignedStaffId: "staff-1",
  notes: "Customer requested front row seats",
  internalNotes: "VIP repeat customer",
  createdAt: "2026-10-15T08:00:00.000Z",
  updatedAt: "2026-10-16T10:00:00.000Z",
  service: {
    id: "srv-201",
    name: "Phi Phi Islands Luxury Speedboat Tour",
    type: "TOUR",
  },
  availability: {
    id: "avail-301",
    date: "2026-11-20T00:00:00.000Z",
  },
  customer: {
    id: "cust-401",
    name: "Sarah Jenkins",
    phone: "+66 81 234 5678",
  },
  assignedStaff: {
    id: "staff-1",
    name: "Somchai Prasert",
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
  createdAt: "2026-10-18T09:00:00.000Z",
  updatedAt: "2026-10-18T09:00:00.000Z",
  service: {
    id: "srv-202",
    name: "James Bond Island Day Cruise",
    type: "TOUR",
  },
  availability: null,
  customer: {
    id: "cust-402",
    name: "David Miller",
    phone: null,
  },
  assignedStaff: null,
};

describe("BookingsTable component", () => {
  const mockViewDetails = vi.fn();
  const mockAssignStaff = vi.fn();
  const mockUpdateFulfillment = vi.fn();

  it("renders table with operational booking records", () => {
    render(
      <BookingsTable
        bookings={[MOCK_BOOKING_1, MOCK_BOOKING_2]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    expect(screen.getByTestId("admin-bookings-table")).toBeInTheDocument();

    // Verify row 1 customer & service
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("+66 81 234 5678")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands Luxury Speedboat Tour")).toBeInTheDocument();
    expect(screen.getByText("Somchai Prasert")).toBeInTheDocument();

    // Verify row 2 unassigned & no phone
    expect(screen.getByText("David Miller")).toBeInTheDocument();
    expect(screen.getByText("No phone")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("Open Date")).toBeInTheDocument();
  });

  it("renders status badges correctly", () => {
    render(
      <BookingsTable
        bookings={[MOCK_BOOKING_1]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    expect(screen.getByTestId("booking-status-confirmed")).toBeInTheDocument();
    expect(screen.getByTestId("payment-status-paid")).toBeInTheDocument();
  });

  it("calls onViewDetails when clicking booking ID button", () => {
    render(
      <BookingsTable
        bookings={[MOCK_BOOKING_1]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    const idBtn = screen.getByText("#bkg-101-…");
    fireEvent.click(idBtn);

    expect(mockViewDetails).toHaveBeenCalledWith(MOCK_BOOKING_1);
  });

  it("renders empty state when bookings list is empty", () => {
    render(
      <BookingsTable
        bookings={[]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    expect(screen.getByTestId("admin-bookings-empty")).toBeInTheDocument();
    expect(screen.getByText("No bookings found")).toBeInTheDocument();
  });

  it("renders skeleton loader when isLoading is true", () => {
    render(
      <BookingsTable
        bookings={[]}
        isLoading={true}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    expect(screen.getByTestId("admin-bookings-table-loading")).toBeInTheDocument();
  });

  it("renders staff assignment column with real staff name, avatar initials, and reassign action", () => {
    render(
      <BookingsTable
        bookings={[MOCK_BOOKING_1]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    // Displays staff name and initials
    expect(screen.getByTestId("assigned-staff-name-bkg-101-uuid")).toHaveTextContent("Somchai Prasert");
    expect(screen.getByText("SP")).toBeInTheDocument();

    // Assign button is hidden when assigned; Reassign button is visible
    expect(screen.queryByTestId("quick-assign-staff-bkg-101-uuid")).not.toBeInTheDocument();
    const reassignBtn = screen.getByTestId("reassign-staff-bkg-101-uuid");
    expect(reassignBtn).toBeInTheDocument();

    fireEvent.click(reassignBtn);
    expect(mockAssignStaff).toHaveBeenCalledWith(MOCK_BOOKING_1);
  });

  it("resolves staff name from staffMembers list if assignedStaff relation is absent", () => {
    const bookingWithOnlyId: OperationalBookingRecord = {
      ...MOCK_BOOKING_2,
      assignedStaffId: "staff-99",
      assignedStaff: null,
    };

    render(
      <BookingsTable
        bookings={[bookingWithOnlyId]}
        staffMembers={[
          {
            id: "staff-99",
            name: "Anong Saelao",
            email: "anong@phukettours.com",
            phone: "+66 82 345 6789",
            role: "staff",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    expect(screen.getByTestId("assigned-staff-name-bkg-102-uuid")).toHaveTextContent("Anong Saelao");
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.queryByText("Unassigned")).not.toBeInTheDocument();
  });
});
