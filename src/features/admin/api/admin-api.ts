import { baseApi } from "@/lib/api/base-api";
import type {
  AdminApiResponse,
  AdminRevenueReportData,
  AdminBookingsReportData,
  AdminPaymentsReportData,
  AdminServicesReportData,
  AdminReportFiltersQuery,
  AdminServicesReportQuery,
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
} = adminApi;

export * from "../types/admin";
