"use client";

import * as React from "react";
import {
  Eye,
  Sliders,
  Copy,
  Check,
  AlertCircle,
  FileX,
  User,
  Layers,
} from "lucide-react";
import { CommissionStatusBadge } from "./commission-status-badge";
import type { AdminCommissionRecord } from "../../types/admin-commissions";

const formatDate = (isoString?: string | null): string => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
};

interface CommissionsTableProps {
  commissions: AdminCommissionRecord[];
  isLoading: boolean;
  isFetching?: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewDetails: (commission: AdminCommissionRecord) => void;
  onAdjustCommission: (commission: AdminCommissionRecord) => void;
  onResetFilters?: () => void;
}

const formatTHB = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function CommissionsTable({
  commissions,
  isLoading,
  isFetching = false,
  isError,
  onRetry,
  onViewDetails,
  onAdjustCommission,
  onResetFilters,
}: CommissionsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Error State
  if (isError) {
    return (
      <div
        className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-white p-8 text-center shadow-2xs"
        role="alert"
        data-testid="commissions-table-error"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-outfit text-base font-bold text-slate-900">
          Failed to Load Commissions Ledger
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          An error occurred while fetching commission records from the server. Please check your network connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#3297A3] text-xs font-semibold text-white shadow-2xs hover:bg-[#287983] transition-colors cursor-pointer"
        >
          Retry Request
        </button>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div
        className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs"
        aria-label="Loading commission records"
        data-testid="commissions-table-loading"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Commission ID</th>
                <th className="py-3 px-4">Partner Agent</th>
                <th className="py-3 px-4">Booking / Tour</th>
                <th className="py-3 px-4 text-right">Booking Final</th>
                <th className="py-3 px-4">Rate Applied</th>
                <th className="py-3 px-4 text-right">Commission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4 text-center"><div className="h-7 w-16 bg-slate-200 rounded mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty State
  if (commissions.length === 0) {
    return (
      <div
        className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-2xs"
        data-testid="commissions-table-empty"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FileX className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-outfit text-base font-bold text-slate-800">
          No Commission Records Found
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Commission records will appear here when eligible partner bookings generate commissions.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Clear Active Filters
          </button>
        )}
      </div>
    );
  }

  // Data Table
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs"
      data-testid="commissions-table"
    >
      {/* Background Refetch Indicator */}
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#3297A3] animate-pulse z-10" />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Commission ID</th>
              <th className="py-3 px-4">Partner Agent</th>
              <th className="py-3 px-4">Booking / Tour</th>
              <th className="py-3 px-4 text-right">Booking Final</th>
              <th className="py-3 px-4">Rate Applied</th>
              <th className="py-3 px-4 text-right">Commission</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {commissions.map((c) => {
              const isActive = c.status === "ACTIVE";
              const agentName = c.agent?.name || "Partner Agent";
              const serviceName = c.booking?.service?.name || "Custom Tour Booking";
              const formattedDate = formatDate(c.createdAt);

              const rateDescription =
                c.rateType === "PERCENTAGE"
                  ? `${Number(c.rateValue).toFixed(2)}%`
                  : `฿${Number(c.rateValue).toFixed(2)} Fixed`;

              return (
                <tr
                  key={c.id}
                  data-testid={`commission-row-${c.id}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Commission ID */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span title={c.id}>
                        {c.id.substring(0, 8)}...
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(c.id, e)}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Copy full Commission ID"
                        aria-label={`Copy Commission ID ${c.id}`}
                      >
                        {copiedId === c.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Partner Agent */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3297A3]/10 text-[#3297A3] shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 truncate block">
                          {agentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block" title={c.agentId}>
                          {c.agentId.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Booking / Tour */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-800 truncate block" title={serviceName}>
                        {serviceName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate block" title={c.bookingId}>
                        Booking: {c.bookingId.substring(0, 8)}...
                      </span>
                    </div>
                  </td>

                  {/* Booking Final Price */}
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatTHB(Number(c.baseAmount))}
                  </td>

                  {/* Rate Applied */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Layers className="h-3 w-3 text-slate-500" />
                      {rateDescription}
                    </span>
                  </td>

                  {/* Commission Amount */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-sm font-bold text-emerald-700">
                      {formatTHB(Number(c.amount))}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <CommissionStatusBadge status={c.status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(c)}
                        data-testid={`view-details-${c.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                        title="View details & audit history"
                        aria-label={`View details for commission ${c.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Adjust Commission */}
                      <button
                        type="button"
                        onClick={() => onAdjustCommission(c)}
                        disabled={!isActive}
                        data-testid={`adjust-commission-${c.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title={
                          isActive
                            ? "Adjust commission amount"
                            : "Only active commissions can be adjusted"
                        }
                        aria-label={`Adjust commission ${c.id}`}
                      >
                        <Sliders className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
