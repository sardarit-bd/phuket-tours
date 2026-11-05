import type { Metadata } from "next";
import { AdminToursView } from "@/features/admin/components/tours/admin-tours-view";

export const metadata: Metadata = {
  title: "Tours Management — Admin Dashboard",
  description: "Comprehensive administration console for tour catalogue, pricing, and availability.",
};

export default function AdminToursPage() {
  return <AdminToursView />;
}

