import * as React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Heart,
  Settings,
  Compass,
  ClipboardList,
  Users,
  Tag,
  Sliders,
  Image as ImageIcon,
  Percent,
  Building2,
  CreditCard,
} from "lucide-react";

import type { PermissionId } from "@/features/admin/types/admin-permissions";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
  /** Any one of these permissions grants visibility (admin always bypasses). */
  permission?: PermissionId | PermissionId[];
  /** Every one of these permissions is required for visibility (admin always bypasses). */
  permissions?: PermissionId[];
  adminOnly?: boolean;
}

export interface DashboardNavConfig {
  role: "user" | "admin" | "staff" | "agent";
  roleLabel: string;
  portalTitle: string;
  items: DashboardNavItem[];
}

/**
 * Staff Overview requires only `reports.view`. `dashboard.view` is no longer
 * a mandatory Staff Portal entry permission; module access alone is sufficient.
 */
export const STAFF_OVERVIEW_PERMISSIONS: PermissionId[] = ["reports.view"];

const ADMIN_OVERVIEW_PERMISSIONS: PermissionId[] = ["reports.view"];

/**
 * Settings access is granted by `settings.view` or any of the
 * settings-management sub-permissions supported by the backend.
 */
export const SETTINGS_ACCESS_PERMISSIONS: PermissionId[] = [
  "settings.view",
  "settings.general.manage",
  "settings.payment.manage",
  "settings.webhook.manage",
  "settings.cloudinary.manage",
  "settings.smtp.manage",
  "settings.audit.view",
];

export const userNavConfig: DashboardNavConfig = {
  role: "user",
  roleLabel: "User Portal",
  portalTitle: "My Phuket Experience",
  items: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "My Bookings",
      href: "/dashboard/bookings",
      icon: CalendarCheck,
    },
    {
      title: "Payment History",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      title: "My Favorites",
      href: "/dashboard/favorites",
      icon: Heart,
    },
    {
      title: "Profile Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export const adminNavConfig: DashboardNavConfig = {
  role: "admin",
  roleLabel: "Admin Portal",
  portalTitle: "PhuketTours Admin",
  items: [
    {
      title: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
      permissions: ADMIN_OVERVIEW_PERMISSIONS,
    },
    {
      title: "Tours Management",
      href: "/dashboard/admin/tours",
      icon: Compass,
      permission: "tours.view",
    },
    {
      title: "Media Library",
      href: "/dashboard/admin/media",
      icon: ImageIcon,
      permission: "media.view",
    },
    {
      title: "Bookings Management",
      href: "/dashboard/admin/bookings",
      icon: ClipboardList,
      permission: "bookings.view",
    },
    {
      title: "Payments Management",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      permission: "payments.view",
    },
    {
      title: "Commissions Management",
      href: "/dashboard/admin/commissions",
      icon: Percent,
      adminOnly: true,
    },
    {
      title: "Users Management",
      href: "/dashboard/admin/users",
      icon: Users,
      permission: "users.view",
    },
    {
      title: "Categories",
      href: "/dashboard/admin/categories",
      icon: Tag,
      permission: "tours.view",
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Sliders,
      permission: "settings.view",
    },
  ],
};

export const staffNavConfig: DashboardNavConfig = {
  role: "staff",
  roleLabel: "Staff Portal",
  portalTitle: "PhuketTours Staff",
  items: [
    {
      title: "Overview",
      href: "/dashboard/staff",
      icon: LayoutDashboard,
      exact: true,
      permissions: STAFF_OVERVIEW_PERMISSIONS,
    },
    {
      title: "Tours Management",
      href: "/dashboard/staff/tours",
      icon: Compass,
      permission: "tours.view",
    },
    {
      title: "Media Library",
      href: "/dashboard/staff/media",
      icon: ImageIcon,
      permission: "media.view",
    },
    {
      title: "Bookings Management",
      href: "/dashboard/staff/bookings",
      icon: ClipboardList,
      permission: "bookings.view",
    },
    {
      title: "Payments Management",
      href: "/dashboard/staff/payments",
      icon: CreditCard,
      permission: "payments.view",
    },
    {
      title: "Users Management",
      href: "/dashboard/staff/users",
      icon: Users,
      permission: "users.view",
    },
    {
      title: "Categories",
      href: "/dashboard/staff/categories",
      icon: Tag,
      permission: "tours.view",
    },
    {
      title: "Settings",
      href: "/dashboard/staff/settings",
      icon: Sliders,
      permissions: SETTINGS_ACCESS_PERMISSIONS,
    },
  ],
};

