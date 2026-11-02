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
  permission?: PermissionId;
  adminOnly?: boolean;
}

export interface DashboardNavConfig {
  role: "user" | "admin" | "agent";
  roleLabel: string;
  portalTitle: string;
  items: DashboardNavItem[];
}

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
      permission: "dashboard.view",
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
