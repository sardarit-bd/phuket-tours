import { baseApi } from "@/lib/api/base-api";
import type {
  CustomerBookingsListResponse,
  CustomerBookingDetailResponse,
  CustomerPaymentsListResponse,
  CustomerPaymentDetailResponse,
  GetCustomerBookingsParams,
  GetCustomerPaymentsParams,
} from "../types/customer";
import type { UserProfileResponse } from "@/features/auth/types/auth";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Bookings ─────────────────────────────────────────────── */

    getCustomerBookings: builder.query<
      CustomerBookingsListResponse,
      GetCustomerBookingsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status && params.status !== "ALL")
          queryParams.status = params.status;
        if (params?.search?.trim()) queryParams.search = params.search.trim();
        return {
          url: "/customer/bookings",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["CustomerBookings"],
      keepUnusedDataFor: 60,
    }),

    getCustomerBookingById: builder.query<
      CustomerBookingDetailResponse,
      string
    >({
      query: (bookingId) => ({
        url: `/customer/bookings/${bookingId}`,
        method: "GET",
      }),
      providesTags: ["CustomerBookings"],
      keepUnusedDataFor: 60,
    }),

    /* ── Payments ─────────────────────────────────────────────── */

    getCustomerPayments: builder.query<
      CustomerPaymentsListResponse,
      GetCustomerPaymentsParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status) queryParams.status = params.status;
        if (params?.method) queryParams.method = params.method;
        if (params?.bookingId) queryParams.bookingId = params.bookingId;
        return {
          url: "/customer/payments",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["CustomerPayments"],
      keepUnusedDataFor: 60,
    }),

    getCustomerPaymentById: builder.query<
      CustomerPaymentDetailResponse,
      string
    >({
      query: (paymentId) => ({
        url: `/customer/payments/${paymentId}`,
        method: "GET",
      }),
      providesTags: ["CustomerPayments"],
      keepUnusedDataFor: 60,
    }),

    /* ── Profile ──────────────────────────────────────────────── */

    updateProfile: builder.mutation<
      UserProfileResponse,
      { name?: string; phone?: string | null }
    >({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetCustomerBookingsQuery,
  useGetCustomerBookingByIdQuery,
  useGetCustomerPaymentsQuery,
  useGetCustomerPaymentByIdQuery,
  useUpdateProfileMutation,
} = customerApi;
