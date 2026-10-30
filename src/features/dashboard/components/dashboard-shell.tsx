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

  // Automatically select role config: admin accounts must use ONLY adminNavConfig
  const activeConfig = React.useMemo(() => {
    if (user?.role === "admin") {
      return adminNavConfig;
    }
    if (navConfig) return navConfig;
    if (pathname.startsWith("/dashboard/admin")) {
      return adminNavConfig;
    }
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
        {/* 1. Desktop Fixed Sidebar: 248px */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[248px]">
          <DashboardSidebar config={activeConfig} />
        </div>

        {/* 2. Mobile/Tablet Slide-over Drawer: 280px (<1024px) */}
        <MobileNavDrawer
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          config={activeConfig}
        />

        {/* 3. Main Workspace Container (pl-[248px] on desktop) */}
        <div className="flex min-h-screen w-full flex-col lg:pl-[248px]">
          {/* Topbar: 64px sticky */}
          <DashboardTopbar
            config={activeConfig}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
