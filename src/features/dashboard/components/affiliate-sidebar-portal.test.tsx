import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSidebar } from "./dashboard-sidebar";
import {
  affiliateNavConfig,
  agentNavConfig,
  userNavConfig,
} from "../types/dashboard-nav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard/affiliate"),
}));

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(() => ({
    id: "u-1",
    name: "Approved Customer",
    email: "customer@example.com",
    role: "customer",
  })),
}));

vi.mock("@/features/admin/hooks/use-permissions", () => ({
  usePermissions: vi.fn(() => ({
    isAdmin: false,
    hasPermission: () => false,
    permissions: [],
  })),
}));

vi.mock("@/features/affiliate/components/customer-affiliate-promo-card", () => ({
  CustomerAffiliatePromoCard: () => <div data-testid="mock-promo-card" />,
}));

describe("DashboardSidebar portal role badge & Affiliate ↔ Customer navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays 'Affiliate' role badge and 'Customer Dashboard' (/dashboard) link in Affiliate Portal", () => {
    render(<DashboardSidebar config={affiliateNavConfig} />);
    expect(screen.getByTestId("sidebar-role-indicator")).toHaveTextContent(/^Affiliate$/i);
    const customerDashLink = screen.getByRole("link", { name: /Customer Dashboard/i });
    expect(customerDashLink).toHaveAttribute("href", "/dashboard");
  });

  it("displays 'Customer' role badge in Customer Portal", () => {
    render(<DashboardSidebar config={userNavConfig} />);
    expect(screen.getByTestId("sidebar-role-indicator")).toHaveTextContent(/^Customer$/i);
  });

  it("displays 'Agent' role badge in Agent Portal", () => {
    render(<DashboardSidebar config={agentNavConfig} />);
    expect(screen.getByTestId("sidebar-role-indicator")).toHaveTextContent(/^Agent$/i);
  });
});
