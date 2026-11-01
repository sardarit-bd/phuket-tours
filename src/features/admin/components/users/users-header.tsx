"use client";

import * as React from "react";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UsersHeaderProps {
  onInviteUser: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  totalUsers?: number;
}

export function UsersHeader({
  onInviteUser,
  onRefresh,
  isRefreshing = false,
  totalUsers,
}: UsersHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176779]/10 text-[#176779]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Users Management
            </h1>
            {typeof totalUsers === "number" && (
              <span
                data-testid="users-total-badge"
                className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800"
              >
                {totalUsers.toLocaleString()} Accounts
              </span>
            )}
          </div>
          <p className="text-xs text-[#74818A] sm:text-sm">
            Manage system accounts, send staff and agent onboarding invitations, and monitor account access statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] cursor-pointer"
            aria-label="Refresh users list"
            data-testid="refresh-users-btn"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#176779]" : ""}`}
            />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>

          <Button
            onClick={onInviteUser}
            size="sm"
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer shadow-xs"
            data-testid="invite-user-btn"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>
    </div>
  );
}
