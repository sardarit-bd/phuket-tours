import type { Metadata } from "next";
import { AdminSettingsView } from "@/features/admin/components/settings/admin-settings-view";

export const metadata: Metadata = {
  title: "System Settings & Secure Configuration — Admin",
  description:
    "Manage platform identity, payment gateway credentials, webhook secrets, Cloudinary media storage, SMTP relay, and configuration audit logs.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsView />;
}
