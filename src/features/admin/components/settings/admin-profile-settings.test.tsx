import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminProfileSettings } from "./admin-profile-settings";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "@/features/auth/api/auth-api";

vi.mock("@/features/auth/api/auth-api", () => ({
  useGetMeQuery: vi.fn(),
  useUpdateProfileMutation: vi.fn(),
}));

const mockUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockUseUpdateProfileMutation = vi.mocked(useUpdateProfileMutation);

const mockUpdate = vi.fn();

function setProfile(role: "admin" | "staff" = "admin") {
  mockUseGetMeQuery.mockReturnValue({
    data: {
      success: true,
      message: "ok",
      data: {
        id: "u-1",
        name: role === "admin" ? "Ada Admin" : "Stan Staff",
        email: `${role}@phukettours.com`,
        phone: "+66 76 000 000",
        role,
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    },
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useGetMeQuery>);
}

describe("AdminProfileSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setProfile("admin");
    mockUseUpdateProfileMutation.mockReturnValue([
      mockUpdate,
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useUpdateProfileMutation>);
  });

  it("opens in view mode with restricted fields read-only", () => {
    render(<AdminProfileSettings />);

    expect(screen.getByTestId("admin-profile-settings-edit-btn")).toBeInTheDocument();
    expect(screen.getByTestId("admin-profile-settings-name-view")).toHaveTextContent(
      "Ada Admin"
    );
    expect(screen.getByTestId("admin-profile-settings-email-view")).toHaveTextContent(
      "admin@phukettours.com"
    );
    expect(screen.getByTestId("admin-profile-settings-role-view")).toHaveTextContent(
      "Administrator"
    );
    expect(screen.getByTestId("admin-profile-settings-status-view")).toHaveTextContent(
      "active"
    );
    expect(screen.queryByTestId("admin-profile-settings-name-input")).not.toBeInTheDocument();
  });

  it("derives the Staff role label for staff accounts", () => {
    setProfile("staff");
    render(<AdminProfileSettings />);

    expect(screen.getByTestId("admin-profile-settings-role-view")).toHaveTextContent(
      "Staff"
    );
    expect(screen.getByTestId("admin-profile-settings-name-view")).toHaveTextContent(
      "Stan Staff"
    );
  });

  it("saves name and phone via /users/me and returns to view mode", async () => {
    mockUpdate.mockReturnValue({
      unwrap: async () => ({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: "u-1",
          name: "Ada Updated",
          email: "admin@phukettours.com",
          phone: "+66 76 000 000",
          role: "admin",
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });
    render(<AdminProfileSettings />);

    fireEvent.click(screen.getByTestId("admin-profile-settings-edit-btn"));
    fireEvent.change(screen.getByTestId("admin-profile-settings-name-input"), {
      target: { value: "Ada Updated" },
    });
    fireEvent.click(screen.getByTestId("admin-profile-settings-save-btn"));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Ada Updated",
        phone: "+66 76 000 000",
      })
    );
    await waitFor(() =>
      expect(
        screen.getByTestId("admin-profile-settings-edit-btn")
      ).toBeInTheDocument()
    );
    expect(screen.getByTestId("admin-profile-settings-saved")).toBeInTheDocument();
  });

  it("disables Save until a change is made", () => {
    render(<AdminProfileSettings />);

    fireEvent.click(screen.getByTestId("admin-profile-settings-edit-btn"));
    expect(screen.getByTestId("admin-profile-settings-save-btn")).toBeDisabled();

    fireEvent.change(screen.getByTestId("admin-profile-settings-phone-input"), {
      target: { value: "+66 99 999 999" },
    });
    expect(screen.getByTestId("admin-profile-settings-save-btn")).not.toBeDisabled();
  });

  it("cancels edits and restores the original values", () => {
    render(<AdminProfileSettings />);

    fireEvent.click(screen.getByTestId("admin-profile-settings-edit-btn"));
    fireEvent.change(screen.getByTestId("admin-profile-settings-name-input"), {
      target: { value: "Nope" },
    });
    fireEvent.click(screen.getByTestId("admin-profile-settings-cancel-btn"));

    expect(screen.getByTestId("admin-profile-settings-name-view")).toHaveTextContent(
      "Ada Admin"
    );
  });
});
