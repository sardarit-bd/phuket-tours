import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportFiltersBar } from "./report-filters-bar";

describe("ReportFiltersBar component", () => {
  it("renders date inputs, quick presets, and apply button", () => {
    render(
      <ReportFiltersBar
        filters={{}}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getByLabelText("From:")).toBeInTheDocument();
    expect(screen.getByLabelText("To:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply filter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /last 7 days/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /last 30 days/i })).toBeInTheDocument();
  });

  it("submits valid date filters when Apply is clicked", () => {
    const handleApply = vi.fn();

    render(
      <ReportFiltersBar
        filters={{}}
        onApplyFilters={handleApply}
        onResetFilters={vi.fn()}
      />
    );

    const fromInput = screen.getByLabelText("From:");
    const toInput = screen.getByLabelText("To:");

    fireEvent.change(fromInput, { target: { value: "2026-01-01" } });
    fireEvent.change(toInput, { target: { value: "2026-01-31" } });

    const applyBtn = screen.getByRole("button", { name: /apply filter/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith({
      from: "2026-01-01",
      to: "2026-01-31",
    });
  });

  it("shows validation error and prevents submission when from > to", () => {
    const handleApply = vi.fn();

    render(
      <ReportFiltersBar
        filters={{}}
        onApplyFilters={handleApply}
        onResetFilters={vi.fn()}
      />
    );

    const fromInput = screen.getByLabelText("From:");
    const toInput = screen.getByLabelText("To:");

    fireEvent.change(fromInput, { target: { value: "2026-12-31" } });
    fireEvent.change(toInput, { target: { value: "2026-01-01" } });

    const applyBtn = screen.getByRole("button", { name: /apply filter/i });
    fireEvent.click(applyBtn);

    expect(handleApply).not.toHaveBeenCalled();
    expect(screen.getByTestId("filter-validation-error")).toHaveTextContent(
      "The start date must not be after the end date."
    );
  });

  it("calls onResetFilters when Reset is clicked", () => {
    const handleReset = vi.fn();

    render(
      <ReportFiltersBar
        filters={{ from: "2026-01-01", to: "2026-01-31" }}
        onApplyFilters={vi.fn()}
        onResetFilters={handleReset}
      />
    );

    const resetBtn = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
