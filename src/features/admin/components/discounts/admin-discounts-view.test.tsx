import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminDiscountsView } from "./admin-discounts-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import * as permissionsHookModule from "@/features/admin/hooks/use-permissions";
import type { StaffDiscountRequestRecord } from "@/features/admin/types/admin-discounts";

vi.mock("@/features/admin/hooks/use-permissions");

const MOCK_DISCOUNT_REQUESTS: StaffDiscountRequestRecord[] = [
  {
    id: "req-1",
    bookingId: "bkg-101",
    discountType: "PERCENTAGE",
    discountValue: 15,
    originalPrice: 1000,
    discountAmount: 150,
    proposedFinalPrice: 850,
    approvedDiscountAmount: null,
    approvedFinalPrice: null,
    status: "PENDING",
    reason: "Returning customer family group discount",
    rejectionReason: null,
    adminNotes: null,
    requestedById: "staff-1",
    reviewedById: null,
    reviewedAt: null,
    createdAt: "2026-11-17T09:00:00.000Z",
    updatedAt: "2026-11-17T09:00:00.000Z",
    booking: {
      id: "bkg-101",
      currency: "USD",
      status: "PENDING",
      paymentStatus: "UNPAID",
      customer: {
        id: "cust-1",
        name: "Alice Walker",
        email: "alice@example.com",
        phone: "+66 81 111 2222",
      },
      service: {
        id: "srv-1",
        name: "Phi Phi Speedboat Adventure",
        type: "TOUR",
      },
    },
    requestedBy: {
      id: "staff-1",
      name: "Somchai Staff",
      email: "somchai@qbictravel.com",
      role: "staff",
    },
    reviewedBy: null,
  },
  {
    id: "req-2",
    bookingId: "bkg-102",
    discountType: "FIXED_AMOUNT",
    discountValue: 50,
    originalPrice: 300,
    discountAmount: 50,
    proposedFinalPrice: 250,
    approvedDiscountAmount: 50,
    approvedFinalPrice: 250,
    status: "APPROVED",
    reason: "Promotional match",
    rejectionReason: null,
    adminNotes: "Approved per campaign",
    requestedById: "staff-2",
    reviewedById: "admin-1",
    reviewedAt: "2026-11-17T10:00:00.000Z",
    createdAt: "2026-11-17T08:00:00.000Z",
    updatedAt: "2026-11-17T10:00:00.000Z",
    booking: {
      id: "bkg-102",
      currency: "USD",
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      customer: {
        id: "cust-2",
        name: "Bob Dylan",
        email: "bob@example.com",
        phone: null,
      },
      service: {
        id: "srv-2",
        name: "James Bond Island Cruise",
        type: "TOUR",
      },
    },
    requestedBy: {
      id: "staff-2",
      name: "Anong Staff",
      email: "anong@qbictravel.com",
      role: "staff",
    },
    reviewedBy: {
      id: "admin-1",
      name: "Super Admin",
      email: "admin@qbictravel.com",
      role: "admin",
    },
  },
];

const MOCK_SUMMARY = {
  totalRequests: 2,
  pendingRequests: 1,
  approvedRequests: 1,
  rejectedRequests: 0,
  totalApprovedDiscountAmount: 50,
  staffStats: [
    {
      staffId: "staff-1",
      staffName: "Somchai Staff",
      staffEmail: "somchai@qbictravel.com",
      totalRequests: 1,
      pendingRequests: 1,
      approvedRequests: 0,
      rejectedRequests: 0,
      totalApprovedDiscountAmount: 0,
    },
    {
      staffId: "staff-2",
      staffName: "Anong Staff",
      staffEmail: "anong@qbictravel.com",
      totalRequests: 1,
      pendingRequests: 0,
      approvedRequests: 1,
      rejectedRequests: 0,
      totalApprovedDiscountAmount: 50,
    },
  ],
};

describe("AdminDiscountsView component", () => {
  const mockRefetchList = vi.fn();
  const mockRefetchSummary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: ["bookings.approve_price"],
      isAdmin: true,
      isStaff: false,
      isLoading: false,
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
    });

    vi.spyOn(adminApiModule, "useGetAdminDiscountsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved discount requests",
        data: {
          items: MOCK_DISCOUNT_REQUESTS,
          total: 2,
          page: 1,
          limit: 15,
          totalPages: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetchList,
    } as any);

    vi.spyOn(adminApiModule, "useGetAdminDiscountsSummaryQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved discount summary",
        data: MOCK_SUMMARY,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetchSummary,
    } as any);

    vi.spyOn(adminApiModule, "useReviewAdminDiscountMutation").mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
      { isLoading: false } as any,
    ]);
  });

  it("renders summary metrics cards accurately from backend summary data", () => {
    render(<AdminDiscountsView />);

    expect(screen.getByTestId("summary-total-requests")).toHaveTextContent("2");
    expect(screen.getByTestId("summary-pending-requests")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-approved-requests")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-rejected-requests")).toHaveTextContent("0");
    expect(screen.getByTestId("summary-total-discounted")).toHaveTextContent("$50.00");
  });

  it("renders requests table with customer, tour, price, and status badges", () => {
    render(<AdminDiscountsView />);

    expect(screen.getByText("Alice Walker")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Speedboat Adventure")).toBeInTheDocument();
    expect(screen.getByText("Bob Dylan")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Cruise")).toBeInTheDocument();
  });

  it("shows review button for pending request when user has approve_price permission", () => {
    render(<AdminDiscountsView />);

    expect(screen.getByTestId("review-discount-btn-req-1")).toBeInTheDocument();
    // req-2 is already APPROVED so no review button
    expect(screen.queryByTestId("review-discount-btn-req-2")).not.toBeInTheDocument();
  });

  it("hides review button when user lacks approve_price permission", () => {
    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: ["bookings.view"],
      isAdmin: false,
      isStaff: true,
      isLoading: false,
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
    });

    render(<AdminDiscountsView />);

    expect(screen.queryByTestId("review-discount-btn-req-1")).not.toBeInTheDocument();
  });

  it("opens request details modal on click", () => {
    render(<AdminDiscountsView />);

    const detailsBtn = screen.getByTestId("view-discount-details-req-1");
    fireEvent.click(detailsBtn);

    expect(screen.getByTestId("discount-details-dialog")).toBeInTheDocument();
    expect(screen.getByText(/Returning customer family group discount/)).toBeInTheDocument();
  });
});
