"use client";

import * as React from "react";
import { RefreshCw, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function BookingsHeader({
  onRefresh,
  isRefreshing = false,
}: BookingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176779]/10 text-[#176779]">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            Bookings Management
          </h1>
        </div>
        <p className="text-xs text-[#74818A] sm:text-sm">
          Review customer reservations, confirm new bookings, assign staff, and track tour fulfillment in one place.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] cursor-pointer"
          aria-label="Refresh bookings queue"
          data-testid="refresh-bookings-btn"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#176779]" : ""}`}
          />
          {isRefreshing ? "Updating..." : "Refresh Queue"}
        </Button>
      </div>
    </div>
  );
}
