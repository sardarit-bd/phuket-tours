"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { CustomerBookingDetail } from "@/features/customer/components/bookings/customer-booking-detail";

export default function UserBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;

  return (
    <div className="space-y-6" data-testid="customer-booking-detail-page">
      <div>
        <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
          Booking Details
        </h1>
        <p className="mt-1 text-sm text-[#74818A]">
          Full reservation and payment information for this tour booking.
        </p>
      </div>

      <CustomerBookingDetail bookingId={bookingId} />
    </div>
  );
}
