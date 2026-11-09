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
  PendingReservationRecord,
  AdminPendingReservationsResponse,
  ReviewPendingReservationInput,
  AdminUserRecord,
  AdminUserListResponse,
  GetAdminUsersParams,
  CreateAdminAgentInput,
  CreateAdminStaffInput,
  UpdateAdminUserInput,
  UpdateAdminAgentInput,
  PermissionCatalogData,
  StaffPermissionsData,
  UpdateStaffPermissionsInput,
  EffectivePermissionsData,
  AdminPaymentRecord,
  AdminPaymentListResponse,
  GetAdminPaymentsParams,
  VerifyPaymentInput,
  RecordPaymentInput,
  AdminCommissionDetail,
  GetAdminCommissionsParams,
  AdminCommissionsListResponse,
  AdjustCommissionInput,
  AdminCommissionRule,
  GetAdminCommissionRulesParams,
  AdminCommissionRulesResponse,
  ConfigureCommissionRuleInput,
  AdminCommissionsReportData,
} from "../types/admin";
import type {
  SystemSettingsOverview,
  SettingAuditLogsResponse,
  UpdateGeneralSettingsInput,
  UpdatePaymentSettingsInput,
  UpdateWebhookSettingsInput,
  UpdateCloudinarySettingsInput,
  UpdateSmtpSettingsInput,
  TestConnectionResult,
  SendTestEmailInput,
  SendTestEmailResult,
  GetSettingAuditLogsParams,
} from "../types/admin-settings";

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

    getAdminPendingReservations: builder.query<
      AdminApiResponse<AdminPendingReservationsResponse>,
      { page?: number; limit?: number; search?: string; paymentStatus?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.search) queryParams.search = params.search;
        if (params?.paymentStatus) queryParams.paymentStatus = params.paymentStatus;

        return {
          url: "/admin/bookings/pending",
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

    reviewAdminPendingReservation: builder.mutation<
      AdminApiResponse<PendingReservationRecord>,
      ReviewPendingReservationInput
    >({
      query: ({ bookingId, action, notes }) => ({
        url: `/admin/bookings/pending/${bookingId}/review`,
        method: "POST",
        body: { action, notes },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
        "AdminReport",
      ],
    }),

    // Users Management Endpoints
    getAdminUsers: builder.query<
      AdminApiResponse<AdminUserListResponse>,
      GetAdminUsersParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.role) queryParams.role = params.role;
        if (params?.status) queryParams.status = params.status;

        return {
          url: "/admin/users",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((user) => ({
                type: "User" as const,
                id: user.id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getAdminUserById: builder.query<
      AdminApiResponse<AdminUserRecord>,
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
      ],
    }),

    getAdminAgentById: builder.query<
      AdminApiResponse<AdminUserRecord>,
      string
    >({
      query: (agentId) => ({
        url: `/admin/agents/${agentId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, agentId) => [
        { type: "User", id: agentId },
      ],
    }),

    createAdminAgent: builder.mutation<
      AdminApiResponse<AdminUserRecord>,
      CreateAdminAgentInput
    >({
      query: (input) => ({
        url: "/admin/agents",
        method: "POST",
        body: input,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    createAdminStaff: builder.mutation<
      AdminApiResponse<AdminUserRecord>,
      CreateAdminStaffInput
    >({
      query: (input) => ({
        url: "/admin/staff",
        method: "POST",
        body: input,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "STAFF_LIST" },
      ],
    }),

    updateAdminUser: builder.mutation<
      AdminApiResponse<AdminUserRecord>,
      UpdateAdminUserInput
    >({
      query: ({ userId, ...body }) => ({
        url: `/admin/users/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "STAFF_LIST" },
      ],
    }),

    updateAdminAgent: builder.mutation<
      AdminApiResponse<AdminUserRecord>,
      UpdateAdminAgentInput
    >({
      query: ({ agentId, ...body }) => ({
        url: `/admin/agents/${agentId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { agentId }) => [
        { type: "User", id: agentId },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteAdminUser: builder.mutation<
      AdminApiResponse<AdminUserRecord>,
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "STAFF_LIST" },
      ],
    }),

    resendStaffInvitation: builder.mutation<
      AdminApiResponse<void>,
      string
    >({
      query: (staffId) => ({
        url: `/admin/staff/${staffId}/resend-invitation`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, staffId) => [
        { type: "User", id: staffId },
        { type: "User", id: "LIST" },
        { type: "User", id: "STAFF_LIST" },
      ],
    }),

    resendUserInvitation: builder.mutation<
      AdminApiResponse<void>,
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/resend-invitation`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "STAFF_LIST" },
      ],
    }),

    // Permissions Management Endpoints
    getAdminPermissions: builder.query<
      AdminApiResponse<PermissionCatalogData>,
      void
    >({
      query: () => ({
        url: "/admin/permissions",
        method: "GET",
      }),
      providesTags: ["AdminPermission"],
      keepUnusedDataFor: 300,
    }),

    getStaffPermissions: builder.query<
      AdminApiResponse<StaffPermissionsData>,
      string
    >({
      query: (staffId) => ({
        url: `/admin/staff/${staffId}/permissions`,
        method: "GET",
      }),
      providesTags: (_result, _error, staffId) => [
        { type: "AdminPermission", id: staffId },
      ],
      keepUnusedDataFor: 60,
    }),

    updateStaffPermissions: builder.mutation<
      AdminApiResponse<StaffPermissionsData>,
      UpdateStaffPermissionsInput
    >({
      query: ({ staffId, permissions }) => ({
        url: `/admin/staff/${staffId}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { staffId }) => [
        "AdminPermission",
        { type: "AdminPermission", id: staffId },
        "User",
      ],
    }),

    getEffectivePermissions: builder.query<
      AdminApiResponse<EffectivePermissionsData>,
      void
    >({
      query: () => ({
        url: "/auth/me/permissions",
        method: "GET",
      }),
      providesTags: ["AdminPermission", "Auth"],
      keepUnusedDataFor: 60,
    }),

    // Payment Management Endpoints
    getAdminPayments: builder.query<
      AdminApiResponse<AdminPaymentListResponse>,
      GetAdminPaymentsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.status) queryParams.status = params.status;
        if (params?.method) queryParams.method = params.method;
        if (params?.bookingId) queryParams.bookingId = params.bookingId;
        if (params?.customerId) queryParams.customerId = params.customerId;
        return {
          url: "/admin/payments",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((p) => ({
                type: "AdminPayment" as const,
                id: p.id,
              })),
              { type: "AdminPayment", id: "LIST" },
            ]
          : [{ type: "AdminPayment", id: "LIST" }],
    }),

    getAdminPaymentById: builder.query<
      AdminApiResponse<AdminPaymentRecord>,
      string
    >({
      query: (paymentId) => ({
        url: `/admin/payments/${paymentId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, paymentId) => [
        { type: "AdminPayment", id: paymentId },
      ],
    }),

    verifyAdminPayment: builder.mutation<
      AdminApiResponse<AdminPaymentRecord>,
      { paymentId: string; input: VerifyPaymentInput }
    >({
      query: ({ paymentId, input }) => ({
        url: `/admin/payments/${paymentId}/verify`,
        method: "POST",
        body: input,
      }),
      invalidatesTags: (_result, _error, { paymentId }) => [
        { type: "AdminPayment", id: paymentId },
        { type: "AdminPayment", id: "LIST" },
        "AdminReport",
        "Booking",
        "AgentCommissions",
        "AdminCommissions",
      ],
    }),

    recordAdminPayment: builder.mutation<
      AdminApiResponse<AdminPaymentRecord>,
      { paymentId: string; input: RecordPaymentInput }
    >({
      query: ({ paymentId, input }) => ({
        url: `/admin/payments/${paymentId}/record`,
        method: "POST",
        body: input,
      }),
      invalidatesTags: (_result, _error, { paymentId }) => [
        { type: "AdminPayment", id: paymentId },
        { type: "AdminPayment", id: "LIST" },
        "AdminReport",
        "Booking",
        "AgentCommissions",
        "AdminCommissions",
      ],
    }),

    // Commission Management Endpoints
    getAdminCommissions: builder.query<
      AdminApiResponse<AdminCommissionsListResponse>,
      GetAdminCommissionsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status && (params.status as string) !== "ALL") queryParams.status = params.status;
        if (params?.agentId) queryParams.agentId = params.agentId;
        if (params?.bookingId) queryParams.bookingId = params.bookingId;

        return {
          url: "/admin/commissions",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "AdminCommissions" as const,
                id,
              })),
              { type: "AdminCommissions", id: "LIST" },
            ]
          : [{ type: "AdminCommissions", id: "LIST" }],
    }),

    getAdminCommissionById: builder.query<
      AdminApiResponse<AdminCommissionDetail>,
      string
    >({
      query: (commissionId) => ({
        url: `/admin/commissions/${commissionId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, commissionId) => [
        { type: "AdminCommissions", id: commissionId },
      ],
    }),

    adjustAdminCommission: builder.mutation<
      AdminApiResponse<AdminCommissionDetail>,
      { commissionId: string; input: AdjustCommissionInput }
    >({
      query: ({ commissionId, input }) => ({
        url: `/admin/commissions/${commissionId}`,
        method: "PATCH",
        body: input,
      }),
      invalidatesTags: (_result, _error, { commissionId }) => [
        { type: "AdminCommissions", id: commissionId },
        { type: "AdminCommissions", id: "LIST" },
        "AdminReport",
        "AgentCommissions",
        "Booking",
      ],
    }),

    getAdminCommissionRules: builder.query<
      AdminApiResponse<AdminCommissionRulesResponse>,
      GetAdminCommissionRulesParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: "/admin/commission-rules",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["AdminCommissionRule", "AdminCommissions"],
    }),

    configureAdminCommissionRule: builder.mutation<
      AdminApiResponse<AdminCommissionRule>,
      ConfigureCommissionRuleInput
    >({
      query: (input) => ({
        url: "/admin/commission-rules",
        method: "PUT",
        body: input,
      }),
      invalidatesTags: [
        "AdminCommissionRule",
        "AdminCommissions",
        "AdminReport",
      ],
    }),

    getAdminCommissionsReport: builder.query<
      AdminApiResponse<AdminCommissionsReportData>,
      AdminReportFiltersQuery | void
    >({
      query: (filters) => ({
        url: "/admin/reports/commissions",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["AdminReport", "AdminCommissions"],
      keepUnusedDataFor: 300,
    }),

    // System Settings Endpoints
    getAdminSettings: builder.query<
      AdminApiResponse<SystemSettingsOverview>,
      void
    >({
      query: () => ({
        url: "/admin/settings",
        method: "GET",
      }),
      providesTags: ["AdminSetting"],
    }),

    updateAdminGeneralSettings: builder.mutation<
      AdminApiResponse<SystemSettingsOverview>,
      UpdateGeneralSettingsInput
    >({
      query: (body) => ({
        url: "/admin/settings/general",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    updateAdminPaymentSettings: builder.mutation<
      AdminApiResponse<SystemSettingsOverview>,
      UpdatePaymentSettingsInput
    >({
      query: (body) => ({
        url: "/admin/settings/payment",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    updateAdminWebhookSettings: builder.mutation<
      AdminApiResponse<SystemSettingsOverview>,
      UpdateWebhookSettingsInput
    >({
      query: (body) => ({
        url: "/admin/settings/webhook",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    updateAdminCloudinarySettings: builder.mutation<
      AdminApiResponse<SystemSettingsOverview>,
      UpdateCloudinarySettingsInput
    >({
      query: (body) => ({
        url: "/admin/settings/cloudinary",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    testAdminCloudinaryConnection: builder.mutation<
      AdminApiResponse<TestConnectionResult>,
      void
    >({
      query: () => ({
        url: "/admin/settings/cloudinary/test",
        method: "POST",
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    updateAdminSmtpSettings: builder.mutation<
      AdminApiResponse<SystemSettingsOverview>,
      UpdateSmtpSettingsInput
    >({
      query: (body) => ({
        url: "/admin/settings/smtp",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    testAdminSmtpConnection: builder.mutation<
      AdminApiResponse<TestConnectionResult>,
      void
    >({
      query: () => ({
        url: "/admin/settings/smtp/test",
        method: "POST",
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    sendAdminTestEmail: builder.mutation<
      AdminApiResponse<SendTestEmailResult>,
      SendTestEmailInput
    >({
      query: (body) => ({
        url: "/admin/settings/smtp/send-test",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminSetting"],
    }),

    getAdminSettingAuditLogs: builder.query<
      AdminApiResponse<SettingAuditLogsResponse>,
      GetSettingAuditLogsParams | void
    >({
      query: (params) => ({
        url: "/admin/settings/audit",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["AdminSetting"],
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
  useGetAdminPendingReservationsQuery,
  useLazyGetAdminPendingReservationsQuery,
  useReviewAdminPendingReservationMutation,
  // User Management Hooks
  useGetAdminUsersQuery,
  useLazyGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useLazyGetAdminUserByIdQuery,
  useGetAdminAgentByIdQuery,
  useLazyGetAdminAgentByIdQuery,
  useCreateAdminAgentMutation,
  useCreateAdminStaffMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminAgentMutation,
  useDeleteAdminUserMutation,
  useResendStaffInvitationMutation,
  useResendUserInvitationMutation,
  // Staff Permission Hooks
  useGetAdminPermissionsQuery,
  useLazyGetAdminPermissionsQuery,
  useGetStaffPermissionsQuery,
  useLazyGetStaffPermissionsQuery,
  useUpdateStaffPermissionsMutation,
  useGetEffectivePermissionsQuery,
  useLazyGetEffectivePermissionsQuery,
  // Payment Management Hooks
  useGetAdminPaymentsQuery,
  useLazyGetAdminPaymentsQuery,
  useGetAdminPaymentByIdQuery,
  useLazyGetAdminPaymentByIdQuery,
  useVerifyAdminPaymentMutation,
  useRecordAdminPaymentMutation,
  // Commission Management Hooks
  useGetAdminCommissionsQuery,
  useLazyGetAdminCommissionsQuery,
  useGetAdminCommissionByIdQuery,
  useLazyGetAdminCommissionByIdQuery,
  useAdjustAdminCommissionMutation,
  useGetAdminCommissionRulesQuery,
  useLazyGetAdminCommissionRulesQuery,
  useConfigureAdminCommissionRuleMutation,
  useGetAdminCommissionsReportQuery,
  useLazyGetAdminCommissionsReportQuery,
  // System Settings Hooks
  useGetAdminSettingsQuery,
  useLazyGetAdminSettingsQuery,
  useUpdateAdminGeneralSettingsMutation,
  useUpdateAdminPaymentSettingsMutation,
  useUpdateAdminWebhookSettingsMutation,
  useUpdateAdminCloudinarySettingsMutation,
  useTestAdminCloudinaryConnectionMutation,
  useUpdateAdminSmtpSettingsMutation,
  useTestAdminSmtpConnectionMutation,
  useSendAdminTestEmailMutation,
  useGetAdminSettingAuditLogsQuery,
  useLazyGetAdminSettingAuditLogsQuery,
} = adminApi;

export * from "../types/admin";
export * from "../types/admin-settings";


