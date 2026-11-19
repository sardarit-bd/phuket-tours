import * as React from "react";
import { cn } from "@/lib/utils";
import type { UserStatus, InvitationStatus } from "../../types/admin-users";

export interface UserStatusBadgeProps {
  status: UserStatus;
  invitationStatus?: InvitationStatus;
  deletedAt?: string | null;
  className?: string;
}

export function UserStatusBadge({
  status,
  invitationStatus,
  deletedAt,
  className,
}: UserStatusBadgeProps) {
  if (deletedAt) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide bg-slate-50 text-slate-700 border-slate-200",
          className
        )}
        data-testid="user-status-badge-deleted"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden="true" />
        <span>Archived</span>
      </span>
    );
  }

  if (invitationStatus === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide bg-amber-50 text-amber-700 border-amber-200/80",
          className
        )}
        data-testid="user-status-badge-pending"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
        <span>Invitation Pending</span>
      </span>
    );
  }

  if (invitationStatus === "expired") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide bg-orange-50 text-orange-700 border-orange-200/80",
          className
        )}
        data-testid="user-status-badge-expired"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
        <span>Invitation Expired</span>
      </span>
    );
  }

  const isDeactivated = status === "deactivated";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        isDeactivated
          ? "bg-rose-50 text-rose-700 border-rose-200/80"
          : "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        className
      )}
      data-testid={`user-status-badge-${status}`}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isDeactivated ? "bg-rose-500" : "bg-emerald-500"
        )}
        aria-hidden="true"
      />
      <span>{isDeactivated ? "Deactivated" : "Active"}</span>
    </span>
  );
}
