import * as React from "react";
import { cn } from "@/lib/utils";
import type { AdminServiceStatus } from "../../types/admin";

export interface TourStatusBadgeProps {
  status: AdminServiceStatus;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_CONFIG: Record<
  AdminServiceStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    bg: "bg-emerald-50/90",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    label: "Draft",
    bg: "bg-amber-50/90",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  UNPUBLISHED: {
    label: "Unpublished",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export function TourStatusBadge({
  status,
  size = "md",
  className,
}: TourStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
      data-testid={`tour-status-badge-${status.toLowerCase()}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
