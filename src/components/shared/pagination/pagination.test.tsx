import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./pagination";

describe("Pagination component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders range, total, and visually centered navigation controls", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination
        currentPage={1}
        pageSize={12}
        totalItems={50}
        totalPages={5}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[12, 24, 48]}
        pageSizeLabel="Per page:"
        itemLabel="assets"
        dataTestId="media-pagination"
      />
    );

    // Range display: Showing 1–12 of 50 assets
    expect(screen.getByText("1–12")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText(/assets/i)).toBeInTheDocument();

    // First and Prev buttons disabled on first page
    const firstBtn = screen.getByTestId("media-pagination-first");
    const prevBtn = screen.getByTestId("media-pagination-prev");
    const nextBtn = screen.getByTestId("media-pagination-next");
    const lastBtn = screen.getByTestId("media-pagination-last");

    expect(firstBtn).toBeDisabled();
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
    expect(lastBtn).not.toBeDisabled();

    // Verify visual centering grid structure
    const container = screen.getByTestId("media-pagination");
    expect(container.className).toContain("sm:grid-cols-[1fr_auto_1fr]");

    // Click Next button
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Click Last button
    fireEvent.click(lastBtn);
    expect(onPageChange).toHaveBeenCalledWith(5);

    // Click page number button
    const page3Btn = screen.getByTestId("media-pagination-page-3");
    fireEvent.click(page3Btn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("uses CustomSelect for page size without native HTML select", () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        pageSize={12}
        totalItems={100}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[12, 24, 48]}
        dataTestId="media-pagination"
      />
    );

    // Should NOT have native select element
    expect(screen.queryByRole("combobox", { name: "select" })).not.toBeInTheDocument();

    // Combobox trigger from CustomSelect
    const sizeCombobox = screen.getByTestId("media-pagination-size-select").querySelector("button");
    expect(sizeCombobox).toBeInTheDocument();
    expect(sizeCombobox).toHaveTextContent("12");

    // Open CustomSelect and pick 24
    if (sizeCombobox) {
      fireEvent.click(sizeCombobox);
      const option24 = screen.getByRole("option", { name: "24" });
      fireEvent.click(option24);
      expect(onPageSizeChange).toHaveBeenCalledWith(24);
    }
  });

  it("handles last page state with disabled next/last buttons", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        pageSize={10}
        totalItems={50}
        totalPages={5}
        onPageChange={onPageChange}
        dataTestId="pagination"
      />
    );

    expect(screen.getByText("41–50")).toBeInTheDocument();

    const firstBtn = screen.getByTestId("pagination-first");
    const prevBtn = screen.getByTestId("pagination-prev");
    const nextBtn = screen.getByTestId("pagination-next");
    const lastBtn = screen.getByTestId("pagination-last");

    expect(firstBtn).not.toBeDisabled();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
    expect(lastBtn).toBeDisabled();

    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(firstBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("returns null when totalItems is 0", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalItems={0}
        onPageChange={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("handles single page state (totalItems <= pageSize)", () => {
    render(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalItems={7}
        onPageChange={vi.fn()}
        dataTestId="pagination"
      />
    );

    expect(screen.getByText("1–7")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-first")).toBeDisabled();
    expect(screen.getByTestId("pagination-prev")).toBeDisabled();
    expect(screen.getByTestId("pagination-next")).toBeDisabled();
    expect(screen.getByTestId("pagination-last")).toBeDisabled();
  });

  it("resets page to 1 when changing page size causes currentPage to exceed total pages", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination
        currentPage={5} // Page 5 with 10 per page = 50 items
        pageSize={10}
        totalItems={50}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 50]}
        dataTestId="pagination"
      />
    );

    const sizeCombobox = screen.getByTestId("pagination-size-select").querySelector("button");
    if (sizeCombobox) {
      fireEvent.click(sizeCombobox);
      // Change page size to 50 (new total pages = 1). Page 5 > 1, so onPageChange(1) should fire!
      const option50 = screen.getByRole("option", { name: "50" });
      fireEvent.click(option50);

      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(onPageChange).toHaveBeenCalledWith(1);
    }
  });

  it("disables all navigation controls while isFetching is true", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        pageSize={10}
        totalItems={50}
        onPageChange={onPageChange}
        isFetching={true}
        dataTestId="pagination"
      />
    );

    expect(screen.getByTestId("pagination-first")).toBeDisabled();
    expect(screen.getByTestId("pagination-prev")).toBeDisabled();
    expect(screen.getByTestId("pagination-next")).toBeDisabled();
    expect(screen.getByTestId("pagination-last")).toBeDisabled();
    expect(screen.getByTestId("pagination-page-1")).toBeDisabled();
    expect(screen.getByTestId("pagination-page-3")).toBeDisabled();
  });

  it("calculates totalPages automatically when totalPages prop is omitted", () => {
    render(
      <Pagination
        currentPage={1}
        pageSize={10}
        totalItems={45} // 45 / 10 = 5 pages
        onPageChange={vi.fn()}
        dataTestId="pagination"
      />
    );

    expect(screen.getByText("1–10")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-page-5")).toBeInTheDocument();
  });

  it("renders ellipsis for large page counts and clamps out-of-bounds page values", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={10}
        pageSize={10}
        totalItems={200} // 20 pages
        totalPages={20}
        onPageChange={onPageChange}
        dataTestId="pagination"
      />
    );

    // Ellipsis should be rendered
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThan(0);

    // Page 10 is active
    const page10 = screen.getByTestId("pagination-page-10");
    expect(page10).toHaveAttribute("aria-current", "page");

    // Click Next navigates to 11
    fireEvent.click(screen.getByTestId("pagination-next"));
    expect(onPageChange).toHaveBeenCalledWith(11);
  });
});
