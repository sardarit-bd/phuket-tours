"use client";

import * as React from "react";
import {
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RefreshCw,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryImage, MediaItem } from "../../types/admin-media";
import { Dialog } from "@/components/ui/dialog";

export interface MediaGalleryManagerProps {
  images: GalleryImage[];
  onChange?: (updatedImages: GalleryImage[]) => void;
  availableMedia?: MediaItem[];
  maxImages?: number;
}

export function MediaGalleryManager({
  images,
  onChange,
  availableMedia = [],
  maxImages = 12,
}: MediaGalleryManagerProps) {
  const [localGallery, setLocalGallery] = React.useState<GalleryImage[]>(images);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [replacingIndex, setReplacingIndex] = React.useState<number | null>(null);

  const gallery = onChange ? images : localGallery;

  const updateGallery = (newGallery: GalleryImage[]) => {
    if (onChange) {
      onChange(newGallery);
    } else {
      setLocalGallery(newGallery);
    }
  };

  const handleSetCover = (index: number) => {
    const updated = gallery.map((item, idx) => ({
      ...item,
      isCover: idx === index,
    }));
    updateGallery(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const updated = [...gallery];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    updateGallery(updated);
  };

  const handleRemove = (index: number) => {
    const updated = gallery.filter((_, idx) => idx !== index);
    // If the removed item was cover and items remain, designate first as cover
    if (gallery[index]?.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    updateGallery(updated);
  };

  const handleSelectMediaForSlot = (mediaItem: MediaItem) => {
    if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < gallery.length) {
      // Replace existing slot
      const updated = [...gallery];
      updated[replacingIndex] = {
        ...updated[replacingIndex],
        id: mediaItem.id,
        url: mediaItem.secureUrl,
        publicId: mediaItem.publicId,
      };
      updateGallery(updated);
      setReplacingIndex(null);
    } else {
      // Add as new item to gallery
      const isFirst = gallery.length === 0;
      const newItem: GalleryImage = {
        id: mediaItem.id,
        url: mediaItem.secureUrl,
        publicId: mediaItem.publicId,
        isCover: isFirst,
      };
      updateGallery([...gallery, newItem]);
    }
    setIsPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-outfit text-base font-bold text-[#18282A]">
            Tour Gallery Management
          </h3>
          <p className="text-xs text-[#74818A]">
            Organize gallery ordering, designate the main cover hero, and manage gallery assets. ({gallery.length}/{maxImages})
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={gallery.length >= maxImages}
          onClick={() => {
            setReplacingIndex(null);
            setIsPickerOpen(true);
          }}
          data-testid="gallery-add-image-btn"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#125261] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Gallery Image</span>
        </Button>
      </div>

      {gallery.length === 0 ? (
        <div
          data-testid="gallery-empty-state"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5EAED] bg-[#F8FAFB] py-12 text-center"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F6F8] text-[#176779]">
            <ImageIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-xs font-semibold text-[#18282A]">No gallery images selected</p>
          <p className="mt-1 max-w-xs text-[11px] text-[#74818A]">
            Choose images from the Media Library to build a tour gallery. The first image will be set as cover.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setReplacingIndex(null);
              setIsPickerOpen(true);
            }}
            className="mt-4 rounded-xl bg-[#176779] text-xs font-semibold text-white hover:bg-[#125261] cursor-pointer"
          >
            Select from Library
          </Button>
        </div>
      ) : (
        <div
          data-testid="gallery-grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
        >
          {gallery.map((image, index) => (
            <div
              key={image.id || index}
              data-testid={`gallery-item-${index}`}
              className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-2xs transition-all ${
                image.isCover
                  ? "border-[#176779] ring-2 ring-[#176779]/20"
                  : "border-[#E5EAED] hover:border-[#C9D6D8]"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F0F4F6]">
                <img
                  src={image.url}
                  alt={`Gallery item ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Top Badges */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 bg-gradient-to-b from-black/40 to-transparent">
                  <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    #{index + 1}
                  </span>

                  {image.isCover ? (
                    <span
                      data-testid={`gallery-cover-badge-${index}`}
                      className="inline-flex items-center gap-1 rounded-md bg-[#176779] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs"
                    >
                      <Star className="h-3 w-3 fill-current" />
                      <span>Cover Image</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      data-testid={`gallery-set-cover-btn-${index}`}
                      title="Set as Cover Image"
                      className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/90 hover:bg-[#176779] hover:text-white cursor-pointer"
                    >
                      <Star className="h-3 w-3" />
                      <span>Set Cover</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Controls Toolbar */}
              <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-2 py-1.5 text-xs text-[#74818A]">
                {/* Reorder Left/Right */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "left")}
                    data-testid={`gallery-move-left-${index}`}
                    aria-label="Move image left"
                    className="p-1 text-[#74818A] hover:text-[#18282A] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === gallery.length - 1}
                    onClick={() => handleMove(index, "right")}
                    data-testid={`gallery-move-right-${index}`}
                    aria-label="Move image right"
                    className="p-1 text-[#74818A] hover:text-[#18282A] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Replace and Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingIndex(index);
                      setIsPickerOpen(true);
                    }}
                    data-testid={`gallery-replace-btn-${index}`}
                    title="Replace Image"
                    className="p-1 text-[#74818A] hover:text-[#176779] cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    data-testid={`gallery-remove-btn-${index}`}
                    title="Remove from Gallery"
                    className="p-1 text-[#74818A] hover:text-[#C0392B] cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      <Dialog
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setReplacingIndex(null);
        }}
        size="lg"
        title={replacingIndex !== null ? "Replace Gallery Image" : "Add Gallery Image"}
        description="Select an asset from the Media Library to add to this gallery."
      >
        {availableMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-[#74818A]">
            <ImageIcon className="h-8 w-8 text-[#A8B7BE]" />
            <p className="mt-2 font-medium text-[#18282A]">No media assets found in library</p>
            <p className="mt-1">Upload images into the Media Library first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-96 overflow-y-auto p-1">
            {availableMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectMediaForSlot(item)}
                data-testid={`picker-item-${item.id}`}
                className="group relative aspect-4/3 overflow-hidden rounded-xl border border-[#E5EAED] bg-[#F0F4F6] cursor-pointer hover:border-[#176779] hover:shadow-xs"
              >
                <img
                  src={item.secureUrl}
                  alt={item.originalFilename || "Media asset"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#176779]">
                    Select
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
}
