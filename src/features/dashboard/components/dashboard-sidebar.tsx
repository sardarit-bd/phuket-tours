"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  DashboardNavConfig,
  hasAllPermissions,
  isNavItemActive,
} from "../types/dashboard-nav";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/slices/auth-slice";
import { getInitials } from "@/features/auth/utils/avatar";
import { usePermissions } from "@/features/admin/hooks/use-permissions";

interface DashboardSidebarProps {
  config: DashboardNavConfig;
  onNavigate?: () => void;
  className?: string;
}

export function DashboardSidebar({
  config,
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname() ?? "/dashboard";
  const user = useAppSelector(selectCurrentUser);
  const { hasPermission, isAdmin, permissions } = usePermissions();

  // State to track manually expanded/collapsed submenus
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isViewAdmin = config.role === "admin";
  const isViewStaff = config.role === "staff";
  const isViewAgent = config.role === "agent";
  const homeHref = isViewAdmin
    ? "/dashboard/admin"
    : isViewStaff
    ? "/dashboard/staff"
    : isViewAgent
    ? "/dashboard/agent"
    : "/dashboard";

  const visibleItems = React.useMemo(() => {
    return config.items.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (isAdmin) return true;
      if (item.permissions && !hasAllPermissions(permissions, item.permissions)) {
        return false;
      }
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [config.items, isAdmin, permissions, hasPermission]);

  const displayName =
    user?.name ||
    (isViewAdmin
      ? "Admin Staff"
      : isViewStaff
      ? "PhuketTours Staff"
      : isViewAgent
      ? "Partner Agent"
      : "Phuket Traveler");
  const displayEmail =
    user?.email ||
    (isViewAdmin
      ? "admin@phukettours.com"
      : isViewStaff
      ? "staff@phukettours.com"
      : isViewAgent
      ? "agent@phukettours.com"
      : "guest@phukettours.com");
  const avatarInitials = getInitials(user?.name);

  return (
    <aside
      className={cn(
        "flex h-full w-[270px] shrink-0 flex-col border-r border-[#E5EAED] bg-[#FAFEFF]",
        className
      )}
      aria-label={`${config.roleLabel} Navigation`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#E5EAED] px-5">
        <Link
          href={homeHref}
          onClick={onNavigate}
          className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          aria-label="PhuketTours Dashboard Home"
        >
          <Image
            src="/images/logo/Logo.png"
            alt="PhuketTours"
            width={140}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            isViewAdmin
              ? "bg-[#18282A] text-white"
              : isViewStaff
              ? "bg-[#176779] text-white"
              : isViewAgent
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-[#3297A3]/10 text-[#3297A3]"
          )}
          data-testid="sidebar-role-indicator"
        >
          {isViewAdmin
            ? "Admin"
            : isViewStaff
            ? "Staff"
            : isViewAgent
            ? "Agent"
            : "User"}
        </span>
      </div>

      {/* Navigation List */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Dashboard Menu"
      >
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#74818A]">
          Menu
        </div>
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isRouteActive = isNavItemActive(pathname, item);
            const isSubmenuExplicitlyOpen = openSubmenus[item.href];
            const isExpanded = isSubmenuExplicitlyOpen ?? isRouteActive;
            const Icon = item.icon;

            if (hasChildren && item.children) {
              const submenuId = `sidebar-submenu-${item.href.replace(/[\/]/g, "-")}`;
              const isChildActive = item.children.some((child) => isNavItemActive(pathname, child));
              const isRowActive = isRouteActive || isChildActive;

              return (
                <li key={item.href} className="space-y-1">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.href)}
                      aria-expanded={isExpanded}
                      aria-controls={submenuId}
                      aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                      data-testid={`sidebar-parent-btn-${item.href.replace(/[\/]/g, "-")}`}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isRowActive
                          ? "bg-[#3297A3]/10 text-[#3297A3] font-semibold"
                          : "text-[#263238] hover:bg-[#EEF4F6] hover:text-[#18282A]"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isRowActive ? "text-[#3297A3]" : "text-[#74818A] group-hover:text-[#18282A]"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {item.badge && (
                          <span className="rounded-full bg-[#3297A3]/15 px-2 py-0.5 text-[10px] font-semibold text-[#3297A3]">
                            {item.badge}
                          </span>
                        )}
                        <span
                          className="p-1 rounded-md text-[#74818A] group-hover:text-[#18282A] transition-colors"
                          data-testid={`sidebar-submenu-toggle-${item.href.replace(/[\/]/g, "-")}`}
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-200",
                              isExpanded ? "rotate-180 text-[#3297A3]" : ""
                            )}
                          />
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Submenu links */}
                  {isExpanded && (
                    <ul
                      id={submenuId}
                      className="ml-4 pl-3 border-l border-[#E5EAED] space-y-1 py-0.5"
                      data-testid={submenuId}
                    >
                      {item.children.map((subItem) => {
                        const isSubActive = isNavItemActive(pathname, subItem);
                        const SubIcon = subItem.icon;
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              onClick={onNavigate}
                              className={cn(
                                "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                                isSubActive
                                  ? "bg-[#3297A3]/10 text-[#3297A3] font-semibold"
                                  : "text-[#556972] hover:bg-[#EEF4F6] hover:text-[#18282A]"
                              )}
                              aria-current={isSubActive ? "page" : undefined}
                              data-testid={`sidebar-subitem-${subItem.href.replace(/[\/]/g, "-")}`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {SubIcon && (
                                  <SubIcon
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 transition-colors",
                                      isSubActive ? "text-[#3297A3]" : "text-[#96A4AB]"
                                    )}
                                  />
                                )}
                                <span className="truncate">{subItem.title}</span>
                              </div>
                              {subItem.badge && (
                                <span className="rounded-full bg-[#3297A3]/15 px-1.5 py-0.2 text-[9px] font-semibold text-[#3297A3]">
                                  {subItem.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isRouteActive
                      ? "bg-[#3297A3]/10 text-[#3297A3] font-semibold shadow-2xs"
                      : "text-[#263238] hover:bg-[#EEF4F6] hover:text-[#18282A]"
                  )}
                  aria-current={isRouteActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isRouteActive ? "text-[#3297A3]" : "text-[#74818A]"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-[#3297A3]/15 px-2 py-0.5 text-[10px] font-semibold text-[#3297A3]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Utilities */}
      <div className="border-t border-[#E5EAED] p-3 space-y-1">
        {/* Back to Public Site Link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#74818A] hover:bg-[#EEF4F6] hover:text-[#18282A] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Back to Website</span>
        </Link>

        {/* Dynamic Profile Identity Representation */}
        <div className="mt-2 flex items-center rounded-lg border border-[#E5EAED] bg-white p-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
                aria-label="User Avatar"
              />
            ) : (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3297A3]/10 text-[#3297A3] font-outfit text-xs font-bold"
                aria-label="User Avatar Initials"
              >
                {avatarInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#18282A]">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-[#74818A]">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
