import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToursPagination } from "./tours-pagination";

describe("ToursPagination component", () => {
  it("renders range, total, and navigation buttons for 462 tours", () => {
    const handlePageChange = vi.fn();
    const handleLimitChange = vi.fn();

    render(
      <ToursPagination
        page={1}
        totalPages={47}
        total={462}
        limit={10}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    );

    // Range display: Showing 1–10 of 462 tours
    expect(screen.getByText("1–10")).toBeInTheDocument();
    expect(screen.getByText("462")).toBeInTheDocument();

    // First page buttons should have disabled Prev and First
    const firstBtn = screen.getByTestId("pagination-first");
    const prevBtn = screen.getByTestId("pagination-prev");
    const nextBtn = screen.getByTestId("pagination-next");
    const lastBtn = screen.getByTestId("pagination-last");

    expect(firstBtn).toBeDisabled();
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
    expect(lastBtn).not.toBeDisabled();

    // Click Next button
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    // Click specific page
    const page2Btn = screen.getByTestId("pagination-page-2");
    fireEvent.click(page2Btn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("handles last page state with disabled next/last buttons", () => {
    const handlePageChange = vi.fn();

    render(
      <ToursPagination
        page={47}
        totalPages={47}
        total={462}
        limit={10}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByText("461–462")).toBeInTheDocument();

    const prevBtn = screen.getByTestId("pagination-prev");
    const nextBtn = screen.getByTestId("pagination-next");
    const lastBtn = screen.getByTestId("pagination-last");

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
    expect(lastBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(46);
  });

  it("does not render when total is 0", () => {
    const { container } = render(
      <ToursPagination
        page={1}
        totalPages={0}
        total={0}
        limit={10}
        onPageChange={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
