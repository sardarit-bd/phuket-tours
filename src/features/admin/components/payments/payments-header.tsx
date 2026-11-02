"use client";

import * as React from "react";
import { RefreshCw, PlusCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaymentsHeaderProps {
  onRefresh: () => void;
  onRecordPayment: () => void;
  isRefreshing?: boolean;
  canRecord?: boolean;
}

export function PaymentsHeader({
  onRefresh,
  onRecordPayment,
  isRefreshing = false,
  canRecord = false,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#176779] border border-teal-100">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
              Payments Management
            </h1>
            <p className="mt-0.5 text-xs text-[#74818A]">
              Manage transactions, verify incoming payments and record manual payments.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 rounded-xl border-[#E5EAED] bg-white px-3.5 text-xs font-medium text-[#18282A] hover:bg-[#F8FAFB] transition-colors cursor-pointer"
          data-testid="refresh-payments-btn"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-[#74818A] ${isRefreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>

        {canRecord && (
          <Button
            type="button"
            size="sm"
            onClick={onRecordPayment}
            className="h-9 gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#135564] transition-colors cursor-pointer"
            data-testid="record-payment-header-btn"
          >
            <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Record Payment</span>
          </Button>
        )}
      </div>
    </div>
  );
}
