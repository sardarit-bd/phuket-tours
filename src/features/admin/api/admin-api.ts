import { baseApi } from "@/lib/api/base-api";
import type {
  AdminApiResponse,
  AdminRevenueReportData,
  AdminBookingsReportData,
  AdminPaymentsReportData,
  AdminServicesReportData,
  AdminReportFiltersQuery,
  AdminServicesReportQuery,
  AdminServicesListResponse,
  AdminServiceRecord,
  GetAdminServicesParams,
  BulkUpdateServiceStatusInput,
  BulkUpdateServiceStatusResult,
  UpdateServiceStatusInput,
} from "../types/admin";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRevenueReport: builder.query<
      AdminApiResponse<AdminRevenueReportData>,
      AdminReportFiltersQuery | void
    >({
      query: (filters) => ({
        url: "/admin/reports/revenue",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["AdminReport"],
      keepUnusedDataFor: 300,
    }),

    getAdminBookingsReport: builder.query<
      AdminApiResponse<AdminBookingsReportData>,
      AdminReportFiltersQuery | void
    >({
      query: (filters) => ({
        url: "/admin/reports/bookings",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["AdminReport"],
      keepUnusedDataFor: 300,
    }),

    getAdminPaymentsReport: builder.query<
      AdminApiResponse<AdminPaymentsReportData>,
      AdminReportFiltersQuery | void
    >({
      query: (filters) => ({
        url: "/admin/reports/payments",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["AdminReport"],
      keepUnusedDataFor: 300,
    }),

    getAdminServicesReport: builder.query<
      AdminApiResponse<AdminServicesReportData>,
      AdminServicesReportQuery | void
    >({
      query: (filters) => ({
        url: "/admin/reports/services",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["AdminReport"],
      keepUnusedDataFor: 300,
    }),

    getAdminServices: builder.query<
      AdminApiResponse<AdminServicesListResponse>,
      GetAdminServicesParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {
          type: "TOUR",
        };
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.type !== undefined) queryParams.type = params.type;
        if (params?.status) queryParams.status = params.status;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.q && params.q.trim()) queryParams.q = params.q.trim();
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

        return {
          url: "/admin/services",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((s) => ({
                type: "AdminService" as const,
                id: s.id,
              })),
              { type: "AdminService", id: "LIST" },
            ]
          : [{ type: "AdminService", id: "LIST" }],
    }),

    updateAdminServiceStatus: builder.mutation<
      AdminApiResponse<AdminServiceRecord>,
      UpdateServiceStatusInput
    >({
      query: ({ serviceId, status }) => ({
        url: `/admin/services/${serviceId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: "AdminService", id: serviceId },
        { type: "AdminService", id: "LIST" },
      ],
    }),

    bulkUpdateAdminServiceStatus: builder.mutation<
      AdminApiResponse<BulkUpdateServiceStatusResult>,
      BulkUpdateServiceStatusInput
    >({
      query: (body) => ({
        url: "/admin/services/bulk-status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "AdminService", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminRevenueReportQuery,
  useLazyGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useLazyGetAdminBookingsReportQuery,
  useGetAdminPaymentsReportQuery,
  useLazyGetAdminPaymentsReportQuery,
  useGetAdminServicesReportQuery,
  useLazyGetAdminServicesReportQuery,
  useGetAdminServicesQuery,
  useLazyGetAdminServicesQuery,
  useUpdateAdminServiceStatusMutation,
  useBulkUpdateAdminServiceStatusMutation,
} = adminApi;

export * from "../types/admin";

