import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingActionsMenu } from "./booking-actions-menu";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

const BASE_MOCK_BOOKING: OperationalBookingRecord = {
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
  const mockViewHistory = vi.fn();
  const mockAssignStaff = vi.fn();
  const mockUpdateFulfillment = vi.fn();
  const mockReviewBooking = vi.fn();
  const mockConfirmBooking = vi.fn();
  const mockCancelBooking = vi.fn();
  const mockViewRejectionReason = vi.fn();

  it("renders lifecycle actions for CONFIRMED bookings: View Details, Manage Staff Assignment, Update Fulfillment, Cancel, History", () => {
    render(
      <BookingActionsMenu
        booking={BASE_MOCK_BOOKING}
        onViewDetails={mockViewDetails}
        onViewHistory={mockViewHistory}
        onAssignStaff={mockAssignStaff}
        onUpdateFulfillment={mockUpdateFulfillment}
        onCancelBooking={mockCancelBooking}
      />
    );

    const trigger = screen.getByTestId("booking-actions-trigger-bkg-101");
    fireEvent.click(trigger);

    expect(screen.getByText("View Booking Details")).toBeInTheDocument();
    expect(screen.getByText("Manage Staff Assignment")).toBeInTheDocument();
    expect(screen.getByText("Update Fulfillment")).toBeInTheDocument();
    expect(screen.getByText("Cancel Booking")).toBeInTheDocument();
    expect(screen.getByText("View Activity & History")).toBeInTheDocument();
  });

  it("renders lifecycle actions for AWAITING_APPROVAL: Review Booking (primary), View Details, History (no Confirm or Cancel)", () => {
    const awaitingApprovalBooking: OperationalBookingRecord = {
      ...BASE_MOCK_BOOKING,
      id: "bkg-approval-1",
      status: "AWAITING_APPROVAL",
      requiresApproval: true,
      discountRequests: [
        {
          id: "dr-1",
          discountType: "PERCENTAGE",
          discountValue: 15,
          originalPrice: 1000,
          discountAmount: 150,
          proposedFinalPrice: 850,
          status: "PENDING",
          reason: "VIP corporate partner discount",
          rejectionReason: null,
          adminNotes: null,
          requestedById: "staff-1",
          reviewedById: null,
          reviewedAt: null,
          createdAt: "2026-11-10T10:00:00.000Z",
        },
      ],
    };

    render(
      <BookingActionsMenu
        booking={awaitingApprovalBooking}
        onViewDetails={mockViewDetails}
        onViewHistory={mockViewHistory}
        onReviewBooking={mockReviewBooking}
        onConfirmBooking={mockConfirmBooking}
        onCancelBooking={mockCancelBooking}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-approval-1"));

    expect(screen.getByText("Review Booking")).toBeInTheDocument();
    expect(screen.getByText("View Booking Details")).toBeInTheDocument();
    expect(screen.getByText("View Activity & History")).toBeInTheDocument();

    // Confirm Booking and Cancel Booking should NOT be shown alongside approval
    expect(screen.queryByText("Confirm Booking")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel Booking")).not.toBeInTheDocument();

    // Clicking Review Booking triggers onReviewBooking
    fireEvent.click(screen.getByTestId("action-review-booking-bkg-approval-1"));
    expect(mockReviewBooking).toHaveBeenCalledWith(awaitingApprovalBooking);
  });

  it("renders lifecycle actions for IN_PROGRESS bookings: View Details, Update Fulfillment, History", () => {
    const inProgressBooking: OperationalBookingRecord = {
      ...BASE_MOCK_BOOKING,
      id: "bkg-progress-1",
      status: "IN_PROGRESS",
      fulfillmentStatus: "IN_PROGRESS",
    };

    render(
      <BookingActionsMenu
        booking={inProgressBooking}
        onViewDetails={mockViewDetails}
        onViewHistory={mockViewHistory}
        onUpdateFulfillment={mockUpdateFulfillment}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-progress-1"));

    expect(screen.getByText("View Booking Details")).toBeInTheDocument();
    expect(screen.getByText("Update Fulfillment")).toBeInTheDocument();
    expect(screen.getByText("View Activity & History")).toBeInTheDocument();
    expect(screen.queryByText("Manage Staff Assignment")).not.toBeInTheDocument();
  });

  it("renders lifecycle actions for COMPLETED bookings: View Details, History only", () => {
    const completedBooking: OperationalBookingRecord = {
      ...BASE_MOCK_BOOKING,
      id: "bkg-completed-1",
      status: "COMPLETED",
      fulfillmentStatus: "FULFILLED",
    };

    render(
      <BookingActionsMenu
        booking={completedBooking}
        onViewDetails={mockViewDetails}
        onViewHistory={mockViewHistory}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-completed-1"));

    expect(screen.getByText("View Booking Details")).toBeInTheDocument();
    expect(screen.getByText("View Activity & History")).toBeInTheDocument();
    expect(screen.queryByText("Cancel Booking")).not.toBeInTheDocument();
    expect(screen.queryByText("Update Fulfillment")).not.toBeInTheDocument();
  });

  it("renders View Rejection Reason for REJECTED bookings", () => {
    const rejectedBooking: OperationalBookingRecord = {
      ...BASE_MOCK_BOOKING,
      id: "bkg-rejected-1",
      status: "CANCELLED",
      internalNotes: "Booking rejected: Discount excessive",
      discountRequests: [
        {
          id: "dr-2",
          discountType: "PERCENTAGE",
          discountValue: 30,
          originalPrice: 1000,
          discountAmount: 300,
          proposedFinalPrice: 700,
          status: "REJECTED",
          reason: "Friends and family rate",
          rejectionReason: "Exceeds 20% limit authorized for direct staff sales",
          adminNotes: null,
          requestedById: "staff-1",
          reviewedById: "admin-1",
          reviewedAt: "2026-11-12T10:00:00.000Z",
          createdAt: "2026-11-12T09:00:00.000Z",
        },
      ],
    };

    render(
      <BookingActionsMenu
        booking={rejectedBooking}
        onViewDetails={mockViewDetails}
        onViewHistory={mockViewHistory}
        onViewRejectionReason={mockViewRejectionReason}
      />
    );

    fireEvent.click(screen.getByTestId("booking-actions-trigger-bkg-rejected-1"));

    expect(screen.getByText("View Booking Details")).toBeInTheDocument();
    expect(screen.getByText("View Rejection Reason")).toBeInTheDocument();
    expect(screen.getByText("View Activity & History")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("action-view-rejection-bkg-rejected-1"));
    expect(mockViewRejectionReason).toHaveBeenCalledWith(rejectedBooking);
  });
});
