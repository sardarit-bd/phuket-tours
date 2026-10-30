import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminOverviewPage from "./page";
import * as adminApiModule from "@/features/admin/api/admin-api";

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminRevenueReportQuery: vi.fn(),
    useGetAdminBookingsReportQuery: vi.fn(),
    useGetAdminPaymentsReportQuery: vi.fn(),
    useGetAdminServicesReportQuery: vi.fn(),
  };
});

describe("AdminOverviewPage component", () => {
  const mockRevenue = {
    success: true,
    message: "Revenue report retrieved",
    data: {
      filters: { from: null, to: null, serviceType: null, agentId: null },
      revenue: 95400.0,
      bookedValue: 125000.5,
      collectedPayments: 92000.0,
      outstandingBalance: 33000.5,
    },
  };

  const mockBookings = {
    success: true,
    message: "Bookings report retrieved",
    data: {
      filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
      totalBookings: 40,
      byStatus: [
        { status: "COMPLETED", count: 20, totalValue: 60000 },
        { status: "CONFIRMED", count: 12, totalValue: 36000 },
        { status: "PENDING", count: 8, totalValue: 24000 },
      ],
    },
  };

  const mockPayments = {
    success: true,
    message: "Payments report retrieved",
    data: {
      filters: { from: null, to: null, serviceType: null, agentId: null },
      byStatus: [{ status: "VERIFIED", count: 25, totalAmount: 92000 }],
      verifiedByMethod: [{ method: "BANK_TRANSFER", count: 25, totalAmount: 92000 }],
      reconciliation: {
        paidBookingsValue: 92000,
        verifiedPaymentsValue: 92000,
        difference: 0,
        pendingVerificationCount: 0,
        pendingVerificationValue: 0,
      },
    },
  };

  const mockServices = {
    success: true,
    message: "Services report retrieved",
    data: {
      filters: { from: null, to: null, serviceType: null, agentId: null, status: null },
      items: [
        {
          serviceId: "svc-1",
          name: "James Bond Island Adventure",
          type: "TOUR",
          totalBookings: 20,
          completedBookings: 18,
          bookedValue: 60000,
          revenue: 54000,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    },
  };

  const mockRefetchRevenue = vi.fn();
  const mockRefetchBookings = vi.fn();
  const mockRefetchPayments = vi.fn();
  const mockRefetchServices = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminApiModule.useGetAdminRevenueReportQuery).mockReturnValue({
      data: mockRevenue,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetchRevenue,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminRevenueReportQuery>);

    vi.mocked(adminApiModule.useGetAdminBookingsReportQuery).mockReturnValue({
      data: mockBookings,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetchBookings,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminBookingsReportQuery>);

    vi.mocked(adminApiModule.useGetAdminPaymentsReportQuery).mockReturnValue({
      data: mockPayments,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetchPayments,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminPaymentsReportQuery>);

    vi.mocked(adminApiModule.useGetAdminServicesReportQuery).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetchServices,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesReportQuery>);
  });

  it("renders page header, metrics, booking status breakdown, and service table", () => {
    render(<AdminOverviewPage />);

    expect(screen.getByRole("heading", { level: 1, name: /admin overview analytics/i })).toBeInTheDocument();
    expect(screen.getByTestId("metric-revenue-value")).toHaveTextContent("95,400.00");
    expect(screen.getByTestId("metric-booked-value-value")).toHaveTextContent("125,000.50");
    expect(screen.getByTestId("total-bookings-badge")).toHaveTextContent("Total Bookings: 40");
    expect(screen.getByText("James Bond Island Adventure")).toBeInTheDocument();
  });

  it("renders OverviewSkeleton when queries are initially loading", () => {
    vi.mocked(adminApiModule.useGetAdminRevenueReportQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: mockRefetchRevenue,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminRevenueReportQuery>);

    render(<AdminOverviewPage />);

    expect(screen.getByTestId("overview-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: /admin overview analytics/i })).not.toBeInTheDocument();
  });

  it("shows global error banner when any endpoint fails", () => {
    vi.mocked(adminApiModule.useGetAdminRevenueReportQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error("Server error 500"),
      refetch: mockRefetchRevenue,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminRevenueReportQuery>);

    render(<AdminOverviewPage />);

    expect(screen.getByTestId("admin-overview-global-error")).toBeInTheDocument();
    expect(screen.getByText(/One or more report queries encountered an issue/i)).toBeInTheDocument();
  });

  it("triggers refetch for all endpoints when 'Refresh Analytics' button is clicked", () => {
    render(<AdminOverviewPage />);

    const refreshBtn = screen.getByRole("button", { name: /refresh all dashboard analytics/i });
    fireEvent.click(refreshBtn);

    expect(mockRefetchRevenue).toHaveBeenCalledTimes(1);
    expect(mockRefetchBookings).toHaveBeenCalledTimes(1);
    expect(mockRefetchPayments).toHaveBeenCalledTimes(1);
    expect(mockRefetchServices).toHaveBeenCalledTimes(1);
  });
});
