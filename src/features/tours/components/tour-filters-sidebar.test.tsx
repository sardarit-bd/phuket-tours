import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourFiltersSidebar } from "./tour-filters-sidebar";
import { initialFilterState } from "../hooks/use-tour-filters";
import { FilterGroup } from "../types/tour";

/**
 * Sample destination filter group for testing.
 * Mirrors what the backend would provide.
 */
const testDestinationGroup: FilterGroup = {
  id: "destination",
  title: "Destination",
  options: [
    { id: "phuket", label: "Phuket", count: 50 },
    { id: "phi-phi-islands", label: "Phi Phi Islands", count: 30 },
    { id: "similan-islands", label: "Similan Islands", count: 20 },
    { id: "james-bond-island", label: "James Bond Island", count: 10 },
    { id: "krabi", label: "Krabi", count: 15 },
    { id: "racha-island", label: "Racha Island", count: 8 },
  ],
};

describe("TourFiltersSidebar component", () => {
  it("renders header and filter groups for Destination and Price Range", () => {
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={vi.fn()}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={vi.fn()}
        destinationGroup={testDestinationGroup}
      />
    );

    expect(screen.getByText("Filter Tours")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.getByText("Destination")).toBeInTheDocument();
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
        destinationGroup={testDestinationGroup}
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
        destinationGroup={testDestinationGroup}
      />
    );

    const phuketCheckbox = screen.getByRole("checkbox", { name: /phuket/i });
    fireEvent.click(phuketCheckbox);
    expect(handleToggleDest).toHaveBeenCalledWith("phuket");
  });

  it("does not render destination group when no destinations are available", () => {
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={vi.fn()}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={vi.fn()}
        destinationGroup={null}
      />
    );

    expect(screen.getByText("Filter Tours")).toBeInTheDocument();
    expect(screen.getByText("Price Range")).toBeInTheDocument();
    // Destination group should not be rendered
    expect(screen.queryByText("Destination")).not.toBeInTheDocument();
  });

  it("displays destination counts from backend data", () => {
    render(
      <TourFiltersSidebar
        filters={initialFilterState}
        toggleDestination={vi.fn()}
        toggleTourType={vi.fn()}
        toggleDuration={vi.fn()}
        setPriceRange={vi.fn()}
        clearAllFilters={vi.fn()}
        destinationGroup={testDestinationGroup}
      />
    );

    // Check that counts are displayed
    expect(screen.getByText("(50)")).toBeInTheDocument();
    expect(screen.getByText("(30)")).toBeInTheDocument();
    expect(screen.getByText("(20)")).toBeInTheDocument();
  });
});
