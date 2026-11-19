import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffiliateOverviewView } from "./affiliate-overview-view";
import { AffiliateLinksView } from "./affiliate-links-view";
import { AffiliatePayoutsView } from "./affiliate-payouts-view";
import { AdminAffiliateOverviewView } from "@/features/admin/components/affiliates/admin-affiliate-views";

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetToursQuery: vi.fn(() => ({
    data: { data: [], total: 0, page: 1, limit: 50, totalPages: 1 },
    isLoading: false,
    isError: false,
  })),
}));

vi.mock("../api/affiliate-api", () => ({
  useGetMyAffiliateProfileQuery: vi.fn(),
  useGetMyAffiliateDashboardQuery: vi.fn(),
  useApplyAsAffiliateMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetMyAffiliateLinksQuery: vi.fn(),
  useCreateMyAffiliateLinkMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateMyAffiliateLinkMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteMyAffiliateLinkMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetMyAffiliatePayoutsQuery: vi.fn(),
  useRequestAffiliatePayoutMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetAdminAffiliateOverviewQuery: vi.fn(),
  useGetAdminAffiliatesQuery: vi.fn(),
  useApproveAdminAffiliateMutation: vi.fn(() => [vi.fn()]),
  useRejectAdminAffiliateMutation: vi.fn(() => [vi.fn()]),
  useSuspendAdminAffiliateMutation: vi.fn(() => [vi.fn()]),
  useReactivateAdminAffiliateMutation: vi.fn(() => [vi.fn()]),
  useSetAdminAffiliateCommissionRateMutation: vi.fn(() => [vi.fn()]),
  useGetAdminAffiliateSettingsQuery: vi.fn(),
  useUpdateAdminAffiliateSettingsMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetAdminAffiliateBookingsQuery: vi.fn(),
  useGetAdminAffiliateCommissionsQuery: vi.fn(),
  useGetAdminAffiliatePayoutsQuery: vi.fn(),
  useApproveAdminAffiliatePayoutMutation: vi.fn(() => [vi.fn()]),
  useRejectAdminAffiliatePayoutMutation: vi.fn(() => [vi.fn()]),
  useMarkAdminAffiliatePayoutPaidMutation: vi.fn(() => [vi.fn()]),
  useGetAdminAffiliateAuditEventsQuery: vi.fn(),
}));

import * as affiliateApiHooks from "../api/affiliate-api";

describe("Affiliate & Admin Affiliate Views", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders application form when user has no affiliate profile", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: { data: null },
      isLoading: false,
    } as any);
    vi.mocked(affiliateApiHooks.useGetMyAffiliateDashboardQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    render(<AffiliateOverviewView />);
    expect(screen.getByText(/Join the PhuketTours Affiliate Program/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Application/i })).toBeInTheDocument();
  });

  it("renders approved affiliate overview metrics accurately", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateProfileQuery).mockReturnValue({
      data: {
        data: {
          id: "aff-1",
          code: "AFF1025",
          status: "APPROVED",
          effectiveCommissionRate: 12,
        },
      },
      isLoading: false,
    } as any);
    vi.mocked(affiliateApiHooks.useGetMyAffiliateDashboardQuery).mockReturnValue({
      data: {
        data: {
          totalClicks: 250,
          referredBookings: 15,
          conversionRate: 6,
          totalEarned: 1800,
          pendingCommission: 200,
          availableBalance: 1100,
          reservedForPayout: 100,
          paidCommission: 400,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AffiliateOverviewView />);
    expect(screen.getByText("AFF1025")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("THB 1100.00")).toBeInTheDocument();
  });

  it("renders affiliate referral links with copy button", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateLinksQuery).mockReturnValue({
      data: {
        data: {
          code: "AFF1025",
          links: [
            {
              id: "link-1",
              label: "Phi Phi Promo",
              targetPath: "/tours/phi-phi",
              clickCount: 42,
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AffiliateLinksView />);
    expect(screen.getAllByText("Phi Phi Promo")[0]).toBeInTheDocument();
    expect(screen.getAllByText("42")[0]).toBeInTheDocument();
  });

  it("renders affiliate payout request form and history", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateDashboardQuery).mockReturnValue({
      data: { data: { availableBalance: 750, minimumPayoutAmount: 50 } },
    } as any);
    vi.mocked(affiliateApiHooks.useGetMyAffiliatePayoutsQuery).mockReturnValue({
      data: {
        data: {
          items: [
            {
              id: "pay-1",
              amount: 300,
              currency: "THB",
              status: "PAID",
              payoutMethod: "Bank Transfer",
              transactionReference: "TXN-8899",
              requestedAt: "2026-11-18T10:00:00Z",
            },
          ],
          balances: { availableBalance: 750 },
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AffiliatePayoutsView />);
    expect(screen.getByText(/THB 750.00/)).toBeInTheDocument();
    expect(screen.getByText(/Ref: TXN-8899/)).toBeInTheDocument();
  });

  it("renders Admin affiliate overview KPIs", () => {
    vi.mocked(affiliateApiHooks.useGetAdminAffiliateOverviewQuery).mockReturnValue({
      data: {
        data: {
          totalAffiliates: 18,
          pendingApplications: 3,
          approvedAffiliates: 14,
          totalClicks: 1200,
          totalAttributedBookings: 65,
          totalNetCommissions: 9500,
          pendingPayoutsCount: 2,
          pendingPayoutsAmount: 1500,
          totalPaidOut: 4000,
          settings: { globalCommissionRate: 10, attributionWindowDays: 30 },
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminAffiliateOverviewView />);
    expect(screen.getByText("Affiliate Overview")).toBeInTheDocument();
    expect(screen.getByText("THB 9500.00")).toBeInTheDocument();
  });
});
