import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingActionsMenu } from "./booking-actions-menu";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

const MOCK_BOOKING: OperationalBookingRecord = {
  id: "bkg-101",
  status: "CONFIRMED",
  fulfillmentStatus: "NOT_STARTED",
  paymentStatus: "PAID",
  assignedStaffId: "staff-1",
  notes: null,
  internalNotes: null,
  createdAt: "2026-10-15T08:00:00.000Z",
  updatedAt: "2026-10-16T10:00:00.000Z",
  service: {
    id: "srv-1",
    name: "Speedboat Tour",
    type: "TOUR",
  },
  availability: null,
  customer: {
    id: "cust-1",
    name: "Alice",
    phone: null,
  },
  assignedStaff: {
    id: "staff-1",
    name: "Somchai",
  },
};

describe("BookingActionsMenu component", () => {
  const mockViewDetails = vi.fn();
  const mockAssignStaff = vi.fn();
  const mockUpdateFulfillment = vi.fn();

  it("opens menu when trigger button is clicked", () => {
    render(
      <BookingActionsMenu
        booking={MOCK_BOOKING}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    const trigger = screen.getByTestId("booking-actions-trigger-bkg-101");
    fireEvent.click(trigger);

    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(screen.getByText("Assign Staff")).toBeInTheDocument();
    expect(screen.getByText("Update Fulfillment")).toBeInTheDocument();
  });

  it("calls onViewDetails when clicking View Details", () => {
    render(
      <BookingActionsMenu
        booking={MOCK_BOOKING}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-101"));
    fireEvent.click(screen.getByText("View Details"));

    expect(mockViewDetails).toHaveBeenCalledWith(MOCK_BOOKING);
  });

  it("calls onAssignStaff when clicking Assign Staff", () => {
    render(
      <BookingActionsMenu
        booking={MOCK_BOOKING}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-101"));
    fireEvent.click(screen.getByText("Assign Staff"));

    expect(mockAssignStaff).toHaveBeenCalledWith(MOCK_BOOKING);
  });

  it("calls onUpdateFulfillment when clicking Update Fulfillment", () => {
    render(
      <BookingActionsMenu
        booking={MOCK_BOOKING}
        onViewDetails={mockViewDetails}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-101"));
    fireEvent.click(screen.getByText("Update Fulfillment"));

    expect(mockUpdateFulfillment).toHaveBeenCalledWith(MOCK_BOOKING);
  });
});
