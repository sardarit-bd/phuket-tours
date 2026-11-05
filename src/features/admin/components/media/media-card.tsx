"use client";

import * as React from "react";
import { Check, Copy, Trash2, Eye, Image as ImageIcon } from "lucide-react";
import type { MediaItem } from "../../types/admin-media";
import { formatBytes } from "../../utils/cloudinary-upload";

export interface MediaCardProps {
  item: MediaItem;
  isSelected?: boolean;
  onToggleSelect?: (item: MediaItem) => void;
  onPreview?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
}

export function MediaCard({
  item,
  isSelected = false,
  onToggleSelect,
  onPreview,
  onDelete,
}: MediaCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const formattedDate = React.useMemo(() => {
    try {
      return new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  }, [item.createdAt]);

  const displayName = item.originalFilename || item.publicId.split("/").pop() || "media-asset";
  const isAttached = Boolean(item.serviceId || item.service);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(item.secureUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(item);
  };

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) onToggleSelect(item);
  };

  const handlePreview = () => {
    if (onPreview) onPreview(item);
  };

  return (
    <div
      data-testid={`media-card-${item.id}`}
      onClick={handlePreview}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer w-full ${
        isSelected
          ? "border-[#176779] ring-2 ring-[#176779]/20"
          : "border-[#E5EAED] hover:border-[#B6C7CC]"
      }`}
    >
      {/* Thumbnail Container: 1:1 Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F0F4F6]">
        {!imgError ? (
          <img
            src={item.secureUrl}
            alt={displayName}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-[#74818A]">
            <ImageIcon className="h-7 w-7 text-[#A8B7BE]" />
            <span className="mt-1 text-[11px]">Preview unavailable</span>
          </div>
        )}

        {/* Top Overlay: Selection Checkbox & Format Badge */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 bg-gradient-to-b from-black/50 via-black/20 to-transparent">
          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleSelect}
            aria-label={`Select ${displayName}`}
            data-testid={`media-checkbox-${item.id}`}
            className={`flex h-5.5 w-5.5 items-center justify-center rounded-md border transition-all cursor-pointer ${
              isSelected
                ? "bg-[#176779] border-[#176779] text-white shadow-xs"
                : "bg-white/85 border-white/70 text-transparent hover:bg-white shadow-xs"
            }`}
          >
            <Check className={`h-3.5 w-3.5 stroke-[3] ${isSelected ? "text-white" : "opacity-0"}`} />
          </button>

          {/* Format badge */}
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
            {item.format}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePreview();
            }}
            data-testid={`media-preview-btn-${item.id}`}
            title="Preview Details"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-[#18282A] shadow-xs hover:bg-white hover:scale-105 transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyUrl}
            data-testid={`media-copy-btn-${item.id}`}
            title={copied ? "Copied!" : "Copy URL"}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-[#18282A] shadow-xs hover:bg-white hover:scale-105 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              data-testid={`media-delete-btn-${item.id}`}
              title="Delete Media"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-[#C0392B] shadow-xs hover:bg-red-50 hover:scale-105 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Info Body - Compact Metadata */}
      <div className="flex flex-1 flex-col p-2.5">
        {/* Filename: single line with ellipsis */}
        <h4
          title={displayName}
          className="truncate text-xs font-semibold text-[#18282A] leading-tight"
        >
          {displayName}
        </h4>

        {/* Dimensions & File Size */}
        <div className="mt-1 flex items-center justify-between text-[11px] text-[#74818A]">
          <span className="truncate">
            {item.width && item.height ? `${item.width} × ${item.height}` : "Vector"}
          </span>
          <span className="font-medium text-[#18282A] shrink-0 ml-1">{formatBytes(item.bytes)}</span>
        </div>

        {/* Bottom row: Attachment status & Upload date */}
        <div className="mt-2 flex items-center justify-between border-t border-[#E5EAED]/60 pt-1.5 text-[10px]">
          {isAttached ? (
            <span
              title={`Attached to ${item.service?.name || "Tour"}`}
              className="inline-flex max-w-[85px] sm:max-w-[100px] truncate items-center rounded-md bg-[#E8F8F5] px-1.5 py-0.5 font-semibold text-[#176779]"
            >
              Attached
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-[#F0F4F6] px-1.5 py-0.5 font-semibold text-[#74818A]">
              Unattached
            </span>
          )}

          <span className="text-[#8A9A9C] truncate ml-1">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
