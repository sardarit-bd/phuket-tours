"use client";

import * as React from "react";
import { Search, RotateCcw, Filter, UserCheck, CreditCard, Calendar } from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";
import type { AdminStaffMember } from "../../types/admin-bookings";

export interface BookingsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  bookingStatus: string;
  onBookingStatusChange: (status: string) => void;
  paymentStatus: string;
  onPaymentStatusChange: (status: string) => void;
  fulfillmentStatus: string;
  onFulfillmentStatusChange: (status: string) => void;
  assignedStaffId: string;
  onAssignedStaffIdChange: (staffId: string) => void;
  travelDate: string;
  onTravelDateChange: (date: string) => void;
  staffMembers?: AdminStaffMember[];
  isStaffLoading?: boolean;
  statusCounts?: Record<string, number>;
  onResetFilters: () => void;
  isFiltered: boolean;
}

const PAYMENT_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Payment Statuses", icon: <CreditCard className="h-3.5 w-3.5" /> },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
];

const FULFILLMENT_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Fulfillment", icon: <Filter className="h-3.5 w-3.5" /> },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "FULFILLED", label: "Fulfilled" },
];

export function BookingsToolbar({
  search,
  onSearchChange,
  bookingStatus,
  onBookingStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  fulfillmentStatus,
  onFulfillmentStatusChange,
  assignedStaffId,
  onAssignedStaffIdChange,
  travelDate,
  onTravelDateChange,
  staffMembers = [],
  statusCounts = {},
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

  const bookingStatusTabs = [
    { key: "ALL", label: "All Bookings", count: statusCounts["ALL"] },
    { key: "PENDING", label: "Pending", count: statusCounts["PENDING"] },
    { key: "CONFIRMED", label: "Confirmed", count: statusCounts["CONFIRMED"] },
    { key: "IN_PROGRESS", label: "In Progress", count: statusCounts["IN_PROGRESS"] },
    { key: "COMPLETED", label: "Completed", count: statusCounts["COMPLETED"] },
    { key: "CANCELLED", label: "Cancelled", count: statusCounts["CANCELLED"] },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E5EAED] bg-white p-4 shadow-2xs">
      {/* 1. Status Filter Pills / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0">
        {bookingStatusTabs.map((tab) => {
          const isActive = bookingStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onBookingStatusChange(tab.key)}
              data-testid={`status-filter-${tab.key.toLowerCase()}`}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-outfit text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#176779] text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Structured Filter Grid with Flexible Search and Predictable Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 gap-3 items-center">
        {/* Search input: spans 3 columns on xl, 2 on lg */}
        <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-3">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 h-4 w-4 text-[#74818A] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search reference, customer, or tour..."
              className="h-10 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] pl-10 pr-3.5 font-outfit text-xs text-[#18282A] placeholder-[#74818A] transition-all focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#176779]"
              data-testid="bookings-search-input"
            />
          </div>
        </div>

        {/* Payment Status Filter */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <CustomSelect
            options={PAYMENT_STATUS_OPTIONS}
            value={paymentStatus}
            onChange={(val) => onPaymentStatusChange(val)}
            aria-label="Filter by payment status"
            triggerClassName="h-10"
            usePortal={true}
            data-testid="bookings-payment-filter"
          />
        </div>

        {/* Travel Date Filter */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <div className="relative flex items-center w-full">
            <input
              type="date"
              value={travelDate}
              onChange={(e) => onTravelDateChange(e.target.value)}
              aria-label="Filter by travel date"
              className="h-10 w-full rounded-xl border border-[#E5EAED] bg-[#FAFCFC] px-3.5 font-outfit text-xs text-[#18282A] transition-all focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#176779] cursor-pointer"
              data-testid="bookings-travel-date-filter"
            />
          </div>
        </div>

        {/* Fulfillment Status Filter */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <CustomSelect
            options={FULFILLMENT_OPTIONS}
            value={fulfillmentStatus}
            onChange={(val) => onFulfillmentStatusChange(val)}
            aria-label="Filter by fulfillment status"
            triggerClassName="h-10"
            usePortal={true}
            data-testid="bookings-fulfillment-filter"
          />
        </div>

        {/* Assigned Staff Filter */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <CustomSelect
            options={staffOptions}
            value={assignedStaffId}
            onChange={(val) => onAssignedStaffIdChange(val)}
            aria-label="Filter by assigned staff"
            triggerClassName="h-10"
            usePortal={true}
            data-testid="bookings-staff-filter"
          />
        </div>

        {/* Reset Filters Button */}
        <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1 flex justify-start sm:justify-end">
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 w-full sm:w-auto rounded-xl px-3 font-outfit text-xs font-semibold text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A] cursor-pointer transition-colors"
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