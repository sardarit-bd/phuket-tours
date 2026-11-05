"use client";

import * as React from "react";
import { Search, RotateCcw, Filter, UserCheck } from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";
import type { AdminStaffMember } from "../../types/admin-bookings";

export interface BookingsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  fulfillmentStatus: string;
  onFulfillmentStatusChange: (status: string) => void;
  assignedStaffId: string;
  onAssignedStaffIdChange: (staffId: string) => void;
  staffMembers?: AdminStaffMember[];
  isStaffLoading?: boolean;
  onResetFilters: () => void;
  isFiltered: boolean;
}

const FULFILLMENT_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Fulfillment", icon: <Filter className="h-3.5 w-3.5" /> },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "FULFILLED", label: "Fulfilled" },
];

export function BookingsToolbar({
  search,
  onSearchChange,
  fulfillmentStatus,
  onFulfillmentStatusChange,
  assignedStaffId,
  onAssignedStaffIdChange,
  staffMembers = [],
  onResetFilters,
  isFiltered,
}: BookingsToolbarProps) {
  const staffOptions: SelectOption<string>[] = React.useMemo(() => {
    const list: SelectOption<string>[] = [
      { value: "ALL", label: "All Staff Members", icon: <UserCheck className="h-3.5 w-3.5" /> },
    ];
    for (const s of staffMembers) {
      if (s.status === "active") {
        list.push({ value: s.id, label: s.name });
      }
    }
    return list;
  }, [staffMembers]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAED] bg-white p-3.5 shadow-2xs sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74818A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter current view by customer, tour, or ID..."
            className="h-10 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-10 pr-4 text-xs font-medium text-[#18282A] placeholder-[#74818A] transition-all focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
            data-testid="bookings-search-input"
          />
        </div>

        {/* Right: Filters & Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Fulfillment Status Filter */}
          <div className="w-[170px]">
            <CustomSelect
              options={FULFILLMENT_OPTIONS}
              value={fulfillmentStatus}
              onChange={(val) => onFulfillmentStatusChange(val)}
              aria-label="Filter by fulfillment status"
              usePortal={true}
              data-testid="bookings-fulfillment-filter"
            />
          </div>

          {/* Assigned Staff Filter */}
          <div className="w-[190px]">
            <CustomSelect
              options={staffOptions}
              value={assignedStaffId}
              onChange={(val) => onAssignedStaffIdChange(val)}
              aria-label="Filter by assigned staff"
              usePortal={true}
              data-testid="bookings-staff-filter"
            />
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 rounded-xl px-3 text-xs font-semibold text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A] cursor-pointer"
              data-testid="bookings-reset-filters-btn"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
