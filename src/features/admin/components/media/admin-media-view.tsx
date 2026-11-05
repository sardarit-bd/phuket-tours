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
import { Pagination } from "@/components/shared/pagination";

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
        <Pagination
          currentPage={page}
          pageSize={limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          pageSizeOptions={[12, 24, 48]}
          pageSizeLabel="Per page:"
          itemLabel="assets"
          isFetching={isFetching}
          dataTestId="media-pagination"
          buttonTestIdPrefix="media-pagination"
        />
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
