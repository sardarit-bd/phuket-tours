import { baseApi } from "@/lib/api/base-api";
import type {
  NotificationItem,
  NotificationPreferences,
  NotificationsListResponse,
  UnreadCountResponse,
} from "../types/notification";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsListResponse,
      { page?: number; limit?: number; isRead?: boolean } | void
    >({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: params || { page: 1, limit: 20 },
      }),
      transformResponse: (response: ApiResponse<NotificationsListResponse>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({
                type: "Notification" as const,
                id: item.id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    getUnreadNotificationCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<UnreadCountResponse>) =>
        response.data,
      providesTags: [{ type: "Notification", id: "UNREAD_COUNT" }],
    }),

    markNotificationRead: builder.mutation<NotificationItem, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<NotificationItem>) =>
        response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    markAllNotificationsRead: builder.mutation<{ markedCount: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<{ markedCount: number }>) =>
        response.data,
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({
        url: "/notifications/preferences",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<NotificationPreferences>) =>
        response.data,
      providesTags: [{ type: "NotificationPreference", id: "USER" }],
    }),

    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (body) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<NotificationPreferences>) =>
        response.data,
      invalidatesTags: [{ type: "NotificationPreference", id: "USER" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;
