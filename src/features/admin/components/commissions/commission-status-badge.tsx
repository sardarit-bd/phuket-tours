"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommissionStatus } from "../../types/admin-commissions";

interface CommissionStatusBadgeProps {
  status: CommissionStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function CommissionStatusBadge({
  status,
  className,
  showIcon = true,
}: CommissionStatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();

  switch (normalizedStatus) {
    case "ACTIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs",
            className
          )}
          data-testid="commission-status-active"
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />}
          <span>Active</span>
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300/80 shadow-2xs",
            className
          )}
          data-testid="commission-status-cancelled"
        >
          {showIcon && <XCircle className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />}
          <span>Cancelled</span>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          <span>{status}</span>
        </span>
      );
  }
}
