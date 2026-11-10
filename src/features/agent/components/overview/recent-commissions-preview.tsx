"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";
import type { AgentCommissionRecord } from "../../types/agent";
import { AgentCommissionStatusBadge } from "../common/agent-status-badges";
import { Button } from "@/components/ui/button";
import {
  formatAgentCurrency,
  formatAgentDate,
} from "../../utils/agent-formatters";

interface RecentCommissionsPreviewProps {
  commissions?: AgentCommissionRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function RecentCommissionsPreview({
  commissions,
  isLoading,
  isError,
  onRetry,
}: RecentCommissionsPreviewProps) {
  return (
    <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5EAED]">
        <div>
          <h3 className="font-outfit text-base font-bold text-[#18282A]">
            Recent Commissions
          </h3>
          <p className="text-xs text-[#74818A]">
            Latest ledger entries credited to your partner account
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-[#176779] hover:bg-teal-50 hover:text-[#135664]"
        >
          <Link href="/dashboard/agent/commissions">
            <span>View All</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center" data-testid="recent-commissions-error">
            <p className="text-xs font-semibold text-rose-700">
              Unable to load recent commissions
            </p>
            <p className="mt-1 text-[11px] text-[#74818A]">
              Please check your connection and try again.
            </p>
            {onRetry && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        ) : !commissions || commissions.length === 0 ? (
          <div className="py-8 text-center" data-testid="recent-commissions-empty">
            <Coins className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-[#18282A]">
              No commissions recorded yet
            </p>
            <p className="text-[11px] text-[#74818A]">
              Commissions will appear here as your customer bookings are confirmed and fulfilled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EAED] text-[11px] font-semibold uppercase text-[#74818A]">
                  <th className="pb-2.5">Booking Ref</th>
                  <th className="pb-2.5">Tour Service</th>
                  <th className="pb-2.5">Rate</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Commission</th>
                  <th className="pb-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAED]">
                {commissions.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F8FAFB] transition-colors"
                    data-testid={`recent-commission-row-${c.id}`}
                  >
                    <td className="py-3 font-mono font-medium text-[#18282A]">
                      {c.bookingId.slice(0, 8)}...
                    </td>
                    <td className="py-3 text-[#18282A]">
                      <div className="truncate max-w-[180px]">
                        {c.booking?.service?.name || "Tour Service"}
                      </div>
                    </td>
                    <td className="py-3 text-[#74818A]">
                      {c.rateType === "PERCENTAGE"
                        ? `${c.rateValue}%`
                        : formatAgentCurrency(c.rateValue, c.booking?.currency, 0)}
                    </td>
                    <td className="py-3">
                      <AgentCommissionStatusBadge status={c.status} />
                    </td>
                    <td className="py-3 text-right font-semibold text-emerald-700">
                      {formatAgentCurrency(c.amount, c.booking?.currency, 2)}
                    </td>
                    <td className="py-3 text-right text-[#74818A]">
                      {formatAgentDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
