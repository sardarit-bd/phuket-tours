"use client";

import * as React from "react";
import { Tour } from "../types/tour";
import { TourCard } from "./tour-card";
import { TourCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Compass } from "lucide-react";

interface TourGridProps {
  tours: Tour[];
  isLoading?: boolean;
  onResetFilters?: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function TourGrid({
  tours,
  isLoading = false,
  onResetFilters,
  favorites,
  onToggleFavorite,
}: TourGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <TourCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <EmptyState
        icon={<Compass className="h-8 w-8 text-primary" />}
        title="No tours match your criteria"
        description="We couldn't find any tours matching your current filters. Try broadening your search or resetting all filters."
        actionLabel="Reset All Filters"
        onAction={onResetFilters}
        className="my-6 py-16"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          isFavorite={favorites.includes(tour.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
