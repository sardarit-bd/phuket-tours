"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, User } from "lucide-react";
import {
  DashboardNavConfig,
  isNavItemActive,
} from "../types/dashboard-nav";
import { cn } from "@/lib/utils";

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
  const isAdmin = config.role === "admin";
  const homeHref = isAdmin ? "/dashboard/admin" : "/dashboard";

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
            isAdmin
              ? "bg-[#18282A] text-white"
              : "bg-[#3297A3]/10 text-[#3297A3]"
          )}
        >
          {isAdmin ? "Admin" : "User"}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard Menu">
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
        {/* Development Route Switcher Helper */}
        <Link
          href={isAdmin ? "/dashboard" : "/dashboard/admin"}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#74818A] hover:bg-[#EEF4F6] hover:text-[#18282A] transition-colors"
          title="Switch view for local development preview only"
        >
          <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {isAdmin ? "Switch to User Portal" : "Switch to Admin Portal"}
          </span>
          <span className="ml-auto text-[9px] uppercase tracking-wider bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-mono">
            Dev
          </span>
        </Link>

        {/* Back to Public Site Link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#74818A] hover:bg-[#EEF4F6] hover:text-[#18282A] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Back to Website</span>
        </Link>

        {/* Profile Identity Representation */}
        <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-[#E5EAED] bg-white p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3297A3]/10 text-[#3297A3]">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#18282A]">
              {isAdmin ? "Admin Staff" : "Phuket Traveler"}
            </p>
            <p className="truncate text-[10px] text-[#74818A]">
              {isAdmin ? "admin@phukettours.com" : "guest@phukettours.com"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
