"use client";

import * as React from "react";
import { CustomerPaymentsTable } from "@/features/customer/components/payments/customer-payments-table";

export default function UserPaymentsPage() {
  return (
    <div className="space-y-6" data-testid="customer-payments-page">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            Payment History
          </h1>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            All Transactions
          </span>
        </div>
        <p className="mt-1 text-sm text-[#74818A]">
          View all payment records for your Phuket tour reservations.
        </p>
      </div>

      <CustomerPaymentsTable />
    </div>
  );
}
