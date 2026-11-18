import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffBookingsView } from "./staff-bookings-view";
import * as adminApi from "@/features/admin/api/admin-api";
import * as permissionsHookModule from "@/features/admin/hooks/use-permissions";
import type { StaffBookingRecord } from "@/features/admin/types/admin-bookings";

vi.mock("@/features/admin/hooks/use-permissions");
vi.mock("@/features/admin/api/admin-api", async (importOriginal) => {
  const actual = await importOriginal<typeof adminApi>();
  return {
    ...actual,
    useGetStaffBookingHistoryQuery: vi.fn().mockReturnValue({
      data: {
        success: true,
        data: {
          items: [],
        },
      },
      isLoading: false,
    }),
  };
});

const MOCK_ASSIGNED_BOOKINGS: StaffBookingRecord[] = [
  {
    id: "bkg-staff-1",
    status: "CONFIRMED",
    fulfillmentStatus: "NOT_STARTED",
    paymentStatus: "PAID",
    assignedStaffId: "staff-me",
    notes: "Travel Date: 2026-12-01 | Guests: 2 Adults, 1 Child | Contact: Alice Wonderland (+66 89 123 4567) | Hotel: Katathani Resort",
    internalNotes: "VIP repeat customer from Australia",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    service: {
      id: "srv-phi-phi",
      name: "Phi Phi Islands Luxury Speedboat",
      type: "TOUR",
    },
    availability: {
      id: "avail-1",
      date: "2026-12-01T08:00:00.000Z",
    },
    customer: {
      id: "cust-1",
      name: "Alice Wonderland",
      phone: "+66 89 123 4567",
    },
    assignedStaff: {
      id: "staff-me",
      name: "Somchai Staff",
    },
  },
  {
    id: "bkg-staff-2",
    status: "IN_PROGRESS",
    fulfillmentStatus: "IN_PROGRESS",
    paymentStatus: "PAID",
    assignedStaffId: "staff-me",
    notes: "Travel Date: 2026-11-15 | Guests: 1 Adult | Contact: Bob Builder (+66 81 999 8888)",
    internalNotes: null,
    createdAt: "2026-11-02T11:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z",
    service: {
      id: "srv-james-bond",
      name: "James Bond Island Explorer",
      type: "TOUR",
    },
    availability: {
      id: "avail-2",
      date: "2026-11-15T09:00:00.000Z",
    },
    customer: {
      id: "cust-2",
      name: "Bob Builder",
      phone: "+66 81 999 8888",
    },
    assignedStaff: {
      id: "staff-me",
      name: "Somchai Staff",
    },
  },
];

