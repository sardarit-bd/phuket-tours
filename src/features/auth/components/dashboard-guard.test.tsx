import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { DashboardGuard } from "./dashboard-guard";
import { makeStore, type AppStore } from "@/store";
import {
  setCredentials,
  setAuthStatus,
  setInitialized,
} from "../slices/auth-slice";

// Mock next/navigation
const mockPathname = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("DashboardGuard Component", () => {
  let store: AppStore;

  const renderGuard = (children = <div data-testid="protected-content">Protected Content</div>) => {
    return render(
      <Provider store={store}>
        <DashboardGuard>{children}</DashboardGuard>
      </Provider>
    );
  };

  beforeEach(() => {
    store = makeStore();
    mockPathname.mockReturnValue("/dashboard");
    mockReplace.mockClear();
    vi.restoreAllMocks();
  });

  describe("Loading & Initialization States", () => {
    it("renders verifying session loader when authentication is not initialized", () => {
      // isInitialized is false by default
      renderGuard();

      expect(
        screen.getByRole("status", { name: /verifying your session/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/verifying your session\.\.\./i)).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("renders verifying session loader when authStatus is loading even if initialized", () => {
      store.dispatch(setInitialized(true));
      store.dispatch(setAuthStatus("loading"));

      renderGuard();

      expect(
        screen.getByRole("status", { name: /verifying your session/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("Network & Server Failure Fallback", () => {
    it("renders error fallback with retry button when session verification fails with network/server error", () => {
      store.dispatch(setInitialized(true));
      store.dispatch(setAuthStatus("failed"));

      renderGuard();

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Session Verification Failed")).toBeInTheDocument();
      expect(
        screen.getByText(/encountered an unexpected network or server issue/i)
      ).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      const signInLink = screen.getByRole("link", { name: /go to sign in/i });
      expect(signInLink).toHaveAttribute("href", "/sign-in");

      // Children are not displayed and no automatic redirect occurs
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("triggers retry dispatch when retry button is clicked", () => {
      store.dispatch(setInitialized(true));
      store.dispatch(setAuthStatus("failed"));

      const dispatchSpy = vi.spyOn(store, "dispatch");

      renderGuard();

      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe("Unauthenticated Access & Return Path Redirection", () => {
    it("redirects unauthenticated user to /sign-in with return path parameter", async () => {
      mockPathname.mockReturnValue("/dashboard/bookings");
      store.dispatch(setInitialized(true));
      store.dispatch(setAuthStatus("idle")); // 401 unauthenticated sets status to idle

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/sign-in?redirect=%2Fdashboard%2Fbookings"
        );
      });

      expect(
        screen.getByRole("status", { name: /redirecting to sign in/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("Role-based Authorization & Strict Portal Separation", () => {
    it("allows authenticated customer access to standard user dashboard", () => {
      mockPathname.mockReturnValue("/dashboard");
      store.dispatch(
        setCredentials({
          id: "cust-1",
          name: "Somchai Customer",
          email: "somchai@example.com",
          role: "customer",
        })
      );

      renderGuard();

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("allows authenticated customer access to customer nested routes (/dashboard/bookings)", () => {
      mockPathname.mockReturnValue("/dashboard/bookings");
      store.dispatch(
        setCredentials({
          id: "cust-1",
          name: "Somchai Customer",
          email: "somchai@example.com",
          role: "customer",
        })
      );

      renderGuard();

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("prevents authenticated customer from accessing admin route and redirects to /dashboard", async () => {
      mockPathname.mockReturnValue("/dashboard/admin/users");
      store.dispatch(
        setCredentials({
          id: "cust-1",
          name: "Somchai Customer",
          email: "somchai@example.com",
          role: "customer",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: /restricted access/i })
      ).toBeInTheDocument();
    });

    it("allows authenticated admin to access /dashboard/admin root", () => {
      mockPathname.mockReturnValue("/dashboard/admin");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("allows authenticated admin to access nested admin routes (/dashboard/admin/users)", () => {
      mockPathname.mockReturnValue("/dashboard/admin/users");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("redirects authenticated admin visiting /dashboard to /dashboard/admin", async () => {
      mockPathname.mockReturnValue("/dashboard");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard/admin");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: /redirecting to admin portal/i })
      ).toBeInTheDocument();
    });

    it("redirects authenticated admin visiting /dashboard/bookings to /dashboard/admin", async () => {
      mockPathname.mockReturnValue("/dashboard/bookings");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard/admin");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("redirects authenticated admin visiting /dashboard/favorites to /dashboard/admin", async () => {
      mockPathname.mockReturnValue("/dashboard/favorites");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard/admin");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("redirects authenticated admin visiting /dashboard/settings to /dashboard/admin", async () => {
      mockPathname.mockReturnValue("/dashboard/settings");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard/admin");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("allows authenticated admin access to /dashboard/admin/tours", () => {
      mockPathname.mockReturnValue("/dashboard/admin/tours");
      store.dispatch(
        setCredentials({
          id: "admin-1",
          name: "Admin User",
          email: "admin@phukettours.com",
          role: "admin",
        })
      );

      renderGuard();

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("redirects non-admin customer attempting to access /dashboard/admin/tours to /dashboard", async () => {
      mockPathname.mockReturnValue("/dashboard/admin/tours");
      store.dispatch(
        setCredentials({
          id: "cust-1",
          name: "Regular Customer",
          email: "customer@example.com",
          role: "customer",
        })
      );

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("redirects unauthenticated visitor attempting to access /dashboard/admin/tours to login", async () => {
      mockPathname.mockReturnValue("/dashboard/admin/tours");
      store.dispatch(setInitialized(true));
      store.dispatch(setAuthStatus("idle"));

      renderGuard();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/sign-in?redirect=%2Fdashboard%2Fadmin%2Ftours"
        );
      });

      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });
});
