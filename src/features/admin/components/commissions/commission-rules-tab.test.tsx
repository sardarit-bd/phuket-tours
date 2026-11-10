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
  name: "Standard Partner 12.5%",
  description: "Applied to standard hotel partner bookings",
  rateType: "PERCENTAGE",
  rateValue: 12.5,
  status: "ACTIVE",
  isActive: true,
  createdById: "admin-superuser-1",
  createdAt: "2026-10-15T09:00:00.000Z",
  updatedAt: "2026-10-15T09:00:00.000Z",
  createdBy: {
    id: "admin-superuser-1",
    name: "Admin User",
    email: "admin@phukettours.local",
  },
};

const MOCK_INACTIVE_RULE: AdminCommissionRule = {
  id: "rule-inactive-5678",
  name: "Fixed Early Bird Promo",
  description: "Special fixed fee promo for early birds",
  rateType: "FIXED",
  rateValue: 500,
  status: "INACTIVE",
  isActive: false,
  createdById: "admin-superuser-1",
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-01T08:00:00.000Z",
  createdBy: {
    id: "admin-superuser-1",
    name: "Admin User",
    email: "admin@phukettours.local",
  },
};

const MOCK_RULES_RESPONSE: AdminCommissionRulesResponse = {
  activeRule: MOCK_ACTIVE_RULE,
  items: [MOCK_ACTIVE_RULE, MOCK_INACTIVE_RULE],
  page: 1,
  limit: 10,
  total: 2,
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminCommissionRulesQuery: vi.fn(),
    useCreateDraftCommissionPolicyMutation: vi.fn(),
    useUpdateCommissionPolicyMutation: vi.fn(),
    useDeleteCommissionPolicyMutation: vi.fn(),
    usePublishCommissionPolicyMutation: vi.fn(),
    useDeactivateCommissionPolicyMutation: vi.fn(),
  };
});

