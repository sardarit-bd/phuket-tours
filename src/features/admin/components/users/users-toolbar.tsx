"use client";

import * as React from "react";
import { Search, RotateCcw, Filter, ShieldCheck } from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";

export interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

const ROLE_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Roles", icon: <Filter className="h-3.5 w-3.5" /> },
  { value: "customer", label: "Customer" },
  { value: "agent", label: "Agent" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Statuses", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { value: "active", label: "Active" },
  { value: "deactivated", label: "Deactivated" },
];

export function UsersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  isFiltered,
}: UsersToolbarProps) {
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
            placeholder="Search users by name or email..."
            className="h-10 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-10 pr-4 text-xs font-medium text-[#18282A] placeholder-[#74818A] transition-all focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176779]/20"
            data-testid="users-search-input"
          />
        </div>

        {/* Right: Filters & Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="w-[160px]">
            <CustomSelect
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={(val) => onRoleFilterChange(val)}
              aria-label="Filter by role"
              usePortal={true}
              data-testid="users-role-filter"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[160px]">
            <CustomSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => onStatusFilterChange(val)}
              aria-label="Filter by account status"
              usePortal={true}
              data-testid="users-status-filter"
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
              data-testid="users-reset-filters-btn"
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
