import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button component", () => {
  it("renders with default props and text content", () => {
    render(<Button>Book Now</Button>);
    const button = screen.getByRole("button", { name: /book now/i });
    expect(button).toBeInTheDocument();
  });

  it("handles click events through userEvent", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("prevents click execution when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>
    );
    const button = screen.getByRole("button", { name: /disabled action/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders as a realistic link element when asChild is true", async () => {
    const handleLinkClick = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });
    const user = userEvent.setup();

    render(
      <Button asChild>
        <a href="/tours" onClick={handleLinkClick}>
          Explore All Tours
        </a>
      </Button>
    );

    // Should render as an anchor element, not a native button element
    const link = screen.getByRole("link", { name: /explore all tours/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/tours");

    await user.click(link);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
  });
});
