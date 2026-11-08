import { baseApi } from "@/lib/api/base-api";
import type {
  AuthUserResponse,
  UserProfileResponse,
  MessageResponse,
  LoginRequest,
  RegisterRequest,
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
      { success: boolean; data: { valid: boolean; user: { name: string; email: string; role: string } } },
      string
    >({
      query: (token) => ({
        url: "/auth/invitation/verify",
        method: "GET",
        params: { token },
      }),
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
  useSetupPasswordMutation,
} = authApi;

export * from "../types/auth";
