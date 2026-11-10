import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UserOverviewPage from "./page";
import { useGetMeQuery } from "@/features/auth/api/auth-api";
import { useGetCustomerBookingsQuery } from "@/features/customer/api/customer-api";

const mockReplace = vi.fn();
const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  useGetMeQuery: vi.fn(),
}));

vi.mock("@/features/customer/api/customer-api", () => ({
  useGetCustomerBookingsQuery: vi.fn(),
}));

const mockUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockUseGetCustomerBookingsQuery = vi.mocked(useGetCustomerBookingsQuery);

describe("UserOverviewPage Authentication and Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/dashboard");
    mockUseGetCustomerBookingsQuery.mockReturnValue({
      data: { success: true, message: "ok", data: { items: [], total: 0, page: 1, limit: 20 } },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetCustomerBookingsQuery>);
  });

  it("renders authenticated user overview successfully", () => {
    mockUseGetMeQuery.mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          id: "cust-1",
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetMeQuery>);

    render(<UserOverviewPage />);

    expect(screen.getByTestId("customer-overview-page")).toBeInTheDocument();
    expect(screen.getByText(/hello, john/i)).toBeInTheDocument();
    expect(screen.queryByTestId("customer-overview-error")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated user (401) to /sign-in with safe return path and suppresses generic error banner", async () => {
    mockPathname.mockReturnValue("/dashboard");
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 401, data: { message: "Unauthorized" } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetMeQuery>);

    render(<UserOverviewPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/sign-in?redirect=%2Fdashboard");
    });

    // Should skip bookings query when unauthenticated
    expect(mockUseGetCustomerBookingsQuery).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      { skip: true }
    );

    // Generic connection error banner should not be displayed on 401
    expect(screen.queryByTestId("customer-overview-error")).not.toBeInTheDocument();
  });

  it("preserves safe redirect path when accessing nested route on 401", async () => {
    mockPathname.mockReturnValue("/dashboard");
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: "401" },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetMeQuery>);

    render(<UserOverviewPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/sign-in?redirect=%2Fdashboard");
    });
  });

  it("does NOT redirect on 500 server error and displays connection retry alert", () => {
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: { message: "Internal server error" } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetMeQuery>);

    render(<UserOverviewPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("customer-overview-error")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load dashboard data. Please check your connection and retry.")
    ).toBeInTheDocument();
  });

  it("does NOT redirect on network failure (FETCH_ERROR) and displays retry alert", () => {
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: "FETCH_ERROR", error: "Failed to fetch" },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetMeQuery>);

    render(<UserOverviewPage />);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("customer-overview-error")).toBeInTheDocument();
  });
});

