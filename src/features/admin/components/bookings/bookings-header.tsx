"use client";

import * as React from "react";
import { RefreshCw, ClipboardList, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function BookingsHeader({ onRefresh, isRefreshing = false }: BookingsHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176779]/10 text-[#176779]">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Bookings Management
            </h1>
            <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              Operational Queue
            </span>
          </div>
          <p className="text-xs text-[#74818A] sm:text-sm">
            Manage active tour reservations, assign staff members, and track fulfillment progress.
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

      {/* Operational queue notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p className="leading-relaxed">
          <span className="font-semibold">Operational Scope:</span> This queue displays bookings eligible for operational delivery (<span className="font-medium text-emerald-800">Confirmed</span>, <span className="font-medium text-sky-800">In Progress</span>, and <span className="font-medium text-slate-800">Completed</span>). Unconfirmed draft requests and cancelled price negotiations are excluded by the backend.
        </p>
      </div>
    </div>
  );
}