export const agentNavConfig: DashboardNavConfig = {
  role: "agent",
  roleLabel: "Agent Portal",
  portalTitle: "PhuketTours Agent Portal",
  items: [
    {
      title: "Overview",
      href: "/dashboard/agent",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "My Bookings",
      href: "/dashboard/agent/bookings",
      icon: CalendarCheck,
    },
    {
      title: "My Commissions",
      href: "/dashboard/agent/commissions",
      icon: Percent,
    },
    {
      title: "Agency Profile",
      href: "/dashboard/agent/profile",
      icon: Building2,
    },
  ],
};

/**
 * Accurately determines if a navigation item is active based on the current pathname.
 * If item.exact is true, requires an exact match to avoid marking root overviews
 * active when navigating to nested subpages.
 */
export function isNavItemActive(pathname: string, item: DashboardNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Returns clean breadcrumb segments for topbar display.
 */
export function getBreadcrumbInfo(
  pathname: string,
  config: DashboardNavConfig
): { portal: string; current: string } {
  const activeItem = config.items.find((item) => isNavItemActive(pathname, item));
  return {
    portal: config.roleLabel,
    current: activeItem?.title ?? "Dashboard",
  };
}

export interface StaffAdminRouteRule {
  href: string;
  permissions: PermissionId[];
  adminOnly?: boolean;
  exact?: boolean;
}

/**
 * Authoritative Staff routing table for the admin portal.
 *
 * Unknown admin routes are intentionally absent so that they default-deny.
 * Action-only permissions (for example tours.create) never grant module entry.
 */
export const staffAdminRouteRules: StaffAdminRouteRule[] = [
  {
    href: "/dashboard/staff",
    permissions: STAFF_OVERVIEW_PERMISSIONS,
    exact: true,
  },
  { href: "/dashboard/staff/tours", permissions: ["tours.view"] },
  { href: "/dashboard/staff/media", permissions: ["media.view"] },
  { href: "/dashboard/staff/bookings", permissions: ["bookings.view"] },
  { href: "/dashboard/staff/payments", permissions: ["payments.view"] },
  {
    // Commissions is Admin-only and is not present in the Staff portal, so the
    // rule is absent from the staff allow-list (unknown staff routes default-deny).
    href: "/dashboard/staff/commissions",
    permissions: [],
    adminOnly: true,
  },
  { href: "/dashboard/staff/users", permissions: ["users.view"] },
  { href: "/dashboard/staff/categories", permissions: ["tours.view"] },
  {
    href: "/dashboard/staff/settings",
    permissions: SETTINGS_ACCESS_PERMISSIONS,
  },
];

export function isAdminPortalPath(pathname: string): boolean {
  return pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
}

/**
 * True when the pathname is inside the Staff Portal (/dashboard/staff*).
 * The Staff portal mirrors the Admin portal's module set but is addressed at
 * its own URL prefix so Staff URLs never read "/dashboard/admin".
 */
export function isStaffPortalPath(pathname: string): boolean {
  return (
    pathname === "/dashboard/staff" || pathname.startsWith("/dashboard/staff/")
  );
}

export function hasAllPermissions(
  granted: readonly string[],
  required: readonly PermissionId[]
): boolean {
  return required.every((permission) => granted.includes(permission));
}

export function getStaffAdminRouteRule(
  pathname: string
): StaffAdminRouteRule | undefined {
  return staffAdminRouteRules.find((rule) =>
    rule.exact
      ? pathname === rule.href
      : pathname === rule.href || pathname.startsWith(`${rule.href}/`)
  );
}

/**
 * Staff may enter a known staff-portal route only when every permission
 * listed for it is granted. Commissions is admin-only and all unknown routes
 * default-deny. `hasAllPermissions` returns true for an empty required list,
 * but the `adminOnly` flag is checked separately, so that case is handled.
 */
export function canAccessStaffAdminRoute(
  pathname: string,
  granted: readonly string[]
): boolean {
  const rule = getStaffAdminRouteRule(pathname);
  if (!rule || rule.adminOnly) return false;
  return hasAllPermissions(granted, rule.permissions);
}

/**
 * Returns the first module a Staff member can enter, in navigation order.
 * Overview is excluded because it is an analytics landing page, not a module.
 */
export function getFirstPermittedModule(
  granted: readonly string[]
): string | null {
  for (const item of staffNavConfig.items) {
    if (item.href === "/dashboard/staff" || item.adminOnly) continue;
    if (item.permissions && !hasAllPermissions(granted, item.permissions)) {
      continue;
    }
    if (item.permission) {
      const required = Array.isArray(item.permission)
        ? item.permission
        : [item.permission];
      if (!required.some((permission) => granted.includes(permission))) {
        continue;
      }
    }
    return item.href;
  }
  return null;
}

export function canViewStaffOverview(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, STAFF_OVERVIEW_PERMISSIONS);
}