describe("CommissionRulesTab (Simplified Commission Management CRUD)", () => {
  const mockCreateMutation = vi.fn();
  const mockUpdateMutation = vi.fn();
  const mockDeleteMutation = vi.fn();
  const mockPublishMutation = vi.fn();
  const mockDeactivateMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminApiModule.useGetAdminCommissionRulesQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_RULES_RESPONSE },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionRulesQuery>);

    mockCreateMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "rule-new",
          name: "New Partner 15%",
          rateType: "PERCENTAGE",
          rateValue: 15,
          status: "ACTIVE",
          isActive: true,
        },
      }),
    });

    mockUpdateMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "rule-inactive-5678",
          name: "Updated Promo Name",
          rateType: "FIXED",
          rateValue: 600,
          status: "INACTIVE",
          isActive: false,
        },
      }),
    });

    mockDeleteMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { id: "rule-inactive-5678", deleted: true },
      }),
    });

    mockPublishMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { id: "rule-inactive-5678", status: "ACTIVE", isActive: true },
      }),
    });

    mockDeactivateMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { id: "rule-active-1234", status: "INACTIVE", isActive: false },
      }),
    });

    vi.mocked(adminApiModule.useCreateDraftCommissionPolicyMutation).mockReturnValue([
      mockCreateMutation,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useUpdateCommissionPolicyMutation).mockReturnValue([
      mockUpdateMutation,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useDeleteCommissionPolicyMutation).mockReturnValue([
      mockDeleteMutation,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.usePublishCommissionPolicyMutation).mockReturnValue([
      mockPublishMutation,
      { isLoading: false } as any,
    ]);

    vi.mocked(adminApiModule.useDeactivateCommissionPolicyMutation).mockReturnValue([
      mockDeactivateMutation,
      { isLoading: false } as any,
    ]);
  });

  it("renders page header and Commission table with expected columns", () => {
    render(<CommissionRulesTab />);

    expect(screen.getByText("Commission Management")).toBeInTheDocument();
    expect(screen.getByText("Manage commission rates applied to partner bookings. Only one commission can be active at a time.")).toBeInTheDocument();
    expect(screen.getByTestId("add-commission-btn")).toBeInTheDocument();

    // Table Columns
    expect(screen.getByText("Commission Name")).toBeInTheDocument();
    expect(screen.getByText("Rate")).toBeInTheDocument();
    expect(screen.getByText("Calculation Type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Created Date")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();

    // Rendered rows
    expect(screen.getByText("Standard Partner 12.5%")).toBeInTheDocument();
    expect(screen.getByText("Fixed Early Bird Promo")).toBeInTheDocument();
    expect(screen.getByText("12.50%")).toBeInTheDocument();
    expect(screen.getByText("฿500.00")).toBeInTheDocument();
  });

  it("opens modal and creates a new percentage commission", async () => {
    render(<CommissionRulesTab />);

    fireEvent.click(screen.getByTestId("add-commission-btn"));

    expect(screen.getAllByText("Add Commission").length).toBeGreaterThanOrEqual(1);

    // Fill form
    fireEvent.change(screen.getByTestId("commission-name-input"), {
      target: { value: "Summer Special 15%" },
    });
    fireEvent.change(screen.getByTestId("commission-rate-input"), {
      target: { value: "15" },
    });
    fireEvent.change(screen.getByTestId("commission-desc-input"), {
      target: { value: "Special partner discount" },
    });

    // Save
    fireEvent.click(screen.getByTestId("save-commission-btn"));

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalledWith({
        name: "Summer Special 15%",
        description: "Special partner discount",
        rateType: "PERCENTAGE",
        rateValue: 15,
        status: "ACTIVE",
        isActive: true,
      });
      expect(
        screen.getByText(/Commission "Summer Special 15%" created successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("opens View details modal showing all required metadata", () => {
    render(<CommissionRulesTab />);

    const viewBtn = screen.getByTestId("view-commission-btn-rule-active-1234");
    fireEvent.click(viewBtn);

    expect(screen.getByText("Commission Details")).toBeInTheDocument();
    expect(screen.getAllByText("Standard Partner 12.5%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Applied to standard hotel partner bookings").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("opens Edit modal and updates commission", async () => {
    render(<CommissionRulesTab />);

    const editBtn = screen.getByTestId("edit-commission-btn-rule-inactive-5678");
    fireEvent.click(editBtn);

    expect(screen.getByText("Edit Commission")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fixed Early Bird Promo")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("commission-name-input"), {
      target: { value: "Updated Promo Fee" },
    });
    fireEvent.change(screen.getByTestId("commission-rate-input"), {
      target: { value: "600" },
    });

    fireEvent.click(screen.getByTestId("save-commission-btn"));

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalledWith({
        policyId: "rule-inactive-5678",
        input: expect.objectContaining({
          name: "Updated Promo Fee",
          rateValue: 600,
        }),
      });
      expect(
        screen.getByText(/Commission "Updated Promo Fee" updated successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("deletes an inactive commission with confirmation dialog", async () => {
    render(<CommissionRulesTab />);

    const deleteBtn = screen.getByTestId("delete-commission-btn-rule-inactive-5678");
    fireEvent.click(deleteBtn);

    expect(screen.getByText("Delete Commission")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to permanently delete/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-delete-commission-btn"));

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith("rule-inactive-5678");
      expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
    });
  });

  it("prevents deleting an active commission", () => {
    render(<CommissionRulesTab />);

    const activeDeleteBtn = screen.getByTestId("delete-commission-btn-rule-active-1234");
    expect(activeDeleteBtn).toBeDisabled();
  });

  it("activates an inactive commission with confirmation and explains replacing current active", async () => {
    render(<CommissionRulesTab />);

    const activateBtn = screen.getByTestId("activate-btn-rule-inactive-5678");
    fireEvent.click(activateBtn);

    expect(screen.getByText("Activate Commission")).toBeInTheDocument();
    expect(screen.getByText("Replaces Currently Active Commission")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-activate-btn"));

    await waitFor(() => {
      expect(mockPublishMutation).toHaveBeenCalledWith("rule-inactive-5678");
      expect(screen.getByText(/is now ACTIVE/i)).toBeInTheDocument();
    });
  });

  it("deactivates the active commission and warns commission generation is paused", async () => {
    render(<CommissionRulesTab />);

    const deactivateBtn = screen.getByTestId("deactivate-btn-rule-active-1234");
    fireEvent.click(deactivateBtn);

    expect(screen.getByText("Deactivate Commission")).toBeInTheDocument();
    expect(screen.getByText(/No commission will be active after this action/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-deactivate-btn"));

    await waitFor(() => {
      expect(mockDeactivateMutation).toHaveBeenCalledWith("rule-active-1234");
      expect(screen.getByText(/Commission generation is currently paused/i)).toBeInTheDocument();
    });
  });
});
