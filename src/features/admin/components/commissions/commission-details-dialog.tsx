"use client";

import * as React from "react";
import {
  Copy,
  Check,
  AlertCircle,
  Sliders,
  History,
  ArrowRight,
  User,
  Ticket,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useGetAdminCommissionByIdQuery } from "../../api/admin-api";
import { CommissionStatusBadge } from "./commission-status-badge";
import type { AdminCommissionRecord } from "../../types/admin-commissions";

const formatDate = (isoString?: string | null, includeSeconds = false): string => {
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
      ...(includeSeconds ? { second: "2-digit" } : {}),
      hour12: false,
    });
  } catch {
    return "—";
  }
};

export interface CommissionDetailsDialogProps {
  commissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust?: (commission: AdminCommissionRecord) => void;
}

const formatTHB = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function CommissionDetailsDialog({
  commissionId,
  isOpen,
  onClose,
  onAdjust,
}: CommissionDetailsDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const {
    data: commissionResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminCommissionByIdQuery(commissionId as string, {
    skip: !isOpen || !commissionId,
  });

  const commission = commissionResponse?.data;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isActive = commission?.status === "ACTIVE";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-outfit text-lg font-bold text-slate-900">
            Commission Record & Audit History
          </span>
          {commission && <CommissionStatusBadge status={commission.status} />}
        </div>
      }
      description="Inspect verified partner agent commission, booking relationship, calculation policy, and immutable adjustment history."
    >
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center space-y-3" aria-label="Loading commission details">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#3297A3] border-t-transparent" />
            <p className="text-xs text-slate-500">Loading commission details & audit history...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-destructive mb-2" />
            <p className="text-xs font-semibold text-destructive">
              Failed to load commission record
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center h-8 px-3 rounded-lg bg-[#3297A3] text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {commission && (
          <div className="space-y-6">
            {/* Top Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Commission Amount */}
              <div className="rounded-xl border border-slate-200/80 bg-emerald-50/40 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                  Current Commission
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-700">
                  {formatTHB(Number(commission.amount))}
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-600">
                  Accrued to partner agent
                </p>
              </div>

              {/* Rate Applied */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Calculation Rate
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-800">
                  {commission.rateType === "PERCENTAGE"
                    ? `${Number(commission.rateValue).toFixed(2)}%`
                    : formatTHB(Number(commission.rateValue))}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {commission.rateType === "PERCENTAGE" ? "Percentage of booking" : "Fixed partner fee"}
                </p>
              </div>

              {/* Booking Base Final Price */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Booking Base Price
                </span>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-800">
                  {formatTHB(Number(commission.baseAmount))}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Final price of customer reservation
                </p>
              </div>
            </div>

            {/* Entity Relationships: Agent & Booking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent Information */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-[#3297A3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Partner Agent Details
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Agent Name:</span>
                    <span className="font-semibold text-slate-900">
                      {commission.agent?.name || "Agent Name Unavailable"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Agent ID:</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                      <span>{commission.agentId.substring(0, 12)}...</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("agentId", commission.agentId)}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Copy Agent UUID"
                        aria-label="Copy Agent ID"
                      >
                        {copiedField === "agentId" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Ticket className="h-4 w-4 text-[#3297A3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Linked Reservation
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Tour Service:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={commission.booking?.service?.name}>
                      {commission.booking?.service?.name || "Custom Tour"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-medium text-slate-800">
                      {commission.booking?.customer?.name || "Customer Name Unavailable"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Booking Status:</span>
                    <span className="font-semibold uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {commission.booking?.status || "CONFIRMED"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-semibold uppercase text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                      {commission.booking?.paymentStatus || "PAID"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identifiers & Timestamps */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Commission ID
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-700">
                    <span className="truncate" title={commission.id}>{commission.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("commissionId", commission.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      title="Copy Commission ID"
                      aria-label="Copy Commission ID"
                    >
                      {copiedField === "commissionId" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Created Timestamp
                  </span>
                  <span className="text-slate-700 font-medium mt-0.5 block">
                    {formatDate(commission.createdAt, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Last Updated
                  </span>
                  <span className="text-slate-700 font-medium mt-0.5 block">
                    {formatDate(commission.updatedAt, true)}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-3" data-testid="commission-audit-history">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <History className="h-4 w-4 text-[#3297A3]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Commission Adjustment Audit History
                </h4>
                {commission.adjustments && commission.adjustments.length > 0 && (
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {commission.adjustments.length} adjustment{commission.adjustments.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {!commission.adjustments || commission.adjustments.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center"
                  data-testid="no-adjustments-msg"
                >
                  <p className="text-xs text-slate-500">
                    No manual adjustments have been made to this commission record. Original policy calculation remains active.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commission.adjustments.map((adj) => {
                    const diff = Number(adj.newAmount) - Number(adj.previousAmount);
                    const isIncrease = diff > 0;
                    const adjDate = formatDate(adj.createdAt);

                    return (
                      <div
                        key={adj.id}
                        data-testid={`adjustment-item-${adj.id}`}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {formatTHB(Number(adj.previousAmount))}
                            </span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {formatTHB(Number(adj.newAmount))}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isIncrease
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isIncrease ? "+" : ""}
                              {formatTHB(diff)}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            {adjDate}
                          </span>
                        </div>

                        {/* Mandatory Reason */}
                        <div className="text-xs">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                            Audit Reason:
                          </span>
                          <p className="mt-0.5 text-slate-800 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            &ldquo;{adj.reason}&rdquo;
                          </p>
                        </div>

                        {/* Actor Admin ID */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>Adjusted By Admin:</span>
                          <span className="font-mono text-slate-600" title={adj.adminId}>
                            {adj.adminId}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close Dialog
              </button>

              {isActive && onAdjust && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAdjust(commission);
                  }}
                  data-testid="details-adjust-btn"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#3297A3] text-xs font-semibold text-white shadow-2xs hover:bg-[#287983] transition-colors cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Adjust Commission</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
