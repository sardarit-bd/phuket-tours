import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackAlert } from "./feedback-alert";

describe("FeedbackAlert component suite", () => {
  it("renders error alert with role='alert' and assertive live region", () => {
    render(
      <FeedbackAlert
        type="error"
        title="Email Update Failed"
        message="Email address is already in use by another account."
        code={409}
      />
    );

    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeInTheDocument();
    expect(alertEl).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Email Update Failed")).toBeInTheDocument();
    expect(
      screen.getByText("Email address is already in use by another account.")
    ).toBeInTheDocument();
    expect(screen.getByText("HTTP 409")).toBeInTheDocument();
  });

  it("renders warning alert with role='status' and polite live region", () => {
    render(
      <FeedbackAlert
        type="warning"
        title="Attention Required"
        message="Session about to expire."
      />
    );

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Attention Required")).toBeInTheDocument();
    expect(screen.getByText("Session about to expire.")).toBeInTheDocument();
  });

  it("renders success alert with role='status'", () => {
    render(
      <FeedbackAlert
        type="success"
        title="Success"
        message="Changes saved successfully."
      />
    );

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Changes saved successfully.")).toBeInTheDocument();
  });

  it("renders info alert with role='status'", () => {
    render(
      <FeedbackAlert
        type="info"
        title="Information"
        message="A confirmation link was sent to your inbox."
      />
    );

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(
      screen.getByText("A confirmation link was sent to your inbox.")
    ).toBeInTheDocument();
  });

  it("handles dismiss button callback when dismissible is set", () => {
    const handleDismiss = vi.fn();
    render(
      <FeedbackAlert
        type="error"
        message="Temporary error"
        onDismiss={handleDismiss}
      />
    );

    const dismissBtn = screen.getByRole("button", { name: /dismiss alert/i });
    fireEvent.click(dismissBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});

