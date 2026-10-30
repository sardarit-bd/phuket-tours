import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminToursView } from "./admin-tours-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type { AdminServiceRecord } from "../../types/admin";

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminServicesQuery: vi.fn(),
    useUpdateAdminServiceStatusMutation: vi.fn(),
    useBulkUpdateAdminServiceStatusMutation: vi.fn(),
  };
});

const MOCK_TOUR: AdminServiceRecord = {
  id: "tour-101",
  name: "Similan Islands Snorkeling Day Trip",
  description: "Explore the crystal clear waters of Similan",
  type: "TOUR",
  status: "PUBLISHED",
  providerName: "Blue Ocean Marine",
  providerId: "prov-1",
  metadata: {
    destination: "Similan Islands",
    duration: "Full day (8 hours)",
  },
  createdAt: "2026-01-01T08:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  pricingSummary: {
    currency: "THB",
    basePrice: 3500,
    discountedPrice: 3100,
    taxRate: 7,
    validFrom: null,
    validTo: null,
  },
  availabilitySummary: {
    availableDateCount: 15,
    unavailableDateCount: 1,
    totalCapacity: 25,
    bookedCount: 10,
  },
};

const MOCK_PAGINATION = {
  page: 1,
  limit: 10,
  total: 462,
  totalPages: 47,
};

