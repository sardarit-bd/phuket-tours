import type { Metadata } from "next";
import { AdminBookingsView } from "@/features/admin/components/bookings/admin-bookings-view";

export const metadata: Metadata = {
  title: "Staff Bookings Management — Admin Dashboard",
  description: "Review, approve, or reject staff-created direct client bookings and discount requests.",
};

export default function AdminStaffBookingsPage() {
  return <AdminBookingsView sourceFilter="staff" />;
}
