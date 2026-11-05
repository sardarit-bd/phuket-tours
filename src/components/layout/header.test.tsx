import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { Header } from "./header";
import { makeStore, type AppStore } from "@/store";
import { setCredentials, selectIsAuthenticated } from "@/features/auth/slices/auth-slice";

// Mock next/navigation router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
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

  it("renders the Book Now CTA button linking to /tours", () => {
    renderWithStore(<Header />);
    const bookNowLink = screen.getByRole("link", { name: /book now/i });
    expect(bookNowLink).toBeInTheDocument();
    expect(bookNowLink).toHaveAttribute("href", "/tours");
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
    expect(
      screen.queryByRole("menuitem", { name: /all tours & excursions/i })
    ).not.toBeInTheDocument();
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

  describe("Authentication Controls & State in Header", () => {
    it("renders Sign In and Sign Up controls when unauthenticated", () => {
      renderWithStore(<Header />);

      expect(
        screen.getByRole("link", { name: /sign in/i })
      ).toHaveAttribute("href", "/sign-in");
      expect(
        screen.getByRole("link", { name: /sign up/i })
      ).toHaveAttribute("href", "/sign-up");
      expect(
        screen.queryByRole("link", { name: /access dashboard/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /sign out/i })
      ).not.toBeInTheDocument();
    });

    it("renders user initials, name, dashboard link, and Sign Out button when authenticated as customer", () => {
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

      // Desktop Dashboard link with user name and initials
      const dashboardLink = screen.getByRole("link", {
        name: /access dashboard/i,
      });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
      expect(dashboardLink).toHaveTextContent("Somchai Saetang");
      expect(dashboardLink).toHaveTextContent("SS");

      // Sign Out action is available
      expect(
        screen.getByRole("button", { name: /sign out/i })
      ).toBeInTheDocument();

      // Sign In / Sign Up are hidden on desktop
      expect(
        screen.queryByRole("link", { name: /^sign in$/i })
      ).not.toBeInTheDocument();
    });

    it("renders admin dashboard link pointing to /dashboard/admin when authenticated as admin", () => {
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

      const dashboardLink = screen.getByRole("link", {
        name: /access dashboard/i,
      });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
      expect(dashboardLink).toHaveTextContent("Elena Rostova");
      expect(dashboardLink).toHaveTextContent("ER");
    });

    it("executes logout action: clears Redux state and redirects to /sign-in", async () => {
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

      const signOutButton = screen.getByRole("button", { name: /sign out/i });
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

      const signOutButton = screen.getByRole("button", { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(selectIsAuthenticated(activeStore.getState())).toBe(false);
        expect(mockPush).toHaveBeenCalledWith("/sign-in");
      });
    });
  });
});
