import type { Metadata } from "next";
import { AdminBookingsView } from "@/features/admin/components/bookings/admin-bookings-view";

export const metadata: Metadata = {
  title: "Direct & Customer Bookings — Admin Dashboard",
  description: "Review bookings submitted directly by customers online or through direct sales channels.",
};

export default function AdminDirectBookingsPage() {
  return <AdminBookingsView sourceFilter="direct" />;
}
