"use client";

import * as React from "react";
import { ModulePermissionsProvider } from "@/features/admin/context/module-permissions";

/**
 * Staff Portal layout. Mirrors the Admin portal layout by wrapping every
 * staff module page in the same ModulePermissionsProvider so shared admin
 * module components (AdminToursView, AdminMediaView, etc.) behave identically
 * under the /dashboard/staff URL tree.
 */
export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModulePermissionsProvider>{children}</ModulePermissionsProvider>;
}
