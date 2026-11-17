"use client";

import * as React from "react";

const STORAGE_KEY = "phuket_tour_favorites";

/**
 * Lightweight favorites hook for the public tour details page.
 * Mirrors the localStorage-backed pattern used by useTourFilters so that
 * a favorite toggled on the details page is consistent with the listing page.
 */
export function useTourFavorites() {
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  // Re-sync on mount (e.g. user navigates back from the listing page which
  // may have updated the same storage key).
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return { favorites, toggleFavorite };
}
