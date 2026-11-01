"use client";

import * as React from "react";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";
import { UserActionsMenu } from "./user-actions-menu";
import { UsersTableSkeleton } from "./users-table-skeleton";
import { UsersEmptyState } from "./users-empty-state";
import { UsersErrorState } from "./users-error-state";
import type { AdminUserRecord } from "../../types/admin-users";
import { Mail, Phone, Calendar } from "lucide-react";

export interface UsersTableProps {
  users: AdminUserRecord[];
  currentUserId?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isFiltered?: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onInviteUser: () => void;
  onViewDetails: (user: AdminUserRecord) => void;
  onEditUser: (user: AdminUserRecord) => void;
  onToggleStatus: (user: AdminUserRecord) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function UsersTable({
  users,
  currentUserId,
  isLoading = false,
  isError = false,
  errorMessage,
  isFiltered = false,
  onRetry,
  onResetFilters,
  onInviteUser,
  onViewDetails,
  onEditUser,
  onToggleStatus,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
        <UsersTableSkeleton rowCount={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
        <UsersErrorState
          errorMessage={errorMessage}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-2xs">
        <UsersEmptyState
          isFiltered={isFiltered}
          onResetFilters={onResetFilters}
          onInviteUser={onInviteUser}
        />
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-[#E5EAED] bg-white shadow-2xs"
      data-testid="users-table-container"
    >
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wider text-[#74818A]">
            <th scope="col" className="py-3.5 pl-5 pr-4 min-w-[200px]">
              User
            </th>
            <th scope="col" className="py-3.5 px-4 hidden md:table-cell min-w-[180px]">
              Email
            </th>
            <th scope="col" className="py-3.5 px-4 hidden lg:table-cell min-w-[130px]">
              Phone
            </th>
            <th scope="col" className="py-3.5 px-4 min-w-[100px]">
              Role
            </th>
            <th scope="col" className="py-3.5 px-4 min-w-[110px]">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4 hidden sm:table-cell min-w-[120px]">
              Joined Date
            </th>
            <th scope="col" className="py-3.5 pl-4 pr-5 text-right w-12">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#E5EAED] text-[#18282A]">
          {users.map((user) => {
            const isSelf = Boolean(currentUserId && user.id === currentUserId);
            return (
              <tr
                key={user.id}
                data-testid={`user-row-${user.id}`}
                className="hover:bg-[#F9FBFC] transition-colors group"
              >
                {/* User Name & Avatar */}
                <td className="py-3 pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#176779]/10 font-bold text-[#176779] text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#18282A] truncate">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span
                            title="You are currently signed in as this administrator"
                            className="inline-flex items-center rounded-md bg-purple-100 px-1.5 py-0.2 text-[10px] font-semibold text-purple-800"
                          >
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#74818A] md:hidden truncate block">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Email Address */}
                <td className="py-3 px-4 hidden md:table-cell text-xs text-[#74818A] truncate font-mono">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#74818A]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </td>

                {/* Phone Number */}
                <td className="py-3 px-4 hidden lg:table-cell text-xs text-[#74818A] truncate">
                  {user.phone ? (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#74818A]" />
                      <span>{user.phone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* Role Badge */}
                <td className="py-3 px-4">
                  <UserRoleBadge role={user.role} />
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  <UserStatusBadge status={user.status} />
                </td>

                {/* Joined Date */}
                <td className="py-3 px-4 hidden sm:table-cell text-xs text-[#74818A]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-[#74818A]" />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </td>

                {/* Actions Dropdown */}
                <td className="py-3 pl-4 pr-5 text-right">
                  <UserActionsMenu
                    user={user}
                    currentUserId={currentUserId}
                    onViewDetails={onViewDetails}
                    onEditUser={onEditUser}
                    onToggleStatus={onToggleStatus}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
