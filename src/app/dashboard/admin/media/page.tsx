import type { Metadata } from "next";
import { AdminMediaView } from "@/features/admin/components/media/admin-media-view";

export const metadata: Metadata = {
  title: "Media Library — Admin Dashboard",
  description: "Centralized media repository for tours, activities, and marketing imagery.",
};

export default function AdminMediaPage() {
  return <AdminMediaView />;
}
