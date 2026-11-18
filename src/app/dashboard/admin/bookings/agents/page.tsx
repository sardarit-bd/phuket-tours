import type { Metadata } from "next";
import { AdminBookingsView } from "@/features/admin/components/bookings/admin-bookings-view";

export const metadata: Metadata = {
  title: "Agent Bookings Management — Admin Dashboard",
  description: "Review agent-created bookings, agency attribution, and commission records.",
};

export default function AdminAgentBookingsPage() {
  return <AdminBookingsView sourceFilter="agent" />;
}
