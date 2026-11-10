import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommissionDetailsDialog } from "./commission-details-dialog";
import { AdjustCommissionDialog } from "./adjust-commission-dialog";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type {
  AdminCommissionRecord,
  AdminCommissionDetail,
} from "../../types/admin-commissions";

const MOCK_COMMISSION_RECORD: AdminCommissionRecord = {
  id: "comm-1111-2222-3333-4444",
  bookingId: "book-1111-2222-3333-4444",
  agentId: "agent-1111-2222-3333-4444",
  ruleId: "rule-1111-2222-3333-4444",
  rateType: "PERCENTAGE",
  rateValue: 10,
  baseAmount: 10000,
  amount: 1000,
  status: "ACTIVE",
  createdAt: "2026-10-25T10:00:00.000Z",
  updatedAt: "2026-10-25T10:00:00.000Z",
  agent: {
    id: "agent-1111-2222-3333-4444",
    name: "Phuket Premier Travel",
  },
  booking: {
    id: "book-1111-2222-3333-4444",
    serviceId: "srv-island-tour",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    finalPrice: 10000,
    service: { id: "srv-island-tour", name: "Similan Island Excursion" },
    customer: { id: "cust-1", name: "Alice Walker", email: "alice@example.com" },
  },
};

const MOCK_COMMISSION_DETAIL_WITH_HISTORY: AdminCommissionDetail = {
  ...MOCK_COMMISSION_RECORD,
  amount: 800,
  adjustments: [
    {
      id: "adj-1",
      previousAmount: 1000,
      newAmount: 800,
      reason: "Agreed commission adjustment following partner discount promotion",
      adminId: "admin-superuser-1",
      createdAt: "2026-10-26T14:30:00.000Z",
    },
  ],
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminCommissionByIdQuery: vi.fn(),
    useAdjustAdminCommissionMutation: vi.fn(),
  };
});

describe("CommissionDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when query is loading", () => {
    vi.mocked(adminApiModule.useGetAdminCommissionByIdQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionByIdQuery>);

    render(
      <CommissionDetailsDialog
        commissionId="comm-1111-2222-3333-4444"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/loading commission details & audit history/i)).toBeInTheDocument();
  });

  it("renders commission details and audit history timeline", () => {
    vi.mocked(adminApiModule.useGetAdminCommissionByIdQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_COMMISSION_DETAIL_WITH_HISTORY },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionByIdQuery>);

    const handleAdjust = vi.fn();
    render(
      <CommissionDetailsDialog
        commissionId={MOCK_COMMISSION_DETAIL_WITH_HISTORY.id}
        isOpen={true}
        onClose={vi.fn()}
        onAdjust={handleAdjust}
      />
    );

    expect(screen.getByText("Commission Record & Audit History")).toBeInTheDocument();
    expect(screen.getByText("Phuket Premier Travel")).toBeInTheDocument();
    expect(screen.getByText("Similan Island Excursion")).toBeInTheDocument();
    expect(screen.getByText("Alice Walker")).toBeInTheDocument();
    expect(screen.getAllByText("฿800.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("10.00%")).toBeInTheDocument();
    expect(screen.getByText("฿10,000.00")).toBeInTheDocument();

    // Audit adjustment details
    expect(
      screen.getByText(/Agreed commission adjustment following partner discount promotion/i)
    ).toBeInTheDocument();
    expect(screen.getByText("admin-superuser-1")).toBeInTheDocument();

    // Adjust button in details triggers callback
    const adjustBtn = screen.getByTestId("details-adjust-btn");
    fireEvent.click(adjustBtn);
    expect(handleAdjust).toHaveBeenCalled();
  });

  it("renders empty adjustment message when commission has no adjustment history", () => {
    vi.mocked(adminApiModule.useGetAdminCommissionByIdQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: { ...MOCK_COMMISSION_RECORD, adjustments: [] },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionByIdQuery>);

    render(
      <CommissionDetailsDialog
        commissionId={MOCK_COMMISSION_RECORD.id}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId("no-adjustments-msg")).toBeInTheDocument();
    expect(
      screen.getByText(/no manual adjustments have been made to this commission record/i)
    ).toBeInTheDocument();
  });
});

