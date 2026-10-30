"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { MediaHeader } from "./media-header";
import { MediaToolbar } from "./media-toolbar";
import { MediaGrid } from "./media-grid";
import { MediaUploader } from "./media-uploader";
import { MediaDetailDialog } from "./media-detail-dialog";
import { MediaGalleryManager } from "./media-gallery-manager";
import {
  useGetAdminMediaQuery,
} from "../../api/admin-media-api";
import type { MediaItem, GalleryImage } from "../../types/admin-media";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminMediaView() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filterUnattached, setFilterUnattached] = React.useState<"all" | "true" | "false">("all");

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<MediaItem | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  // Gallery workspace demo state
  const [galleryImages, setGalleryImages] = React.useState<GalleryImage[]>([]);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (val: "all" | "true" | "false") => {
    setFilterUnattached(val);
    setPage(1);
  };

  const queryParams = React.useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      unattached?: "true" | "false";
    } = { page, limit };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (filterUnattached !== "all") {
      params.unattached = filterUnattached;
    }
    return params;
  }, [page, limit, debouncedSearch, filterUnattached]);

  const {
    data: mediaResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminMediaQuery(queryParams);

  const items = mediaResponse?.data?.items || [];
  const pagination = mediaResponse?.data?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  };

  // Selection logic
  const handleToggleSelect = (item: MediaItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Error message formatting
  const errorMessage = React.useMemo(() => {
    if (!error) return "Unable to load media assets from server.";
    const errObj = error as { status?: number; data?: { message?: string } };
    return errObj?.data?.message || "An error occurred while loading media assets.";
  }, [error]);

  const isFiltered = Boolean(debouncedSearch || filterUnattached !== "all");

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilterUnattached("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <MediaHeader
        totalCount={pagination.total}
        isLoading={isLoading}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGalleryManager={() => setIsGalleryOpen(true)}
      />

      {/* 2. Toolbar */}
      <MediaToolbar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        filterUnattached={filterUnattached}
        onFilterChange={handleFilterChange}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        selectedCount={selectedIds.size}
        totalOnPage={items.length}
        onToggleSelectAll={handleToggleSelectAll}
        isAllSelected={isAllSelected}
        onClearSelection={handleClearSelection}
      />

      {/* 3. Media Grid */}
      <MediaGrid
        items={items}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetry={() => refetch()}
        isFiltered={isFiltered}
        onResetFilters={handleResetFilters}
        onOpenUpload={() => setIsUploadOpen(true)}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onPreview={(item) => setPreviewItem(item)}
        onDelete={(item) => setPreviewItem(item)}
      />

      {/* 4. Pagination */}
      {!isLoading && !isError && pagination.total > 0 && (
        <div
          data-testid="media-pagination"
          className="flex flex-col items-center justify-between gap-4 border-t border-[#E5EAED] bg-white px-6 py-4 sm:flex-row rounded-2xl border shadow-xs"
        >
          <div className="flex items-center gap-3 text-xs text-[#74818A]">
            <span>
              Showing{" "}
              <strong className="font-semibold text-[#18282A]">
                {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-[#18282A]">
                {pagination.total.toLocaleString()}
              </strong>{" "}
              assets
            </span>

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-[#B0BCC2]">•</span>
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Items per page"
                disabled={isFetching}
                className="rounded-lg border border-[#E5EAED] bg-white px-2 py-1 text-xs font-medium text-[#18282A] focus:border-[#176779] focus:outline-none"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1 || isFetching}
              aria-label="First page"
              data-testid="media-pagination-first"
              className="h-8 w-8 p-0 rounded-lg text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              aria-label="Previous page"
              data-testid="media-pagination-prev"
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <span className="px-3 text-xs font-semibold text-[#18282A]">
              Page {page} of {pagination.totalPages || 1}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || isFetching}
              aria-label="Next page"
              data-testid="media-pagination-next"
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.totalPages)}
              disabled={page >= pagination.totalPages || isFetching}
              aria-label="Last page"
              data-testid="media-pagination-last"
              className="h-8 w-8 p-0 rounded-lg text-[#74818A] hover:text-[#18282A] disabled:opacity-40"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 5. Upload Modal */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        size="lg"
        title="Upload Media Assets"
        description="Select images or drop them directly to upload to Cloudinary CDN storage."
      >
        <MediaUploader
          onUploadSuccess={() => {
            refetch();
          }}
        />
      </Dialog>

      {/* 6. Media Item Details & Deletion Dialog */}
      <MediaDetailDialog
        key={previewItem?.id ?? "closed"}
        item={previewItem}
        isOpen={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        onDeleted={() => {
          setPreviewItem(null);
          refetch();
        }}
      />

      {/* 7. Gallery Workspace Modal */}
      <Dialog
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        size="xl"
        title="Gallery Management Workspace"
        description="Interactive standalone workspace for organizing tour image galleries, cover photos, and order sequences."
      >
        <MediaGalleryManager
          images={galleryImages}
          onChange={setGalleryImages}
          availableMedia={items}
        />
      </Dialog>
    </div>
  );
}
