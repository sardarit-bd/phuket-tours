"use client";

import * as React from "react";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { ErrorAlert, SuccessAlert, WarningAlert } from "@/components/ui/alert";
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
import { usePermissions } from "../../hooks/use-permissions";
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
  // Permission-gated actions (admin always bypasses; staff need explicit grants)
  const { isAdmin, hasPermission } = usePermissions();
  const canCreateTour = isAdmin || hasPermission("tours.create");
  const canEditTour = isAdmin || hasPermission("tours.edit");

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
    tour?: AdminServiceRecord | null;
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
      setFeedback({
        type: "error",
        message: formatErrorMessage(
          err,
          "Failed to update tour status. Please try again."
        ),
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
      setFeedback({
        type: "error",
        message: formatErrorMessage(
          err,
          "Failed to apply bulk status update. Please try again."
        ),
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
        canCreate={canCreateTour}
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
        <div data-testid="tours-feedback-banner">
          {feedback.type === "success" && (
            <SuccessAlert
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}
          {feedback.type === "warning" && (
            <WarningAlert
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}
          {feedback.type === "error" && (
            <ErrorAlert
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}
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
      <div className="relative rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
        {/* Loading overlay indicator for background refetching */}
        {isListFetching && !isListLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#176779] animate-pulse z-10 rounded-t-2xl" />
        )}

        {/* State Rendering */}
        {isListLoading ? (
          <ToursTableSkeleton rowCount={pageSize > 10 ? 10 : pageSize} />
        ) : isListError ? (
          <ToursErrorState
            errorMessage={formatErrorMessage(
              listError,
              "Failed to communicate with the tours service. Please retry."
            )}
            onRetry={refetchList}
          />
        ) : tours.length === 0 ? (
          <ToursEmptyState
            isFiltered={isFiltered}
            onResetFilters={handleResetFilters}
            onAddNewTour={
              canCreateTour
                ? () => setAddTourModal({ isOpen: true, mode: "create" })
                : undefined
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
                  tour,
                })
              }
              onStatusChange={handleSingleStatusChange}
              isStatusUpdating={isStatusUpdating}
              canEdit={canEditTour}
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
        onEdit={
          canEditTour
            ? (tour) =>
                setAddTourModal({
                  isOpen: true,
                  mode: "edit",
                  tourName: tour.name,
                  tour,
                })
            : undefined
        }
      />

      <AddTourDialog
        isOpen={addTourModal.isOpen}
        onClose={() =>
          setAddTourModal((prev) => ({ ...prev, isOpen: false, tour: null }))
        }
        mode={addTourModal.mode}
        tourName={addTourModal.tourName}
        tour={addTourModal.tour}
        onSuccess={(savedTour) => {
          refetchList();
          setFeedback({
            type: "success",
            message: `Tour "${savedTour.name}" was successfully ${
              addTourModal.mode === "create" ? "created" : "updated"
            }.`,
          });
        }}
      />
    </div>
  );
}
