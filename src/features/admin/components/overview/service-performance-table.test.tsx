import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServicePerformanceTable } from "./service-performance-table";
import type { AdminServicesReportData } from "../../types/admin";

describe("ServicePerformanceTable component", () => {
  const realisticServicesFixture: AdminServicesReportData = {
    filters: {
      from: null,
      to: null,
      serviceType: null,
      agentId: null,
      status: null,
    },
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

  it("renders service table rows with accurate metric data", () => {
    render(<ServicePerformanceTable servicesData={realisticServicesFixture} />);

    expect(screen.getByText("Phi Phi Island Day Trip")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Speedboat")).toBeInTheDocument();
    expect(screen.getByTestId("service-row-svc-1")).toHaveTextContent("15");
    expect(screen.getByTestId("service-row-svc-1")).toHaveTextContent("36,000.00");
  });

  it("displays contract boundary notice explaining omission of recent-orders table", () => {
    render(<ServicePerformanceTable servicesData={realisticServicesFixture} />);

    expect(screen.getByText(/Backend Contract Boundary:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Individual booking order item records are not part of the reporting contract/i)
    ).toBeInTheDocument();
  });

  it("displays empty state when no services are returned", () => {
    render(
      <ServicePerformanceTable
        servicesData={{
          filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
          items: [],
          page: 1,
          limit: 10,
          total: 0,
        }}
      />
    );

    expect(screen.getByText("No service records found")).toBeInTheDocument();
  });

  it("renders error state with retry button", () => {
    const handleRetry = vi.fn();

    render(
      <ServicePerformanceTable
        error={new Error("Network failed")}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId("service-performance-error")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
