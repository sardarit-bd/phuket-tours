"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  clearCredentials,
} from "@/features/auth/slices/auth-slice";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { baseApi } from "@/lib/api/base-api";
import { getInitials } from "@/features/auth/utils/avatar";

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Resilient cleanup even if network fails or session was already invalid
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      setMobileMenuOpen(false);
      router.push("/sign-in");
    }
  };

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dashboardHref =
    user?.role === "admin" ? "/dashboard/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5EAED] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
      <Container className="max-w-[1320px] lg:px-0 flex h-[var(--navbar-height,5rem)] items-center justify-between">
        {/* Left: Official PhuketTours Logo */}
        <Link
          href="/"
          className="inline-flex items-center shrink-0 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="PhuketTours Homepage"
        >
          <Image
            src="/images/logo/Logo.png"
            alt="PhuketTours"
            width={173}
            height={40}
            priority
            className="h-9 w-auto sm:h-10 object-contain"
          />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-8 xl:gap-10"
          aria-label="Main Navigation"
        >
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-[#263238] hover:text-primary"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth Controls & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic Desktop Auth Controls */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5EAED] bg-[#FAFEFF] px-3.5 py-1.5 text-xs font-semibold text-[#18282A] hover:border-primary/40 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Access Dashboard"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                  {getInitials(user.name)}
                </span>
                <span className="max-w-[120px] truncate">
                  {user.name || "Dashboard"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#74818A] hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer disabled:opacity-50"
                aria-label="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-xs sm:text-sm font-semibold text-[#263238] hover:text-primary transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="hidden md:inline-flex items-center text-xs sm:text-sm font-medium text-[#74818A] hover:text-[#18282A] transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Book Now CTA Button */}
          <Button
            asChild
            size="default"
            className="hidden sm:inline-flex group rounded-full bg-primary hover:bg-primary-dark text-white font-medium px-5 sm:px-6 h-10 sm:h-11 text-sm shadow-sm transition-all items-center gap-2 cursor-pointer"
          >
            <Link href="/tours">
              <span>Book Now</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#263238] hover:bg-muted lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E5EAED] bg-white px-4 py-6 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2">
            {/* Authenticated user identity in mobile drawer */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 rounded-xl border border-[#E5EAED] bg-[#FAFEFF] p-3 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#18282A]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-[#74818A]">{user.email}</p>
                </div>
              </div>
            )}

            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-[#263238] hover:bg-muted"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Actions */}
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-[#E5EAED] flex flex-col gap-1">
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-[#263238] hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <span>
                      {user.role === "admin"
                        ? "Admin Dashboard"
                        : "User Dashboard"}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#74818A]" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#E5EAED] flex flex-col gap-1">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-[#263238] hover:bg-muted transition-colors"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 text-[#74818A]" />
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-[#74818A] hover:bg-muted transition-colors"
                >
                  <span>Create an Account</span>
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#E5EAED]">
              <Button asChild size="lg" className="w-full rounded-full">
                <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
                  <span>Book Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
