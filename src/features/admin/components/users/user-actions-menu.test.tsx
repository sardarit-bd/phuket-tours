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

  it("shows Manage Permissions button for staff users when canManagePermissions is true", () => {
    const mockManagePermissions = vi.fn();
    render(
      <UserActionsMenu
        user={MOCK_OTHER_USER} // role is 'staff'
        currentUserId="usr-admin-me"
        canManagePermissions={true}
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
        onManagePermissions={mockManagePermissions}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-other-1");
    fireEvent.click(trigger);

    const manageBtn = screen.getByTestId("action-manage-permissions-usr-other-1");
    expect(manageBtn).toBeInTheDocument();
    expect(manageBtn).toHaveTextContent("Manage Permissions");

    fireEvent.click(manageBtn);
    expect(mockManagePermissions).toHaveBeenCalledWith(MOCK_OTHER_USER);
  });

  it("does not show Manage Permissions button for non-staff users", () => {
    const mockManagePermissions = vi.fn();
    render(
      <UserActionsMenu
        user={MOCK_SELF_ADMIN} // role is 'admin'
        currentUserId="usr-other-1"
        canManagePermissions={true}
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
        onManagePermissions={mockManagePermissions}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-admin-me");
    fireEvent.click(trigger);

    expect(screen.queryByTestId("action-manage-permissions-usr-admin-me")).not.toBeInTheDocument();
  });

  it("hides Edit Account and Deactivate Account when permissions are denied", () => {
    render(
      <UserActionsMenu
        user={MOCK_OTHER_USER}
        currentUserId="usr-admin-me"
        canEditUser={false}
        canToggleStatus={false}
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-other-1");
    fireEvent.click(trigger);

    expect(screen.getByTestId("action-view-user-usr-other-1")).toBeInTheDocument();
    expect(screen.queryByTestId("action-edit-user-usr-other-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-user-usr-other-1")).not.toBeInTheDocument();
  });

  it("shows Delete User and calls onDeleteUser", () => {
    const mockDelete = vi.fn();
    render(
      <UserActionsMenu
        user={MOCK_OTHER_USER}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
        onDeleteUser={mockDelete}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-other-1");
    fireEvent.click(trigger);

    const deleteBtn = screen.getByTestId("action-delete-user-usr-other-1");
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toHaveTextContent("Delete User");

    fireEvent.click(deleteBtn);
    expect(mockDelete).toHaveBeenCalledWith(MOCK_OTHER_USER);
  });

  it("blocks self-deletion when target is current user", () => {
    const mockDelete = vi.fn();
    render(
      <UserActionsMenu
        user={MOCK_SELF_ADMIN}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
        onDeleteUser={mockDelete}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-admin-me");
    fireEvent.click(trigger);

    expect(screen.getByTestId("action-self-delete-blocked-usr-admin-me")).toBeInTheDocument();
    expect(screen.getByText("Cannot delete self")).toBeInTheDocument();
    expect(screen.queryByTestId("action-delete-user-usr-admin-me")).not.toBeInTheDocument();
  });

  it("shows Resend Invitation when user invitation is pending", () => {
    const mockResend = vi.fn();
    const pendingUser: AdminUserRecord = {
      ...MOCK_OTHER_USER,
      invitationStatus: "pending",
      canResendInvitation: true,
    };

    render(
      <UserActionsMenu
        user={pendingUser}
        currentUserId="usr-admin-me"
        onViewDetails={mockView}
        onEditUser={mockEdit}
        onToggleStatus={mockToggleStatus}
        onResendInvitation={mockResend}
      />
    );

    const trigger = screen.getByTestId("user-actions-trigger-usr-other-1");
    fireEvent.click(trigger);

    const resendBtn = screen.getByTestId("action-resend-invitation-usr-other-1");
    expect(resendBtn).toBeInTheDocument();
    expect(resendBtn).toHaveTextContent("Resend Invitation");

    fireEvent.click(resendBtn);
    expect(mockResend).toHaveBeenCalledWith(pendingUser);
  });
});
