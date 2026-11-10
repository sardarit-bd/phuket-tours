import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTourFilters } from "./use-tour-filters";

describe("useTourFilters hook", () => {
  it("initializes with default filters and pagination", () => {
    const { result } = renderHook(() => useTourFilters());

    expect(result.current.filters.search).toBe("");
    expect(result.current.filters.category).toBe("all");
    expect(result.current.filters.destinations).toEqual([]);
    expect(result.current.filters.tourTypes).toEqual([]);
    expect(result.current.filters.durations).toEqual([]);
    expect(result.current.filters.minPrice).toBe(0);
    expect(result.current.filters.maxPrice).toBe(500);
    expect(result.current.filters.sortBy).toBe("most-popular");
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.limit).toBe(12);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("updates search query and calculates active filter count", () => {
    const { result } = renderHook(() => useTourFilters());

    act(() => {
      result.current.setSearch("Phi Phi");
    });

    expect(result.current.filters.search).toBe("Phi Phi");
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("toggles destinations and clearAllFilters resets them", () => {
    const { result } = renderHook(() => useTourFilters());

    act(() => {
      result.current.toggleDestination("phuket");
    });
    expect(result.current.filters.destinations).toContain("phuket");

    act(() => {
      result.current.clearAllFilters();
    });
    expect(result.current.filters.destinations).toHaveLength(0);
  });

  it("updates pagination page and resets page to 1 when filters or search change", () => {
    const { result } = renderHook(() => useTourFilters());

    // Advance to page 3
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.filters.page).toBe(3);

    // Filter change should reset page to 1
    act(() => {
      result.current.setCategory("adventure");
    });
    expect(result.current.filters.page).toBe(1);

    // Advance to page 4
    act(() => {
      result.current.setPage(4);
    });
    expect(result.current.filters.page).toBe(4);

    // Search change should reset page to 1
    act(() => {
      result.current.setSearch("Similan");
    });
    expect(result.current.filters.page).toBe(1);

    // Advance to page 2
    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.filters.page).toBe(2);

    // Clear all filters should reset page to 1
    act(() => {
      result.current.clearAllFilters();
    });
    expect(result.current.filters.page).toBe(1);
  });

  it("toggles favorites", () => {
    const { result } = renderHook(() => useTourFilters());

    act(() => {
      result.current.toggleFavorite("tour-1");
    });
    expect(result.current.isFavorite("tour-1")).toBe(true);

    act(() => {
      result.current.toggleFavorite("tour-1");
    });
    expect(result.current.isFavorite("tour-1")).toBe(false);
  });
});
