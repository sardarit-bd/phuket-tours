import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SetupAccountForm } from "./setup-account-form";

const mockPush = vi.fn();
let mockSearchToken: string | null = "valid-token-123";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? mockSearchToken : null),
  }),
}));

const mockValidateQuery = vi.fn();
const mockSetupPasswordMutation = vi.fn();

vi.mock("@/features/auth/api/auth-api", () => ({
  useValidateInvitationQuery: (token: string, options: unknown) =>
    mockValidateQuery(token, options),
  useSetupPasswordMutation: () => [
    mockSetupPasswordMutation,
    { isLoading: false },
  ],
}));

describe("SetupAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchToken = "valid-token-123";
    mockValidateQuery.mockReturnValue({
      data: {
        success: true,
        data: {
          valid: true,
          user: {
            id: "usr-staff-1",
            name: "John Staff",
            email: "john.staff@phukettours.com",
            role: "staff",
          },
        },
      },
      isLoading: false,
      isError: false,
    });
    mockSetupPasswordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Password setup successfully",
      }),
    });
  });

  it("renders missing token error when no token is present in URL", () => {
    mockSearchToken = null;
    render(<SetupAccountForm />);

    expect(screen.getByText("Missing Invitation Link")).toBeInTheDocument();
    expect(screen.getByText("Return to Sign In")).toBeInTheDocument();
  });

  it("renders loading state while token validation is in progress", () => {
    mockValidateQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    render(<SetupAccountForm />);

    expect(
      screen.getByText(/Verifying your invitation credentials/i)
    ).toBeInTheDocument();
  });

  it("renders invalid or expired token message when validation fails", () => {
    mockValidateQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    render(<SetupAccountForm />);

    expect(screen.getByText("Invitation Expired or Invalid")).toBeInTheDocument();
    expect(screen.getByText("Go to Sign In")).toBeInTheDocument();
  });

  it("renders active form with invited user information when token is valid", () => {
    render(<SetupAccountForm />);

    expect(screen.getByText("John Staff")).toBeInTheDocument();
    expect(screen.getByText("john.staff@phukettours.com")).toBeInTheDocument();
    expect(screen.getByText("STAFF")).toBeInTheDocument();
    expect(screen.getByLabelText("Create Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("validates password length and matching confirmation", async () => {
    render(<SetupAccountForm />);

    const submitBtn = screen.getByRole("button", {
      name: /Activate & Complete Setup/i,
    });

    // Empty submission
    fireEvent.click(submitBtn);
    expect(await screen.findByText("Password is required.")).toBeInTheDocument();

    // Short password
    const passwordInput = screen.getByLabelText("Create Password");
    fireEvent.change(passwordInput, { target: { value: "123" } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText("Password must be at least 6 characters.")
    ).toBeInTheDocument();

    // Mismatched confirmation
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    const confirmInput = screen.getByLabelText("Confirm Password");
    fireEvent.change(confirmInput, { target: { value: "different123" } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText("Passwords do not match.")
    ).toBeInTheDocument();
  });

  it("submits password and shows success state", async () => {
    render(<SetupAccountForm />);

    const passwordInput = screen.getByLabelText("Create Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    const submitBtn = screen.getByRole("button", {
      name: /Activate & Complete Setup/i,
    });

    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmInput, { target: { value: "SecurePass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSetupPasswordMutation).toHaveBeenCalledWith({
        token: "valid-token-123",
        password: "SecurePass123!",
      });
      expect(screen.getByText("Staff Account Activated!")).toBeInTheDocument();
    });
  });
});
