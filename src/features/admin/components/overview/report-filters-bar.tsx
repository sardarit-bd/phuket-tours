import * as React from "react";
import { Calendar, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminReportFiltersQuery } from "../../types/admin";

export interface ReportFiltersBarProps {
  filters: AdminReportFiltersQuery;
  onApplyFilters: (filters: AdminReportFiltersQuery) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

type PresetKey = "custom" | "7d" | "30d" | "quarter" | "reset";

function computePresetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export function ReportFiltersBar({
  filters,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}: ReportFiltersBarProps) {
  const [fromDate, setFromDate] = React.useState(filters.from ?? "");
  const [toDate, setToDate] = React.useState(filters.to ?? "");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [activePreset, setActivePreset] = React.useState<PresetKey | null>(null);

  // Sync internal inputs when external filters change.
  React.useEffect(() => {
    setFromDate(filters.from ?? "");
    setToDate(filters.to ?? "");
  }, [filters.from, filters.to]);

  const hasActiveFilters = Boolean(filters.from || filters.to);

  const applyDates = (from: string, to: string) => {
    setValidationError(null);
    if (from && to && from > to) {
      setValidationError("The start date must not be after the end date.");
      return;
    }
    onApplyFilters({
      ...filters,
      from: from || undefined,
      to: to || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePreset("custom");
    applyDates(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setValidationError(null);
    setActivePreset(null);
    onResetFilters();
  };

  const handlePreset = (preset: Exclude<PresetKey, "custom" | "reset">) => {
    const range = computePresetRange(
      preset === "7d" ? 7 : preset === "30d" ? 30 : 90
    );
    setFromDate(range.from);
    setToDate(range.to);
    setValidationError(null);
    setActivePreset(preset);
    onApplyFilters({
      ...filters,
      from: range.from,
      to: range.to,
    });
  };

  const presetButton = (
    key: PresetKey,
    label: string
  ) => {
    const isCustomActive = key === "custom" && activePreset === "custom";
    const isActive = key === "custom" ? isCustomActive : activePreset === key;
    const handle =
      key === "custom"
        ? () => setActivePreset("custom")
        : key === "reset"
        ? handleReset
        : () => handlePreset(key as Exclude<PresetKey, "custom" | "reset">);

    return (
      <button
        key={key}
        type="button"
        onClick={handle}
        disabled={isLoading}
        aria-pressed={isActive}
        className={cn(
          "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
          isActive
            ? "bg-[#176779] text-white shadow-xs"
            : "border border-[#E5EAED] bg-white text-[#18282A] hover:bg-[#E8F6F8] hover:text-[#176779]"
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      aria-label="Report date filters"
      data-testid="report-filters-bar"
      className="rounded-xl border border-[#E5EAED] bg-white p-4 shadow-xs"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#2B9BA8]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74818A]">
              Filter Report Window
            </span>
            {hasActiveFilters && (
              <span className="rounded-full bg-[#E8F6F8] px-2 py-0.5 text-[10px] font-bold text-[#176779]">
                Active
              </span>
            )}
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {presetButton("7d", "Last 7 Days")}
            {presetButton("30d", "Last 30 Days")}
            {presetButton("quarter", "Last Quarter")}
            {presetButton("custom", "Custom")}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Date range inputs (left) */}
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label
                htmlFor="filter-from-date"
                className="w-8 text-xs font-medium text-[#74818A]"
              >
                From
              </label>
              <input
                id="filter-from-date"
                aria-label="From:"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={isLoading}
                className="h-9 w-full max-w-[160px] rounded-lg border border-[#E5EAED] bg-white px-3 py-1.5 text-xs text-[#18282A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="filter-to-date"
                className="w-8 text-xs font-medium text-[#74818A]"
              >
                To
              </label>
              <input
                id="filter-to-date"
                aria-label="To:"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={isLoading}
                className="h-9 w-full max-w-[160px] rounded-lg border border-[#E5EAED] bg-white px-3 py-1.5 text-xs text-[#18282A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions (right) */}
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-9 bg-[#176779] px-4 text-xs font-medium text-white hover:bg-[#125362]"
            >
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Apply Filter
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="h-9 border-[#E5EAED] text-xs text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A]"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {validationError && (
          <p
            role="alert"
            className="text-xs font-medium text-red-600"
            data-testid="filter-validation-error"
          >
            {validationError}
          </p>
        )}
      </form>
    </div>
  );
}
