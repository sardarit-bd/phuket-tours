import { baseApi } from "@/lib/api/base-api";
import type {
  AgentOverviewResponse,
  AgentBookingsListResponse,
  AgentBookingDetailResponse,
  AgentCommissionsListResponse,
  AgentProfileResponse,
  AgentBookingRecord,
  AgentCommissionRecord,
  GetAgentBookingsParams,
  GetAgentCommissionsParams,
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
  }),
});

export const {
  useGetAgentOverviewQuery,
  useGetAgentBookingsQuery,
  useGetAgentBookingByIdQuery,
  useGetAgentCommissionsQuery,
  useGetAdminCommissionsQuery,
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} = agentApi;
