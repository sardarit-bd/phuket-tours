import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommissionRulesTab } from "./commission-rules-tab";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type {
  AdminCommissionRule,
  AdminCommissionRulesResponse,
} from "../../types/admin-commissions";

const MOCK_ACTIVE_RULE: AdminCommissionRule = {
  id: "rule-active-1234",
  rateType: "PERCENTAGE",
  rateValue: 12.5,
  isActive: true,
  createdById: "admin-superuser-1",
  createdAt: "2026-10-15T09:00:00.000Z",
};

const MOCK_HISTORICAL_RULES: AdminCommissionRule[] = [
  MOCK_ACTIVE_RULE,
  {
    id: "rule-archived-5678",
    rateType: "PERCENTAGE",
    rateValue: 10,
    isActive: false,
    createdById: "admin-superuser-1",
    createdAt: "2026-09-01T08:00:00.000Z",
  },
];

const MOCK_RULES_RESPONSE: AdminCommissionRulesResponse = {
  activeRule: MOCK_ACTIVE_RULE,
  items: MOCK_HISTORICAL_RULES,
  page: 1,
  limit: 10,
  total: 2,
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminCommissionRulesQuery: vi.fn(),
    useConfigureAdminCommissionRuleMutation: vi.fn(),
  };
});

describe("CommissionRulesTab component", () => {
  const mockConfigureMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApiModule.useGetAdminCommissionRulesQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_RULES_RESPONSE },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionRulesQuery>);

    mockConfigureMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Commission rule updated successfully",
        data: {
          id: "rule-new-9999",
          rateType: "FIXED",
          rateValue: 600,
          isActive: true,
          createdById: "admin-superuser-1",
          createdAt: new Date().toISOString(),
        },
      }),
    });

    vi.mocked(adminApiModule.useConfigureAdminCommissionRuleMutation).mockReturnValue([
      mockConfigureMutation,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useConfigureAdminCommissionRuleMutation>[1],
    ]);
  });

  it("renders the active rule card with rate and example calculations", () => {
    render(<CommissionRulesTab />);

    expect(screen.getByTestId("active-rule-card")).toBeInTheDocument();
    expect(screen.getAllByText("12.50%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Active Rule")).toBeInTheDocument();
    expect(screen.getByText(/Applied automatically to all partner bookings/i)).toBeInTheDocument();

    // Check calculation example for ฿10,000 booking at 12.5% = ฿1,250.00
    expect(screen.getByText("฿1,250.00")).toBeInTheDocument();
  });

  it("renders the historical rules table with pagination", () => {
    render(<CommissionRulesTab />);

    expect(screen.getByTestId("rules-history-table")).toBeInTheDocument();
    expect(screen.getByText("Commission Policy Revision History")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("switches rate type between percentage and fixed fee and validates limits", () => {
    render(<CommissionRulesTab />);

    const rateInput = screen.getByTestId("commission-rate-value-input");
    const fixedBtn = screen.getByTestId("rate-type-fixed-btn");
    const percentageBtn = screen.getByTestId("rate-type-percentage-btn");

    // Switch to Fixed
    fireEvent.click(fixedBtn);
    expect(screen.getByText("Fixed Commission Amount (THB)")).toBeInTheDocument();

    // Switch back to Percentage
    fireEvent.click(percentageBtn);
    expect(screen.getByText("Commission Rate Percentage (1% – 100%)")).toBeInTheDocument();

    // Set invalid percentage > 100
    fireEvent.change(rateInput, { target: { value: "120" } });
    expect(screen.getByText(/A percentage commission cannot exceed 100%/i)).toBeInTheDocument();
    expect(screen.getByTestId("configure-rule-submit-btn")).toBeDisabled();
  });

  it("submits a new commission rule when confirmation checkbox is checked", async () => {
    render(<CommissionRulesTab />);

    const fixedBtn = screen.getByTestId("rate-type-fixed-btn");
    const rateInput = screen.getByTestId("commission-rate-value-input");
    const confirmCheckbox = screen.getByTestId("configure-rule-confirm-checkbox");
    const submitBtn = screen.getByTestId("configure-rule-submit-btn");

    // Select Fixed 600 THB
    fireEvent.click(fixedBtn);
    fireEvent.change(rateInput, { target: { value: "600" } });
    fireEvent.click(confirmCheckbox);

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockConfigureMutation).toHaveBeenCalledWith({
        rateType: "FIXED",
        rateValue: 600,
      });
      expect(screen.getByTestId("configure-rule-success")).toBeInTheDocument();
      expect(screen.getByText(/Active commission policy updated to ฿600.00 successfully/i)).toBeInTheDocument();
    });
  });

  it("displays server error message when configuration fails", async () => {
    mockConfigureMutation.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: "The commission rule could not be updated right now. Please retry." },
      }),
    });

    render(<CommissionRulesTab />);

    const rateInput = screen.getByTestId("commission-rate-value-input");
    const confirmCheckbox = screen.getByTestId("configure-rule-confirm-checkbox");
    const submitBtn = screen.getByTestId("configure-rule-submit-btn");

    fireEvent.change(rateInput, { target: { value: "15" } });
    fireEvent.click(confirmCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("configure-rule-error")).toBeInTheDocument();
      expect(
        screen.getByText("The commission rule could not be updated right now. Please retry.")
      ).toBeInTheDocument();
    });
  });
});
