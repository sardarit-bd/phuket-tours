import { baseApi } from "@/lib/api/base-api";
import type { AdminApiResponse } from "../types/admin";
import type {
  AdminMediaListResponse,
  GetAdminMediaParams,
  UploadSignatureRequest,
  UploadSignatureResponseData,
  ConfirmMediaRequest,
  MediaItem,
  BulkDeleteMediaRequest,
  BulkDeleteMediaResponseData,
  BulkAttachDetachRequest,
  SyncAssetResponseData,
} from "../types/admin-media";

export const adminMediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminMedia: builder.query<
      AdminApiResponse<AdminMediaListResponse>,
      GetAdminMediaParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.serviceId) queryParams.serviceId = params.serviceId;
        if (params?.unattached) queryParams.unattached = params.unattached;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.format) queryParams.format = params.format;
        if (params?.folder) queryParams.folder = params.folder;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;

        return {
          url: "/admin/media",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map((m) => ({
                type: "AdminMedia" as const,
                id: m.id,
              })),
              { type: "AdminMedia", id: "LIST" },
            ]
          : [{ type: "AdminMedia", id: "LIST" }],
    }),

    createUploadSignature: builder.mutation<
      AdminApiResponse<UploadSignatureResponseData>,
      UploadSignatureRequest | void
    >({
      query: (body) => ({
        url: "/admin/media/signature",
        method: "POST",
        body: body || {},
      }),
    }),

    confirmUploadedMedia: builder.mutation<
      AdminApiResponse<MediaItem>,
      ConfirmMediaRequest
    >({
      query: (body) => ({
        url: "/admin/media/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminMedia", id: "LIST" }],
    }),

    deleteAdminMedia: builder.mutation<
      AdminApiResponse<{ id: string; publicId: string }>,
      string
    >({
      query: (mediaId) => ({
        url: `/admin/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, mediaId) => [
        { type: "AdminMedia", id: mediaId },
        { type: "AdminMedia", id: "LIST" },
      ],
    }),

    bulkDeleteAdminMedia: builder.mutation<
      AdminApiResponse<BulkDeleteMediaResponseData>,
      BulkDeleteMediaRequest
    >({
      query: (body) => ({
        url: "/admin/media/bulk-delete",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminMedia", id: "LIST" }],
    }),

    bulkAttachDetachAdminMedia: builder.mutation<
      AdminApiResponse<{ updatedCount: number; items: MediaItem[] }>,
      BulkAttachDetachRequest
    >({
      query: (body) => ({
        url: "/admin/media/bulk-attach",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminMedia", id: "LIST" }],
    }),

    syncAdminMediaAsset: builder.mutation<
      AdminApiResponse<SyncAssetResponseData>,
      string
    >({
      query: (mediaId) => ({
        url: `/admin/media/${mediaId}/sync`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, mediaId) => [
        { type: "AdminMedia", id: mediaId },
        { type: "AdminMedia", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminMediaQuery,
  useLazyGetAdminMediaQuery,
  useCreateUploadSignatureMutation,
  useConfirmUploadedMediaMutation,
  useDeleteAdminMediaMutation,
  useBulkDeleteAdminMediaMutation,
  useBulkAttachDetachAdminMediaMutation,
  useSyncAdminMediaAssetMutation,
} = adminMediaApi;

export * from "../types/admin-media";
