import type {
  UploadSignatureResponseData,
  CloudinaryUploadResponse,
} from "../types/admin-media";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_BATCH_SIZE = 10;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a single file before initiating upload or signature request
 */
export function validateMediaFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  const isValidMime = ALLOWED_MIME_TYPES.includes(mimeType);
  const isValidExt = ALLOWED_EXTENSIONS.includes(extension);

  if (!isValidMime && !isValidExt) {
    return {
      valid: false,
      error: `Unsupported file format (${mimeType || extension}). Allowed formats: JPEG, PNG, WebP, AVIF.`,
    };
  }

  // Check file size (10MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb}MB) exceeds the maximum limit of 10MB.`,
    };
  }

  return { valid: true };
}

/**
 * Formats byte count into human-readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Uploads a file directly to Cloudinary using the backend-generated signature
 * and reports progress via XMLHttpRequest.
 */
export function uploadToCloudinaryWithProgress(
  file: File,
  signatureData: UploadSignatureResponseData,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);
    formData.append("public_id", signatureData.publicId);
    formData.append("overwrite", "false");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve(response as CloudinaryUploadResponse);
        } else {
          const errorMsg =
            response?.error?.message ||
            `Cloudinary upload failed with status ${xhr.status}`;
          reject(new Error(errorMsg));
        }
      } catch {
        reject(
          new Error(
            `Failed to parse Cloudinary response (HTTP status ${xhr.status})`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary image upload."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Cloudinary image upload timed out."));
    };

    xhr.open("POST", signatureData.uploadUrl, true);
    xhr.send(formData);
  });
}
