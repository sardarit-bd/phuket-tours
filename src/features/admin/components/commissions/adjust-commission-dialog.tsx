"use client";

import * as React from "react";
import {
  Sliders,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { useAdjustAdminCommissionMutation } from "../../api/admin-api";
import type { AdminCommissionRecord } from "../../types/admin-commissions";

export interface AdjustCommissionDialogProps {
  commission: AdminCommissionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const formatTHB = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function AdjustCommissionDialog({
  commission,
  isOpen,
  onClose,
  onSuccess,
}: AdjustCommissionDialogProps) {
  const currentAmount = commission ? Number(commission.amount) : 0;
  const baseAmount = commission ? Number(commission.baseAmount) : 0;

  const [amountStr, setAmountStr] = React.useState<string>(() => currentAmount.toFixed(2));
  const [reason, setReason] = React.useState<string>("");
  const [isConfirmed, setIsConfirmed] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [prevCommissionId, setPrevCommissionId] = React.useState<string | null>(commission?.id ?? null);
  const [prevOpen, setPrevOpen] = React.useState<boolean>(isOpen);

  if (isOpen && (!prevOpen || (commission && commission.id !== prevCommissionId))) {
    setPrevOpen(true);
    setPrevCommissionId(commission?.id ?? null);
    setAmountStr(currentAmount.toFixed(2));
    setReason("");
    setIsConfirmed(false);
    setErrorMessage(null);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  const [adjustCommission, { isLoading }] = useAdjustAdminCommissionMutation();

  const newAmount = parseFloat(amountStr);
  const isValidNumber = !isNaN(newAmount) && isFinite(newAmount);

  // Validation rules directly reflecting backend rules
  const twoDecimalsValid = /^\d+(\.\d{1,2})?$/.test(amountStr.trim());
  const isOutOfRange = isValidNumber && (newAmount < 0 || newAmount > baseAmount);
  const isUnchanged = isValidNumber && Math.abs(newAmount - currentAmount) < 0.001;
  const isReasonValid = reason.trim().length >= 3 && reason.trim().length <= 500;

  const canSubmit =
    isValidNumber &&
    twoDecimalsValid &&
    !isOutOfRange &&
    !isUnchanged &&
    isReasonValid &&
    isConfirmed &&
    !isLoading;

  const diff = isValidNumber ? newAmount - currentAmount : 0;
  const percentageChange =
    currentAmount > 0 && isValidNumber
      ? ((diff / currentAmount) * 100).toFixed(1)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commission || !canSubmit) return;

    setErrorMessage(null);

    try {
      await adjustCommission({
        commissionId: commission.id,
        input: {
          amount: Math.round(newAmount * 100) / 100,
          reason: reason.trim(),
        },
      }).unwrap();

      const successMsg = `Commission adjusted to ${formatTHB(newAmount)} successfully.`;
      onSuccess?.(successMsg);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "An unexpected error occurred while adjusting the commission.",
        })
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3297A3]/10 text-[#3297A3]">
            <Sliders className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-outfit text-lg font-bold text-slate-900">
            Adjust Active Commission
          </span>
        </div>
      }
      description="Modify the commission earnings for this booking. Every adjustment requires a compliance reason and is permanently recorded in the audit history."
    >
      <form onSubmit={handleSubmit} className="space-y-5" data-testid="adjust-commission-form">
        {/* Error Alert */}
        {errorMessage && (
          <ErrorAlert
            data-testid="adjust-commission-error"
            title="Adjustment Rejected"
            description={errorMessage}
          />
        )}

        {/* Entity Context Card */}
        {commission && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Partner Agent:</span>
              <span className="font-semibold text-slate-900">
                {commission.agent?.name || "Partner Agent"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Booking Final Price (Max Limit):</span>
              <span className="font-mono font-bold text-slate-800">
                {formatTHB(baseAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Commission Amount:</span>
              <span className="font-mono font-bold text-slate-800">
                {formatTHB(currentAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Amount Input & Diff Preview */}
        <div className="space-y-2">
          <label
            htmlFor="adjust-commission-amount"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            New Commission Amount (THB) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold text-slate-400">
              ฿
            </span>
            <input
              id="adjust-commission-amount"
              data-testid="adjust-commission-amount-input"
              type="number"
              step="0.01"
              min="0"
              max={baseAmount}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 font-mono text-sm font-bold text-slate-900 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
              required
            />
          </div>

          {/* Validation Warnings */}
          {isValidNumber && isOutOfRange && (
            <p className="text-[11px] font-medium text-destructive">
              Amount must be between ฿0.00 and the booking base price ({formatTHB(baseAmount)}).
            </p>
          )}
          {isValidNumber && isUnchanged && (
            <p className="text-[11px] font-medium text-amber-600">
              New amount must be different from current amount ({formatTHB(currentAmount)}).
            </p>
          )}
          {!twoDecimalsValid && (
            <p className="text-[11px] font-medium text-destructive">
              Amount can have at most 2 decimal places.
            </p>
          )}

          {/* Change Preview Box */}
          {isValidNumber && !isOutOfRange && !isUnchanged && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-3 shadow-2xs text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Change:</span>
                <span className="font-mono line-through text-slate-400">
                  {formatTHB(currentAmount)}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-900">
                  {formatTHB(newAmount)}
                </span>
              </div>

              <div
                className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  diff > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {diff > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {diff > 0 ? "+" : ""}
                  {formatTHB(diff)} {percentageChange ? `(${percentageChange}%)` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Reason Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="adjust-commission-reason"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Adjustment Reason <span className="text-destructive">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                reason.trim().length < 3 || reason.trim().length > 500
                  ? "text-slate-400"
                  : "text-emerald-600 font-semibold"
              }`}
            >
              {reason.trim().length} / 500
            </span>
          </div>
          <textarea
            id="adjust-commission-reason"
            data-testid="adjust-commission-reason-input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a descriptive reason for this adjustment (minimum 3 characters, max 500)..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
            required
            minLength={3}
            maxLength={500}
          />
          <p className="text-[10px] text-slate-400">
            Mandatory: Recorded permanently in the commission audit trail and booking activity history.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              data-testid="adjust-commission-confirm-checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#3297A3] focus:ring-[#3297A3]"
            />
            <span className="text-xs text-amber-900 leading-relaxed font-medium">
              I confirm this financial adjustment. I verify that this change has been agreed upon and is accurately documented for partner accounting.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            data-testid="adjust-commission-submit-btn"
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-[#3297A3] text-xs font-semibold text-white shadow-2xs hover:bg-[#287983] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Adjustment...</span>
              </>
            ) : (
              <span>Confirm & Apply Adjustment</span>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
