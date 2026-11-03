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
import {
  STAFF_PORTAL_ENTRY_PERMISSION,
  canAccessStaffAdminRoute,
  canViewStaffOverview,
  getFirstPermittedModule,
  getStaffAdminRouteRule,
  isAdminPortalPath,
} from "@/features/dashboard/types/dashboard-nav";

interface DashboardGuardProps {
  children: React.ReactNode;
}

function LoaderState({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB]"
      role="status"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="h-8 w-8 animate-spin text-[#3297A3]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-[#74818A]">{label}</p>
      </div>
    </div>
  );
}

/**
 * DashboardGuard provides client-side route protection for /dashboard and /dashboard/admin.
 *
 * Behaviors:
 * 1. While auth or Staff permissions are loading, renders a clean verification loader.
 * 2. On genuine server/network failure, renders an error fallback with retry capability.
 * 3. If unauthenticated (401 or logged out), redirects to /sign-in preserving a safe return path.
 * 4. Role separation: Admin/Staff use /dashboard/admin, Agent uses /dashboard/agent,
 *    Customer uses the personal dashboard.
 * 5. Staff Portal entry requires dashboard.view. Overview additionally requires reports.view.
 *    Staff without reports.view are redirected to their first permitted module, or shown
 *    "No Modules Assigned" when no module is available.
 * 6. Staff admin routes are allow-listed; unknown routes default-deny. Commissions is
 *    Admin-only and Categories requires tours.view.
 *
 * Note: Client-side guards provide immediate UX protection. The backend API remains the
 * authoritative source of authorization and independently enforces permissions.
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

  const isAdminRoute = isAdminPortalPath(pathname);
  const isAgentRoute =
    pathname === "/dashboard/agent" || pathname.startsWith("/dashboard/agent/");
  const isCustomerRoute =
    pathname.startsWith("/dashboard") && !isAdminRoute && !isAgentRoute;

  const userRole = user?.role;
  const isUserAdmin = userRole === "admin";
  const isUserStaff = userRole === "staff";
  const isUserAgent = userRole === "agent";
  const hasAdminPortalAccess = isUserAdmin || isUserStaff;

  const {
    data: effectivePermsData,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
    refetch: refetchPermissions,
  } = useGetEffectivePermissionsQuery(undefined, {
    skip: !isInitialized || !isAuthenticated || !isUserStaff || !isAdminRoute,
  });

  const staffPermissions = React.useMemo(() => {
    return effectivePermsData?.data?.permissions ?? [];
  }, [effectivePermsData?.data?.permissions]);

  const canEnterStaffPortal = staffPermissions.includes(
    STAFF_PORTAL_ENTRY_PERMISSION
  );
  const canViewOverview = canViewStaffOverview(staffPermissions);
  const firstPermittedModule = getFirstPermittedModule(staffPermissions);
  const canAccessCurrentStaffRoute = canAccessStaffAdminRoute(
    pathname,
    staffPermissions
  );
  const isStaffOverviewRoute = pathname === "/dashboard/admin";
  const staffRouteRule = getStaffAdminRouteRule(pathname);
  const isCommissionsRoute =
    pathname === "/dashboard/admin/commissions" ||
    pathname.startsWith("/dashboard/admin/commissions/");
  const isUnknownStaffRoute = !staffRouteRule;

  const safeReturnHref = canViewOverview
    ? "/dashboard/admin"
    : firstPermittedModule ?? "/";
  const safeReturnLabel = canViewOverview
    ? "Return to Overview"
    : firstPermittedModule
    ? "Go to Available Module"
    : "Back to Website";

  // Strict role-based authorization:
  // - Admin & Staff: authorized ONLY on admin routes (/dashboard/admin*)
  // - Agent: authorized ONLY on agent routes (/dashboard/agent*)
  // - Customer: authorized ONLY on customer routes (/dashboard, /dashboard/bookings, etc.)
  const isAuthorized = React.useMemo(() => {
    if (hasAdminPortalAccess) return isAdminRoute;
    if (isUserAgent) return isAgentRoute;
    return isCustomerRoute;
  }, [hasAdminPortalAccess, isAdminRoute, isUserAgent, isAgentRoute, isCustomerRoute]);

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

  // Effect: Staff without reports.view must not mount Overview analytics.
  // Redirect to the first module they can actually access.
  React.useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      !isUserStaff ||
      !isAdminRoute ||
      isPermissionsLoading ||
      isPermissionsError
    ) {
      return;
    }

    if (
      canEnterStaffPortal &&
      isStaffOverviewRoute &&
      !canViewOverview &&
      firstPermittedModule
    ) {
      router.replace(firstPermittedModule);
    }
  }, [
    isInitialized,
    isAuthenticated,
    isUserStaff,
    isAdminRoute,
    isPermissionsLoading,
    isPermissionsError,
    canEnterStaffPortal,
    isStaffOverviewRoute,
    canViewOverview,
    firstPermittedModule,
    router,
  ]);

  // 1. Initializing or loading state
  if (!isInitialized || authStatus === "loading") {
    return <LoaderState label="Verifying your session..." />;
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
    return <LoaderState label="Redirecting to sign in..." />;
  }

  // 4. Role mismatch state (while redirecting)
  if (!isAuthorized) {
    const redirectLabel = hasAdminPortalAccess
      ? "Redirecting to admin portal..."
      : isUserAgent
      ? "Redirecting to agent portal..."
      : "Access restricted. Redirecting to dashboard...";

    return <LoaderState label={redirectLabel} />;
  }

  // 5. Staff authorization on the admin portal
  if (isUserStaff && isAdminRoute) {
    if (isPermissionsLoading) {
      return <LoaderState label="Verifying permissions..." />;
    }

    if (isPermissionsError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4">
          <div
            role="alert"
            data-testid="staff-permissions-error"
            className="w-full max-w-md rounded-2xl border border-destructive/20 bg-white p-6 shadow-sm text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-outfit text-lg font-bold text-[#18282A]">
              Unable to Verify Permissions
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              We could not load your Staff permissions. Please retry before
              accessing the Staff Portal.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button
                type="button"
                onClick={() => refetchPermissions()}
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

    // Staff Portal entry is mandatory and cannot be replaced by module access.
    if (!canEnterStaffPortal) {
      return (
        <div
          data-testid="staff-portal-access-denied"
          className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-outfit text-lg font-bold text-[#18282A]">
              Portal Access Denied
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              Your Staff account does not have permission to enter the Staff
              Portal (
              <span className="font-mono text-[11px] font-semibold text-amber-700">
                {STAFF_PORTAL_ENTRY_PERMISSION}
              </span>
              ). Module permissions alone do not grant portal entry. Please
              contact your administrator.
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild size="sm" className="bg-[#176779] text-white text-xs px-5 h-9">
                <Link href="/">Back to Website</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Overview analytics require both dashboard.view and reports.view.
    if (isStaffOverviewRoute && !canViewOverview) {
      if (firstPermittedModule) {
        return <LoaderState label="Redirecting to your available module..." />;
      }

      return (
        <div
          data-testid="staff-no-modules"
          className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFB] p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-outfit text-lg font-bold text-[#18282A]">
              No Modules Assigned
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              You can access the Staff Portal, but no modules or Overview
              analytics have been assigned to your account yet. Please contact
              your administrator to request module access.
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild size="sm" className="bg-[#176779] text-white text-xs px-5 h-9">
                <Link href="/">Back to Website</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Known routes require their module permission; unknown routes default-deny.
    if (!canAccessCurrentStaffRoute) {
      const denialMessage = isCommissionsRoute
        ? "Commissions Management is restricted to Administrators only. Staff accounts cannot view or adjust financial commission ledgers."
        : isUnknownStaffRoute
        ? "This Staff Portal route is not recognized or is not available to Staff accounts."
        : "Your Staff account does not have permission to access this module. Please contact your administrator to request access.";

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
              {denialMessage}
            </p>
            <div className="mt-5 flex justify-center">
              <Button asChild size="sm" className="bg-[#176779] text-white text-xs px-5 h-9">
                <Link href={safeReturnHref}>{safeReturnLabel}</Link>
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
