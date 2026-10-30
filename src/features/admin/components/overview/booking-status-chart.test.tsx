import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingStatusChart } from "./booking-status-chart";
import type { AdminBookingsReportData } from "../../types/admin";
import { ADMIN_BOOKING_STATUSES } from "../../types/admin";

describe("BookingStatusChart component", () => {
  const realisticBookingsFixture: AdminBookingsReportData = {
    filters: {
      from: null,
      to: null,
      serviceType: null,
      agentId: null,
      status: null,
    },
    totalBookings: 50,
    byStatus: [
      { status: "COMPLETED", count: 25, totalValue: 75000 },
      { status: "CONFIRMED", count: 15, totalValue: 45000 },
      { status: "PENDING", count: 5, totalValue: 15000 },
      { status: "CANCELLED", count: 5, totalValue: 15000 },
    ],
  };

  it("renders total bookings badge and individual status breakdown cards", () => {
    render(<BookingStatusChart bookingsData={realisticBookingsFixture} />);

    expect(screen.getByTestId("total-bookings-badge")).toHaveTextContent("Total Bookings: 50");
    expect(screen.getByTestId("status-card-COMPLETED")).toBeInTheDocument();
    expect(screen.getByTestId("status-card-CONFIRMED")).toBeInTheDocument();
    expect(screen.getByTestId("status-card-PENDING")).toBeInTheDocument();
    expect(screen.getByTestId("status-card-CANCELLED")).toBeInTheDocument();

    // Check percentage: 25 out of 50 = 50.0%
    expect(screen.getByTestId("status-card-COMPLETED")).toHaveTextContent("50.0%");
  });

  it("shows all seven actual backend booking statuses including zero-count categories", () => {
    render(<BookingStatusChart bookingsData={realisticBookingsFixture} />);

    // All 7 statuses must have cards
    ADMIN_BOOKING_STATUSES.forEach((status) => {
      const card = screen.getByTestId(`status-card-${status}`);
      expect(card).toBeInTheDocument();
    });

    // Zero-count status check (e.g. FAILED and AWAITING_APPROVAL)
    const failedCard = screen.getByTestId("status-card-FAILED");
    expect(failedCard).toHaveTextContent("0");
    expect(failedCard).toHaveTextContent("0.0%");

    const awaitingCard = screen.getByTestId("status-card-AWAITING_APPROVAL");
    expect(awaitingCard).toHaveTextContent("0");
    expect(awaitingCard).toHaveTextContent("0.0%");
  });

  it("renders SVG donut chart with accessible role and label", () => {
    render(<BookingStatusChart bookingsData={realisticBookingsFixture} />);

    const donut = screen.getByRole("img", {
      name: /Donut chart showing booking distribution for 50 total bookings/i,
    });
    expect(donut).toBeInTheDocument();

    // Active slices have graphics-symbol role
    const symbols = screen.getAllByRole("graphics-symbol");
    expect(symbols.length).toBe(4); // 4 statuses have count > 0 in fixture
  });

  it("updates donut center display on hover/focus", () => {
    render(<BookingStatusChart bookingsData={realisticBookingsFixture} />);

    // Initially shows Total 50
    expect(screen.getByTestId("donut-total-count")).toHaveTextContent("50");

    // Hover completed slice
    const completedSlice = screen.getByLabelText(/Completed: 25 bookings/i);
    fireEvent.mouseEnter(completedSlice);

    // Shows Completed specific percentage and label in center
    expect(screen.getByTestId("donut-hovered-label")).toHaveTextContent("Completed");
    expect(screen.getByTestId("donut-hovered-count")).toHaveTextContent("25");
    expect(screen.getByTestId("donut-hovered-percentage")).toHaveTextContent("50.0%");

    fireEvent.mouseLeave(completedSlice);
    expect(screen.getByTestId("donut-total-count")).toHaveTextContent("50");
  });

  it("displays empty state when total bookings is 0", () => {
    const emptyFixture: AdminBookingsReportData = {
      filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
      totalBookings: 0,
      byStatus: [],
    };

    render(<BookingStatusChart bookingsData={emptyFixture} />);

    expect(screen.getByText("No bookings recorded")).toBeInTheDocument();
  });

  it("handles loading skeleton state properly", () => {
    render(<BookingStatusChart isLoading={true} />);

    expect(screen.getByTestId("booking-status-chart-loading")).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    const handleRetry = vi.fn();

    render(
      <BookingStatusChart
        error={new Error("Failed to fetch bookings")}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId("booking-status-chart-error")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
