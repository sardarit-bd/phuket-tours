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
  useBulkDeleteAdminMediaMutation,
} from "../../api/admin-media-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import type { MediaItem, GalleryImage } from "../../types/admin-media";
import { Pagination } from "@/components/shared/pagination";

export function AdminMediaView() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(24);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filterUnattached, setFilterUnattached] = React.useState<"all" | "true" | "false">("all");
  const [filterFormat, setFilterFormat] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "name">("newest");

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<MediaItem | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = React.useState<{
    deleted: Array<{ id: string; publicId: string }>;
    blocked: Array<{ id: string; publicId?: string; reason: string }>;
  } | null>(null);

  const [bulkDeleteAdminMedia, { isLoading: isBulkDeleting }] = useBulkDeleteAdminMediaMutation();

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

  // Reset selection when page or filters change
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [page, limit, filterUnattached, filterFormat, sortBy]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (val: "all" | "true" | "false") => {
    setFilterUnattached(val);
    setPage(1);
  };

  const handleFormatChange = (val: string) => {
    setFilterFormat(val);
    setPage(1);
  };

  const handleSortChange = (val: "newest" | "oldest" | "name") => {
    setSortBy(val);
    setPage(1);
  };

  const queryParams = React.useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      unattached?: "true" | "false";
      format?: string;
      sortBy?: "newest" | "oldest" | "name";
    } = { page, limit };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (filterUnattached !== "all") {
      params.unattached = filterUnattached;
    }
    if (filterFormat !== "all") {
      params.format = filterFormat;
    }
    if (sortBy !== "newest") {
      params.sortBy = sortBy;
    }
    return params;
  }, [page, limit, debouncedSearch, filterUnattached, filterFormat, sortBy]);

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
    limit: 24,
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
    return formatErrorMessage(error, "An error occurred while loading media assets.");
  }, [error]);

  const isFiltered = Boolean(debouncedSearch || filterUnattached !== "all");

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilterUnattached("all");
    setFilterFormat("all");
    setSortBy("newest");
    setPage(1);
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const res = await bulkDeleteAdminMedia({
        mediaIds: Array.from(selectedIds),
      }).unwrap();
      if (res.data) {
        setBulkDeleteResult(res.data);
        // Remove successfully deleted from selectedIds
        const deletedIds = new Set(res.data.deleted.map((d) => d.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          deletedIds.forEach((id) => next.delete(id));
          return next;
        });
        refetch();
      }
    } catch (err) {
      // Handled via alert / toast
    }
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
        filterFormat={filterFormat}
        onFormatChange={handleFormatChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        selectedCount={selectedIds.size}
        totalOnPage={items.length}
        onToggleSelectAll={handleToggleSelectAll}
        isAllSelected={isAllSelected}
        onClearSelection={handleClearSelection}
        onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
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
          pageSizeOptions={[24, 36, 48]}
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

      {/* 8. Bulk Deletion Confirmation Modal */}
      <Dialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          setIsBulkDeleteModalOpen(false);
          setBulkDeleteResult(null);
        }}
        size="md"
        title="Confirm Bulk Asset Deletion"
        description="Verify the media assets you want to permanently delete from Cloudinary storage and database."
      >
        <div className="space-y-4">
          {!bulkDeleteResult ? (
            <>
              <p className="text-xs sm:text-sm text-[#74818A]">
                You have selected <strong className="text-[#18282A]">{selectedIds.size}</strong> asset(s) for deletion.
                Assets currently attached to or referenced by active tours will be protected and preserved.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isBulkDeleting}
                  className="rounded-xl border border-[#E5EAED] bg-white px-3.5 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  disabled={isBulkDeleting}
                  data-testid="confirm-bulk-delete-btn"
                  className="rounded-xl bg-[#C0392B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#962D22] disabled:opacity-50"
                >
                  {isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.size} Assets`}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#E8F8F5] p-3 text-xs text-[#176779]">
                ✓ Successfully deleted <strong>{bulkDeleteResult.deleted.length}</strong> unattached asset(s).
              </div>
              {bulkDeleteResult.blocked.length > 0 && (
                <div className="rounded-xl bg-[#FDF0EE] p-3 text-xs text-[#C0392B] space-y-1">
                  <p className="font-semibold">
                    Protected {bulkDeleteResult.blocked.length} asset(s) referenced by active tours:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {bulkDeleteResult.blocked.map((b) => (
                      <li key={b.id}>{b.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkDeleteModalOpen(false);
                    setBulkDeleteResult(null);
                  }}
                  className="rounded-xl bg-[#176779] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#125261]"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
