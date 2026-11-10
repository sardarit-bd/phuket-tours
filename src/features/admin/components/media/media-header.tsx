"use client";

import * as React from "react";
import { Image as ImageIcon, UploadCloud, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaHeaderProps {
  totalCount?: number;
  isLoading?: boolean;
  onOpenUpload: () => void;
  onOpenGalleryManager?: () => void;
}

export function MediaHeader({
  totalCount,
  isLoading = false,
  onOpenUpload,
  onOpenGalleryManager,
}: MediaHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F6F8] text-[#176779]">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
              Media Library
            </h1>
            {totalCount !== undefined && (
              <span
                data-testid="media-total-count-badge"
                className="inline-flex items-center rounded-full bg-[#E8F6F8] px-2.5 py-0.5 text-xs font-semibold text-[#176779] border border-[#C9D6D8]/50"
              >
                {isLoading ? "..." : `${totalCount.toLocaleString()} Assets`}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#74818A]">
          Manage, upload, and inspect media assets for PhuketTours services and destinations.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenGalleryManager && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenGalleryManager}
            className="inline-flex items-center gap-2 rounded-xl border-[#E5EAED] bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#18282A] shadow-xs hover:bg-[#F8FAFB] transition-colors cursor-pointer"
            data-testid="open-gallery-manager-button"
          >
            <Images className="h-4 w-4 text-[#176779]" />
            <span>Gallery Workspace</span>
          </Button>
        )}

        <Button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-[#176779] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#125261] transition-colors cursor-pointer"
          data-testid="open-upload-modal-button"
        >
          <UploadCloud className="h-4 w-4 stroke-[2.5]" />
          <span>Upload Images</span>
        </Button>
      </div>
    </div>
  );
}
