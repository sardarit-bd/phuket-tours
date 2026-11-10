/**
 * Admin Media Management Types
 *
 * Strictly matches verified backend contracts in qbictravel_backend-main:
 * - src/modules/media/mediaTypes.ts
 * - src/modules/media/mediaRoutes.ts
 * - src/modules/media/mediaValidators.ts
 */

export const CLOUDINARY_APPROVED_FOLDER = "phukettours/tours";

export interface MediaItem {
  id: string;
  assetId: string;
  publicId: string;
  secureUrl: string;
  originalFilename: string | null;
  format: string;
  resourceType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  folder: string;
  uploadedById: string;
  serviceId: string | null;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface AdminMediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminMediaListResponse {
  items: MediaItem[];
  pagination: AdminMediaPagination;
}

export interface GetAdminMediaParams {
  page?: number;
  limit?: number;
  serviceId?: string;
  unattached?: "true" | "false";
  search?: string;
}

export interface UploadSignatureRequest {
  folder?: string;
  batchSize?: number;
}

export interface UploadSignatureItem {
  signature: string;
  timestamp: number;
  publicId: string;
  uploadToken: string;
}

export interface UploadSignatureResponseData {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFormats: string[];
  uploadToken: string;
  batch?: UploadSignatureItem[];
}

export interface ConfirmMediaRequest {
  publicId: string;
  uploadToken: string;
  assetId?: string;
  serviceId?: string | null;
}

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  secure_url: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
  original_filename?: string;
  resource_type: string;
  folder?: string;
  created_at?: string;
}

export type UploadItemStatus =
  | "queued"
  | "requesting_signature"
  | "uploading"
  | "confirming"
  | "success"
  | "error";

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadItemStatus;
  progress: number;
  error?: string;
  result?: MediaItem;
}

export interface GalleryImage {
  id: string;
  url: string;
  publicId?: string;
  caption?: string;
  isCover?: boolean;
}

export type { AdminApiResponse } from "./admin";

