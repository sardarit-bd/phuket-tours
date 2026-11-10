"use client";

import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { useGetAdminUsersQuery } from "../../api/admin-api";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";

interface CommissionsToolbarProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  agentFilter: string;
  onAgentChange: (agentId: string) => void;
  bookingIdFilter: string;
  onBookingIdChange: (bookingId: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onReset: () => void;
  isFiltered: boolean;
}

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CANCELLED", label: "Cancelled" },
];

const LIMIT_OPTIONS: SelectOption<number>[] = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
];

export function CommissionsToolbar({
  statusFilter,
  onStatusChange,
  agentFilter,
  onAgentChange,
  bookingIdFilter,
  onBookingIdChange,
  limit,
  onLimitChange,
  onReset,
  isFiltered,
}: CommissionsToolbarProps) {
  // Query partner agents to populate agent filter dropdown
  const { data: agentsData, isLoading: isAgentsLoading } = useGetAdminUsersQuery({
    role: "agent",
    limit: 50,
  });

  const agents = React.useMemo(() => {
    return agentsData?.data?.items || [];
  }, [agentsData?.data?.items]);

  const agentOptions = React.useMemo<SelectOption<string>[]>(() => {
    const list: SelectOption<string>[] = [
      { value: "ALL", label: "All Partner Agents" },
    ];
    agents.forEach((agent) => {
      list.push({
        value: agent.id,
        label: agent.agentProfile?.agencyName
          ? `${agent.name} (${agent.agentProfile.agencyName})`
          : agent.name,
      });
    });
    return list;
  }, [agents]);

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs"
      data-testid="commissions-toolbar"
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Status:
          </span>
          <div className="w-[145px]">
            <CustomSelect<string>
              id="commission-status-filter"
              data-testid="commission-status-filter"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => onStatusChange(val)}
              size="sm"
              usePortal={true}
              aria-label="Filter by commission status"
            />
          </div>
        </div>

        {/* Agent Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Agent:
          </span>
          <div className="w-[210px]">
            <CustomSelect<string>
              id="commission-agent-filter"
              data-testid="commission-agent-filter"
              options={agentOptions}
              value={agentFilter}
              onChange={(val) => onAgentChange(val)}
              disabled={isAgentsLoading}
              size="sm"
              usePortal={true}
              aria-label="Filter by partner agent"
            />
          </div>
        </div>

        {/* Booking ID Filter */}
        <div className="flex flex-1 min-w-[220px] items-center gap-2">
          <label
            htmlFor="commission-booking-id-filter"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
          >
            Booking ID:
          </label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              id="commission-booking-id-filter"
              data-testid="commission-booking-id-filter"
              type="text"
              placeholder="Filter by Booking UUID..."
              value={bookingIdFilter}
              onChange={(e) => onBookingIdChange(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#E5EAED] bg-white pl-8 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 shadow-2xs transition-colors hover:border-[#176779]/60 focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#176779] font-mono"
            />
          </div>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Show:
          </span>
          <div className="w-[76px]">
            <CustomSelect<number>
              id="commission-limit-selector"
              data-testid="commission-limit-selector"
              options={LIMIT_OPTIONS}
              value={limit}
              onChange={(val) => onLimitChange(Number(val))}
              size="sm"
              usePortal={true}
              aria-label="Select records per page"
            />
          </div>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            data-testid="commission-reset-filters-btn"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
