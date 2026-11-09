import { baseApi } from "@/lib/api/base-api";
import type {
  AuthUserResponse,
  UserProfileResponse,
  MessageResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateTokenResponse,
} from "../types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthUserResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    register: builder.mutation<AuthUserResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    getMe: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth", "User"],
      keepUnusedDataFor: 300,
    }),
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
    validateInvitation: builder.query<
      { success: boolean; data: ValidateTokenResponse },
      string
    >({
      query: (token) => ({
        url: "/auth/invitation/verify",
        method: "GET",
        params: { token },
      }),
    }),
    validateResetToken: builder.query<
      { success: boolean; data: ValidateTokenResponse },
      string
    >({
      query: (token) => ({
        url: "/auth/reset-password/verify",
        method: "GET",
        params: { token },
      }),
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    setupPassword: builder.mutation<
      MessageResponse,
      { token: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/setup-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useLazyGetMeQuery,
  useValidateInvitationQuery,
  useLazyValidateInvitationQuery,
  useValidateResetTokenQuery,
  useLazyValidateResetTokenQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSetupPasswordMutation,
} = authApi;

export * from "../types/auth";
