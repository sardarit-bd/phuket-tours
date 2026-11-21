"use client";

import * as React from "react";
import type { DiscountApprovalStatus } from "@/features/admin/types/admin-discounts";
import { Tag, Clock, CheckCircle2, XCircle } from "lucide-react";

interface DiscountApprovalStatusBadgeProps {
  status?: DiscountApprovalStatus | string | null;
  className?: string;
}

export function DiscountApprovalStatusBadge({
  status,
  className = "",
}: DiscountApprovalStatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  if (normalized === "PENDING") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ${className}`}
        data-testid="discount-status-badge-pending"
      >
        <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
        <span>Discount: Pending Approval</span>
      </span>
    );
  }

  if (normalized === "APPROVED") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ${className}`}
        data-testid="discount-status-badge-approved"
      >
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        <span>Discount: Approved</span>
      </span>
    );
  }

  if (normalized === "REJECTED") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 ${className}`}
        data-testid="discount-status-badge-rejected"
      >
        <XCircle className="h-3 w-3 text-rose-600" />
        <span>Discount: Rejected</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 ${className}`}
    >
      <Tag className="h-3 w-3" />
      <span>{status}</span>
    </span>
  );
}
