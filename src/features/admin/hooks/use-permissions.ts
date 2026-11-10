"use client";

import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/features/auth/slices/auth-slice";
import { useGetEffectivePermissionsQuery } from "../api/admin-api";
import type { PermissionId } from "../types/admin-permissions";

export interface UsePermissionsReturn {
  permissions: string[];
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  hasPermission: (permission: PermissionId | PermissionId[]) => boolean;
  hasAnyPermission: (permissions: PermissionId[]) => boolean;
  hasAllPermissions: (permissions: PermissionId[]) => boolean;
}

/**
 * Hook providing fine-grained permission checks for the current authenticated user.
 *
 * Rules:
 * - Admin has unrestricted administrative access (hasPermission always returns true).
 * - Staff permissions are retrieved dynamically from the backend effective permissions API.
 * - Non-staff/non-admin roles (customer, agent) have zero admin permissions.
 */
export function usePermissions(): UsePermissionsReturn {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  // Fetch effective permissions only when authenticated
  const { data, isLoading } = useGetEffectivePermissionsQuery(undefined, {
    skip: !isAuthenticated || (!isAdmin && !isStaff),
  });

  const permissionsList = data?.data?.permissions ?? [];

  const hasPermission = (permission: PermissionId | PermissionId[]): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;
    if (!isStaff) return false;

    const required = Array.isArray(permission) ? permission : [permission];
    return required.some((p) => permissionsList.includes(p));
  };

  const hasAnyPermission = (permissions: PermissionId[]): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;
    if (!isStaff) return false;

    return permissions.some((p) => permissionsList.includes(p));
  };

  const hasAllPermissions = (permissions: PermissionId[]): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;
    if (!isStaff) return false;

    return permissions.every((p) => permissionsList.includes(p));
  };

  return {
    permissions: permissionsList,
    isAdmin,
    isStaff,
    isLoading: (isAdmin || isStaff) && isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

/**
 * Convenience hook to check if the current user holds specific permission(s).
 */
export function useHasPermission(permission: PermissionId | PermissionId[]): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}
