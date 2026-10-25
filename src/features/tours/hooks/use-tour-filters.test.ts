import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTourFilters } from "./use-tour-filters";

describe("useTourFilters hook", () => {
  it("initializes with default filters", () => {
    const { result } = renderHook(() => useTourFilters());

    expect(result.current.filters.search).toBe("");
    expect(result.current.filters.category).toBe("all");
    expect(result.current.filters.destinations).toEqual([]);
    expect(result.current.filters.tourTypes).toEqual([]);
    expect(result.current.filters.durations).toEqual([]);
    expect(result.current.filters.minPrice).toBe(0);
    expect(result.current.filters.maxPrice).toBe(500);
    expect(result.current.filters.sortBy).toBe("most-popular");
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
