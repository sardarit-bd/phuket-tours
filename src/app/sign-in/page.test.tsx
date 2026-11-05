import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import SignInPage from "./page";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { makeStore, type AppStore } from "@/store";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/features/auth/slices/auth-slice";

// Mock next/navigation router and searchParams
const mockPush = vi.fn();
let mockRedirectParam: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? mockRedirectParam : null),
  }),
}));

describe("SignInPage & SignInForm", () => {
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
    mockRedirectParam = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockRedirectParam = null;
    vi.restoreAllMocks();
  });

  it("renders the page heading, logo, and description", () => {
    renderWithStore(<SignInPage />);
    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to view your tour reservations/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /phukettours/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to home/i })
    ).toBeInTheDocument();
  });

  it("renders the email and password inputs, submit button, and sign up link", () => {
    renderWithStore(<SignInForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /forgot password\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign in$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("displays validation error when submitting with empty fields", async () => {
    renderWithStore(<SignInForm />);
    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/email address is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });

  it("displays error for invalid email format", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignInForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "not-an-email");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("displays error when password is less than 6 characters", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignInForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the eye button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<SignInForm />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    const hideBtn = screen.getByRole("button", { name: /hide password/i });
    await user.click(hideBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("handles successful sign in: updates auth state and redirects customer to /dashboard", async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      success: true,
      message: "Login successful",
      data: {
        id: "cust-1",
        name: "Customer User",
        email: "customer@example.com",
        role: "customer" as const,
      },
    };

    setupMockFetch(200, mockAuthResponse);
    const { store } = renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "customer@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(selectIsAuthenticated(store.getState())).toBe(true);
      expect(selectCurrentUser(store.getState())).toEqual(mockAuthResponse.data);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects admin to /dashboard/admin upon successful login", async () => {
    const user = userEvent.setup();
    const mockAdminResponse = {
      success: true,
      message: "Login successful",
      data: {
        id: "admin-1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin" as const,
      },
    };

    setupMockFetch(200, mockAdminResponse);
    const { store } = renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "adminPass123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(selectCurrentUser(store.getState())?.role).toBe("admin");
      expect(mockPush).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  it("handles failed sign in (401 Unauthorized) and displays error alert", async () => {
    const user = userEvent.setup();
    const mockErrorResponse = {
      success: false,
      message: "Invalid email or password",
      data: null,
    };

    setupMockFetch(401, mockErrorResponse);
    const { store } = renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles rate limiting (429) error properly", async () => {
    const user = userEvent.setup();
    const mockRateLimit = {
      success: false,
      message: "Too many attempts, please try again later",
      data: null,
    };

    setupMockFetch(429, mockRateLimit);
    renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/too many attempts/i)
    ).toBeInTheDocument();
  });

  it("handles network failure and displays network error alert", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/unable to connect to the server/i)
    ).toBeInTheDocument();
  });

  it("disables inputs and displays loading spinner during submission", async () => {
    const user = userEvent.setup();
    setupMockFetch(
      200,
      {
        success: true,
        message: "ok",
        data: { id: "1", name: "User", email: "u@e.com", role: "customer" },
      },
      150
    );

    renderWithStore(<SignInForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it("redirects to safe return path specified by ?redirect query parameter", async () => {
    const user = userEvent.setup();
    mockRedirectParam = "/dashboard/bookings";

    setupMockFetch(200, {
      success: true,
      message: "Login successful",
      data: {
        id: "cust-1",
        name: "Traveler",
        email: "traveler@example.com",
        role: "customer",
      },
    });

    renderWithStore(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "traveler@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/bookings");
    });
  });

  it("prevents non-admin user from redirecting to admin dashboard via redirect parameter", async () => {
    const user = userEvent.setup();
    mockRedirectParam = "/dashboard/admin/users";

    setupMockFetch(200, {
      success: true,
      message: "Login successful",
      data: {
        id: "cust-1",
        name: "Traveler",
        email: "traveler@example.com",
        role: "customer",
      },
    });

    renderWithStore(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "traveler@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("ignores protocol-relative open-redirect URLs in redirect parameter", async () => {
    const user = userEvent.setup();
    mockRedirectParam = "//malicious-site.com/exploit";

    setupMockFetch(200, {
      success: true,
      message: "Login successful",
      data: {
        id: "cust-1",
        name: "Traveler",
        email: "traveler@example.com",
        role: "customer",
      },
    });

    renderWithStore(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "traveler@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects admin user to /dashboard/admin when redirect parameter points to customer dashboard route", async () => {
    const user = userEvent.setup();
    mockRedirectParam = "/dashboard/bookings";

    setupMockFetch(200, {
      success: true,
      message: "Login successful",
      data: {
        id: "admin-1",
        name: "Admin Person",
        email: "admin@example.com",
        role: "admin",
      },
    });

    renderWithStore(<SignInForm />);

    await user.type(screen.getByLabelText(/email address/i), "admin@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/admin");
    });
  });
});
