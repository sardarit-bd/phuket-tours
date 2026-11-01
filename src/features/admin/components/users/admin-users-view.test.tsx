import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminUsersView } from "./admin-users-view";
import type { AdminUserRecord } from "../../types/admin-users";

const MOCK_USERS_LIST: AdminUserRecord[] = [
  {
    id: "usr-admin-1",
    name: "Admin Alice",
    email: "alice@phukettours.com",
    phone: "+66 81 111 2222",
    role: "admin",
    status: "active",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    agentProfile: null,
  },
  {
    id: "usr-agent-2",
    name: "Agent Bob",
    email: "bob@agency.com",
    phone: "+66 82 222 3333",
    role: "agent",
    status: "active",
    createdAt: "2026-10-05T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
    agentProfile: { agencyName: "Bob's Tours" },
  },
  {
    id: "usr-staff-3",
    name: "Staff Charlie",
    email: "charlie@phukettours.com",
    phone: "+66 83 333 4444",
    role: "staff",
    status: "deactivated",
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
    agentProfile: null,
  },
];

const mockRefetch = vi.fn();

// Mock store hooks
vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(() => {
    // Return mock logged-in admin user
    return {
      id: "usr-admin-1",
      email: "alice@phukettours.com",
      role: "admin",
      name: "Admin Alice",
    };
  }),
}));

// Mock RTK Query hooks
vi.mock("../../api/admin-api", () => ({
  useGetAdminUsersQuery: vi.fn((params) => {
    // Return different mock counts based on params if needed
    if (params?.role === "customer") {
      return { data: { data: { pagination: { total: 10 } } }, isLoading: false };
    }
    if (params?.role === "agent") {
      return { data: { data: { pagination: { total: 5 } } }, isLoading: false };
    }
    if (params?.role === "staff") {
      return { data: { data: { pagination: { total: 4 } } }, isLoading: false };
    }
    if (params?.status === "active") {
      return { data: { data: { pagination: { total: 17 } } }, isLoading: false };
    }
    if (params?.status === "deactivated") {
      return { data: { data: { pagination: { total: 2 } } }, isLoading: false };
    }

    // Default query
    return {
      data: {
        data: {
          items: MOCK_USERS_LIST,
          pagination: {
            page: 1,
            limit: 10,
            total: 19,
            totalPages: 2,
          },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    };
  }),
  useGetAdminUserByIdQuery: vi.fn(() => ({
    data: { data: MOCK_USERS_LIST[0] },
    isLoading: false,
  })),
  useGetAdminAgentByIdQuery: vi.fn(() => ({
    data: { data: { agentProfile: { agencyName: "Bob's Tours" } } },
    isLoading: false,
  })),
  useUpdateAdminUserMutation: vi.fn(() => [
    vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
    { isLoading: false },
  ]),
  useUpdateAdminAgentMutation: vi.fn(() => [
    vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
    { isLoading: false },
  ]),
  useCreateAdminStaffMutation: vi.fn(() => [
    vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
    { isLoading: false },
  ]),
  useCreateAdminAgentMutation: vi.fn(() => [
    vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) }),
    { isLoading: false },
  ]),
}));

describe("AdminUsersView orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, real metrics cards, toolbar, and user table", () => {
    render(<AdminUsersView />);

    expect(screen.getByTestId("admin-users-container")).toBeInTheDocument();
    expect(screen.getByText("Users Management")).toBeInTheDocument();
    expect(screen.getByTestId("invite-user-btn")).toBeInTheDocument();

    // Summary cards
    expect(screen.getByTestId("summary-total-users")).toBeInTheDocument();
    expect(screen.getByTestId("summary-customers")).toBeInTheDocument();
    expect(screen.getByTestId("summary-agents")).toBeInTheDocument();
    expect(screen.getByTestId("summary-staff")).toBeInTheDocument();
    expect(screen.getByTestId("summary-deactivated")).toBeInTheDocument();

    // Toolbar
    expect(screen.getByTestId("users-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("users-role-filter")).toBeInTheDocument();
    expect(screen.getByTestId("users-status-filter")).toBeInTheDocument();

    // Table rows
    expect(screen.getByText("Admin Alice")).toBeInTheDocument();
    expect(screen.getByText("Agent Bob")).toBeInTheDocument();
    expect(screen.getByText("Staff Charlie")).toBeInTheDocument();

    // Current user "You" indicator
    expect(screen.getByText("You")).toBeInTheDocument();

    // Pagination
    expect(screen.getByTestId("users-pagination")).toBeInTheDocument();
  });

  it("opens invite user dialog when clicking Invite User button", () => {
    render(<AdminUsersView />);

    const inviteBtn = screen.getByTestId("invite-user-btn");
    fireEvent.click(inviteBtn);

    expect(screen.getByTestId("invite-user-form")).toBeInTheDocument();
  });

  it("triggers refetch when clicking Refresh button", () => {
    render(<AdminUsersView />);

    const refreshBtn = screen.getByTestId("refresh-users-btn");
    fireEvent.click(refreshBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
