"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { DashboardNavConfig, getBreadcrumbInfo } from "../types/dashboard-nav";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  clearCredentials,
} from "@/features/auth/slices/auth-slice";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { baseApi } from "@/lib/api/base-api";
import { getInitials } from "@/features/auth/utils/avatar";
import { cn } from "@/lib/utils";

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

  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const accountDropdownRef = React.useRef<HTMLDivElement>(null);

  const user = useAppSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const isViewAdmin = config.role === "admin";
  const isViewStaff = config.role === "staff";
  const isViewAgent = config.role === "agent";

  const displayName =
    user?.name ||
    (isViewAdmin
      ? "Admin Staff"
      : isViewStaff
      ? "PhuketTours Staff"
      : isViewAgent
      ? "Partner Agent"
      : "Guest Account");
  const avatarInitials = getInitials(user?.name);

  // Profile destination by portal role
  const profileHref = isViewAdmin
    ? "/dashboard/admin/settings"
    : isViewStaff
    ? "/dashboard/staff/settings"
    : isViewAgent
    ? "/dashboard/agent/profile"
    : "/dashboard/settings";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Proceed with resilient local cleanup even if network request fails
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      setAccountDropdownOpen(false);
      router.push("/sign-in");
    }
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    }
    if (accountDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountDropdownOpen]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAccountDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {/* Right: Account Dropdown */}
      <div className="relative" ref={accountDropdownRef}>
        <button
          type="button"
          onClick={() => setAccountDropdownOpen((prev) => !prev)}
          className="inline-flex items-center gap-2.5 rounded-full border border-[#E5EAED] bg-[#FAFEFF] py-1.5 pl-2 pr-3.5 text-xs font-semibold text-[#18282A] hover:border-primary/40 hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none shadow-2xs"
          aria-expanded={accountDropdownOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3297A3]/15 text-[#3297A3] font-outfit text-xs font-bold"
            aria-label="Current User Avatar"
          >
            {avatarInitials}
          </span>
          <span className="hidden sm:inline font-medium text-[#18282A] max-w-[150px] truncate">
            {displayName}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-[#74818A] transition-transform duration-200",
              accountDropdownOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Menu */}
        {accountDropdownOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5EAED] bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50 focus:outline-none"
          >
            {/* User identity summary inside dropdown */}
            <div className="px-3 py-2 border-b border-[#E5EAED] mb-1">
              <p className="text-xs font-semibold text-[#18282A] truncate">
                {displayName}
              </p>
              {user?.email && (
                <p className="text-[11px] text-[#74818A] truncate">
                  {user.email}
                </p>
              )}
            </div>

            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setAccountDropdownOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#263238] hover:bg-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:bg-muted"
            >
              <User className="h-4 w-4 text-primary shrink-0" />
              <span>My Profile</span>
            </Link>

            <div className="border-t border-[#E5EAED] my-1 pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
