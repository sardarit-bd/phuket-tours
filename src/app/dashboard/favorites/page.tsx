"use client";

import * as React from "react";
import Link from "next/link";
import { useTourFavorites } from "@/features/tours/hooks/use-tour-favorites";
import { useGetTourByIdQuery } from "@/features/tours/api/tours-api";
import { TourCard } from "@/features/tours/components/tour-card";
import { Button } from "@/components/ui/button";
import { Heart, Compass, Trash2 } from "lucide-react";

function TourSkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#E5EAED] bg-white overflow-hidden shadow-xs">
      <div className="h-40 w-full animate-pulse bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

/**
 * Child component that fetches a single tour by id.
 * Extracted so that useGetTourByIdQuery is called once per component,
 * satisfying the rules-of-hooks lint rule.
 */
function FavoriteTourCard({
  tourId,
  onRemove,
}: {
  tourId: string;
  onRemove: (id: string) => void;
}) {
  const { data: tour, isLoading, error } = useGetTourByIdQuery(tourId, {
    skip: !tourId,
  });

  if (isLoading) return <TourSkeletonCard />;

  if (error || !tour) {
    return (
      <div
        className="flex items-center justify-between rounded-lg border border-dashed border-[#E5EAED] bg-[#F8FAFB] px-4 py-3"
        data-testid={`customer-favorite-error-${tourId}`}
      >
        <div className="text-xs">
          <div className="font-mono text-[#18282A]">{tourId.slice(0, 8)}…</div>
          <div className="text-[10px] text-[#74818A]">
            Tour not found or no longer published
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(tourId)}
          className="h-7 px-2 text-xs text-[#74818A] hover:bg-slate-100 hover:text-[#18282A]"
          data-testid={`remove-favorite-${tourId}`}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div data-testid={`customer-favorite-card-${tour.id}`}>
      <TourCard tour={tour} isFavorite onToggleFavorite={onRemove} />
      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(tour.id)}
          className="h-7 px-2 text-xs text-[#74818A] hover:bg-rose-50 hover:text-rose-700"
          data-testid={`remove-favorite-${tour.id}`}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Remove
        </Button>
      </div>
    </div>
  );
}

export default function UserFavoritesPage() {
  const { favorites, toggleFavorite } = useTourFavorites();

  const handleRemove = (id: string) => {
    toggleFavorite(id);
  };

  return (
    <div className="space-y-6" data-testid="customer-favorites-page">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            My Favorites
          </h1>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            {favorites.length} saved
          </span>
        </div>
        <p className="mt-1 text-sm text-[#74818A]">
          Your saved Phuket excursions wishlist. Favorites are stored locally in your browser.
        </p>
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed border-[#E5EAED] bg-white p-12 text-center"
          data-testid="customer-favorites-empty"
        >
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-outfit text-base font-bold text-[#18282A]">
            No saved favorites yet
          </h3>
          <p className="mt-1.5 text-xs text-[#74818A] max-w-sm mx-auto">
            Tap the heart icon on any tour to save it to your wishlist. It will appear here for quick access.
          </p>
          <Link href="/tours">
            <Button className="mt-5 bg-[#176779] text-white text-xs hover:bg-[#135664]">
              <Compass className="mr-1.5 h-3.5 w-3.5" />
              Browse Tours
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="customer-favorites-grid">
          {favorites.map((id) => (
            <FavoriteTourCard key={id} tourId={id} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
