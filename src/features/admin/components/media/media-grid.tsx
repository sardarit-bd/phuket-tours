"use client";

import * as React from "react";
import { Image as ImageIcon, SearchX, RefreshCw, AlertTriangle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaCard } from "./media-card";
import type { MediaItem } from "../../types/admin-media";

export interface MediaGridProps {
  items: MediaItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onOpenUpload?: () => void;
  selectedIds: Set<string>;
  onToggleSelect: (item: MediaItem) => void;
  onPreview: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

export function MediaGrid({
  items,
  isLoading = false,
  isError = false,
  errorMessage = "Unable to load media assets from the server.",
  onRetry,
  isFiltered = false,
  onResetFilters,
  onOpenUpload,
  selectedIds,
  onToggleSelect,
  onPreview,
  onDelete,
}: MediaGridProps) {
  // 1. Loading Skeleton
  if (isLoading) {
    return (
      <div
        data-testid="media-loading-skeleton"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`media-skeleton-${i}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#E5EAED] bg-white shadow-xs animate-pulse"
          >
            <div className="aspect-4/3 w-full bg-[#E5EAED]" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-3/4 rounded-md bg-[#E5EAED]" />
              <div className="flex justify-between">
                <div className="h-2.5 w-1/3 rounded-md bg-[#E5EAED]" />
                <div className="h-2.5 w-1/4 rounded-md bg-[#E5EAED]" />
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5EAED]">
                <div className="h-3 w-16 rounded-md bg-[#E5EAED]" />
                <div className="h-3 w-16 rounded-md bg-[#E5EAED]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div
        data-testid="media-error-state"
        className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAED] bg-white px-6 py-16 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0EE] text-[#C0392B] border border-[#FCD2CD]">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[#18282A]">
          Failed to load media assets
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-[#74818A] leading-relaxed">
          {errorMessage}
        </p>
        {onRetry && (
          <Button
            type="button"
            size="sm"
            onClick={onRetry}
            data-testid="media-retry-btn"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#125261] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State (Filtered search vs empty repository)
  if (items.length === 0) {
    if (isFiltered) {
      return (
        <div
          data-testid="media-empty-search-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAED] bg-white px-6 py-16 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFB] text-[#74818A] border border-[#E5EAED]">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#18282A]">
            No matching media found
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-[#74818A] leading-relaxed">
            No assets match your search terms or filter criteria. Try adjusting your query or resetting filters.
          </p>
          {onResetFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              data-testid="media-reset-filters-btn"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl border-[#E5EAED] bg-white text-xs font-semibold text-[#176779] hover:bg-[#F8FAFB] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Search & Filters</span>
            </Button>
          )}
        </div>
      );
    }

    return (
      <div
        data-testid="media-empty-db-state"
        className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAED] bg-white px-6 py-20 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#176779] border border-[#A3E5D9]">
          <ImageIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#18282A]">
          No media uploaded yet
        </h3>
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#74818A] leading-relaxed">
          Your media library is currently empty. Upload photos, banners, and thumbnails directly to your Cloudinary storage.
        </p>
        {onOpenUpload && (
          <Button
            type="button"
            size="sm"
            onClick={onOpenUpload}
            data-testid="empty-upload-images-btn"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#125261] transition-colors cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload First Image</span>
          </Button>
        )}
      </div>
    );
  }

  // 4. Render Grid of Media Cards
  return (
    <div
      data-testid="media-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
    >
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          onToggleSelect={onToggleSelect}
          onPreview={onPreview}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
