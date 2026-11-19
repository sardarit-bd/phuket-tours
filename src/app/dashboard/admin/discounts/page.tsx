import type { Metadata } from "next";
import { AdminDiscountsView } from "@/features/admin/components/discounts/admin-discounts-view";

export const metadata: Metadata = {
  title: "Staff Discount Requests — Admin Dashboard",
  description: "Review, approve, and manage custom staff discount requests.",
};

export default function AdminDiscountsPage() {
  return <AdminDiscountsView />;
}
