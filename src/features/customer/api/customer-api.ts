import { baseApi } from "@/lib/api/base-api";
import { useUpdateProfileMutation } from "@/features/auth/api/auth-api";
import type {
  CustomerBookingsListResponse,
  CustomerBookingDetailResponse,
  CreateCustomerBookingInput,
  CreateCustomerBookingResponse,
  CreateGuestBookingInput,
  CreateGuestBookingResponse,
  CreateCustomerPaymentInput,
  CreateCustomerPaymentResponse,
  CustomerPaymentsListResponse,
  CustomerPaymentDetailResponse,
  GetCustomerBookingsParams,
  GetCustomerPaymentsParams,
  StripeCheckoutSessionResponse,
  PaymentReconciliationResponse,
} from "../types/customer";
import type { UserProfileResponse } from "@/features/auth/types/auth";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Bookings ─────────────────────────────────────────────── */

    createCustomerBooking: builder.mutation<
      CreateCustomerBookingResponse,
      CreateCustomerBookingInput
    >({
      query: (body) => ({
        url: "/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomerBookings"],
    }),

    createGuestBooking: builder.mutation<
      CreateGuestBookingResponse,
      CreateGuestBookingInput
    >({
      query: (body) => ({
        url: "/bookings/guest",
        method: "POST",
        body,
      }),
    }),

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

    createCustomerPayment: builder.mutation<
      CreateCustomerPaymentResponse,
      CreateCustomerPaymentInput
    >({
      query: ({ bookingId, method, reference, receiptNote }) => ({
        url: `/bookings/${bookingId}/payments`,
        method: "POST",
        body: { method, reference, receiptNote },
      }),
      invalidatesTags: ["CustomerBookings", "CustomerPayments"],
    }),

    createStripeSession: builder.mutation<
      StripeCheckoutSessionResponse,
      { bookingId: string; successUrl?: string; cancelUrl?: string }
    >({
      query: ({ bookingId, successUrl, cancelUrl }) => ({
        url: `/bookings/${bookingId}/stripe-session`,
        method: "POST",
        body: { successUrl, cancelUrl },
      }),
      invalidatesTags: ["CustomerBookings", "CustomerPayments"],
    }),

    reconcileCustomerPayment: builder.mutation<
      PaymentReconciliationResponse,
      string
    >({
      query: (paymentId) => ({
        url: `/customer/payments/${paymentId}/reconcile`,
        method: "POST",
      }),
      invalidatesTags: ["CustomerBookings", "CustomerPayments"],
    }),
  }),
});

export { useUpdateProfileMutation };

export const {
  useCreateCustomerBookingMutation,
  useCreateGuestBookingMutation,
  useGetCustomerBookingsQuery,
  useGetCustomerBookingByIdQuery,
  useGetCustomerPaymentsQuery,
  useGetCustomerPaymentByIdQuery,
  useCreateCustomerPaymentMutation,
  useCreateStripeSessionMutation,
  useReconcileCustomerPaymentMutation,
} = customerApi;
