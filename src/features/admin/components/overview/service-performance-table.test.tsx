import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceLevelPerformance } from "./service-performance-table";
import type { AdminServicesReportData } from "../../types/admin";

describe("ServiceLevelPerformance component", () => {
  const baseFilters = {
    from: null,
    to: null,
    serviceType: null,
    agentId: null,
    status: null,
  };

  const realisticServicesFixture: AdminServicesReportData = {
    filters: baseFilters,
    items: [
      {
        serviceId: "svc-1",
        name: "Phi Phi Island Day Trip",
        type: "TOUR",
        totalBookings: 15,
        completedBookings: 12,
        bookedValue: 45000,
        revenue: 36000,
      },
      {
        serviceId: "svc-2",
        name: "James Bond Island Speedboat",
        type: "TOUR",
        totalBookings: 10,
        completedBookings: 8,
        bookedValue: 30000,
        revenue: 24000,
      },
    ],
    page: 1,
    limit: 10,
    total: 2,
  };

  it("renders service rows with booking counts and completion rate", () => {
    render(<ServiceLevelPerformance servicesData={realisticServicesFixture} />);

    expect(screen.getByTestId("service-bar-svc-1")).toBeInTheDocument();
    const row = screen.getByTestId("service-bar-svc-1");
    expect(row).toHaveTextContent("Phi Phi Island Day Trip");
    // Total booking count for the service
    expect(row).toHaveTextContent("15");
    // Completion rate: 12 / 15 = 80.0%
    expect(row).toHaveTextContent("80.0%");
  });

  it("shows a View All link to the tours dashboard", () => {
    render(<ServiceLevelPerformance servicesData={realisticServicesFixture} />);

    const link = screen.getByRole("link", { name: /view all/i });
    expect(link).toHaveAttribute("href", "/dashboard/admin/tours");
  });

  it("shows the View All link with the default target and caps at five rows", () => {
    const many: AdminServicesReportData = {
      filters: baseFilters,
      items: Array.from({ length: 8 }, (_, i) => ({
        serviceId: `svc-${i + 1}`,
        name: `Excursion ${i + 1}`,
        type: "TOUR",
        // svc-1 has the most bookings; the rest decrease, so the top five
        // by volume are svc-1 through svc-5 and svc-6..svc-8 are hidden.
        totalBookings: (9 - i) * 10,
        completedBookings: (9 - i) * 7,
        bookedValue: (9 - i) * 1000,
        revenue: (9 - i) * 800,
      })),
      page: 1,
      limit: 20,
      total: 8,
    };

    render(<ServiceLevelPerformance servicesData={many} />);

    // Only the top five render (maxItems default is 5).
    expect(screen.getByTestId("service-bar-svc-1")).toBeInTheDocument();
    expect(screen.getByTestId("service-bar-svc-5")).toBeInTheDocument();
    expect(screen.queryByTestId("service-bar-svc-6")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing top 5 of 8 services/i)).toBeInTheDocument();
  });

  it("displays an empty state when no services are returned", () => {
    render(
      <ServiceLevelPerformance
        servicesData={{ filters: baseFilters, items: [], page: 1, limit: 10, total: 0 }}
      />
    );

    expect(screen.getByText("No service records found")).toBeInTheDocument();
    // No View All link when there is no data.
    expect(screen.queryByRole("link", { name: /view all/i })).not.toBeInTheDocument();
  });

  it("renders the error state with a working retry button", () => {
    const handleRetry = vi.fn();
    render(
      <ServiceLevelPerformance error={new Error("Network failed")} onRetry={handleRetry} />
    );

    expect(screen.getByTestId("service-performance-error")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
