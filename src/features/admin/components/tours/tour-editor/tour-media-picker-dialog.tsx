"use client";

import * as React from "react";
import { Search, UploadCloud, Check, Image as ImageIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetAdminMediaQuery } from "../../../api/admin-media-api";
import { MediaUploader } from "../../media/media-uploader";

export interface TourMediaPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectionMode: "cover" | "gallery";
  onSelectCover?: (url: string) => void;
  onSelectGallery?: (urls: string[]) => void;
  currentCover?: string;
  currentGallery?: string[];
}

function TourMediaPickerDialogInner({
  isOpen,
  onClose,
  selectionMode,
  onSelectCover,
  onSelectGallery,
  currentCover,
  currentGallery = [],
}: TourMediaPickerDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"browse" | "upload">("browse");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedUrls, setSelectedUrls] = React.useState<Set<string>>(new Set());

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query media library
  const { data: mediaData, isLoading, refetch } = useGetAdminMediaQuery({
    page: 1,
    limit: 36,
    search: debouncedSearch || undefined,
  });

  const mediaItems = mediaData?.data?.items || [];

  const handleToggleSelect = (url: string) => {
    if (selectionMode === "cover") {
      if (onSelectCover) {
        onSelectCover(url);
      }
      onClose();
    } else {
      setSelectedUrls((prev) => {
        const next = new Set(prev);
        if (next.has(url)) {
          next.delete(url);
        } else {
          next.add(url);
        }
        return next;
      });
    }
  };

  const handleConfirmGallerySelection = () => {
    if (onSelectGallery) {
      onSelectGallery(Array.from(selectedUrls));
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={selectionMode === "cover" ? "Select Cover Photo" : "Add Photos to Gallery"}
      size="xl"
    >
      <div className="space-y-4">
        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-b border-[#E5EAED] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("browse")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "browse"
                ? "bg-[#176779] text-white"
                : "bg-[#F8FAFB] text-[#74818A] hover:text-[#18282A]"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Browse Media Library</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#176779] text-white"
                : "bg-[#F8FAFB] text-[#74818A] hover:text-[#18282A]"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload New Images</span>
          </button>
        </div>

        {activeTab === "browse" ? (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media by title or tag..."
                className="pl-9 text-xs"
              />
            </div>

            {/* Media Grid */}
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-[#F0F4F6] animate-pulse"
                  />
                ))}
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E5EAED] py-12 text-center text-xs text-[#74818A]">
                <ImageIcon className="h-8 w-8 text-[#A0AEC0] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-[#18282A]">No media assets found</p>
                <p className="mt-1">
                  Upload images using the &quot;Upload New Images&quot; tab above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
                {mediaItems.map((item) => {
                  const isCurrentCover = currentCover === item.secureUrl;
                  const isAlreadyInGallery = currentGallery.includes(item.secureUrl);
                  const isSelectedInModal = selectedUrls.has(item.secureUrl);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.secureUrl)}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelectedInModal || isCurrentCover
                          ? "border-[#176779] shadow-md ring-2 ring-[#176779]/30"
                          : "border-transparent hover:border-[#A3E5D9]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.secureUrl}
                        alt={item.originalFilename || item.publicId || "Media"}
                        className="h-full w-full object-cover"
                      />

                      {/* Selection overlay indicator */}
                      {(isSelectedInModal || isCurrentCover) && (
                        <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#176779] text-white shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Cover Badge */}
                      {isCurrentCover && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#176779] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                          Cover
                        </span>
                      )}

                      {/* Already in Gallery Badge */}
                      {isAlreadyInGallery && selectionMode === "gallery" && !isSelectedInModal && (
                        <span className="absolute bottom-1 left-1 rounded bg-[#18282A]/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          In Gallery
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#E5EAED] pt-3 mt-4">
              <span className="text-xs text-[#74818A]">
                {selectionMode === "cover"
                  ? "Click an image to set it as the cover photo"
                  : `${selectedUrls.size} image(s) selected`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="text-xs"
                >
                  Cancel
                </Button>
                {selectionMode === "gallery" && (
                  <Button
                    type="button"
                    onClick={handleConfirmGallerySelection}
                    disabled={selectedUrls.size === 0}
                    className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#125261]"
                    data-testid="confirm-gallery-selection-btn"
                  >
                    Add {selectedUrls.size > 0 ? `(${selectedUrls.size})` : ""} to Gallery
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Direct Uploader Tab */
          <div className="space-y-4">
            <MediaUploader
              onUploadSuccess={() => {
                refetch();
                setActiveTab("browse");
              }}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function TourMediaPickerDialog(props: TourMediaPickerDialogProps) {
  if (!props.isOpen) return null;
  return <TourMediaPickerDialogInner {...props} />;
}
