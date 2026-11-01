import * as React from "react";
import { cn } from "@/lib/utils";
import type { UserStatus } from "../../types/admin-users";

export interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const statusConfig: Record<
  UserStatus,
  { label: string; badgeClasses: string; dotColor: string }
> = {
  active: {
    label: "Active",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotColor: "bg-emerald-500",
  },
  deactivated: {
    label: "Deactivated",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotColor: "bg-rose-500",
  },
};

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    badgeClasses: "bg-gray-50 text-gray-700 border-gray-200",
    dotColor: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        config.badgeClasses,
        className
      )}
      data-testid={`user-status-badge-${status}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
