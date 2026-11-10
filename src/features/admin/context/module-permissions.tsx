"use client";

import * as React from "react";
import { usePermissions } from "../hooks/use-permissions";
import type { PermissionId } from "../types/admin-permissions";

export interface ModulePermissionsValue {
  isAdmin: boolean;
  isStaff: boolean;
  permissions: string[];
  /** Returns true when the current user holds the permission (Admin bypasses). */
  can: (permission: PermissionId) => boolean;
  /** Returns true when the current user holds every permission (Admin bypasses). */
  hasAll: (permissions: PermissionId[]) => boolean;
}

/**
 * Permissive fallback used by isolated component tests and by non-admin
 * surfaces that do not need module gating. Real admin pages are wrapped by
 * ModulePermissionsProvider in the admin layout.
 */
export const defaultModulePermissions: ModulePermissionsValue = {
  isAdmin: true,
  isStaff: false,
  permissions: [],
  can: () => true,
  hasAll: () => true,
};

export const ModulePermissionsContext =
  React.createContext<ModulePermissionsValue>(defaultModulePermissions);

export function ModulePermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isStaff, permissions, hasPermission, hasAllPermissions } =
    usePermissions();

  const value = React.useMemo<ModulePermissionsValue>(
    () => ({
      isAdmin,
      isStaff,
      permissions,
      can: (permission) => hasPermission(permission),
      hasAll: (required) => hasAllPermissions(required),
    }),
    [isAdmin, isStaff, permissions, hasPermission, hasAllPermissions]
  );

  return (
    <ModulePermissionsContext.Provider value={value}>
      {children}
    </ModulePermissionsContext.Provider>
  );
}

export function useModulePermissions(): ModulePermissionsValue {
  return React.useContext(ModulePermissionsContext);
}
