import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInPage from "./page";
import { SignInForm } from "@/features/auth/components/sign-in-form";

describe("SignInPage & SignInForm", () => {
  it("renders the page heading, logo, and description", () => {
    render(<SignInPage />);
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
    render(<SignInForm />);
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
    render(<SignInForm />);
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
    render(<SignInForm />);
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
    render(<SignInForm />);
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
    render(<SignInForm />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    const hideBtn = screen.getByRole("button", { name: /hide password/i });
    await user.click(hideBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("submits the form and displays the demonstration status message", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, "test@phukettours.com");
    await user.type(passwordInput, "securePass123");

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText(/sign-in validated successfully/i)
        ).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });
});
