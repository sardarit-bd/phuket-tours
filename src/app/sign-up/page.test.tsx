import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import SignUpPage from "./page";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { makeStore, type AppStore } from "@/store";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/slices/auth-slice";

// Mock next/navigation router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("SignUpPage & SignUpForm", () => {
  const originalFetch = globalThis.fetch;
  let store: AppStore;

  const setupMockFetch = (
    status: number,
    responseBody: unknown,
    delayMs = 0
  ) => {
    globalThis.fetch = vi
      .fn()
      .mockImplementation(async () => {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return {
          ok: status >= 200 && status < 300,
          status,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => responseBody,
          text: async () => JSON.stringify(responseBody),
          clone() {
            return this;
          },
        } as unknown as Response;
      });
  };

  const renderWithStore = (ui: React.ReactElement) => {
    store = makeStore();
    return {
      ...render(<Provider store={store}>{ui}</Provider>),
      store,
    };
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders the page heading, logo, and description", () => {
    renderWithStore(<SignUpPage />);
    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign up to book island adventures/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /phukettours/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to home/i })
    ).toBeInTheDocument();
  });

  it("renders full name, email, password inputs, submit button, and sign in link", () => {
    renderWithStore(<SignUpForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^create account$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("displays validation error when submitting with empty fields", async () => {
    renderWithStore(<SignUpForm />);
    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/full name is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/email address is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });

  it("displays error for full name less than 2 characters", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignUpForm />);
    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, "J");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/full name must be at least 2 characters/i)
    ).toBeInTheDocument();
  });

  it("displays error for invalid email format", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignUpForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "not-an-email");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("displays error when password is less than 6 characters", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignUpForm />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, "12345");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the eye button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignUpForm />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    const hideBtn = screen.getByRole("button", { name: /hide password/i });
    await user.click(hideBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("handles successful registration: updates auth state and redirects to /dashboard", async () => {
    const user = userEvent.setup();
    const mockRegisterResponse = {
      success: true,
      message: "User registered successfully",
      data: {
        id: "new-user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "customer" as const,
      },
    };

    setupMockFetch(201, mockRegisterResponse);
    const { store } = renderWithStore(<SignUpForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "Jane Doe");
    await user.type(emailInput, "jane@example.com");
    await user.type(passwordInput, "securePassword123");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(selectIsAuthenticated(store.getState())).toBe(true);
      expect(selectCurrentUser(store.getState())).toEqual(mockRegisterResponse.data);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles registration conflict (409 Email already registered) and displays error alert", async () => {
    const user = userEvent.setup();
    const mockConflictResponse = {
      success: false,
      message: "Email already registered",
      data: null,
    };

    setupMockFetch(409, mockConflictResponse);
    const { store } = renderWithStore(<SignUpForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "Existing User");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/email already registered/i)
    ).toBeInTheDocument();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles network failure during registration and displays error alert", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    renderWithStore(<SignUpForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "User Name");
    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/unable to connect to the server/i)
    ).toBeInTheDocument();
  });

  it("disables inputs and displays loading spinner during registration submission", async () => {
    const user = userEvent.setup();
    setupMockFetch(
      201,
      {
        success: true,
        message: "ok",
        data: { id: "1", name: "User", email: "u@e.com", role: "customer" },
      },
      150
    );

    renderWithStore(<SignUpForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "Jane Doe");
    await user.type(emailInput, "jane@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});
