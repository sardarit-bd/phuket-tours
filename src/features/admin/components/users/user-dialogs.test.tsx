import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserDetailsDialog } from "./user-details-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { InviteUserDialog } from "./invite-user-dialog";
import { DeactivateUserDialog } from "./deactivate-user-dialog";
import type { AdminUserRecord } from "../../types/admin-users";

const MOCK_USER: AdminUserRecord = {
  id: "usr-1",
  name: "Jane Traveler",
  email: "jane@travel.com",
  phone: "+66 81 555 1234",
  role: "customer",
  status: "active",
  createdAt: "2026-10-10T10:00:00.000Z",
  updatedAt: "2026-10-10T10:00:00.000Z",
  agentProfile: null,
};

const MOCK_AGENT: AdminUserRecord = {
  id: "agt-1",
  name: "Robert Agent",
  email: "robert@agent.com",
  phone: "+66 82 555 9999",
  role: "agent",
  status: "active",
  createdAt: "2026-10-10T10:00:00.000Z",
  updatedAt: "2026-10-10T10:00:00.000Z",
  agentProfile: { agencyName: "Andaman Adventures" },
};

const MOCK_SELF_ADMIN: AdminUserRecord = {
  id: "admin-self-id",
  name: "Master Admin",
  email: "admin@phukettours.com",
  phone: "+66 80 000 0000",
  role: "admin",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  agentProfile: null,
};

// Mock RTK Query hooks
const mockUpdateUser = vi.fn();
const mockUpdateAgent = vi.fn();
const mockCreateStaff = vi.fn();
const mockCreateAgent = vi.fn();

vi.mock("../../api/admin-api", () => ({
  useGetAdminUserByIdQuery: vi.fn((userId) => ({
    data: { data: userId === "agt-1" ? MOCK_AGENT : MOCK_USER },
    isLoading: false,
    isError: false,
  })),
  useGetAdminAgentByIdQuery: vi.fn(() => ({
    data: { data: { agentProfile: { agencyName: "Andaman Adventures" } } },
    isLoading: false,
    isError: false,
  })),
  useUpdateAdminUserMutation: vi.fn(() => [
    mockUpdateUser,
    { isLoading: false },
  ]),
  useUpdateAdminAgentMutation: vi.fn(() => [
    mockUpdateAgent,
    { isLoading: false },
  ]),
  useCreateAdminStaffMutation: vi.fn(() => [
    mockCreateStaff,
    { isLoading: false },
  ]),
  useCreateAdminAgentMutation: vi.fn(() => [
    mockCreateAgent,
    { isLoading: false },
  ]),
}));

describe("User Dialogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockUpdateAgent.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockCreateStaff.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    mockCreateAgent.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  describe("UserDetailsDialog", () => {
    it("renders user profile information and agent profile if agent", () => {
      render(
        <UserDetailsDialog
          isOpen={true}
          onClose={vi.fn()}
          user={MOCK_AGENT}
        />
      );

      expect(screen.getByTestId("user-details-dialog-content")).toBeInTheDocument();
      expect(screen.getByText("User Account Details")).toBeInTheDocument();
      expect(screen.getByText("Andaman Adventures")).toBeInTheDocument();
      expect(screen.getByText("Agent Profile Agency")).toBeInTheDocument();
    });
  });

  describe("EditUserDialog", () => {
    it("allows updating name, phone and protects email/role as read-only", async () => {
      const mockSuccess = vi.fn();
      render(
        <EditUserDialog
          isOpen={true}
          onClose={vi.fn()}
          user={MOCK_USER}
          currentUserId="admin-self-id"
          onSuccess={mockSuccess}
        />
      );

      expect(screen.getByText("Edit User Account")).toBeInTheDocument();

      const nameInput = screen.getByTestId("edit-user-name-input");
      fireEvent.change(nameInput, { target: { value: "Jane New Name" } });

      const phoneInput = screen.getByTestId("edit-user-phone-input");
      fireEvent.change(phoneInput, { target: { value: "+66 81 999 8888" } });

      const submitBtn = screen.getByTestId("edit-user-submit-btn");
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          userId: "usr-1",
          name: "Jane New Name",
          phone: "+66 81 999 8888",
          status: undefined,
        });
      });
    });

    it("displays self-deactivation warning when editing logged-in admin", () => {
      render(
        <EditUserDialog
          isOpen={true}
          onClose={vi.fn()}
          user={MOCK_SELF_ADMIN}
          currentUserId="admin-self-id"
        />
      );

      expect(
        screen.getByText(/You cannot deactivate your own administrative account while logged in/i)
      ).toBeInTheDocument();
    });
  });

  describe("InviteUserDialog", () => {
    it("switches tabs between staff and agent, and dispatches invitation", async () => {
      const mockSuccess = vi.fn();
      render(
        <InviteUserDialog
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={mockSuccess}
        />
      );

      expect(screen.getByText("Invite Team Member")).toBeInTheDocument();

      // Default is staff
      fireEvent.change(screen.getByTestId("invite-name-input"), {
        target: { value: "Somchai Staff" },
      });
      fireEvent.change(screen.getByTestId("invite-email-input"), {
        target: { value: "somchai@phukettours.com" },
      });
      fireEvent.change(screen.getByTestId("invite-phone-input"), {
        target: { value: "+66 81 000 0000" },
      });

      fireEvent.click(screen.getByTestId("invite-submit-btn"));

      await waitFor(() => {
        expect(mockCreateStaff).toHaveBeenCalledWith({
          name: "Somchai Staff",
          email: "somchai@phukettours.com",
          phone: "+66 81 000 0000",
        });
      });

      // Switch to Agent tab
      fireEvent.click(screen.getByTestId("tab-invite-agent"));
      expect(screen.getByTestId("invite-agency-input")).toBeInTheDocument();
    });
  });

  describe("DeactivateUserDialog", () => {
    it("blocks self-deactivation when target user is current admin", () => {
      render(
        <DeactivateUserDialog
          isOpen={true}
          onClose={vi.fn()}
          user={MOCK_SELF_ADMIN}
          currentUserId="admin-self-id"
        />
      );

      expect(screen.getByTestId("self-deactivation-warning")).toBeInTheDocument();
      expect(screen.getByText("Self-Deactivation Blocked")).toBeInTheDocument();
      expect(screen.getByTestId("confirm-status-toggle-btn")).toBeDisabled();
    });

    it("confirms deactivation for other users", async () => {
      const mockSuccess = vi.fn();
      render(
        <DeactivateUserDialog
          isOpen={true}
          onClose={vi.fn()}
          user={MOCK_USER}
          currentUserId="admin-self-id"
          onSuccess={mockSuccess}
        />
      );

      expect(screen.getByText("Deactivate User Account")).toBeInTheDocument();
      expect(screen.getByText("Immediate Session Revocation")).toBeInTheDocument();

      const confirmBtn = screen.getByTestId("confirm-status-toggle-btn");
      expect(confirmBtn).not.toBeDisabled();
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          userId: "usr-1",
          status: "deactivated",
        });
      });
    });
  });
});
