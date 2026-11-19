import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerAffiliatePromoCard } from "./customer-affiliate-promo-card";

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(),
}));

vi.mock("../api/affiliate-api", () => ({
  useGetMyAffiliateProfileQuery: vi.fn(),
}));

import { useAppSelector } from "@/store/hooks";
import * as affiliateApiHooks from "../api/affiliate-api";

describe("CustomerAffiliatePromoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppSelector).mockReturnValue(true);
  });

  it("shows 'Join Affiliate Program' -> /affiliate with redesigned headline when user has no application", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: null },
      isError: false,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    expect(screen.getByText("Turn Your Network Into Rewards!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Share Phuket adventures with your audience and earn commission on successful bookings."
      )
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Join Affiliate Program/i });
    expect(link).toHaveAttribute("href", "/affiliate");
  });

  it("shows 'Application Pending' -> /affiliate when status is PENDING", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "PENDING" } },
      isError: false,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    const link = screen.getByRole("link", { name: /Application Pending/i });
    expect(link).toHaveAttribute("href", "/affiliate");
  });

  it("shows 'Open Affiliate Dashboard' -> /dashboard/affiliate when status is APPROVED", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "APPROVED" } },
      isError: false,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    const link = screen.getByRole("link", { name: /Open Affiliate Dashboard/i });
    expect(link).toHaveAttribute("href", "/dashboard/affiliate");
  });

  it("shows 'Reapply Now' -> /affiliate when status is REJECTED", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "REJECTED" } },
      isError: false,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    const link = screen.getByRole("link", { name: /Reapply Now/i });
    expect(link).toHaveAttribute("href", "/affiliate");
  });

  it("shows non-clickable 'Account Suspended' message without dashboard link when SUSPENDED", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "SUSPENDED" } },
      isError: false,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    expect(screen.getByTestId("affiliate-promo-suspended")).toHaveTextContent("Account Suspended");
    expect(screen.queryByRole("link", { name: /Open Affiliate Dashboard/i })).not.toBeInTheDocument();
  });

  it("falls back gracefully to 'Join Affiliate Program' when API errors", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: undefined,
      isError: true,
    } as any);

    render(<CustomerAffiliatePromoCard />);
    const link = screen.getByRole("link", { name: /Join Affiliate Program/i });
    expect(link).toHaveAttribute("href", "/affiliate");
  });
});
