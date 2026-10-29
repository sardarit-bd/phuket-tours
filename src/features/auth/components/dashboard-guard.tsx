"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthStatus,
} from "../slices/auth-slice";
import { authApi } from "../api/auth-api";
import { Button } from "@/components/ui/button";

interface DashboardGuardProps {
  children: React.ReactNode;
}

/**
 * DashboardGuard provides client-side route protection for /dashboard and /dashboard/admin.
 *
 * Behaviors:
 * 1. While auth is initializing or loading, renders a clean session verification loader.
 * 2. On genuine server/network failure, renders an error fallback with retry capability.
 * 3. If unauthenticated (401 or logged out), redirects to /sign-in preserving a safe return path.
 * 4. If an authenticated non-admin attempts to access /dashboard/admin*, redirects to /dashboard.
 * 5. Once initialized, authenticated, and authorized, renders children.
 *
 * Note: Client-side guards provide immediate UX protection and prevent UI flashes, but
 * the read-only backend API remains the authoritative source of authorization via HttpOnly cookies.
 */
export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/dashboard";
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const authStatus = useAppSelector(selectAuthStatus);

  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isAuthorized = !isAdminRoute || user?.role === "admin";

  // Effect: Handle unauthenticated redirection to /sign-in with return path
  React.useEffect(() => {
    if (
      isInitialized &&
      !isAuthenticated &&
      authStatus !== "loading" &&
      authStatus !== "failed"
    ) {
      const redirectTarget = `/sign-in?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectTarget);
    }
  }, [isInitialized, isAuthenticated, authStatus, pathname, router]);

  // Effect: Handle non-admin access to admin routes by redirecting to /dashboard
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && !isAuthorized) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isAuthenticated, isAuthorized, router]);

  // 1. Initializing or loading state
  if (!isInitialized || authStatus === "loading") {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
        role="status"
        aria-label="Verifying your session"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[#3297A3]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#74818A]">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Genuine network or server error fallback
  if (authStatus === "failed" && !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4">
        <div
          role="alert"
          className="w-full max-w-md rounded-2xl border border-destructive/20 bg-white p-6 shadow-sm text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="font-outfit text-lg font-bold text-[#18282A]">
            Session Verification Failed
          </h2>
          <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
            We encountered an unexpected network or server issue while verifying
            your session. Please check your connection and try again.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button
              type="button"
              onClick={() => {
                dispatch(
                  authApi.endpoints.getMe.initiate(undefined, {
                    forceRefetch: true,
                  })
                );
              }}
              className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary-dark text-white text-xs px-5 h-9 cursor-pointer"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              <span>Retry</span>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto rounded-full text-xs px-5 h-9"
            >
              <Link href="/sign-in">Go to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated state (while redirecting)
  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
        role="status"
        aria-label="Redirecting to sign in"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[#3297A3]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#74818A]">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  // 4. Authenticated non-admin attempting admin route (while redirecting)
  if (!isAuthorized) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
        role="status"
        aria-label="Restricted access, redirecting to user dashboard"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[#3297A3]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#74818A]">
            Access restricted. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // 5. Authorized session
  return <>{children}</>;
}
