import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminPaymentsView } from "./admin-payments-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import * as permissionsHookModule from "../../hooks/use-permissions";
import type { AdminPaymentRecord } from "../../types/admin-payments";

const MOCK_PAYMENTS: AdminPaymentRecord[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    bookingId: "a1111111-2222-3333-4444-555555555555",
    customerId: "c1111111-2222-3333-4444-555555555555",
    amount: 5000,
    method: "BANK_TRANSFER",
    status: "SUBMITTED",
    reference: "SLIP-8888",
    receiptNote: "Uploaded receipt",
    submittedAt: "2026-10-20T10:00:00.000Z",
    receivedAt: null,
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    createdAt: "2026-10-20T09:30:00.000Z",
    updatedAt: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "b2222222-3333-4444-5555-666666666666",
    bookingId: "a2222222-3333-4444-5555-666666666666",
    customerId: "c2222222-3333-4444-5555-666666666666",
    amount: 1500,
    method: "CASH",
    status: "INITIATED",
    reference: null,
    receiptNote: null,
    submittedAt: null,
    receivedAt: null,
    reviewedById: null,
    reviewedAt: null,
    reviewNotes: null,
    createdAt: "2026-10-21T09:30:00.000Z",
    updatedAt: "2026-10-21T09:30:00.000Z",
  },
];

const MOCK_REPORT = {
  byStatus: [
    { status: "VERIFIED", count: 12, totalAmount: 48000 },
    { status: "SUBMITTED", count: 1, totalAmount: 5000 },
    { status: "INITIATED", count: 1, totalAmount: 1500 },
    { status: "REJECTED", count: 0, totalAmount: 0 },
  ],
  verifiedByMethod: [
    { method: "BANK_TRANSFER", count: 8, totalAmount: 36000 },
    { method: "CASH", count: 4, totalAmount: 12000 },
  ],
  reconciliation: {
    paidBookingsValue: 48000,
    verifiedPaymentsValue: 48000,
    difference: 0,
    pendingVerificationCount: 1,
    pendingVerificationValue: 5000,
  },
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminPaymentsQuery: vi.fn(),
    useGetAdminPaymentsReportQuery: vi.fn(),
    useGetAdminPaymentByIdQuery: vi.fn(),
    useVerifyAdminPaymentMutation: vi.fn(),
    useRecordAdminPaymentMutation: vi.fn(),
  };
});

vi.mock("../../hooks/use-permissions", () => {
  return {
    usePermissions: vi.fn(),
  };
});

describe("AdminPaymentsView root view", () => {
  const mockRefetchPayments = vi.fn();
  const mockRefetchReport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(permissionsHookModule.usePermissions).mockReturnValue({
      permissions: ["payments.view", "payments.verify", "payments.record", "reports.view"],
      isAdmin: true,
      isStaff: false,
      isLoading: false,
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
    });

    vi.mocked(adminApiModule.useGetAdminPaymentsQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: MOCK_PAYMENTS,
          page: 1,
          limit: 10,
          total: 2,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mockRefetchPayments,
    } as any);

    vi.mocked(adminApiModule.useGetAdminPaymentsReportQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: MOCK_REPORT,
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetchReport,
    } as any);

    vi.mocked(adminApiModule.useGetAdminPaymentByIdQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_PAYMENTS[0] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(adminApiModule.useVerifyAdminPaymentMutation).mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useRecordAdminPaymentMutation).mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
      { isLoading: false } as any,
    ]);
  });

  it("renders page header, metrics cards, toolbar, and payments table", () => {
    render(<AdminPaymentsView />);

    expect(screen.getByTestId("admin-payments-view")).toBeInTheDocument();
    expect(screen.getByText("Payments Management")).toBeInTheDocument();
    expect(screen.getByText(/manage transactions, verify incoming payments/i)).toBeInTheDocument();

    // Summary cards
    expect(screen.getByTestId("metric-total-payments")).toBeInTheDocument();
    expect(screen.getByTestId("metric-verified-payments")).toBeInTheDocument();
    expect(screen.getByTestId("metric-pending-payments")).toBeInTheDocument();
    expect(screen.getByTestId("metric-rejected-payments")).toBeInTheDocument();

    // Toolbar status tabs
    expect(screen.getByTestId("status-tab-all")).toBeInTheDocument();
    expect(screen.getByTestId("status-tab-submitted")).toBeInTheDocument();

    // Table rows
    expect(screen.getByTestId("payment-row-f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBeInTheDocument();
    expect(screen.getByTestId("payment-row-b2222222-3333-4444-5555-666666666666")).toBeInTheDocument();
  });

  it("triggers refresh when clicking refresh button", async () => {
    render(<AdminPaymentsView />);

    const refreshBtn = screen.getByTestId("refresh-payments-btn");
    fireEvent.click(refreshBtn);

    expect(mockRefetchPayments).toHaveBeenCalled();
  });

  it("opens record payment modal from header button", () => {
    render(<AdminPaymentsView />);

    const recordHeaderBtn = screen.getByTestId("record-payment-header-btn");
    fireEvent.click(recordHeaderBtn);

    expect(screen.getByText("Record Manual Payment")).toBeInTheDocument();
  });

  it("filters by status when clicking status tabs", () => {
    render(<AdminPaymentsView />);

    const submittedTab = screen.getByTestId("status-tab-submitted");
    fireEvent.click(submittedTab);

    // Reset filters button appears
    expect(screen.getByTestId("reset-filters-btn")).toBeInTheDocument();
  });
});
