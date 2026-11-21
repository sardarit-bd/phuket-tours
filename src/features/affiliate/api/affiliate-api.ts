import { baseApi } from "@/lib/api/base-api";
import type { ApiResponse } from "@/types/common";
import type {
  AdminAffiliateListItem,
  AdminAffiliateOverview,
  AffiliateAuditEventItem,
  AffiliateClickItem,
  AffiliateCommissionItem,
  AffiliateDashboardSummary,
  AffiliateLinkItem,
  AffiliatePayoutItem,
  AffiliateProfile,
  AffiliateReferredBookingItem,
  AffiliateSettings,
  PaginatedAffiliateData,
} from "../types/affiliate";

export const affiliateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── PUBLIC TRACKING ──────────────────────────────────────────────────────
    trackAffiliateClick: builder.mutation<
      ApiResponse<{ valid: boolean; code: string | null }>,
      { code: string; landingUrl: string; referrer?: string | null; linkId?: string | null }
    >({
      query: (body) => ({
        url: "/affiliates/track-click",
        method: "POST",
        body,
      }),
    }),

    // ─── AFFILIATE PORTAL ─────────────────────────────────────────────────────
    applyAsAffiliate: builder.mutation<
      ApiResponse<AffiliateProfile>,
      {
        websiteUrl?: string;
        promotionChannels?: string;
        payoutMethod?: string;
        payoutDetails?: Record<string, unknown>;
      }
    >({
      query: (body) => ({
        url: "/affiliate/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AffiliateProfile", "AffiliateDashboard"],
    }),

    getMyAffiliateProfile: builder.query<ApiResponse<AffiliateProfile | null>, void>({
      query: () => "/affiliate/me",
      providesTags: ["AffiliateProfile"],
    }),

    updateMyAffiliateProfile: builder.mutation<
      ApiResponse<AffiliateProfile>,
      {
        websiteUrl?: string;
        promotionChannels?: string;
        payoutMethod?: string;
        payoutDetails?: Record<string, unknown>;
      }
    >({
      query: (body) => ({
        url: "/affiliate/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AffiliateProfile"],
    }),

    getMyAffiliateDashboard: builder.query<ApiResponse<AffiliateDashboardSummary>, void>({
      query: () => "/affiliate/dashboard",
      providesTags: ["AffiliateDashboard"],
    }),

    getMyAffiliateLinks: builder.query<
      ApiResponse<{ code: string; links: AffiliateLinkItem[] }>,
      void
    >({
      query: () => "/affiliate/links",
      providesTags: ["AffiliateLinks"],
    }),

    createMyAffiliateLink: builder.mutation<
      ApiResponse<AffiliateLinkItem>,
      { label?: string; tourId?: string | null; targetPath?: string }
    >({
      query: (body) => ({
        url: "/affiliate/links",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AffiliateLinks"],
    }),

    updateMyAffiliateLink: builder.mutation<
      ApiResponse<AffiliateLinkItem>,
      { id: string; label?: string; isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/affiliate/links/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AffiliateLinks"],
    }),

    deleteMyAffiliateLink: builder.mutation<
      ApiResponse<{ id: string; deleted?: boolean; isActive?: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/affiliate/links/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AffiliateLinks"],
    }),

    getMyAffiliateClicks: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateClickItem>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/affiliate/clicks",
        params: params || undefined,
      }),
      providesTags: ["AffiliateClicks"],
    }),

    getMyAffiliateBookings: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateReferredBookingItem>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/affiliate/bookings",
        params: params || undefined,
      }),
      providesTags: ["AffiliateBookings"],
    }),

    getMyAffiliateCommissions: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateCommissionItem>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/affiliate/commissions",
        params: params || undefined,
      }),
      providesTags: ["AffiliateCommissions"],
    }),

    getMyAffiliatePayouts: builder.query<
      ApiResponse<
        PaginatedAffiliateData<AffiliatePayoutItem> & {
          balances?: {
            totalEarned: number;
            pendingCommission: number;
            reservedForPayout: number;
            paidCommission: number;
            availableBalance: number;
          };
        }
      >,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/affiliate/payouts",
        params: params || undefined,
      }),
      providesTags: ["AffiliatePayouts"],
    }),

    requestAffiliatePayout: builder.mutation<
      ApiResponse<AffiliatePayoutItem>,
      { amount: number; payoutMethod: string; payoutDetails?: Record<string, unknown> }
    >({
      query: (body) => ({
        url: "/affiliate/payouts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AffiliatePayouts", "AffiliateDashboard", "AffiliateCommissions"],
    }),

    // ─── ADMIN AFFILIATE MANAGEMENT ───────────────────────────────────────────
    getAdminAffiliateOverview: builder.query<ApiResponse<AdminAffiliateOverview>, void>({
      query: () => "/admin/affiliates/overview",
      providesTags: ["AdminAffiliates", "AdminAffiliatePayouts", "AdminAffiliateSettings"],
    }),

    getAdminAffiliates: builder.query<
      ApiResponse<PaginatedAffiliateData<AdminAffiliateListItem>>,
      { status?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates",
        params: params || undefined,
      }),
      providesTags: ["AdminAffiliates"],
    }),

    approveAdminAffiliate: builder.mutation<ApiResponse<AffiliateProfile>, string>({
      query: (id) => ({
        url: `/admin/affiliates/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),

    rejectAdminAffiliate: builder.mutation<
      ApiResponse<AffiliateProfile>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/affiliates/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),

    suspendAdminAffiliate: builder.mutation<
      ApiResponse<AffiliateProfile>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/affiliates/${id}/suspend`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),

    reactivateAdminAffiliate: builder.mutation<ApiResponse<AffiliateProfile>, string>({
      query: (id) => ({
        url: `/admin/affiliates/${id}/reactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),

    setAdminAffiliateCommissionRate: builder.mutation<
      ApiResponse<AffiliateProfile>,
      { id: string; commissionRateOverride: number | null }
    >({
      query: ({ id, commissionRateOverride }) => ({
        url: `/admin/affiliates/${id}/commission-rate`,
        method: "PATCH",
        body: { commissionRateOverride },
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),

    getAdminAffiliateSettings: builder.query<ApiResponse<AffiliateSettings>, void>({
      query: () => "/admin/affiliates/settings",
      providesTags: ["AdminAffiliateSettings"],
    }),

    updateAdminAffiliateSettings: builder.mutation<
      ApiResponse<AffiliateSettings>,
      Partial<{
        globalCommissionRate: number;
        attributionWindowDays: number;
        minimumPayoutAmount: number;
        eligibleAmountPolicy: "NET_AFTER_DISCOUNTS" | "GROSS";
        isProgramActive: boolean;
      }>
    >({
      query: (body) => ({
        url: "/admin/affiliates/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminAffiliateSettings", "AdminAffiliates"],
    }),

    getAdminAffiliateBookings: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateReferredBookingItem>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates/bookings",
        params: params || undefined,
      }),
      providesTags: ["AdminAffiliates"],
    }),

    getAdminAffiliateCommissions: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateCommissionItem>>,
      { affiliateId?: string; status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates/commissions",
        params: params || undefined,
      }),
      providesTags: ["AdminAffiliates"],
    }),

    getAdminAffiliatePayouts: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliatePayoutItem>>,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates/payouts",
        params: params || undefined,
      }),
      providesTags: ["AdminAffiliatePayouts"],
    }),

    approveAdminAffiliatePayout: builder.mutation<ApiResponse<AffiliatePayoutItem>, string>({
      query: (id) => ({
        url: `/admin/affiliates/payouts/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminAffiliatePayouts", "AdminAffiliates"],
    }),

    rejectAdminAffiliatePayout: builder.mutation<
      ApiResponse<AffiliatePayoutItem>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/affiliates/payouts/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["AdminAffiliatePayouts", "AdminAffiliates"],
    }),

    markAdminAffiliatePayoutPaid: builder.mutation<
      ApiResponse<AffiliatePayoutItem>,
      { id: string; payoutMethod: string; transactionReference: string; paidAt?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/affiliates/payouts/${id}/mark-paid`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminAffiliatePayouts", "AdminAffiliates"],
    }),

    getAdminAffiliateAuditEvents: builder.query<
      ApiResponse<PaginatedAffiliateData<AffiliateAuditEventItem>>,
      { affiliateId?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates/audit-events",
        params: params || undefined,
      }),
      providesTags: ["AdminAffiliates"],
    }),
  }),
});

export const {
  useTrackAffiliateClickMutation,
  useApplyAsAffiliateMutation,
  useGetMyAffiliateProfileQuery,
  useUpdateMyAffiliateProfileMutation,
  useGetMyAffiliateDashboardQuery,
  useGetMyAffiliateLinksQuery,
  useCreateMyAffiliateLinkMutation,
  useUpdateMyAffiliateLinkMutation,
  useDeleteMyAffiliateLinkMutation,
  useGetMyAffiliateClicksQuery,
  useGetMyAffiliateBookingsQuery,
  useGetMyAffiliateCommissionsQuery,
  useGetMyAffiliatePayoutsQuery,
  useRequestAffiliatePayoutMutation,
  useGetAdminAffiliateOverviewQuery,
  useGetAdminAffiliatesQuery,
  useApproveAdminAffiliateMutation,
  useRejectAdminAffiliateMutation,
  useSuspendAdminAffiliateMutation,
  useReactivateAdminAffiliateMutation,
  useSetAdminAffiliateCommissionRateMutation,
  useGetAdminAffiliateSettingsQuery,
  useUpdateAdminAffiliateSettingsMutation,
  useGetAdminAffiliateBookingsQuery,
  useGetAdminAffiliateCommissionsQuery,
  useGetAdminAffiliatePayoutsQuery,
  useApproveAdminAffiliatePayoutMutation,
  useRejectAdminAffiliatePayoutMutation,
  useMarkAdminAffiliatePayoutPaidMutation,
  useGetAdminAffiliateAuditEventsQuery,
} = affiliateApi;
