import type { Metadata } from "next";
import { AdminCommissionsView } from "@/features/admin/components/commissions/admin-commissions-view";

export const metadata: Metadata = {
  title: "Commissions Management — Admin Dashboard",
  description:
    "Audit partner agent commissions, adjust earnings with full compliance reasons, and manage platform commission policy rules.",
};

export default function AdminCommissionsPage() {
  return <AdminCommissionsView />;
}
