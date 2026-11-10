import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldError } from "./field-error";

describe("FieldError component", () => {
  it("renders nothing when error is not provided", () => {
    const { container } = render(<FieldError error={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error message with role='alert' and id", () => {
    render(<FieldError id="email-error" error="Invalid email address" />);
    const el = screen.getByRole("alert");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("id", "email-error");
    expect(el).toHaveTextContent("Invalid email address");
    expect(el).toHaveClass("text-destructive");
  });

  it("renders icon when showIcon is true", () => {
    render(<FieldError error="Required field" showIcon />);
    expect(screen.getByRole("alert").querySelector("svg")).toBeInTheDocument();
  });
});

