import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./empty-state";

describe("EmptyState component", () => {
  it("renders default title and description when no props are provided", () => {
    render(<EmptyState />);

    expect(screen.getByRole("heading", { level: 3, name: /no results found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/we couldn't find anything matching your search criteria/i)
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <EmptyState
        title="No tours available"
        description="No departures are scheduled for this date. Please select another date."
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: /no tours available/i })).toBeInTheDocument();
    expect(
      screen.getByText(/no departures are scheduled for this date/i)
    ).toBeInTheDocument();
  });

  it("renders action button and invokes onAction when clicked", async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No results"
        actionLabel="Clear Filters"
        onAction={handleAction}
      />
    );

    const actionButton = screen.getByRole("button", { name: /clear filters/i });
    expect(actionButton).toBeInTheDocument();

    await user.click(actionButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when actionLabel or onAction is missing", () => {
    const { rerender } = render(<EmptyState title="No results" actionLabel="Only Label" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<EmptyState title="No results" onAction={() => {}} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders compact variant with smaller padding and typography", () => {
    const { container } = render(
      <EmptyState
        compact
        title="Compact Title"
        description="Compact description"
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: /compact title/i })).toHaveClass("text-sm");
    expect(container.firstChild).toHaveClass("py-6");
  });
});
