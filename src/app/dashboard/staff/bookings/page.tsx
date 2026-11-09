import type { Metadata } from "next";
import { StaffBookingsView } from "@/features/staff/components/bookings/staff-bookings-view";

export const metadata: Metadata = {
  title: "Assigned Tours & Bookings — Staff Portal",
  description:
    "Operational tour queue, guest pickup manifests, and tour fulfillment delivery.",
};

export default function StaffBookingsPage() {
  return <StaffBookingsView />;
}
