import * as React from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "../../types/admin-users";

export interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig: Record<
  UserRole,
  { label: string; badgeClasses: string; dotColor: string }
> = {
  admin: {
    label: "Admin",
    badgeClasses: "bg-purple-50 text-purple-700 border-purple-200/80",
    dotColor: "bg-purple-600",
  },
  agent: {
    label: "Agent",
    badgeClasses: "bg-sky-50 text-sky-700 border-sky-200/80",
    dotColor: "bg-sky-600",
  },
  staff: {
    label: "Staff",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotColor: "bg-amber-600",
  },
  customer: {
    label: "Customer",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotColor: "bg-emerald-600",
  },
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = roleConfig[role] ?? {
    label: role,
    badgeClasses: "bg-gray-50 text-gray-700 border-gray-200",
    dotColor: "bg-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        config.badgeClasses,
        className
      )}
      data-testid={`user-role-badge-${role}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
