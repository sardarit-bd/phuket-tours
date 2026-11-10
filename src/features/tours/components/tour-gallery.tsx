"use client";

import * as React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tour } from "@/features/tours/types/tour";

interface TourGalleryProps {
  tour: Tour;
  /** Called with the index into tour.images when an image is clicked. */
  onImageClick: (index: number) => void;
}

/**
 * Cover + thumbnail gallery for the tour details page.
 *
 * Vertically stacked at ALL breakpoints (mobile, tablet, desktop):
 *   1. Full-width 16:9 cover image on top.
 *   2. A horizontal row of thumbnail previews directly below it.
 *
 * - The thumbnail row is a horizontal, scrollable strip when there are
 *   more images than fit, with a "+N Photos" overlay on the last visible
 *   thumbnail.
 * - Fewer images → show only the available thumbnails, no duplication.
 * - Only one image → cover alone (no thumbnail row).
 *
 * Reuses the existing Lightbox via the `onImageClick` callback — no
 * duplicate preview system.
 */
export function TourGallery({ tour, onImageClick }: TourGalleryProps) {
  const images = tour.images;
  const cover = tour.featuredImage || images[0];
  const coverIndex = cover === images[0] ? 0 : images.indexOf(cover as string);

  // Total images available
  const total = images.length;

  // Thumbnails shown in the horizontal strip. Capped so long galleries
  // scroll rather than stretch the row unbounded.
  const MAX_THUMBS = 8;
  const thumbs = images.slice(0, MAX_THUMBS);
  const overflow = total - MAX_THUMBS;
  const overlayCount = overflow > 0 ? overflow : null;

  if (!cover) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5EAED] bg-white p-1.5">
      {/* ── Cover image (full width, 16:9, on top) ──────────────────── */}
      <button
        type="button"
        onClick={() => onImageClick(coverIndex >= 0 ? coverIndex : 0)}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-[#EEF4F5]"
        aria-label="Open tour photo in full screen"
      >
        <Image
          src={cover}
          alt={tour.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </button>

      {/* ── Thumbnail row (horizontal, scrollable, below the cover) ── */}
      {thumbs.length > 1 && (
        <div className="scrollbar-none -mx-1.5 mt-1.5 overflow-x-auto px-1.5 pb-1">
          <div className="flex gap-1.5">
            {thumbs.map((img, idx) => {
              const isLastWithOverlay =
                overlayCount !== null && idx === thumbs.length - 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onImageClick(idx)}
                  className={cn(
                    "relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-[#EEF4F5]",
                    "sm:w-32"
                  )}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${tour.title} — photo ${idx + 1}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                    loading="lazy"
                  />
                  {isLastWithOverlay && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white">
                      <span className="flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        {overlayCount} Photos
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
