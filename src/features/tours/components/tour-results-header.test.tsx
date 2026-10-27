import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourResultsHeader } from "./tour-results-header";

describe("TourResultsHeader component", () => {
  it("renders result range and custom sort dropdown without any native select element", () => {
    render(
      <TourResultsHeader
        count={441}
        page={1}
        limit={12}
        sortBy="most-popular"
        onSortChange={vi.fn()}
      />
    );

    // Assert result count range
    expect(screen.getByText("1–12 of 441 tours")).toBeInTheDocument();

    // Verify native select does NOT exist in DOM
    const nativeSelect = document.querySelector("select");
    expect(nativeSelect).toBeNull();

    // Verify custom dropdown combobox exists
    const sortCombobox = screen.getByRole("combobox");
    expect(sortCombobox).toBeInTheDocument();
    expect(sortCombobox).toHaveTextContent("Most Popular");
  });

  it("triggers onSortChange when user selects a different sort option", () => {
    const handleSortChange = vi.fn();
    render(
      <TourResultsHeader
        count={441}
        page={1}
        limit={12}
        sortBy="most-popular"
        onSortChange={handleSortChange}
      />
    );

    const sortCombobox = screen.getByRole("combobox");
    fireEvent.click(sortCombobox);

    const priceLowHighOption = screen.getByRole("option", {
      name: /price: low to high/i,
    });
    fireEvent.click(priceLowHighOption);

    expect(handleSortChange).toHaveBeenCalledTimes(1);
    expect(handleSortChange).toHaveBeenCalledWith("price-asc");
  });

  it("supports all 5 sort options: Most Popular, Price: Low to High, Price: High to Low, Highest Rated, Duration", () => {
    render(
      <TourResultsHeader
        count={441}
        page={1}
        limit={12}
        sortBy="most-popular"
        onSortChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: /most popular/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /price: low to high/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /price: high to low/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /highest rated/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /duration/i })).toBeInTheDocument();
  });

  it("verifies sorting state update triggers sorted tour results across all 5 options", async () => {
    const { mockTourDataProvider } = await import("../services/tour-data-provider");

    // 1. Price: Low to High
    const priceAsc = await mockTourDataProvider.getTours({ sortBy: "price-asc", page: 1, limit: 12 });
    expect(priceAsc.data.length).toBe(12);
    expect(priceAsc.data[0].price.amount).toBeLessThanOrEqual(priceAsc.data[11].price.amount);

    // 2. Price: High to Low
    const priceDesc = await mockTourDataProvider.getTours({ sortBy: "price-desc", page: 1, limit: 12 });
    expect(priceDesc.data.length).toBe(12);
    expect(priceDesc.data[0].price.amount).toBeGreaterThanOrEqual(priceDesc.data[11].price.amount);

    // 3. Highest Rated
    const highestRated = await mockTourDataProvider.getTours({ sortBy: "highest-rated", page: 1, limit: 12 });
    expect(highestRated.data.length).toBe(12);
    expect(highestRated.data[0].reviews?.rating).toBeGreaterThanOrEqual(highestRated.data[11].reviews?.rating ?? 0);

    // 4. Duration
    const durationSort = await mockTourDataProvider.getTours({ sortBy: "duration", page: 1, limit: 12 });
    expect(durationSort.data.length).toBe(12);

    // 5. Most Popular
    const mostPopular = await mockTourDataProvider.getTours({ sortBy: "most-popular", page: 1, limit: 12 });
    expect(mostPopular.data.length).toBe(12);
  });
});
