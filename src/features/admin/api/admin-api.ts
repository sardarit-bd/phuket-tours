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
  AdminServiceDetail,
  AdminServicePricingRecord,
  AdminServiceAvailabilityRecord,
  GetAdminServicesParams,
  BulkUpdateServiceStatusInput,
  BulkUpdateServiceStatusResult,
  UpdateServiceStatusInput,
  CreateAdminServiceInput,
  UpdateAdminServiceInput,
  UpdateAdminPricingInput,
  UpdateAdminAvailabilityInput,
  AdminBookingsListResponse,
  GetAdminBookingsParams,
  OperationalBookingRecord,
  AssignBookingStaffInput,
  UpdateBookingFulfillmentInput,
  ReviewBookingPriceApprovalInput,
  AdminStaffListResponse,
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

    getAdminServiceById: builder.query<
      AdminApiResponse<AdminServiceDetail>,
      string
    >({
      query: (serviceId) => ({
        url: `/admin/services/${serviceId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, serviceId) => [
        { type: "AdminService", id: serviceId },
      ],
    }),

    createAdminService: builder.mutation<
      AdminApiResponse<AdminServiceRecord>,
      CreateAdminServiceInput
    >({
      query: (body) => ({
        url: "/admin/services",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminService", id: "LIST" }],
    }),

    updateAdminService: builder.mutation<
      AdminApiResponse<AdminServiceRecord>,
      UpdateAdminServiceInput
    >({
      query: ({ serviceId, ...body }) => ({
        url: `/admin/services/${serviceId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: "AdminService", id: serviceId },
        { type: "AdminService", id: "LIST" },
      ],
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

    getAdminServicePricing: builder.query<
      AdminApiResponse<AdminServicePricingRecord[]>,
      string
    >({
      query: (serviceId) => ({
        url: `/admin/services/${serviceId}/pricing`,
        method: "GET",
      }),
      providesTags: (_result, _error, serviceId) => [
        { type: "AdminServicePricing" as const, id: serviceId },
      ],
    }),

    updateAdminServicePricing: builder.mutation<
      AdminApiResponse<AdminServicePricingRecord>,
      UpdateAdminPricingInput
    >({
      query: ({ serviceId, ...body }) => ({
        url: `/admin/services/${serviceId}/pricing`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: "AdminServicePricing" as const, id: serviceId },
        { type: "AdminService", id: serviceId },
        { type: "AdminService", id: "LIST" },
      ],
    }),

    getAdminServiceAvailability: builder.query<
      AdminApiResponse<AdminServiceAvailabilityRecord[]>,
      string
    >({
      query: (serviceId) => ({
        url: `/admin/services/${serviceId}/availability`,
        method: "GET",
      }),
      providesTags: (_result, _error, serviceId) => [
        { type: "AdminServiceAvailability" as const, id: serviceId },
      ],
    }),

    updateAdminServiceAvailability: builder.mutation<
      AdminApiResponse<AdminServiceAvailabilityRecord>,
      UpdateAdminAvailabilityInput
    >({
      query: ({ serviceId, ...body }) => ({
        url: `/admin/services/${serviceId}/availability`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: "AdminServiceAvailability" as const, id: serviceId },
        { type: "AdminService", id: serviceId },
        { type: "AdminService", id: "LIST" },
      ],
    }),

    getAdminOperationsBookings: builder.query<
      AdminApiResponse<AdminBookingsListResponse>,
      GetAdminBookingsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.fulfillmentStatus) queryParams.fulfillmentStatus = params.fulfillmentStatus;
        if (params?.assignedStaffId) queryParams.assignedStaffId = params.assignedStaffId;

        return {
          url: "/admin/operations/bookings",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((b) => ({
                type: "Booking" as const,
                id: b.id,
              })),
              { type: "Booking", id: "LIST" },
            ]
          : [{ type: "Booking", id: "LIST" }],
    }),

    getAdminStaff: builder.query<
      AdminApiResponse<AdminStaffListResponse>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/admin/staff",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [{ type: "User", id: "STAFF_LIST" }],
    }),

    assignBookingStaff: builder.mutation<
      AdminApiResponse<OperationalBookingRecord>,
      AssignBookingStaffInput
    >({
      query: ({ bookingId, staffId, notes }) => ({
        url: `/admin/operations/bookings/${bookingId}/assignment`,
        method: "PATCH",
        body: { staffId, notes },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
        "AdminReport",
      ],
    }),

    updateBookingFulfillmentStatus: builder.mutation<
      AdminApiResponse<OperationalBookingRecord>,
      UpdateBookingFulfillmentInput
    >({
      query: ({ bookingId, fulfillmentStatus, notes }) => ({
        url: `/admin/operations/bookings/${bookingId}/status`,
        method: "PATCH",
        body: { fulfillmentStatus, notes },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
        "AdminReport",
      ],
    }),

    reviewBookingPriceApproval: builder.mutation<
      AdminApiResponse<OperationalBookingRecord>,
      ReviewBookingPriceApprovalInput
    >({
      query: ({ bookingId, status, approvedPrice, notes }) => ({
        url: `/admin/bookings/${bookingId}/price-approvals`,
        method: "POST",
        body: {
          status,
          ...(approvedPrice !== undefined ? { approvedPrice } : {}),
          ...(notes ? { notes } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
        "AdminReport",
      ],
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
  useGetAdminServiceByIdQuery,
  useLazyGetAdminServiceByIdQuery,
  useCreateAdminServiceMutation,
  useUpdateAdminServiceMutation,
  useUpdateAdminServiceStatusMutation,
  useBulkUpdateAdminServiceStatusMutation,
  useGetAdminServicePricingQuery,
  useLazyGetAdminServicePricingQuery,
  useUpdateAdminServicePricingMutation,
  useGetAdminServiceAvailabilityQuery,
  useLazyGetAdminServiceAvailabilityQuery,
  useUpdateAdminServiceAvailabilityMutation,
  useGetAdminOperationsBookingsQuery,
  useLazyGetAdminOperationsBookingsQuery,
  useGetAdminStaffQuery,
  useLazyGetAdminStaffQuery,
  useAssignBookingStaffMutation,
  useUpdateBookingFulfillmentStatusMutation,
  useReviewBookingPriceApprovalMutation,
} = adminApi;

export * from "../types/admin";

