import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { AdminUserRecord } from "../../types/admin-users";

const mockDeleteMutation = vi.fn();

vi.mock("../../api/admin-api", () => ({
  useDeleteAdminUserMutation: () => [mockDeleteMutation, { isLoading: false }],
}));

const mockUser: AdminUserRecord = {
  id: "usr-target-1",
  name: "Bob Staff",
  email: "bob.staff@phukettours.com",
  phone: "+66 81 234 5678",
  role: "staff",
  status: "active",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  agentProfile: null,
};

describe("DeleteUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true, message: "User deleted successfully" }),
    });
  });

  it("renders user information and safety warnings", () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByTestId("delete-user-modal")).toBeInTheDocument();
    expect(screen.getByText("Bob Staff")).toBeInTheDocument();
    expect(screen.getByText("bob.staff@phukettours.com")).toBeInTheDocument();
    expect(screen.getByText(/Archive & Soft-Deletion Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical bookings, payments, and commission records will remain preserved/i)).toBeInTheDocument();
  });

  it("disables deletion when the user attempts self-deletion", () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        currentUserId="usr-target-1"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Self-Deletion Blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/Deleting your own account is forbidden/i)).toBeInTheDocument();
    const deleteBtn = screen.getByTestId("confirm-delete-user-btn");
    expect(deleteBtn).toBeDisabled();
  });

  it("calls onClose when cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <DeleteUserDialog
        user={mockUser}
        currentUserId="usr-admin-current"
        isOpen={true}
        onClose={handleClose}
        onSuccess={vi.fn()}
      />
    );

    const cancelBtn = screen.getByTestId("cancel-delete-user-btn");
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("submits delete mutation when confirm button is clicked", async () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        currentUserId="usr-admin-current"
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const confirmBtn = screen.getByTestId("confirm-delete-user-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith("usr-target-1");
    });
  });
});
