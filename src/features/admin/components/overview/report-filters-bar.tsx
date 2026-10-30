import * as React from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminReportFiltersQuery } from "../../types/admin";

export interface ReportFiltersBarProps {
  filters: AdminReportFiltersQuery;
  onApplyFilters: (filters: AdminReportFiltersQuery) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export function ReportFiltersBar({
  filters,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}: ReportFiltersBarProps) {
  const [prevFilters, setPrevFilters] = React.useState(filters);
  const [fromDate, setFromDate] = React.useState(filters.from ?? "");
  const [toDate, setToDate] = React.useState(filters.to ?? "");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Synchronize internal inputs when external filters change during render
  if (prevFilters.from !== filters.from || prevFilters.to !== filters.to) {
    setPrevFilters(filters);
    setFromDate(filters.from ?? "");
    setToDate(filters.to ?? "");
    setValidationError(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (fromDate && toDate && fromDate > toDate) {
      setValidationError("The start date must not be after the end date.");
      return;
    }

    onApplyFilters({
      ...filters,
      from: fromDate || undefined,
      to: toDate || undefined,
    });
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setValidationError(null);
    onResetFilters();
  };

  const handleQuickPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    const toStr = to.toISOString().split("T")[0];
    const fromStr = from.toISOString().split("T")[0];

    setFromDate(fromStr);
    setToDate(toStr);
    setValidationError(null);

    onApplyFilters({
      ...filters,
      from: fromStr,
      to: toStr,
    });
  };

  const hasActiveFilters = Boolean(filters.from || filters.to);

  return (
    <div
      aria-label="Report date filters"
      className="rounded-xl border border-[#E5EAED] bg-white p-4 shadow-xs"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#74818A]">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filter Report Window</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                Active Filter
              </span>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset(7)}
              disabled={isLoading}
              className="rounded-md border border-[#E5EAED] bg-[#F8FAFB] px-2.5 py-1 text-xs font-medium text-[#18282A] hover:bg-[#E8F6F8] hover:text-[#176779] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(30)}
              disabled={isLoading}
              className="rounded-md border border-[#E5EAED] bg-[#F8FAFB] px-2.5 py-1 text-xs font-medium text-[#18282A] hover:bg-[#E8F6F8] hover:text-[#176779] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(90)}
              disabled={isLoading}
              className="rounded-md border border-[#E5EAED] bg-[#F8FAFB] px-2.5 py-1 text-xs font-medium text-[#18282A] hover:bg-[#E8F6F8] hover:text-[#176779] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              Last Quarter
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-from-date" className="text-xs font-medium text-[#74818A]">
              From:
            </label>
            <div className="relative">
              <input
                id="filter-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={isLoading}
                className="h-9 rounded-lg border border-[#E5EAED] bg-white px-3 py-1.5 text-xs text-[#18282A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-to-date" className="text-xs font-medium text-[#74818A]">
              To:
            </label>
            <div className="relative">
              <input
                id="filter-to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={isLoading}
                className="h-9 rounded-lg border border-[#E5EAED] bg-white px-3 py-1.5 text-xs text-[#18282A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-9 bg-primary px-4 text-xs font-medium text-white hover:bg-primary-dark"
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
