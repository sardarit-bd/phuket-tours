"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/slices/auth-slice";
import { useGetAdminUsersQuery } from "../../api/admin-api";
import { UsersHeader } from "./users-header";
import { UsersSummaryCards } from "./users-summary-cards";
import { UsersToolbar } from "./users-toolbar";
import { UsersTable } from "./users-table";
import { UsersPagination } from "./users-pagination";
import { UserDetailsDialog } from "./user-details-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { InviteUserDialog } from "./invite-user-dialog";
import { DeactivateUserDialog } from "./deactivate-user-dialog";
import type {
  AdminUserRecord,
  UserRole,
  UserStatus,
  GetAdminUsersParams,
} from "../../types/admin-users";

interface ActionFeedback {
  type: "success" | "error" | "warning";
  message: string;
}

export function AdminUsersView() {
  // 1. Current authenticated admin user (for self-deactivation protection)
  const currentAuthUser = useAppSelector(selectCurrentUser);
  const currentUserId = currentAuthUser?.id || null;

  // 2. Pagination & filter states
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchInput, setSearchInput] = React.useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");

  // Debounce search input by 300ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 3. Modal active states
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [activeUserForDetails, setActiveUserForDetails] =
    React.useState<AdminUserRecord | null>(null);
  const [userForEdit, setUserForEdit] =
    React.useState<AdminUserRecord | null>(null);
  const [userForStatusToggle, setUserForStatusToggle] =
    React.useState<AdminUserRecord | null>(null);

  // 4. Action feedback banner
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 5. Query parameters for the main users table
  const queryParams: GetAdminUsersParams = React.useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
      status: statusFilter !== "ALL" ? (statusFilter as UserStatus) : undefined,
    };
  }, [page, limit, debouncedSearch, roleFilter, statusFilter]);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery(queryParams);

  // 6. Summary metrics (real database totals via lightweight limit=1 queries)
  const { data: totalUsersData } = useGetAdminUsersQuery({ limit: 1 });
  const { data: customersData } = useGetAdminUsersQuery({ limit: 1, role: "customer" });
  const { data: agentsData } = useGetAdminUsersQuery({ limit: 1, role: "agent" });
  const { data: staffData } = useGetAdminUsersQuery({ limit: 1, role: "staff" });
  const { data: activeUsersData } = useGetAdminUsersQuery({ limit: 1, status: "active" });
  const { data: deactivatedUsersData } = useGetAdminUsersQuery({ limit: 1, status: "deactivated" });

  const usersList: AdminUserRecord[] = React.useMemo(
    () => usersData?.data?.items || [],
    [usersData?.data?.items]
  );

  const pagination = React.useMemo(() => {
    const total = usersData?.data?.pagination?.total || 0;
    const lim = usersData?.data?.pagination?.limit || 10;
    return {
      page: usersData?.data?.pagination?.page || 1,
      limit: lim,
      total,
      totalPages: Math.max(1, usersData?.data?.pagination?.totalPages || Math.ceil(total / lim)),
    };
  }, [
    usersData?.data?.pagination?.page,
    usersData?.data?.pagination?.limit,
    usersData?.data?.pagination?.total,
    usersData?.data?.pagination?.totalPages,
  ]);

  // 7. Filter handlers
  const handleRoleFilterChange = React.useCallback((newRole: string) => {
    setRoleFilter(newRole);
    setPage(1);
  }, []);

  const handleStatusFilterChange = React.useCallback((newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  }, []);

  const handleLimitChange = React.useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  }, []);

  const isFiltered =
    debouncedSearch.trim().length > 0 || roleFilter !== "ALL" || statusFilter !== "ALL";

  // 8. Action feedback handlers
  const handleRefresh = React.useCallback(() => {
    refetchUsers();
    setFeedback({
      type: "success",
      message: "Refreshed user accounts list.",
    });
  }, [refetchUsers]);

  const handleInviteSuccess = React.useCallback(() => {
    setFeedback({
      type: "success",
      message: "Invitation sent successfully. The user will receive an onboarding email.",
    });
    refetchUsers();
  }, [refetchUsers]);

  const handleEditSuccess = React.useCallback(() => {
    setFeedback({
      type: "success",
      message: "User profile updated successfully.",
    });
    refetchUsers();
  }, [refetchUsers]);

  const handleStatusToggleSuccess = React.useCallback(() => {
    setFeedback({
      type: "success",
      message: "Account status updated successfully.",
    });
    refetchUsers();
  }, [refetchUsers]);

  const errorMessage = React.useMemo(() => {
    if (!usersError) return undefined;
    if (typeof usersError === "object" && "data" in usersError) {
      const data = (usersError as { data?: { message?: string } }).data;
      return data?.message || "Failed to load user records from the server.";
    }
    return "An unexpected error occurred while communicating with the server.";
  }, [usersError]);

  return (
    <div className="space-y-6" data-testid="admin-users-container">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          data-testid="admin-users-feedback-banner"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-medium shadow-xs transition-all ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : feedback.type === "warning"
              ? "border-amber-200 bg-amber-50/90 text-amber-900"
              : "border-rose-200 bg-rose-50/90 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-lg p-1 text-slate-500 hover:bg-black/5 hover:text-slate-800 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <UsersHeader
        onInviteUser={() => setIsInviteOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isUsersFetching}
        totalUsers={pagination.total}
      />

      {/* Summary Cards */}
      <UsersSummaryCards
        totalUsers={totalUsersData?.data?.pagination?.total ?? pagination.total}
        totalCustomers={customersData?.data?.pagination?.total ?? 0}
        totalAgents={agentsData?.data?.pagination?.total ?? 0}
        totalStaff={staffData?.data?.pagination?.total ?? 0}
        totalActive={activeUsersData?.data?.pagination?.total ?? 0}
        totalDeactivated={deactivatedUsersData?.data?.pagination?.total ?? 0}
        isLoading={isUsersLoading}
      />

      {/* Toolbar */}
      <UsersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Users Table & Pagination */}
      <div className="space-y-4">
        <UsersTable
          users={usersList}
          currentUserId={currentUserId}
          isLoading={isUsersLoading}
          isError={isUsersError}
          errorMessage={errorMessage}
          isFiltered={isFiltered}
          onRetry={() => refetchUsers()}
          onResetFilters={handleResetFilters}
          onInviteUser={() => setIsInviteOpen(true)}
          onViewDetails={(u) => setActiveUserForDetails(u)}
          onEditUser={(u) => setUserForEdit(u)}
          onToggleStatus={(u) => setUserForStatusToggle(u)}
        />

        {/* Server-side Pagination */}
        {!isUsersLoading && !isUsersError && pagination.total > 0 && (
          <div className="rounded-2xl border border-[#E5EAED] bg-white p-3 shadow-2xs">
            <UsersPagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
              onLimitChange={handleLimitChange}
              isFetching={isUsersFetching}
            />
          </div>
        )}
      </div>

      {/* Dialog 1: View User Details */}
      <UserDetailsDialog
        isOpen={activeUserForDetails !== null}
        onClose={() => setActiveUserForDetails(null)}
        user={activeUserForDetails}
        onEditClick={(u) => setUserForEdit(u)}
      />

      {/* Dialog 2: Edit User Profile */}
      <EditUserDialog
        isOpen={userForEdit !== null}
        onClose={() => setUserForEdit(null)}
        user={userForEdit}
        currentUserId={currentUserId}
        onSuccess={handleEditSuccess}
      />

      {/* Dialog 3: Invite Staff or Agent */}
      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      {/* Dialog 4: Deactivate / Activate Account */}
      <DeactivateUserDialog
        isOpen={userForStatusToggle !== null}
        onClose={() => setUserForStatusToggle(null)}
        user={userForStatusToggle}
        currentUserId={currentUserId}
        onSuccess={handleStatusToggleSuccess}
      />
    </div>
  );
}
