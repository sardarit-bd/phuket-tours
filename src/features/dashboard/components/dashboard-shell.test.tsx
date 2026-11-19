import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { DashboardShell } from "./dashboard-shell";
import { isNavItemActive, userNavConfig, adminNavConfig } from "../types/dashboard-nav";
import { makeStore, type AppStore } from "@/store";
import { setCredentials } from "@/features/auth/slices/auth-slice";

// Mock next/navigation
const mockPathname = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
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
  const renderWithStore = (
    ui: React.ReactElement,
    role: "customer" | "admin" | "agent" = "customer"
  ) => {
    const store: AppStore = makeStore();
    store.dispatch(
      setCredentials({
        id: role === "admin" ? "admin-1" : role === "agent" ? "agent-1" : "user-1",
        name:
          role === "admin"
            ? "Admin Staff"
            : role === "agent"
            ? "Partner Agent"
            : "Phuket Traveler",
        email:
          role === "admin"
            ? "admin@phukettours.com"
            : role === "agent"
            ? "agent@phukettours.com"
            : "guest@phukettours.com",
        role,
      })
    );
    return render(<Provider store={store}>{ui}</Provider>);
  };

  beforeEach(() => {
    mockPathname.mockReturnValue("/dashboard");
    mockPush.mockClear();
    mockReplace.mockClear();
    document.body.style.overflow = "";
  });

  it("renders the User Dashboard shell with desktop sidebar, topbar, and child content", () => {
    renderWithStore(
      <DashboardShell>
        <div data-testid="test-content">Dashboard Content</div>
      </DashboardShell>,
      "customer"
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

    // User dynamic profile and initials
    expect(screen.getAllByText("Phuket Traveler").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("PT").length).toBeGreaterThanOrEqual(1);
  });

  it("automatically switches to Admin navigation when pathname starts with /dashboard/admin", () => {
    mockPathname.mockReturnValue("/dashboard/admin/tours");

    renderWithStore(
      <DashboardShell>
        <div data-testid="admin-content">Admin Tours</div>
      </DashboardShell>,
      "admin"
    );

    // Admin navigation items and breadcrumb
    expect(screen.getAllByText("Tours Management").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Bookings Management")).toBeInTheDocument();
    expect(screen.getByText("Users Management")).toBeInTheDocument();
    expect(screen.queryByText("Categories")).not.toBeInTheDocument();

    // Topbar breadcrumb for admin
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();

    // Admin dynamic profile
    expect(screen.getAllByText("Admin Staff").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("AS").length).toBeGreaterThanOrEqual(1);
  });

  it("opens mobile drawer when hamburger button is clicked and closes on close button", () => {
    renderWithStore(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>,
      "customer"
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
    renderWithStore(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>,
      "customer"
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

  it("never renders 'Switch to User Portal' for admin accounts in desktop sidebar or mobile drawer", () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    renderWithStore(
      <DashboardShell>
        <div>Admin Content</div>
      </DashboardShell>,
      "admin"
    );

    // Desktop check: no switcher link
    expect(screen.queryByText(/switch to user portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/switch to admin portal/i)).not.toBeInTheDocument();

    // Open mobile drawer
    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    // Mobile check: still no switcher link
    expect(screen.queryByText(/switch to user portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/switch to admin portal/i)).not.toBeInTheDocument();
  });

  it("never renders 'Switch to Admin Portal' for customer accounts", () => {
    mockPathname.mockReturnValue("/dashboard");

    renderWithStore(
      <DashboardShell>
        <div>User Content</div>
      </DashboardShell>,
      "customer"
    );

    expect(screen.queryByText(/switch to admin portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/switch to user portal/i)).not.toBeInTheDocument();
  });

  it("renders authenticated admin name, email, and initials in both desktop and mobile navigation", () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    const store: AppStore = makeStore();
    store.dispatch(
      setCredentials({
        id: "admin-42",
        name: "Jane Administrator",
        email: "jane.admin@phukettours.com",
        role: "admin",
      })
    );

    render(
      <Provider store={store}>
        <DashboardShell>
          <div>Admin Content</div>
        </DashboardShell>
      </Provider>
    );

    // Desktop sidebar & topbar display
    expect(screen.getAllByText("Jane Administrator").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("jane.admin@phukettours.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("JA").length).toBeGreaterThanOrEqual(1);

    // Open mobile drawer
    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    // Drawer displays the same authenticated profile information
    expect(screen.getAllByText("Jane Administrator").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("jane.admin@phukettours.com").length).toBeGreaterThanOrEqual(2);
  });

  it("ensures admin sidebar does not render customer navigation items", () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    renderWithStore(
      <DashboardShell>
        <div>Admin Content</div>
      </DashboardShell>,
      "admin"
    );

    // Admin items present
    expect(screen.getByText("Tours Management")).toBeInTheDocument();
    expect(screen.getByText("Bookings Management")).toBeInTheDocument();

    // Customer items absent
    expect(screen.queryByText("My Bookings")).not.toBeInTheDocument();
    expect(screen.queryByText("My Favorites")).not.toBeInTheDocument();
  });

  it("automatically switches to Agent navigation and renders AGENT badge for agent accounts", () => {
    mockPathname.mockReturnValue("/dashboard/agent");

    renderWithStore(
      <DashboardShell>
        <div data-testid="agent-content">Agent Overview</div>
      </DashboardShell>,
      "agent"
    );

    // Agent items present
    expect(screen.getByTestId("agent-content")).toBeInTheDocument();
    expect(screen.getByText("My Commissions")).toBeInTheDocument();
    expect(screen.getByText("Agency Profile")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-role-indicator")).toHaveTextContent("Agent");
    expect(screen.getAllByText("Agent").length).toBeGreaterThanOrEqual(1);

    // Admin & Customer items absent
    expect(screen.queryByText("Tours Management")).not.toBeInTheDocument();
    expect(screen.queryByText("My Favorites")).not.toBeInTheDocument();
  });

  it("renders the account dropdown in topbar, toggles menu, and handles profile navigation and sign out", async () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    renderWithStore(
      <DashboardShell>
        <div>Admin Content</div>
      </DashboardShell>,
      "admin"
    );

    // Quick search input should not be in the document
    expect(screen.queryByPlaceholderText(/quick search/i)).not.toBeInTheDocument();

    // Dropdown trigger
    const accountTrigger = screen.getByRole("button", { name: /account menu/i });
    expect(accountTrigger).toBeInTheDocument();
    expect(accountTrigger).toHaveAttribute("aria-expanded", "false");

    // Open dropdown
    fireEvent.click(accountTrigger);
    expect(accountTrigger).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("menu", { name: /account options/i });
    expect(menu).toBeInTheDocument();

    // Verify My Profile links to Admin Settings
    const profileLink = screen.getByRole("menuitem", { name: /my profile/i });
    expect(profileLink).toHaveAttribute("href", "/dashboard/admin/settings");

    // Click My Profile closes dropdown
    fireEvent.click(profileLink);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    // Reopen and check Sign Out
    fireEvent.click(accountTrigger);
    const signOutBtn = screen.getByRole("menuitem", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
  });

  it("standardizes desktop content container padding and full-width layout with 270px sidebar offset", () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    renderWithStore(
      <DashboardShell>
        <div data-testid="child-page">Standardized Content</div>
      </DashboardShell>,
      "admin"
    );

    const container = screen.getByTestId("dashboard-content-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("w-full", "max-w-none");

    // Verify main element responsive padding: 24px (p-6) on desktop
    const main = container.closest("main");
    expect(main).toHaveClass("p-4", "sm:p-6", "lg:p-6");

    // Verify 270px sidebar offset on desktop workspace container
    const workspaceContainer = main?.parentElement;
    expect(workspaceContainer).toHaveClass("lg:pl-[270px]");
  });

  it("handles sidebar expandable parent menu click: toggles submenu on clicking row or label with proper a11y", () => {
    mockPathname.mockReturnValue("/dashboard/admin");

    renderWithStore(
      <DashboardShell>
        <div>Admin Overview</div>
      </DashboardShell>,
      "admin"
    );

    // Parent row button for Bookings Management
    const parentBtn = screen.getByTestId("sidebar-parent-btn--dashboard-admin-bookings");
    expect(parentBtn).toBeInTheDocument();
    expect(parentBtn).toHaveAttribute("aria-controls", "sidebar-submenu--dashboard-admin-bookings");

    // Initially on /dashboard/admin, Bookings Management is not active so it starts collapsed
    expect(parentBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("sidebar-submenu--dashboard-admin-bookings")).not.toBeInTheDocument();

    // 1. Click anywhere on the parent row button to expand
    fireEvent.click(parentBtn);
    expect(parentBtn).toHaveAttribute("aria-expanded", "true");
    const submenu = screen.getByTestId("sidebar-submenu--dashboard-admin-bookings");
    expect(submenu).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-subitem--dashboard-admin-bookings-staff")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-subitem--dashboard-admin-bookings-agents")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-subitem--dashboard-admin-bookings-direct")).toBeInTheDocument();

    // 2. Click the parent row again to collapse
    fireEvent.click(parentBtn);
    expect(parentBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("sidebar-submenu--dashboard-admin-bookings")).not.toBeInTheDocument();

    // 3. Click the chevron toggle specifically (which bubbles to parent button)
    const chevronToggle = screen.getByTestId("sidebar-submenu-toggle--dashboard-admin-bookings");
    fireEvent.click(chevronToggle);
    expect(parentBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("sidebar-submenu--dashboard-admin-bookings")).toBeInTheDocument();
  });

  it("automatically expands parent menu and highlights active child on direct route access", () => {
    mockPathname.mockReturnValue("/dashboard/admin/bookings/staff");

    renderWithStore(
      <DashboardShell>
        <div>Staff Bookings Content</div>
      </DashboardShell>,
      "admin"
    );

    const parentBtn = screen.getByTestId("sidebar-parent-btn--dashboard-admin-bookings");
    expect(parentBtn).toBeInTheDocument();
    // Auto-expanded because current route is a child item
    expect(parentBtn).toHaveAttribute("aria-expanded", "true");

    const submenu = screen.getByTestId("sidebar-submenu--dashboard-admin-bookings");
    expect(submenu).toBeInTheDocument();

    // Staff bookings child item is marked active
    const staffSubItem = screen.getByTestId("sidebar-subitem--dashboard-admin-bookings-staff");
    expect(staffSubItem).toBeInTheDocument();
    expect(staffSubItem).toHaveAttribute("aria-current", "page");
  });
});
