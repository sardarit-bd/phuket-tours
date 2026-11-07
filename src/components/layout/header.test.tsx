import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { Header } from "./header";
import { makeStore, type AppStore } from "@/store";
import { setCredentials, selectIsAuthenticated } from "@/features/auth/slices/auth-slice";

// Mock next/navigation router and pathname
const mockPush = vi.fn();
let currentMockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => currentMockPathname,
}));

describe("Header / Navbar component", () => {
  let store: AppStore;

  const renderWithStore = (
    ui: React.ReactElement,
    initialStateCallback?: (store: AppStore) => void
  ) => {
    store = makeStore();
    if (initialStateCallback) {
      initialStateCallback(store);
    }
    return {
      ...render(<Provider store={store}>{ui}</Provider>),
      store,
    };
  };

  beforeEach(() => {
    mockPush.mockClear();
    currentMockPathname = "/";
    vi.restoreAllMocks();
  });

  it("renders the official PhuketTours logo with correct attributes", () => {
    renderWithStore(<Header />);
    const logoImg = screen.getByRole("img", { name: /phukettours/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", expect.stringContaining("Logo.png"));
  });

  it("renders the main navigation links", () => {
    renderWithStore(<Header />);
    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^tours$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^about$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^contact$/i })).toBeInTheDocument();
  });

  it("renders Tours as a normal link pointing to /tours without dropdown toggles", async () => {
    const user = userEvent.setup();
    renderWithStore(<Header />);

    const toursLink = screen.getByRole("link", { name: /^tours$/i });
    expect(toursLink).toBeInTheDocument();
    expect(toursLink).toHaveAttribute("href", "/tours");

    // Verify there is no dropdown toggle button
    expect(
      screen.queryByRole("button", { name: /toggle tours dropdown menu/i })
    ).not.toBeInTheDocument();

    // Hovering over Tours does not display a dropdown menu or category links
    await user.hover(toursLink);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders and toggles mobile menu", async () => {
    const user = userEvent.setup();
    renderWithStore(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

    await user.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");
  });

  describe("Conditional Book Now Visibility", () => {
    it("renders Book Now on home route '/'", () => {
      currentMockPathname = "/";
      renderWithStore(<Header />);
      const bookNowLinks = screen.getAllByRole("link", { name: /book now/i });
      expect(bookNowLinks.length).toBeGreaterThan(0);
      expect(bookNowLinks[0]).toHaveAttribute("href", "/tours");
    });

    it("hides Book Now button when on the exact tours listing route '/tours'", () => {
      currentMockPathname = "/tours";
      renderWithStore(<Header />);
      expect(
        screen.queryByRole("link", { name: /book now/i })
      ).not.toBeInTheDocument();
    });

    it("renders Book Now on tour details route '/tours/phuket-speedboat-123'", () => {
      currentMockPathname = "/tours/phuket-speedboat-123";
      renderWithStore(<Header />);
      const bookNowLinks = screen.getAllByRole("link", { name: /book now/i });
      expect(bookNowLinks.length).toBeGreaterThan(0);
      expect(bookNowLinks[0]).toHaveAttribute("href", "/tours");
    });

    it("renders Book Now on '/about' and '/contact'", () => {
      currentMockPathname = "/about";
      const { unmount } = renderWithStore(<Header />);
      expect(
        screen.getAllByRole("link", { name: /book now/i }).length
      ).toBeGreaterThan(0);
      unmount();

      currentMockPathname = "/contact";
      renderWithStore(<Header />);
      expect(
        screen.getAllByRole("link", { name: /book now/i }).length
      ).toBeGreaterThan(0);
    });
  });

  describe("Authentication Controls & State in Header", () => {
    it("renders only Sign In control when unauthenticated, and Sign Up is absent", () => {
      renderWithStore(<Header />);

      expect(
        screen.getByRole("link", { name: /^sign in$/i })
      ).toHaveAttribute("href", "/sign-in");
      expect(
        screen.queryByRole("link", { name: /sign up/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /create an account/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^account$/i })
      ).not.toBeInTheDocument();
    });

    it("renders Account dropdown trigger with user initials when authenticated as customer", async () => {
      const user = userEvent.setup();
      renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "cust-1",
            name: "Somchai Saetang",
            email: "somchai@example.com",
            role: "customer",
          })
        );
      });

      // Desktop Account dropdown trigger
      const accountTrigger = screen.getByRole("button", {
        name: /^account$/i,
      });
      expect(accountTrigger).toBeInTheDocument();
      expect(accountTrigger).toHaveAttribute("aria-expanded", "false");
      expect(accountTrigger).toHaveTextContent("SS");

      // Sign In is hidden
      expect(
        screen.queryByRole("link", { name: /^sign in$/i })
      ).not.toBeInTheDocument();

      // Open dropdown
      await user.click(accountTrigger);
      expect(accountTrigger).toHaveAttribute("aria-expanded", "true");

      const menu = screen.getByRole("menu", { name: /account options/i });
      expect(menu).toBeInTheDocument();

      // Dashboard link -> /dashboard
      const dashboardLink = screen.getByRole("menuitem", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");

      // My Profile link -> /dashboard/settings
      const profileLink = screen.getByRole("menuitem", { name: /my profile/i });
      expect(profileLink).toHaveAttribute("href", "/dashboard/settings");

      // Sign Out action is available inside menu
      expect(
        screen.getByRole("menuitem", { name: /sign out/i })
      ).toBeInTheDocument();
    });

    it("renders correct dropdown links for Admin role", async () => {
      const user = userEvent.setup();
      renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "admin-1",
            name: "Elena Rostova",
            email: "admin@phukettours.com",
            role: "admin",
          })
        );
      });

      const accountTrigger = screen.getByRole("button", { name: /^account$/i });
      await user.click(accountTrigger);

      expect(
        screen.getByRole("menuitem", { name: /dashboard/i })
      ).toHaveAttribute("href", "/dashboard/admin");

      expect(
        screen.getByRole("menuitem", { name: /my profile/i })
      ).toHaveAttribute("href", "/dashboard/admin/settings");
    });

    it("renders correct dropdown links for Staff role", async () => {
      const user = userEvent.setup();
      renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "staff-1",
            name: "David Staff",
            email: "staff@phukettours.com",
            role: "staff",
          })
        );
      });

      const accountTrigger = screen.getByRole("button", { name: /^account$/i });
      await user.click(accountTrigger);

      expect(
        screen.getByRole("menuitem", { name: /dashboard/i })
      ).toHaveAttribute("href", "/dashboard/staff");

      expect(
        screen.getByRole("menuitem", { name: /my profile/i })
      ).toHaveAttribute("href", "/dashboard/staff/settings");
    });

    it("renders correct dropdown links for Agent role", async () => {
      const user = userEvent.setup();
      renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "agent-1",
            name: "Alex Agent",
            email: "agent@phukettours.com",
            role: "agent",
          })
        );
      });

      const accountTrigger = screen.getByRole("button", { name: /^account$/i });
      await user.click(accountTrigger);

      expect(
        screen.getByRole("menuitem", { name: /dashboard/i })
      ).toHaveAttribute("href", "/dashboard/agent");

      expect(
        screen.getByRole("menuitem", { name: /my profile/i })
      ).toHaveAttribute("href", "/dashboard/agent/profile");
    });

    it("renders correct role navigation items in mobile drawer", async () => {
      const user = userEvent.setup();
      renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "agent-1",
            name: "Alex Agent",
            email: "agent@phukettours.com",
            role: "agent",
          })
        );
      });

      const mobileMenuButton = screen.getByRole("button", {
        name: /toggle navigation menu/i,
      });
      await user.click(mobileMenuButton);

      // Verify mobile drawer Dashboard & My Profile links
      const mobileDashboard = screen.getByRole("link", { name: /dashboard/i });
      expect(mobileDashboard).toHaveAttribute("href", "/dashboard/agent");

      const mobileProfile = screen.getByRole("link", { name: /my profile/i });
      expect(mobileProfile).toHaveAttribute("href", "/dashboard/agent/profile");

      // Verify Sign In is absent in mobile drawer when logged in
      expect(screen.queryByRole("link", { name: /^sign in$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /create an account/i })).not.toBeInTheDocument();
    });

    it("executes logout action from account dropdown: clears Redux state and redirects to /sign-in", async () => {
      const user = userEvent.setup();
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          message: "Logged out successfully",
          data: null,
        }),
        clone() {
          return this;
        },
      } as unknown as Response);

      const { store: activeStore } = renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "cust-1",
            name: "John Traveler",
            email: "john@example.com",
            role: "customer",
          })
        );
      });

      expect(selectIsAuthenticated(activeStore.getState())).toBe(true);

      const accountTrigger = screen.getByRole("button", { name: /^account$/i });
      await user.click(accountTrigger);

      const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(selectIsAuthenticated(activeStore.getState())).toBe(false);
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });

    it("resiliently clears Redux state and redirects even if logout network request fails", async () => {
      const user = userEvent.setup();
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failed"));

      const { store: activeStore } = renderWithStore(<Header />, (s) => {
        s.dispatch(
          setCredentials({
            id: "cust-1",
            name: "John Traveler",
            email: "john@example.com",
            role: "customer",
          })
        );
      });

      const accountTrigger = screen.getByRole("button", { name: /^account$/i });
      await user.click(accountTrigger);

      const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(selectIsAuthenticated(activeStore.getState())).toBe(false);
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });
  });
});
