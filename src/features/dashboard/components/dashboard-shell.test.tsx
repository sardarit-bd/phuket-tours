import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";
import { isNavItemActive, userNavConfig, adminNavConfig } from "../types/dashboard-nav";

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("Dashboard Navigation Active Logic", () => {
  it("only marks root /dashboard active on exact match, not on subpaths", () => {
    const userOverviewItem = userNavConfig.items[0]; // /dashboard (exact: true)
    const bookingsItem = userNavConfig.items[1]; // /dashboard/bookings

    // On /dashboard
    expect(isNavItemActive("/dashboard", userOverviewItem)).toBe(true);
    expect(isNavItemActive("/dashboard", bookingsItem)).toBe(false);

    // On /dashboard/bookings
    expect(isNavItemActive("/dashboard/bookings", userOverviewItem)).toBe(false);
    expect(isNavItemActive("/dashboard/bookings", bookingsItem)).toBe(true);

    // On /dashboard/admin
    expect(isNavItemActive("/dashboard/admin", userOverviewItem)).toBe(false);
  });

  it("only marks root /dashboard/admin active on exact match, not on admin subpaths", () => {
    const adminOverviewItem = adminNavConfig.items[0]; // /dashboard/admin (exact: true)
    const toursItem = adminNavConfig.items[1]; // /dashboard/admin/tours

    // On /dashboard/admin
    expect(isNavItemActive("/dashboard/admin", adminOverviewItem)).toBe(true);
    expect(isNavItemActive("/dashboard/admin", toursItem)).toBe(false);

    // On /dashboard/admin/tours
    expect(isNavItemActive("/dashboard/admin/tours", adminOverviewItem)).toBe(false);
    expect(isNavItemActive("/dashboard/admin/tours", toursItem)).toBe(true);
  });
});

describe("DashboardShell Component", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/dashboard");
    document.body.style.overflow = "";
  });

  it("renders the User Dashboard shell with desktop sidebar, topbar, and child content", () => {
    render(
      <DashboardShell>
        <div data-testid="test-content">Dashboard Content</div>
      </DashboardShell>
    );

    // Main content
    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    // User navigation items in desktop sidebar
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
    expect(screen.getByText("My Favorites")).toBeInTheDocument();
    expect(screen.getByText("Profile Settings")).toBeInTheDocument();

    // Topbar breadcrumb and nav
    expect(screen.getByText("User Portal")).toBeInTheDocument();
    expect(screen.getAllByText("Overview").length).toBeGreaterThanOrEqual(1);

    // Brand and Back to Website links
    expect(screen.getByText("Back to Website")).toBeInTheDocument();
  });

  it("automatically switches to Admin navigation when pathname starts with /dashboard/admin", () => {
    mockPathname.mockReturnValue("/dashboard/admin/tours");

    render(
      <DashboardShell>
        <div data-testid="admin-content">Admin Tours</div>
      </DashboardShell>
    );

    // Admin navigation items and breadcrumb
    expect(screen.getAllByText("Tours Management").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Bookings Management")).toBeInTheDocument();
    expect(screen.getByText("Users Management")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();

    // Topbar breadcrumb for admin
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();
  });

  it("opens mobile drawer when hamburger button is clicked and closes on close button", () => {
    render(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Mobile drawer should not be open initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click hamburger button
    const menuButton = screen.getByRole("button", { name: /open navigation menu/i });
    fireEvent.click(menuButton);

    // Mobile drawer is now in document
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    // Click close button inside drawer
    const closeButton = screen.getByRole("button", { name: /close navigation menu/i });
    fireEvent.click(closeButton);

    // Drawer is closed and scroll is restored
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes mobile drawer on Escape key press", () => {
    render(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Open drawer
    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Drawer is closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});
