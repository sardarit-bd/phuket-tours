"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ChevronRight, LogOut } from "lucide-react";
import { DashboardNavConfig, getBreadcrumbInfo } from "../types/dashboard-nav";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  clearCredentials,
} from "@/features/auth/slices/auth-slice";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { baseApi } from "@/lib/api/base-api";
import { getInitials } from "@/features/auth/utils/avatar";

interface DashboardTopbarProps {
  config: DashboardNavConfig;
  onOpenMobileNav: () => void;
}

export function DashboardTopbar({
  config,
  onOpenMobileNav,
}: DashboardTopbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/dashboard";
  const { portal, current } = getBreadcrumbInfo(pathname, config);

  const user = useAppSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const displayName =
    user?.name || (config.role === "admin" ? "Admin Staff" : "Guest Account");
  const avatarInitials = getInitials(user?.name);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Proceed with resilient local cleanup even if network request fails
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      router.push("/sign-in");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E5EAED] bg-white px-4 sm:px-6 lg:px-8 shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburger Toggle (below 1024px) */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#263238] hover:bg-[#F8FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs sm:text-sm"
        >
          <span className="font-medium text-[#74818A]">{portal}</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#8A9A9C]" />
          <h1 className="font-outfit font-bold text-[#18282A] text-sm sm:text-base tracking-tight">
            {current}
          </h1>
        </nav>
      </div>

      {/* Right: Search Placeholder, Avatar Indicator & Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Compact Search Field */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A9A9C] pointer-events-none" />
          <Input
            type="search"
            placeholder="Quick search..."
            aria-label="Quick search (demonstration placeholder)"
            className="h-9 w-full rounded-full border-[#E5EAED] bg-[#F8FAFB] pl-9 pr-3 text-xs placeholder:text-[#8A9A9C] focus-visible:ring-[#3297A3] focus-visible:bg-white"
            readOnly
          />
        </div>

        {/* Dynamic Profile Representation */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3297A3]/30 bg-[#3297A3]/10 text-[#3297A3] font-outfit text-xs font-bold"
            aria-label="Current User Avatar"
          >
            {avatarInitials}
          </div>
          <span className="hidden xl:inline text-xs font-semibold text-[#18282A]">
            {displayName}
          </span>

          {/* Quick Sign Out Action in Topbar */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#74818A] hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer disabled:opacity-50 ml-1"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
