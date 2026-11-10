import type { Metadata } from "next";
import AdminPageDefault from "@/app/dashboard/admin/settings/page";

export const metadata: Metadata = {
  title: "System Settings — Staff Portal",
  description:
    "Manage platform identity, payment gateway credentials, webhook secrets, Cloudinary media storage, SMTP relay, and configuration audit logs.",
};

export default AdminPageDefault;
