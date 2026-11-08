"use client";

import * as React from "react";
import { AgentCommissionsTable } from "@/features/agent/components/commissions/agent-commissions-table";

export default function AgentCommissionsPage() {
  return (
    <div className="space-y-6" data-testid="agent-commissions-page">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            My Commissions
          </h1>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Ledger & Settlements
          </span>
        </div>
        <p className="mt-1 text-sm text-[#74818A]">
          Official audit ledger of commissions accrued and settled across your partner bookings.
        </p>
      </div>

      {/* Commissions Table Component */}
      <AgentCommissionsTable />
    </div>
  );
}
