import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffiliateProgramLanding } from "./affiliate-program-landing";

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(),
}));

vi.mock("../api/affiliate-api", () => ({
  useGetMyAffiliateProfileQuery: vi.fn(),
  useApplyAsAffiliateMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

import { useAppSelector } from "@/store/hooks";
import * as affiliateApiHooks from "../api/affiliate-api";

describe("AffiliateProgramLanding registration & status flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Sign Up and Sign In CTAs preserving /affiliate redirect for unauthenticated visitors", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(false) // isAuthenticated
      .mockReturnValueOnce(null); // user
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    const signUpLink = screen.getByRole("link", { name: /Create Account & Apply/i });
    const signInLink = screen.getByRole("link", { name: /Sign In to Apply/i });
    expect(signUpLink).toHaveAttribute("href", "/sign-up?redirect=%2Faffiliate");
    expect(signInLink).toHaveAttribute("href", "/sign-in?redirect=%2Faffiliate");
  });

  it("shows application form for authenticated customer without affiliate profile", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "customer" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: null },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByText(/Apply to Become an Affiliate/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply Now/i })).toBeInTheDocument();
  });

  it("shows pending review notice for PENDING applicants", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "customer" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "PENDING", code: "AFF1234" } },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByText(/Application Pending Admin Review/i)).toBeInTheDocument();
    expect(screen.getByText("AFF1234")).toBeInTheDocument();
  });

  it("shows dashboard CTA for APPROVED affiliates", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "affiliate" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "APPROVED", code: "AFF1234", effectiveCommissionRate: 10 } },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    const dashLink = screen.getByRole("link", { name: /Go to Affiliate Dashboard/i });
    expect(dashLink).toHaveAttribute("href", "/dashboard/affiliate");
  });

  it("shows rejection reason and re-apply form for REJECTED applicants", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "customer" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "REJECTED", rejectionReason: "Incomplete website details" } },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByText(/Incomplete website details/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply Now/i })).toBeInTheDocument();
  });

  it("shows suspended notice for SUSPENDED affiliates", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "affiliate" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "SUSPENDED" } },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByText(/Affiliate Account Suspended/i)).toBeInTheDocument();
  });
});
