import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminCommissionsView } from "./admin-commissions-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type {
  AdminCommissionRecord,
  AdminCommissionsListResponse,
  AdminCommissionsReportData,
  AdminCommissionRulesResponse,
} from "../../types/admin-commissions";

const MOCK_COMMISSION: AdminCommissionRecord = {
  id: "comm-row-1",
  bookingId: "book-row-1",
  agentId: "agent-row-1",
  ruleId: "rule-1",
  rateType: "PERCENTAGE",
  rateValue: 10,
  baseAmount: 12000,
  amount: 1200,
  status: "ACTIVE",
  createdAt: "2026-10-28T09:00:00.000Z",
  updatedAt: "2026-10-28T09:00:00.000Z",
  agent: {
    id: "agent-row-1",
    name: "Siam Discovery Tours",
  },
  booking: {
    id: "book-row-1",
    serviceId: "srv-phi-phi",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    finalPrice: 12000,
    service: { id: "srv-phi-phi", name: "Phi Phi Early Bird Tour" },
    customer: { id: "cust-1", name: "Bob Martin", email: "bob@example.com" },
  },
};

const MOCK_COMMISSIONS_LIST: AdminCommissionsListResponse = {
  items: [MOCK_COMMISSION],
  page: 1,
  limit: 10,
  total: 1,
};

const MOCK_REPORT_DATA: AdminCommissionsReportData = {
  filters: { from: null, to: null, serviceType: null, agentId: null },
  count: 14,
  totalActiveAmount: 48500,
  byStatus: [
    { status: "ACTIVE", count: 12, totalAmount: 48500 },
    { status: "CANCELLED", count: 2, totalAmount: 3200 },
  ],
  items: [
    { agentId: "agent-row-1", name: "Siam Discovery Tours", count: 8, totalAmount: 32000 },
  ],
  page: 1,
  limit: 10,
  total: 1,
};

const MOCK_RULES_DATA: AdminCommissionRulesResponse = {
  activeRule: {
    id: "rule-active-1",
    rateType: "PERCENTAGE",
    rateValue: 10,
    status: "ACTIVE",
    isActive: true,
    createdById: "admin-1",
    createdAt: "2026-10-01T00:00:00.000Z",
  },
  items: [],
  page: 1,
  limit: 1,
  total: 1,
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminCommissionsQuery: vi.fn(),
    useGetAdminCommissionsReportQuery: vi.fn(),
    useGetAdminCommissionRulesQuery: vi.fn(),
    useGetAdminCommissionByIdQuery: vi.fn(),
    useAdjustAdminCommissionMutation: vi.fn(),
    useConfigureAdminCommissionRuleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useDisablePlatformCommissionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useCreateDraftCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useUpdateCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    usePublishCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useDeactivateCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useArchiveCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useDeleteCommissionPolicyMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useCreateCommissionPolicyRevisionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useGetAdminUsersQuery: vi.fn(),
  };
});

