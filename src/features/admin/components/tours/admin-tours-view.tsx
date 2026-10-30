"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  useGetAdminServicesQuery,
  useUpdateAdminServiceStatusMutation,
  useBulkUpdateAdminServiceStatusMutation,
} from "../../api/admin-api";
import { ToursHeader } from "./tours-header";
import { ToursSummaryCards } from "./tours-summary-cards";
import { ToursToolbar } from "./tours-toolbar";
import { ToursTable } from "./tours-table";
import { ToursPagination } from "./tours-pagination";
import { ToursTableSkeleton } from "./tours-table-skeleton";
import { ToursEmptyState } from "./tours-empty-state";
import { ToursErrorState } from "./tours-error-state";
import { BulkActionBar } from "./bulk-action-bar";
import { BulkConfirmDialog } from "./bulk-confirm-dialog";
import { TourDetailsDialog } from "./tour-details-dialog";
import { AddTourDialog } from "./add-tour-dialog";
import type {
  AdminServiceRecord,
  AdminServiceStatus,
  AdminServiceSortField,
  AdminSortOrder,
} from "../../types/admin";

interface ActionFeedback {
  type: "success" | "warning" | "error";
  message: string;
}

export function AdminToursView() {
  // 1. Filter and sorting state
  const [search, setSearch] = React.useState<string>("");
  const [status, setStatus] = React.useState<AdminServiceStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = React.useState<AdminServiceSortField>("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<AdminSortOrder>("desc");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // 2. Selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // 3. Modals and feedback state
  const [activeTourForDetails, setActiveTourForDetails] =
    React.useState<AdminServiceRecord | null>(null);
  const [addTourModal, setAddTourModal] = React.useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    tourName?: string;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [bulkConfirmModal, setBulkConfirmModal] = React.useState<{
    isOpen: boolean;
    targetStatus: AdminServiceStatus;
  }>({
    isOpen: false,
    targetStatus: "PUBLISHED",
  });
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  // Auto-dismiss feedback after 6 seconds
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // When search changes: auto-set sort to relevance if not already set, or updatedAt if cleared
  const handleSearchChange = React.useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
      setPage(1);
      setSelectedIds([]);
      if (newSearch.trim() && sortBy === "updatedAt") {
        setSortBy("relevance");
      } else if (!newSearch.trim() && sortBy === "relevance") {
        setSortBy("updatedAt");
      }
    },
    [sortBy]
  );

  const handleStatusChange = React.useCallback(
    (newStatus: AdminServiceStatus | "ALL") => {
      setStatus(newStatus);
      setPage(1);
      setSelectedIds([]);
    },
    []
  );

  const handleSortByChange = React.useCallback(
    (field: AdminServiceSortField) => {
      setSortBy(field);
      setPage(1);
    },
    []
  );

  const handleSortOrderToggle = React.useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSearch("");
    setStatus("ALL");
    setSortBy("updatedAt");
    setSortOrder("desc");
    setPage(1);
    setSelectedIds([]);
  }, []);

  // 4. API Queries
  // Main table list query
  const queryParams = {
    type: "TOUR" as const,
    page,
    limit: pageSize,
    search: search.trim() ? search.trim() : undefined,
    status: status !== "ALL" ? status : undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useGetAdminServicesQuery(queryParams);

  // Summary counts queries (lightweight limit: 1 queries returning exact PostgreSQL counts)
  const { data: totalData, isLoading: isTotalLoading } =
    useGetAdminServicesQuery({ type: "TOUR", limit: 1 });
  const { data: publishedData, isLoading: isPublishedLoading } =
    useGetAdminServicesQuery({
      type: "TOUR",
      limit: 1,
      status: "PUBLISHED",
    });
  const { data: draftData, isLoading: isDraftLoading } =
    useGetAdminServicesQuery({
      type: "TOUR",
      limit: 1,
      status: "DRAFT",
    });
  const { data: unpublishedData, isLoading: isUnpublishedLoading } =
    useGetAdminServicesQuery({
      type: "TOUR",
      limit: 1,
      status: "UNPUBLISHED",
    });

  const summaryCounts = {
    total: totalData?.data?.pagination?.total,
    published: publishedData?.data?.pagination?.total,
    draft: draftData?.data?.pagination?.total,
    unpublished: unpublishedData?.data?.pagination?.total,
  };

  const isSummaryLoading =
    isTotalLoading || isPublishedLoading || isDraftLoading || isUnpublishedLoading;

  // 5. Mutations
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateAdminServiceStatusMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] =
    useBulkUpdateAdminServiceStatusMutation();

  // 6. Selection Handlers
  const tours = React.useMemo(() => listData?.data?.items || [], [listData?.data?.items]);
  const pagination = listData?.data?.pagination;

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = React.useCallback(() => {
    if (tours.length === 0) return;
    const allVisibleSelected = tours.every((t) => selectedIds.includes(t.id));

    if (allVisibleSelected) {
      // Deselect visible
      const visibleIds = new Set(tours.map((t) => t.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      // Select visible
      const current = new Set(selectedIds);
      tours.forEach((t) => current.add(t.id));
      setSelectedIds(Array.from(current));
    }
  }, [tours, selectedIds]);

  const handleClearSelection = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 7. Action Handlers
  const handleSingleStatusChange = async (
    serviceId: string,
    targetStatus: AdminServiceStatus
  ) => {
    try {
      await updateStatus({ serviceId, status: targetStatus }).unwrap();
      setFeedback({
        type: "success",
        message: `Tour status successfully updated to ${targetStatus}.`,
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setFeedback({
        type: "error",
        message:
          errorObj?.data?.message ||
          "Failed to update tour status. Please try again.",
      });
    }
  };

  const handleInitiateBulkAction = (targetStatus: AdminServiceStatus) => {
    setBulkConfirmModal({
      isOpen: true,
      targetStatus,
    });
  };

  const handleConfirmBulkAction = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await bulkUpdateStatus({
        serviceIds: selectedIds,
        status: bulkConfirmModal.targetStatus,
      }).unwrap();

      const updatedCount = res.data?.updatedCount ?? selectedIds.length;
      const notFoundCount = res.data?.notFoundIds?.length ?? 0;

      if (notFoundCount > 0) {
        setFeedback({
          type: "warning",
          message: `Updated ${updatedCount} tours to ${bulkConfirmModal.targetStatus}. ${notFoundCount} tours were not found.`,
        });
      } else {
        setFeedback({
          type: "success",
          message: `Successfully updated ${updatedCount} ${
            updatedCount === 1 ? "tour" : "tours"
          } to ${bulkConfirmModal.targetStatus}.`,
        });
      }

      setSelectedIds([]);
      setBulkConfirmModal({ isOpen: false, targetStatus: "PUBLISHED" });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      setFeedback({
        type: "error",
        message:
          errorObj?.data?.message ||
          "Failed to apply bulk status update. Please try again.",
      });
      setBulkConfirmModal({ isOpen: false, targetStatus: "PUBLISHED" });
    }
  };

  const isFiltered = Boolean(search.trim() || status !== "ALL");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ToursHeader
        totalCount={summaryCounts.total}
        isLoading={isTotalLoading}
        onAddNewTour={() =>
          setAddTourModal({ isOpen: true, mode: "create" })
        }
      />

      {/* Summary Cards */}
      <ToursSummaryCards
        counts={summaryCounts}
        isLoading={isSummaryLoading}
        activeStatus={status}
        onSelectStatus={(selected) => handleStatusChange(selected)}
      />

      {/* Feedback Toast / Alert Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          data-testid="tours-feedback-banner"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs sm:text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "border-[#A3E5D9] bg-[#E8F8F5] text-[#0E7A67]"
              : feedback.type === "warning"
              ? "border-[#FCE8B2] bg-[#FEF9E7] text-[#B7791F]"
              : "border-[#FCD2CD] bg-[#FDF0EE] text-[#C0392B]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0E7A67]" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded p-1 hover:opacity-70 transition-opacity"
            aria-label="Dismiss feedback message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <ToursToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderToggle={handleSortOrderToggle}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Table Container Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
        {/* Loading overlay indicator for background refetching */}
        {isListFetching && !isListLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#176779] animate-pulse z-10" />
        )}

        {/* State Rendering */}
        {isListLoading ? (
          <ToursTableSkeleton rowCount={pageSize > 10 ? 10 : pageSize} />
        ) : isListError ? (
          <ToursErrorState
            errorMessage={
              (listError as { data?: { message?: string } })?.data?.message ||
              "Failed to communicate with the tours service. Please retry."
            }
            onRetry={refetchList}
          />
        ) : tours.length === 0 ? (
          <ToursEmptyState
            isFiltered={isFiltered}
            onResetFilters={handleResetFilters}
            onAddNewTour={() =>
              setAddTourModal({ isOpen: true, mode: "create" })
            }
          />
        ) : (
          <>
            <ToursTable
              tours={tours}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onViewDetails={(tour) => setActiveTourForDetails(tour)}
              onEditTour={(tour) =>
                setAddTourModal({
                  isOpen: true,
                  mode: "edit",
                  tourName: tour.name,
                })
              }
              onStatusChange={handleSingleStatusChange}
              isStatusUpdating={isStatusUpdating}
            />

            {/* Server-side Pagination */}
            {pagination && (
              <ToursPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(p) => {
                  setPage(p);
                  setSelectedIds([]);
                }}
                onLimitChange={handlePageSizeChange}
                isFetching={isListFetching}
              />
            )}
          </>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onInitiateBulkAction={handleInitiateBulkAction}
        isUpdating={isBulkUpdating}
      />

      {/* Modals */}
      <BulkConfirmDialog
        isOpen={bulkConfirmModal.isOpen}
        onClose={() =>
          setBulkConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmBulkAction}
        selectedCount={selectedIds.length}
        targetStatus={bulkConfirmModal.targetStatus}
        isLoading={isBulkUpdating}
      />

      <TourDetailsDialog
        isOpen={Boolean(activeTourForDetails)}
        onClose={() => setActiveTourForDetails(null)}
        tour={activeTourForDetails}
        onEdit={(tour) =>
          setAddTourModal({
            isOpen: true,
            mode: "edit",
            tourName: tour.name,
          })
        }
      />

      <AddTourDialog
        isOpen={addTourModal.isOpen}
        onClose={() => setAddTourModal((prev) => ({ ...prev, isOpen: false }))}
        mode={addTourModal.mode}
        tourName={addTourModal.tourName}
      />
    </div>
  );
}
