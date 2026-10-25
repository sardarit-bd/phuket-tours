"use client";

import { useState, useCallback, useMemo } from "react";
import { TourFilterState, TourSortOption } from "../types/tour";

export const initialFilterState: TourFilterState = {
  search: "",
  category: "all",
  destinations: [],
  tourTypes: [],
  durations: [],
  minPrice: 0,
  maxPrice: 500,
  sortBy: "most-popular",
};

export function useTourFilters() {
  const [filters, setFilters] = useState<TourFilterState>(initialFilterState);

  // Lazy initialize favorites from localStorage on client
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("phuket_tour_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem("phuket_tour_favorites", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const toggleDestination = useCallback((destinationId: string) => {
    setFilters((prev) => {
      const exists = prev.destinations.includes(destinationId);
      const destinations = exists
        ? prev.destinations.filter((d) => d !== destinationId)
        : [...prev.destinations, destinationId];
      return { ...prev, destinations };
    });
  }, []);

  const toggleTourType = useCallback((tourTypeId: string) => {
    setFilters((prev) => {
      const exists = prev.tourTypes.includes(tourTypeId);
      const tourTypes = exists
        ? prev.tourTypes.filter((t) => t !== tourTypeId)
        : [...prev.tourTypes, tourTypeId];
      return { ...prev, tourTypes };
    });
  }, []);

  const toggleDuration = useCallback((durationId: string) => {
    setFilters((prev) => {
      const exists = prev.durations.includes(durationId);
      const durations = exists
        ? prev.durations.filter((d) => d !== durationId)
        : [...prev.durations, durationId];
      return { ...prev, durations };
    });
  }, []);

  const setPriceRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  }, []);

  const setSortBy = useCallback((sortBy: TourSortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      ...initialFilterState,
      category: filters.category, // keep selected category tab or reset
    });
  }, [filters.category]);

  const resetEverything = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.category !== "all") count++;
    count += filters.destinations.length;
    count += filters.tourTypes.length;
    count += filters.durations.length;
    if (filters.minPrice > 0 || filters.maxPrice < 500) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setSearch,
    setCategory,
    toggleDestination,
    toggleTourType,
    toggleDuration,
    setPriceRange,
    setSortBy,
    clearAllFilters,
    resetEverything,
    activeFilterCount,
    toggleFavorite,
    isFavorite,
    favorites,
  };
}
