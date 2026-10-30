import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingStatusChart } from "./booking-status-chart";
import type { AdminBookingsReportData } from "../../types/admin";

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
