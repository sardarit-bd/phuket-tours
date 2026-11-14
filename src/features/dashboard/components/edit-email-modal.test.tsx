import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { EditEmailModal } from "./edit-email-modal";
import * as authApi from "@/features/auth/api/auth-api";

describe("EditEmailModal", () => {
  const mockUpdateEmail = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authApi, "useUpdateEmailMutation").mockReturnValue([
      mockUpdateEmail,
      { isLoading: false, error: null, reset: mockReset } as any,
    ]);
  });

  it("renders closed when isOpen is false", () => {
    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={false}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    expect(screen.queryByText("Change Email Address")).not.toBeInTheDocument();
  });

  it("renders modal form with current email when isOpen is true", () => {
    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    expect(screen.getByText("Change Email Address")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("edit-email-input")).toBeInTheDocument();
    expect(screen.getByTestId("edit-email-password-input")).toBeInTheDocument();
  });

  it("validates empty email", async () => {
    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("edit-email-submit-btn"));

    expect(
      screen.getByText("Please enter a new email address.")
    ).toBeInTheDocument();
    expect(mockUpdateEmail).not.toHaveBeenCalled();
  });

  it("validates invalid email format", async () => {
    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("edit-email-input"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("edit-email-submit-btn"));

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();
    expect(mockUpdateEmail).not.toHaveBeenCalled();
  });

  it("validates email identical to current email", async () => {
    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("edit-email-input"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("edit-email-submit-btn"));

    expect(
      screen.getByText("The new email must be different from your current email.")
    ).toBeInTheDocument();
    expect(mockUpdateEmail).not.toHaveBeenCalled();
  });

  it("submits valid email and password to updateEmail mutation", async () => {
    const mockOnSuccess = vi.fn();
    const mockOnClose = vi.fn();
    mockUpdateEmail.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        data: {
          id: "1",
          email: "newadmin@example.com",
        },
      }),
    });

    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={mockOnClose}
          currentEmail="admin@example.com"
          onSuccess={mockOnSuccess}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("edit-email-input"), {
      target: { value: "newadmin@example.com" },
    });
    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("edit-email-submit-btn"));

    await waitFor(() => {
      expect(mockUpdateEmail).toHaveBeenCalledWith({
        newEmail: "newadmin@example.com",
        currentPassword: "password123",
      });
      expect(mockOnSuccess).toHaveBeenCalledWith("newadmin@example.com");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("displays server error message when mutation fails and keeps modal open", () => {
    const mockOnClose = vi.fn();
    vi.spyOn(authApi, "useUpdateEmailMutation").mockReturnValue([
      mockUpdateEmail,
      {
        isLoading: false,
        error: {
          status: 409,
          data: { message: "Email address is already in use by another account" },
        },
        reset: mockReset,
      } as any,
    ]);

    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={mockOnClose}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    expect(
      screen.getByText(
        "Email address is already in use by another account. Please choose a different email address."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Email Update Failed")).toBeInTheDocument();
    expect(screen.getByText("HTTP 409")).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByText("Change Email Address")).toBeInTheDocument();
  });

  it("does not close modal or call onClose when mutation rejects with 400", async () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    mockUpdateEmail.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: { message: "Invalid current password. Re-authentication failed." },
      }),
    });

    const { rerender } = render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={mockOnClose}
          currentEmail="admin@example.com"
          onSuccess={mockOnSuccess}
        />
      </Provider>
    );

    fireEvent.change(screen.getByTestId("edit-email-input"), {
      target: { value: "newadmin@example.com" },
    });
    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("edit-email-submit-btn"));

    await waitFor(() => {
      expect(mockUpdateEmail).toHaveBeenCalled();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(screen.getByText("Change Email Address")).toBeInTheDocument();

    // Now re-render as RTK Query hook would with the rejection error
    vi.spyOn(authApi, "useUpdateEmailMutation").mockReturnValue([
      mockUpdateEmail,
      {
        isLoading: false,
        error: {
          status: 400,
          data: { message: "Invalid current password. Re-authentication failed." },
        },
        reset: mockReset,
      } as any,
    ]);

    rerender(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={mockOnClose}
          currentEmail="admin@example.com"
          onSuccess={mockOnSuccess}
        />
      </Provider>
    );

    // Error must remain visible and modal must stay open
    expect(
      screen.getByText("Invalid current password. Re-authentication failed.")
    ).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByText("Change Email Address")).toBeInTheDocument();
  });

  it("clears error when user types into new email or current password fields", () => {
    vi.spyOn(authApi, "useUpdateEmailMutation").mockReturnValue([
      mockUpdateEmail,
      {
        isLoading: false,
        error: {
          status: 400,
          data: { message: "Invalid current password. Re-authentication failed." },
        },
        reset: mockReset,
      } as any,
    ]);

    render(
      <Provider store={makeStore()}>
        <EditEmailModal
          isOpen={true}
          onClose={vi.fn()}
          currentEmail="admin@example.com"
        />
      </Provider>
    );

    expect(
      screen.getByText("Invalid current password. Re-authentication failed.")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("edit-email-password-input"), {
      target: { value: "newattempt" },
    });

    expect(mockReset).toHaveBeenCalled();
  });
});

