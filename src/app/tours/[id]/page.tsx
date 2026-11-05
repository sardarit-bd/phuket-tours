"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Heart, Clock } from "lucide-react";
import { useGetTourByIdQuery } from "@/features/tours/api/tours-api";
import { cn } from "@/lib/utils";
import type { Tour } from "@/features/tours/types/tour";
import { Lightbox } from "@/features/tours/components/lightbox";
import { TourDetailsTabs, type TabId } from "@/features/tours/components/tour-details-tabs";
import { TourGallery } from "@/features/tours/components/tour-gallery";
import { BookingSummaryCard } from "@/features/tours/components/booking-summary-card";
import { OverviewSection } from "@/features/tours/components/tour-overview-section";
import { IncludedExcludedSection } from "@/features/tours/components/tour-included-excluded-section";
import { TourDetailsTabsContent } from "@/features/tours/components/tour-details-content";
import { useTourFavorites } from "@/features/tours/hooks/use-tour-favorites";

/**
 * Public Tour Details page.
 * Route: /tours/[id]  (id = backend service UUID)
 *
 * Fetches the tour via GET /services/:id (public, no auth).
 * Premium travel-booking layout:
 *   header → gallery + booking card → tab navigation → content sections.
 */
export default function TourDetailsPage() {
  const params = useParams<{ id: string }>();
  const tourId = params?.id ?? "";

  const { data: tour, isLoading, isError, refetch } = useGetTourByIdQuery(tourId, {
    skip: !tourId,
  });

  const [lightboxIndex, setLightboxIndex] = React.useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");
  const { favorites, toggleFavorite } = useTourFavorites();
  const isFavorite = tour ? favorites.includes(tour.id) : false;

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-40 rounded bg-[#E5EAED]" />
          <div className="h-9 w-3/4 rounded bg-[#E5EAED]" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-[#E5EAED] lg:col-span-2" />
            <div className="h-72 rounded-2xl bg-[#E5EAED]" />
          </div>
          <div className="h-12 rounded bg-[#E5EAED]" />
        </div>
      </div>
    );
  }

  // ── Error / Not-found state ───────────────────────────────────────────
  if (isError || !tour) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-[#E5EAED] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#74818A]">Tour not found</p>
          <p className="mt-2 text-xs text-[#8A9A9C]">
            The tour you are looking for may have been unpublished or does
            not exist.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark cursor-pointer"
          >
            Retry
          </button>
          <div className="mt-6">
            <Link
              href="/tours"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all tours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-[#74818A]">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All tours
          </Link>
          <span className="text-[#C5D0D2]">/</span>
          {tour.destination && (
            <>
              <span className="text-[#74818A]">{tour.destination}</span>
              <span className="text-[#C5D0D2]">/</span>
            </>
          )}
          <span className="truncate text-[#18282A]">{tour.title}</span>
        </nav>

        {/* ── Tour Header ──────────────────────────────────────────────── */}
        <TourHeader
          tour={tour}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFavorite(tour.id)}
        />

        {/* ── Gallery + Booking Summary ────────────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <TourGallery
              tour={tour}
              onImageClick={setLightboxIndex}
            />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <BookingSummaryCard tour={tour} />
          </div>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────────── */}
        <div className="mt-10">
          <TourDetailsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────── */}
        <div className="mt-6 pb-10">
          {activeTab === "overview" && (
            <OverviewSection tour={tour} />
          )}
          {activeTab === "included" && (
            <IncludedExcludedSection tour={tour} />
          )}
          {activeTab === "details" && (
            <TourDetailsTabsContent tour={tour} />
          )}
        </div>
      </div>

      {/* ── Lightbox (fullscreen preview) ─────────────────────────────── */}
      {tour.images.length > 0 && (
        <Lightbox
          images={tour.images}
          activeIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(undefined)}
          title={tour.title}
        />
      )}
    </>
  );
}

// ── Tour Header ───────────────────────────────────────────────────────────

function TourHeader({
  tour,
  isFavorite,
  onToggleFavorite,
}: {
  tour: Tour;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = React.useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tour.title, url });
        return;
      } catch {
        // cancelled or failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }, [tour.title]);

  const metaItems: React.ReactNode[] = [];
  metaItems.push(
    <span key="duration" className="inline-flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {tour.duration}
    </span>
  );
  if (tour.destination) {
    metaItems.push(
      <span key="destination" className="truncate">
        {tour.destination}
      </span>
    );
  }
  if (tour.categoryName) {
    metaItems.push(<span key="category" className="truncate">{tour.categoryName}</span>);
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {tour.badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs",
                tour.badge === "Popular" && "bg-[#FF574D] text-white",
                tour.badge === "Bestseller" && "bg-[#FBA81A] text-white",
                tour.badge === "New" && "bg-[#22C55E] text-white"
              )}
            >
              {tour.badge}
            </span>
          )}
          <h1 className="font-outfit text-2xl font-bold leading-tight text-[#18282A] sm:text-[28px]">
            {tour.title}
          </h1>
        </div>

        {tour.subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#74818A]">
            {tour.subtitle}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#74818A]">
          {metaItems}
        </div>
      </div>

      {/* Actions: Share + Favorite */}
      <div className="flex shrink-0 items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAED] bg-white px-4 py-2 text-xs font-semibold text-[#18282A] transition-colors hover:border-primary hover:text-primary"
        >
          <Share2 className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Share"}
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={
            isFavorite
              ? `Remove ${tour.title} from favorites`
              : `Add ${tour.title} to favorites`
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5EAED] bg-white transition-colors hover:border-primary"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite
                ? "fill-[#FF4D6D] text-[#FF4D6D]"
                : "text-[#74818A]"
            )}
          />
        </button>
      </div>
    </header>
  );
}
