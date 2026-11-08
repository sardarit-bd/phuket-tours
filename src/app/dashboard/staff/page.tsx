import type { Metadata } from "next";
import AdminPageDefault from "@/app/dashboard/admin/page";

export const metadata: Metadata = {
  title: "Staff Overview Analytics — PhuketTours",
  description:
    "Monitor bookings, revenue and overall platform performance.",
};

/**
 * Staff Overview. Reuses the same analytics page as the Admin portal so the
 * two portals never drift apart; the page itself switches its heading text
 * based on the authenticated role (see AdminOverviewPage).
 */
export default AdminPageDefault;
