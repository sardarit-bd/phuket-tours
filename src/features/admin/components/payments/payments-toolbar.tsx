"use client";

import * as React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PaymentsToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  methodFilter: string;
  onMethodFilterChange: (method: string) => void;
  bookingIdFilter: string;
  onBookingIdFilterChange: (bookingId: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: "All Statuses", value: "ALL" },
  { label: "Awaiting Verification", value: "SUBMITTED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Initiated", value: "INITIATED" },
  { label: "Rejected", value: "REJECTED" },
];

const METHOD_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All Payment Methods", value: "ALL" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Other", value: "OTHER" },
];

export function PaymentsToolbar({
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  bookingIdFilter,
  onBookingIdFilterChange,
  onResetFilters,
  hasActiveFilters,
}: PaymentsToolbarProps) {
  const [localSearch, setLocalSearch] = React.useState(bookingIdFilter);
  const [prevFilter, setPrevFilter] = React.useState(bookingIdFilter);

  if (prevFilter !== bookingIdFilter) {
    setPrevFilter(bookingIdFilter);
    setLocalSearch(bookingIdFilter);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBookingIdFilterChange(localSearch.trim());
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-xs">
      {/* 1. Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5EAED] pb-3" role="tablist" aria-label="Filter payments by status">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusFilterChange(tab.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-[#176779] text-white shadow-xs"
                  : "bg-transparent text-[#74818A] hover:bg-[#F8FAFB] hover:text-[#18282A]"
              )}
              data-testid={`status-tab-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Controls Row: Method filter & Booking ID Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Method Select */}
          <div className="relative min-w-[180px]">
            <select
              value={methodFilter}
              onChange={(e) => onMethodFilterChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3.5 py-2 text-xs font-medium text-[#18282A] focus:border-[#176779] focus:bg-white focus:outline-none transition-colors cursor-pointer"
              aria-label="Filter by payment method"
              data-testid="filter-method-select"
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 gap-1 rounded-xl text-xs text-[#74818A] hover:text-rose-600 hover:bg-rose-50"
              data-testid="reset-filters-btn"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>

        {/* Booking ID Filter Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Filter by Booking ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-9 w-full rounded-xl border-[#E5EAED] bg-[#F8FAFB] pl-9 pr-3 text-xs placeholder:text-[#74818A] focus:bg-white"
              aria-label="Filter by booking ID"
              data-testid="search-booking-id-input"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9 rounded-xl bg-[#176779] px-3 text-xs text-white hover:bg-[#135564]"
          >
            Filter
          </Button>
        </form>
      </div>
    </div>
  );
}
