import type { Metadata } from "next";
import { AdminPaymentsView } from "@/features/admin/components/payments/admin-payments-view";

export const metadata: Metadata = {
  title: "Payments Management — Admin Dashboard",
  description: "Manage transactions, verify incoming payments and record manual payments.",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsView />;
}
