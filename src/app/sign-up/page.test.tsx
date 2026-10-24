import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "./page";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

describe("SignUpPage & SignUpForm", () => {
  it("renders the page heading, logo, and description", () => {
    render(<SignUpPage />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
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
    render(<SignUpForm />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "securePassword123");

    const submitBtn = screen.getByRole("button", { name: /^create account$/i });
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText(/account created successfully/i)
        ).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });
});