describe("StaffBookingsView component", () => {
  const mockRefetch = vi.fn();
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: ["bookings.create"],
      isAdmin: false,
      isStaff: true,
      isLoading: false,
      hasPermission: vi.fn((p) => p === "bookings.create"),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
    });

    vi.spyOn(adminApi, "useGetStaffOperationsBookingsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved staff bookings",
        data: {
          items: MOCK_ASSIGNED_BOOKINGS,
          total: 2,
          page: 1,
          limit: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(adminApi, "useGetStaffCreatedBookingsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved created bookings",
        data: {
          items: MOCK_ASSIGNED_BOOKINGS,
          total: 2,
          page: 1,
          limit: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(adminApi, "useGenerateStaffPaymentLinkMutation").mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true, data: { paymentUrl: "http://pay.local" } }) }),
      { isLoading: false } as any,
    ]);

    vi.spyOn(adminApi, "useUpdateStaffBookingFulfillmentStatusMutation").mockReturnValue([
      mockUpdateStatus,
      { isLoading: false } as any,
    ]);

    vi.spyOn(adminApi, "useCreateStaffDiscountRequestMutation").mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true, data: { id: "test-req" } }) }),
      { isLoading: false } as any,
    ]);
  });

  it("renders staff dashboard summary metrics and assigned queue", () => {
    render(<StaffBookingsView />);

    expect(screen.getByTestId("staff-bookings-dashboard")).toBeInTheDocument();
    expect(screen.getByText("Staff Bookings Workspace")).toBeInTheDocument();

    // Summary counts
    expect(screen.getAllByText("My Created Bookings").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);

    // Check table rows
    expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands Luxury Speedboat")).toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Explorer")).toBeInTheDocument();
  });

  it("disables Pay Link button with informative tooltip when booking is paid", () => {
    render(<StaffBookingsView />);
    const payLinkBtn = screen.getByTestId("staff-payment-link-bkg-staff-1");
    expect(payLinkBtn).toBeDisabled();
    expect(payLinkBtn).toHaveAttribute("title", "Payment has already been completed.");
  });

  it("disables Pay Link button when awaiting approval (with or without discount)", () => {
    const mockAwaitingBooking: StaffBookingRecord = {
      ...MOCK_ASSIGNED_BOOKINGS[0],
      id: "bkg-awaiting",
      status: "AWAITING_APPROVAL",
      requiresApproval: true,
      paymentStatus: "UNPAID",
      discountRequests: [
        {
          id: "dr-pending",
          discountType: "PERCENTAGE",
          discountValue: 10,
          originalPrice: 13240,
          discountAmount: 1324,
          proposedFinalPrice: 11916,
          status: "PENDING",
          reason: "VIP client",
          rejectionReason: null,
          adminNotes: null,
          requestedById: "staff-me",
          reviewedById: null,
          reviewedAt: null,
          createdAt: "2026-11-18T10:00:00.000Z",
        },
      ],
    };

    const mockPendingNoDiscountBooking: StaffBookingRecord = {
      ...MOCK_ASSIGNED_BOOKINGS[0],
      id: "bkg-pending-no-discount",
      status: "PENDING",
      requiresApproval: false,
      paymentStatus: "UNPAID",
      discountRequests: [],
    };

    vi.spyOn(adminApi, "useGetStaffCreatedBookingsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved created bookings",
        data: {
          items: [mockAwaitingBooking, mockPendingNoDiscountBooking],
          total: 2,
          page: 1,
          limit: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<StaffBookingsView />);

    // 1. Booking with discount awaiting approval
    const payLinkBtnWithDiscount = screen.getByTestId("staff-payment-link-bkg-awaiting");
    expect(payLinkBtnWithDiscount).toBeDisabled();
    expect(payLinkBtnWithDiscount).toHaveAttribute("title", "Waiting for Admin approval.");

    // 2. Booking without discount in PENDING status awaiting approval
    const payLinkBtnNoDiscount = screen.getByTestId("staff-payment-link-bkg-pending-no-discount");
    expect(payLinkBtnNoDiscount).toBeDisabled();
    expect(payLinkBtnNoDiscount).toHaveAttribute("title", "Waiting for Admin approval.");
  });

  it("enables Pay Link button when booking is confirmed and unpaid", () => {
    const mockConfirmedUnpaidBooking: StaffBookingRecord = {
      ...MOCK_ASSIGNED_BOOKINGS[0],
      id: "bkg-unpaid-confirmed",
      status: "CONFIRMED",
      requiresApproval: false,
      paymentStatus: "UNPAID",
      basePrice: 13240,
      finalPrice: 12578,
      currency: "THB",
      discountRequests: [
        {
          id: "dr-approved",
          discountType: "PERCENTAGE",
          discountValue: 10,
          originalPrice: 13240,
          discountAmount: 1324,
          proposedFinalPrice: 11916,
          status: "APPROVED",
          approvedDiscountAmount: 662,
          approvedFinalPrice: 12578,
          reason: "Loyal customer",
          rejectionReason: null,
          adminNotes: "Approved 5% partial discount",
          requestedById: "staff-me",
          reviewedById: "admin-1",
          reviewedAt: "2026-11-18T11:00:00.000Z",
          createdAt: "2026-11-18T10:00:00.000Z",
        },
      ],
    };

    vi.spyOn(adminApi, "useGetStaffCreatedBookingsQuery").mockReturnValue({
      data: {
        success: true,
        message: "Retrieved created bookings",
        data: {
          items: [mockConfirmedUnpaidBooking],
          total: 1,
          page: 1,
          limit: 10,
        },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<StaffBookingsView />);
    const payLinkBtn = screen.getByTestId("staff-payment-link-bkg-unpaid-confirmed");
    expect(payLinkBtn).not.toBeDisabled();
  });

  it("opens booking details dialog with operational manifests and pricing breakdown", () => {
    render(<StaffBookingsView />);

    const detailsBtn = screen.getByTestId("staff-view-details-bkg-staff-1");
    fireEvent.click(detailsBtn);

    expect(screen.getByTestId("staff-booking-details-modal")).toBeInTheDocument();
    expect(screen.getByText("Tour & Schedule")).toBeInTheDocument();
    expect(screen.getByText("Katathani Resort")).toBeInTheDocument();
    expect(screen.getByText("VIP repeat customer from Australia")).toBeInTheDocument();
  });

  it("filters assigned tours using the search box", () => {
    render(<StaffBookingsView />);

    const searchInput = screen.getByTestId("staff-bookings-search");
    fireEvent.change(searchInput, { target: { value: "James Bond" } });

    expect(screen.queryByText("Alice Wonderland")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Builder")).toBeInTheDocument();
  });

  it("shows Create Booking button when staff holds bookings.create permission", () => {
    render(<StaffBookingsView />);
    expect(screen.getByTestId("staff-create-booking-btn")).toBeInTheDocument();
  });

  it("hides Create Booking button when staff lacks bookings.create permission", () => {
    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: [],
      isAdmin: false,
      isStaff: true,
      isLoading: false,
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
    });

    render(<StaffBookingsView />);
    expect(screen.queryByTestId("staff-create-booking-btn")).not.toBeInTheDocument();
  });

  it("shows Create Booking button for admin users regardless of permissions array", () => {
    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: [],
      isAdmin: true,
      isStaff: false,
      isLoading: false,
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
    });

    render(<StaffBookingsView />);
    expect(screen.getByTestId("staff-create-booking-btn")).toBeInTheDocument();
  });
});
