import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourPagination } from "./tour-pagination";

describe("TourPagination component", () => {
  it("renders nothing when totalPages is 1 or less", () => {
    const { container } = render(
      <TourPagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders previous and next controls and numbered pages", () => {
    render(
      <TourPagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /previous/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /next/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 5" })).toBeInTheDocument();
  });

  it("disables previous button on first page and disables next button on last page", () => {
    const { rerender } = render(
      <TourPagination
        currentPage={1}
        totalPages={4}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();

    rerender(
      <TourPagination
        currentPage={4}
        totalPages={4}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("marks current active page with aria-current='page'", () => {
    render(
      <TourPagination
        currentPage={3}
        totalPages={6}
        onPageChange={vi.fn()}
      />
    );

    const activePageBtn = screen.getByRole("button", { name: "Go to page 3" });
    expect(activePageBtn).toHaveAttribute("aria-current", "page");
  });

  it("calls onPageChange with correct page number when page button is clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <TourPagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));
    expect(handlePageChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(handlePageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("renders ellipsis indicators when total pages is large", () => {
    render(
      <TourPagination
        currentPage={5}
        totalPages={20}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 20" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 5" })).toBeInTheDocument();
  });
});
