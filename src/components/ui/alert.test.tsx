import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorAlert, SuccessAlert, WarningAlert } from "./alert";

describe("Alert component suite", () => {
  it("renders ErrorAlert with proper role='alert' and text", () => {
    render(<ErrorAlert title="Error Header" description="Something went wrong." />);

    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeInTheDocument();
    expect(screen.getByText("Error Header")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    expect(alertEl).toHaveClass("text-destructive");
  });

  it("renders SuccessAlert with role='status'", () => {
    render(<SuccessAlert title="Saved" description="Settings updated successfully." />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("handles dismiss button callback", () => {
    const handleDismiss = vi.fn();
    render(<WarningAlert description="Caution advised" onDismiss={handleDismiss} />);

    const dismissBtn = screen.getByRole("button", { name: /dismiss alert/i });
    fireEvent.click(dismissBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
