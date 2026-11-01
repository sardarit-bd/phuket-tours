import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsersTable } from "./users-table";
import type { AdminUserRecord } from "../../types/admin-users";

const MOCK_USERS: AdminUserRecord[] = [
  {
    id: "usr-admin-1",
    name: "Admin User",
    email: "admin@phukettours.com",
    phone: "+66 81 111 2222",
    role: "admin",
    status: "active",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    agentProfile: null,
  },
  {
    id: "usr-agent-2",
    name: "Agent Robert",
    email: "robert@globaltravel.com",
    phone: "+66 82 222 3333",
    role: "agent",
    status: "deactivated",
    createdAt: "2026-10-15T00:00:00.000Z",
    updatedAt: "2026-10-15T00:00:00.000Z",
    agentProfile: { agencyName: "Global Travel Co." },
  },
  {
    id: "usr-cust-3",
    name: "Customer Jane",
    email: "jane@gmail.com",
    phone: null,
    role: "customer",
    status: "active",
    createdAt: "2026-10-20T00:00:00.000Z",
    updatedAt: "2026-10-20T00:00:00.000Z",
    agentProfile: null,
  },
];

describe("UsersTable component", () => {
  const mockHandlers = {
    onRetry: vi.fn(),
    onResetFilters: vi.fn(),
    onInviteUser: vi.fn(),
    onViewDetails: vi.fn(),
    onEditUser: vi.fn(),
    onToggleStatus: vi.fn(),
  };

  it("renders table with user list, role badges, and status badges", () => {
    render(
      <UsersTable
        users={MOCK_USERS}
        currentUserId="usr-admin-1"
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId("users-table-container")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Agent Robert")).toBeInTheDocument();
    expect(screen.getByText("Customer Jane")).toBeInTheDocument();

    // Badges
    expect(screen.getByTestId("user-role-badge-admin")).toBeInTheDocument();
    expect(screen.getByTestId("user-role-badge-agent")).toBeInTheDocument();
    expect(screen.getByTestId("user-role-badge-customer")).toBeInTheDocument();

    expect(screen.getAllByTestId("user-status-badge-active")).toHaveLength(2);
    expect(screen.getByTestId("user-status-badge-deactivated")).toBeInTheDocument();

    // Self indicator "You" badge
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <UsersTable
        users={[]}
        isLoading={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId("users-table-skeleton")).toBeInTheDocument();
  });

  it("renders error state with retry button when isError is true", () => {
    render(
      <UsersTable
        users={[]}
        isError={true}
        errorMessage="Network failure"
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId("users-error-state")).toBeInTheDocument();
    expect(screen.getByText("Network failure")).toBeInTheDocument();
  });

  it("renders empty state when users array is empty", () => {
    render(
      <UsersTable
        users={[]}
        isFiltered={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId("users-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No matching accounts found")).toBeInTheDocument();
  });
});
