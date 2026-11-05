"use client";

import * as React from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "../../types/admin-media";
import { formatBytes } from "../../utils/cloudinary-upload";
import { useDeleteAdminMediaMutation } from "../../api/admin-media-api";

export interface MediaDetailDialogProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (mediaId: string) => void;
}

export function MediaDetailDialog({
  item,
  isOpen,
  onClose,
  onDeleted,
}: MediaDetailDialogProps) {
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteAdminMediaMutation();
  const [copied, setCopied] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleClose = () => {
    setCopied(false);
    setConfirmDelete(false);
    setErrorMessage(null);
    onClose();
  };

  if (!item || !isOpen) return null;

  const handleCopyUrl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(item.secureUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      const res = await deleteMedia(item.id).unwrap();
      if (res.success) {
        if (onDeleted) onDeleted(item.id);
        handleClose();
      }
    } catch (err: unknown) {
      const errorObj = err as { status?: number; data?: { message?: string } };
      if (errorObj?.status === 409) {
        setErrorMessage(
          errorObj?.data?.message ||
            "Cannot delete media: it is currently referenced by one or more tours/services."
        );
      } else {
        setErrorMessage(
          errorObj?.data?.message ||
            "Failed to delete media asset. Please try again later."
        );
      }
    }
  };

  const displayName = item.originalFilename || item.publicId.split("/").pop() || "media-asset";
  const formattedDate = new Date(item.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Media Details"
      description="Inspect image metadata, dimensions, and CDN delivery information."
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Image Preview Surface */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
          <div className="relative flex max-h-[380px] w-full items-center justify-center overflow-hidden rounded-xl">
            <img
              src={item.secureUrl}
              alt={displayName}
              className="max-h-[360px] w-auto max-w-full rounded-lg object-contain shadow-xs"
            />
          </div>

          <div className="mt-4 flex w-full items-center justify-between gap-2 border-t border-[#E5EAED] pt-3 text-xs text-[#74818A]">
            <span className="truncate font-medium text-[#18282A]">{displayName}</span>
            <a
              href={item.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="media-open-new-tab-btn"
              className="inline-flex items-center gap-1 font-semibold text-[#176779] hover:underline"
            >
              <span>View Fullscreen</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Right: Metadata & Actions */}
        <div className="flex w-full flex-col justify-between lg:w-80">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider">
                Cloudinary CDN URL
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={item.secureUrl}
                  data-testid="media-dialog-url-input"
                  className="flex-1 truncate rounded-lg border border-[#E5EAED] bg-white px-2.5 py-1.5 text-xs text-[#18282A] focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  data-testid="media-dialog-copy-btn"
                  className="h-8.5 rounded-lg border-[#E5EAED] bg-white px-2.5 text-xs font-semibold text-[#176779] hover:bg-[#F0F4F6] cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <span className="mt-1 block text-[11px] font-medium text-emerald-600">
                  URL copied to clipboard!
                </span>
              )}
            </div>

            {/* Metadata Definition List */}
            <div className="divide-y divide-[#E5EAED] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Dimensions</span>
                <span className="font-semibold text-[#18282A]">
                  {item.width && item.height
                    ? `${item.width} × ${item.height} px`
                    : "Responsive"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">File Size</span>
                <span className="font-semibold text-[#18282A]">
                  {formatBytes(item.bytes)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Format</span>
                <span className="font-semibold uppercase text-[#18282A]">
                  {item.format}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Folder</span>
                <span className="font-mono text-[11px] text-[#18282A]">
                  {item.folder}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Public ID</span>
                <span
                  title={item.publicId}
                  className="max-w-[170px] truncate font-mono text-[11px] text-[#18282A]"
                >
                  {item.publicId}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Associated Tour</span>
                <span className="font-semibold text-[#18282A]">
                  {item.service ? (
                    <span className="text-[#176779]">{item.service.name}</span>
                  ) : (
                    <span className="text-[#74818A]">Unattached</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#74818A]">Uploaded On</span>
                <span className="text-[#18282A]">{formattedDate}</span>
              </div>
            </div>

            {/* Error Message if deletion was blocked (e.g. 409 conflict) */}
            {errorMessage && (
              <div
                data-testid="media-delete-error"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Delete actions */}
          <div className="mt-6 border-t border-[#E5EAED] pt-4">
            {!confirmDelete ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                data-testid="media-trigger-delete-btn"
                className="w-full rounded-xl border-red-200 text-xs font-semibold text-[#C0392B] hover:bg-red-50 hover:border-red-300 cursor-pointer"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                <span>Delete Asset</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#C0392B]">
                  Are you sure you want to permanently delete this asset?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    data-testid="media-confirm-delete-btn"
                    className="flex-1 rounded-xl bg-[#C0392B] text-xs font-semibold text-white hover:bg-[#962D22] cursor-pointer"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => {
                      setConfirmDelete(false);
                      setErrorMessage(null);
                    }}
                    data-testid="media-cancel-delete-btn"
                    className="rounded-xl border-[#E5EAED] text-xs font-medium text-[#74818A] hover:bg-[#F8FAFB] cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
