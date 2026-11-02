"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthStatus,
} from "../slices/auth-slice";
import { authApi } from "../api/auth-api";
import { useGetEffectivePermissionsQuery } from "@/features/admin/api/admin-api";
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

  const isAdminRoute =
    pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
  const isAgentRoute =
    pathname === "/dashboard/agent" || pathname.startsWith("/dashboard/agent/");
  const isCustomerRoute =
    pathname.startsWith("/dashboard") && !isAdminRoute && !isAgentRoute;

  const userRole = user?.role;
  const isUserAdmin = userRole === "admin";
  const isUserStaff = userRole === "staff";
  const isUserAgent = userRole === "agent";
  const hasAdminPortalAccess = isUserAdmin || isUserStaff;

  const { data: effectivePermsData, isLoading: isPermissionsLoading } =
    useGetEffectivePermissionsQuery(undefined, {
      skip: !isInitialized || !isAuthenticated || user?.role !== "staff" || !isAdminRoute,
    });
  const staffPermissions = React.useMemo(() => {
    return effectivePermsData?.data?.permissions || [];
  }, [effectivePermsData?.data?.permissions]);

  // Strict role-based authorization:
  // - Admin & Staff: authorized ONLY on admin routes (/dashboard/admin*)
  // - Agent: authorized ONLY on agent routes (/dashboard/agent*)
  // - Customer: authorized ONLY on customer routes (/dashboard, /dashboard/bookings, etc.)
  const isAuthorized = React.useMemo(() => {
    if (hasAdminPortalAccess) return isAdminRoute;
    if (isUserAgent) return isAgentRoute;
    return isCustomerRoute;
  }, [hasAdminPortalAccess, isAdminRoute, isUserAgent, isAgentRoute, isCustomerRoute]);

  // Module permission check for Staff members
  const requiredPermission = React.useMemo(() => {
    if (!isUserStaff) return null;
    if (pathname.startsWith("/dashboard/admin/users")) return "users.view";
    if (pathname.startsWith("/dashboard/admin/tours")) return "tours.view";
    if (pathname.startsWith("/dashboard/admin/media")) return "media.view";
    if (pathname.startsWith("/dashboard/admin/bookings")) return "bookings.view";
    if (pathname.startsWith("/dashboard/admin/payments")) return "payments.view";
    if (pathname.startsWith("/dashboard/admin/settings")) return "settings.view";
    if (pathname === "/dashboard/admin") return "dashboard.view";
    return null;
  }, [isUserStaff, pathname]);

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

  // Effect: Handle strict role-based separation
  // 1. Admin/Staff accessing non-admin routes -> redirect to /dashboard/admin
  // 2. Agent accessing non-agent routes -> redirect to /dashboard/agent
  // 3. Customer accessing admin/agent routes -> redirect to /dashboard
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && !isAuthorized) {
      if (hasAdminPortalAccess) {
        router.replace("/dashboard/admin");
      } else if (isUserAgent) {
        router.replace("/dashboard/agent");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, isAuthorized, hasAdminPortalAccess, isUserAgent, router]);

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

  // 4. Role mismatch state (while redirecting)
  if (!isAuthorized) {
    const redirectLabel = hasAdminPortalAccess
      ? "Redirecting to admin portal..."
      : isUserAgent
      ? "Redirecting to agent portal..."
      : "Access restricted. Redirecting to dashboard...";

    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
        role="status"
        aria-label={redirectLabel}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[#3297A3]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#74818A]">
            {redirectLabel}
          </p>
        </div>
      </div>
    );
  }

  // 5. Staff fine-grained permission enforcement on admin portal
  if (isUserStaff && isAdminRoute) {
    if (isPermissionsLoading) {
      return (
        <div
          className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
          role="status"
          aria-label="Verifying permissions"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#3297A3]" aria-hidden="true" />
            <p className="text-sm font-medium text-[#74818A]">Verifying permissions...</p>
          </div>
        </div>
      );
    }

    if (pathname.startsWith("/dashboard/admin/commissions")) {
      return (
        <div
          data-testid="staff-access-denied"
          className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-outfit text-lg font-bold text-[#18282A]">
              Access Restricted
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              Commissions Management is restricted to Administrators only. Staff accounts do not have access to view or adjust financial commission ledgers.
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild size="sm" className="bg-[#176779] text-white text-xs px-5 h-9">
                <Link href="/dashboard/admin">Return to Overview</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (requiredPermission && !staffPermissions.includes(requiredPermission)) {
      return (
        <div
          data-testid="staff-access-denied"
          className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-outfit text-lg font-bold text-[#18282A]">
              Access Restricted
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              Your staff account does not have permission to access this module (
              <span className="font-mono text-[11px] font-semibold text-amber-700">
                {requiredPermission}
              </span>
              ). Please contact your administrator to request access.
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild size="sm" className="bg-[#176779] text-white text-xs px-5 h-9">
                <Link href="/dashboard/admin">Return to Overview</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 6. Authorized session
  return <>{children}</>;
}
