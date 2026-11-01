import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserActionsMenu } from "./user-actions-menu";
import type { AdminUserRecord } from "../../types/admin-users";

const MOCK_OTHER_USER: AdminUserRecord = {
  id: "usr-other-1",
  name: "Other User",
  email: "other@phukettours.com",
  phone: "+66 81 222 3333",
  role: "staff",
  status: "active",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  agentProfile: null,
};

const MOCK_SELF_ADMIN: AdminUserRecord = {
  id: "usr-admin-me",
  name: "Logged In Admin",
  email: "me@phukettours.com",
  phone: "+66 81 999 8888",
  role: "admin",
  status: "active",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  agentProfile: null,
};

const MOCK_DEACTIVATED_USER: AdminUserRecord = {
  id: "usr-deactivated-1",
  name: "Deactivated Staff",
  email: "deactivated@phukettours.com",
  phone: null,
  role: "staff",
  status: "deactivated",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  agentProfile: null,
};

describe("UserActionsMenu component", () => {
  const mockView = vi.fn();
  const mockEdit = vi.fn();
  const mockToggleStatus = vi.fn();

  it("opens menu and calls onViewDetails and onEditUser", () => {
    render(
      <UserActionsMenu
        user={MOCK_OTHER_USER}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-other-1");
    fireEvent.click(trigger);

    expect(screen.getByTestId("action-view-user-usr-other-1")).toBeInTheDocument();
    expect(screen.getByTestId("action-edit-user-usr-other-1")).toBeInTheDocument();
    expect(screen.getByTestId("action-deactivate-user-usr-other-1")).toBeInTheDocument();

    // Click view details
    fireEvent.click(screen.getByTestId("action-view-user-usr-other-1"));
    expect(mockView).toHaveBeenCalledWith(MOCK_OTHER_USER);
  });

  it("shows Activate Account when user is currently deactivated", () => {
    render(
      <UserActionsMenu
        user={MOCK_DEACTIVATED_USER}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-deactivated-1");
    fireEvent.click(trigger);

    expect(screen.getByTestId("action-activate-user-usr-deactivated-1")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("action-activate-user-usr-deactivated-1"));
    expect(mockToggleStatus).toHaveBeenCalledWith(MOCK_DEACTIVATED_USER);
  });

  it("blocks self-deactivation when target user is current authenticated admin", () => {
    render(
      <UserActionsMenu
        user={MOCK_SELF_ADMIN}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-admin-me");
    fireEvent.click(trigger);

    // Should show blocked indicator instead of clickable deactivate button
    expect(screen.getByTestId("action-self-deactivate-blocked-usr-admin-me")).toBeInTheDocument();
    expect(screen.getByText("Cannot self-deactivate")).toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-user-usr-admin-me")).not.toBeInTheDocument();
  });
});
