"use client";

import * as React from "react";
import {
  Percent,
  Coins,
  History,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  RotateCcw,
} from "lucide-react";
import {
  useGetAdminCommissionRulesQuery,
  useConfigureAdminCommissionRuleMutation,
} from "../../api/admin-api";
import { CommissionsPagination } from "./commissions-pagination";
import type {
  CommissionRateType,
  AdminCommissionRule,
} from "../../types/admin-commissions";

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

const formatTHB = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function CommissionRulesTab() {
  // Pagination for rule history
  const [historyPage, setHistoryPage] = React.useState<number>(1);
  const historyLimit = 10;

  // Form State
  const [rateType, setRateType] = React.useState<CommissionRateType>("PERCENTAGE");
  const [rateValueStr, setRateValueStr] = React.useState<string>("10");
  const [isConfirmed, setIsConfirmed] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // RTK Query Hooks
  const {
    data: rulesResponse,
    isLoading: isRulesLoading,
    isFetching: isRulesFetching,
    refetch: refetchRules,
  } = useGetAdminCommissionRulesQuery({
    page: historyPage,
    limit: historyLimit,
  });

  const [configureRule, { isLoading: isSubmitting }] =
    useConfigureAdminCommissionRuleMutation();

  const activeRule: AdminCommissionRule | null =
    rulesResponse?.data?.activeRule ?? null;
  const historicalRules: AdminCommissionRule[] =
    rulesResponse?.data?.items ?? [];
  const totalRules = rulesResponse?.data?.total ?? 0;

  // Initialize form with current active rule values when first loaded or active rule changes
  const [syncedRuleId, setSyncedRuleId] = React.useState<string | null>(null);
  if (activeRule && activeRule.id !== syncedRuleId && !successMessage) {
    setSyncedRuleId(activeRule.id);
    setRateType(activeRule.rateType);
    setRateValueStr(String(Number(activeRule.rateValue)));
  }

  // Validation
  const rateValue = parseFloat(rateValueStr);
  const isValidNumber = !isNaN(rateValue) && isFinite(rateValue);
  const twoDecimalsValid = /^\d+(\.\d{1,2})?$/.test(rateValueStr.trim());
  const isPositive = isValidNumber && rateValue > 0;
  const isPercentageValid =
    rateType === "PERCENTAGE" ? isValidNumber && rateValue <= 100 : true;
  const isFixedValid =
    rateType === "FIXED" ? isValidNumber && rateValue <= 99999999.99 : true;

  const isFormValid =
    isValidNumber &&
    twoDecimalsValid &&
    isPositive &&
    isPercentageValid &&
    isFixedValid;

  const canSubmit = isFormValid && isConfirmed && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await configureRule({
        rateType,
        rateValue: Math.round(rateValue * 100) / 100,
      }).unwrap();

      setSuccessMessage(
        `Active commission policy updated to ${
          rateType === "PERCENTAGE" ? `${rateValue}%` : formatTHB(rateValue)
        } successfully.`
      );
      setIsConfirmed(false);
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const serverMsg =
        errorObj?.data?.message ||
        errorObj?.message ||
        "An unexpected error occurred while updating the commission policy.";
      setErrorMessage(serverMsg);
    }
  };

  return (
    <div className="space-y-6" data-testid="commission-rules-tab">
      {/* Header Overview Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3297A3]/10 text-[#3297A3]">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-outfit text-base font-bold text-slate-900">
            Platform Commission Policy Governance
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-3xl">
            Configure the global partner commission policy applied to all verified partner reservations. Updating this policy establishes a new active rule without modifying historical commissions, preserving immutable financial accounting.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetchRules()}
          disabled={isRulesFetching}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          title="Refresh commission rules"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isRulesFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid: Current Active Policy & Configure Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Current Active Rule Display */}
        <div
          data-testid="active-rule-card"
          className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Active Policy
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="h-3 w-3" />
                Active Rule
              </span>
            </div>

            {isRulesLoading ? (
              <div className="py-8 animate-pulse space-y-3">
                <div className="h-10 w-44 bg-slate-200 rounded" />
                <div className="h-4 w-60 bg-slate-200 rounded" />
              </div>
            ) : activeRule ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-outfit text-4xl font-extrabold tracking-tight text-slate-900">
                    {activeRule.rateType === "PERCENTAGE"
                      ? `${Number(activeRule.rateValue).toFixed(2)}%`
                      : formatTHB(Number(activeRule.rateValue))}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({activeRule.rateType === "PERCENTAGE" ? "Percentage of Booking" : "Fixed Fee per Booking"})
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Applied automatically to all partner bookings upon payment verification.
                </p>

                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Rule ID:</span>
                    <span className="font-mono text-slate-700 text-[11px]" title={activeRule.id}>
                      {activeRule.id.substring(0, 16)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Configured By Admin:</span>
                    <span className="font-mono text-slate-700 text-[11px]" title={activeRule.createdById}>
                      {activeRule.createdById.substring(0, 16)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Effective Since:</span>
                    <span className="font-medium text-slate-800 text-[11px]">
                      {formatDate(activeRule.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
                <p className="text-xs font-semibold text-slate-700">No Active Policy Found</p>
                <p className="text-[11px] text-slate-500">
                  Configure a commission rule below to activate partner commissions.
                </p>
              </div>
            )}
          </div>

          {/* Example Calculation Table */}
          {activeRule && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2 text-xs">
              <span className="font-semibold text-blue-900 block">
                Current Calculation Examples:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                <div className="rounded bg-white p-2 border border-blue-100">
                  <span className="text-[10px] text-slate-400 block">฿3,000 Booking</span>
                  <strong className="text-blue-950 font-bold block mt-0.5">
                    {activeRule.rateType === "PERCENTAGE"
                      ? formatTHB(3000 * (Number(activeRule.rateValue) / 100))
                      : formatTHB(Number(activeRule.rateValue))}
                  </strong>
                </div>
                <div className="rounded bg-white p-2 border border-blue-100">
                  <span className="text-[10px] text-slate-400 block">฿10,000 Booking</span>
                  <strong className="text-blue-950 font-bold block mt-0.5">
                    {activeRule.rateType === "PERCENTAGE"
                      ? formatTHB(10000 * (Number(activeRule.rateValue) / 100))
                      : formatTHB(Number(activeRule.rateValue))}
                  </strong>
                </div>
                <div className="rounded bg-white p-2 border border-blue-100">
                  <span className="text-[10px] text-slate-400 block">฿25,000 Booking</span>
                  <strong className="text-blue-950 font-bold block mt-0.5">
                    {activeRule.rateType === "PERCENTAGE"
                      ? formatTHB(25000 * (Number(activeRule.rateValue) / 100))
                      : formatTHB(Number(activeRule.rateValue))}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Configure New Policy Form */}
        <div
          data-testid="configure-rule-card"
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Configure Policy
            </span>
            <h4 className="mt-1 font-outfit text-lg font-bold text-slate-900">
              Set New Commission Rule
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
              Define the partner commission rate. Applies immediately to all subsequent booking payments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="configure-rule-form">
            {/* Success Alert */}
            {successMessage && (
              <div
                role="alert"
                data-testid="configure-rule-success"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="font-medium leading-relaxed">{successMessage}</p>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div
                role="alert"
                data-testid="configure-rule-error"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Rate Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                Policy Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="rate-type-percentage-btn"
                  onClick={() => setRateType("PERCENTAGE")}
                  className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    rateType === "PERCENTAGE"
                      ? "border-[#3297A3] bg-[#3297A3]/10 text-[#3297A3] shadow-2xs"
                      : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Percent className="h-4 w-4" />
                  <span>Percentage (%)</span>
                </button>

                <button
                  type="button"
                  data-testid="rate-type-fixed-btn"
                  onClick={() => setRateType("FIXED")}
                  className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    rateType === "FIXED"
                      ? "border-[#3297A3] bg-[#3297A3]/10 text-[#3297A3] shadow-2xs"
                      : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Coins className="h-4 w-4" />
                  <span>Fixed Fee (฿)</span>
                </button>
              </div>
            </div>

            {/* Rate Value Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="commission-rate-value-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 block"
              >
                {rateType === "PERCENTAGE"
                  ? "Commission Rate Percentage (1% – 100%)"
                  : "Fixed Commission Amount (THB)"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold text-slate-400">
                  {rateType === "PERCENTAGE" ? "%" : "฿"}
                </span>
                <input
                  id="commission-rate-value-input"
                  data-testid="commission-rate-value-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={rateType === "PERCENTAGE" ? "100" : "99999999.99"}
                  value={rateValueStr}
                  onChange={(e) => setRateValueStr(e.target.value)}
                  placeholder={rateType === "PERCENTAGE" ? "10.00" : "500.00"}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 font-mono text-sm font-bold text-slate-900 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
                  required
                />
              </div>

              {/* Validation Feedback */}
              {isValidNumber && rateType === "PERCENTAGE" && rateValue > 100 && (
                <p className="text-[11px] font-medium text-destructive">
                  A percentage commission cannot exceed 100%.
                </p>
              )}
              {isValidNumber && rateValue <= 0 && (
                <p className="text-[11px] font-medium text-destructive">
                  Rate value must be greater than 0.
                </p>
              )}
              {!twoDecimalsValid && (
                <p className="text-[11px] font-medium text-destructive">
                  Rate value can have at most 2 decimal places.
                </p>
              )}
            </div>

            {/* Transition Notice */}
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
              <Info className="h-4 w-4 shrink-0 text-[#3297A3] mt-0.5" />
              <p className="leading-relaxed">
                Saving a new rule deactivates the current active policy. Existing commissions preserve their calculated values; the new rule applies to all payments verified going forward.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="configure-rule-confirm-checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#3297A3] focus:ring-[#3297A3]"
                />
                <span className="text-xs text-amber-900 leading-relaxed font-medium">
                  I understand that this sets a new active commission rule for all future partner bookings across PhuketTours.
                </span>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                data-testid="configure-rule-submit-btn"
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-[#3297A3] text-xs font-semibold text-white shadow-2xs hover:bg-[#287983] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving New Rule...</span>
                  </>
                ) : (
                  <span>Publish & Activate Commission Policy</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historical Rules Audit Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#3297A3]" />
            <h4 className="font-outfit text-base font-bold text-slate-900">
              Commission Policy Revision History
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {totalRules} recorded polic{totalRules === 1 ? "y" : "ies"}
          </span>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" data-testid="rules-history-table">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Policy Type</th>
                <th className="py-2.5 px-3">Rate Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Author Admin ID</th>
                <th className="py-2.5 px-3">Configured Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {historicalRules.map((rule) => {
                const isActive = rule.isActive;
                const formattedDate = formatDate(rule.createdAt);

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {rule.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {rule.rateType === "PERCENTAGE" ? "Percentage Rate" : "Fixed Fee"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {rule.rateType === "PERCENTAGE"
                        ? `${Number(rule.rateValue).toFixed(2)}%`
                        : formatTHB(Number(rule.rateValue))}
                    </td>
                    <td className="py-3 px-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500" title={rule.createdById}>
                      {rule.createdById.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rules Pagination */}
        <CommissionsPagination
          page={historyPage}
          limit={historyLimit}
          total={totalRules}
          onPageChange={setHistoryPage}
        />
      </div>
    </div>
  );
}
