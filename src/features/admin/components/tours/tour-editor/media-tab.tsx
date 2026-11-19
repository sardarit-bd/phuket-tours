"use client";

import * as React from "react";
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourMediaPickerDialog } from "./tour-media-picker-dialog";

export interface MediaFormData {
  featuredImage?: string;
  images: string[];
}

export interface MediaTabProps {
  data: MediaFormData;
  onChange: (updates: Partial<MediaFormData>) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const [pickerModal, setPickerModal] = React.useState<{
    isOpen: boolean;
    mode: "cover" | "gallery";
  }>({
    isOpen: false,
    mode: "cover",
  });

  const handleSetCover = (url: string) => {
    // If not in gallery, optionally add it to gallery as well
    const updates: Partial<MediaFormData> = { featuredImage: url };
    if (!data.images.includes(url)) {
      updates.images = [url, ...data.images];
    }
    onChange(updates);
  };

  const handleAddGalleryUrls = (newUrls: string[]) => {
    const existing = new Set(data.images);
    const combined = [...data.images];
    newUrls.forEach((u) => {
      if (!existing.has(u)) {
        combined.push(u);
      }
    });
    // If no cover is currently set and we have images, default the first one as cover
    const updates: Partial<MediaFormData> = { images: combined };
    if (!data.featuredImage && combined.length > 0) {
      updates.featuredImage = combined[0];
    }
    onChange(updates);
  };

  const handleRemoveCover = () => {
    onChange({ featuredImage: undefined });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const removedUrl = data.images[index];
    const updated = data.images.filter((_, idx) => idx !== index);
    const updates: Partial<MediaFormData> = { images: updated };
    // If the removed image was the cover photo, pick the new first image or clear
    if (data.featuredImage === removedUrl) {
      updates.featuredImage = updated.length > 0 ? updated[0] : undefined;
    }
    onChange(updates);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const images = [...data.images];
    const temp = images[index - 1];
    images[index - 1] = images[index];
    images[index] = temp;
    onChange({ images });
  };

  const handleMoveRight = (index: number) => {
    if (index >= data.images.length - 1) return;
    const images = [...data.images];
    const temp = images[index + 1];
    images[index + 1] = images[index];
    images[index] = temp;
    onChange({ images });
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Cover Photo */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              1. Cover Photo
            </h3>
            <p className="text-xs text-[#74818A] mt-0.5">
              The primary photo displayed across tour cards, search results, and booking pages.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerModal({ isOpen: true, mode: "cover" })}
            className="text-xs font-semibold text-[#176779] border-[#176779]/30 hover:bg-[#E8F8F5] cursor-pointer"
            data-testid="choose-cover-btn"
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            {data.featuredImage ? "Change Cover Photo" : "Upload / Set Cover Photo"}
          </Button>
        </div>

        {data.featuredImage ? (
          <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-[#E5EAED] group">
            <img
              src={data.featuredImage}
              alt="Tour cover preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerModal({ isOpen: true, mode: "cover" })}
                className="bg-white/90 text-xs font-semibold text-[#18282A] hover:bg-white cursor-pointer"
              >
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveCover}
                className="bg-white/90 text-xs font-semibold text-red-600 hover:bg-white cursor-pointer"
                data-testid="remove-cover-btn"
              >
                Remove Photo
              </Button>
            </div>
            <div className="absolute top-2 left-2 rounded-md bg-[#176779] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              ★ Cover Photo
            </div>
          </div>
        ) : (
          <div
            onClick={() => setPickerModal({ isOpen: true, mode: "cover" })}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5EAED] bg-[#F8FAFB] py-10 cursor-pointer hover:border-[#176779] transition-colors"
            data-testid="empty-cover-placeholder"
          >
            <ImageIcon className="h-8 w-8 text-[#A0AEC0] mb-2" />
            <p className="text-xs font-bold text-[#18282A]">No cover photo selected</p>
            <p className="text-[11px] text-[#74818A] mt-0.5">
              Click to select or upload a cover photo from your media library
            </p>
          </div>
        )}
      </div>

      {/* 2. Photo Gallery & Sequences */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              2. Tour Photos ({data.images.length})
            </h3>
            <p className="text-xs text-[#74818A] mt-0.5">
              Customers can view these photos in the gallery and image slider on the tour details page.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setPickerModal({ isOpen: true, mode: "gallery" })}
            className="bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
            data-testid="add-gallery-photos-btn"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Upload Photos
          </Button>
        </div>

        {data.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 pt-2">
            {data.images.map((url, idx) => {
              const isCover = data.featuredImage === url;
              return (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[#E5EAED] bg-[#F8FAFB] shadow-2xs hover:border-[#176779] transition-all"
                  data-testid={`gallery-image-card-${idx}`}
                >
                  <img
                    src={url}
                    alt={`Gallery photo ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />

                  {/* Order sequence badge */}
                  <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>

                  {isCover && (
                    <span className="absolute top-1.5 right-1.5 rounded-md bg-[#176779] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                      Cover
                    </span>
                  )}

                  {/* Hover Actions Toolbar */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        className="rounded p-1 hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                        title="Reorder Left"
                        aria-label="Reorder photo left"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === data.images.length - 1}
                        className="rounded p-1 hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                        title="Reorder Right"
                        aria-label="Reorder photo right"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(url)}
                          className="rounded p-1 hover:bg-white/20 text-amber-300 cursor-pointer"
                          title="Set as Cover Photo"
                          aria-label="Set as cover photo"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="rounded p-1 hover:bg-white/20 text-red-400 cursor-pointer"
                        title="Remove Photo"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E5EAED] p-8 text-center text-xs text-[#74818A]">
            No gallery images added yet. Click &quot;Upload Photos&quot; above to select or upload images.
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <TourMediaPickerDialog
        isOpen={pickerModal.isOpen}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
        selectionMode={pickerModal.mode}
        onSelectCover={handleSetCover}
        onSelectGallery={handleAddGalleryUrls}
        currentCover={data.featuredImage}
        currentGallery={data.images}
      />
    </div>
  );
}
