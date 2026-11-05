import type { Metadata } from "next";
import { AdminUsersView } from "@/features/admin/components/users/admin-users-view";

export const metadata: Metadata = {
  title: "Users Management — PhuketTours Admin Dashboard",
  description:
    "Manage system accounts, send staff and agent onboarding invitations, and monitor account access statuses.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
