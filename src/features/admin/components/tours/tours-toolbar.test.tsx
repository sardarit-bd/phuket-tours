import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToursToolbar } from "./tours-toolbar";

describe("ToursToolbar component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders search input, filters, sort controls, and debounces search input", () => {
    const handleSearchChange = vi.fn();
    const handleStatusChange = vi.fn();
    const handleSortByChange = vi.fn();
    const handleSortOrderToggle = vi.fn();
    const handlePageSizeChange = vi.fn();
    const handleResetFilters = vi.fn();

    render(
      <ToursToolbar
        search=""
        onSearchChange={handleSearchChange}
        status="ALL"
        onStatusChange={handleStatusChange}
        sortBy="updatedAt"
        onSortByChange={handleSortByChange}
        sortOrder="desc"
        onSortOrderToggle={handleSortOrderToggle}
        pageSize={10}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={handleResetFilters}
        isFiltered={false}
      />
    );

    const searchInput = screen.getByTestId("tours-search-input");
    expect(searchInput).toBeInTheDocument();

    // Type in search input
    fireEvent.change(searchInput, { target: { value: "phi phi" } });
    expect(handleSearchChange).not.toHaveBeenCalled();

    // Advance timers by 250ms (before debounce expires)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(handleSearchChange).not.toHaveBeenCalled();

    // Advance timers past 300ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(handleSearchChange).toHaveBeenCalledWith("phi phi");
  });

  it("handles clearing search input", () => {
    const handleSearchChange = vi.fn();

    render(
      <ToursToolbar
        search="islands"
        onSearchChange={handleSearchChange}
        status="ALL"
        onStatusChange={vi.fn()}
        sortBy="updatedAt"
        onSortByChange={vi.fn()}
        sortOrder="desc"
        onSortOrderToggle={vi.fn()}
        pageSize={10}
        onPageSizeChange={vi.fn()}
        onResetFilters={vi.fn()}
        isFiltered={true}
      />
    );

    const clearBtn = screen.getByTestId("tours-search-clear-button");
    fireEvent.click(clearBtn);
    expect(handleSearchChange).toHaveBeenCalledWith("");
  });

  it("toggles sort order between asc and desc", () => {
    const handleSortOrderToggle = vi.fn();

    render(
      <ToursToolbar
        search=""
        onSearchChange={vi.fn()}
        status="ALL"
        onStatusChange={vi.fn()}
        sortBy="updatedAt"
        onSortByChange={vi.fn()}
        sortOrder="desc"
        onSortOrderToggle={handleSortOrderToggle}
        pageSize={10}
        onPageSizeChange={vi.fn()}
        onResetFilters={vi.fn()}
        isFiltered={false}
      />
    );

    const sortOrderBtn = screen.getByTestId("sort-order-toggle-button");
    fireEvent.click(sortOrderBtn);
    expect(handleSortOrderToggle).toHaveBeenCalledTimes(1);
  });

  it("displays reset button when filtered and handles click", () => {
    const handleResetFilters = vi.fn();

    render(
      <ToursToolbar
        search="kayak"
        onSearchChange={vi.fn()}
        status="PUBLISHED"
        onStatusChange={vi.fn()}
        sortBy="name"
        onSortByChange={vi.fn()}
        sortOrder="asc"
        onSortOrderToggle={vi.fn()}
        pageSize={25}
        onPageSizeChange={vi.fn()}
        onResetFilters={handleResetFilters}
        isFiltered={true}
      />
    );

    const resetBtn = screen.getByTestId("tours-reset-filters-button");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleResetFilters).toHaveBeenCalledTimes(1);
  });
});
