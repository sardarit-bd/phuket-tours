import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "./reset-password-form";

const mockPush = vi.fn();
let mockSearchToken: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? mockSearchToken : null),
  }),
}));

const mockValidateQuery = vi.fn();
const mockForgotPasswordMutation = vi.fn();
const mockResetPasswordMutation = vi.fn();

vi.mock("@/features/auth/api/auth-api", () => ({
  useValidateResetTokenQuery: (token: string, options: unknown) =>
    mockValidateQuery(token, options),
  useForgotPasswordMutation: () => [
    mockForgotPasswordMutation,
    { isLoading: false },
  ],
  useResetPasswordMutation: () => [
    mockResetPasswordMutation,
    { isLoading: false },
  ],
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchToken = null;
    mockValidateQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    mockForgotPasswordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Password reset email sent if an account exists.",
      }),
    });
    mockResetPasswordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Password reset successfully.",
      }),
    });
  });

  describe("Request Password Reset (No Token)", () => {
    it("renders email request form when no token is present in URL", () => {
      mockSearchToken = null;
      render(<ResetPasswordForm />);

      expect(screen.getByLabelText("Account Email Address")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
    });

    it("displays validation error when submitting an empty email", async () => {
      mockSearchToken = null;
      render(<ResetPasswordForm />);

      fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

      await waitFor(() => {
        expect(screen.getByText("Email address is required.")).toBeInTheDocument();
      });
      expect(mockForgotPasswordMutation).not.toHaveBeenCalled();
    });

    it("submits forgot password request and shows check email confirmation screen", async () => {
      mockSearchToken = null;
      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText("Account Email Address"), {
        target: { value: "traveler@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

      await waitFor(() => {
        expect(mockForgotPasswordMutation).toHaveBeenCalledWith({
          email: "traveler@example.com",
        });
        expect(screen.getByText("Check Your Email")).toBeInTheDocument();
        expect(screen.getByText("traveler@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("Reset Password with Token", () => {
    beforeEach(() => {
      mockSearchToken = "reset-token-xyz";
    });

    it("renders loading state while token validation is in progress", () => {
      mockValidateQuery.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      });

      render(<ResetPasswordForm />);

      expect(
        screen.getByText(/Verifying password reset credentials/i)
      ).toBeInTheDocument();
    });

    it("renders invalid or expired token message when validation fails", () => {
      mockValidateQuery.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
      });

      render(<ResetPasswordForm />);

      expect(screen.getByText("Reset Link Expired or Invalid")).toBeInTheDocument();
      expect(screen.getByText("Request a New Reset Link")).toBeInTheDocument();
      expect(screen.getByText("Back to Sign In")).toBeInTheDocument();
    });

    it("renders new password inputs when token is valid", () => {
      mockValidateQuery.mockReturnValue({
        data: {
          success: true,
          data: {
            valid: true,
            user: {
              name: "Jane Doe",
              email: "jane@example.com",
              role: "agent",
            },
          },
        },
        isLoading: false,
        isError: false,
      });

      render(<ResetPasswordForm />);

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    });

    it("shows error when password is less than 6 characters", async () => {
      mockValidateQuery.mockReturnValue({
        data: {
          success: true,
          data: {
            valid: true,
            user: { name: "Jane Doe", email: "jane@example.com", role: "agent" },
          },
        },
        isLoading: false,
        isError: false,
      });

      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "12345" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "12345" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
      });
      expect(mockResetPasswordMutation).not.toHaveBeenCalled();
    });

    it("shows error when passwords do not match", async () => {
      mockValidateQuery.mockReturnValue({
        data: {
          success: true,
          data: {
            valid: true,
            user: { name: "Jane Doe", email: "jane@example.com", role: "agent" },
          },
        },
        isLoading: false,
        isError: false,
      });

      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "secret123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "different123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      });
      expect(mockResetPasswordMutation).not.toHaveBeenCalled();
    });

    it("submits new password and displays success screen on success", async () => {
      mockValidateQuery.mockReturnValue({
        data: {
          success: true,
          data: {
            valid: true,
            user: { name: "Jane Doe", email: "jane@example.com", role: "agent" },
          },
        },
        isLoading: false,
        isError: false,
      });

      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "newPassword123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), {
        target: { value: "newPassword123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(mockResetPasswordMutation).toHaveBeenCalledWith({
          token: "reset-token-xyz",
          password: "newPassword123",
        });
        expect(screen.getByText("Password Reset Complete!")).toBeInTheDocument();
      });
    });
  });
});
