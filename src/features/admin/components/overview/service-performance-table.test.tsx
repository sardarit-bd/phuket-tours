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

    expect(screen.getAllByText("Phi Phi Island Day Trip").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("James Bond Island Speedboat").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("service-row-svc-1")).toHaveTextContent("15");
    expect(screen.getByTestId("service-row-svc-1")).toHaveTextContent("36,000.00");
  });

  it("renders horizontal bar chart showing volume comparison of completed vs total bookings", () => {
    render(<ServicePerformanceTable servicesData={realisticServicesFixture} />);

    // Horizontal volume chart container
    expect(screen.getByTestId("service-volume-chart")).toBeInTheDocument();

    // Svc-1 bar item
    const barSvc1 = screen.getByTestId("service-bar-svc-1");
    expect(barSvc1).toBeInTheDocument();
    // Total bookings count
    expect(barSvc1).toHaveTextContent("15");
    // Completed bookings count
    expect(barSvc1).toHaveTextContent("12");
    // Completion rate percentage: 12 / 15 = 80.0%
    expect(barSvc1).toHaveTextContent("80.0%");
  });

  it("handles long service names gracefully with truncation and title tooltip", () => {
    const longNameFixture: AdminServicesReportData = {
      filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
      items: [
        {
          serviceId: "svc-long",
          name: "Super Ultra Luxury Sunset Catamaran Cruise Around Similan Archipelago with Gourmet Dining and Snorkeling Equipment Included",
          type: "TOUR",
          totalBookings: 25,
          completedBookings: 20,
          bookedValue: 120000,
          revenue: 100000,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    };

    render(<ServicePerformanceTable servicesData={longNameFixture} />);

    // Full name exists in title attribute for accessibility and hover tooltip
    const elementsWithTitle = screen.getAllByTitle(longNameFixture.items[0].name!);
    expect(elementsWithTitle.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("service-bar-svc-long")).toBeInTheDocument();
  });

  it("handles large datasets gracefully and supports sorting", () => {
    const largeDataset: AdminServicesReportData = {
      filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
      items: Array.from({ length: 15 }, (_, i) => ({
        serviceId: `svc-${i + 1}`,
        name: `Excursion Package ${i + 1}`,
        type: "TOUR",
        totalBookings: (i + 1) * 3,
        completedBookings: (i + 1) * 2,
        bookedValue: (i + 1) * 3000,
        revenue: (i + 1) * 2000,
      })),
      page: 1,
      limit: 20,
      total: 15,
    };

    render(<ServicePerformanceTable servicesData={largeDataset} />);

    // All items rendered in chart
    expect(screen.getByTestId("service-bar-svc-15")).toBeInTheDocument();
    expect(screen.getByTestId("service-bar-svc-1")).toBeInTheDocument();

    // Click sort by Revenue
    const revenueSortBtn = screen.getByRole("button", { name: "Revenue" });
    fireEvent.click(revenueSortBtn);
    expect(revenueSortBtn).toHaveClass("bg-[#E8F6F8]");
  });

  it("allows switching between chart view, table view, and all", () => {
    render(<ServicePerformanceTable servicesData={realisticServicesFixture} />);

    // Initially both views are visible
    expect(screen.getByTestId("service-volume-chart")).toBeInTheDocument();
    expect(screen.getByTestId("service-row-svc-1")).toBeInTheDocument();

    // Switch to Chart Only
    const chartOnlyBtn = screen.getByRole("button", { name: /chart/i });
    fireEvent.click(chartOnlyBtn);
    expect(screen.getByTestId("service-volume-chart")).toBeInTheDocument();
    expect(screen.queryByTestId("service-row-svc-1")).not.toBeInTheDocument();

    // Switch to Table Only
    const tableOnlyBtn = screen.getByRole("button", { name: /table/i });
    fireEvent.click(tableOnlyBtn);
    expect(screen.queryByTestId("service-volume-chart")).not.toBeInTheDocument();
    expect(screen.getByTestId("service-row-svc-1")).toBeInTheDocument();
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