describe("AdminToursView component", () => {
  const mockRefetch = vi.fn();
  const mockUpdateStatus = vi.fn();
  const mockBulkUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateStatus.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { ...MOCK_TOUR, status: "UNPUBLISHED" },
      }),
    });

    mockBulkUpdateStatus.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          updatedCount: 1,
          requestedCount: 1,
          updatedIds: ["tour-101"],
          notFoundIds: [],
          status: "DRAFT",
        },
      }),
    });

    vi.mocked(adminApiModule.useUpdateAdminServiceStatusMutation).mockReturnValue([
      mockUpdateStatus,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useUpdateAdminServiceStatusMutation>[1],
    ]);

    vi.mocked(adminApiModule.useBulkUpdateAdminServiceStatusMutation).mockReturnValue([
      mockBulkUpdateStatus,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useBulkUpdateAdminServiceStatusMutation>[1],
    ]);

    // Default mock implementation for useGetAdminServicesQuery
    vi.mocked(adminApiModule.useGetAdminServicesQuery).mockImplementation((params) => {
      const query = typeof params === "object" && params !== null ? (params as { limit?: number; status?: string }) : null;

      // Summary cards query mocks
      if (query?.limit === 1) {
        if (query?.status === "PUBLISHED") {
          return {
            data: { success: true, data: { items: [], pagination: { total: 320 } } },
            isLoading: false,
          } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
        }
        if (query?.status === "DRAFT") {
          return {
            data: { success: true, data: { items: [], pagination: { total: 85 } } },
            isLoading: false,
          } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
        }
        if (query?.status === "UNPUBLISHED") {
          return {
            data: { success: true, data: { items: [], pagination: { total: 57 } } },
            isLoading: false,
          } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
        }
        // Total query
        return {
          data: { success: true, data: { items: [], pagination: { total: 462 } } },
          isLoading: false,
        } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
      }

      // Main list table query mock
      return {
        data: {
          success: true,
          data: {
            items: [MOCK_TOUR],
            pagination: MOCK_PAGINATION,
          },
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: undefined,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
    });
  });

  it("renders page header, summary cards, table, and pagination", () => {
    render(<AdminToursView />);

    // Header
    expect(screen.getByRole("heading", { level: 1, name: "Tours Management" })).toBeInTheDocument();
    expect(screen.getByTestId("tours-total-count-badge")).toHaveTextContent("462 Tours");
    expect(screen.getByTestId("add-new-tour-button")).toBeInTheDocument();

    // Summary Cards with live backend totals
    expect(screen.getByTestId("summary-card-all")).toHaveTextContent("462");
    expect(screen.getByTestId("summary-card-published")).toHaveTextContent("320");
    expect(screen.getByTestId("summary-card-draft")).toHaveTextContent("85");
    expect(screen.getByTestId("summary-card-unpublished")).toHaveTextContent("57");

    // Table Row
    expect(screen.getByText("Similan Islands Snorkeling Day Trip")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands")).toBeInTheDocument();
    expect(screen.getByText("Blue Ocean Marine")).toBeInTheDocument();
    expect(screen.getByText("THB 3,500")).toBeInTheDocument();
    expect(screen.getByText("15 dates open")).toBeInTheDocument();

    // Pagination
    expect(screen.getByTestId("tours-pagination")).toBeInTheDocument();
    expect(screen.getByText("1–10")).toBeInTheDocument();
  });

  it("renders table skeleton during initial load", () => {
    vi.mocked(adminApiModule.useGetAdminServicesQuery).mockImplementation((params) => {
      const query = typeof params === "object" && params !== null ? (params as { limit?: number }) : null;
      if (query?.limit === 1) {
        return { data: undefined, isLoading: true } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
      }
      return {
        data: undefined,
        isLoading: true,
        isFetching: false,
        isError: false,
      } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
    });

    render(<AdminToursView />);
    expect(screen.getByTestId("tours-table-skeleton")).toBeInTheDocument();
  });

  it("renders error state with retry action on failure", () => {
    vi.mocked(adminApiModule.useGetAdminServicesQuery).mockImplementation((params) => {
      const query = typeof params === "object" && params !== null ? (params as { limit?: number }) : null;
      if (query?.limit === 1) {
        return { data: undefined, isLoading: false } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
      }
      return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: { data: { message: "Internal server error connecting to services" } },
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
    });

    render(<AdminToursView />);
    expect(screen.getByTestId("tours-error-state")).toBeInTheDocument();
    expect(screen.getByText("Internal server error connecting to services")).toBeInTheDocument();

    const retryBtn = screen.getByTestId("tours-retry-button");
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when no tours match", () => {
    vi.mocked(adminApiModule.useGetAdminServicesQuery).mockImplementation((params) => {
      const query = typeof params === "object" && params !== null ? (params as { limit?: number }) : null;
      if (query?.limit === 1) {
        return { data: undefined, isLoading: false } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
      }
      return {
        data: { success: true, data: { items: [], pagination: { total: 0, totalPages: 0 } } },
        isLoading: false,
        isFetching: false,
        isError: false,
      } as unknown as ReturnType<typeof adminApiModule.useGetAdminServicesQuery>;
    });

    render(<AdminToursView />);
    expect(screen.getByTestId("tours-empty-db-state")).toBeInTheDocument();
    expect(screen.getByText("No tour listings created yet")).toBeInTheDocument();
  });

  it("opens details modal and displays tour metadata", () => {
    render(<AdminToursView />);

    const tourLink = screen.getByText("Similan Islands Snorkeling Day Trip");
    fireEvent.click(tourLink);

    // Modal dialog title and details should be present
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pricing Configuration")).toBeInTheDocument();
    expect(screen.getByText("Availability Schedule")).toBeInTheDocument();
  });

  it("handles bulk selection and triggers confirmation modal", async () => {
    render(<AdminToursView />);

    // Select the tour row
    const checkbox = screen.getByTestId("select-tour-checkbox-tour-101");
    fireEvent.click(checkbox);

    // Bulk action bar should become visible
    expect(screen.getByTestId("bulk-action-bar")).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    // Click Move to Draft in Bulk Bar
    const bulkDraftBtn = screen.getByTestId("bulk-draft-button");
    fireEvent.click(bulkDraftBtn);

    // Bulk Confirm Modal should open
    expect(screen.getByText("Confirm Bulk Status Update")).toBeInTheDocument();

    // Click Confirm & Apply in Dialog
    const confirmBtn = screen.getByTestId("confirm-bulk-status-button");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockBulkUpdateStatus).toHaveBeenCalledWith({
        serviceIds: ["tour-101"],
        status: "DRAFT",
      });
    });
  });

  it("opens tour creation modal when Add New Tour button is clicked", () => {
    render(<AdminToursView />);

    const addBtn = screen.getByTestId("add-new-tour-button");
    fireEvent.click(addBtn);

    expect(screen.getByText("Create New Tour Package")).toBeInTheDocument();
    expect(screen.getByText(/Dedicated Tour Builder — Scheduled for Phase Admin-2D/i)).toBeInTheDocument();
  });
});
