import { baseApi } from "@/lib/api/base-api";
import type { ApiResponse } from "@/types/common";
import type {
  AgentOverviewResponse,
  AgentBookingsListResponse,
  AgentBookingDetailResponse,
  AgentCommissionsListResponse,
  AgentProfileResponse,
  AgentCustomersListResponse,
  AgentCustomerResponse,
  AgentPricingLimitsResponse,
  AgentBookingHistoryResponse,
  AgentPaymentLinkResponse,
  PublicPaymentLinkData,
  AgentBookingRecord,
  AgentBookingPayment,
  AgentCommissionRecord,
  GetAgentBookingsParams,
  GetAgentCommissionsParams,
  GetAgentCustomersParams,
  CreateAgentCustomerInput,
  CreateAgentBookingInput,
  UpdateAgentBookingPriceInput,
  UpdateAgentProfileInput,
} from "../types/agent";

export const agentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgentOverview: builder.query<AgentOverviewResponse, void>({
      query: () => ({
        url: "/agent/overview",
        method: "GET",
      }),
      providesTags: ["AgentOverview"],
      keepUnusedDataFor: 60,
    }),

    getAgentBookings: builder.query<
      AgentBookingsListResponse,
      GetAgentBookingsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.paymentStatus && params.paymentStatus !== "ALL")
          queryParams.paymentStatus = params.paymentStatus;
        if (params?.fulfillmentStatus && params.fulfillmentStatus !== "ALL")
          queryParams.fulfillmentStatus = params.fulfillmentStatus;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

        return {
          url: "/agent/bookings",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((b: AgentBookingRecord) => ({
                type: "AgentBookings" as const,
                id: b.id,
              })),
              { type: "AgentBookings" as const, id: "LIST" },
            ]
          : [{ type: "AgentBookings" as const, id: "LIST" }],
    }),

    getAgentBookingById: builder.query<AgentBookingDetailResponse, string>({
      query: (bookingId) => ({
        url: `/agent/bookings/${bookingId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, bookingId) => [
        { type: "AgentBookings" as const, id: bookingId },
      ],
    }),

    getAgentBookingHistory: builder.query<AgentBookingHistoryResponse, string>({
      query: (bookingId) => ({
        url: `/agent/bookings/${bookingId}/history`,
        method: "GET",
      }),
      providesTags: (_result, _error, bookingId) => [
        { type: "AgentBookings" as const, id: `HISTORY-${bookingId}` },
      ],
    }),

    getAgentPricingLimits: builder.query<
      AgentPricingLimitsResponse,
      { serviceId?: string } | void
    >({
      query: (params) => ({
        url: "/agent/pricing-limits",
        method: "GET",
        params: params?.serviceId ? { serviceId: params.serviceId } : undefined,
      }),
    }),

    getAgentCustomers: builder.query<
      AgentCustomersListResponse,
      GetAgentCustomersParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

        return {
          url: "/agent/customers",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["AgentBookings"],
    }),

    createAgentCustomer: builder.mutation<
      AgentCustomerResponse,
      CreateAgentCustomerInput
    >({
      query: (body) => ({
        url: "/agent/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AgentBookings"],
    }),

    createAgentBooking: builder.mutation<
      AgentBookingDetailResponse,
      CreateAgentBookingInput
    >({
      query: (body) => ({
        url: "/agent/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "AgentBookings", id: "LIST" },
        "AgentOverview",
      ],
    }),

    updateAgentBookingPrice: builder.mutation<
      AgentBookingDetailResponse,
      UpdateAgentBookingPriceInput
    >({
      query: ({ bookingId, proposedPrice }) => ({
        url: `/agent/bookings/${bookingId}/price`,
        method: "PATCH",
        body: { proposedPrice },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "AgentBookings", id: bookingId },
        { type: "AgentBookings", id: `HISTORY-${bookingId}` },
        { type: "AgentBookings", id: "LIST" },
        "AgentOverview",
      ],
    }),

    getAgentPayments: builder.query<
      ApiResponse<{ items: AgentBookingPayment[]; page: number; limit: number; total: number }>,
      { bookingId?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.bookingId) queryParams.bookingId = params.bookingId;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        return {
          url: "/agent/payments",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["AgentBookings"],
    }),

    createAgentPayment: builder.mutation<
      ApiResponse<AgentBookingPayment>,
      { bookingId: string; method: "BANK_TRANSFER" | "CASH" | "OTHER" | "STRIPE"; reference?: string; receiptNote?: string }
    >({
      query: ({ bookingId, ...body }) => ({
        url: `/agent/bookings/${bookingId}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "AgentBookings", id: bookingId },
        { type: "AgentBookings", id: `HISTORY-${bookingId}` },
        { type: "AgentBookings", id: "LIST" },
        "AgentOverview",
      ],
    }),

    createAgentStripeSession: builder.mutation<
      ApiResponse<{
        sessionId: string;
        sessionUrl: string;
        paymentId: string;
        amount: number;
        currency: string;
        status: string;
      }>,
      { bookingId: string; successUrl?: string; cancelUrl?: string }
    >({
      query: ({ bookingId, ...body }) => ({
        url: `/agent/bookings/${bookingId}/stripe-session`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "AgentBookings", id: bookingId },
        { type: "AgentBookings", id: `HISTORY-${bookingId}` },
      ],
    }),

    reconcileAgentPayment: builder.mutation<
      ApiResponse<{
        paymentId: string;
        bookingId: string;
        previousStatus: string;
        newStatus: string;
        reconciled: boolean;
        notes?: string;
      }>,
      string
    >({
      query: (paymentId) => ({
        url: `/agent/payments/${paymentId}/reconcile`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "AgentBookings", id: "LIST" },
        "AgentOverview",
        "AgentCommissions",
      ],
    }),

    getAgentCommissions: builder.query<
      AgentCommissionsListResponse,
      GetAgentCommissionsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;

        return {
          url: "/agent/commissions",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((c: AgentCommissionRecord) => ({
                type: "AgentCommissions" as const,
                id: c.id,
              })),
              { type: "AgentCommissions" as const, id: "LIST" },
            ]
          : [{ type: "AgentCommissions" as const, id: "LIST" }],
    }),

    getAdminCommissions: builder.query<
      AgentCommissionsListResponse,
      GetAgentCommissionsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status && params.status !== "ALL") queryParams.status = params.status;
        if (params?.agentId) queryParams.agentId = params.agentId;

        return {
          url: "/admin/commissions",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["AdminCommissions"],
    }),

    getAgentProfile: builder.query<AgentProfileResponse, void>({
      query: () => ({
        url: "/agent/profile",
        method: "GET",
      }),
      providesTags: ["AgentProfile"],
    }),

    updateAgentProfile: builder.mutation<
      AgentProfileResponse,
      UpdateAgentProfileInput
    >({
      query: (body) => ({
        url: "/agent/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AgentProfile", "User"],
    }),

    generateAgentPaymentLink: builder.mutation<
      ApiResponse<AgentPaymentLinkResponse>,
      { bookingId: string; expiresInDays?: number }
    >({
      query: ({ bookingId, expiresInDays }) => ({
        url: `/agent/bookings/${bookingId}/payment-link`,
        method: "POST",
        body: expiresInDays ? { expiresInDays } : {},
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "AgentBookings", id: bookingId },
        { type: "AgentBookings", id: `HISTORY-${bookingId}` },
      ],
    }),

    getPublicPaymentLinkDetails: builder.query<
      ApiResponse<PublicPaymentLinkData>,
      string
    >({
      query: (token) => ({
        url: `/public/payment-links/${token}`,
        method: "GET",
      }),
    }),

    createPublicStripeSession: builder.mutation<
      ApiResponse<{
        sessionId: string;
        sessionUrl: string;
        paymentId: string;
        amount: number;
        currency: string;
        status: string;
      }>,
      { token: string; successUrl?: string; cancelUrl?: string }
    >({
      query: ({ token, ...body }) => ({
        url: `/public/payment-links/${token}/stripe-session`,
        method: "POST",
        body,
      }),
    }),

    createPublicPayPalOrder: builder.mutation<
      ApiResponse<{
        orderId: string;
        status: string;
        approveUrl: string | null;
        amount: number;
        currency: string;
      }>,
      { token: string; returnUrl?: string; cancelUrl?: string }
    >({
      query: ({ token, ...body }) => ({
        url: `/public/payment-links/${token}/paypal-order`,
        method: "POST",
        body,
      }),
    }),

    capturePublicPayPalOrder: builder.mutation<
      ApiResponse<{
        success: boolean;
        paymentId: string;
        amount: number;
        currency: string;
        status: string;
      }>,
      { token: string; orderId: string }
    >({
      query: ({ token, orderId }) => ({
        url: `/public/payment-links/${token}/paypal-capture`,
        method: "POST",
        body: { orderId },
      }),
    }),
  }),
});

export const {
  useGetAgentOverviewQuery,
  useGetAgentBookingsQuery,
  useGetAgentBookingByIdQuery,
  useGetAgentBookingHistoryQuery,
  useGetAgentPricingLimitsQuery,
  useGetAgentCustomersQuery,
  useCreateAgentCustomerMutation,
  useCreateAgentBookingMutation,
  useUpdateAgentBookingPriceMutation,
  useGetAgentPaymentsQuery,
  useCreateAgentPaymentMutation,
  useCreateAgentStripeSessionMutation,
  useReconcileAgentPaymentMutation,
  useGetAgentCommissionsQuery,
  useGetAdminCommissionsQuery,
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
  useGenerateAgentPaymentLinkMutation,
  useGetPublicPaymentLinkDetailsQuery,
  useCreatePublicStripeSessionMutation,
  useCreatePublicPayPalOrderMutation,
  useCapturePublicPayPalOrderMutation,
} = agentApi;