describe("AdjustCommissionDialog", () => {
  const mockAdjustMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdjustMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Commission adjusted successfully",
        data: MOCK_COMMISSION_DETAIL_WITH_HISTORY,
      }),
    });
    vi.mocked(adminApiModule.useAdjustAdminCommissionMutation).mockReturnValue([
      mockAdjustMutation,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useAdjustAdminCommissionMutation>[1],
    ]);
  });

  it("initializes with current commission values and disables submit button initially", () => {
    render(
      <AdjustCommissionDialog
        commission={MOCK_COMMISSION_RECORD}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Adjust Active Commission")).toBeInTheDocument();
    const amountInput = screen.getByTestId("adjust-commission-amount-input") as HTMLInputElement;
    expect(amountInput.value).toBe("1000.00");

    // Submit button should be disabled because amount is unchanged, reason is empty, and confirmation is false
    const submitBtn = screen.getByTestId("adjust-commission-submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("enforces validation on max booking limit and reason minimum length", () => {
    render(
      <AdjustCommissionDialog
        commission={MOCK_COMMISSION_RECORD}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const amountInput = screen.getByTestId("adjust-commission-amount-input");
    const reasonInput = screen.getByTestId("adjust-commission-reason-input");
    const confirmCheckbox = screen.getByTestId("adjust-commission-confirm-checkbox");
    const submitBtn = screen.getByTestId("adjust-commission-submit-btn");

    // Enter amount greater than booking base amount (10000)
    fireEvent.change(amountInput, { target: { value: "12000" } });
    fireEvent.change(reasonInput, { target: { value: "Valid reason text" } });
    fireEvent.click(confirmCheckbox);

    // Warning message appears and button remains disabled
    expect(
      screen.getByText(/Amount must be between ฿0.00 and the booking base price/i)
    ).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // Enter valid amount within range
    fireEvent.change(amountInput, { target: { value: "850.00" } });
    // But short reason (< 3 chars)
    fireEvent.change(reasonInput, { target: { value: "No" } });
    expect(submitBtn).toBeDisabled();

    // Now valid reason
    fireEvent.change(reasonInput, { target: { value: "Special partner discount reduction" } });
    expect(submitBtn).not.toBeDisabled();
  });

  it("submits adjustment successfully when all inputs and confirmation are valid", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <AdjustCommissionDialog
        commission={MOCK_COMMISSION_RECORD}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const amountInput = screen.getByTestId("adjust-commission-amount-input");
    const reasonInput = screen.getByTestId("adjust-commission-reason-input");
    const confirmCheckbox = screen.getByTestId("adjust-commission-confirm-checkbox");
    const submitBtn = screen.getByTestId("adjust-commission-submit-btn");

    fireEvent.change(amountInput, { target: { value: "750.00" } });
    fireEvent.change(reasonInput, { target: { value: "Customer requested early checkout adjustment" } });
    fireEvent.click(confirmCheckbox);

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAdjustMutation).toHaveBeenCalledWith({
        commissionId: MOCK_COMMISSION_RECORD.id,
        input: {
          amount: 750,
          reason: "Customer requested early checkout adjustment",
        },
      });
      expect(handleSuccess).toHaveBeenCalledWith(expect.stringContaining("฿750.00"));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("displays server error message when API rejects with conflict or business rule", async () => {
    mockAdjustMutation.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: "Only an active commission can be adjusted" },
      }),
    });

    render(
      <AdjustCommissionDialog
        commission={MOCK_COMMISSION_RECORD}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const amountInput = screen.getByTestId("adjust-commission-amount-input");
    const reasonInput = screen.getByTestId("adjust-commission-reason-input");
    const confirmCheckbox = screen.getByTestId("adjust-commission-confirm-checkbox");
    const submitBtn = screen.getByTestId("adjust-commission-submit-btn");

    fireEvent.change(amountInput, { target: { value: "600" } });
    fireEvent.change(reasonInput, { target: { value: "Manual administrative correction" } });
    fireEvent.click(confirmCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("adjust-commission-error")).toBeInTheDocument();
      expect(screen.getByText("Only an active commission can be adjusted")).toBeInTheDocument();
    });
  });
});
