"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import {
  DashboardNavConfig,
  userNavConfig,
  adminNavConfig,
  staffNavConfig,
  agentNavConfig,
  affiliateNavConfig,
} from "../types/dashboard-nav";
import { DashboardGuard } from "@/features/auth/components/dashboard-guard";

import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/slices/auth-slice";

interface DashboardShellProps {
  children: React.ReactNode;
  navConfig?: DashboardNavConfig;
}

export function DashboardShell({
  children,
  navConfig,
}: DashboardShellProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/dashboard";
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const user = useAppSelector(selectCurrentUser);

  // Automatically select role config.
  // - Admin/Staff/Agent: strict role-based config (URL prefix no longer drives
  //   the portal because Staff has its own /dashboard/staff/* tree).
  // - Unauthenticated or customer: fall back to the pathname-based heuristic so
  //   legacy deep-link tests still work.
  const activeConfig = React.useMemo(() => {
    const role = user?.role;
    if (role === "staff") return staffNavConfig;
    if (role === "admin") return adminNavConfig;
    if (role === "agent") return agentNavConfig;
    if (pathname.startsWith("/dashboard/affiliate")) return affiliateNavConfig;
    if (role === "affiliate") return userNavConfig;
    if (navConfig) return navConfig;
    if (pathname.startsWith("/dashboard/admin")) return adminNavConfig;
    if (pathname.startsWith("/dashboard/staff")) return staffNavConfig;
    if (pathname.startsWith("/dashboard/agent")) return agentNavConfig;
    return userNavConfig;
  }, [navConfig, pathname, user?.role]);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileNavOpen(false);
  }

  return (
    <DashboardGuard>
      <div className="relative min-h-screen w-full bg-[#F8FAFB] overflow-x-hidden">
        {/* 1. Desktop Fixed Sidebar: 270px */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[270px]">
          <DashboardSidebar config={activeConfig} />
        </div>

        {/* 2. Mobile/Tablet Slide-over Drawer: 280px (<1024px) */}
        <MobileNavDrawer
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          config={activeConfig}
        />

        {/* 3. Main Workspace Container (pl-[270px] on desktop) */}
        <div className="flex min-h-screen w-full flex-col lg:pl-[270px]">
          {/* Topbar: 64px sticky */}
          <DashboardTopbar
            config={activeConfig}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />

          {/* Main Content Area: full available workspace width with consistent 24px desktop padding */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-6">
            <div
              className="w-full max-w-none"
              data-testid="dashboard-content-container"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
