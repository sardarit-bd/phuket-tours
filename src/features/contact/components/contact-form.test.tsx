import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./contact-form";

describe("ContactForm component", () => {
  it("renders form inputs and submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("displays validation errors on empty submission", () => {
    render(<ContactForm />);
    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/your name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message cannot be empty/i)).toBeInTheDocument();
  });

  it("submits form successfully when fields are valid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), "Alice Traveler");
    await user.type(screen.getByLabelText(/email address/i), "alice@example.com");
    await user.type(screen.getByLabelText(/message/i), "I would like to inquire about a private yacht charter.");

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
    });
  });
});
