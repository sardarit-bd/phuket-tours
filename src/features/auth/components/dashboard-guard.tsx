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
  canAccessStaffAdminRoute,
  canViewStaffOverview,
  getFirstPermittedModule,
  getStaffAdminRouteRule,
  isAdminPortalPath,
  isStaffPortalPath,
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
 * DashboardGuard provides client-side route protection for the /dashboard/*
 * trees (customer, admin, staff and agent portals).
 *
 * Role separation:
 * - Admin: authorized on /dashboard/admin* only (Staff never access /dashboard/admin).
 * - Staff: authorized on /dashboard/staff* only (Staff never access /dashboard/admin).
 * - Agent: authorized on /dashboard/agent*.
 * - Customer: authorized on the customer dashboard (/dashboard, /dashboard/bookings, etc.).
 *
 * Staff portal entry requires at least one valid module view permission
 * (tours.view, media.view, bookings.view, payments.view, users.view,
 * settings.view or reports.view). `dashboard.view` is no longer a mandatory
 * entry permission; the admin assigns module permissions directly.
 *
 * The Staff Overview route (/dashboard/staff) requires `reports.view`.
 * When Staff has `reports.view`, Overview is the landing page. Otherwise the
 * Staff member is redirected to their first permitted module, or shown
 * "No Modules Assigned" when no module is available.
 *
 * Note: client-side guards provide immediate UX protection. The backend API
 * remains the authoritative source of authorization and independently enforces
 * permissions.
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
  const isStaffRoute = isStaffPortalPath(pathname);
  const isAgentRoute =
    pathname === "/dashboard/agent" || pathname.startsWith("/dashboard/agent/");
  const isCustomerRoute =
    pathname.startsWith("/dashboard") &&
    !isAdminRoute &&
    !isStaffRoute &&
    !isAgentRoute;

  const userRole = user?.role;
  const isUserAdmin = userRole === "admin";
  const isUserStaff = userRole === "staff";
  const isUserAgent = userRole === "agent";
  // Admin may access the admin portal only. Staff may access the staff portal
  // only. They never cross into each other's portal.
  const adminAuthorizedPath = isUserAdmin && isAdminRoute;
  const staffAuthorizedPath = isUserStaff && isStaffRoute;
  const hasPortalAccess = adminAuthorizedPath || staffAuthorizedPath;

  // Fetch Staff effective permissions only when a Staff user is inside the
  // Staff portal. Admin users bypass the permission list entirely.
  const {
    data: effectivePermsData,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
    refetch: refetchPermissions,
  } = useGetEffectivePermissionsQuery(undefined, {
    skip:
      !isInitialized ||
      !isAuthenticated ||
      !isUserStaff ||
      !isStaffRoute,
  });

  const staffPermissions = React.useMemo(() => {
    return effectivePermsData?.data?.permissions ?? [];
  }, [effectivePermsData?.data?.permissions]);

  // Staff portal entry: at least one valid module view permission.
  const hasAnyModuleView = React.useMemo(() => {
    const moduleViewPerms = [
      "tours.view",
      "media.view",
      "bookings.view",
      "payments.view",
      "users.view",
      "reports.view",
      "settings.view",
      "settings.general.manage",
      "settings.payment.manage",
      "settings.webhook.manage",
      "settings.cloudinary.manage",
      "settings.smtp.manage",
    ] as const;
    return moduleViewPerms.some((p) => staffPermissions.includes(p));
  }, [staffPermissions]);

  const canViewOverview = canViewStaffOverview(staffPermissions);
  const firstPermittedModule = getFirstPermittedModule(staffPermissions);
  const canAccessCurrentStaffRoute = canAccessStaffAdminRoute(
    pathname,
    staffPermissions
  );
  const isStaffOverviewRoute = pathname === "/dashboard/staff";
  const staffRouteRule = getStaffAdminRouteRule(pathname);
  const isCommissionsRoute =
    pathname === "/dashboard/staff/commissions" ||
    pathname.startsWith("/dashboard/staff/commissions/");
  const isUnknownStaffRoute = !staffRouteRule;

  const safeReturnHref = canViewOverview
    ? "/dashboard/staff"
    : firstPermittedModule ?? "/";
  const safeReturnLabel = canViewOverview
    ? "Return to Overview"
    : firstPermittedModule
    ? "Go to Available Module"
    : "Back to Website";

  // Strict role-based authorization. Each role is authorized only on its own
  // portal prefix (or customer routes for the customer role).
  const isAuthorized = React.useMemo(() => {
    if (isUserAdmin) return isAdminRoute;
    if (isUserStaff) return isStaffRoute;
    if (isUserAgent) return isAgentRoute;
    return isCustomerRoute;
  }, [isUserAdmin, isUserStaff, isUserAgent, isAdminRoute, isStaffRoute, isAgentRoute, isCustomerRoute]);

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
  // 1. Admin visiting a non-admin route -> redirect to /dashboard/admin
  // 2. Staff visiting a non-staff route -> redirect to /dashboard/staff
  // 3. Agent visiting a non-agent route -> redirect to /dashboard/agent
  // 4. Customer visiting a non-customer route -> redirect to /dashboard
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && !isAuthorized) {
      if (isUserAdmin) {
        router.replace("/dashboard/admin");
      } else if (isUserStaff) {
        // If Staff has no permitted module yet, still land them on the staff
        // portal root and let the portal-level checks render "No Modules
        // Assigned".
        router.replace("/dashboard/staff");
      } else if (isUserAgent) {
        router.replace("/dashboard/agent");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, isAuthorized, isUserAdmin, isUserStaff, isUserAgent, router]);

  // Effect: When a Staff user lands on the Overview route without reports.view,
  // redirect to their first permitted module (or let the render check show
  // "No Modules Assigned" when none exists).
  React.useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      !isUserStaff ||
      !isStaffRoute ||
      isPermissionsLoading ||
      isPermissionsError
    ) {
      return;
    }

    if (
      isStaffOverviewRoute &&
      !canViewOverview &&
      hasAnyModuleView &&
      firstPermittedModule
    ) {
      router.replace(firstPermittedModule);
    }
  }, [
    isInitialized,
    isAuthenticated,
    isUserStaff,
    isStaffRoute,
    isPermissionsLoading,
    isPermissionsError,
    isStaffOverviewRoute,
    canViewOverview,
    hasAnyModuleView,
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
    const redirectLabel = isUserAdmin
      ? "Redirecting to admin portal..."
      : isUserStaff
      ? "Redirecting to staff portal..."
      : isUserAgent
      ? "Redirecting to agent portal..."
      : "Access restricted. Redirecting to dashboard...";

    return <LoaderState label={redirectLabel} />;
  }

  // 5. Staff authorization on the Staff portal
  if (isUserStaff && isStaffRoute) {
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

    // Staff portal entry: at least one valid module view permission.
    // dashboard.view is no longer mandatory.
    if (!hasAnyModuleView) {
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
              No Modules Assigned
            </h2>
            <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
              You have not been assigned any modules in the Staff Portal yet.
              Please contact your administrator to request module access.
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

    // Overview analytics require reports.view. When the Staff member is on the
    // Overview route but lacks reports.view, redirect to their first permitted
    // module. If no module is available, the "No Modules Assigned" state above
    // would already have rendered (because hasAnyModuleView would be false).
    if (isStaffOverviewRoute && !canViewOverview) {
      if (firstPermittedModule) {
        return <LoaderState label="Redirecting to your available module..." />;
      }
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