describe("AdminCommissionsView component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminApiModule.useGetAdminCommissionsQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_COMMISSIONS_LIST },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionsQuery>);

    vi.mocked(adminApiModule.useGetAdminCommissionsReportQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_REPORT_DATA },
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionsReportQuery>);

    vi.mocked(adminApiModule.useGetAdminCommissionRulesQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_RULES_DATA },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionRulesQuery>);

    vi.mocked(adminApiModule.useGetAdminUsersQuery).mockReturnValue({
      data: {
        success: true,
        message: "OK",
        data: {
          items: [
            {
              id: "agent-row-1",
              name: "Siam Discovery Tours",
              agentProfile: { agencyName: "Siam Travel" },
            },
          ],
          total: 1,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminUsersQuery>);

    vi.mocked(adminApiModule.useGetAdminCommissionByIdQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_COMMISSION },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminCommissionByIdQuery>);

    vi.mocked(adminApiModule.useAdjustAdminCommissionMutation).mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useAdjustAdminCommissionMutation>[1],
    ]);

    vi.mocked(adminApiModule.useConfigureAdminCommissionRuleMutation).mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useConfigureAdminCommissionRuleMutation>[1],
    ]);
  });

  it("renders page header, overview summary cards, toolbar, and ledger table", () => {
    render(<AdminCommissionsView />);

    expect(screen.getByText("Commissions Management")).toBeInTheDocument();

    // Summary cards metrics
    expect(screen.getByTestId("metric-active-commissions")).toBeInTheDocument();
    expect(screen.getByText("฿48,500.00")).toBeInTheDocument();
    expect(screen.getByTestId("metric-commission-policy")).toBeInTheDocument();
    expect(screen.getAllByText("10.00%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("metric-cancelled-commissions")).toBeInTheDocument();
    expect(screen.getByText("฿3,200.00")).toBeInTheDocument();

    // Toolbar & Table
    expect(screen.getByTestId("commissions-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("commissions-table")).toBeInTheDocument();
    expect(screen.getByText("Siam Discovery Tours")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Early Bird Tour")).toBeInTheDocument();
    expect(screen.getByText("฿1,200.00")).toBeInTheDocument();
  });

  it("switches tabs between Commission Ledger and Commission Policy & Rules", () => {
    render(<AdminCommissionsView />);

    // Initially in Ledger tab
    expect(screen.getByTestId("commissions-table")).toBeInTheDocument();
    expect(screen.queryByTestId("commission-rules-tab")).not.toBeInTheDocument();

    // Click Policy & Rules tab
    const rulesTabBtn = screen.getByTestId("tab-commission-rules");
    fireEvent.click(rulesTabBtn);

    expect(screen.getByTestId("commission-rules-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("commissions-table")).not.toBeInTheDocument();

    // Click back to Ledger tab
    const ledgerTabBtn = screen.getByTestId("tab-commission-ledger");
    fireEvent.click(ledgerTabBtn);

    expect(screen.getByTestId("commissions-table")).toBeInTheDocument();
  });

  it("applies status and agent filters and handles reset", () => {
    render(<AdminCommissionsView />);

    // Change status filter using CustomSelect
    const statusBtn = screen.getByTestId("commission-status-filter").querySelector("button");
    expect(statusBtn).toBeInTheDocument();
    if (statusBtn) {
      fireEvent.click(statusBtn);
      const activeOption = screen.getByRole("option", { name: "Active" });
      fireEvent.click(activeOption);
    }
    expect(screen.getByTestId("commission-reset-filters-btn")).toBeInTheDocument();

    // Change agent filter using CustomSelect
    const agentBtn = screen.getByTestId("commission-agent-filter").querySelector("button");
    expect(agentBtn).toBeInTheDocument();
    if (agentBtn) {
      fireEvent.click(agentBtn);
      const agentOption = screen.getByRole("option", { name: /Siam Discovery/i });
      fireEvent.click(agentOption);
    }

    // Reset filters
    const resetBtn = screen.getByTestId("commission-reset-filters-btn");
    fireEvent.click(resetBtn);

    expect(screen.queryByTestId("commission-reset-filters-btn")).not.toBeInTheDocument();
  });

  it("opens details modal when view details button is clicked", () => {
    render(<AdminCommissionsView />);

    const viewBtn = screen.getByTestId(`view-details-${MOCK_COMMISSION.id}`);
    fireEvent.click(viewBtn);

    expect(screen.getByText("Commission Record & Audit History")).toBeInTheDocument();
  });

  it("opens adjust modal when adjust commission button is clicked", () => {
    render(<AdminCommissionsView />);

    const adjustBtn = screen.getByTestId(`adjust-commission-${MOCK_COMMISSION.id}`);
    fireEvent.click(adjustBtn);

    expect(screen.getByText("Adjust Active Commission")).toBeInTheDocument();
  });

  it("uses CustomSelect for status, agent, and page size filters without any native HTML select", () => {
    const { container } = render(<AdminCommissionsView />);

    // Assert zero native HTML select elements exist anywhere in the view
    const nativeSelects = container.querySelectorAll("select");
    expect(nativeSelects.length).toBe(0);

    // Verify CustomSelect combobox buttons are rendered
    expect(screen.getByTestId("commission-status-filter").querySelector("button")).toBeInTheDocument();
    expect(screen.getByTestId("commission-agent-filter").querySelector("button")).toBeInTheDocument();
    expect(screen.getByTestId("commission-limit-selector").querySelector("button")).toBeInTheDocument();
  });
});
