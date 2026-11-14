import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserSettingsPage from "./page";
import { useGetMeQuery } from "@/features/auth/api/auth-api";
import { useUpdateProfileMutation } from "@/features/customer/api/customer-api";

vi.mock("@/features/auth/api/auth-api", () => ({
  useGetMeQuery: vi.fn(),
  useGetAvatarSignatureMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useConfirmAvatarMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useRemoveAvatarMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateEmailMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("@/features/customer/api/customer-api", () => ({
  useUpdateProfileMutation: vi.fn(),
}));

const mockUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockUseUpdateProfileMutation = vi.mocked(useUpdateProfileMutation);
const mockUpdate = vi.fn();

function setProfile() {
  mockUseGetMeQuery.mockReturnValue({
    data: {
      success: true,
      message: "ok",
      data: {
        id: "c-1",
        name: "Carol Customer",
        email: "carol@example.com",
        phone: "+66 90 000 000",
        role: "customer",
        status: "active",
        createdAt: "2026-02-01T00:00:00.000Z",
      },
    },
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useGetMeQuery>);
}

describe("Customer UserSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setProfile();
    mockUseUpdateProfileMutation.mockReturnValue([
      mockUpdate,
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useUpdateProfileMutation>);
  });

  it("opens in view mode by default with read-only text", () => {
    render(<UserSettingsPage />);

    expect(screen.getByTestId("customer-settings-page")).toBeInTheDocument();
    expect(screen.getByTestId("customer-settings-edit-btn")).toBeInTheDocument();
    expect(screen.getByTestId("customer-settings-name-view")).toHaveTextContent(
      "Carol Customer"
    );
    expect(screen.getByTestId("customer-settings-email-view")).toHaveTextContent(
      "carol@example.com"
    );
    expect(screen.getByTestId("customer-settings-role-view")).toHaveTextContent(
      "Customer"
    );
    expect(screen.queryByTestId("customer-settings-name-input")).not.toBeInTheDocument();
  });

  it("switches into edit mode and keeps email read-only", () => {
    render(<UserSettingsPage />);

    fireEvent.click(screen.getByTestId("customer-settings-edit-btn"));

    expect(screen.getByTestId("customer-settings-name-input")).toHaveValue(
      "Carol Customer"
    );
    expect(screen.getByTestId("customer-settings-phone-input")).toHaveValue(
      "+66 90 000 000"
    );
    expect(screen.getByTestId("customer-settings-email-view")).toHaveTextContent(
      "carol@example.com"
    );
  });

  it("saves via the update profile endpoint and returns to view mode", async () => {
    mockUpdate.mockReturnValue({
      unwrap: async () => ({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: "c-1",
          name: "Carol Updated",
          email: "carol@example.com",
          phone: "+66 90 000 000",
          role: "customer",
          status: "active",
          createdAt: "2026-02-01T00:00:00.000Z",
        },
      }),
    });
    render(<UserSettingsPage />);

    fireEvent.click(screen.getByTestId("customer-settings-edit-btn"));
    fireEvent.change(screen.getByTestId("customer-settings-name-input"), {
      target: { value: "Carol Updated" },
    });
    fireEvent.click(screen.getByTestId("customer-settings-save-btn"));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Carol Updated",
        phone: "+66 90 000 000",
      })
    );
    await waitFor(() =>
      expect(screen.getByTestId("customer-settings-edit-btn")).toBeInTheDocument()
    );
    expect(screen.getByTestId("customer-settings-saved")).toBeInTheDocument();
  });

  it("disables Save until a change is tracked", () => {
    render(<UserSettingsPage />);

    fireEvent.click(screen.getByTestId("customer-settings-edit-btn"));
    expect(screen.getByTestId("customer-settings-save-btn")).toBeDisabled();

    fireEvent.change(screen.getByTestId("customer-settings-phone-input"), {
      target: { value: "+66 77 777 777" },
    });
    expect(screen.getByTestId("customer-settings-save-btn")).not.toBeDisabled();
  });

  it("cancel restores original values", () => {
    render(<UserSettingsPage />);

    fireEvent.click(screen.getByTestId("customer-settings-edit-btn"));
    fireEvent.change(screen.getByTestId("customer-settings-name-input"), {
      target: { value: "Discarded" },
    });
    fireEvent.click(screen.getByTestId("customer-settings-cancel-btn"));

    expect(screen.getByTestId("customer-settings-name-view")).toHaveTextContent(
      "Carol Customer"
    );
  });
});
