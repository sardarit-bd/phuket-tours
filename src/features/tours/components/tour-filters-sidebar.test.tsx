import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourFiltersSidebar } from "./tour-filters-sidebar";
import { initialFilterState } from "../hooks/use-tour-filters";

describe("TourFiltersSidebar component", () => {
  it("renders header and filter groups for Destination, Tour Type, Duration, and Price Range", () => {
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={vi.fn()}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={vi.fn()}
      />
    );

    expect(screen.getByText("Filter Tours")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.getByText("Destination")).toBeInTheDocument();
    expect(screen.getByText("Tour Type")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Price Range")).toBeInTheDocument();
  });

  it("calls clearAllFilters when Clear All button is clicked", () => {
    const handleClear = vi.fn();
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={vi.fn()}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={handleClear}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("calls toggleDestination when a destination checkbox is clicked", () => {
    const handleToggleDest = vi.fn();
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={handleToggleDest}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={vi.fn()}
      />
    );

    const phuketCheckbox = screen.getByRole("checkbox", { name: /phuket/i });
    fireEvent.click(phuketCheckbox);
    expect(handleToggleDest).toHaveBeenCalledWith("phuket");
  });
});
