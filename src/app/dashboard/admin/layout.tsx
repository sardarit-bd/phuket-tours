"use client";

import * as React from "react";
import { ModulePermissionsProvider } from "@/features/admin/context/module-permissions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModulePermissionsProvider>{children}</ModulePermissionsProvider>;
}
