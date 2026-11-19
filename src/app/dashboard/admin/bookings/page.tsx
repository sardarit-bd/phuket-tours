import type { Metadata } from "next";
import { AdminBookingsView } from "@/features/admin/components/bookings/admin-bookings-view";

export const metadata: Metadata = {
  title: "Bookings Management — Admin Dashboard",
  description: "Operational tour bookings queue, staff assignments, and fulfillment progress.",
};

export default function AdminBookingsPage() {
  return <AdminBookingsView />;
}
