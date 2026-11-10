import * as React from "react";
import { Users, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UsersEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onInviteUser?: () => void;
}

export function UsersEmptyState({
  isFiltered = false,
  onResetFilters,
  onInviteUser,
}: UsersEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center"
      data-testid="users-empty-state"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#176779]/10 text-[#176779] mb-4">
        <Users className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="font-outfit text-base font-bold text-[#18282A]">
        {isFiltered ? "No matching accounts found" : "No user accounts registered"}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs text-[#74818A] leading-relaxed">
        {isFiltered
          ? "No users matched your search criteria or role/status filters. Try adjusting your query or resetting all filters."
          : "There are currently no user accounts in the system. You can start by inviting staff or agent team members."}
      </p>

      <div className="mt-5 flex items-center gap-2.5">
        {isFiltered && onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] cursor-pointer"
            data-testid="empty-reset-filters-btn"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}

        {onInviteUser && (
          <Button
            type="button"
            size="sm"
            onClick={onInviteUser}
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
            data-testid="empty-invite-user-btn"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Invite User
          </Button>
        )}
      </div>
    </div>
  );
}
