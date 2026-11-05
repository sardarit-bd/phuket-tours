"use client";

import * as React from "react";
import Link from "next/link";
import { CustomerBookingsTable } from "@/features/customer/components/bookings/customer-bookings-table";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function UserBookingsPage() {
  return (
    <div className="space-y-6" data-testid="customer-bookings-page">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              My Bookings
            </h1>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              Customer Reservations
            </span>
          </div>
          <p className="mt-1 text-sm text-[#74818A]">
            Track and manage all your Phuket tour reservations.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664]"
        >
          <Link href="/tours">
            <Compass className="mr-1.5 h-3.5 w-3.5" />
            <span>Book New Tour</span>
          </Link>
        </Button>
      </div>

      <CustomerBookingsTable />
    </div>
  );
}
