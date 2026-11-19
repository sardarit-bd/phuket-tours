import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AffiliateProgramLanding,
  getDashboardHomeForRole,
} from "./affiliate-program-landing";

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(),
}));

const mockApplyUnwrap = vi.fn();
const mockApplyMutation = vi.fn(() => ({ unwrap: mockApplyUnwrap }));

vi.mock("../api/affiliate-api", () => ({
  useGetMyAffiliateProfileQuery: vi.fn(),
  useApplyAsAffiliateMutation: vi.fn(() => [mockApplyMutation, { isLoading: false }]),
}));

import { useAppSelector } from "@/store/hooks";
import * as affiliateApiHooks from "../api/affiliate-api";

describe("AffiliateProgramLanding registration, navigation & status flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(affiliateApiHooks.useApplyAsAffiliateMutation).mockReturnValue([
      mockApplyMutation,
      { isLoading: false },
    ] as any);
  });

  it("maps role-aware Back to Dashboard destinations accurately", () => {
    expect(getDashboardHomeForRole("customer")).toBe("/dashboard");
    expect(getDashboardHomeForRole("affiliate")).toBe("/dashboard/affiliate");
    expect(getDashboardHomeForRole("agent")).toBe("/dashboard/agent");
    expect(getDashboardHomeForRole("staff")).toBe("/dashboard/staff");
    expect(getDashboardHomeForRole("admin")).toBe("/dashboard/admin");
  });

  it("shows Back to Home and Sign Up/Sign In CTAs preserving /affiliate redirect for unauthenticated visitors", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(null);
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByRole("link", { name: /Back to Home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Create Account & Apply/i })).toHaveAttribute(
      "href",
      "/sign-up?redirect=%2Faffiliate"
    );
    expect(screen.getByRole("link", { name: /Sign In to Apply/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect=%2Faffiliate"
    );
  });

  it("shows Back to Dashboard and validates required promotionChannels before submitting", () => {
    let call = 0;
    vi.mocked(useAppSelector).mockImplementation(() =>
      call++ % 2 === 0 ? true : { id: "u1", name: "Alice", role: "customer" }
    );
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: null },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByRole("link", { name: /Back to Dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );

    const submitBtn = screen.getByRole("button", { name: /Submit Affiliate Application/i });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Please describe your promotion channels \(at least 10 characters\)/i)
    ).toBeInTheDocument();
    expect(mockApplyMutation).not.toHaveBeenCalled();
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

  it("shows Open Affiliate Dashboard CTA and affiliate Back to Dashboard link for APPROVED affiliates", () => {
    vi.mocked(useAppSelector)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({ id: "u1", name: "Alice", role: "affiliate" });
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: { status: "APPROVED", code: "AFF1234", effectiveCommissionRate: 10 } },
      isLoading: false,
    } as any);

    render(<AffiliateProgramLanding />);
    expect(screen.getByRole("link", { name: /Back to Dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard/affiliate"
    );
    expect(screen.getByRole("link", { name: /Open Affiliate Dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard/affiliate"
    );
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
    expect(screen.getByRole("button", { name: /Submit Affiliate Application/i })).toBeInTheDocument();
  });

  it("hides application form and shows eligibility notice for Agent, Staff, and Admin users", () => {
    for (const role of ["agent", "staff", "admin"] as const) {
      let call = 0;
      vi.mocked(useAppSelector).mockImplementation(() =>
        call++ % 2 === 0 ? true : { id: "u1", name: "User", role }
      );
      vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      const { unmount } = render(<AffiliateProgramLanding />);
      expect(screen.getByText(/Affiliate Program Eligibility/i)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Submit Affiliate Application/i })
      ).not.toBeInTheDocument();
      unmount();
    }
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
