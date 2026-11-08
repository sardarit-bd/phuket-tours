"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CommissionsPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function CommissionsPagination({
  page,
  limit,
  total,
  onPageChange,
}: CommissionsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fromRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const toRecord = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3"
      data-testid="commissions-pagination"
    >
      <div className="text-xs text-slate-500">
        Showing <strong className="font-semibold text-slate-700">{fromRecord}</strong> to{" "}
        <strong className="font-semibold text-slate-700">{toRecord}</strong> of{" "}
        <strong className="font-semibold text-slate-700">{total}</strong> commission records
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="px-2 text-xs font-medium text-slate-700">
          Page <strong className="font-semibold">{page}</strong> of{" "}
          <strong className="font-semibold">{totalPages}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
