"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import {
  DashboardNavConfig,
  isNavItemActive,
} from "../types/dashboard-nav";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  clearCredentials,
} from "@/features/auth/slices/auth-slice";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { baseApi } from "@/lib/api/base-api";
import { getInitials } from "@/features/auth/utils/avatar";

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname() ?? "/dashboard";
  const user = useAppSelector(selectCurrentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const isViewAdmin = config.role === "admin";
  const homeHref = isViewAdmin ? "/dashboard/admin" : "/dashboard";

  const displayName =
    user?.name || (isViewAdmin ? "Admin Staff" : "Phuket Traveler");
  const displayEmail =
    user?.email || (isViewAdmin ? "admin@phukettours.com" : "guest@phukettours.com");
  const avatarInitials = getInitials(user?.name);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Proceed with resilient local cleanup even if network request fails
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      if (onNavigate) {
        onNavigate();
      }
      router.push("/sign-in");
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full w-[248px] shrink-0 flex-col border-r border-[#E5EAED] bg-[#FAFEFF]",
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
            "rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            isViewAdmin
              ? "bg-[#18282A] text-white"
              : "bg-[#3297A3]/10 text-[#3297A3]"
          )}
        >
          {isViewAdmin ? "Admin" : "User"}
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
          {config.items.map((item) => {
            const isActive = isNavItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#3297A3]/10 text-[#3297A3] font-semibold shadow-2xs"
                      : "text-[#263238] hover:bg-[#EEF4F6] hover:text-[#18282A]"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-[#3297A3]" : "text-[#74818A]"
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
        <div className="mt-2 flex items-center justify-between rounded-lg border border-[#E5EAED] bg-white p-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3297A3]/10 text-[#3297A3] font-outfit text-xs font-bold"
              aria-label="User Avatar Initials"
            >
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#18282A]">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-[#74818A]">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Functional Sign Out Action */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#74818A] hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer disabled:opacity-50"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
